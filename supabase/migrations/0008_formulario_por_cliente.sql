-- =====================================================================
-- BRich Platform · 0008 · Formulario por cliente (camino B)
-- Ejecutar UNA vez en Supabase → SQL Editor → New query → Run.
-- Requiere haber ejecutado antes la 0007.
--
-- Cada empresa puede tener su página pública: brich-platform.vercel.app/f/<slug>
--   · form_enabled  → la página existe solo si está en true
--   · form_services → opciones de "¿Qué te interesa?"
--   · notify_emails → a quién le llega el aviso (separados por comas)
-- =====================================================================

alter table public.companies
  add column if not exists form_enabled  boolean not null default false,
  add column if not exists form_services text[]  not null default '{}',
  add column if not exists notify_emails text;

-- BRich: su página y sus avisos.
update public.companies
   set form_enabled  = true,
       form_services = array['BRich Sales System', 'BRich AI Assistant', 'BRich Operations System'],
       notify_emails = coalesce(notify_emails, 'brich.system@gmail.com')
 where slug = 'brich';

-- Empresa Demo A: página de ejemplo para presentaciones de venta.
update public.companies
   set form_enabled  = true,
       form_services = array['Construcción de casas', 'Remodelaciones', 'Mantenimiento']
 where slug = 'demo-a';

-- Lo único que la página pública puede saber de una empresa: nombre y servicios,
-- y solo si su formulario está activado.
create or replace function public.get_public_form(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object('name', name, 'slug', slug, 'services', to_jsonb(form_services))
    from public.companies
   where slug = p_slug and form_enabled
$$;

revoke all on function public.get_public_form(text) from public;
grant execute on function public.get_public_form(text) to anon, authenticated, service_role;

-- register_web_lead ahora también devuelve el nombre de la empresa y a quién avisar,
-- para que n8n envíe el correo a las personas correctas.
create or replace function public.register_web_lead(
  p_company_slug text,
  p_name         text,
  p_company_name text default null,
  p_phone        text default null,
  p_email        text default null,
  p_interest     text default null,
  p_message      text default null,
  p_source       text default 'web_form'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company  uuid;
  v_cname    text;
  v_notify   text;
  v_lead     uuid;
  v_count    int;
  v_email    text := left(nullif(lower(trim(p_email)), ''), 160);
  v_phone    text := left(nullif(trim(p_phone), ''), 40);
  v_digits   text := nullif(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), '');
  v_message  text := left(nullif(trim(p_message), ''), 2000);
begin
  select id, name, notify_emails into v_company, v_cname, v_notify
    from public.companies where slug = p_company_slug;
  if v_company is null then
    raise exception 'Empresa no encontrada: %', p_company_slug;
  end if;

  if coalesce(trim(p_name), '') = '' then
    raise exception 'El nombre es obligatorio';
  end if;

  perform pg_advisory_xact_lock(hashtext(v_company::text || '|' || coalesce(v_email, v_digits, '')));

  select id into v_lead
    from public.leads
   where company_id = v_company
     and (
       (v_email is not null and lower(email) = v_email)
       or (v_digits is not null and regexp_replace(phone, '\D', '', 'g') = v_digits)
     )
   order by created_at
   limit 1;

  if v_lead is not null then
    update public.leads
       set contact_count = contact_count + 1,
           company_name  = coalesce(company_name, left(nullif(trim(p_company_name), ''), 160)),
           interest      = coalesce(left(nullif(trim(p_interest), ''), 80), interest),
           phone         = coalesce(phone, v_phone),
           email         = coalesce(email, v_email),
           message       = case
                             when v_message is null then message
                             when message is null then v_message
                             else left(message || E'\n\n[' || to_char(now() at time zone 'America/Guayaquil', 'DD/MM/YYYY') || '] ' || v_message, 8000)
                           end,
           status        = case when status = 'perdido' then 'nuevo' else status end,
           updated_at    = now()
     where id = v_lead
     returning contact_count into v_count;

    insert into public.automation_runs (company_id, system, name, status, detail)
    values (v_company, 'sales', 'Prospecto volvió a escribir', 'ok', 'Formulario web · sin duplicar');

    return jsonb_build_object('id', v_lead, 'repetido', true, 'veces', v_count,
                              'empresa', v_cname, 'notify_emails', v_notify);
  end if;

  insert into public.leads (company_id, name, company_name, phone, email, interest, message, source)
  values (
    v_company,
    left(trim(p_name), 120),
    left(nullif(trim(p_company_name), ''), 160),
    v_phone,
    v_email,
    left(nullif(trim(p_interest), ''), 80),
    v_message,
    p_source
  )
  returning id into v_lead;

  insert into public.automation_runs (company_id, system, name, status, detail)
  values (v_company, 'sales', 'Registro de prospecto', 'ok', 'Formulario web');

  return jsonb_build_object('id', v_lead, 'repetido', false, 'veces', 1,
                            'empresa', v_cname, 'notify_emails', v_notify);
end;
$$;

revoke all on function public.register_web_lead(text, text, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.register_web_lead(text, text, text, text, text, text, text, text) to service_role;

-- Comprobación: empresas con formulario activo
select name, slug, form_enabled, form_services, notify_emails from public.companies order by created_at;
