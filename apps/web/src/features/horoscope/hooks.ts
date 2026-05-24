import { useQuery } from '@tanstack/react-query';
import { fetchHoroscope } from './api';
import type { Area, Scope } from './types';
import type { ZodiacSign } from '@/lib/zodiac';

/**
 * Obtiene el horóscopo de un signo/scope/área. La generación y la cache ocurren
 * en el servidor; aquí cacheamos en cliente durante la sesión para no repetir
 * llamadas al cambiar de pestaña y volver.
 */
export function useHoroscope(
  sign: ZodiacSign | null,
  scope: Scope,
  area: Area,
) {
  return useQuery({
    queryKey: ['horoscope', scope, sign, area],
    enabled: Boolean(sign),
    staleTime: 1000 * 60 * 30,
    retry: 1,
    queryFn: () => fetchHoroscope({ sun_sign: sign!, scope, area }),
  });
}
