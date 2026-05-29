import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/supabase';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  createCheckoutSession,
  createPortalSession,
  type BillingPlan,
} from './api';

export type Subscription = Tables<'subscriptions'>;

const ACTIVE_STATUSES = ['active', 'trialing'];

/** Suscripción del usuario actual (o null si no la tiene). */
export function useSubscription() {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ['subscription', userId],
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<Subscription | null> => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

/** ¿El usuario tiene un plan premium activo? (sin sesión → false). */
export function useIsPremium(): boolean {
  const { data } = useSubscription();
  return Boolean(data && ACTIVE_STATUSES.includes(data.status));
}

/**
 * Lanza Stripe Checkout para el plan indicado. En éxito redirige a la URL
 * hosted. Invalida la query de suscripción al volver para refrescar el estado.
 */
export function useStartCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (plan: BillingPlan) => createCheckoutSession(plan),
    onSuccess: (url) => {
      // Pre-invalida por si el webhook ya escribió antes del retorno.
      qc.invalidateQueries({ queryKey: ['subscription'] });
      window.location.assign(url);
    },
  });
}

/** Abre el Customer Portal y redirige a su URL. */
export function useOpenPortal() {
  return useMutation({
    mutationFn: () => createPortalSession(),
    onSuccess: (url) => {
      window.location.assign(url);
    },
  });
}
