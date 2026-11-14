-- =====================================================================
-- BRich Platform · 0007 · Prospectos sin duplicados
-- Ejecutar UNA vez en Supabase → SQL Editor → New query → Run.
--
-- Regla: dentro de una empresa, si llega un prospecto con el mismo correo
-- o el mismo WhatsApp que uno ya registrado, NO se crea una fila nueva:
--   · se suma 1 a "veces que escribió" (contact_count)
--   · el mensaje nuevo se agrega al anterior, con la fecha
--   · se actualizan los datos vacíos (empresa, interés, teléfono, correo)
--   · si estaba "perdido", vuelve a "nuevo"; cualquier otro estado se respeta
-- No borra ni cambia los prospectos que ya existen.
-- =====================================================================

alter table public.leads
  add column if not exists contact_count int not null default 1;

-- Índices para buscar repetidos rápido.
create index if not exists leads_company_email_idx
  on public.leads (company_id, lower(email));
create index if not exists leads_company_phone_idx
  on public.leads (company_id, regexp_replace(phone, '\D', '', 'g'));

-- La función cambia lo que devuelve (antes un id, ahora {id, repetido, veces}),
-- así que se reemplaza.
drop function if exists public.register_web_lead(text, text, text, text, text, text, text, text);

create function public.register_web_lead(
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
  v_lead     uuid;
  v_count    int;
  v_email    text := left(nullif(lower(trim(p_email)), ''), 160);
  v_phone    text := left(nullif(trim(p_phone), ''), 40);
  v_digits   text := nullif(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), '');
  v_message  text := left(nullif(trim(p_message), ''), 2000);
begin
  select id into v_company from public.companies where slug = p_company_slug;
  if v_company is null then
    raise exception 'Empresa no encontrada: %', p_company_slug;
  end if;

  if coalesce(trim(p_name), '') = '' then
    raise exception 'El nombre es obligatorio';
  end if;

  -- Evita que dos envíos simultáneos de la misma persona creen dos filas.
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

    return jsonb_build_object('id', v_lead, 'repetido', true, 'veces', v_count);
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

  return jsonb_build_object('id', v_lead, 'repetido', false, 'veces', 1);
end;
$$;

revoke all on function public.register_web_lead(text, text, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.register_web_lead(text, text, text, text, text, text, text, text) to service_role;
