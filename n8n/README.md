# Flujos de n8n

| Archivo | Qué hace |
|---|---|
| `brich-formulario-diagnostico.json` | Recibe el formulario de la web (protegido con la cabecera `x-brich-secret`), registra el prospecto en Supabase con `register_web_lead`, responde OK y luego envía un aviso por correo. |
| `nodo-aviso-por-correo.json` | Solo el nodo de Gmail, para pegarlo en un flujo ya existente. |

## Credenciales (se crean en n8n, nunca en este repositorio)
- **BRich · Clave del formulario** (Header Auth): nombre `x-brich-secret`, valor = el mismo que `N8N_WEBHOOK_SECRET` en Vercel.
- **Gmail** (OAuth2, "Sign in with Google"): la cuenta que envía los avisos.
- **Supabase · Clave secreta** (Header Auth): nombre `apikey`, valor = Secret key de Supabase.
