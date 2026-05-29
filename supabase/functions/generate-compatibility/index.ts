// generate-compatibility — Compatibilidad / sinastría entre dos personas (premium).
//
// Reglas:
//   1. Identificar al usuario por su JWT (verify_jwt=false, validado a mano).
//   2. VERIFICAR PREMIUM EN EL BACKEND (active/trialing): un no-suscriptor no
//      puede generar (no gasta tokens ni con peticiones directas).
//   3. DEDUPE POR PAREJA: la misma pareja (mismos datos de nacimiento) devuelve
//      el informe ya guardado en vez de volver a llamar a Gemini (control de
//      coste). La clave es simétrica: (A,B) == (B,A).
//   4. Calcular posiciones de ambas personas + sinastría + score determinista.
//   5. Gemini narra la compatibilidad (psicológica) alineada con el score.
//   6. Guardar en compatibility_reports (historial por usuario).

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { computePlacements, computeSynastry } from './astro.ts';
import type { PersonInput, PersonPlacements, SynastryAspect } from './astro.ts';
import { callGemini } from './gemini.ts';
import { buildPrompt, RESPONSE_SCHEMA, validate } from './prompts.ts';
import type { CompatInterpretation } from './prompts.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SOFT_MESSAGE = 'Estamos leyendo los astros de los dos. Vuelve en unos minutos.';
const DEFAULT_TZ = 'Europe/Madrid';
const ACTIVE_STATUSES = ['active', 'trialing'];

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

const isDate = (v: unknown): v is string =>
  typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const isTime = (v: unknown): v is string =>
  typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const isLat = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= -90 && v <= 90;
const isLng = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= -180 && v <= 180;

interface PersonPayload {
  label: string;
  birth_date: string;
  birth_time: string | null;
  lat: number | null;
  lng: number | null;
  tz: string;
  place_label: string | null;
}

function parsePerson(raw: unknown, fallbackLabel: string): PersonPayload | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (!isDate(r.birth_date)) return null;
  const birthTime = isTime(r.birth_time) ? r.birth_time : null;
  const lat = isLat(r.lat) ? r.lat : null;
  const lng = isLng(r.lng) ? r.lng : null;
  // Ascendente solo con hora Y coordenadas.
  const effLat = birthTime ? lat : null;
  const effLng = birthTime ? lng : null;
  const label = typeof r.label === 'string' && r.label.trim()
    ? r.label.trim().slice(0, 60) : fallbackLabel;
  const place = typeof r.place_label === 'string' && r.place_label.trim()
    ? r.place_label.trim().slice(0, 120) : null;
  return {
    label,
    birth_date: r.birth_date,
    birth_time: birthTime,
    lat: effLat,
    lng: effLng,
    tz: typeof r.tz === 'string' && r.tz ? r.tz : DEFAULT_TZ,
    place_label: place,
  };
}

/** Clave determinista y simétrica de la pareja (para deduplicar). */
function pairKey(a: PersonPayload, b: PersonPayload): string {
  const norm = (p: PersonPayload) =>
    `${p.birth_date}|${p.birth_time ?? ''}|${p.lat ?? ''}|${p.lng ?? ''}`;
  return [norm(a), norm(b)].sort().join('::');
}

function toInput(p: PersonPayload): PersonInput {
  return { birthDate: p.birth_date, birthTime: p.birth_time, lat: p.lat, lng: p.lng, tz: p.tz };
}

function buildReport(
  labelA: string, labelB: string, score: number,
  a: PersonPlacements, b: PersonPlacements,
  aspects: SynastryAspect[], interp: CompatInterpretation, createdAt: string,
) {
  return {
    label_a: labelA, label_b: labelB, score,
    placements_a: a, placements_b: b,
    aspects, interpretation: interp, created_at: createdAt,
  };
}

