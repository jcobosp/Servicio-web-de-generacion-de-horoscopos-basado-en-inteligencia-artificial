import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { CompatParams, CompatQuota, CompatReport, CompatResponse } from './types';

/**
 * Invoca la generación de la compatibilidad. Como el resto de funciones
 * premium, parseamos los cuerpos con código != 200 (403 `forbidden`,
 * 400 `missing_data`) en vez de tratarlos como error genérico.
 */
export async function generateCompatibility(params: CompatParams): Promise<CompatResponse> {
  const { data, error } = await supabase.functions.invoke<CompatResponse>(
    'generate-compatibility',
    { body: params },
  );

  if (error) {
    if (error instanceof FunctionsHttpError) {
      try {
        const parsed = await error.context.json();
        if (parsed && typeof parsed.status === 'string') {
          return parsed as CompatResponse;
        }
      } catch {
        // cae al throw
      }
    }
    throw error;
  }
  if (!data) throw new Error('Respuesta vacía de generate-compatibility');
  return data;
}

/** Resumen de una sinastría guardada (para el historial). */
export interface CompatHistoryItem {
  id: string;
  label_a: string;
  label_b: string;
  score: number;
  created_at: string;
}

/** Historial de sinastrías del usuario (lectura propia vía RLS). */
export async function fetchCompatibilityHistory(userId: string): Promise<CompatHistoryItem[]> {
  const { data, error } = await supabase
    .from('compatibility_reports')
    .select('id, person_a_label, person_b_label, score, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    label_a: r.person_a_label,
    label_b: r.person_b_label,
    score: r.score,
    created_at: r.created_at,
  }));
}

interface StoredPerson {
  placements: CompatReport['placements_a'];
}

/** Carga un informe de compatibilidad concreto del usuario (lectura propia). */
export async function fetchCompatibilityReportById(id: string): Promise<CompatReport | null> {
  const { data, error } = await supabase
    .from('compatibility_reports')
    .select('person_a, person_b, person_a_label, person_b_label, score, report, created_at')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  let parsed: { interpretation: CompatReport['interpretation']; aspects: CompatReport['aspects'] };
  try {
    parsed = JSON.parse(data.report);
  } catch {
    return null;
  }
  const pa = data.person_a as unknown as StoredPerson;
  const pb = data.person_b as unknown as StoredPerson;

  return {
    label_a: data.person_a_label,
    label_b: data.person_b_label,
    score: data.score,
    placements_a: pa.placements,
    placements_b: pb.placements,
    aspects: parsed.aspects,
    interpretation: parsed.interpretation,
    created_at: data.created_at,
  };
}

/** Cuota del usuario para el mes en curso (lectura propia vía RLS). */
export async function fetchCompatibilityQuota(userId: string): Promise<CompatQuota> {
  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  ).toISOString();

  const [included, credits] = await Promise.all([
    supabase
      .from('compatibility_reports')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('billing', 'included')
      .gte('created_at', monthStart),
    supabase
      .from('compatibility_credits')
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

/** Inicia el pago puntual de una generación extra (1,99 €). Devuelve la URL. */
export async function createCompatibilityPayment(): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ url?: string; error?: string }>(
    'create-compatibility-payment',
    { body: {} },
  );
  if (error) throw error;
  if (!data?.url) throw new Error(data?.error ?? 'No se pudo iniciar el pago');
  return data.url;
}

export type { CompatReport };
