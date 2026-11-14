-- =====================================================================
-- BRich Platform · 0006 · Límite de envíos del formulario
-- Ejecutar UNA vez en Supabase → SQL Editor → New query → Run.
--
-- Límites: 3 envíos cada 10 minutos y 10 al día por conexión,
-- y 60 por hora en total para todo el sitio.
-- No se guarda la IP: solo una huella cifrada (64 caracteres) que no se puede revertir.
-- Los registros se borran solos después de 24 horas.
-- =====================================================================

create table if not exists public.form_submissions (
  id         bigint generated always as identity primary key,
  key_hash   text not null,
  created_at timestamptz not null default now()
);
create index if not exists form_submissions_key_idx on public.form_submissions (key_hash, created_at);
create index if not exists form_submissions_created_idx on public.form_submissions (created_at);

-- Nadie lee ni escribe esta tabla directamente: solo la función de abajo.
alter table public.form_submissions enable row level security;
revoke all on public.form_submissions from anon, authenticated;

create or replace function public.check_form_rate_limit(p_key text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  n_global int;
  n_10m    int;
  n_day    int;
begin
  if p_key is null or p_key !~ '^[0-9a-f]{64}$' then
    return 'invalid';
  end if;

  delete from public.form_submissions where created_at < now() - interval '1 day';

  select count(*) into n_global
    from public.form_submissions
   where created_at > now() - interval '1 hour';
  if n_global >= 60 then
    return 'global_limit';
  end if;

  select count(*) filter (where created_at > now() - interval '10 minutes'), count(*)
    into n_10m, n_day
    from public.form_submissions
   where key_hash = p_key;
  if n_10m >= 3 or n_day >= 10 then
    return 'limit';
  end if;

  insert into public.form_submissions (key_hash) values (p_key);
  return 'ok';
end;
$$;

revoke all on function public.check_form_rate_limit(text) from public;
grant execute on function public.check_form_rate_limit(text) to anon, authenticated, service_role;
