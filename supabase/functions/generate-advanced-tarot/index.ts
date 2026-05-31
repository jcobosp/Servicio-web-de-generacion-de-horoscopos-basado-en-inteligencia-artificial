// generate-advanced-tarot — Tiradas complejas de tarot (premium): CRUZ CELTA
// (10 cartas) y HERRADURA (7 cartas).
//
// Reglas (en este orden):
//   1. Identificar al usuario por su JWT (verify_jwt=false, validado a mano).
//   2. VERIFICAR PREMIUM EN EL BACKEND (active/trialing): un no-suscriptor no
//      puede generar (no gasta tokens ni con peticiones directas).
//   3. Cuota mensual POR TIPO DE TIRADA: 1 generación incluida por mes natural de
//      CADA tirada (1 Cruz Celta + 1 Herradura). Agotada la incluida del tipo,
//      hace falta un crédito comprado de ESE tipo (1,79 €); sin crédito → 402
//      `payment_required`.
//   4. Barajar y robar cartas en el servidor (no manipulable por el cliente).
//   5. Gemini interpreta la tirada completa (psicológica) según pregunta opcional.
//   6. Guardar en tarot_readings (is_premium_spread=true, billing) y devolver.
//
// No hay cache compartida ni cron: cada tirada es única y personal.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { draw } from './deck.ts';
import type { DrawnCard } from './deck.ts';
import { callGemini } from './gemini.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SOFT_MESSAGE = 'Las cartas no se dejan leer ahora mismo. Inténtalo en unos minutos.';
const ACTIVE_STATUSES = ['active', 'trialing'];
const EXTRA_PRICE = '1,79 €';

type AdvancedSpread = 'celtic_cross' | 'horseshoe';

// Posiciones tradicionales de cada tirada (orden fijo).
const SPREADS: Record<AdvancedSpread, { label: string; positions: string[] }> = {
  celtic_cross: {
    label: 'Cruz Celta',
    positions: [
      'La situación presente',
      'El desafío que la cruza',
      'La raíz (pasado profundo)',
      'El pasado reciente',
      'Lo que puede coronar (meta posible)',
      'El futuro inmediato',
      'Tú y tu actitud',
      'Tu entorno e influencias externas',
      'Tus esperanzas y temores',
      'El desenlace probable',
    ],
  },
  horseshoe: {
    label: 'Herradura',
    positions: [
      'El pasado que pesa',
      'El presente',
      'Influencias ocultas',
      'El obstáculo a superar',
      'Las personas de tu entorno',
      'Lo que conviene hacer',
      'El resultado probable',
    ],
  },
};

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    cards: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          meaning: {
            type: 'STRING',
            description: 'Lectura de esta carta en su posición concreta, 45-75 palabras',
          },
        },
        required: ['meaning'],
        propertyOrdering: ['meaning'],
      },
    },
    overview: {
      type: 'STRING',
      description: 'El tema central que dibuja la tirada en conjunto, 60-100 palabras',
    },
    synthesis: {
      type: 'STRING',
      description: 'Cómo se conectan las cartas en un hilo narrativo único, 90-140 palabras',
    },
    advice: {
      type: 'STRING',
      description: 'Un consejo cálido y una acción pequeña y concreta, 45-75 palabras',
    },
  },
  required: ['cards', 'overview', 'synthesis', 'advice'],
  propertyOrdering: ['cards', 'overview', 'synthesis', 'advice'],
};

interface Interpretation {
  cards: Array<{ meaning: string }>;
  overview: string;
  synthesis: string;
  advice: string;
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function buildPrompt(
  cards: DrawnCard[],
  spread: AdvancedSpread,
  question: string | null,
): string {
  const list = cards
    .map((c, i) => `${i + 1}. Posición "${c.position}": ${c.name}${c.reversed ? ' (invertida)' : ''}`)
    .join('\n');
  const q = question && question.trim()
    ? `\nLa persona pregunta: "${question.trim()}". Orienta toda la lectura a su pregunta sin prometer hechos concretos.`
    : '\nNo hay pregunta concreta: lee a fondo su momento vital presente.';

  return `Eres un tarotista experto que lee en español de España con tono cálido, cercano y simbólico. Interpreta esta tirada de ${SPREADS[spread].label} (${cards.length} cartas) para que la persona se sienta VISTA, comprendida y acompañada. Es una lectura PREMIUM: profunda, matizada y con criterio, pero sin muros de texto.

TÉCNICAS PSICOLÓGICAS (aplícalas con naturalidad, sin nombrarlas):
- Efecto Forer/Barnum: afirmaciones que parecen muy personales pero casi cualquiera siente como propias.
- Lectura en frío: intuiciones sobre patrones humanos comunes ("algo que llevas tiempo posponiendo", "alguien cercano que ya no te suma").
- Anclaje emocional + polaridad: nombra una tensión real, ofrece un descubrimiento esperanzador y cierra con una acción pequeña y concreta.
- Lenguaje sensorial y simbólico (respira, suelta, abre, sostén).

REGLAS:
- Trata a la persona de "tú".
- Respeta el significado tradicional de cada carta y su orientación (invertida matiza, bloquea o internaliza la energía).
- En "cards", da UNA entrada por carta EN EL MISMO ORDEN, ligando cada carta al SIGNIFICADO de su posición concreta dentro de la tirada (no la leas aislada).
- Aprovecha la estructura de la tirada: en la Cruz Celta conecta presente↔desafío, pasado↔futuro y actitud↔desenlace; en la Herradura traza el arco pasado→presente→resultado.
- Prohibido: predicciones literales comprobables, fatalismo, consejos médicos/legales/financieros.
- "overview": el tema que vertebra la tirada. "synthesis": teje las cartas en un relato único. "advice": un consejo y un gesto concreto para hoy.

CARTAS DE LA TIRADA (mantén este orden y número):
${list}
${q}

Responde EXCLUSIVAMENTE en JSON válido conforme al esquema indicado.`;
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
  const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // --- Premium (backend) ---------------------------------------------------
  const { data: sub } = await admin
    .from('subscriptions').select('status').eq('user_id', userId).maybeSingle();
  if (!sub || !ACTIVE_STATUSES.includes(sub.status as string)) {
    return json({
      status: 'forbidden',
      message: 'Las tiradas avanzadas (Cruz Celta y Herradura) son una función premium. Suscríbete para desbloquearlas.',
    }, 403);
  }

  // --- Entrada -------------------------------------------------------------
  let payload: { spread?: string; question?: string };
  try { payload = await req.json(); } catch { payload = {}; }
  const spread: AdvancedSpread = payload.spread === 'horseshoe' ? 'horseshoe' : 'celtic_cross';
  if (payload.spread !== 'celtic_cross' && payload.spread !== 'horseshoe') {
    return json({ status: 'error', message: 'spread inválido (celtic_cross|horseshoe)' }, 400);
  }
  const question =
    typeof payload.question === 'string' ? payload.question.slice(0, 300) : null;

  // --- Cuota mensual POR TIPO: 1 incluida/mes de este spread + créditos ----
  // 1 generación incluida por mes natural de CADA tirada; si ya se usó la de
  // este tipo, hace falta un crédito comprado del mismo tipo (1,79 €).
  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  ).toISOString();
  const { count: includedThisMonth } = await admin
    .from('tarot_readings')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_premium_spread', true)
    .eq('spread_type', spread)
    .eq('billing', 'included')
    .gte('created_at', monthStart);

