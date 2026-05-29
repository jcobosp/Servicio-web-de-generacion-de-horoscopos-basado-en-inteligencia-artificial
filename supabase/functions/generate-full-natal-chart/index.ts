// generate-full-natal-chart — Carta natal COMPLETA (premium), por usuario.
//
// Reglas (en este orden):
//   1. Identificar al usuario por su JWT (verify_jwt=false, validado a mano).
//   2. VERIFICAR PREMIUM EN EL BACKEND: solo suscriptores active/trialing pueden
//      generar. Esto se comprueba aquí, no solo en la UI, para que peticiones
//      directas tampoco puedan gastar tokens de Gemini.
//   3. GENERACIÓN ÚNICA POR USUARIO: si ya existe la carta completa, se devuelve
//      SIEMPRE sin volver a llamar a Gemini (igual que la carta básica). La carta
//      completa es cara (~1500 palabras): se genera una sola vez y no caduca.
//   4. La hora y el lugar de nacimiento son OBLIGATORIOS (se toman del body o del
//      perfil). Sin ellos no hay casas ni Ascendente/MC.
//   5. Coherencia: si el usuario tiene carta básica, su texto se le pasa a Gemini
//      para que la completa lo amplíe sin contradecirlo.
//   6. Guardar en natal_charts (is_full=true, una por usuario, no caduca) y
//      persistir los datos de nacimiento en el perfil.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { computeFullChart } from './astro.ts';
import type { FullChart } from './astro.ts';
import { callGemini } from './gemini.ts';
import { buildPrompt, RESPONSE_SCHEMA, validate } from './prompts.ts';
import type { FullInterpretation } from './prompts.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SOFT_MESSAGE = 'Tu carta completa se está trazando. Vuelve en unos minutos.';
const ACTIVE_STATUSES = ['active', 'trialing'];

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

const isTime = (v: unknown): v is string =>
  typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const isLat = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= -90 && v <= 90;
const isLng = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= -180 && v <= 180;

