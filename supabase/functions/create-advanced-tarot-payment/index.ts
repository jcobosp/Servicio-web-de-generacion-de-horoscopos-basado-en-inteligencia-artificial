// create-advanced-tarot-payment — Pago puntual (1,79 €) de una tirada EXTRA del
// "Tarot avanzado", para un TIPO concreto (Cruz Celta o Herradura). Solo para
// usuarios premium (la función incluye 1 tirada/mes de cada tipo; esto añade
// créditos sueltos del tipo comprado).
//
// Crea un Stripe Checkout en modo `payment` (no suscripción). El webhook, al
// recibir checkout.session.completed con metadata.kind='advanced_tarot_extra',
// inserta un crédito en advanced_tarot_credits (con su spread_type) que el
// usuario podrá consumir en ese mismo tipo de tirada.
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
const SPREAD_LABELS: Record<string, string> = {
  celtic_cross: 'Cruz Celta',
  horseshoe: 'Herradura',
};

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

  // --- Entrada: tipo de tirada --------------------------------------------
  let payload: { spread?: string };
  try { payload = await req.json(); } catch { payload = {}; }
  const spread = payload.spread === 'horseshoe' ? 'horseshoe' : 'celtic_cross';
  if (payload.spread !== 'celtic_cross' && payload.spread !== 'horseshoe') {
    return json({ error: 'spread inválido (celtic_cross|horseshoe)' }, 400);
  }
  const spreadLabel = SPREAD_LABELS[spread];

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
    return json({ error: 'El tarot avanzado es premium.' }, 403);
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
          unit_amount: 179, // 1,79 €
          product_data: {
            name: `Tarot avanzado — tirada extra de ${spreadLabel}`,
            description: `Una tirada adicional de ${spreadLabel} este mes.`,
          },
        },
      },
    ],
    success_url: `${siteUrl}/tarot/avanzado?status=paid&spread=${spread}`,
    cancel_url: `${siteUrl}/tarot/avanzado?status=cancelled`,
    locale: 'es',
    metadata: { user_id: user.id, kind: 'advanced_tarot_extra', spread },
    payment_intent_data: {
      metadata: { user_id: user.id, kind: 'advanced_tarot_extra', spread },
    },
  });

  if (!session.url) {
    return json({ error: 'Stripe no devolvió URL de checkout' }, 500);
  }
  return json({ url: session.url });
});
