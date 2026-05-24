import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { DailyEnergyResponse } from './types';
import type { ZodiacSign } from '@/lib/zodiac';

async function fetchDailyEnergy(sign: ZodiacSign): Promise<DailyEnergyResponse> {
  const { data, error } = await supabase.functions.invoke<DailyEnergyResponse>(
    'generate-daily-energy',
    { body: { sun_sign: sign } },
  );
  if (error) throw error;
  if (!data) throw new Error('Respuesta vacía de generate-daily-energy');
  return data;
}

/** Energía del día de un signo. Una fila por (signo, fecha), compartida. */
export function useDailyEnergy(sign: ZodiacSign | null) {
  return useQuery({
    queryKey: ['daily-energy', sign],
    enabled: Boolean(sign),
    staleTime: 1000 * 60 * 30,
    retry: 1,
    queryFn: () => fetchDailyEnergy(sign!),
  });
}
