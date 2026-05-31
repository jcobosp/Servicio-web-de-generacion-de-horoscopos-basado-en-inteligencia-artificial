// generate-report — Informes largos personalizados (premium): MENSUAL y ANUAL.
//
// Reglas (en este orden):
//   1. Identificar al usuario por su JWT (verify_jwt=false, validado a mano).
//   2. VERIFICAR PREMIUM EN EL BACKEND (active/trialing): un no-suscriptor no
//      puede generar (no gasta tokens ni con peticiones directas).
//   3. GENERACIÓN ÚNICA POR USUARIO Y PERIODO: si ya existe el informe del
//      mes/año en curso, se devuelve sin volver a llamar a Gemini (control de
//      coste). Los informes están INCLUIDOS en premium (sin créditos extra).
//   4. La hora y el lugar son OPCIONALES (mejoran con Ascendente/MC).
//   5. Coherencia (CLAUDE.md §7): se pasa a Gemini la lectura gratuita previa de
//      esta persona (horóscopo mensual de su signo / carta natal básica) para
//      ampliarla sin contradecirla.
//   6. Calcular carta natal + tránsitos del periodo + aspectos, narrar con Gemini
//      y guardar en premium_reports.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { computePeriodChart } from './astro.ts';
import type { NatalInput, PeriodChart } from './astro.ts';
import { callGemini } from './gemini.ts';
import { buildPrompt, responseSchema, validate } from './prompts.ts';
import type { ReportInterpretation, ReportKind } from './prompts.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SOFT_MESSAGE = 'Tu informe se está escribiendo entre los astros. Vuelve en unos minutos.';
const DEFAULT_TZ = 'Europe/Madrid';
const ACTIVE_STATUSES = ['active', 'trialing'];

const SIGN_NAMES: Record<string, string> = {
  aries: 'Aries', tauro: 'Tauro', geminis: 'Géminis', cancer: 'Cáncer',
  leo: 'Leo', virgo: 'Virgo', libra: 'Libra', escorpio: 'Escorpio',
  sagitario: 'Sagitario', capricornio: 'Capricornio', acuario: 'Acuario', piscis: 'Piscis',
};

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * `profiles.birth_time` y `birth_place` son columnas `bytea`; supabase-js las
 * devuelve como cadena hex con prefijo `\x`. Esta utilidad recupera su texto
 * UTF-8 original (si el valor no tiene ese formato, lo devuelve tal cual).
 */
function decodeByteaText(value: unknown): string | null {
  if (typeof value !== 'string' || value === '') return null;
  if (!value.startsWith('\\x')) return value;
  const hex = value.slice(2);
  if (hex.length === 0 || hex.length % 2 !== 0) return value;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const byte = Number.parseInt(hex.substr(i * 2, 2), 16);
    if (Number.isNaN(byte)) return value;
    bytes[i] = byte;
  }
  try {
    return new TextDecoder().decode(bytes);
  } catch {
    return value;
  }
}

const isTime = (v: unknown): v is string =>
  typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const isLat = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= -90 && v <= 90;
const isLng = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= -180 && v <= 180;

