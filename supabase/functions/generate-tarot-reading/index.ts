// generate-tarot-reading — Tirada de tarot simple (1 o 3 cartas) por usuario.
//
// A diferencia del resto de contenido IA, ESTO ES POR USUARIO y requiere sesión
// (verify_jwt=false pero validamos el JWT a mano para poder dar errores claros):
//   1. Identificar al usuario por su token.
//   2. Cooldown gratuito de 24h: si tiene una tirada en las últimas 24h, 429.
//   3. Barajar y robar cartas en el servidor (no manipulable por el cliente).
//   4. Gemini interpreta la tirada (psicológica) según pregunta opcional.
//   5. Guardar en tarot_readings y devolver.
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
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

const POSITIONS_1 = ['El mensaje de hoy'];
const POSITIONS_3 = ['Pasado', 'Presente', 'Futuro'];

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    cards: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          meaning: { type: 'STRING', description: 'Lectura de esta carta en su posición, 40-70 palabras' },
        },
        required: ['meaning'],
        propertyOrdering: ['meaning'],
      },
    },
    summary: { type: 'STRING', description: 'Síntesis integradora de la tirada, 50-90 palabras' },
    premium_hook: { type: 'STRING', description: 'Gancho premium, 12-18 palabras' },
  },
  required: ['cards', 'summary', 'premium_hook'],
  propertyOrdering: ['cards', 'summary', 'premium_hook'],
};

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function buildPrompt(
  cards: DrawnCard[],
  spread: 'one_card' | 'three_cards',
  question: string | null,
): string {
  const list = cards
    .map((c, i) => `${i + 1}. Posición "${c.position}": ${c.name}${c.reversed ? ' (invertida)' : ''}`)
    .join('\n');
  const q = question && question.trim()
    ? `\nLa persona pregunta: "${question.trim()}". Orienta la lectura a su pregunta sin prometer hechos concretos.`
    : '\nNo hay pregunta concreta: haz una lectura general de su momento presente.';

  return `Eres un tarotista que lee en español de España con tono cálido, cercano y simbólico. Interpreta esta tirada de tarot (${spread === 'one_card' ? '1 carta' : '3 cartas'}) para que la persona se sienta VISTA y comprendida.

TÉCNICAS PSICOLÓGICAS (aplícalas con naturalidad, sin nombrarlas):
- Efecto Forer/Barnum: afirmaciones que parecen muy personales pero casi cualquiera siente como propias.
- Lectura en frío: intuiciones sobre patrones humanos comunes ("algo que llevas tiempo posponiendo", "alguien cercano").
- Anclaje emocional + polaridad: una tensión + un descubrimiento esperanzador + una acción pequeña y concreta.
- Lenguaje sensorial y simbólico (respira, suelta, abre).

REGLAS:
- Trata a la persona de "tú".
- Respeta el significado tradicional de cada carta y su orientación (invertida matiza/bloquea).
- En "cards", da UNA entrada por carta EN EL MISMO ORDEN, ligando cada carta a su posición.
- Prohibido: predicciones literales comprobables, fatalismo, consejos médicos/legales/financieros.
- "summary": integra las cartas en un hilo único. "premium_hook": insinúa que la tirada de 10 cartas (cruz celta) revela mucho más.

CARTAS DE LA TIRADA (mantén este orden y número):
${list}
${q}

Responde EXCLUSIVAMENTE en JSON válido conforme al esquema indicado.`;
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
  let payload: { spread?: string; question?: string };
  try { payload = await req.json(); } catch { payload = {}; }
  const spread = payload.spread === 'three_cards' ? 'three_cards' : 'one_card';
  const question =
    typeof payload.question === 'string' ? payload.question.slice(0, 300) : null;

  const admin = createClient(
    supabaseUrl,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // --- Cooldown gratuito de 24h --------------------------------------------
  const sinceIso = new Date(Date.now() - COOLDOWN_MS).toISOString();
  const { data: recent } = await admin
    .from('tarot_readings')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recent) {
    const nextAt = new Date(new Date(recent.created_at).getTime() + COOLDOWN_MS);
    return json(
      {
        status: 'cooldown',
        message: 'Ya has hecho tu tirada gratuita. Vuelve mañana para una nueva.',
        next_available_at: nextAt.toISOString(),
      },
      429,
    );
  }

  // --- Robar cartas (servidor) ---------------------------------------------
  const positions = spread === 'three_cards' ? POSITIONS_3 : POSITIONS_1;
  const drawn = draw(positions.length, positions);

  // --- Interpretación con Gemini -------------------------------------------
  const started = Date.now();
  let interpretation:
    | { cards: Array<{ meaning: string }>; summary: string; premium_hook: string }
    | null = null;
  let outputTokens = 0;

  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = await callGemini(buildPrompt(drawn, spread, question), {
        temperature: 0.9,
        maxOutputTokens: positions.length * 200 + 400,
        responseSchema: RESPONSE_SCHEMA,
      });
      outputTokens = result.outputTokens;
      let parsed: unknown;
      try { parsed = JSON.parse(result.text); } catch { continue; }
      const p = parsed as {
        cards?: Array<{ meaning?: unknown }>; summary?: unknown; premium_hook?: unknown;
      };
      if (
        Array.isArray(p.cards) && p.cards.length === drawn.length &&
        p.cards.every((c) => typeof c.meaning === 'string' && c.meaning.trim() !== '') &&
        typeof p.summary === 'string' && p.summary.trim() !== '' &&
        typeof p.premium_hook === 'string' && p.premium_hook.trim() !== ''
      ) {
        interpretation = {
          cards: p.cards.map((c) => ({ meaning: (c.meaning as string).trim() })),
          summary: (p.summary as string).trim(),
          premium_hook: (p.premium_hook as string).trim(),
        };
        break;
      }
    }
  } catch (err) {
    await logCall(admin, { kind: 'tarot', error: String(err) });
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }

  if (!interpretation) {
    await logCall(admin, { kind: 'tarot', error: 'validation_failed' });
    return json({ status: 'unavailable', message: SOFT_MESSAGE });
  }

  // Cartas enriquecidas con su significado, para guardar y devolver juntas.
  const cardsWithMeaning = drawn.map((c, i) => ({
    ...c,
    meaning: interpretation!.cards[i]!.meaning,
  }));

  const content = {
    cards: cardsWithMeaning,
    summary: interpretation.summary,
    premium_hook: interpretation.premium_hook,
  };

  // --- Guardar -------------------------------------------------------------
  const { data: saved } = await admin
    .from('tarot_readings')
    .insert({
      user_id: userId,
      spread_type: spread,
      is_premium_spread: false,
      cards: content.cards,
      interpretation: content.summary,
      question,
    })
    .select('id, created_at')
    .single();

  await logCall(admin, {
    kind: 'tarot', spread, cards: drawn.length,
    latency_ms: Date.now() - started, tokens_out: outputTokens,
  });

  return json({
    status: 'ok',
    id: saved?.id,
    created_at: saved?.created_at,
    spread,
    question,
    content,
  });
});

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