  let billing: 'included' | 'paid' = 'included';
  let creditId: string | null = null;
  if ((includedThisMonth ?? 0) >= 1) {
    const { data: credit } = await admin
      .from('advanced_tarot_credits')
      .select('id')
      .eq('user_id', userId)
      .eq('spread_type', spread)
      .is('consumed_at', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!credit) {
      return json({
        status: 'payment_required',
        message: `Ya has usado tu tirada de ${SPREADS[spread].label} incluida de este mes. Genera otra por ${EXTRA_PRICE}.`,
        spread,
        price: EXTRA_PRICE,
      }, 402);
    }
    billing = 'paid';
    creditId = credit.id as string;
  }

  // --- Robar cartas (servidor) ---------------------------------------------
  const positions = SPREADS[spread].positions;
  const drawn = draw(positions.length, positions);

  // --- Interpretación con Gemini -------------------------------------------
  const started = Date.now();
  let interpretation: Interpretation | null = null;
  let outputTokens = 0;

  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = await callGemini(buildPrompt(drawn, spread, question), {
        temperature: 0.9,
        maxOutputTokens: positions.length * 180 + 700,
        responseSchema: RESPONSE_SCHEMA,
      });
      outputTokens = result.outputTokens;
      let parsed: unknown;
      try { parsed = JSON.parse(result.text); } catch { continue; }
      const p = parsed as {
        cards?: Array<{ meaning?: unknown }>;
        overview?: unknown; synthesis?: unknown; advice?: unknown;
      };
      if (
        Array.isArray(p.cards) && p.cards.length === drawn.length &&
        p.cards.every((c) => typeof c.meaning === 'string' && c.meaning.trim() !== '') &&
        typeof p.overview === 'string' && p.overview.trim() !== '' &&
        typeof p.synthesis === 'string' && p.synthesis.trim() !== '' &&
        typeof p.advice === 'string' && p.advice.trim() !== ''
      ) {
        interpretation = {
          cards: p.cards.map((c) => ({ meaning: (c.meaning as string).trim() })),
          overview: (p.overview as string).trim(),
          synthesis: (p.synthesis as string).trim(),
          advice: (p.advice as string).trim(),
        };
        break;
      }
    }
  } catch (err) {
    await logCall(admin, { kind: 'tarot_advanced', error: String(err) });
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }

  if (!interpretation) {
    await logCall(admin, { kind: 'tarot_advanced', error: 'validation_failed' });
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }

  // Cartas enriquecidas con su significado, para guardar y devolver juntas.
  const cardsWithMeaning = drawn.map((c, i) => ({
    ...c,
    meaning: interpretation!.cards[i]!.meaning,
  }));

  const content = {
    cards: cardsWithMeaning,
    overview: interpretation.overview,
    synthesis: interpretation.synthesis,
    advice: interpretation.advice,
  };

  // --- Guardar (interpretation = JSON con las 3 secciones narrativas) ------
  const { data: saved } = await admin
    .from('tarot_readings')
    .insert({
      user_id: userId,
      spread_type: spread,
      is_premium_spread: true,
      billing,
      cards: content.cards,
      interpretation: JSON.stringify({
        overview: content.overview,
        synthesis: content.synthesis,
        advice: content.advice,
      }),
      question,
    })
    .select('id, created_at')
    .single();

  // Consumir el crédito comprado solo tras guardar con éxito (si fue de pago).
  if (billing === 'paid' && creditId) {
    await admin
      .from('advanced_tarot_credits')
      .update({ consumed_at: new Date().toISOString() })
      .eq('id', creditId)
      .is('consumed_at', null);
  }

  await logCall(admin, {
    kind: 'tarot_advanced', spread, billing, cards: drawn.length,
    latency_ms: Date.now() - started, tokens_out: outputTokens,
  });

  return json({
    status: 'ok',
    id: saved?.id,
    created_at: saved?.created_at,
    spread,
    question,
    content,
    billing,
  });
});
