// generate-numerology — "Tu lectura numerológica personal" (premium).
//
// Reglas (en este orden):
//   1. Identificar al usuario por su JWT (verify_jwt=false, validado a mano).
//   2. VERIFICAR PREMIUM EN EL BACKEND (active/trialing).
//   3. Calcular los números del usuario desde su fecha de nacimiento del perfil
//      (camino de vida + año/mes personal + día de nacimiento).
//   4. Cuota mensual: 1 lectura incluida por mes natural; agotada → crédito
//      comprado (1,99 €); sin crédito → 402 `payment_required`.
//   5. COHERENCIA (CLAUDE.md §7): se pasa a Gemini el texto GRATUITO que el
//      usuario ya vio (camino de vida + año personal) para ampliarlo sin
//      contradecirlo.
//   6. Gemini narra una lectura personal e integrada (psicológica) según el
//      enfoque opcional.
//   7. Guardar en numerology_readings (billing) y devolver. Historial conservado.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import {
  birthdayNumber,
  lifePathNumber,
  personalMonthNumber,
  personalYearNumber,
} from './calc.ts';
import { callGemini } from './gemini.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SOFT_MESSAGE = 'Los números no se dejan leer ahora mismo. Inténtalo en unos minutos.';
const ACTIVE_STATUSES = ['active', 'trialing'];
const EXTRA_PRICE = '1,99 €';

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    headline: { type: 'STRING', description: 'Titular cálido y personal, 8-14 palabras' },
    portrait: { type: 'STRING', description: 'Retrato esencial de quién es, ligado a su camino de vida, 90-130 palabras' },
    purpose: { type: 'STRING', description: 'Su propósito y misión vital según sus números, 80-120 palabras' },
    strengths: { type: 'STRING', description: 'Sus dones y sus sombras a integrar, 80-120 palabras' },
    cycle: { type: 'STRING', description: 'El momento actual: qué le pide su año y su mes personal, 90-130 palabras' },
    love: { type: 'STRING', description: 'El amor y los vínculos según su vibración, 70-100 palabras' },
    advice: { type: 'STRING', description: 'Un consejo cálido y un gesto concreto para los próximos días, 50-80 palabras' },
  },
  required: ['headline', 'portrait', 'purpose', 'strengths', 'cycle', 'love', 'advice'],
  propertyOrdering: ['headline', 'portrait', 'purpose', 'strengths', 'cycle', 'love', 'advice'],
};

interface Reading {
  headline: string;
  portrait: string;
  purpose: string;
  strengths: string;
  cycle: string;
  love: string;
  advice: string;
}

