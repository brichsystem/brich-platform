# Flujos de n8n

| Archivo | Qué hace |
|---|---|
| `brich-formulario-diagnostico.json` | Recibe el formulario de la web (protegido con la cabecera `x-brich-secret`), registra el prospecto en Supabase con `register_web_lead` y responde OK. |

## Credenciales (se crean en n8n, nunca en este repositorio)
- **BRich · Clave del formulario** (Header Auth): nombre `x-brich-secret`, valor = el mismo que `N8N_WEBHOOK_SECRET` en Vercel.
- **Supabase · Clave secreta** (Header Auth): nombre `apikey`, valor = Secret key de Supabase.
