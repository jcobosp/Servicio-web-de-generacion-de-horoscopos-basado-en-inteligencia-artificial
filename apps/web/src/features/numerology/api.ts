import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import {
  lifePathNumber,
  personalYearNumber,
} from './calc';
import type {
  FreeNumerology,
  NumerologyMeaning,
  NumerologyQuota,
  NumerologyResponse,
  StoredNumerologyReading,
} from './types';

/** Lee un significado estático concreto (lectura pública). */
async function fetchMeaning(
  category: 'life_path' | 'personal_year',
  number: number,
): Promise<NumerologyMeaning | null> {
  const { data, error } = await supabase
    .from('numerology_meanings')
    .select('content')
    .eq('category', category)
    .eq('number', number)
    .maybeSingle();
  if (error) throw error;
  return (data?.content as unknown as NumerologyMeaning) ?? null;
}

/**
 * Numerología gratuita: calcula camino de vida + año personal a partir de la
 * fecha y devuelve sus textos fijos de la BBDD.
 */
export async function fetchFreeNumerology(isoDate: string): Promise<FreeNumerology> {
  const year = new Date().getFullYear();
  const lifePath = lifePathNumber(isoDate);
  const personalYear = personalYearNumber(isoDate, year);

  const [lifePathMeaning, personalYearMeaning] = await Promise.all([
    fetchMeaning('life_path', lifePath),
    fetchMeaning('personal_year', personalYear),
  ]);

  return { lifePath, personalYear, year, lifePathMeaning, personalYearMeaning };
}

/**
 * Lanza la generación premium. Igual que el resto de funciones premium,
 * parseamos los cuerpos != 200 (402 `payment_required`, 403 `forbidden`,
 * 400 `missing_data`) en vez de tratarlos como error genérico.
 */
export async function generateNumerology(focus: string): Promise<NumerologyResponse> {
  const body = { focus: focus.trim() || undefined };
  const { data, error } = await supabase.functions.invoke<NumerologyResponse>(
    'generate-numerology',
    { body },
  );

  if (error) {
    if (error instanceof FunctionsHttpError) {
      try {
        const parsed = await error.context.json();
        if (parsed && typeof parsed.status === 'string') {
          return parsed as NumerologyResponse;
        }
      } catch {
        // cae al throw
      }
    }
    throw error;
  }
  if (!data) throw new Error('Respuesta vacía de generate-numerology');
  return data;
}

/** Historial de lecturas premium del usuario (lectura propia vía RLS). */
export async function fetchNumerologyHistory(
  userId: string,
): Promise<StoredNumerologyReading[]> {
  const { data, error } = await supabase
    .from('numerology_readings')
    .select('id, numbers, focus, reading, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []).map((row) => {
    let content: StoredNumerologyReading['content'];
    try {
      content = JSON.parse(row.reading);
    } catch {
      content = {
        headline: '',
        portrait: '',
        purpose: '',
        strengths: '',
        cycle: '',
        love: '',
        advice: '',
      };
    }
    return {
      id: row.id,
      numbers: row.numbers as unknown as StoredNumerologyReading['numbers'],
      focus: row.focus,
      content,
      created_at: row.created_at,
    };
  });
}

/** Cuota del usuario para el mes en curso (lectura propia vía RLS). */
export async function fetchNumerologyQuota(userId: string): Promise<NumerologyQuota> {
  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  ).toISOString();

  const [included, credits] = await Promise.all([
    supabase
      .from('numerology_readings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('billing', 'included')
      .gte('created_at', monthStart),
    supabase
      .from('numerology_credits')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('consumed_at', null),
  ]);

  if (included.error) throw included.error;
  if (credits.error) throw credits.error;

  return {
    includedUsed: (included.count ?? 0) >= 1,
    credits: credits.count ?? 0,
  };
}

/** Inicia el pago puntual de una lectura extra (1,99 €). Devuelve la URL. */
export async function createNumerologyPayment(): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ url?: string; error?: string }>(
    'create-numerology-payment',
    { body: {} },
  );
  if (error) throw error;
  if (!data?.url) throw new Error(data?.error ?? 'No se pudo iniciar el pago');
  return data.url;
}
