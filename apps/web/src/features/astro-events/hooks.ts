import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { AstroEventsResponse } from './types';

async function fetchAstroEvents(): Promise<AstroEventsResponse> {
  const { data, error } = await supabase.functions.invoke<AstroEventsResponse>(
    'generate-astro-events',
    { body: {} },
  );
  if (error) throw error;
  if (!data) throw new Error('Respuesta vacía de generate-astro-events');
  return data;
}

/** Eventos astrológicos del mes actual (lunas + ingresos). Cache compartida. */
export function useAstroEvents() {
  return useQuery({
    queryKey: ['astro-events'],
    staleTime: 1000 * 60 * 30,
    retry: 1,
    queryFn: fetchAstroEvents,
  });
}
