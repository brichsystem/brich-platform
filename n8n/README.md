# Flujos de n8n

| Archivo | Qué hace |
|---|---|
| `brich-formulario-diagnostico.json` | Flujo central. Recibe el formulario de la web de BRich y de las páginas `/f/<slug>` de clientes (protegido con `x-brich-secret`), registra el prospecto en la empresa indicada por `companySlug` (por defecto `brich`), responde OK y envía el aviso a los `notify_emails` de esa empresa. |
| `nodo-aviso-por-correo.json` | Solo el nodo de Gmail, para pegarlo en un flujo ya existente. |

## Credenciales (se crean en n8n, nunca en este repositorio)
- **BRich · Clave del formulario** (Header Auth): nombre `x-brich-secret`, valor = el mismo que `N8N_WEBHOOK_SECRET` en Vercel.
- **Gmail** (OAuth2, "Sign in with Google"): la cuenta que envía los avisos.
- **Supabase · Clave secreta** (Header Auth): nombre `apikey`, valor = Secret key de Supabase.
