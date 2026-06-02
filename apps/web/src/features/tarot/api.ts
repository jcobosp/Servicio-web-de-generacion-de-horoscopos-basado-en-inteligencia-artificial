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

function rowToStored(row: {
  id: string;
  spread_type: string;
  cards: unknown;
  interpretation: string;
  question: string | null;
  created_at: string;
}): StoredReading {
  return {
    id: row.id,
    spread_type: row.spread_type as SpreadType,
    cards: (row.cards as unknown as TarotCard[]) ?? [],
    summary: row.interpretation,
    question: row.question,
    created_at: row.created_at,
  };
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
  return rowToStored(data);
}

/** Historial de tiradas simples del usuario (las más recientes primero). */
export async function fetchTarotHistory(
  userId: string,
): Promise<StoredReading[]> {
  const { data, error } = await supabase
    .from('tarot_readings')
    .select('id, spread_type, cards, interpretation, question, created_at')
    .eq('user_id', userId)
    .eq('is_premium_spread', false)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) throw error;
  return (data ?? []).map(rowToStored);
}

/** Nº de créditos de tirada extra disponibles (sin consumir). */
export async function fetchTarotCredits(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('simple_tarot_credits')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('consumed_at', null);
  if (error) throw error;
  return count ?? 0;
}

/** Inicia el pago puntual (1,99 €) de una tirada extra y devuelve la URL. */
export async function createSimpleTarotPayment(): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ url?: string; error?: string }>(
    'create-simple-tarot-payment',
    { body: {} },
  );
  if (error) throw error;
  if (!data?.url) throw new Error(data?.error ?? 'No se pudo iniciar el pago');
  return data.url;
}
