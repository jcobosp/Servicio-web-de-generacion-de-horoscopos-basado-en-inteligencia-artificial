import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  createCompatibilityPayment,
  fetchCompatibilityHistory,
  fetchCompatibilityQuota,
  fetchCompatibilityReportById,
  generateCompatibility,
} from './api';
import type { CompatParams, CompatResponse } from './types';

/** Historial de sinastrías del usuario. */
export function useCompatibilityHistory() {
  const { user } = useAuth();
  const userId = user?.id;
  return useQuery({
    queryKey: ['compatibility-history', userId],
    enabled: Boolean(userId),
    staleTime: 1000 * 60,
    queryFn: () => fetchCompatibilityHistory(userId!),
  });
}

/** Carga un informe de compatibilidad concreto (al seleccionarlo en el historial). */
export function useCompatibilityReport(id: string | null) {
  return useQuery({
    queryKey: ['compatibility-report', id],
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 60,
    queryFn: () => fetchCompatibilityReportById(id!),
  });
}

/** Cuota del mes (generación incluida + créditos comprados). */
export function useCompatibilityQuota() {
  const { user } = useAuth();
  const userId = user?.id;
  return useQuery({
    queryKey: ['compatibility-quota', userId],
    enabled: Boolean(userId),
    staleTime: 1000 * 30,
    queryFn: () => fetchCompatibilityQuota(userId!),
  });
}

/** Mutación que genera (o recupera) la compatibilidad de una pareja. */
export function useGenerateCompatibility() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: CompatParams) => generateCompatibility(params),
    onSuccess: (res: CompatResponse) => {
      if (res.status === 'ok') {
        queryClient.invalidateQueries({ queryKey: ['compatibility-history', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['compatibility-quota', user?.id] });
      }
    },
  });
}

/** Inicia el pago puntual de 1,99 € y redirige a Stripe Checkout. */
export function useBuyCompatibilityCredit() {
  return useMutation({
    mutationFn: () => createCompatibilityPayment(),
    onSuccess: (url) => {
      window.location.assign(url);
    },
  });
}
