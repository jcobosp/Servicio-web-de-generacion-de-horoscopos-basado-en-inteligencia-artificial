// create-checkout-session — Inicia un Stripe Checkout para suscribirse a
// Zodiaq Premium. Requiere usuario autenticado: el JWT viaja en `Authorization`
// y se valida contra Supabase Auth antes de crear la sesión.
//
// Body: { plan: 'monthly' | 'annual' }
// Respuesta: { url: string }
//
// Reutiliza el `stripe_customer_id` si el usuario ya lo tiene en
// `subscriptions`; en caso contrario crea el customer y guarda una fila
// placeholder (status='incomplete') para no perder la asociación si el
// webhook llega antes que un retorno a la app.

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
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
  const priceMonthly = Deno.env.get('STRIPE_PRICE_MONTHLY');
  const priceAnnual = Deno.env.get('STRIPE_PRICE_ANNUAL');
  const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173';

  if (!stripeSecret || !priceMonthly || !priceAnnual) {
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

  // --- Body ---------------------------------------------------------------
  let plan: string;
  try {
    const body = (await req.json()) as { plan?: string };
    plan = body.plan ?? '';
  } catch {
    return json({ error: 'Invalid body' }, 400);
  }
  if (plan !== 'monthly' && plan !== 'annual') {
    return json({ error: 'Plan no válido (monthly|annual)' }, 400);
  }
  const priceId = plan === 'monthly' ? priceMonthly : priceAnnual;

  // --- Customer Stripe ----------------------------------------------------
  const admin = createClient(supabaseUrl, serviceRoleKey);
  const stripe = new Stripe(stripeSecret);

  const { data: existing } = await admin
    .from('subscriptions')
    .select('stripe_customer_id, status')
    .eq('user_id', user.id)
    .maybeSingle();

  // Bloquea checkout si ya hay una suscripción activa/en periodo de prueba.
  if (existing && ['active', 'trialing'].includes(existing.status)) {
    return json(
      { error: 'Ya tienes una suscripción activa.' },
      409,
    );
  }

  let customerId = existing?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;

    // Placeholder en `subscriptions` para asociar customer → user antes incluso
    // del primer pago. El webhook actualizará el resto de campos al cobrar.
    await admin.from('subscriptions').upsert(
      {
        user_id: user.id,
        stripe_customer_id: customerId,
        status: 'incomplete',
      },
      { onConflict: 'user_id' },
    );
  }

  // --- Checkout Session ---------------------------------------------------
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/perfil/suscripcion?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/premium?status=cancelled`,
    allow_promotion_codes: true,
    locale: 'es',
    subscription_data: {
      metadata: { user_id: user.id, plan },
    },
    metadata: { user_id: user.id, plan },
  });

  if (!session.url) {
    return json({ error: 'Stripe no devolvió URL de checkout' }, 500);
  }
  return json({ url: session.url });
});
