-- =====================================================================
-- BRich Platform · 0004 · Registro de prospectos reales desde n8n
-- Ejecutar UNA vez en Supabase → SQL Editor → New query → Run.
-- =====================================================================

-- 1. La empresa BRich, primer cliente real del sistema (no es demo).
insert into public.companies (name, slug, is_demo)
values ('BRich System', 'brich', false)
on conflict (slug) do nothing;

-- 2. Función que registra un prospecto y deja constancia en automation_runs.
--    Solo n8n puede usarla (con la clave secreta). Nadie desde la web.
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
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company uuid;
  v_lead    uuid;
begin
  select id into v_company from public.companies where slug = p_company_slug;
  if v_company is null then
    raise exception 'Empresa no encontrada: %', p_company_slug;
  end if;

  if coalesce(trim(p_name), '') = '' then
    raise exception 'El nombre es obligatorio';
  end if;

  insert into public.leads (company_id, name, company_name, phone, email, interest, message, source)
  values (
    v_company,
    left(trim(p_name), 120),
    left(nullif(trim(p_company_name), ''), 160),
    left(nullif(trim(p_phone), ''), 40),
    left(nullif(lower(trim(p_email)), ''), 160),
    left(nullif(trim(p_interest), ''), 80),
    left(nullif(trim(p_message), ''), 2000),
    p_source
  )
  returning id into v_lead;

  insert into public.automation_runs (company_id, system, name, status, detail)
  values (v_company, 'sales', 'Registro de prospecto', 'ok', 'Formulario web');

  return v_lead;
end;
$$;

revoke all on function public.register_web_lead(text, text, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.register_web_lead(text, text, text, text, text, text, text, text) to service_role;

-- Comprobación: debe aparecer la empresa BRich System
select name, slug, is_demo from public.companies order by created_at;
