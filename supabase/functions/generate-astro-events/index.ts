// generate-astro-events — Eventos astrológicos del mes (lunaciones + ingresos).
//
// Flujo (pública, verify_jwt=false):
//   1. Validar { month? } (formato YYYY-MM; por defecto, mes actual en Madrid).
//   2. Si ya hay filas para ese mes en `astro_events`, devolverlas (cache).
//   3. Control de coste diario (compartido con el resto de funciones IA).
//   4. Calcular eventos REALES con astronomy-engine (lunas + ingresos).
//   5. Pedir a Gemini título + descripción para cada evento, pasándole los
//      títulos del mes anterior para no repetirlos.
//   6. Insertar las filas. Limpieza: borrar event_date anteriores al mes previo.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { computeMonthEvents } from './astro.ts';
import type { AstroEventRaw } from './astro.ts';
import { buildEventsPrompt, RESPONSE_SCHEMA } from './prompts.ts';
import { callGemini } from './gemini.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SOFT_MESSAGE = 'El cielo astrológico se está alineando. Vuelve en unos minutos.';

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function madridMonth(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric', month: '2-digit',
  }).format(new Date()).slice(0, 7);
}

function madridTodayDate(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

function isYearMonth(s: string): boolean {
  if (!/^\d{4}-\d{2}$/.test(s)) return false;
  const [y, m] = s.split('-').map(Number);
  return m >= 1 && m <= 12 && y >= 1900 && y < 2100;
}

function previousMonth(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 2, 1));
  return d.toISOString().slice(0, 7);
}

function nextMonth(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(Date.UTC(y, m, 1));
  return d.toISOString().slice(0, 7);
}

async function logCall(
  admin: ReturnType<typeof createClient>,
  payload: Record<string, unknown>,
): Promise<void> {
  try {
    await admin.from('user_events').insert({ event: 'gemini_call', payload });
  } catch {
    // Métricas no deben tumbar la respuesta.
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ status: 'error', message: 'Method not allowed' }, 405);

  let payload: { month?: string } = {};
  try { payload = await req.json(); } catch { payload = {}; }
  const month = payload.month && isYearMonth(payload.month) ? payload.month : madridMonth();
  if (!isYearMonth(month)) return json({ status: 'error', message: 'month inválido (YYYY-MM)' }, 400);

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const start = `${month}-01`;
  const end = `${nextMonth(month)}-01`;

  // --- 1) Cache --------------------------------------------------------------
  const { data: existing } = await admin
    .from('astro_events')
    .select('id, event_date, kind, title, description, is_premium')
    .gte('event_date', start)
    .lt('event_date', end)
    .order('event_date', { ascending: true });

  if (existing && existing.length > 0) {
    return json({ status: 'ok', cached: true, month, events: existing });
  }

  // --- 2) Control de coste ---------------------------------------------------
  const dailyLimit = Number(Deno.env.get('GEMINI_DAILY_LIMIT') ?? '300');
  const since = `${madridTodayDate()}T00:00:00Z`;
  const { count } = await admin
    .from('user_events')
    .select('id', { count: 'exact', head: true })
    .eq('event', 'gemini_call')
    .gte('created_at', since);

  if ((count ?? 0) >= dailyLimit) {
    // Sin "anterior" del que tirar (eventos no se solapan por mes); mensaje suave.
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }

  // --- 3) Cálculo astronómico ------------------------------------------------
  let astroEvents: AstroEventRaw[];
  try {
    astroEvents = computeMonthEvents(month);
  } catch (err) {
    await logCall(admin, { kind: 'astro_events', month, error: 'astronomy_failed: ' + String(err) });
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }
  if (astroEvents.length === 0) {
    return json({ status: 'ok', cached: false, month, events: [] });
  }

  // --- 4) Contexto del mes anterior (para no repetir títulos) ----------------
  const prevMonth = previousMonth(month);
  const { data: prevEvents } = await admin
    .from('astro_events')
    .select('title')
    .gte('event_date', `${prevMonth}-01`)
    .lt('event_date', start);
  const previousTitles = (prevEvents ?? []).map((e) => e.title);

  // --- 5) Generación con Gemini (título + descripción por evento) ------------
  const started = Date.now();
  let geminiEvents:
    | Array<{ title: string; description: string }>
    | null = null;
  let outputTokens = 0;

  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const prompt = buildEventsPrompt(astroEvents, previousTitles, attempt > 0);
      const result = await callGemini(prompt, {
        temperature: 0.85,
        // Margen amplio: ~150 tokens por evento * count + colchón.
        maxOutputTokens: astroEvents.length * 220 + 200,
        responseSchema: RESPONSE_SCHEMA,
      });
      outputTokens = result.outputTokens;

      let parsed: unknown;
      try { parsed = JSON.parse(result.text); } catch { continue; }
      const arr = (parsed as { events?: Array<{ title?: unknown; description?: unknown }> } | undefined)?.events;
      if (!Array.isArray(arr) || arr.length !== astroEvents.length) continue;
      const valid = arr.every(
        (e) =>
          typeof e.title === 'string' && e.title.trim() !== '' &&
          typeof e.description === 'string' && e.description.trim() !== '',
      );
      if (valid) {
        geminiEvents = arr.map((e) => ({
          title: (e.title as string).trim(),
          description: (e.description as string).trim(),
        }));
        break;
      }
    }
  } catch (err) {
    await logCall(admin, { kind: 'astro_events', month, error: String(err) });
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }

  if (!geminiEvents) {
    await logCall(admin, { kind: 'astro_events', month, error: 'validation_failed' });
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }

  // --- 6) Insertar y limpiar -------------------------------------------------
  const rows = astroEvents.map((ev, i) => ({
    event_date: ev.event_date,
    kind: ev.kind,
    title: geminiEvents![i].title,
    description: geminiEvents![i].description,
    is_premium: false,
  }));
  await admin.from('astro_events').insert(rows);

  // Retención: conservar mes actual + mes anterior.
  await admin
    .from('astro_events').delete()
    .lt('event_date', `${prevMonth}-01`);

  // Releer para devolver lo persistido (con id, created_at).
  const { data: stored } = await admin
    .from('astro_events')
    .select('id, event_date, kind, title, description, is_premium')
    .gte('event_date', start)
    .lt('event_date', end)
    .order('event_date', { ascending: true });

  await logCall(admin, {
    kind: 'astro_events', month, cached: false,
    latency_ms: Date.now() - started, tokens_out: outputTokens,
    event_count: astroEvents.length,
  });

  return json({ status: 'ok', cached: false, month, events: stored ?? rows });
});
