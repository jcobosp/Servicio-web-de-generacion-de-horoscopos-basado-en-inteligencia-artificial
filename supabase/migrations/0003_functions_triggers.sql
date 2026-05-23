-- 0003 — Funciones dependientes de tablas, trigger de alta de usuario y grants.

-- ---------------------------------------------------------------------------
-- is_premium: ¿tiene el usuario una suscripción activa?
-- SECURITY DEFINER para poder usarla dentro de políticas RLS.
-- ---------------------------------------------------------------------------
create or replace function public.is_premium(uid uuid)
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

-- ---------------------------------------------------------------------------
-- handle_new_user: al registrarse un usuario en auth.users, crea su profile
-- y su fila de streak. El signo se calcula en el servidor (no se confía en
-- lo que envíe el cliente).
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_birth date;
  v_name  text;
begin
  v_name  := coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1));
  v_birth := nullif(new.raw_user_meta_data->>'birth_date', '')::date;

  if v_birth is null then
    -- Sin fecha de nacimiento no se puede calcular el signo; se omite el
    -- profile (la app siempre envía birth_date en el registro).
    return new;
  end if;

  insert into public.profiles (id, display_name, birth_date, sun_sign)
  values (new.id, v_name, v_birth, public.get_zodiac_sign(v_birth));

  insert into public.streaks (user_id) values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- increment_streak: actualiza la racha del usuario autenticado.
-- ---------------------------------------------------------------------------
create or replace function public.increment_streak()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid     uuid := auth.uid();
  v_last    date;
  v_current int;
  v_longest int;
begin
  if v_uid is null then
    raise exception 'No authenticated user';
  end if;

  insert into public.streaks (user_id, current_streak, longest_streak, last_visit)
  values (v_uid, 1, 1, current_date)
  on conflict (user_id) do nothing;

  select last_visit, current_streak, longest_streak
    into v_last, v_current, v_longest
  from public.streaks
  where user_id = v_uid;

  if v_last = current_date then
    return;                          -- ya contado hoy
  elsif v_last = current_date - 1 then
    v_current := v_current + 1;      -- día consecutivo
  else
    v_current := 1;                  -- racha rota
  end if;

  v_longest := greatest(coalesce(v_longest, 0), v_current);

  update public.streaks
     set current_streak = v_current,
         longest_streak = v_longest,
         last_visit     = current_date,
         updated_at     = now()
   where user_id = v_uid;
end;
$$;

grant execute on function public.is_premium(uuid) to anon, authenticated;
grant execute on function public.increment_streak() to authenticated;
