import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  fetchCurrentReport,
  fetchReportById,
  fetchReportHistory,
  generateReport,
} from './api';
import type { ReportKind, ReportParams, ReportResponse } from './types';

/** Informe del periodo en curso del usuario (si ya se generó). */
export function useCurrentReport(kind: ReportKind) {
  const { user } = useAuth();
  const userId = user?.id;
  return useQuery({
    queryKey: ['report', kind, 'current', userId],
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 30,
    queryFn: () => fetchCurrentReport(userId!, kind),
  });
}

/** Historial de informes del usuario para un tipo. */
export function useReportHistory(kind: ReportKind) {
  const { user } = useAuth();
  const userId = user?.id;
  return useQuery({
    queryKey: ['report', kind, 'history', userId],
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 30,
    queryFn: () => fetchReportHistory(userId!, kind),
  });
}

/** Carga un informe concreto del historial por id. */
export function useReportById(id: string | null) {
  return useQuery({
    queryKey: ['report', 'by-id', id],
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 30,
    queryFn: () => fetchReportById(id!),
  });
}

/** Mutación que genera (o reutiliza) el informe del periodo en curso. */
export function useGenerateReport(kind: ReportKind) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: ReportParams) => generateReport(params),
    onSuccess: (res: ReportResponse) => {
      if (res.status === 'ok') {
        queryClient.setQueryData(['report', kind, 'current', user?.id], res.report);
        queryClient.invalidateQueries({ queryKey: ['report', kind, 'history', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      }
    },
  });
}
