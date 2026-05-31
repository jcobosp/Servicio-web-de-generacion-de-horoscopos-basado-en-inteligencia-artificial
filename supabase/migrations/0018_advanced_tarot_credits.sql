-- 0018_advanced_tarot_credits.sql
-- Modelo de cuota del "Tarot avanzado" (premium), análogo a la compatibilidad
-- pero SEPARADO POR TIPO DE TIRADA:
--   - Cada usuario premium tiene 1 generación INCLUIDA por mes natural de CADA
--     tirada: 1 Cruz Celta + 1 Herradura.
--   - Generaciones extra de cada tirada dentro del mismo mes se compran a 1,79 €
--     (pago puntual de Stripe). Cada pago concede 1 crédito DEL TIPO comprado;
--     cada generación nueva consume la incluida del mes (de su tipo) o un crédito
--     de ese mismo tipo.
--
-- Marcamos cada tirada con su origen (`billing`) y guardamos los créditos
-- comprados en una tabla aparte que el webhook de Stripe rellena.

-- Origen de cada tirada: 'included' (cuota mensual) o 'paid' (crédito comprado).
-- Las tiradas gratuitas del tarot simple quedan como 'included' por defecto; no
-- se cuentan para esta cuota porque siempre se filtra por is_premium_spread=true.
alter table public.tarot_readings
  add column if not exists billing text not null default 'included'
  check (billing in ('included', 'paid'));

-- Créditos comprados (pago puntual de 1,79 €), ligados al tipo de tirada.
-- Una fila por compra.
create table if not exists public.advanced_tarot_credits (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  spread_type       text not null check (spread_type in ('celtic_cross', 'horseshoe')),
  stripe_session_id text unique,          -- idempotencia del webhook
  consumed_at       timestamptz,          -- null = crédito disponible
  created_at        timestamptz not null default now()
);

create index if not exists advanced_tarot_credits_user_idx
  on public.advanced_tarot_credits (user_id, spread_type, consumed_at);

-- RLS: el usuario solo lee sus créditos; la escritura es del service_role
-- (webhook de Stripe y función de generación), que omite RLS.
alter table public.advanced_tarot_credits enable row level security;

create policy "advanced_tarot_credits_select_own" on public.advanced_tarot_credits
  for select to authenticated using ((select auth.uid()) = user_id);
