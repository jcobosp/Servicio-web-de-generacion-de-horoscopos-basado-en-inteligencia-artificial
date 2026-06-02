-- 0021_simple_tarot_credits.sql
-- Pago puntual del "Tarot simple" (gratuito): una tirada EXTRA por 1,99 € que
-- salta el cooldown de 24 h. A diferencia del tarot avanzado, NO requiere
-- premium: basta con tener sesión iniciada (plan gratuito incluido).
--
--   - El plan gratuito incluye 1 tirada cada 24 h (cooldown).
--   - Cuando estás en cooldown puedes comprar tiradas extra sueltas a 1,99 €
--     (pago puntual de Stripe), tantas como quieras. Cada pago concede 1 crédito
--     que la función `generate-tarot-reading` consume para permitir una tirada
--     adicional inmediata (queda marcada con billing='paid').
--
-- Las tiradas gratuitas siguen guardándose con billing='included' (por defecto),
-- que es lo único que cuenta para el cooldown de 24 h.

create table if not exists public.simple_tarot_credits (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  stripe_session_id text unique,          -- idempotencia del webhook
  consumed_at       timestamptz,          -- null = crédito disponible
  created_at        timestamptz not null default now()
);

create index if not exists simple_tarot_credits_user_idx
  on public.simple_tarot_credits (user_id, consumed_at);

-- RLS: el usuario solo lee sus créditos; la escritura es del service_role
-- (webhook de Stripe y función de generación), que omite RLS.
alter table public.simple_tarot_credits enable row level security;

create policy "simple_tarot_credits_select_own" on public.simple_tarot_credits
  for select to authenticated using ((select auth.uid()) = user_id);
