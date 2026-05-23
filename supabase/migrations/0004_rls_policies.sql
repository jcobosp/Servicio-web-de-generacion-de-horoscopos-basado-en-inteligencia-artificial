-- 0004 — Row Level Security: activación en todas las tablas + políticas.
-- Principio: el usuario solo accede a sus propios datos. El contenido público
-- (cache de horóscopos, energía, eventos) es de solo lectura para todos.
-- Las escrituras de datos generados (cache, suscripciones, contenido IA) las
-- realiza el backend con service_role, que omite RLS.

alter table public.profiles              enable row level security;
alter table public.subscriptions         enable row level security;
alter table public.horoscope_cache       enable row level security;
alter table public.daily_energy          enable row level security;
alter table public.astro_events          enable row level security;
alter table public.tarot_readings        enable row level security;
alter table public.natal_charts          enable row level security;
alter table public.compatibility_reports enable row level security;
alter table public.streaks               enable row level security;
alter table public.user_events           enable row level security;
alter table public.legal_consents        enable row level security;

-- profiles ------------------------------------------------------------------
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- subscriptions (solo lectura propia; escritura vía service_role) -----------
create policy "subscriptions_select_own" on public.subscriptions
  for select to authenticated using (auth.uid() = user_id);

-- horoscope_cache (lectura pública; escritura vía service_role) -------------
create policy "horoscope_cache_select_all" on public.horoscope_cache
  for select to anon, authenticated using (true);

-- daily_energy (lectura pública) --------------------------------------------
create policy "daily_energy_select_all" on public.daily_energy
  for select to anon, authenticated using (true);

-- astro_events (lectura pública) --------------------------------------------
create policy "astro_events_select_all" on public.astro_events
  for select to anon, authenticated using (true);

-- tarot_readings (lectura y borrado propios; alta vía service_role) ---------
create policy "tarot_readings_select_own" on public.tarot_readings
  for select to authenticated using (auth.uid() = user_id);
create policy "tarot_readings_delete_own" on public.tarot_readings
  for delete to authenticated using (auth.uid() = user_id);

-- natal_charts (lectura y borrado propios; alta vía service_role) -----------
create policy "natal_charts_select_own" on public.natal_charts
  for select to authenticated using (auth.uid() = user_id);
create policy "natal_charts_delete_own" on public.natal_charts
  for delete to authenticated using (auth.uid() = user_id);

-- compatibility_reports (lectura y borrado propios; alta vía service_role) --
create policy "compatibility_select_own" on public.compatibility_reports
  for select to authenticated using (auth.uid() = user_id);
create policy "compatibility_delete_own" on public.compatibility_reports
  for delete to authenticated using (auth.uid() = user_id);

-- streaks (lectura propia; escritura vía increment_streak security definer) -
create policy "streaks_select_own" on public.streaks
  for select to authenticated using (auth.uid() = user_id);

-- user_events (inserción abierta a anon/authenticated; lectura service_role)-
create policy "user_events_insert" on public.user_events
  for insert to anon, authenticated
  with check (user_id is null or auth.uid() = user_id);

-- legal_consents (lectura e inserción propias) ------------------------------
create policy "legal_consents_select_own" on public.legal_consents
  for select to authenticated using (auth.uid() = user_id);
create policy "legal_consents_insert_own" on public.legal_consents
  for insert to authenticated with check (auth.uid() = user_id);
