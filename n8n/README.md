# Flujos de n8n

| Archivo | Qué hace |
|---|---|
| `brich-formulario-diagnostico.json` | Flujo central. Recibe el formulario de la web de BRich y de las páginas `/f/<slug>` de clientes (protegido con `x-brich-secret`), registra el prospecto en la empresa indicada por `companySlug` (por defecto `brich`), le asigna vendedor si la empresa tiene rotación, responde OK, envía el aviso al vendedor y a los `notify_emails` de esa empresa, y deja constancia (enviado o error) en el panel. |
| `brich-sales-recordatorios.json` | Cada hora, de lunes a sábado de 8:00 a 18:00 (hora de Ecuador), pide a Supabase los prospectos que siguen en "Nuevo" y envía **un correo por vendedor** con todos sus pendientes. En el último aviso copia a los `notify_emails` de la empresa. |

## Credenciales (se crean en n8n, nunca en este repositorio)
- **BRich · Clave del formulario** (Header Auth): nombre `x-brich-secret`, valor = el mismo que `N8N_WEBHOOK_SECRET` en Vercel.
- **Gmail** (OAuth2, "Sign in with Google"): la cuenta que envía los avisos.
- **Supabase · Clave secreta** (Header Auth): nombre `apikey`, valor = Secret key de Supabase.

Al importar un flujo, n8n no trae las credenciales: hay que abrir cada nodo marcado en rojo y elegirlas
(nodos de Supabase → "Supabase · Clave secreta"; nodos de Gmail → la cuenta de Gmail; webhook → "BRich · Clave del formulario").

## Aislamiento por empresa
n8n usa la clave secreta, que puede ver todo. Por eso n8n **nunca consulta tablas**: solo llama a funciones
(`register_web_lead`, `claim_lead_reminders`, `log_automation_run`) que devuelven, en cada fila, los datos y los
destinatarios de **una sola empresa**. La configuración (rotación, horas, correos) vive en la fila de cada empresa,
no en el flujo: hay un solo flujo para todos los clientes.

## Sales System: asignación y recordatorios (migración 0009)

Todo viene **apagado**. Se activa empresa por empresa en Supabase → SQL Editor.

### Configurar
```sql
-- 1. Marcar quiénes son vendedores (reciben prospectos por turnos) y su WhatsApp.
update public.profiles p
   set receives_leads = true, phone = '+593 99 000 0000'
  from auth.users u
 where u.id = p.id and u.email = 'vendedor@cliente.com';

-- 2. Activar la rotación y los recordatorios de la empresa.
update public.companies
   set lead_assignment     = 'rotativa',  -- 'ninguna' = no asignar
       lead_reminder_hours = 24,          -- avisar si sigue en "Nuevo" después de 24 h (0 = apagado)
       lead_reminder_max   = 2            -- máximo de avisos por prospecto (1 a 5)
 where slug = 'slug-del-cliente';
```
Antes de activar los recordatorios en una empresa con prospectos antiguos en "Nuevo", actualiza su estado
(o bórralos si son de prueba): de lo contrario el primer correo los incluirá a todos.

### Probar (con datos ficticios, en Demo A)
1. Activa la configuración de arriba en `demo-a` con `lead_reminder_hours = 1` y un usuario tuyo como vendedor.
2. Envía el formulario de `/f/demo-a`: debe llegar el correo con "Responsable asignado" y aparecer en el panel.
3. Para no esperar una hora: `update public.leads set attention_since = now() - interval '2 hours' where company_id = (select id from public.companies where slug = 'demo-a') and source = 'web_form' and status = 'nuevo';`
4. En n8n abre "Recordatorio de prospectos sin atender" → **Execute workflow**. Debe llegar un correo con la lista.
5. Ejecuta otra vez: **no** debe llegar un segundo correo (ya quedó marcado).
6. En el panel de Demo A, tarjeta "Automatizaciones": deben aparecer "Aviso al vendedor" y "Recordatorio al vendedor".

### Activar
Publica (activa) el flujo de recordatorios en n8n. Mientras `lead_reminder_hours = 0` en una empresa, no recibe nada.

### Pausar
- Una empresa: `update public.companies set lead_reminder_hours = 0 where slug = '...';` (y `lead_assignment = 'ninguna'` para dejar de asignar).
- Todas: desactiva el flujo de recordatorios en n8n.

### Qué pasa si algo falla
- Si Gmail falla, el flujo registra "Aviso al vendedor / Recordatorio al vendedor · Con error" en el panel de esa empresa. Ese aviso no se reenvía solo; el siguiente recordatorio sale cuando vuelva a cumplirse el plazo.
- Si n8n reintenta guardar un prospecto, `requestId` evita que se cuente dos veces y no se repite el correo.

## Pruebas del SQL
`npm run test:db` carga todas las migraciones en un Postgres en memoria (PGlite) y comprueba asignación,
reintentos, recordatorios, permisos y aislamiento entre empresas con datos ficticios.
