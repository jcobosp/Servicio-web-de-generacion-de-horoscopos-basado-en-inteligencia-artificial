// generate-horoscope — Genera (o reutiliza de cache) el horóscopo por signo.
//
// Flujo (CONTENT_STRATEGY §5):
//   1. Validar { sun_sign, scope, area, date? }.
//   2. Buscar en horoscope_cache (sun_sign, scope, area, period_start).
//      → si existe, devolver (cached).
//   3. Si no, comprobar el límite diario de generaciones (control de coste).
//      → si se supera, devolver el período anterior o un mensaje suave.
//   4. Generar con Gemini, validar, guardar y devolver.
//
// Pública (verify_jwt = false): los horóscopos free se ven con o sin sesión.
// El coste se contiene con la cache compartida por signo y el límite diario.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { buildHoroscopePrompt, RESPONSE_SCHEMA, LENGTHS, SIGN_NAMES, TEMPERATURE } from './prompts.ts';
import type { Area, Scope, SunSign } from './prompts.ts';
import { callGemini } from './gemini.ts';
import {
  AREAS, SCOPES, SUN_SIGNS,
  isIsoDate, madridToday, periodStart, previousPeriodStart,
  validateHoroscope, weekdayEs,
} from './lib.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SOFT_MESSAGE = 'Las estrellas están alineándose. Vuelve en unos minutos.';

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ status: 'error', message: 'Method not allowed' }, 405);

  // --- Entrada -------------------------------------------------------------
  let payload: { sun_sign?: string; scope?: string; area?: string; date?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ status: 'error', message: 'JSON inválido' }, 400);
  }

  const sun_sign = payload.sun_sign as SunSign;
  const scope = payload.scope as Scope;
  const area = payload.area as Area;
  const date = payload.date && payload.date.length ? payload.date : madridToday();

  if (!SUN_SIGNS.includes(sun_sign)) return json({ status: 'error', message: 'sun_sign inválido' }, 400);
  if (!SCOPES.includes(scope)) return json({ status: 'error', message: 'scope inválido' }, 400);
  if (!AREAS.includes(area)) return json({ status: 'error', message: 'area inválida' }, 400);
  if (!isIsoDate(date)) return json({ status: 'error', message: 'date inválida (YYYY-MM-DD)' }, 400);

  const period = periodStart(scope, date);

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // --- 1) Cache ------------------------------------------------------------
  const cached = await admin
    .from('horoscope_cache')
    .select('content')
    .eq('sun_sign', sun_sign).eq('scope', scope).eq('area', area)
    .eq('period_start', period)
    .maybeSingle();

  if (cached.data) {
    return json({ status: 'ok', cached: true, period_start: period, content: cached.data.content });
  }

  // --- 2) Control de coste -------------------------------------------------
  const dailyLimit = Number(Deno.env.get('GEMINI_DAILY_LIMIT') ?? '300');
  const since = `${madridToday()}T00:00:00Z`;
  const { count } = await admin
    .from('user_events')
    .select('id', { count: 'exact', head: true })
    .eq('event', 'gemini_call')
    .gte('created_at', since);

  if ((count ?? 0) >= dailyLimit) {
    // Fallback: período anterior si existe; si no, mensaje suave.
    const prev = await admin
      .from('horoscope_cache')
      .select('content')
      .eq('sun_sign', sun_sign).eq('scope', scope).eq('area', area)
      .eq('period_start', previousPeriodStart(scope, period))
      .maybeSingle();
    if (prev.data) {
      return json({ status: 'ok', cached: true, stale: true, content: prev.data.content });
    }
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }

  // --- 3) Generación con Gemini (con un reintento si la salida no valida) ---
  const len = LENGTHS[scope];
  const signName = SIGN_NAMES[sun_sign];
  const weekday = weekdayEs(period);
  const started = Date.now();

  let horoscope = null as ReturnType<typeof validateHoroscope> | null;
  let outputTokens = 0;

  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const prompt = buildHoroscopePrompt({
        scope, area, signName, date: period, weekday, reinforce: attempt > 0,
      });
      const result = await callGemini(prompt, {
        temperature: TEMPERATURE,
        maxOutputTokens: len.maxOutputTokens,
        responseSchema: RESPONSE_SCHEMA,
      });
      outputTokens = result.outputTokens;

      let parsed: unknown;
      try {
        parsed = JSON.parse(result.text);
      } catch {
        continue; // JSON malformado → reintentar
      }
      const check = validateHoroscope(parsed, scope);
      if (check.ok) {
        horoscope = check;
        break;
      }
    }
  } catch (err) {
    await logCall(admin, { sun_sign, scope, area, cached: false, error: String(err) });
    // Fallback suave ante fallo de la API.
    const prev = await admin
      .from('horoscope_cache')
      .select('content')
      .eq('sun_sign', sun_sign).eq('scope', scope).eq('area', area)
      .eq('period_start', previousPeriodStart(scope, period))
      .maybeSingle();
    if (prev.data) return json({ status: 'ok', cached: true, stale: true, content: prev.data.content });
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }

  if (!horoscope || !horoscope.ok) {
    await logCall(admin, { sun_sign, scope, area, cached: false, error: 'validation_failed' });
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }

  // --- 4) Guardar (upsert) y devolver la fila canónica ---------------------
  await admin
    .from('horoscope_cache')
    .upsert(
      {
        sun_sign, scope, area, period_start: period,
        content: horoscope.value, model: 'gemini-2.5-flash',
      },
      { onConflict: 'sun_sign,scope,area,period_start', ignoreDuplicates: true },
    );

  // Releer para converger si hubo carrera (otro proceso generó a la vez).
  const stored = await admin
    .from('horoscope_cache')
    .select('content')
    .eq('sun_sign', sun_sign).eq('scope', scope).eq('area', area)
    .eq('period_start', period)
    .maybeSingle();

  await logCall(admin, {
    sun_sign, scope, area, cached: false,
    latency_ms: Date.now() - started, tokens_out: outputTokens,
  });

  return json({
    status: 'ok',
    cached: false,
    period_start: period,
    content: stored.data?.content ?? horoscope.value,
  });
});

/** Registra la llamada en user_events para métricas de coste (anonimizado). */
async function logCall(
  admin: ReturnType<typeof createClient>,
  payload: Record<string, unknown>,
): Promise<void> {
  try {
    await admin.from('user_events').insert({ event: 'gemini_call', payload });
  } catch {
    // Las métricas no deben tumbar la respuesta.
  }
}
