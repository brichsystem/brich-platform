-- =====================================================================
-- BRich Platform · 0005 · Cambiar el estado de un prospecto desde el portal
-- Ejecutar UNA vez en Supabase → SQL Editor → New query → Run.
-- =====================================================================

-- 1. Fecha del último cambio de cada prospecto.
alter table public.leads
  add column if not exists updated_at timestamptz not null default now();

-- 2. Única puerta para que un cliente modifique datos: SOLO el estado,
--    SOLO de prospectos de su propia empresa. Nada más se puede cambiar.
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
     set status = p_status,
         updated_at = now()
   where id = p_lead_id
     and company_id = public.current_company_id();

  if not found then
    raise exception 'Prospecto no encontrado';
  end if;
end;
$$;

revoke all on function public.set_lead_status(uuid, text) from public, anon;
grant execute on function public.set_lead_status(uuid, text) to authenticated;
