// generate-daily-energy — Energía del día POR SIGNO.
//
// Flujo (pública, verify_jwt=false):
//   1. Validar { sun_sign, date? }.
//   2. Cache (sun_sign, date) → devolver si existe.
//   3. Control de coste diario.
//   4. Leer la energía de AYER de ese signo y pasarla a Gemini para no repetir.
//   5. Generar, validar, guardar.
//   6. Limpieza: conservar solo el día actual y el anterior (borrar más antiguas).
//
// La generación diaria de los 12 signos la dispara un cron de Postgres
// (pg_cron + pg_net) que invoca esta función una vez por signo.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { callGemini } from './gemini.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SOFT_MESSAGE = 'La energía del día se está asentando. Vuelve en unos minutos.';

const SUN_SIGNS = [
  'aries', 'tauro', 'geminis', 'cancer', 'leo', 'virgo',
  'libra', 'escorpio', 'sagitario', 'capricornio', 'acuario', 'piscis',
] as const;
type SunSign = (typeof SUN_SIGNS)[number];

const SIGN_NAMES: Record<SunSign, string> = {
  aries: 'Aries', tauro: 'Tauro', geminis: 'Géminis', cancer: 'Cáncer',
  leo: 'Leo', virgo: 'Virgo', libra: 'Libra', escorpio: 'Escorpio',
  sagitario: 'Sagitario', capricornio: 'Capricornio', acuario: 'Acuario',
  piscis: 'Piscis',
};

const WEEKDAYS_ES = [
  'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado',
];

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    headline: { type: 'STRING', description: 'Titular del día, 5-9 palabras' },
    body: { type: 'STRING', description: 'Energía del día para el signo, 60-90 palabras' },
    vibe: { type: 'STRING', description: 'La vibra del día en 1-3 palabras' },
    energy_level: { type: 'INTEGER', description: 'Nivel de energía del día, entero 1-10, coherente con el resto' },
    mood_emoji: { type: 'STRING', description: 'Un único emoji' },
    focus: { type: 'STRING', description: 'En qué poner el foco hoy, 1 frase' },
    caution: { type: 'STRING', description: 'Qué cuidar hoy, 1 frase' },
    premium_hook: { type: 'STRING', description: 'Gancho premium, 12-18 palabras' },
  },
  required: ['headline', 'body', 'vibe', 'energy_level', 'mood_emoji', 'focus', 'caution', 'premium_hook'],
  propertyOrdering: ['headline', 'body', 'vibe', 'energy_level', 'mood_emoji', 'focus', 'caution', 'premium_hook'],
};

