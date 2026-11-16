-- =====================================================================
-- BRich Platform · 0009 · Sales System: asignación de vendedor y recordatorios
-- Ejecutar UNA vez en Supabase → SQL Editor → New query → Run.
-- Requiere haber ejecutado antes la 0008.
--
-- Qué agrega:
--   · Vendedores: usuarios de la empresa marcados con receives_leads.
--   · Asignación rotativa: cada prospecto nuevo va al vendedor que lleva
--     más tiempo sin recibir uno (configurable por empresa).
--   · Recordatorios: si un prospecto sigue en "nuevo" después de N horas,
--     n8n pide la lista de pendientes y avisa al vendedor (un solo correo
--     con todos sus pendientes). En el último aviso se copia al dueño.
--   · Reintentos seguros: si n8n repite el mismo envío, no se cuenta dos veces.
--   · log_automation_run: n8n deja constancia de avisos enviados y de errores.
--
-- Todo queda APAGADO por defecto. Se activa empresa por empresa (ver n8n/README.md).
-- =====================================================================

-- ---------- 1. Columnas nuevas ----------

alter table public.profiles
  add column if not exists receives_leads boolean not null default false,  -- true = es vendedor y entra en la rotación
  add column if not exists phone text;                                     -- WhatsApp del vendedor (para avisos futuros)

alter table public.companies
  add column if not exists lead_assignment text not null default 'ninguna'
    check (lead_assignment in ('ninguna', 'rotativa')),
  add column if not exists lead_reminder_hours int not null default 0      -- 0 = recordatorios apagados
    check (lead_reminder_hours between 0 and 720),
  add column if not exists lead_reminder_max int not null default 2        -- cuántos avisos como máximo por prospecto
    check (lead_reminder_max between 1 and 5);

alter table public.leads
  add column if not exists assigned_user_id uuid references public.profiles (id) on delete set null,
  add column if not exists assigned_at      timestamptz,
  add column if not exists attention_since  timestamptz,                   -- desde cuándo espera atención
  add column if not exists reminder_count   int not null default 0,
  add column if not exists last_reminder_at timestamptz,
  add column if not exists last_request_id  text;                          -- para reconocer reintentos

-- Prospectos que ya existían: esperan desde su último movimiento.
update public.leads
   set attention_since = greatest(created_at, updated_at)
 where attention_since is null;

alter table public.leads
  alter column attention_since set default now(),
  alter column attention_since set not null;

create index if not exists leads_pending_idx
  on public.leads (company_id, attention_since) where status = 'nuevo';

-- ---------- 2. register_web_lead: ahora asigna vendedor y reconoce reintentos ----------
-- Cambia la lista de parámetros (se agrega p_request_id), así que se reemplaza.

drop function if exists public.register_web_lead(text, text, text, text, text, text, text, text);

create or replace function public.register_web_lead(
  p_company_slug text,
  p_name         text,
  p_company_name text default null,
  p_phone        text default null,
  p_email        text default null,
  p_interest     text default null,
  p_message      text default null,
  p_source       text default 'web_form',
  p_request_id   text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company   uuid;
  v_cname     text;
  v_notify    text;
  v_mode      text;
  v_lead      uuid;
  v_count     int;
  v_last_req  text;
  v_repeated  boolean := false;
  v_retry     boolean := false;
  v_seller    uuid;
  v_sname     text;
  v_semail    text;
  v_sphone    text;
  v_email     text := left(nullif(lower(trim(p_email)), ''), 160);
  v_phone     text := left(nullif(trim(p_phone), ''), 40);
  v_digits    text := nullif(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), '');
  v_message   text := left(nullif(trim(p_message), ''), 2000);
  v_request   text := left(nullif(trim(p_request_id), ''), 80);
