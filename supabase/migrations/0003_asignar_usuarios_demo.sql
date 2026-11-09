-- =====================================================================
-- BRich Platform · 0003 · Asociar usuarios de prueba a su empresa
-- Ejecutar DESPUÉS de crear los dos usuarios en Authentication → Users.
-- Cambia los correos si usaste otros.
-- =====================================================================

insert into public.profiles (id, company_id, full_name, role)
select u.id, c.id, 'Usuario Demo A', 'owner'
from auth.users u, public.companies c
where u.email = 'demo-a@brich.test' and c.slug = 'demo-a'
on conflict (id) do update set company_id = excluded.company_id;

insert into public.profiles (id, company_id, full_name, role)
select u.id, c.id, 'Usuario Demo B', 'owner'
from auth.users u, public.companies c
where u.email = 'demo-b@brich.test' and c.slug = 'demo-b'
on conflict (id) do update set company_id = excluded.company_id;

-- Comprobación: deben aparecer 2 filas
select p.full_name, c.name as empresa
from public.profiles p join public.companies c on c.id = p.company_id;
