-- 0014_compatibility_credits.sql
-- Modelo de cuota de la "Compatibilidad avanzada" (premium):
--   - Cada usuario premium tiene 1 generación INCLUIDA por mes natural.
--   - Generaciones extra dentro del mismo mes se compran a 1,99 € (pago puntual
--     de Stripe). Cada pago concede 1 crédito; cada generación nueva consume
--     una unidad de cuota (la incluida del mes o un crédito comprado).
--
-- Marcamos cada informe con su origen (`billing`) y guardamos los créditos
-- comprados en una tabla aparte que el webhook de Stripe rellena.

-- Origen de cada informe: 'included' (cuota mensual) o 'paid' (crédito comprado).
alter table public.compatibility_reports
  add column if not exists billing text not null default 'included'
  check (billing in ('included', 'paid'));

-- Créditos comprados (pago puntual de 1,99 €). Una fila por compra.
create table if not exists public.compatibility_credits (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  stripe_session_id text unique,          -- idempotencia del webhook
  consumed_at       timestamptz,          -- null = crédito disponible
  created_at        timestamptz not null default now()
);

create index if not exists compatibility_credits_user_idx
  on public.compatibility_credits (user_id, consumed_at);

-- RLS: el usuario solo lee sus créditos; la escritura es del service_role
-- (webhook de Stripe y función de generación), que omite RLS.
alter table public.compatibility_credits enable row level security;

create policy "compatibility_credits_select_own" on public.compatibility_credits
  for select to authenticated using ((select auth.uid()) = user_id);
