import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { fetchNatalChart, generateNatalChart } from './api';
import type { NatalParams, NatalResponse } from './types';

/** Carta natal básica guardada del usuario (una por usuario, no caduca). */
export function useNatalChart() {
  const { user } = useAuth();
  const userId = user?.id;
  return useQuery({
    queryKey: ['natal-chart', userId],
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 60,
    queryFn: () => fetchNatalChart(userId!),
  });
}

/** Mutación que calcula (o recalcula) la carta natal básica. */
export function useGenerateNatalChart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: NatalParams) => generateNatalChart(params),
    onSuccess: (res: NatalResponse) => {
      if (res.status === 'ok') {
        queryClient.setQueryData(['natal-chart', user?.id], res.chart);
        // El perfil cambia (hora/lugar guardados): refrescar su cache.
        queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      }
    },
  });
}
