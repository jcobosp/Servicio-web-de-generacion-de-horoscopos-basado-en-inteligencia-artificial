import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { drawTarot, fetchLastReading } from './api';
import type { SpreadType } from './types';

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

/** Última tirada gratuita del usuario. */
export function useLastReading() {
  const { user } = useAuth();
  const userId = user?.id;
  return useQuery({
    queryKey: ['tarot-last', userId],
    enabled: Boolean(userId),
    staleTime: 1000 * 60,
    queryFn: () => fetchLastReading(userId!),
  });
}

/** Mutación que ejecuta una nueva tirada. */
export function useDrawTarot() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { spread: SpreadType; question: string }) =>
      drawTarot(vars.spread, vars.question),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarot-last', user?.id] });
    },
  });
}

/** Momento (ISO) en que la próxima tirada gratuita estará disponible, o null. */
export function cooldownUntil(lastCreatedAt: string | undefined): number | null {
  if (!lastCreatedAt) return null;
  const next = new Date(lastCreatedAt).getTime() + COOLDOWN_MS;
  return next > Date.now() ? next : null;
}