function buildResult(chart: FullChart, interp: FullInterpretation, place: string | null, createdAt: string) {
  return {
    planets: chart.planets,
    ascendant: chart.ascendant,
    midheaven: chart.midheaven,
    houses: chart.houses,
    aspects: chart.aspects,
    place,
    interpretation: interp,
    created_at: createdAt,
  };
}

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ status: 'error', message: 'Method not allowed' }, 405);

  // --- Auth ----------------------------------------------------------------
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return json({ status: 'error', message: 'Necesitas iniciar sesión' }, 401);

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  if (userError || !userData.user) {
    return json({ status: 'error', message: 'Sesión no válida' }, 401);
  }
  const userId = userData.user.id;

  const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // --- Verificación PREMIUM (en el backend) --------------------------------
  const { data: sub } = await admin
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .maybeSingle();

  const isPremium = Boolean(sub && ACTIVE_STATUSES.includes(sub.status as string));
  if (!isPremium) {
    return json({
      status: 'forbidden',
      message: 'La carta natal completa es una función premium. Suscríbete para desbloquearla.',
    }, 403);
  }

  // --- Carta completa existente: se genera UNA sola vez por usuario ---------
  const { data: existing } = await admin
    .from('natal_charts')
    .select('planets, houses, aspects, interpretation, created_at')
    .eq('user_id', userId)
    .eq('is_full', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    try {
      const stored = existing.planets as unknown as { chart: FullChart; place: string | null };
      const interp = JSON.parse(existing.interpretation) as FullInterpretation;
      return json({
        status: 'ok', cached: true,
        chart: buildResult(stored.chart, interp, stored.place ?? null, existing.created_at),
      });
    } catch {
      // Fila corrupta (no debería pasar): caer al flujo de generación.
    }
  }

  // --- Datos de nacimiento (body con prioridad, fallback al perfil) --------
  let payload: {
    birth_time?: unknown; lat?: unknown; lng?: unknown;
    tz?: unknown; place_label?: unknown;
  };
  try { payload = await req.json(); } catch { payload = {}; }

  const { data: profile } = await admin
    .from('profiles')
    .select('birth_date, display_name, birth_time, birth_place, birth_lat, birth_lng')
    .eq('id', userId)
    .maybeSingle();

  if (!profile?.birth_date) {
    return json({
      status: 'missing_data',
      message: 'No encontramos tu fecha de nacimiento. Revísala en tu perfil.',
    }, 400);
  }

  const birthTime = isTime(payload.birth_time)
    ? payload.birth_time
    : (profile.birth_time ? String(profile.birth_time).slice(0, 5) : null);
  const lat = isLat(payload.lat) ? payload.lat : (profile.birth_lat ?? null);
  const lng = isLng(payload.lng) ? payload.lng : (profile.birth_lng ?? null);
  // La zona horaria solo es fiable si llega del cliente (no se persiste).
  const tz = typeof payload.tz === 'string' && payload.tz ? payload.tz : null;
  const place = typeof payload.place_label === 'string' && payload.place_label.trim()
    ? payload.place_label.trim().slice(0, 120)
    : (profile.birth_place ?? null);

  // La completa EXIGE hora + lugar + zona (Ascendente, MC y casas).
  if (!birthTime || lat === null || lng === null || !tz) {
    return json({
      status: 'missing_data',
      message: 'Para tu carta completa necesitamos tu hora y ciudad de nacimiento.',
    }, 400);
  }

  // --- Cálculo astronómico -------------------------------------------------
  const chart = computeFullChart({
    birthDate: profile.birth_date, birthTime, lat, lng, tz,
  });

  // --- Coherencia: texto de la carta básica (si existe) --------------------
  let basicText: string | null = null;
  try {
    const { data: basic } = await admin
      .from('natal_charts')
      .select('interpretation')
      .eq('user_id', userId)
      .eq('is_full', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (basic?.interpretation) {
      const parsed = JSON.parse(basic.interpretation) as Record<string, string>;
      basicText = [parsed.intro, parsed.sun, parsed.moon, parsed.ascendant, parsed.synthesis]
        .filter(Boolean).join('\n\n');
    }
  } catch {
    // La coherencia es un extra: si falla, generamos sin ella.
  }

  // --- Control de coste diario ---------------------------------------------
  const dailyLimit = Number(Deno.env.get('GEMINI_DAILY_LIMIT') ?? '300');
  const since = `${new Date().toISOString().slice(0, 10)}T00:00:00Z`;
  const { count } = await admin
    .from('user_events').select('id', { count: 'exact', head: true })
    .eq('event', 'gemini_call').gte('created_at', since);
  if ((count ?? 0) >= dailyLimit) {
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }

  // --- Interpretación con Gemini -------------------------------------------
  const started = Date.now();
  let interp: FullInterpretation | null = null;
  let outputTokens = 0;
  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = await callGemini(buildPrompt(chart, profile.display_name, basicText), {
        temperature: 0.7, maxOutputTokens: 4096, responseSchema: RESPONSE_SCHEMA,
      });
      outputTokens = result.outputTokens;
      let parsed: unknown;
      try { parsed = JSON.parse(result.text); } catch { continue; }
      interp = validate(parsed);
      if (interp) break;
    }
  } catch (err) {
    await logCall(admin, { kind: 'full_natal_chart', error: String(err) });
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }

  if (!interp) {
    await logCall(admin, { kind: 'full_natal_chart', error: 'validation_failed' });
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }

  // --- Guardar (una carta completa por usuario, no se sobreescribe) ---------
  // Guardamos toda la carta calculada dentro de `planets` (envuelta) para tener
  // un único lugar de verdad; `houses` y `aspects` se replican en sus columnas.
  const planetsBlob = { chart, place };
  const { data: saved } = await admin
    .from('natal_charts')
    .insert({
      user_id: userId,
      is_full: true,
      planets: planetsBlob as unknown as Record<string, unknown>,
      houses: { houses: chart.houses } as unknown as Record<string, unknown>,
      aspects: chart.aspects as unknown as Record<string, unknown>,
      interpretation: JSON.stringify(interp),
    })
    .select('created_at')
    .single();

  // --- Persistir datos de nacimiento en el perfil --------------------------
  const profilePatch: Record<string, unknown> = {};
  if (!profile.birth_time) profilePatch.birth_time = birthTime;
  if (!profile.birth_place && place) profilePatch.birth_place = place;
  if (profile.birth_lat === null) profilePatch.birth_lat = lat;
  if (profile.birth_lng === null) profilePatch.birth_lng = lng;
  if (Object.keys(profilePatch).length > 0) {
    await admin.from('profiles').update(profilePatch).eq('id', userId);
  }

  await logCall(admin, {
    kind: 'full_natal_chart',
    latency_ms: Date.now() - started, tokens_out: outputTokens,
  });

  return json({
    status: 'ok', cached: false,
    chart: buildResult(chart, interp, place, saved?.created_at ?? new Date().toISOString()),
  });
});
