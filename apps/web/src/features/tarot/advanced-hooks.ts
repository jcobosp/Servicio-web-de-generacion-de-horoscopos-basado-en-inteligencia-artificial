import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  createAdvancedTarotPayment,
  drawAdvancedTarot,
  fetchAdvancedHistory,
  fetchAdvancedTarotQuota,
} from './advanced-api';
import type { AdvancedSpreadType } from './advanced-types';

/** Historial de tiradas avanzadas del usuario premium. */
export function useAdvancedHistory() {
  const { user } = useAuth();
  const userId = user?.id;
  return useQuery({
    queryKey: ['tarot-advanced-history', userId],
    enabled: Boolean(userId),
    staleTime: 1000 * 60,
    queryFn: () => fetchAdvancedHistory(userId!),
  });
}

/** Cuota del mes por tipo de tirada (incluida + créditos comprados). */
export function useAdvancedTarotQuota() {
  const { user } = useAuth();
  const userId = user?.id;
  return useQuery({
    queryKey: ['tarot-advanced-quota', userId],
    enabled: Boolean(userId),
    staleTime: 1000 * 30,
    queryFn: () => fetchAdvancedTarotQuota(userId!),
  });
}

/** Mutación que ejecuta una nueva tirada avanzada. */
export function useDrawAdvancedTarot() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { spread: AdvancedSpreadType; question: string }) =>
      drawAdvancedTarot(vars.spread, vars.question),
    onSuccess: (res) => {
      if (res.status === 'ok') {
        queryClient.invalidateQueries({
          queryKey: ['tarot-advanced-history', user?.id],
        });
        queryClient.invalidateQueries({
          queryKey: ['tarot-advanced-quota', user?.id],
        });
      }
    },
  });
}

/** Inicia el pago puntual de 1,79 € de una tirada extra y redirige a Stripe. */
export function useBuyAdvancedTarotCredit() {
  return useMutation({
    mutationFn: (spread: AdvancedSpreadType) => createAdvancedTarotPayment(spread),
    onSuccess: (url) => {
      window.location.assign(url);
    },
  });
}
