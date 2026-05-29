-- 0015_sign_compatibility.sql
-- Compatibilidad GRATUITA entre dos signos del zodiaco. Contenido ESTÁTICO,
-- escrito a mano (sin IA), permanente y de solo lectura para el cliente: cada
-- combinación de dos signos (incluida la de un signo consigo mismo) tiene una
-- fila fija con su puntuación y sus textos.
--
-- Una sola fila por pareja en orden canónico (sign_a viene antes que sign_b en
-- el orden del zodiaco); el cliente normaliza el orden al consultar. La
-- compatibilidad es simétrica.

create table if not exists public.sign_compatibility (
  sign_a     text not null,
  sign_b     text not null,
  score      int  not null check (score between 0 and 100),
  content    jsonb not null,
  created_at timestamptz not null default now(),
  primary key (sign_a, sign_b)
);

-- Lectura pública (es contenido gratuito y no sensible); escritura solo
-- service_role (la siembra). Sin políticas de insert/update/delete.
alter table public.sign_compatibility enable row level security;

create policy "sign_compatibility_select_all" on public.sign_compatibility
  for select to anon, authenticated using (true);