/** Fecha de hoy (YYYY-MM-DD) en la zona de Madrid. */
function madridToday(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

/** Inicio del periodo (YYYY-MM-DD), instante medio (UTC) y etiqueta legible. */
function periodInfo(kind: ReportKind, today: string): {
  periodStart: string; midUtc: Date; label: string;
} {
  const [y, m] = today.split('-').map(Number);
  if (kind === 'monthly') {
    const periodStart = `${today.slice(0, 7)}-01`;
    const midUtc = new Date(Date.UTC(y, m - 1, 15, 12, 0, 0));
    return { periodStart, midUtc, label: `${MONTHS_ES[m - 1]} de ${y}` };
  }
  // anual
  const periodStart = `${y}-01-01`;
  const midUtc = new Date(Date.UTC(y, 6, 2, 12, 0, 0)); // ~mitad del año
  return { periodStart, midUtc, label: `${y}` };
}

function buildResult(
  kind: ReportKind, chart: PeriodChart, interp: ReportInterpretation,
  periodStart: string, label: string, place: string | null, createdAt: string,
) {
  return {
    kind, period_start: periodStart, period_label: label, place,
    natal: chart.natal, transits: chart.transits, aspects: chart.aspects,
    interpretation: interp, created_at: createdAt,
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
      message: 'Los informes mensuales y anuales son una función premium. Suscríbete para desbloquearlos.',
    }, 403);
  }

  // --- Entrada -------------------------------------------------------------
  let payload: {
    kind?: unknown; birth_time?: unknown; lat?: unknown;
    lng?: unknown; tz?: unknown; place_label?: unknown;
  };
  try { payload = await req.json(); } catch { payload = {}; }

  const kind: ReportKind = payload.kind === 'annual' ? 'annual' : 'monthly';
  if (payload.kind !== 'monthly' && payload.kind !== 'annual') {
    return json({ status: 'error', message: 'kind inválido (monthly|annual)' }, 400);
  }

  const today = madridToday();
  const { periodStart, midUtc, label } = periodInfo(kind, today);

  // --- Informe existente para este periodo (generación única) --------------
  const { data: existing } = await admin
    .from('premium_reports')
    .select('data, report, created_at')
    .eq('user_id', userId)
    .eq('kind', kind)
    .eq('period_start', periodStart)
    .maybeSingle();

  if (existing) {
    try {
      const stored = existing.data as unknown as { chart: PeriodChart; place: string | null };
      const interp = JSON.parse(existing.report) as ReportInterpretation;
      return json({
        status: 'ok', cached: true,
        report: buildResult(
          kind, stored.chart, interp, periodStart, label,
          stored.place ?? null, existing.created_at,
        ),
      });
    } catch { /* fila corrupta: regenerar */ }
  }

  // --- Perfil + datos de nacimiento ----------------------------------------
  const { data: profile } = await admin
    .from('profiles')
    .select('birth_date, display_name, sun_sign, birth_time, birth_place, birth_lat, birth_lng')
    .eq('id', userId)
    .maybeSingle();

  if (!profile?.birth_date) {
    return json({
      status: 'missing_data',
      message: 'No encontramos tu fecha de nacimiento. Revísala en tu perfil.',
    }, 400);
  }

  // El perfil guarda hora/lugar como bytea (hex): hay que decodificarlos.
  const profileTime = decodeByteaText(profile.birth_time);
  const profilePlace = decodeByteaText(profile.birth_place);

  const birthTime = isTime(payload.birth_time)
    ? payload.birth_time
    : (profileTime && isTime(profileTime.slice(0, 5)) ? profileTime.slice(0, 5) : null);
  const lat = isLat(payload.lat) ? payload.lat : (profile.birth_lat ?? null);
  const lng = isLng(payload.lng) ? payload.lng : (profile.birth_lng ?? null);
  const tz = typeof payload.tz === 'string' && payload.tz ? payload.tz : DEFAULT_TZ;
  const place = typeof payload.place_label === 'string' && payload.place_label.trim()
    ? payload.place_label.trim().slice(0, 120)
    : profilePlace;

  // El Ascendente solo es fiable con hora + coordenadas.
  const effLat = birthTime ? lat : null;
  const effLng = birthTime ? lng : null;

  const natalInput: NatalInput = {
    birthDate: profile.birth_date, birthTime, lat: effLat, lng: effLng, tz,
  };

  // --- Cálculo astronómico (natal + tránsitos + aspectos) ------------------
  const chart = computePeriodChart(natalInput, midUtc, label);
  const sunSignName = SIGN_NAMES[profile.sun_sign as string] ?? chart.natal.bodies[0].sign_name;

  // --- Coherencia con el contenido gratuito previo -------------------------
  let coherenceText: string | null = null;
  try {
    if (kind === 'monthly') {
      // Horóscopo mensual gratuito (área general) del signo, mismo mes.
      const { data: horo } = await admin
        .from('horoscope_cache')
        .select('content')
        .eq('sun_sign', profile.sun_sign)
        .eq('scope', 'monthly')
        .eq('area', 'general')
        .eq('period_start', periodStart)
        .maybeSingle();
      const c = horo?.content as { headline?: string; body?: string } | undefined;
      if (c?.body) coherenceText = [c.headline, c.body].filter(Boolean).join('\n');
    } else {
      // Carta natal básica de esta persona.
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
        coherenceText = [parsed.intro, parsed.sun, parsed.moon, parsed.ascendant, parsed.synthesis]
          .filter(Boolean).join('\n\n');
      }
    }
  } catch { /* la coherencia es un extra: si falla, generamos sin ella */ }

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
  const maxTokens = kind === 'monthly' ? 1500 : 3000;
  const started = Date.now();
  let interp: ReportInterpretation | null = null;
  let outputTokens = 0;
  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = await callGemini(
        buildPrompt(kind, chart, profile.display_name, sunSignName, coherenceText),
        { temperature: 0.7, maxOutputTokens: maxTokens, responseSchema: responseSchema(kind) },
      );
      outputTokens = result.outputTokens;
      let parsed: unknown;
      try { parsed = JSON.parse(result.text); } catch { continue; }
      interp = validate(parsed, kind);
      if (interp) break;
    }
  } catch (err) {
    await logCall(admin, { kind: `report_${kind}`, error: String(err) });
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }
  if (!interp) {
    await logCall(admin, { kind: `report_${kind}`, error: 'validation_failed' });
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }

  // --- Guardar (una fila por usuario/kind/periodo) -------------------------
  let createdAt = new Date().toISOString();
  const dataBlob = { chart, place };
  const { data: saved, error: saveErr } = await admin
    .from('premium_reports')
    .insert({
      user_id: userId,
      kind,
      period_start: periodStart,
      data: dataBlob as unknown as Record<string, unknown>,
      report: JSON.stringify(interp),
    })
    .select('created_at')
    .single();

  // Si otra petición concurrente ganó la carrera (unique), no es error.
  if (saveErr && saveErr.code !== '23505') {
    await logCall(admin, { kind: `report_${kind}`, error: saveErr.message });
  }
  if (saved?.created_at) createdAt = saved.created_at;

  await logCall(admin, {
    kind: `report_${kind}`,
    latency_ms: Date.now() - started, tokens_out: outputTokens,
  });

  return json({
    status: 'ok', cached: false,
    report: buildResult(kind, chart, interp, periodStart, label, place, createdAt),
  });
});
