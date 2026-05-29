-- 0013_compatibility_pair_key.sql
-- Añade una clave determinista de la pareja a compatibility_reports para
-- deduplicar: re-consultar la compatibilidad de las MISMAS dos personas
-- devuelve el informe ya guardado en vez de gastar tokens de Gemini otra vez.
--
-- La clave se calcula en la Edge Function a partir de los datos de nacimiento de
-- ambas personas, ordenados, de modo que (A,B) y (B,A) produzcan la misma clave
-- (la sinastría es simétrica).

alter table public.compatibility_reports
  add column if not exists pair_key text;

-- Una sola sinastría por usuario y pareja.
create unique index if not exists compatibility_user_pair_uniq
  on public.compatibility_reports (user_id, pair_key);
