// stripe-webhook — Recibe los eventos de Stripe y mantiene `subscriptions`
// sincronizada con la realidad de la cuenta.
//
// Eventos atendidos:
//   - checkout.session.completed       → primer pago confirmado
//   - customer.subscription.created    → suscripción dada de alta
//   - customer.subscription.updated    → cambios de plan / renovación / etc.
//   - customer.subscription.deleted    → cancelación efectiva
//   - invoice.payment_failed           → pasar a past_due
//
// Idempotencia: insertamos `event.id` en `stripe_events`. Si la inserción
// dispara una violación de PK, ese evento ya se procesó y se devuelve 200.
//
// La firma se verifica con `STRIPE_WEBHOOK_SECRET`. Sin firma válida, 400.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@^17.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function planFromPriceId(priceId: string | null | undefined): 'monthly' | 'annual' | null {
  if (!priceId) return null;
  if (priceId === Deno.env.get('STRIPE_PRICE_MONTHLY')) return 'monthly';
  if (priceId === Deno.env.get('STRIPE_PRICE_ANNUAL')) return 'annual';
  return null;
}

type SubStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'none';

function mapStatus(s: Stripe.Subscription.Status): SubStatus {
  switch (s) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trialing';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'canceled':
      return 'canceled';
    case 'incomplete':
    case 'incomplete_expired':
      return 'incomplete';
    default:
      return 'none';
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  if (!stripeSecret || !webhookSecret) {
    return new Response(JSON.stringify({ error: 'Stripe no configurado' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing signature' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const rawBody = await req.text();
  const stripe = new Stripe(stripeSecret);

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret,
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Invalid signature: ${(err as Error).message}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);

  // Idempotencia: si el evento ya está registrado, contestamos 200 sin reprocesar.
  const { error: insertEventError } = await admin
    .from('stripe_events')
    .insert({ id: event.id, type: event.type });
  if (insertEventError) {
    if (insertEventError.code === '23505') {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: insertEventError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // ----------------- Procesado por tipo -----------------------------------
  async function upsertFromSubscription(sub: Stripe.Subscription) {
    const customerId =
      typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

    // user_id viaja en metadata desde create-checkout-session.
    let userId = sub.metadata?.user_id ?? null;
    if (!userId) {
      // Fallback: localizar por customer_id en nuestra tabla.
      const { data: row } = await admin
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .maybeSingle();
      userId = row?.user_id ?? null;
    }
    if (!userId) {
      console.warn('webhook: sin user_id para customer', customerId);
      return;
    }

    const item = sub.items.data[0];
    const priceId = item?.price?.id ?? null;
    const plan = planFromPriceId(priceId);
    const periodEnd =
      (item?.current_period_end ?? (sub as unknown as { current_period_end?: number }).current_period_end) ?? null;

    await admin.from('subscriptions').upsert(
      {
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
        status: mapStatus(sub.status),
        plan,
        current_period_end: periodEnd
          ? new Date(periodEnd * 1000).toISOString()
          : null,
        cancel_at_period_end: Boolean(sub.cancel_at_period_end),
      },
      { onConflict: 'user_id' },
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
          const subId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          // Inyecta el user_id del session.metadata si Stripe aún no lo propagó.
          if (!sub.metadata?.user_id && session.metadata?.user_id) {
            sub.metadata = { ...sub.metadata, user_id: session.metadata.user_id };
          }
          await upsertFromSubscription(sub);
        } else if (
          session.mode === 'payment' &&
          session.metadata?.kind === 'compatibility_extra' &&
          session.payment_status === 'paid'
        ) {
          // Pago puntual de una generación extra de Compatibilidad avanzada:
          // concede un crédito. Idempotente por `stripe_session_id` (único).
          const buyerId = session.metadata.user_id;
          if (buyerId) {
            const { error: creditErr } = await admin
              .from('compatibility_credits')
              .insert({ user_id: buyerId, stripe_session_id: session.id });
            // 23505 = ya concedido (reintento del webhook): no es error.
            if (creditErr && creditErr.code !== '23505') {
              throw new Error(creditErr.message);
            }
          }
        } else if (
          session.mode === 'payment' &&
          session.metadata?.kind === 'advanced_tarot_extra' &&
          session.payment_status === 'paid'
        ) {
          // Pago puntual de una tirada extra del Tarot avanzado: concede un
          // crédito DEL TIPO comprado. Idempotente por `stripe_session_id`.
          const buyerId = session.metadata.user_id;
          const spread =
            session.metadata.spread === 'horseshoe' ? 'horseshoe' : 'celtic_cross';
          if (buyerId) {
            const { error: creditErr } = await admin
              .from('advanced_tarot_credits')
              .insert({
                user_id: buyerId,
                spread_type: spread,
                stripe_session_id: session.id,
              });
            // 23505 = ya concedido (reintento del webhook): no es error.
            if (creditErr && creditErr.code !== '23505') {
              throw new Error(creditErr.message);
            }
          }
        } else if (
          session.mode === 'payment' &&
          session.metadata?.kind === 'simple_tarot_extra' &&
          session.payment_status === 'paid'
        ) {
          // Pago puntual de una tirada extra del Tarot simple (gratuito):
          // concede un crédito. Idempotente por `stripe_session_id` (único).
          const buyerId = session.metadata.user_id;
          if (buyerId) {
            const { error: creditErr } = await admin
              .from('simple_tarot_credits')
              .insert({ user_id: buyerId, stripe_session_id: session.id });
            // 23505 = ya concedido (reintento del webhook): no es error.
            if (creditErr && creditErr.code !== '23505') {
              throw new Error(creditErr.message);
            }
          }
        } else if (
          session.mode === 'payment' &&
          session.metadata?.kind === 'numerology_extra' &&
          session.payment_status === 'paid'
        ) {
          // Pago puntual de una lectura extra de Numerología personal: concede
          // un crédito. Idempotente por `stripe_session_id` (único).
          const buyerId = session.metadata.user_id;
          if (buyerId) {
            const { error: creditErr } = await admin
              .from('numerology_credits')
              .insert({ user_id: buyerId, stripe_session_id: session.id });
            // 23505 = ya concedido (reintento del webhook): no es error.
            if (creditErr && creditErr.code !== '23505') {
              throw new Error(creditErr.message);
            }
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await upsertFromSubscription(sub);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id;
        if (customerId) {
          await admin
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_customer_id', customerId);
        }
        break;
      }

      default:
        // Otros eventos: simplemente ya quedaron registrados en stripe_events.
        break;
    }
  } catch (err) {
    console.error('webhook handler error', event.type, err);
    return new Response(
      JSON.stringify({ error: `Handler failed: ${(err as Error).message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
