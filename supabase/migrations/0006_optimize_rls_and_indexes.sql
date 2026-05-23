-- 0006 — Optimización de rendimiento (advisors).
-- 1) Envolver auth.uid() en (select auth.uid()) para que el planificador lo
--    evalúe una sola vez por consulta (initplan) en lugar de por cada fila.
-- 2) Índice sobre la FK user_events.user_id (acelera el ON DELETE SET NULL).

-- profiles ------------------------------------------------------------------
drop policy "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- subscriptions -------------------------------------------------------------
drop policy "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);

-- tarot_readings ------------------------------------------------------------
drop policy "tarot_readings_select_own" on public.tarot_readings;
create policy "tarot_readings_select_own" on public.tarot_readings
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy "tarot_readings_delete_own" on public.tarot_readings;
create policy "tarot_readings_delete_own" on public.tarot_readings
  for delete to authenticated using ((select auth.uid()) = user_id);

-- natal_charts --------------------------------------------------------------
drop policy "natal_charts_select_own" on public.natal_charts;
create policy "natal_charts_select_own" on public.natal_charts
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy "natal_charts_delete_own" on public.natal_charts;
create policy "natal_charts_delete_own" on public.natal_charts
  for delete to authenticated using ((select auth.uid()) = user_id);

-- compatibility_reports -----------------------------------------------------
drop policy "compatibility_select_own" on public.compatibility_reports;
create policy "compatibility_select_own" on public.compatibility_reports
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy "compatibility_delete_own" on public.compatibility_reports;
create policy "compatibility_delete_own" on public.compatibility_reports
  for delete to authenticated using ((select auth.uid()) = user_id);

-- streaks -------------------------------------------------------------------
drop policy "streaks_select_own" on public.streaks;
create policy "streaks_select_own" on public.streaks
  for select to authenticated using ((select auth.uid()) = user_id);

-- user_events ---------------------------------------------------------------
drop policy "user_events_insert" on public.user_events;
create policy "user_events_insert" on public.user_events
  for insert to anon, authenticated
  with check (user_id is null or (select auth.uid()) = user_id);

-- legal_consents ------------------------------------------------------------
drop policy "legal_consents_select_own" on public.legal_consents;
create policy "legal_consents_select_own" on public.legal_consents
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy "legal_consents_insert_own" on public.legal_consents;
create policy "legal_consents_insert_own" on public.legal_consents
  for insert to authenticated with check ((select auth.uid()) = user_id);

-- Índice sobre la FK de user_events
create index user_events_user_idx on public.user_events (user_id);
