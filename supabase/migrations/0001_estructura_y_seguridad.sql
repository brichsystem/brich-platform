-- =====================================================================
-- BRich Platform · 0001 · Estructura y seguridad (aislamiento por empresa)
-- Ejecutar UNA vez en Supabase → SQL Editor → New query → Run.
-- =====================================================================

-- ---------- Tablas ----------

create table public.companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  is_demo     boolean not null default false,   -- true = datos de demostración
  created_at  timestamptz not null default now()
);

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  company_id  uuid not null references public.companies (id) on delete restrict,
  full_name   text,
  role        text not null default 'member' check (role in ('owner', 'member')),
  created_at  timestamptz not null default now()
);

create table public.leads (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references public.companies (id) on delete cascade,
  name          text not null,
  company_name  text,
  phone         text,
  email         text,
  interest      text,
  message       text,
  source        text not null default 'web_form'
                check (source in ('web_form', 'whatsapp', 'manual', 'demo')),
  status        text not null default 'nuevo'
                check (status in ('nuevo', 'contactado', 'en_seguimiento', 'ganado', 'perdido')),
  assigned_to   text,
  created_at    timestamptz not null default now()
);
create index leads_company_created_idx on public.leads (company_id, created_at desc);

create table public.automation_runs (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies (id) on delete cascade,
  system      text not null check (system in ('sales', 'ai-assistant', 'operations')),
  name        text not null,
  status      text not null check (status in ('ok', 'error', 'en_proceso')),
  detail      text,
  ran_at      timestamptz not null default now()
);
create index automation_runs_company_idx on public.automation_runs (company_id, ran_at desc);

-- ---------- Función: empresa del usuario que hace la consulta ----------
-- security definer: lee profiles sin depender de sus propias políticas.

create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select company_id from public.profiles where id = auth.uid()
$$;

revoke all on function public.current_company_id() from public, anon;
grant execute on function public.current_company_id() to authenticated;

-- ---------- Row Level Security (RLS) ----------
-- Cada usuario solo puede LEER los datos de su propia empresa.
-- Nadie puede escribir desde el navegador: las escrituras llegan desde n8n
-- con la clave secreta (que nunca está en la web).

alter table public.companies       enable row level security;
alter table public.profiles        enable row level security;
alter table public.leads           enable row level security;
alter table public.automation_runs enable row level security;

create policy "Ver mi empresa" on public.companies
  for select to authenticated
  using (id = public.current_company_id());

create policy "Ver mi perfil" on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy "Ver prospectos de mi empresa" on public.leads
  for select to authenticated
  using (company_id = public.current_company_id());

create policy "Ver automatizaciones de mi empresa" on public.automation_runs
  for select to authenticated
  using (company_id = public.current_company_id());

-- ---------- Permisos explícitos ----------
-- El proyecto no expone tablas automáticamente; damos solo lectura a usuarios con sesión.

revoke all on public.companies, public.profiles, public.leads, public.automation_runs from anon, authenticated;
grant select on public.companies, public.profiles, public.leads, public.automation_runs to authenticated;
