import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/supabase';
import { useAuth } from '@/features/auth/AuthProvider';
import { toast } from '@/components/ui/Toast';

export type Streak = Tables<'streaks'>;

/** Mensajes de microcelebración por hito (MARKETING_STRATEGY §7). */
export const STREAK_MILESTONES: Record<number, string> = {
  3: '3 días contigo. Empiezas a ver patrones. ✨',
  7: 'Una semana completa. Tus estrellas te están leyendo de vuelta. 🌟',
  14: '14 días. Llevas una práctica. 🔥',
  30: '30 días. Esto ya es tuyo. 👑',
};

export function useStreak() {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ['streak', userId],
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<Streak | null> => {
      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Registra la visita diaria del usuario autenticado vía la RPC
 * `increment_streak` (idempotente por día). Al subir la racha, refresca la
 * query y, si se alcanza un hito, lanza un toast de celebración.
 */
export function useRegisterVisit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('increment_streak');
      if (error) throw error;
    },
    onSuccess: async () => {
      const prev = queryClient.getQueryData<Streak | null>(['streak', user?.id]);
      const { data } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (!data) return;
      queryClient.setQueryData(['streak', user?.id], data);

      const reached = data.current_streak;
      const before = prev?.current_streak ?? 0;
      if (reached > before && STREAK_MILESTONES[reached]) {
        toast.success(STREAK_MILESTONES[reached]);
      }
    },
  });
}
