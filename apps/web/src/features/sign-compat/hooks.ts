import { useQuery } from '@tanstack/react-query';
import type { ZodiacSign } from '@/lib/zodiac';
import { fetchSignCompatibility } from './api';

/** Compatibilidad estática entre dos signos (contenido permanente de la BBDD). */
export function useSignCompatibility(a: ZodiacSign | null, b: ZodiacSign | null) {
  return useQuery({
    queryKey: ['sign-compat', a, b],
    enabled: Boolean(a && b),
    staleTime: Infinity, // contenido estático: no cambia nunca
    gcTime: Infinity,
    queryFn: () => fetchSignCompatibility(a!, b!),
  });
}
