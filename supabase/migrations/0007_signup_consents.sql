-- 0007 — El trigger de alta registra también los consentimientos legales.
-- Con la confirmación de email activada no hay sesión inmediata tras signUp,
-- por lo que el cliente no puede insertar en legal_consents (RLS). El trigger
-- (SECURITY DEFINER) lo hace a partir de los metadatos del registro.
--
-- Nota: el hash de IP real requiere una Edge Function que vea la cabecera del
-- cliente; aquí se marca como 'captured-at-signup'. Queda como mejora futura
-- (documentado en docs/SECURITY.md y docs/LEGAL_COMPLIANCE.md).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_birth     date;
  v_name      text;
  v_marketing boolean;
  v_legal_v   text;
begin
  v_name      := coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1));
  v_birth     := nullif(new.raw_user_meta_data->>'birth_date', '')::date;
  v_marketing := coalesce((new.raw_user_meta_data->>'marketing_opt_in')::boolean, false);
  v_legal_v   := coalesce(new.raw_user_meta_data->>'legal_version', '1.0');

  if v_birth is null then
    return new;
  end if;

  insert into public.profiles (id, display_name, birth_date, sun_sign, marketing_emails)
  values (new.id, v_name, v_birth, public.get_zodiac_sign(v_birth), v_marketing);

  insert into public.streaks (user_id) values (new.id)
  on conflict (user_id) do nothing;

  insert into public.legal_consents (user_id, consent_type, version, granted, ip_hash)
  values
    (new.id, 'terms',            v_legal_v, true,        'captured-at-signup'),
    (new.id, 'privacy',          v_legal_v, true,        'captured-at-signup'),
    (new.id, 'marketing_emails', v_legal_v, v_marketing, 'captured-at-signup');

  return new;
end;
$$;
