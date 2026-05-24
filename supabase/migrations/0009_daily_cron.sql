-- 0009 — Generación automática diaria del contenido (cron de Postgres).
--
-- pg_cron programa el trabajo; pg_net hace las llamadas HTTP a las Edge
-- Functions. La URL y la anon key se leen de Supabase Vault (no se guardan en
-- este archivo ni en git): se cargan una vez con vault.create_secret.
--
-- Trabajo 'daily-energy-generation': cada día a las 04:00 UTC (~06:00 Madrid en
-- verano) invoca generate-daily-energy una vez por cada uno de los 12 signos.
-- La propia Edge Function pasa a Gemini el contenido de ayer (para no repetir)
-- y borra las filas anteriores al día previo (retención: hoy + ayer).
--
-- A medida que se añadan otras funcionalidades diarias/semanales/mensuales se
-- añadirán aquí sus trabajos con la misma estrategia.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'daily-energy-generation',
  '0 4 * * *',
  $job$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
           || '/functions/v1/generate-daily-energy',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key')
    ),
    body := jsonb_build_object('sun_sign', sign)
  )
  from unnest(array[
    'aries','tauro','geminis','cancer','leo','virgo',
    'libra','escorpio','sagitario','capricornio','acuario','piscis'
  ]) as sign;
  $job$
);
