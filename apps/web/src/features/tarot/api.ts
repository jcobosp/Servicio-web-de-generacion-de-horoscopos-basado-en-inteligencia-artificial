import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { SpreadType, TarotCard, TarotResponse } from './types';

/**
 * Invoca la tirada de tarot. La función devuelve 429 cuando hay cooldown; en
 * ese caso parseamos el cuerpo (que trae `status: 'cooldown'`) en vez de tratarlo
 * como un error genérico.
 */
export async function drawTarot(
  spread: SpreadType,
  question: string,
): Promise<TarotResponse> {
  const body = { spread, question: question.trim() || undefined };
  const { data, error } = await supabase.functions.invoke<TarotResponse>(
    'generate-tarot-reading',
    { body },
  );

  if (error) {
    if (error instanceof FunctionsHttpError) {
      try {
        const parsed = await error.context.json();
        if (parsed && typeof parsed.status === 'string') {
          return parsed as TarotResponse;
        }
      } catch {
        // cae al throw
      }
    }
    throw error;
  }
  if (!data) throw new Error('Respuesta vacía de generate-tarot-reading');
  return data;
}

export interface StoredReading {
  id: string;
  spread_type: SpreadType;
  cards: TarotCard[];
  summary: string;
  question: string | null;
  created_at: string;
}

/** Última tirada gratuita del usuario (para mostrarla y calcular el cooldown). */
export async function fetchLastReading(
  userId: string,
): Promise<StoredReading | null> {
  const { data, error } = await supabase
    .from('tarot_readings')
    .select('id, spread_type, cards, interpretation, question, created_at')
    .eq('user_id', userId)
    .eq('is_premium_spread', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    spread_type: data.spread_type as SpreadType,
    cards: (data.cards as unknown as TarotCard[]) ?? [],
    summary: data.interpretation,
    question: data.question,
    created_at: data.created_at,
  };
}
