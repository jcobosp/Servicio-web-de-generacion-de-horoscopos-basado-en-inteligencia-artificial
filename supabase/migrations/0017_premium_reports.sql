-- 0017_premium_reports.sql
-- Informes largos personalizados (premium): reporte MENSUAL y reporte ANUAL.
--
-- Son contenido PREMIUM y PERSONALIZADO por usuario (no cacheado por signo):
-- combinan la carta natal del usuario con los tránsitos reales del periodo y los
-- narra Gemini. Están INCLUIDOS en la suscripción (sin créditos extra, a
-- diferencia de la compatibilidad avanzada).
--
-- Control de coste = GENERACIÓN ÚNICA POR USUARIO Y PERIODO: la clave única
-- (user_id, kind, period_start) hace que el reporte del mes/año en curso se
-- genere una sola vez y luego se reutilice. El historial se conserva (volumen
-- mínimo, ~12 filas/año por usuario), igual que la carta natal o las sinastrías,
-- para que el usuario pueda releer reportes pasados.

create table if not exists public.premium_reports (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  kind         text not null check (kind in ('monthly', 'annual')),
  period_start date not null,            -- 1er día del mes / 1 de enero del año
  data         jsonb not null,           -- contexto astronómico (natal + tránsitos + aspectos)
  report       text not null,            -- narrativa de Gemini (JSON serializado por secciones)
  created_at   timestamptz not null default now(),
  unique (user_id, kind, period_start)
);

create index if not exists premium_reports_user_idx
  on public.premium_reports (user_id, kind, period_start desc);

-- RLS: el usuario solo lee sus propios reportes; la escritura es del
-- service_role (la Edge Function generate-report), que omite RLS.
alter table public.premium_reports enable row level security;

create policy "premium_reports_select_own" on public.premium_reports
  for select to authenticated using ((select auth.uid()) = user_id);
