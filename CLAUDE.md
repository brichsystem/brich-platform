# BRich Platform — guía para Claude Code

Plataforma web de BRich System: catálogo público de sistemas de automatización + (próximamente) portal privado de clientes.

## Stack
- Next.js 15 (App Router) + TypeScript, CSS plano (sin Tailwind).
- Fuentes self-hosted con @fontsource (Montserrat + Inter).
- Próximo: Supabase (auth, base de datos, RLS por empresa), n8n (automatizaciones).

## Reglas de marca (Brand Book v1.0) — obligatorias
- Colores SOLO desde `src/styles/tokens.css`. Nunca escribir HEX sueltos en componentes.
- Títulos: Montserrat 800/700/600. Texto e interfaz: Inter 400/500/600.
- Logo: solo `src/components/Logo.tsx` (archivos en `public/brand/`). Nunca escribir "BRich" con una fuente como logo. Ancho mínimo 120px.
- Botón primario: BRich Blue, 48px alto, radio 8px, texto blanco 18px bold. Tarjetas: radio 12px, borde --border-subtle, padding 24px.
- Blanco sobre BRich Blue (3,42:1) solo para textos grandes. Párrafos: Navy sobre claro o blanco sobre Navy.
- Espaciado en múltiplos de 8px.

## Reglas de contenido
- No inventar cifras, clientes, testimonios ni resultados.
- Todo dato de ejemplo lleva la etiqueta "Demostrativo".
- Evitar: "se automatiza sola", garantías, "10X", "la IA reemplaza a tu equipo".

## Seguridad
- Nunca poner claves privadas (service_role de Supabase, secretos de n8n) en código del navegador ni en el repositorio. Solo variables de entorno del servidor.

## Estructura
- `src/app/(site)/` web pública (inicio, `/sistemas/[slug]`)
- `src/app/login/` y `src/app/portal/` portal privado (resumen + /portal/prospectos con estados editables) (Supabase Auth; `src/middleware.ts` protege /portal)
- `src/lib/supabase/` clientes de Supabase (solo clave publicable)
- `src/lib/portal.ts` consultas y cálculos del dashboard
- `src/app/api/leads/` recibe el formulario y lo envía a n8n (N8N_LEAD_WEBHOOK_URL + N8N_WEBHOOK_SECRET, solo servidor)
- `n8n/` flujos de n8n exportados (sin credenciales)
- `supabase/migrations/` SQL de tablas y RLS (cada usuario lee solo su empresa; n8n escribe con register_web_lead; el cliente solo puede cambiar el estado de sus prospectos con set_lead_status)
- `src/components/` componentes reutilizables
- `src/lib/systems.ts` contenido del catálogo (editar aquí los textos de los sistemas)
- `src/styles/tokens.css` tokens oficiales de marca
