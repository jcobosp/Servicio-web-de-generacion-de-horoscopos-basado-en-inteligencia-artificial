-- 0010 — Crons de generación automática del horóscopo diario/semanal/mensual.
--
-- Cada trabajo dispara una llamada POST a `generate-horoscope` por cada
-- combinación (signo × área), 12 × 5 = 60 generaciones por scope. La Edge
-- Function lee de `horoscope_cache`, pasa a Gemini el periodo anterior para
-- variar, guarda el periodo nuevo y aplica retención (current + previous).
--
-- Tiempos escalonados (UTC) para no concentrar el burst:
--   04:00 — daily-energy-generation (migración 0009).
--   04:10 — daily-horoscope-generation (cada día).
--   04:20 — weekly-horoscope-generation (lunes).
--   04:30 — monthly-horoscope-generation (día 1 de mes).
--
-- URL y anon key se leen de Supabase Vault (`project_url`, `anon_key`).

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Helper: el SQL del cron es el mismo salvo el scope. Lo dejamos inline en
-- cada cron.schedule para que el archivo sea autocontenido y `cron.schedule`
-- siga siendo idempotente por jobname.

select cron.schedule(
  'daily-horoscope-generation',
  '10 4 * * *',
  $job$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
           || '/functions/v1/generate-horoscope',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key')
    ),
    body := jsonb_build_object('sun_sign', sign, 'scope', 'daily', 'area', area)
  )
  from unnest(array[
    'aries','tauro','geminis','cancer','leo','virgo',
    'libra','escorpio','sagitario','capricornio','acuario','piscis'
  ]) as sign
  cross join unnest(array['general','love','health','money','work']) as area;
  $job$
);

select cron.schedule(
  'weekly-horoscope-generation',
  '20 4 * * 1',
  $job$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
           || '/functions/v1/generate-horoscope',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key')
    ),
    body := jsonb_build_object('sun_sign', sign, 'scope', 'weekly', 'area', area)
  )
  from unnest(array[
    'aries','tauro','geminis','cancer','leo','virgo',
    'libra','escorpio','sagitario','capricornio','acuario','piscis'
  ]) as sign
  cross join unnest(array['general','love','health','money','work']) as area;
  $job$
);

select cron.schedule(
  'monthly-horoscope-generation',
  '30 4 1 * *',
  $job$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
           || '/functions/v1/generate-horoscope',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key')
    ),
    body := jsonb_build_object('sun_sign', sign, 'scope', 'monthly', 'area', area)
  )
  from unnest(array[
    'aries','tauro','geminis','cancer','leo','virgo',
    'libra','escorpio','sagitario','capricornio','acuario','piscis'
  ]) as sign
  cross join unnest(array['general','love','health','money','work']) as area;
  $job$
);