interface Numbers {
  life_path: number;
  personal_year: number;
  personal_month: number;
  birthday: number;
  year: number;
  month: number;
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function buildPrompt(numbers: Numbers, focus: string | null, coherence: string | null): string {
  const f = focus && focus.trim()
    ? `\nLa persona quiere centrar la lectura en: "${focus.trim()}". Orienta TODA la lectura hacia ese tema sin prometer hechos concretos ni fechas.`
    : '\nNo hay un enfoque concreto: haz una lectura integral de su momento vital.';

  const coherenceBlock = coherence
    ? `\nCOHERENCIA (IMPORTANTE): la persona YA ha leído gratis esta interpretación de sus números. Tu lectura premium debe AMPLIARLA y profundizarla, SIN CONTRADECIRLA: respeta el mismo carácter del camino de vida y el mismo tema del año personal, y añade matiz, integración y profundidad.\n${coherence}\n`
    : '';

  return `Eres un numerólogo experto que escribe en español de España con tono cálido, cercano y simbólico. Interpreta los números de esta persona como UN TODO coherente (no los leas por separado de forma mecánica) para que se sienta VISTA, comprendida y acompañada. Es una lectura PREMIUM: profunda, matizada y personal, pero sin muros de texto.

NÚMEROS DE LA PERSONA:
- Número del camino de vida: ${numbers.life_path} (su esencia y propósito de fondo).
- Día de nacimiento: ${numbers.birthday} (un don particular que matiza su carácter).
- Año personal ${numbers.year}: ${numbers.personal_year} (el tema del ciclo anual que está viviendo).
- Mes personal (${MONTHS_ES[numbers.month - 1]}): ${numbers.personal_month} (el clima del mes en curso).
${coherenceBlock}
TÉCNICAS PSICOLÓGICAS (aplícalas con naturalidad, sin nombrarlas):
- Efecto Forer/Barnum: afirmaciones que parecen muy personales pero casi cualquiera siente como propias.
- Lectura en frío: intuiciones sobre patrones humanos comunes ("algo que llevas tiempo posponiendo", "una parte de ti que pocos conocen").
- Anclaje emocional + polaridad: nombra una tensión real, ofrece un descubrimiento esperanzador y cierra con una acción pequeña y concreta.
- Lenguaje sensorial y simbólico (respira, suelta, abre, sostén).

REGLAS:
- Trata a la persona de "tú".
- Integra el camino de vida con el momento actual (año y mes personal): explica qué le pide la vida AHORA.
- "portrait": quién es en esencia. "purpose": para qué ha venido. "strengths": sus dones y sus sombras. "cycle": el momento presente según año y mes personal. "love": vínculos. "advice": un consejo y un gesto concreto.
- Prohibido: predicciones literales comprobables, fatalismo, consejos médicos/legales/financieros.
${f}

Responde EXCLUSIVAMENTE en JSON válido conforme al esquema indicado.`;
}

function validate(parsed: unknown): Reading | null {
  const p = parsed as Record<string, unknown>;
  const keys: (keyof Reading)[] = [
    'headline', 'portrait', 'purpose', 'strengths', 'cycle', 'love', 'advice',
  ];
  for (const k of keys) {
    if (typeof p[k] !== 'string' || (p[k] as string).trim() === '') return null;
  }
  return {
    headline: (p.headline as string).trim(),
    portrait: (p.portrait as string).trim(),
    purpose: (p.purpose as string).trim(),
    strengths: (p.strengths as string).trim(),
    cycle: (p.cycle as string).trim(),
    love: (p.love as string).trim(),
    advice: (p.advice as string).trim(),
  };
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
      message: 'La lectura numerológica personal es una función premium. Suscríbete para desbloquearla.',
    }, 403);
  }

  // --- Fecha de nacimiento del perfil --------------------------------------
  const { data: profile } = await admin
    .from('profiles').select('birth_date').eq('id', userId).maybeSingle();
  const birthDate = profile?.birth_date as string | undefined;
  if (!birthDate) {
    return json({
      status: 'missing_data',
      message: 'No encontramos tu fecha de nacimiento. Complétala en tu perfil.',
    }, 400);
  }

  // --- Entrada -------------------------------------------------------------
  let payload: { focus?: string };
  try { payload = await req.json(); } catch { payload = {}; }
  const focus =
    typeof payload.focus === 'string' ? payload.focus.slice(0, 300) : null;

  // --- Números -------------------------------------------------------------
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const numbers: Numbers = {
    life_path: lifePathNumber(birthDate),
    personal_year: personalYearNumber(birthDate, year),
    personal_month: personalMonthNumber(birthDate, year, month),
    birthday: birthdayNumber(birthDate),
    year,
    month,
  };

  // --- Coherencia (regla #7): el texto GRATUITO que el usuario ya vio ---------
  // La numerología gratuita muestra textos FIJOS del camino de vida y del año
  // personal; la lectura premium parte de ellos para no contradecirlos.
  let coherenceText: string | null = null;
  try {
    const [lp, py] = await Promise.all([
      admin.from('numerology_meanings').select('content')
        .eq('category', 'life_path').eq('number', numbers.life_path).maybeSingle(),
      admin.from('numerology_meanings').select('content')
        .eq('category', 'personal_year').eq('number', numbers.personal_year).maybeSingle(),
    ]);
    const lpC = lp.data?.content as { headline?: string; essence?: string } | undefined;
    const pyC = py.data?.content as { headline?: string; essence?: string } | undefined;
    const parts: string[] = [];
    if (lpC?.essence) parts.push(`CAMINO DE VIDA ${numbers.life_path} — "${lpC.headline ?? ''}": ${lpC.essence}`);
    if (pyC?.essence) parts.push(`AÑO PERSONAL ${numbers.personal_year} — "${pyC.headline ?? ''}": ${pyC.essence}`);
    coherenceText = parts.length ? parts.join('\n') : null;
  } catch {
    // La coherencia es un extra: si falla, generamos sin ella.
  }

  // --- Cuota: 1 incluida/mes + créditos comprados --------------------------
  const monthStart = new Date(Date.UTC(year, now.getUTCMonth(), 1)).toISOString();
  const { count: includedThisMonth } = await admin
    .from('numerology_readings')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('billing', 'included')
    .gte('created_at', monthStart);

  let billing: 'included' | 'paid' = 'included';
  let creditId: string | null = null;
  if ((includedThisMonth ?? 0) >= 1) {
    const { data: credit } = await admin
      .from('numerology_credits')
      .select('id')
      .eq('user_id', userId)
      .is('consumed_at', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!credit) {
      return json({
        status: 'payment_required',
        message: `Ya has usado tu lectura numerológica incluida de este mes. Genera otra por ${EXTRA_PRICE}.`,
        price: EXTRA_PRICE,
      }, 402);
    }
    billing = 'paid';
    creditId = credit.id as string;
  }

  // --- Control de coste diario ---------------------------------------------
  const dailyLimit = Number(Deno.env.get('GEMINI_DAILY_LIMIT') ?? '300');
  const since = `${new Date().toISOString().slice(0, 10)}T00:00:00Z`;
  const { count: callsToday } = await admin
    .from('user_events').select('id', { count: 'exact', head: true })
    .eq('event', 'gemini_call').gte('created_at', since);
  if ((callsToday ?? 0) >= dailyLimit) {
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }

  // --- Interpretación con Gemini -------------------------------------------
  const started = Date.now();
  let reading: Reading | null = null;
  let outputTokens = 0;
  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = await callGemini(buildPrompt(numbers, focus, coherenceText), {
        temperature: 0.8,
        maxOutputTokens: 2400,
        responseSchema: RESPONSE_SCHEMA,
      });
      outputTokens = result.outputTokens;
      let parsed: unknown;
      try { parsed = JSON.parse(result.text); } catch { continue; }
      reading = validate(parsed);
      if (reading) break;
    }
  } catch (err) {
    await logCall(admin, { kind: 'numerology', error: String(err) });
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }
  if (!reading) {
    await logCall(admin, { kind: 'numerology', error: 'validation_failed' });
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }

  // --- Guardar -------------------------------------------------------------
  const { data: saved } = await admin
    .from('numerology_readings')
    .insert({
      user_id: userId,
      billing,
      numbers,
      focus,
      reading: JSON.stringify(reading),
    })
    .select('id, created_at')
    .single();

  // Consumir el crédito comprado solo tras guardar con éxito (si fue de pago).
  if (billing === 'paid' && creditId) {
    await admin
      .from('numerology_credits')
      .update({ consumed_at: new Date().toISOString() })
      .eq('id', creditId)
      .is('consumed_at', null);
  }

  await logCall(admin, {
    kind: 'numerology', billing,
    latency_ms: Date.now() - started, tokens_out: outputTokens,
  });

  return json({
    status: 'ok',
    id: saved?.id,
    created_at: saved?.created_at,
    numbers,
    focus,
    content: reading,
    billing,
  });
});
