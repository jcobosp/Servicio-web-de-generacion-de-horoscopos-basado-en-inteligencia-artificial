import { supabase } from '@/lib/supabase';
import type { Area, HoroscopeResponse, Scope } from './types';
import type { ZodiacSign } from '@/lib/zodiac';

interface FetchArgs {
  sun_sign: ZodiacSign;
  scope: Scope;
  area: Area;
  /** Fecha opcional (YYYY-MM-DD). Por defecto, hoy en el servidor (Madrid). */
  date?: string;
}

/**
 * Invoca la Edge Function `generate-horoscope`. La función es pública
 * (verify_jwt=false): funciona con o sin sesión. La cache compartida por signo
 * vive en el servidor; aquí solo solicitamos y mostramos.
 */
export async function fetchHoroscope(args: FetchArgs): Promise<HoroscopeResponse> {
  const { data, error } = await supabase.functions.invoke<HoroscopeResponse>(
    'generate-horoscope',
    { body: args },
  );
  if (error) throw error;
  if (!data) throw new Error('Respuesta vacía de generate-horoscope');
  return data;
}
