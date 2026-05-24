import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { NatalChart, NatalInterpretation, NatalParams, NatalResponse, Placement } from './types';

/**
 * Invoca la generación de la carta natal básica. La función puede responder con
 * códigos != 200 (p.ej. 400 `missing_data`); en ese caso parseamos el cuerpo en
 * vez de tratarlo como error genérico (mismo patrón que el tarot).
 */
export async function generateNatalChart(params: NatalParams): Promise<NatalResponse> {
  const { data, error } = await supabase.functions.invoke<NatalResponse>(
    'generate-natal-chart',
    { body: params },
  );

  if (error) {
    if (error instanceof FunctionsHttpError) {
      try {
        const parsed = await error.context.json();
        if (parsed && typeof parsed.status === 'string') {
          return parsed as NatalResponse;
        }
      } catch {
        // cae al throw
      }
    }
    throw error;
  }
  if (!data) throw new Error('Respuesta vacía de generate-natal-chart');
  return data;
}

interface StoredPlanets {
  sun: Placement;
  moon: Placement;
  moon_approximate: boolean;
}
interface StoredHouses {
  ascendant: Placement | null;
  place: string | null;
}

/** Carta natal básica guardada del usuario (para mostrarla al entrar). */
export async function fetchNatalChart(userId: string): Promise<NatalChart | null> {
  const { data, error } = await supabase
    .from('natal_charts')
    .select('planets, houses, interpretation, created_at')
    .eq('user_id', userId)
    .eq('is_full', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const planets = data.planets as unknown as StoredPlanets;
  const houses = data.houses as unknown as StoredHouses;
  let interpretation: NatalInterpretation;
  try {
    interpretation = JSON.parse(data.interpretation) as NatalInterpretation;
  } catch {
    return null;
  }

  return {
    sun: planets.sun,
    moon: planets.moon,
    ascendant: houses?.ascendant ?? null,
    moon_approximate: planets.moon_approximate,
    has_time: !planets.moon_approximate,
    place: houses?.place ?? null,
    interpretation,
    created_at: data.created_at,
  };
}
