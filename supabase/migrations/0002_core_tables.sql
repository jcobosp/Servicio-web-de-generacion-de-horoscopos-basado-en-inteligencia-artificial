-- 0002 — Tablas principales, triggers de updated_at e índices.

-- ---------------------------------------------------------------------------
-- profiles: perfil de usuario. 1 fila por usuario, creada por trigger.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  display_name    text not null,
  birth_date      date not null,
  sun_sign        text not null check (sun_sign in (
                    'aries','tauro','geminis','cancer','leo','virgo',
                    'libra','escorpio','sagitario','capricornio','acuario','piscis')),
  birth_time      bytea,        -- cifrado a nivel de aplicación (pgp_sym_encrypt)
  birth_place     bytea,        -- cifrado
  birth_lat       numeric(7,4),
  birth_lng       numeric(7,4),
  timezone        text,
  avatar_url      text,
  marketing_emails boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- subscriptions: estado de la suscripción Stripe. 1 fila por usuario premium.
-- ---------------------------------------------------------------------------
create table public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null unique references auth.users (id) on delete cascade,
  stripe_customer_id     text not null unique,
  stripe_subscription_id text unique,
  status                 text not null check (status in (
                          'active','trialing','past_due','canceled','incomplete','none')),
  plan                   text check (plan in ('monthly','annual')),
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- horoscope_cache: contenido por signo y fecha, compartido entre usuarios.
-- ---------------------------------------------------------------------------
create table public.horoscope_cache (
  id           uuid primary key default gen_random_uuid(),
  sun_sign     text not null check (sun_sign in (
                'aries','tauro','geminis','cancer','leo','virgo',
                'libra','escorpio','sagitario','capricornio','acuario','piscis')),
  scope        text not null check (scope in ('daily','weekly','monthly')),
  area         text not null check (area in ('general','love','health','money','work')),
  period_start date not null,
  content      jsonb not null,
  model        text not null default 'gemini-2.5-flash',
  created_at   timestamptz not null default now(),
  unique (sun_sign, scope, area, period_start)
);

-- ---------------------------------------------------------------------------
-- daily_energy: energía global del día (no depende del signo).
-- ---------------------------------------------------------------------------
create table public.daily_energy (
  id         uuid primary key default gen_random_uuid(),
  date       date not null unique,
  content    jsonb not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- astro_events: eventos astrológicos del mes.
-- ---------------------------------------------------------------------------
create table public.astro_events (
  id          uuid primary key default gen_random_uuid(),
  event_date  date not null,
  kind        text not null,
  title       text not null,
  description text not null,
  is_premium  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- tarot_readings: tiradas de tarot guardadas por usuario.
-- ---------------------------------------------------------------------------
create table public.tarot_readings (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  spread_type       text not null check (spread_type in (
                      'one_card','three_cards','celtic_cross','horseshoe')),
  is_premium_spread boolean not null default false,
  cards             jsonb not null,
  interpretation    text not null,
  question          text,
  created_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- natal_charts: cartas natales (básica gratuita / completa premium).
-- ---------------------------------------------------------------------------
create table public.natal_charts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  is_full        boolean not null default false,
  planets        jsonb not null,
  houses         jsonb not null,
  aspects        jsonb,
  interpretation text not null,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- compatibility_reports: sinastrías entre dos personas (premium).
-- ---------------------------------------------------------------------------
create table public.compatibility_reports (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  person_a_label text not null,
  person_a       jsonb not null,
  person_b_label text not null,
  person_b       jsonb not null,
  score          int not null check (score between 0 and 100),
  report         text not null,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- streaks: racha de días consecutivos. 1 fila por usuario.
-- ---------------------------------------------------------------------------
create table public.streaks (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_visit     date,
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- user_events: eventos analíticos mínimos (uso, no PII).
-- ---------------------------------------------------------------------------
create table public.user_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users (id) on delete set null,
  event      text not null,
  payload    jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- legal_consents: registro de consentimientos RGPD.
-- user_id ON DELETE SET NULL: tras borrar la cuenta se conserva la prueba de
-- consentimiento (sin datos identificativos) durante el plazo legal.
-- ---------------------------------------------------------------------------
create table public.legal_consents (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users (id) on delete set null,
  consent_type text not null check (consent_type in (
                'terms','privacy','cookies_analytics','cookies_marketing','marketing_emails')),
  version      text not null,
  granted      boolean not null,
  ip_hash      text not null,
  user_agent   text,
  created_at   timestamptz not null default now()
);

-- Índices
create index tarot_readings_user_idx on public.tarot_readings (user_id, created_at desc);
create index natal_charts_user_idx on public.natal_charts (user_id);
create index compatibility_reports_user_idx on public.compatibility_reports (user_id, created_at desc);
create index astro_events_date_idx on public.astro_events (event_date);
create index legal_consents_user_idx on public.legal_consents (user_id);
create index user_events_created_brin on public.user_events using brin (created_at);