interface Energy {
  headline: string; body: string; vibe: string; energy_level: number;
  mood_emoji: string; focus: string; caution: string; premium_hook: string;
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function madridToday(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

function parseUtc(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = parseUtc(value);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function previousDay(iso: string): string {
  const d = parseUtc(iso);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function buildPrompt(signName: string, date: string, yesterday: Energy | null): string {
  const weekday = WEEKDAYS_ES[parseUtc(date).getUTCDay()];
  const avoid = yesterday
    ? `\nLECTURA DE AYER (para ${signName}), NO la repitas —cambia el enfoque, las imágenes, la vibra y el consejo, y procura que el nivel de energía no sea idéntico:\n- Titular: "${yesterday.headline}"\n- Cuerpo: "${yesterday.body}"\n- Vibra: "${yesterday.vibe}" · Nivel: ${yesterday.energy_level}/10\n`
    : '';

  return `Eres un astrólogo que escribe horóscopos contemporáneos en español de España. Tu objetivo es que ${signName} se sienta VISTO y comprendido al leerte, y que le ENGANCHE emocionalmente.

CONTEXTO:
- Signo: ${signName}
- Fecha: ${date} (${weekday}).

TÉCNICAS PSICOLÓGICAS (aplícalas con naturalidad, sin nombrarlas):
- Efecto Forer/Barnum: afirmaciones que parecen muy personales pero casi cualquiera siente como propias ("últimamente cargas con más de lo que muestras").
- Lectura en frío: intuiciones sobre patrones humanos comunes que el lector cree únicos suyos.
- Anclaje emocional: nombra una emoción que muchos sienten hoy (ilusión, cansancio, esperanza, inquietud) y dale un marco que reconforte.
- Polaridad equilibrada: un reto o tensión + un descubrimiento esperanzador + una acción pequeña y concreta.
- Lenguaje sensorial y simbólico: verbos físicos (respira, suelta, abre) y símbolos del signo y su elemento.
- Específico-pero-no-medible: "una conversación reciente", "alguien cercano", sin predicciones comprobables.

REGLAS:
- Trata al lector de "tú". Tono cálido, cercano, emocionalmente evocador, nunca infantil.
- Prohibido: diagnósticos médicos, promesas económicas concretas, alarmismo, consejos legales/médicos/financieros.
- "energy_level": entero del 1 al 10 que resuma la intensidad/fluidez del día para ${signName} y sea COHERENTE con el tono del resto (un día tenso y de bajón no puede ser un 9; un día expansivo no puede ser un 2).
- "vibe": 1-3 palabras que capturen el día.
- "focus": en qué poner el foco hoy (1 frase, cálida y accionable).
- "caution": qué cuidar hoy, sin alarmismo (1 frase).
- "premium_hook": insinúa que esta energía cae distinta según la carta natal de cada persona.
- Extensión del cuerpo: alrededor de 60-90 palabras.
${avoid}
Responde EXCLUSIVAMENTE en JSON válido conforme al esquema indicado.`;
}

function validate(value: unknown): Energy | null {
  if (typeof value !== 'object' || value === null) return null;
  const v = value as Record<string, unknown>;
  const fields = ['headline', 'body', 'vibe', 'mood_emoji', 'focus', 'caution', 'premium_hook'];
  for (const f of fields) {
    if (typeof v[f] !== 'string' || (v[f] as string).trim() === '') return null;
  }
  const lvl = v.energy_level;
  if (typeof lvl !== 'number' || !Number.isInteger(lvl) || lvl < 1 || lvl > 10) return null;
  const words = (v.body as string).trim().split(/\s+/).length;
  if (words < 35 || words > 160) return null;
  return {
    headline: (v.headline as string).trim(),
    body: (v.body as string).trim(),
    vibe: (v.vibe as string).trim(),
    energy_level: lvl,
    mood_emoji: (v.mood_emoji as string).trim(),
    focus: (v.focus as string).trim(),
    caution: (v.caution as string).trim(),
    premium_hook: (v.premium_hook as string).trim(),
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

  let payload: { sun_sign?: string; date?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ status: 'error', message: 'JSON inválido' }, 400);
  }

  const sun_sign = payload.sun_sign as SunSign;
  const date = payload.date && payload.date.length ? payload.date : madridToday();
  if (!SUN_SIGNS.includes(sun_sign)) return json({ status: 'error', message: 'sun_sign inválido' }, 400);
  if (!isIsoDate(date)) return json({ status: 'error', message: 'date inválida (YYYY-MM-DD)' }, 400);

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // 1) Cache
  const cached = await admin
    .from('daily_energy').select('content')
    .eq('sun_sign', sun_sign).eq('date', date).maybeSingle();
  if (cached.data) {
    return json({ status: 'ok', cached: true, date, content: cached.data.content });
  }

  // 2) Control de coste
  const dailyLimit = Number(Deno.env.get('GEMINI_DAILY_LIMIT') ?? '300');
  const since = `${madridToday()}T00:00:00Z`;
  const { count } = await admin
    .from('user_events').select('id', { count: 'exact', head: true })
    .eq('event', 'gemini_call').gte('created_at', since);

  const yesterdayDate = previousDay(date);
  if ((count ?? 0) >= dailyLimit) {
    const prev = await admin
      .from('daily_energy').select('content')
      .eq('sun_sign', sun_sign).eq('date', yesterdayDate).maybeSingle();
    if (prev.data) return json({ status: 'ok', cached: true, stale: true, content: prev.data.content });
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }

  // 4) Contexto de ayer (para no repetir)
  const yRow = await admin
    .from('daily_energy').select('content')
    .eq('sun_sign', sun_sign).eq('date', yesterdayDate).maybeSingle();
  const yesterday = (yRow.data?.content ?? null) as Energy | null;

  // 5) Generación
  const started = Date.now();
  let energy: Energy | null = null;
  let outputTokens = 0;
  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = await callGemini(buildPrompt(SIGN_NAMES[sun_sign], date, yesterday), {
        temperature: 0.9, maxOutputTokens: 600, responseSchema: RESPONSE_SCHEMA,
      });
      outputTokens = result.outputTokens;
      let parsed: unknown;
      try { parsed = JSON.parse(result.text); } catch { continue; }
      energy = validate(parsed);
      if (energy) break;
    }
  } catch (err) {
    await logCall(admin, { kind: 'daily_energy', sun_sign, error: String(err) });
    if (yesterday) return json({ status: 'ok', cached: true, stale: true, content: yesterday });
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }

  if (!energy) {
    await logCall(admin, { kind: 'daily_energy', sun_sign, error: 'validation_failed' });
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }

  // 6) Guardar
  await admin
    .from('daily_energy')
    .upsert({ sun_sign, date, content: energy }, { onConflict: 'sun_sign,date', ignoreDuplicates: true });

  // Limpieza: conservar solo el día actual y el anterior.
  await admin.from('daily_energy').delete().lt('date', yesterdayDate);

  const stored = await admin
    .from('daily_energy').select('content')
    .eq('sun_sign', sun_sign).eq('date', date).maybeSingle();

  await logCall(admin, {
    kind: 'daily_energy', sun_sign, cached: false,
    latency_ms: Date.now() - started, tokens_out: outputTokens,
  });

  return json({ status: 'ok', cached: false, date, content: stored.data?.content ?? energy });
});
