-- =====================================================================
-- BRich Platform · 0002 · Datos DEMOSTRATIVOS (ficticios)
-- Dos empresas de demostración para probar que cada una ve solo lo suyo.
-- Todos los registros llevan source = 'demo' y nombres que dicen "Demo".
-- Para borrarlos más adelante: delete from public.companies where is_demo;
-- =====================================================================

insert into public.companies (name, slug, is_demo) values
  ('Empresa Demo A', 'demo-a', true),
  ('Empresa Demo B', 'demo-b', true);

-- Prospectos ficticios de los últimos 60 días
insert into public.leads (company_id, name, company_name, phone, email, interest, source, status, assigned_to, created_at)
select
  c.id,
  'Prospecto Demo ' || lpad(g::text, 2, '0'),
  'Negocio Demo ' || lpad(g::text, 2, '0'),
  '+593 99 000 ' || lpad(g::text, 4, '0'),
  'demo' || g || '@ejemplo.invalid',
  (array['BRich Sales System', 'BRich AI Assistant', 'BRich Operations System'])[1 + g % 3],
  'demo',
  (array['nuevo', 'contactado', 'en_seguimiento', 'ganado', 'perdido', 'contactado', 'en_seguimiento'])[1 + (g * 3) % 7],
  (array['Vendedor Demo 1', 'Vendedor Demo 2'])[1 + g % 2],
  now() - ((g * 37) % 60) * interval '1 day' - (g % 9) * interval '1 hour'
from public.companies c
cross join generate_series(1, 40) as g
where c.slug = 'demo-a';

insert into public.leads (company_id, name, company_name, phone, email, interest, source, status, assigned_to, created_at)
select
  c.id,
  'Prospecto Demo B-' || lpad(g::text, 2, '0'),
  'Negocio Demo B-' || lpad(g::text, 2, '0'),
  '+593 98 000 ' || lpad(g::text, 4, '0'),
  'demob' || g || '@ejemplo.invalid',
  'BRich Sales System',
  'demo',
  (array['nuevo', 'contactado', 'ganado'])[1 + g % 3],
  'Vendedor Demo B',
  now() - ((g * 11) % 45) * interval '1 day'
from public.companies c
cross join generate_series(1, 12) as g
where c.slug = 'demo-b';

-- Ejecuciones ficticias de automatizaciones
insert into public.automation_runs (company_id, system, name, status, detail, ran_at)
select c.id, r.system, r.name, r.status, r.detail, now() - r.ago
from public.companies c
cross join (values
  ('sales',        'Registro de prospecto',      'ok',         'Demostrativo',                 interval '25 minutes'),
  ('sales',        'Aviso al vendedor',          'ok',         'Demostrativo',                 interval '24 minutes'),
  ('sales',        'Seguimiento programado',     'en_proceso', 'Demostrativo',                 interval '2 hours'),
  ('operations',   'Reporte semanal',            'ok',         'Demostrativo',                 interval '1 day'),
  ('ai-assistant', 'Derivación a una persona',   'error',      'Demostrativo · ejemplo de falla', interval '3 hours')
) as r(system, name, status, detail, ago)
where c.slug = 'demo-a';

insert into public.automation_runs (company_id, system, name, status, detail, ran_at)
select c.id, 'sales', 'Registro de prospecto', 'ok', 'Demostrativo', now() - interval '1 hour'
from public.companies c where c.slug = 'demo-b';
