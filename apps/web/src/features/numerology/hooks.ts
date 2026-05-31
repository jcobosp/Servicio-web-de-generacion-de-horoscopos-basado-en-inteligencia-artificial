import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  createNumerologyPayment,
  fetchFreeNumerology,
  fetchNumerologyHistory,
  fetchNumerologyQuota,
  generateNumerology,
} from './api';
import type { NumerologyResponse } from './types';

/** Numerología gratuita para una fecha (camino de vida + año personal). */
export function useFreeNumerology(isoDate: string | null) {
  return useQuery({
    queryKey: ['numerology-free', isoDate],
    enabled: Boolean(isoDate),
    staleTime: 1000 * 60 * 60,
    queryFn: () => fetchFreeNumerology(isoDate!),
  });
}

/** Historial de lecturas premium del usuario. */
export function useNumerologyHistory() {
  const { user } = useAuth();
  const userId = user?.id;
  return useQuery({
    queryKey: ['numerology-history', userId],
    enabled: Boolean(userId),
    staleTime: 1000 * 60,
    queryFn: () => fetchNumerologyHistory(userId!),
  });
}

/** Cuota del mes (lectura incluida + créditos comprados). */
export function useNumerologyQuota() {
  const { user } = useAuth();
  const userId = user?.id;
  return useQuery({
    queryKey: ['numerology-quota', userId],
    enabled: Boolean(userId),
    staleTime: 1000 * 30,
    queryFn: () => fetchNumerologyQuota(userId!),
  });
}

/** Mutación que genera una nueva lectura premium. */
export function useGenerateNumerology() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (focus: string) => generateNumerology(focus),
    onSuccess: (res: NumerologyResponse) => {
      if (res.status === 'ok') {
        queryClient.invalidateQueries({ queryKey: ['numerology-history', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['numerology-quota', user?.id] });
      }
    },
  });
}

/** Inicia el pago puntual de 1,99 € y redirige a Stripe Checkout. */
export function useBuyNumerologyCredit() {
  return useMutation({
    mutationFn: () => createNumerologyPayment(),
    onSuccess: (url) => {
      window.location.assign(url);
    },
  });
}
