import { supabase } from '@/lib/supabase';

export type BillingPlan = 'monthly' | 'annual';

interface SessionResponse {
  url: string;
}

/**
 * Inicia un Stripe Checkout para el plan elegido. La Edge Function valida la
 * sesión del usuario a partir del JWT del cliente y crea (o reutiliza) un
 * customer de Stripe. Devuelve la URL hosted a la que hay que redirigir.
 */
export async function createCheckoutSession(plan: BillingPlan): Promise<string> {
  const { data, error } = await supabase.functions.invoke<SessionResponse>(
    'create-checkout-session',
    { body: { plan } },
  );
  if (error) throw error;
  if (!data?.url) throw new Error('No se pudo iniciar el pago.');
  return data.url;
}

/**
 * Abre el Customer Portal de Stripe (cambiar de plan, ver facturas, cancelar).
 * Requiere que el usuario tenga ya un stripe_customer_id asociado.
 */
export async function createPortalSession(): Promise<string> {
  const { data, error } = await supabase.functions.invoke<SessionResponse>(
    'create-portal-session',
    { body: {} },
  );
  if (error) throw error;
  if (!data?.url) throw new Error('No se pudo abrir el portal de gestión.');
  return data.url;
}
