import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { TarotCard } from './types';
import type {
  AdvancedSpreadType,
  AdvancedTarotContent,
  AdvancedTarotQuota,
  AdvancedTarotResponse,
} from './advanced-types';

/**
 * Invoca una tirada avanzada. La función devuelve 402 cuando ya se usó la tirada
 * incluida del mes de ese tipo y no hay créditos (status 'payment_required'), y
 * 403 si no es premium (status 'forbidden'); en ambos casos parseamos el cuerpo
 * en vez de tratarlo como error genérico.
 */
export async function drawAdvancedTarot(
  spread: AdvancedSpreadType,
  question: string,
): Promise<AdvancedTarotResponse> {
  const body = { spread, question: question.trim() || undefined };
  const { data, error } = await supabase.functions.invoke<AdvancedTarotResponse>(
    'generate-advanced-tarot',
    { body },
  );

  if (error) {
    if (error instanceof FunctionsHttpError) {
      try {
        const parsed = await error.context.json();
        if (parsed && typeof parsed.status === 'string') {
          return parsed as AdvancedTarotResponse;
        }
      } catch {
        // cae al throw
      }
    }
    throw error;
  }
  if (!data) throw new Error('Respuesta vacía de generate-advanced-tarot');
  return data;
}

export interface StoredAdvancedReading {
  id: string;
  spread_type: AdvancedSpreadType;
  question: string | null;
  created_at: string;
  content: AdvancedTarotContent;
}

/** Convierte una fila de tarot_readings (premium) en contenido tipado. */
function rowToReading(row: {
  id: string;
  spread_type: string;
  cards: unknown;
  interpretation: string;
  question: string | null;
  created_at: string;
}): StoredAdvancedReading {
  let parsed: { overview?: string; synthesis?: string; advice?: string } = {};
  try {
    parsed = JSON.parse(row.interpretation);
  } catch {
    // Filas antiguas/corruptas: dejamos los campos vacíos.
  }
  return {
    id: row.id,
    spread_type: row.spread_type as AdvancedSpreadType,
    question: row.question,
    created_at: row.created_at,
    content: {
      cards: (row.cards as unknown as TarotCard[]) ?? [],
      overview: parsed.overview ?? '',
      synthesis: parsed.synthesis ?? '',
      advice: parsed.advice ?? '',
    },
  };
}

/** Historial de tiradas avanzadas del usuario (las más recientes primero). */
export async function fetchAdvancedHistory(
  userId: string,
): Promise<StoredAdvancedReading[]> {
  const { data, error } = await supabase
    .from('tarot_readings')
    .select('id, spread_type, cards, interpretation, question, created_at')
    .eq('user_id', userId)
    .eq('is_premium_spread', true)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []).map(rowToReading);
}

const SPREAD_TYPES: AdvancedSpreadType[] = ['celtic_cross', 'horseshoe'];

/** Cuota del usuario por tipo de tirada, en el mes en curso (lectura propia). */
export async function fetchAdvancedTarotQuota(
  userId: string,
): Promise<AdvancedTarotQuota> {
  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  ).toISOString();

  const entries = await Promise.all(
    SPREAD_TYPES.map(async (spread) => {
      const [included, credits] = await Promise.all([
        supabase
          .from('tarot_readings')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_premium_spread', true)
          .eq('spread_type', spread)
          .eq('billing', 'included')
          .gte('created_at', monthStart),
        supabase
          .from('advanced_tarot_credits')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('spread_type', spread)
          .is('consumed_at', null),
      ]);
      if (included.error) throw included.error;
      if (credits.error) throw credits.error;
      return [
        spread,
        {
          includedUsed: (included.count ?? 0) >= 1,
          credits: credits.count ?? 0,
        },
      ] as const;
    }),
  );

  return Object.fromEntries(entries) as AdvancedTarotQuota;
}

/** Inicia el pago puntual (1,79 €) de una tirada extra del tipo dado. */
export async function createAdvancedTarotPayment(
  spread: AdvancedSpreadType,
): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ url?: string; error?: string }>(
    'create-advanced-tarot-payment',
    { body: { spread } },
  );
  if (error) throw error;
  if (!data?.url) throw new Error(data?.error ?? 'No se pudo iniciar el pago');
  return data.url;
}
