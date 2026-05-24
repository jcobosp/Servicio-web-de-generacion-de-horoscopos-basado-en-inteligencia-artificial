import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/supabase';
import { useAuth } from '@/features/auth/AuthProvider';

export type Subscription = Tables<'subscriptions'>;

const ACTIVE_STATUSES = ['active', 'trialing'];

/**
 * Lee la suscripción del usuario. La gestión completa (Checkout, Portal,
 * webhook) llega en la Fase 8; por ahora basta con saber si hay un plan activo
 * para ocultar la publicidad a los usuarios premium.
 */
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
