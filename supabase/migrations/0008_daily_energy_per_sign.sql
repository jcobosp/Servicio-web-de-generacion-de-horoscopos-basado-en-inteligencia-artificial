-- 0008 — La energía del día pasa a ser POR SIGNO (12 energías distintas/día),
-- en línea con los horóscopos. Se muestra al usuario la de su signo solar.
-- Política de retención (limpieza al generar): solo se conservan el día actual
-- y el anterior; las filas más antiguas se borran desde la Edge Function.

-- El contenido global previo ya no aplica.
delete from public.daily_energy;

-- Quitar el unique(date) global y pasar a unique(sun_sign, date).
alter table public.daily_energy drop constraint daily_energy_date_key;

alter table public.daily_energy
  add column sun_sign text not null check (sun_sign in (
    'aries','tauro','geminis','cancer','leo','virgo',
    'libra','escorpio','sagitario','capricornio','acuario','piscis'));

alter table public.daily_energy
  add constraint daily_energy_sign_date_key unique (sun_sign, date);

-- Índice por fecha para la limpieza eficiente de filas antiguas.
create index if not exists daily_energy_date_idx on public.daily_energy (date);
