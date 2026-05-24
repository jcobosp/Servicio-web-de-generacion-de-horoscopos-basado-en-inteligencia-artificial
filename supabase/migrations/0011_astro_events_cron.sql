-- 0011 — Cron de generación automática de eventos astrológicos del mes.
--
-- Dispara `generate-astro-events` el día 1 de cada mes a las 04:40 UTC
-- (escalonado tras los crons de horóscopos). La Edge Function calcula los
-- eventos reales con astronomy-engine, pide a Gemini el copy y aplica
-- retención (mes actual + anterior).
--
-- Se queda DESACTIVADO por defecto (política: interruptor en OFF; el usuario
-- lo encenderá cuando quiera). Toggle: select cron.alter_job((select jobid
-- from cron.job where jobname='astro-events-generation'), active := true);

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'astro-events-generation',
  '40 4 1 * *',
  $job$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
           || '/functions/v1/generate-astro-events',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key')
    ),
    body := '{}'::jsonb
  );
  $job$
);

-- Apagar el interruptor (política por defecto en demo).
select cron.alter_job(
  (select jobid from cron.job where jobname = 'astro-events-generation'),
  active := false
);
