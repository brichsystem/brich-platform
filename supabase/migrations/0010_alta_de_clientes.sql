-- =====================================================================
-- BRich Platform · 0010 · Alta de clientes con formulario propio
-- Ejecutar UNA vez en Supabase → SQL Editor → New query → Run.
-- Requiere haber ejecutado antes la 0009.
--
-- Cómo se usa (todo desde el SQL Editor):
--   1. select public.create_onboarding('Nombre del cliente');
--        → devuelve un enlace privado /alta/<código> para enviar al cliente.
--   2. El cliente llena la página (empresa, servicios, correos, personas).
--   3. select public.onboarding_status();          → ver quién ya respondió.
--   4. Crear los usuarios en Authentication → Users (los correos que indicó).
--   5. select public.apply_onboarding('<código>', 'slug-del-cliente');
--        → crea la empresa, su formulario y vincula los usuarios.
--
-- El enlace solo sirve una vez: después de enviado, la página queda cerrada.
-- =====================================================================

create table if not exists public.onboarding_requests (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,
  label        text not null,                 -- nombre con el que se saluda al cliente
  data         jsonb,                         -- lo que respondió
  submitted_at timestamptz,
  applied_at   timestamptz,
  created_at   timestamptz not null default now()
);

-- Nadie lee ni escribe esta tabla directamente: solo las funciones de abajo.
alter table public.onboarding_requests enable row level security;
revoke all on public.onboarding_requests from anon, authenticated;

-- ---------- 1. BRich crea la invitación ----------
create or replace function public.create_onboarding(p_label text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code text := replace(gen_random_uuid()::text, '-', '');
begin
  if coalesce(trim(p_label), '') = '' then
    raise exception 'Escribe el nombre del cliente';
  end if;
  insert into public.onboarding_requests (code, label) values (v_code, left(trim(p_label), 120));
  return 'https://brich-platform.vercel.app/alta/' || v_code;
end;
$$;
revoke all on function public.create_onboarding(text) from public, anon, authenticated;

-- ---------- 2. La página pública: solo sabe el nombre y si ya se envió ----------
create or replace function public.get_onboarding(p_code text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object('label', label, 'submitted', submitted_at is not null)
    from public.onboarding_requests
   where code = p_code
$$;
revoke all on function public.get_onboarding(text) from public;
grant execute on function public.get_onboarding(text) to anon, authenticated, service_role;

-- ---------- 3. El cliente envía sus datos (una sola vez) ----------
create or replace function public.submit_onboarding(p_code text, p_data jsonb)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_data is null or jsonb_typeof(p_data) <> 'object' or octet_length(p_data::text) > 20000 then
    raise exception 'Datos no válidos';
  end if;

  update public.onboarding_requests
     set data = p_data, submitted_at = now()
   where code = p_code and submitted_at is null;

  return found;
end;
$$;
revoke all on function public.submit_onboarding(text, jsonb) from public;
grant execute on function public.submit_onboarding(text, jsonb) to anon, authenticated, service_role;

-- ---------- 4. BRich revisa las respuestas ----------
create or replace function public.onboarding_status()
returns table (cliente text, codigo text, enviado timestamptz, aplicado timestamptz, respuestas text)
language sql
stable
security definer
set search_path = ''
as $$
  select label, code, submitted_at, applied_at, jsonb_pretty(data)
    from public.onboarding_requests
   order by created_at desc
$$;
revoke all on function public.onboarding_status() from public, anon, authenticated;

-- ---------- 5. BRich aplica el alta ----------
-- Crea (o actualiza) la empresa con su formulario y su configuración, y vincula
-- a las personas cuyo usuario ya existe en Authentication. Se puede ejecutar
-- varias veces: si faltaban usuarios, créalos y vuelve a ejecutar.
-- Nunca mueve a un usuario que ya pertenece a otra empresa.
create or replace function public.apply_onboarding(p_code text, p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_req      public.onboarding_requests%rowtype;
  v_company  uuid;
  v_person   jsonb;
  v_email    text;
  v_user     uuid;
  v_other    uuid;
  v_sellers  int;
  v_hours    int;
  v_linked   text[] := '{}';
  v_missing  text[] := '{}';
  v_skipped  text[] := '{}';
begin
  select * into v_req from public.onboarding_requests where code = p_code;
  if v_req.id is null then
    raise exception 'Código de alta no encontrado';
  end if;
  if v_req.submitted_at is null then
    raise exception 'El cliente todavía no ha enviado sus datos';
  end if;
  if p_slug is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(p_slug) > 60 then
    raise exception 'El slug solo puede tener minúsculas, números y guiones (ejemplo: mi-empresa)';
  end if;

  select count(*) into v_sellers
    from jsonb_array_elements(v_req.data -> 'people') p where (p ->> 'seller')::boolean;
  v_hours := least(greatest(coalesce((v_req.data ->> 'reminderHours')::int, 0), 0), 720);

  insert into public.companies (name, slug, is_demo, form_enabled, form_services, notify_emails, lead_assignment, lead_reminder_hours)
  values (
    left(trim(v_req.data ->> 'company'), 120),
    p_slug,
    false,
    true,
    array(select left(trim(s), 80) from jsonb_array_elements_text(v_req.data -> 'services') s where trim(s) <> ''),
    (select string_agg(lower(trim(e)), ', ') from jsonb_array_elements_text(v_req.data -> 'notifyEmails') e where trim(e) <> ''),
    -- Un solo vendedor: todo va a esa persona. Varios: por turnos solo si el cliente lo pidió.
    case when v_sellers = 1 or (v_sellers > 1 and coalesce((v_req.data ->> 'rotate')::boolean, false)) then 'rotativa' else 'ninguna' end,
    v_hours
  )
  on conflict (slug) do update
    set name = excluded.name,
        form_enabled = excluded.form_enabled,
        form_services = excluded.form_services,
        notify_emails = excluded.notify_emails,
        lead_assignment = excluded.lead_assignment,
        lead_reminder_hours = excluded.lead_reminder_hours
  returning id into v_company;

  for v_person in select * from jsonb_array_elements(v_req.data -> 'people') loop
    v_email := lower(trim(v_person ->> 'email'));
    select id into v_user from auth.users where lower(email) = v_email;
    if v_user is null then
      v_missing := v_missing || v_email;
      continue;
    end if;

    select company_id into v_other from public.profiles where id = v_user;
    if v_other is not null and v_other <> v_company then
      v_skipped := v_skipped || v_email;
      continue;
    end if;

    insert into public.profiles (id, company_id, full_name, role, receives_leads, phone)
    values (
      v_user,
      v_company,
      left(trim(v_person ->> 'name'), 120),
      case when (v_person ->> 'owner')::boolean then 'owner' else 'member' end,
      coalesce((v_person ->> 'seller')::boolean, false),
      left(nullif(trim(v_person ->> 'phone'), ''), 40)
    )
    on conflict (id) do update
      set full_name = excluded.full_name, role = excluded.role,
          receives_leads = excluded.receives_leads, phone = excluded.phone;
    v_linked := v_linked || v_email;
  end loop;

  update public.onboarding_requests set applied_at = now() where id = v_req.id;

  return jsonb_build_object(
    'empresa', v_req.data ->> 'company',
    'formulario', 'https://brich-platform.vercel.app/f/' || p_slug,
    'usuarios_vinculados', to_jsonb(v_linked),
    'usuarios_por_crear_en_Authentication', to_jsonb(v_missing),
    'usuarios_que_ya_son_de_otra_empresa', to_jsonb(v_skipped)
  );
end;
$$;
revoke all on function public.apply_onboarding(text, text) from public, anon, authenticated;