async function logCall(
  admin: ReturnType<typeof createClient>,
  payload: Record<string, unknown>,
): Promise<void> {
  try {
    await admin.from('user_events').insert({ event: 'gemini_call', payload });
  } catch { /* las métricas no deben tumbar la respuesta */ }
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

  // --- Premium (backend) ---------------------------------------------------
  const { data: sub } = await admin
    .from('subscriptions').select('status').eq('user_id', userId).maybeSingle();
  if (!sub || !ACTIVE_STATUSES.includes(sub.status as string)) {
    return json({
      status: 'forbidden',
      message: 'La compatibilidad avanzada es una función premium. Suscríbete para desbloquearla.',
    }, 403);
  }

  // --- Entrada -------------------------------------------------------------
  let payload: { person_a?: unknown; person_b?: unknown };
  try { payload = await req.json(); } catch { payload = {}; }

  const personA = parsePerson(payload.person_a, 'Persona A');
  const personB = parsePerson(payload.person_b, 'Persona B');
  if (!personA || !personB) {
    return json({
      status: 'missing_data',
      message: 'Necesitamos al menos la fecha de nacimiento (AAAA-MM-DD) de las dos personas.',
    }, 400);
  }

  const key = pairKey(personA, personB);

  // --- Informe existente para esta pareja (dedupe) -------------------------
  const { data: existing } = await admin
    .from('compatibility_reports')
    .select('person_a, person_b, person_a_label, person_b_label, score, report, created_at')
    .eq('user_id', userId)
    .eq('pair_key', key)
    .maybeSingle();

  if (existing) {
    try {
      const pa = existing.person_a as Record<string, unknown>;
      const pb = existing.person_b as Record<string, unknown>;
      const stored = JSON.parse(existing.report) as {
        interpretation: CompatInterpretation; aspects: SynastryAspect[];
      };
      return json({
        status: 'ok', cached: true,
        report: buildReport(
          existing.person_a_label, existing.person_b_label, existing.score,
          pa.placements as unknown as PersonPlacements,
          pb.placements as unknown as PersonPlacements,
          stored.aspects, stored.interpretation, existing.created_at,
        ),
      });
    } catch { /* fila corrupta: regenerar */ }
  }

  // --- Cuota: 1 generación incluida por mes + créditos comprados -----------
  // Solo se llega aquí con una pareja NUEVA (las repetidas devuelven cache y no
  // consumen cuota). Una generación incluida por mes natural; si ya se usó, hace
  // falta un crédito comprado (1,99 €) sin consumir.
  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  ).toISOString();
  const { count: includedThisMonth } = await admin
    .from('compatibility_reports')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('billing', 'included')
    .gte('created_at', monthStart);

  let billing: 'included' | 'paid' = 'included';
  let creditId: string | null = null;
  if ((includedThisMonth ?? 0) >= 1) {
    const { data: credit } = await admin
      .from('compatibility_credits')
      .select('id')
      .eq('user_id', userId)
      .is('consumed_at', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!credit) {
      return json({
        status: 'payment_required',
        message: 'Ya has usado tu compatibilidad incluida de este mes. Genera otra por 1,99 €.',
        price: '1,99 €',
      }, 402);
    }
    billing = 'paid';
    creditId = credit.id as string;
  }

  // --- Cálculo astronómico + sinastría -------------------------------------
  const placementsA = computePlacements(toInput(personA));
  const placementsB = computePlacements(toInput(personB));
  const { aspects, score } = computeSynastry(placementsA, placementsB);

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
  let interp: CompatInterpretation | null = null;
  let outputTokens = 0;
  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = await callGemini(
        buildPrompt(personA.label, personB.label, placementsA, placementsB, aspects, score),
        { temperature: 0.75, maxOutputTokens: 3200, responseSchema: RESPONSE_SCHEMA },
      );
      outputTokens = result.outputTokens;
      let parsed: unknown;
      try { parsed = JSON.parse(result.text); } catch { continue; }
      interp = validate(parsed);
      if (interp) break;
    }
  } catch (err) {
    await logCall(admin, { kind: 'compatibility', error: String(err) });
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }
  if (!interp) {
    await logCall(admin, { kind: 'compatibility', error: 'validation_failed' });
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }

  // --- Guardar -------------------------------------------------------------
  const personRow = (p: PersonPayload, placements: PersonPlacements) => ({
    birth_date: p.birth_date, birth_time: p.birth_time,
    lat: p.lat, lng: p.lng, tz: p.tz, place_label: p.place_label,
    placements,
  });

  const reportBlob = JSON.stringify({ interpretation: interp, aspects });
  let createdAt = new Date().toISOString();

  const { data: saved, error: saveErr } = await admin
    .from('compatibility_reports')
    .insert({
      user_id: userId,
      pair_key: key,
      person_a_label: personA.label,
      person_a: personRow(personA, placementsA) as unknown as Record<string, unknown>,
      person_b_label: personB.label,
      person_b: personRow(personB, placementsB) as unknown as Record<string, unknown>,
      score,
      report: reportBlob,
      billing,
    })
    .select('created_at')
    .single();

  // Si otra petición concurrente ganó la carrera (unique pair_key), no es error.
  if (saveErr && saveErr.code !== '23505') {
    await logCall(admin, { kind: 'compatibility', error: saveErr.message });
  }
  if (saved?.created_at) createdAt = saved.created_at;

  // Consumir el crédito comprado solo tras guardar con éxito (si fue de pago).
  if (billing === 'paid' && creditId) {
    await admin
      .from('compatibility_credits')
      .update({ consumed_at: new Date().toISOString() })
      .eq('id', creditId)
      .is('consumed_at', null);
  }

  await logCall(admin, {
    kind: 'compatibility', score,
    latency_ms: Date.now() - started, tokens_out: outputTokens,
  });

  return json({
    status: 'ok', cached: false,
    report: buildReport(
      personA.label, personB.label, score,
      placementsA, placementsB, aspects, interp, createdAt,
    ),
  });
});
