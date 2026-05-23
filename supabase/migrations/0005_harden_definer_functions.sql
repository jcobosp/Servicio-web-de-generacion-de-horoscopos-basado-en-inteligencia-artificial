-- 0005 — Endurecimiento de funciones SECURITY DEFINER (advisors de seguridad).
-- Evita que funciones internas queden expuestas como endpoints RPC públicos.

create schema if not exists private;
grant usage on schema private to authenticated;

-- handle_new_user: solo se ejecuta como trigger de auth.users. No debe ser
-- invocable vía RPC. Revocar EXECUTE no impide que el trigger se dispare.
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

-- is_premium: helper usado únicamente dentro de políticas RLS. Se traslada al
-- esquema private (no expuesto por PostgREST) para que no sea un endpoint RPC.
drop function if exists public.is_premium(uuid);

create or replace function private.is_premium(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = uid and status in ('active','trialing')
  );
$$;

revoke all on function private.is_premium(uuid) from public;
grant execute on function private.is_premium(uuid) to authenticated;

-- increment_streak: pensada para que la invoque el usuario autenticado (RPC).
-- Se retira el acceso de anon; authenticated lo conserva de forma intencionada.
revoke all on function public.increment_streak() from public;
revoke all on function public.increment_streak() from anon;
grant execute on function public.increment_streak() to authenticated;
