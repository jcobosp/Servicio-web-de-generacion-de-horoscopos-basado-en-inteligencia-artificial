// generate-natal-chart — Carta natal BÁSICA (Sol, Luna, Ascendente) por usuario.
//
// Como el tarot, ESTO ES POR USUARIO y requiere sesión (verify_jwt=false pero
// validamos el JWT a mano para dar errores claros):
//   1. Identificar al usuario por su token.
//   2. Si ya tiene una carta guardada → devolverla SIEMPRE (sin volver a llamar
//      a Gemini). La carta natal se genera UNA SOLA VEZ por usuario para evitar
//      el abuso de tokens. Esto se aplica aquí, no solo en la UI, para que las
//      peticiones directas también respeten el límite.
//   3. Si no existe: tomar la hora/lugar del body + fecha de nacimiento del
//      perfil, calcular Sol/Luna/Ascendente con astronomy-engine (astro.ts).
//   4. Gemini interpreta (psicológica) Sol+Luna+Asc integrados.
//   5. Guardar en natal_charts (is_full=false, una por usuario, no caduca) y
//      persistir los datos de nacimiento en el perfil para futuras
//      funcionalidades.
//
// No hay cron ni cache compartida: la carta es personal y permanente.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { computeNatalChart } from './astro.ts';
import type { NatalPositions, Placement } from './astro.ts';
import { callGemini } from './gemini.ts';
import { buildPrompt, RESPONSE_SCHEMA, validate } from './prompts.ts';
import type { Interpretation } from './prompts.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SOFT_MESSAGE = 'Tu mapa estelar se está dibujando. Vuelve en unos minutos.';
const DEFAULT_TZ = 'Europe/Madrid';

interface ChartInput {
  birth_time: string | null;
  lat: number | null;
  lng: number | null;
  tz: string;
}

interface StoredPlanets {
  sun: Placement;
  moon: Placement;
  moon_approximate: boolean;
  input: ChartInput;
}

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

function buildChart(pos: NatalPositions, interp: Interpretation, place: string | null, createdAt: string) {
  return {
    sun: pos.sun,
    moon: pos.moon,
    ascendant: pos.ascendant,
    moon_approximate: pos.moon_approximate,
    has_time: pos.ascendant !== null,
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

  // --- Auth: identificar al usuario por su JWT -----------------------------
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

  // --- Entrada -------------------------------------------------------------
  let payload: {
    birth_time?: unknown; lat?: unknown; lng?: unknown;
    tz?: unknown; place_label?: unknown;
  };
  try { payload = await req.json(); } catch { payload = {}; }

  const birthTime = isTime(payload.birth_time) ? payload.birth_time : null;
  const lat = isLat(payload.lat) ? payload.lat : null;
  const lng = isLng(payload.lng) ? payload.lng : null;
  const tz = typeof payload.tz === 'string' && payload.tz ? payload.tz : DEFAULT_TZ;
  const place = typeof payload.place_label === 'string' && payload.place_label.trim()
    ? payload.place_label.trim().slice(0, 120)
    : null;
  // El ascendente exige hora Y coordenadas; si falta el lugar, lo ignoramos.
  const effLat = birthTime ? lat : null;
  const effLng = birthTime ? lng : null;

  const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // --- Carta existente: la carta natal se genera UNA SOLA VEZ por usuario.
  // Si ya existe, la devolvemos SIEMPRE, ignorando cualquier input nuevo.
  // Esto impide el abuso (gastar tokens de Gemini con tiradas infinitas) tanto
  // desde la UI como desde peticiones directas a la función.
  const { data: existing } = await admin
    .from('natal_charts')
    .select('planets, houses, interpretation, created_at')
    .eq('user_id', userId)
    .eq('is_full', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    const planets = existing.planets as unknown as StoredPlanets;
    const houses = existing.houses as unknown as { ascendant: Placement | null; place: string | null };
    try {
      const interp = JSON.parse(existing.interpretation) as Interpretation;
      const pos: NatalPositions = {
        sun: planets.sun, moon: planets.moon,
        ascendant: houses?.ascendant ?? null,
        moon_approximate: planets.moon_approximate,
        instant_utc: '',
      };
      return json({
        status: 'ok', cached: true,
        chart: buildChart(pos, interp, houses?.place ?? null, existing.created_at),
      });
    } catch {
      // Fila corrupta (no debería pasar): caer al flujo de generación.
    }
  }

  // --- Fecha de nacimiento (del perfil, obligatoria desde el registro) -----
  const { data: profile } = await admin
    .from('profiles')
    .select('birth_date, display_name')
    .eq('id', userId)
    .maybeSingle();

  if (!profile?.birth_date) {
    return json({
      status: 'missing_data',
      message: 'No encontramos tu fecha de nacimiento. Revísala en tu perfil.',
    }, 400);
  }

  const input: ChartInput = { birth_time: birthTime, lat: effLat, lng: effLng, tz };

  // --- Cálculo astronómico -------------------------------------------------
  const pos = computeNatalChart({
    birthDate: profile.birth_date, birthTime, lat: effLat, lng: effLng, tz,
  });

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
  let interp: Interpretation | null = null;
  let outputTokens = 0;
  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = await callGemini(buildPrompt(pos, profile.display_name), {
        temperature: 0.8, maxOutputTokens: 1100, responseSchema: RESPONSE_SCHEMA,
      });
      outputTokens = result.outputTokens;
      let parsed: unknown;
      try { parsed = JSON.parse(result.text); } catch { continue; }
      interp = validate(parsed);
      if (interp) break;
    }
  } catch (err) {
    await logCall(admin, { kind: 'natal_chart', error: String(err) });
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }

  if (!interp) {
    await logCall(admin, { kind: 'natal_chart', error: 'validation_failed' });
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }

  // --- Guardar (una carta básica por usuario, no se sobreescribe) ----------
  // Solo llegamos aquí si NO existía ninguna carta previa: insertamos y punto.
  const planets: StoredPlanets = {
    sun: pos.sun, moon: pos.moon, moon_approximate: pos.moon_approximate, input,
  };
  const houses = { ascendant: pos.ascendant, place };

  const { data: saved } = await admin
    .from('natal_charts')
    .insert({
      user_id: userId,
      is_full: false,
      planets: planets as unknown as Record<string, unknown>,
      houses: houses as unknown as Record<string, unknown>,
      interpretation: JSON.stringify(interp),
    })
    .select('created_at')
    .single();

  // --- Persistir los datos de nacimiento en el perfil ----------------------
  // (para que las futuras funcionalidades —p.ej. horóscopos por ascendente—
  //  puedan usarlos). Solo escribimos lo que el usuario ha aportado.
  const profilePatch: Record<string, unknown> = {};
  if (birthTime) profilePatch.birth_time = birthTime;
  if (place) profilePatch.birth_place = place;
  if (effLat !== null) profilePatch.birth_lat = effLat;
  if (effLng !== null) profilePatch.birth_lng = effLng;
  if (Object.keys(profilePatch).length > 0) {
    await admin.from('profiles').update(profilePatch).eq('id', userId);
  }

  await logCall(admin, {
    kind: 'natal_chart', has_time: pos.ascendant !== null,
    latency_ms: Date.now() - started, tokens_out: outputTokens,
  });

  return json({
    status: 'ok', cached: false,
    chart: buildChart(pos, interp, place, saved?.created_at ?? new Date().toISOString()),
  });
});
