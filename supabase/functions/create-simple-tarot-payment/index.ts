// create-simple-tarot-payment — Pago puntual (1,99 €) de una tirada EXTRA del
// "Tarot simple" (gratuito), para saltar el cooldown de 24 h. NO requiere
// premium: basta con sesión iniciada (plan gratuito incluido).
//
// Crea un Stripe Checkout en modo `payment` (no suscripción). El webhook, al
// recibir checkout.session.completed con metadata.kind='simple_tarot_extra',
// inserta un crédito en simple_tarot_credits que la función de generación
// consumirá para permitir una tirada adicional inmediata.
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
  const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
  const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173';

  if (!stripeSecret) {
    return json({ error: 'Stripe no está configurado en el servidor' }, 500);
  }

  // --- Auth (basta sesión; NO se exige premium) ---------------------------
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return json({ error: 'Necesitas iniciar sesión' }, 401);

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  if (userError || !userData.user) return json({ error: 'Sesión no válida' }, 401);
  const user = userData.user;

  const stripe = new Stripe(stripeSecret);

  // Checkout de pago puntual. Sin gestionar customer: usamos customer_email
  // (puede no haber suscripción para usuarios gratuitos). El webhook concede el
  // crédito a partir de metadata.user_id.
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    ...(user.email ? { customer_email: user.email } : {}),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: 199, // 1,99 €
          product_data: {
            name: 'Tarot — tirada extra',
            description: 'Una tirada de tarot adicional, sin esperar 24 h.',
          },
        },
      },
    ],
    success_url: `${siteUrl}/tarot/simple?status=paid`,
    cancel_url: `${siteUrl}/tarot/simple?status=cancelled`,
    locale: 'es',
    metadata: { user_id: user.id, kind: 'simple_tarot_extra' },
    payment_intent_data: {
      metadata: { user_id: user.id, kind: 'simple_tarot_extra' },
    },
  });

  if (!session.url) {
    return json({ error: 'Stripe no devolvió URL de checkout' }, 500);
  }
  return json({ url: session.url });
});
