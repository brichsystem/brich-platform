# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Pymes de servicios en Ecuador** (construcción, salud, educación, servicios profesionales). El dueño atiende hoy los prospectos a mano por WhatsApp; todo pasa por él y no sabe cuántas consultas llegan ni cuántas se cierran.
- **Empresas medianas con equipo comercial** y varios vendedores, que necesitan orden y control del proceso de ventas: quién atiende a cada prospecto y qué quedó sin seguimiento.
- Usuarios secundarios: los vendedores y responsables de cada empresa cliente, que usan el portal privado a diario; y los prospectos de esas empresas, que llenan el formulario público `/f/<slug>`.

## Product Purpose
BRich System (Quito) diseña, implementa y administra **sistemas empresariales de automatización**, no herramientas ni workflows sueltos. El cliente usa el sistema sin tocar la parte técnica; BRich lo mantiene funcionando. La web pública existe para que un dueño entienda qué problema resuelve cada sistema y pida un diagnóstico.

## Positioning
Un sistema completo y administrado por BRich (captación → registro → asignación → aviso → seguimiento → panel), con aislamiento de datos por empresa y un portal propio para cada cliente. BRich se encarga de diseñar, implementar, supervisar y mejorar; el cliente dirige su negocio.

## Operating Context
- Catálogo de 3 sistemas: **Sales System** (funciona hoy), **AI Assistant** (siguiente) y **Operations System** (después). Contenido en `src/lib/systems.ts`.
- Proceso comercial: diagnóstico → diseño → implementación → acompañamiento.
- El contacto principal en Ecuador es WhatsApp; el formulario de diagnóstico pide WhatsApp y correo.
- Superficies: web pública (inicio, `/sistemas/[slug]`), formulario por cliente `/f/[slug]`, `/login`, portal `/portal`, alta de clientes `/alta/[code]`.

## Capabilities and Constraints
- Next.js 15 (App Router) + TypeScript + CSS plano, desplegado en Vercel. Supabase (auth, datos, RLS) y n8n.
- WhatsApp solo mediante la API oficial de Meta o un proveedor autorizado.
- El portal muestra a cada cliente solo los datos de su empresa.

## Brand Commitments
Binding (Brand Book v1.0, ver `CLAUDE.md`):
- Colores solo desde `src/styles/tokens.css`: BRich Blue `#1C96BC`, Navy `#0B1726`, Ice `#EDF3F6`, Steel `#7F97A6`, Cyan `#5CD4E8`, blanco.
- Títulos en Montserrat 800/700/600; texto e interfaz en Inter 400/500/600.
- Logo solo desde `src/components/Logo.tsx` (PNG provisionales en `public/brand/` hasta tener el SVG oficial); nunca escribir "BRich" con una fuente como logo; ancho mínimo 120px.
- Botón primario: BRich Blue, 48px de alto, radio 8px, texto blanco 18px bold. Tarjetas: radio 12px, borde `--border-subtle`, padding 24px.
- Blanco sobre BRich Blue solo en textos grandes; párrafos en Navy sobre claro o blanco sobre Navy.
- Espaciado en múltiplos de 8px.
- Voz: español de Ecuador, directa y concreta, de tú. Evitar "se automatiza sola", garantías, "10X", "la IA reemplaza a tu equipo".

## Evidence on Hand
- **Ninguna evidencia comercial aún:** sin clientes publicables, testimonios, casos, cifras ni fotografías propias. No fabricarlas.
- Todo dato de ejemplo lleva la etiqueta "Demostrativo".
- Lo que sí es real y demostrable: el producto mismo (formulario, registro, asignación, avisos, panel), que puede mostrarse con datos demostrativos.

## Product Principles
1. Vender sistemas, no herramientas: cada pieza se explica dentro del recorrido completo.
2. Mostrar en vez de prometer: sin evidencia propia, el producto funcionando (con datos demostrativos) es la prueba.
3. Claridad para el dueño: lenguaje de negocio, no técnico; el problema antes que la solución.
4. Honestidad verificable: nada inventado, ninguna garantía.
5. Responsabilidades claras: qué hace BRich y qué hace el cliente.

## Accessibility & Inclusion
Contraste según el Brand Book (blanco sobre BRich Blue solo en textos grandes). Uso frecuente desde celular: la web debe funcionar bien a 390px de ancho.
