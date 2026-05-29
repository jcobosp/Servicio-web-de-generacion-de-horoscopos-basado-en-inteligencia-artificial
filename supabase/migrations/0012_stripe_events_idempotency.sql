-- 0012 — Idempotencia de eventos de Stripe.
-- El webhook de Stripe puede reenviar el mismo evento (reintentos, replays).
-- Esta tabla almacena los event.id ya procesados para descartar duplicados.
-- Solo se escribe vía service_role desde la Edge Function `stripe-webhook`.

create table public.stripe_events (
  id          text primary key,
  type        text not null,
  received_at timestamptz not null default now()
);

comment on table public.stripe_events is
  'Eventos de Stripe ya procesados (idempotencia del webhook).';

-- RLS activado sin políticas: nadie puede leerlo desde el cliente.
-- Las inserciones las hace la Edge Function con service_role (omite RLS).
alter table public.stripe_events enable row level security;

create index stripe_events_received_at_idx
  on public.stripe_events (received_at desc);
