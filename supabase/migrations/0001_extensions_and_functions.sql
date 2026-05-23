-- 0001 — Extensiones y funciones base
-- Funciones que no dependen de tablas: cálculo de signo y mantenimiento de updated_at.

create extension if not exists pgcrypto with schema extensions;

-- Devuelve el signo solar (slug en español) a partir de una fecha de nacimiento.
-- Inmutable: el resultado solo depende del input. Usada en triggers y validaciones.
create or replace function public.get_zodiac_sign(birth date)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when (extract(month from birth) = 3  and extract(day from birth) >= 21)
      or (extract(month from birth) = 4  and extract(day from birth) <= 19) then 'aries'
    when (extract(month from birth) = 4  and extract(day from birth) >= 20)
      or (extract(month from birth) = 5  and extract(day from birth) <= 20) then 'tauro'
    when (extract(month from birth) = 5  and extract(day from birth) >= 21)
      or (extract(month from birth) = 6  and extract(day from birth) <= 20) then 'geminis'
    when (extract(month from birth) = 6  and extract(day from birth) >= 21)
      or (extract(month from birth) = 7  and extract(day from birth) <= 22) then 'cancer'
    when (extract(month from birth) = 7  and extract(day from birth) >= 23)
      or (extract(month from birth) = 8  and extract(day from birth) <= 22) then 'leo'
    when (extract(month from birth) = 8  and extract(day from birth) >= 23)
      or (extract(month from birth) = 9  and extract(day from birth) <= 22) then 'virgo'
    when (extract(month from birth) = 9  and extract(day from birth) >= 23)
      or (extract(month from birth) = 10 and extract(day from birth) <= 22) then 'libra'
    when (extract(month from birth) = 10 and extract(day from birth) >= 23)
      or (extract(month from birth) = 11 and extract(day from birth) <= 21) then 'escorpio'
    when (extract(month from birth) = 11 and extract(day from birth) >= 22)
      or (extract(month from birth) = 12 and extract(day from birth) <= 21) then 'sagitario'
    when (extract(month from birth) = 12 and extract(day from birth) >= 22)
      or (extract(month from birth) = 1  and extract(day from birth) <= 19) then 'capricornio'
    when (extract(month from birth) = 1  and extract(day from birth) >= 20)
      or (extract(month from birth) = 2  and extract(day from birth) <= 18) then 'acuario'
    else 'piscis'
  end;
$$;

-- Mantiene updated_at al modificar una fila.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

grant execute on function public.get_zodiac_sign(date) to anon, authenticated;
