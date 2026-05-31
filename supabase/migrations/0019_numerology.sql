-- 0019_numerology.sql
-- NUMEROLOGÍA: una parte GRATUITA (estática) y una parte PREMIUM (Gemini).
--
-- GRATUITA: a partir de la fecha de nacimiento se calculan en el cliente el
-- "número del camino de vida" y el "año personal", y se muestran textos FIJOS
-- (sin IA) guardados en `numerology_meanings` (lectura pública), igual que la
-- compatibilidad gratuita (sign_compatibility).
--
-- PREMIUM: "Tu lectura numerológica personal", narrada por Gemini integrando los
-- números del usuario + un enfoque opcional. Cuota = 1 generación incluida por
-- mes natural + extras a 1,99 € (créditos), igual que el tarot avanzado.

-- ---------------------------------------------------------------------------
-- Significados estáticos (parte gratuita). Una fila por (categoría, número).
--   category: 'life_path' (1-9,11,22,33) | 'personal_year' (1-9)
--   content jsonb: { headline, essence, love, work, advice }
-- ---------------------------------------------------------------------------
create table if not exists public.numerology_meanings (
  category   text not null check (category in ('life_path', 'personal_year')),
  number     integer not null,
  content    jsonb not null,
  created_at timestamptz not null default now(),
  primary key (category, number)
);

-- Lectura pública (contenido no sensible, como sign_compatibility).
alter table public.numerology_meanings enable row level security;

create policy "numerology_meanings_public_read" on public.numerology_meanings
  for select using (true);

-- ---------------------------------------------------------------------------
-- Lecturas premium (Gemini). El historial se conserva (volumen mínimo).
--   billing: 'included' (cuota mensual) | 'paid' (crédito comprado)
--   numbers jsonb: números calculados del usuario
--   reading text: narrativa de Gemini (JSON serializado por secciones)
-- ---------------------------------------------------------------------------
create table if not exists public.numerology_readings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  billing    text not null default 'included' check (billing in ('included', 'paid')),
  numbers    jsonb not null,
  focus      text,
  reading    text not null,
  created_at timestamptz not null default now()
);

create index if not exists numerology_readings_user_idx
  on public.numerology_readings (user_id, created_at desc);

-- RLS: el usuario solo lee sus lecturas; la escritura es del service_role
-- (la Edge Function generate-numerology), que omite RLS.
alter table public.numerology_readings enable row level security;

create policy "numerology_readings_select_own" on public.numerology_readings
  for select to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Créditos comprados (pago puntual de 1,99 €). Una fila por compra.
-- ---------------------------------------------------------------------------
create table if not exists public.numerology_credits (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  stripe_session_id text unique,          -- idempotencia del webhook
  consumed_at       timestamptz,          -- null = crédito disponible
  created_at        timestamptz not null default now()
);

create index if not exists numerology_credits_user_idx
  on public.numerology_credits (user_id, consumed_at);

alter table public.numerology_credits enable row level security;

create policy "numerology_credits_select_own" on public.numerology_credits
  for select to authenticated using ((select auth.uid()) = user_id);