begin
  select id, name, notify_emails, lead_assignment into v_company, v_cname, v_notify, v_mode
    from public.companies where slug = p_company_slug;
  if v_company is null then
    raise exception 'Empresa no encontrada: %', p_company_slug;
  end if;

  if coalesce(trim(p_name), '') = '' then
    raise exception 'El nombre es obligatorio';
  end if;

  -- Evita que dos envíos simultáneos de la misma persona creen dos filas.
  perform pg_advisory_xact_lock(hashtext(v_company::text || '|' || coalesce(v_email, v_digits, '')));

  select id, last_request_id, assigned_user_id, contact_count
    into v_lead, v_last_req, v_seller, v_count
    from public.leads
   where company_id = v_company
     and (
       (v_email is not null and lower(email) = v_email)
       or (v_digits is not null and regexp_replace(phone, '\D', '', 'g') = v_digits)
     )
   order by created_at
   limit 1;

  if v_lead is not null and v_request is not null and v_last_req = v_request then
    -- Mismo envío repetido por un reintento: no se cambia nada.
    v_retry := true;
    v_repeated := v_count > 1;
  elsif v_lead is not null then
    v_repeated := true;
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
           -- Si estaba perdido vuelve a "nuevo" y el reloj de atención empieza de cero.
           attention_since  = case when status = 'perdido' then now() else attention_since end,
           reminder_count   = case when status = 'perdido' then 0 else reminder_count end,
           last_reminder_at = case when status = 'perdido' then null else last_reminder_at end,
           status           = case when status = 'perdido' then 'nuevo' else status end,
           last_request_id  = coalesce(v_request, last_request_id),
           updated_at       = now()
     where id = v_lead
     returning contact_count into v_count;

    insert into public.automation_runs (company_id, system, name, status, detail)
    values (v_company, 'sales', 'Prospecto volvió a escribir', 'ok', 'Formulario web · sin duplicar');
  else
    insert into public.leads (company_id, name, company_name, phone, email, interest, message, source, last_request_id)
    values (
      v_company,
      left(trim(p_name), 120),
      left(nullif(trim(p_company_name), ''), 160),
      v_phone,
      v_email,
      left(nullif(trim(p_interest), ''), 80),
      v_message,
      p_source,
      v_request
    )
    returning id into v_lead;
    v_count := 1;

    insert into public.automation_runs (company_id, system, name, status, detail)
    values (v_company, 'sales', 'Registro de prospecto', 'ok', 'Formulario web');
  end if;

  -- Asignación rotativa: al vendedor que lleva más tiempo sin recibir un prospecto.
  if not v_retry and v_seller is null and v_mode = 'rotativa' then
    -- Un turno a la vez por empresa, para que dos prospectos simultáneos no vayan al mismo vendedor.
    perform pg_advisory_xact_lock(hashtext('asignar|' || v_company::text));

    select p.id into v_seller
      from public.profiles p
     where p.company_id = v_company and p.receives_leads
     order by (select max(l.assigned_at) from public.leads l where l.assigned_user_id = p.id) asc nulls first,
              p.created_at, p.id
     limit 1;

    if v_seller is not null then
      update public.leads l
         set assigned_user_id = v_seller,
             assigned_to      = (select coalesce(nullif(trim(p.full_name), ''), 'Vendedor') from public.profiles p where p.id = v_seller),
             assigned_at      = now()
       where l.id = v_lead;

      insert into public.automation_runs (company_id, system, name, status, detail)
      values (v_company, 'sales', 'Asignación de vendedor', 'ok', 'Rotativa');
    end if;
  end if;

  if v_seller is not null then
    select coalesce(nullif(trim(p.full_name), ''), 'Vendedor'), u.email, nullif(trim(p.phone), '')
      into v_sname, v_semail, v_sphone
      from public.profiles p
      left join auth.users u on u.id = p.id
     where p.id = v_seller;
  end if;

  return jsonb_build_object(
    'id', v_lead,
    'company_id', v_company,
    'repetido', v_repeated,
    'reintento', v_retry,
    'veces', v_count,
    'empresa', v_cname,
    'notify_emails', v_notify,
    'vendedor', v_sname,
    'vendedor_email', v_semail,
    'vendedor_whatsapp', v_sphone,
    -- A quién escribir: el vendedor asignado y los correos de aviso de la empresa.
    'avisar_a', nullif(concat_ws(', ', v_semail, nullif(trim(v_notify), '')), '')
  );
end;
$$;

