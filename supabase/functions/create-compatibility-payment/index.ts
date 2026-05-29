// create-compatibility-payment — Pago puntual (1,99 €) de una generación EXTRA
// de "Compatibilidad avanzada". Solo para usuarios premium (la función incluye
// 1 generación/mes; esto añade créditos sueltos).
//
// Crea un Stripe Checkout en modo `payment` (no suscripción). El webhook, al
// recibir checkout.session.completed con metadata.kind='compatibility_extra',
// inserta un crédito en compatibility_credits que el usuario podrá consumir.
//
// Respuesta: { url: string }

import { createClient } from 'jsr:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@^17.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ACTIVE_STATUSES = ['active', 'trialing'];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
  const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173';

  if (!stripeSecret) {
    return json({ error: 'Stripe no está configurado en el servidor' }, 500);
  }

  // --- Auth ---------------------------------------------------------------
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return json({ error: 'Missing token' }, 401);

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  if (userError || !userData.user) return json({ error: 'Invalid token' }, 401);
  const user = userData.user;

  // --- Premium + customer -------------------------------------------------
  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data: sub } = await admin
    .from('subscriptions')
    .select('stripe_customer_id, status')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!sub || !ACTIVE_STATUSES.includes(sub.status)) {
    return json({ error: 'La compatibilidad avanzada es premium.' }, 403);
  }

  const stripe = new Stripe(stripeSecret);

  let customerId = sub.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await admin
      .from('subscriptions')
      .update({ stripe_customer_id: customerId })
      .eq('user_id', user.id);
  }

  // --- Checkout (pago puntual) --------------------------------------------
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: 199, // 1,99 €
          product_data: {
            name: 'Compatibilidad avanzada — generación extra',
            description: 'Una generación adicional de compatibilidad este mes.',
          },
        },
      },
    ],
    success_url: `${siteUrl}/compatibilidad/avanzada?status=paid`,
    cancel_url: `${siteUrl}/compatibilidad/avanzada?status=cancelled`,
    locale: 'es',
    metadata: { user_id: user.id, kind: 'compatibility_extra' },
    payment_intent_data: {
      metadata: { user_id: user.id, kind: 'compatibility_extra' },
    },
  });

  if (!session.url) {
    return json({ error: 'Stripe no devolvió URL de checkout' }, 500);
  }
  return json({ url: session.url });
});
