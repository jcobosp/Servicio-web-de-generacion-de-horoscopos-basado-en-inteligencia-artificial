import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  createSimpleTarotPayment,
  drawTarot,
  fetchLastReading,
  fetchTarotCredits,
  fetchTarotHistory,
} from './api';
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

/** Historial de tiradas simples del usuario (requiere sesión). */
export function useTarotHistory() {
  const { user } = useAuth();
  const userId = user?.id;
  return useQuery({
    queryKey: ['tarot-history', userId],
    enabled: Boolean(userId),
    staleTime: 1000 * 60,
    queryFn: () => fetchTarotHistory(userId!),
  });
}

/** Créditos de tirada extra disponibles (sin consumir). */
export function useTarotCredits() {
  const { user } = useAuth();
  const userId = user?.id;
  return useQuery({
    queryKey: ['tarot-credits', userId],
    enabled: Boolean(userId),
    staleTime: 1000 * 30,
    queryFn: () => fetchTarotCredits(userId!),
  });
}

/** Inicia el pago puntual (1,99 €) de una tirada extra y redirige a Stripe. */
export function useBuySimpleTarotCredit() {
  return useMutation({
    mutationFn: () => createSimpleTarotPayment(),
    onSuccess: (url) => {
      window.location.assign(url);
    },
  });
}

/** Mutación que ejecuta una nueva tirada. */
export function useDrawTarot() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { spread: SpreadType; question: string }) =>
      drawTarot(vars.spread, vars.question),
    onSuccess: (res) => {
      if (res.status === 'ok') {
        queryClient.invalidateQueries({ queryKey: ['tarot-last', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['tarot-history', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['tarot-credits', user?.id] });
      }
    },
  });
}

/** Momento (ISO) en que la próxima tirada gratuita estará disponible, o null. */
export function cooldownUntil(lastCreatedAt: string | undefined): number | null {
  if (!lastCreatedAt) return null;
  const next = new Date(lastCreatedAt).getTime() + COOLDOWN_MS;
  return next > Date.now() ? next : null;
}
