import { supabase } from '@/lib/supabase';
import { LEGAL_VERSION } from './company';

/**
 * Registra la elección de cookies en `legal_consents` para dejar prueba del
 * consentimiento (RGPD art. 7.1 — acreditación).
 *
 * Solo se persiste para usuarios autenticados: la RLS de `legal_consents` exige
 * `auth.uid() = user_id`, y un visitante anónimo no tiene sesión. Para los
 * anónimos la prueba vive únicamente en la cookie `cookie-consent`; cuando ese
 * usuario inicie sesión y vuelva a tocar sus preferencias, quedará registrado.
 *
 * El hash de IP real requiere ver la cabecera del cliente desde una Edge
 * Function (misma limitación que el alta, ver migración 0007); aquí se marca
 * `captured-client-side`.
 */
export async function recordCookieConsents(choice: {
  analytics: boolean;
  marketing: boolean;
}): Promise<void> {
  const { data, error: authError } = await supabase.auth.getUser();
  if (authError || !data.user) return; // anónimo: solo cookie

  const userId = data.user.id;
  const userAgent =
    typeof navigator !== 'undefined' ? navigator.userAgent : null;

  await supabase.from('legal_consents').insert([
    {
      user_id: userId,
      consent_type: 'cookies_analytics',
      version: LEGAL_VERSION,
      granted: choice.analytics,
      ip_hash: 'captured-client-side',
      user_agent: userAgent,
    },
    {
      user_id: userId,
      consent_type: 'cookies_marketing',
      version: LEGAL_VERSION,
      granted: choice.marketing,
      ip_hash: 'captured-client-side',
      user_agent: userAgent,
    },
  ]);
}