revoke all on function public.register_web_lead(text, text, text, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.register_web_lead(text, text, text, text, text, text, text, text, text) to service_role;

-- ---------- 3. set_lead_status: al cambiar de estado, el reloj de atención se reinicia ----------

create or replace function public.set_lead_status(p_lead_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_status not in ('nuevo', 'contactado', 'en_seguimiento', 'ganado', 'perdido') then
    raise exception 'Estado no válido: %', p_status;
  end if;

  update public.leads
     set attention_since  = case when status is distinct from p_status then now() else attention_since end,
         reminder_count   = case when status is distinct from p_status then 0 else reminder_count end,
         last_reminder_at = case when status is distinct from p_status then null else last_reminder_at end,
         status           = p_status,
         updated_at       = now()
   where id = p_lead_id
     and company_id = public.current_company_id();

  if not found then
    raise exception 'Prospecto no encontrado';
  end if;
end;
$$;

revoke all on function public.set_lead_status(uuid, text) from public, anon;
grant execute on function public.set_lead_status(uuid, text) to authenticated;

-- ---------- 4. Equipo de mi empresa (para el selector de responsable del portal) ----------

create or replace function public.company_team()
returns table (id uuid, full_name text, receives_leads boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, coalesce(nullif(trim(p.full_name), ''), 'Usuario sin nombre'), p.receives_leads
    from public.profiles p
   where p.company_id = public.current_company_id()
   order by 2
$$;

revoke all on function public.company_team() from public, anon;
grant execute on function public.company_team() to authenticated;

-- ---------- 5. assign_lead: el dueño cambia el responsable de un prospecto ----------
-- Solo usuarios con rol "owner", solo prospectos de su empresa, solo hacia
-- personas de su misma empresa. p_user_id = null deja el prospecto sin asignar.

create or replace function public.assign_lead(p_lead_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company uuid := public.current_company_id();
  v_name    text;
begin
  if v_company is null
     or not exists (select 1 from public.profiles where id = auth.uid() and role = 'owner') then
    raise exception 'Solo el dueño de la cuenta puede asignar prospectos';
  end if;

  if p_user_id is not null then
    select coalesce(nullif(trim(full_name), ''), 'Vendedor') into v_name
      from public.profiles
     where id = p_user_id and company_id = v_company;
    if v_name is null then
      raise exception 'Esa persona no pertenece a tu empresa';
    end if;
  end if;

  update public.leads
     set assigned_user_id = p_user_id,
         assigned_to      = v_name,
         assigned_at      = case when p_user_id is null then null else now() end,
         updated_at       = now()
   where id = p_lead_id
     and company_id = v_company;

  if not found then
    raise exception 'Prospecto no encontrado';
  end if;
end;
$$;

revoke all on function public.assign_lead(uuid, uuid) from public, anon;
grant execute on function public.assign_lead(uuid, uuid) to authenticated;

-- ---------- 6. claim_lead_reminders: n8n pide los recordatorios pendientes ----------
-- Devuelve una fila por destinatario (empresa + vendedor) con la lista de sus
-- prospectos sin atender. Al devolverlos los marca como "avisados", así que si
-- n8n vuelve a preguntar (o reintenta) no se envía el mismo aviso dos veces.
-- Cada fila trae los datos de UNA sola empresa: n8n nunca mezcla empresas.

create or replace function public.claim_lead_reminders(p_limit int default 200)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  with due as (
    select l.id
      from public.leads l
      join public.companies c on c.id = l.company_id
     where l.status = 'nuevo'
       and c.lead_reminder_hours > 0
       and l.reminder_count < c.lead_reminder_max
       and coalesce(l.last_reminder_at, l.attention_since) <= now() - make_interval(hours => c.lead_reminder_hours)
       and (l.assigned_user_id is not null or nullif(trim(c.notify_emails), '') is not null)
     order by l.attention_since
     limit greatest(1, least(coalesce(p_limit, 200), 500))
       for update of l skip locked
  ),
  marked as (
    update public.leads l
       set reminder_count = l.reminder_count + 1,
           last_reminder_at = now()
      from due
     where l.id = due.id
    returning l.*
  ),
  grouped as (
    select c.id as company_id,
           c.name as empresa,
           coalesce(u.email, nullif(trim(c.notify_emails), '')) as para,
           case when u.email is not null and bool_or(m.reminder_count >= c.lead_reminder_max)
                then nullif(trim(c.notify_emails), '') end as copia,
           coalesce(nullif(trim(p.full_name), ''), 'equipo') as vendedor,
           nullif(trim(p.phone), '') as vendedor_whatsapp,
           count(*)::int as cantidad,
           string_agg(
             '• ' || m.name
               || coalesce(' (' || m.company_name || ')', '')
               || coalesce(' · ' || m.phone, '')
               || coalesce(' · ' || m.email, '')
               || ' · espera hace ' || floor(extract(epoch from now() - m.attention_since) / 3600)::int || ' h'
               || ' · aviso ' || m.reminder_count || ' de ' || c.lead_reminder_max,
             E'\n' order by m.attention_since
           ) as detalle
      from marked m
      join public.companies c on c.id = m.company_id
      left join public.profiles p on p.id = m.assigned_user_id
      left join auth.users u on u.id = p.id
     group by c.id, c.name, c.notify_emails, p.id, p.full_name, p.phone, u.email
  )
  select coalesce(jsonb_agg(to_jsonb(g)), '[]'::jsonb) into v_result from grouped g;

  return v_result;
end;
$$;

revoke all on function public.claim_lead_reminders(int) from public, anon, authenticated;
grant execute on function public.claim_lead_reminders(int) to service_role;

-- ---------- 7. log_automation_run: n8n deja constancia de lo que hizo ----------
-- Aparece en la tarjeta "Automatizaciones" del panel de esa empresa.

create or replace function public.log_automation_run(
  p_company_id uuid,
  p_system     text,
  p_name       text,
  p_status     text,
  p_detail     text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.automation_runs (company_id, system, name, status, detail)
  values (p_company_id, p_system, left(trim(p_name), 120), p_status, left(nullif(trim(p_detail), ''), 300));
end;
$$;

revoke all on function public.log_automation_run(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.log_automation_run(uuid, text, text, text, text) to service_role;

-- Comprobación: configuración de cada empresa (todo apagado hasta que se active)
select name, slug, lead_assignment, lead_reminder_hours, lead_reminder_max from public.companies order by created_at;
