import { supabase } from '@/lib/supabase';

/**
 * Reúne todos los datos personales del usuario (RLS garantiza que solo los
 * suyos) y devuelve un objeto serializable para descarga (derecho de acceso /
 * portabilidad, RGPD art. 15 y 20).
 */
export async function collectMyData(userId: string, email: string) {
  const [profile, streak, tarot, natal, compat, consents, subscription] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('streaks').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('tarot_readings').select('*').eq('user_id', userId),
      supabase.from('natal_charts').select('*').eq('user_id', userId),
      supabase.from('compatibility_reports').select('*').eq('user_id', userId),
      supabase.from('legal_consents').select('*').eq('user_id', userId),
      supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(),
    ]);

  return {
    exported_at: new Date().toISOString(),
    account: { id: userId, email },
    profile: profile.data,
    streak: streak.data,
    subscription: subscription.data,
    tarot_readings: tarot.data ?? [],
    natal_charts: natal.data ?? [],
    compatibility_reports: compat.data ?? [],
    legal_consents: consents.data ?? [],
  };
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Solicita el borrado permanente de la cuenta. La eliminación real (incluido
 * auth.users y, en cascada, todos los datos) la realiza una Edge Function con
 * service_role, ya que el cliente no puede borrar usuarios de auth.
 */
export async function deleteMyAccount() {
  const { error } = await supabase.functions.invoke('delete-account', {
    method: 'POST',
  });
  if (error) throw error;
  await supabase.auth.signOut();
}
