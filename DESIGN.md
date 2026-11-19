---
name: BRich Platform · Web pública
description: Comprobante numerado. La web pública de BRich es un documento de registro: hojas blancas sobre Ice, tinta Navy, reglas finas y un sello que se estampa.
colors:
  brich-blue: "#1c96bc"
  brich-navy: "#0b1726"
  brich-white: "#ffffff"
  brich-ice: "#edf3f6"
  brich-steel: "#7f97a6"
  brich-cyan: "#5cd4e8"
  text-primary: "#0b1726"
  text-secondary: "#526779"
  border-subtle: "#d9e3e9"
  surface-muted: "#f7fafc"
  error: "#b42318"
  tint-blue: "#edf7fa"
  tint-cyan: "#dbf6fa"
typography:
  display:
    fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(32px, 4.2vw, 52px)"
    fontWeight: 800
    lineHeight: 1.06
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(24px, 2.6vw, 32px)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.01em"
  caption:
    fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    letterSpacing: "0.08em"
  stamp:
    fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 800
    letterSpacing: "0.08em"
  body-lead:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "0.06em"
  button:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
rounded:
  tag: "4px"
  seal: "6px"
  button: "8px"
  sheet: "12px"
spacing:
  unit: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "40px"
  desk-bottom: "80px"
components:
  button-primary:
    backgroundColor: "{colors.brich-blue}"
    textColor: "{colors.brich-white}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "0 24px"
    height: "48px"
  link-underline:
    textColor: "{colors.brich-navy}"
    typography: "{typography.label}"
  sheet:
    backgroundColor: "{colors.brich-white}"
    rounded: "{rounded.sheet}"
    padding: "32px"
  field-box:
    backgroundColor: "{colors.brich-white}"
    textColor: "{colors.text-primary}"
    padding: "12px 16px"
  field-box-label:
    textColor: "{colors.text-secondary}"
    typography: "{typography.label}"
  stamp-slot:
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.button}"
    height: "88px"
    width: "200px"
  stamp:
    backgroundColor: "{colors.tint-cyan}"
    textColor: "{colors.brich-blue}"
    typography: "{typography.stamp}"
    rounded: "{rounded.button}"
    padding: "8px 16px"
  status-seal:
    backgroundColor: "{colors.tint-blue}"
    textColor: "{colors.brich-navy}"
    rounded: "{rounded.seal}"
    padding: "1px 8px"
  demo-tag:
    textColor: "{colors.text-secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.tag}"
    padding: "2px 8px"
  nav-header:
    backgroundColor: "{colors.brich-white}"
    textColor: "{colors.text-secondary}"
    padding: "16px"
---

# Design System: BRich Platform · Web pública

## Overview

**Creative North Star: "El comprobante numerado"**

La web pública de BRich no es una landing: es un documento de registro. Cada página es una hoja blanca apoyada sobre un escritorio Ice, escrita en tinta Navy, dividida por reglas finas como un formulario impreso, con cajas de datos, campos rotulados y una casilla donde se estampa el sello. La promesa del producto (ninguna consulta queda sin registro ni responsable) se demuestra con la forma: el visitante llena la solicitud en la primera hoja y la ve sellada como RECIBIDA, con la fecha y la hora reales.

La densidad es la de un papel administrativo bien hecho: mucha información ordenada en filas, columnas y reglas, nunca en tarjetas sueltas. La jerarquía la dan el asunto en Montserrat 800, las reglas gruesas Navy que abren cada tabla o lista, y los rótulos pequeños en mayúsculas. El color es casi monocromo (Navy sobre blanco y Ice); BRich Blue marca acción y estado, y el Cyan existe solo como tinta del sello.

Este mundo reemplaza el aspecto anterior (una landing SaaS genérica con fondos navy). Rechaza de forma explícita el héroe dividido con tarjeta de producto y la fila de tres tarjetas iguales.

**Alcance.** Este sistema cubre solo la web pública: inicio (`src/app/(site)/page.tsx`), fichas `/sistemas/[slug]`, cabecera, pie y la página 404 (`src/app/not-found.tsx`). Sus estilos viven en `src/app/(site)/site.css`, sobre la base compartida de `src/app/globals.css`. El portal de clientes (`/portal`), `/login`, el formulario por cliente `/f/[slug]` y el alta `/alta/[code]` todavía usan el estilo anterior (globals.css y su propio CSS) y se migrarán más adelante; no forman parte de este mundo y no deben tomarse como referencia de él.

**Reglas de marca obligatorias (Brand Book v1.0, `CLAUDE.md`).** Este documento las hereda y no puede contradecirlas:
- Colores solo desde `src/styles/tokens.css`. Nunca HEX sueltos en componentes.
- Títulos en Montserrat 800/700/600; texto e interfaz en Inter 400/500/600.
- Logo solo desde `src/components/Logo.tsx` (archivos en `public/brand/`); nunca escribir "BRich" con una fuente como logo; ancho mínimo 120px.
- Botón primario: BRich Blue, 48px de alto, radio 8px, texto blanco 18px bold. Tarjetas: radio 12px, borde `--border-subtle`, padding 24px.
- Blanco sobre BRich Blue (3,42:1) solo en textos grandes. Párrafos en Navy sobre claro o blanco sobre Navy.
- Espaciado en múltiplos de 8px.
- Todo dato de ejemplo lleva la etiqueta "Demostrativo".

**Key Characteristics:**
- Hojas blancas (radio 12px, sombra suave) sobre escritorio Ice.
- Secciones como partes de un documento, separadas por reglas de 1px `--border-subtle`; tablas y listas abren con una regla Navy de 2px.
- Formulario como grilla de campos en caja con rótulo en mayúsculas dentro de la caja.
- Sellos de estado con borde doble en BRich Blue; el sello RECIBIDA se estampa al enviar.
- Cifras tabulares en horas, fechas y numerales.

## Colors

Paleta casi monocroma de tinta y papel: Navy sobre blanco y Ice, con BRich Blue como única voz de acción y estado. Todos los valores salen de `src/styles/tokens.css`; los tintes se derivan con `color-mix()` en `site.css`.

### Primary
- **BRich Blue** (`--brich-blue`): botón primario, subrayado de enlaces, borde doble de sellos, punto de la pista completada, íconos de verificación, anillo de foco de los campos y `outline` de `:focus-visible`. Es acción o estado, nunca decoración.

### Secondary
- **Cyan de sello** (`--brich-cyan`): solo como tinta del sello RECIBIDA, a través del tinte `--tint-cyan` (22% Cyan sobre blanco). No aparece en ningún otro elemento de la página.

### Neutral
- **Navy tinta** (`--brich-navy` / `--text-primary`): todo texto principal, títulos, enlaces, texto dentro de los sellos de estado y las reglas gruesas (`--rule-strong`, 2px).
- **Gris pizarra** (`--text-secondary`): párrafos de apoyo, rótulos de campos, cabeceras de tabla, `dt` de las cajas de datos, navegación en reposo. Contraste 5,87:1 sobre blanco.
- **Acero** (`--brich-steel`): solo trazos no textuales: borde punteado de la casilla del sello, borde de la etiqueta "Demostrativo", círculos vacíos de la pista, barra de desplazamiento. No es color de texto pequeño (3,05:1).
- **Papel** (`--brich-white`): la hoja, la cabecera, el pie y el fondo de cada campo.
- **Escritorio Ice** (`--brich-ice`): el fondo de la página, sobre el que se apoyan las hojas.
- **Regla fina** (`--border-subtle`): todas las reglas de 1px (`--rule`) y, como fondo de la grilla del formulario, las líneas de 1px entre campos.
- **Pie de documento** (`--surface-muted`): fondo de la franja de cierre de la hoja de detalle.
- **Tinte azul** (`--tint-blue`, 8% Blue): fondo de los sellos de estado de la bitácora.
- **Error** (`--error`): texto de error y anillo interior de 2px del campo inválido.

### Named Rules
**Regla de la tinta de sello.** El Cyan es tinta de sello: su único uso visible es el fondo del sello RECIBIDA. Ni fondos, ni íconos, ni acentos, ni foco. (El resaltado de selección de texto usa hoy una mezcla de Cyan al 45%; es la única excepción presente en el código y no se extiende a nada más.)

**Regla del token.** Ningún color se escribe como HEX o `rgba()` en un componente. Si hace falta un tono nuevo, se deriva de un token con `color-mix()` en `site.css`, como `--tint-blue` y `--tint-cyan`.

**Regla del azul que habla.** BRich Blue con texto blanco encima solo existe en el botón primario (18px bold). Párrafos y textos pequeños van siempre en Navy o en `--text-secondary` sobre claro.

## Typography

**Display Font:** Montserrat (con `ui-sans-serif, system-ui, sans-serif`)
**Body Font:** Inter (con `ui-sans-serif, system-ui, sans-serif`)

**Character:** Montserrat pesado da al asunto el peso de un encabezado de formulario oficial; Inter lleva los datos, los rótulos y los campos con la neutralidad de un documento administrativo. Ambas se cargan self-hosted con @fontsource.

### Hierarchy
- **Display** (Montserrat 800, `clamp(32px, 4.2vw, 52px)`, 1.06, -0.025em, máx. 21ch): el asunto de cada hoja; el h1 de inicio, de cada ficha de sistema y de la 404, y el h2 de la solicitud compacta.
- **Headline** (Montserrat 700, `clamp(24px, 2.6vw, 32px)`, 1.12, -0.015em, máx. 30ch): título de cada parte del documento.
- **Title** (Montserrat 700, 18px): títulos de fila (observaciones, condiciones, etapas, subtítulos de ficha). Variantes: nombre de sistema en tabla (19px) y título de solicitud registrada (24px).
- **Caption** (Montserrat 700, 14px, 0.08em, mayúsculas): título de la caja de datos ("Solicitud de diagnóstico", "Ficha de sistema") y `dt` de la franja compacta. Es un rótulo de documento, no un antetítulo.
- **Stamp** (Montserrat 800, 26px, 0.08em, mayúsculas): solo el texto del sello RECIBIDA.
- **Body lead** (Inter 400, 18px; 17px en celular; máx. 62ch): párrafo bajo el asunto.
- **Body** (Inter 400, 17px, 1.6): texto base; las celdas de apoyo bajan a 15–16px y los datos a 14px.
- **Label** (Inter 600, 12px, 0.06em, mayúsculas): rótulos de campo, cabeceras de tabla, etiqueta "Demostrativo", texto de la casilla vacía.
- **Button** (Inter 700, 18px): botón primario, según la regla de marca "texto blanco 18px bold".

### Named Rules
**Regla del asunto.** Montserrat 800 se reserva para el asunto de la hoja y para el sello. Ningún otro título sube a 800.

**Regla de las cifras tabulares.** Horas, fechas, numerales de etapa y códigos de país usan `font-variant-numeric: tabular-nums` (clase `.num`), como en un comprobante.

## Layout

El modelo espacial es un escritorio con hojas. `.desk` centra una columna de hasta 1184px (contenido útil 1152px, igual que `.wrap` de cabecera y pie) con 32px entre hojas, 32px arriba y 80px abajo; los márgenes laterales respetan `env(safe-area-inset-*)` con un mínimo de 16px.

Dentro de una hoja el orden es fijo: cabecera del documento (caja del emisor 1.25fr y caja de datos 1fr, separadas por una regla vertical), asunto a ancho completo, y luego las partes, cada una con 40px × 32px de relleno y una regla superior. La solicitud continúa con la grilla de campos: seis columnas, cada campo ocupa dos, con 1px de separación que deja ver `--border-subtle` como regla. La fila final del formulario reúne la casilla del sello (200px), el texto legal y el botón (mínimo 240px).

Las tablas, observaciones, bitácora, condiciones y etapas abren con una regla Navy de 2px y separan sus filas con reglas de 1px. Las condiciones van en dos columnas con regla vertical; las etapas en columnas automáticas de 180px mínimo.

Puntos de quiebre:
- **≤1000px (tableta):** campos a media fila (3 de 6), el mensaje a ancho completo; la tabla de sistemas oculta la columna "Para quién".
- **≤860px:** se oculta la navegación; queda logo y botón.
- **≤760px (celular):** cabecera del documento apilada y sin logo dentro de la hoja (el logo queda en la cabecera del sitio); rellenos de 16px; un campo por fila; la pista de estado pasa a vertical con regla izquierda; tabla, condiciones y etapas en una columna; la bitácora reordena hora y sello arriba; el botón de cierre ocupa todo el ancho.
- **≤420px:** el botón de la cabecera se mantiene visible con 12px de relleno y el logo conserva su ancho completo (nunca se encoge por debajo de 120px).
- **≤359px:** el botón de la cabecera cambia a la etiqueta corta "Diagnóstico" (con `aria-label` completo) para no reducir el logo.

Espaciado: la escala es 8 / 16 / 24 / 32 / 40px, con 80px al pie del escritorio. Las anclas de sección usan `scroll-margin-top: 96px` para quedar bajo la cabecera fija.

### Named Rules
**Regla de la hoja.** Todo contenido vive dentro de una hoja. Las secciones se separan con reglas, nunca con tarjetas sueltas ni bloques de color a sangre.

**Regla de la regla gruesa.** Cada lista o tabla de datos abre con una regla Navy de 2px; sus filas se separan con reglas de 1px `--border-subtle`.

## Elevation & Depth

Sistema plano con una sola elevación: la hoja. `.sheet` se levanta del escritorio con una sombra doble, corta y difusa, derivada de Navy. Todo lo que hay dentro de la hoja es plano; la profundidad interna se expresa con reglas, con el anillo interior de 2px del campo enfocado y con el borde doble de los sellos. La cabecera del sitio es fija (`sticky`) y se separa del contenido con una regla inferior, no con sombra.

### Shadow Vocabulary
- **Hoja sobre escritorio** (`box-shadow: 0 1px 2px color-mix(in srgb, var(--brich-navy) 6%, transparent), 0 16px 40px -16px color-mix(in srgb, var(--brich-navy) 20%, transparent)`): solo en `.sheet`.
- **Lista desplegable** (`box-shadow: 0 16px 32px rgba(11, 23, 38, 0.16)`): menú del selector de código de país (base compartida en `globals.css`).

### Named Rules
**Regla de una sola elevación.** Solo la hoja proyecta sombra (más el menú flotante del selector de país). Campos, filas, sellos y botones son planos.

## Shapes

Lenguaje de papel cortado: rectángulos, reglas rectas y esquinas apenas suavizadas. La escala de radios es corta y cada paso tiene un dueño: 12px la hoja, 8px el botón, la casilla del sello y el sello, 6px el sello de estado de la bitácora, 4px las etiquetas. Los campos del formulario no tienen radio: son celdas de una grilla. Los bordes son de cuatro clases: regla fina de 1px, regla gruesa Navy de 2px, borde punteado de 1,5px en Acero (casilla vacía) y borde doble en BRich Blue (4px en el sello, 3px en el sello de estado). El sello estampado se inclina -5°. Los únicos círculos son los puntos de 12px de la pista de estado.

## Components

### Buttons
Directo y de una sola pieza, sin sombra ni gradiente.
- **Shape:** esquinas suaves (`--radius-button`).
- **Primary:** BRich Blue con texto blanco Inter 700 18px, 48px de alto, 24px de relleno lateral (20px en la cabecera, 12px a ≤420px). En el formulario mide al menos 240px; en el cierre de celular, todo el ancho.
- **Hover / Focus / Active:** hover aclara con `filter: brightness(1.08)` (0,2s); al presionar escala a 0,97 en 160ms con `--ease-out`; foco con `outline` de 2px en BRich Blue y 3px de separación. Desactivado (enviando): opacidad 0,6 y texto "Enviando…".
- **Enlace subrayado** (`.btn-link`, `.ver a`): Navy 15px 600, subrayado BRich Blue de 2px a 4px de distancia; en hover el subrayado pasa a Navy. Es la acción secundaria ("Ver ficha →", "Ingresar al portal →", "Registrar otra solicitud").

### Chips
- **Etiqueta "Demostrativo":** Label 12px en mayúsculas, texto `--text-secondary`, borde 1px Acero, radio 4px. Obligatoria junto a todo dato de ejemplo.
- **Etiquetas de herramientas:** Inter 500 14px, borde de regla fina, radio 4px, sin fondo.

### Cards / Containers
- **Hoja (`.sheet`):** blanca, radio 12px, sombra "Hoja sobre escritorio", sin borde. Rellenos internos de 32px (16px en celular).
- **Cabecera del documento:** caja del emisor (logo, "BRich System", ciudad) y caja de datos con `dl` en dos columnas (96px y resto), filas separadas por reglas finas.
- **Franja compacta:** versión de una línea de la caja de datos, para la solicitud que va debajo de otra hoja.
- **Cierre:** franja `--surface-muted` con regla Navy superior, frase de cierre y botón primario.

### Inputs / Fields
- **Style:** cada campo es una celda blanca de la grilla, 12px × 16px de relleno, con el rótulo Label en `--text-secondary` dentro de la celda y el control sin borde, sin fondo y sin radio, en Inter 17px.
- **Focus:** anillo interior de 2px en BRich Blue sobre toda la celda (`box-shadow: inset`), con transición de 160ms.
- **Error:** anillo interior de 2px en `--error` y mensaje de 13px bajo el control; al enfocarlo, el anillo vuelve a BRich Blue.
- **WhatsApp:** botón de código de país (bandera, prefijo tabular, flecha) separado del número por una regla vertical.

### Navigation
- **Cabecera:** blanca, fija arriba, con regla inferior. Logo navy a la izquierda; a la derecha, enlaces Inter 600 14px en mayúsculas (0.04em) en `--text-secondary` que pasan a Navy en hover, y el botón primario "Pedir diagnóstico". A ≤860px desaparecen los enlaces.
- **Pie:** blanco con regla superior; logo, lema, enlace al portal (Navy con subrayado BRich Blue) y copyright, en `--text-secondary`.

### Sello y casilla (componente firma)
- **Casilla vacía:** 200 × 88px (72px de alto en celular), borde punteado Acero de 1,5px, radio 8px, con la palabra "SELLO" en Label. Vive en la fila final del formulario.
- **Sello RECIBIDA:** Montserrat 800 26px en mayúsculas, BRich Blue sobre `--tint-cyan`, borde doble de 4px BRich Blue, radio 8px, inclinado -5°, con la fecha y hora reales debajo en Inter 600 12px Navy y cifras tabulares.
- **Estampado:** al enviar, `estampar` (420ms, `--ease-out`) lleva el sello de escala 1,35, -9° y desenfoque de 6px a su posición final. Con `prefers-reduced-motion` solo aparece por opacidad en 200ms.
- **Pista de estado:** cuatro pasos sobre una regla Navy de 2px; el paso hecho tiene punto BRich Blue relleno, texto Navy 600 y la hora real; los pendientes, punto vacío con borde Acero.

### Bitácora (recorrido demostrativo)
Filas de hora tabular, evento, responsable y sello de estado. El sello de estado es Label 12px en Inter 700, mayúsculas, texto Navy sobre `--tint-blue`, borde doble de 3px BRich Blue y radio 6px. La sección lleva siempre la etiqueta "Demostrativo".

## Do's and Don'ts

### Do:
- **Do** tomar todos los colores de `src/styles/tokens.css` y derivar tintes con `color-mix()` a partir de esos tokens.
- **Do** poner cada contenido nuevo dentro de una hoja (`.sheet`), como una parte con su regla superior.
- **Do** abrir cada tabla o lista de datos con la regla Navy de 2px y separar filas con reglas de 1px `--border-subtle`.
- **Do** usar el borde doble en BRich Blue para cualquier estado (sello de estado de 3px, sello de 4px).
- **Do** escribir horas, fechas y numerales con cifras tabulares (`.num`).
- **Do** etiquetar como "Demostrativo" todo nombre, hora o dato de ejemplo.
- **Do** usar el logo solo mediante `src/components/Logo.tsx`, con al menos 120px de ancho.
- **Do** respetar el botón primario de marca: BRich Blue, 48px, radio 8px, texto blanco 18px bold.

### Don't:
- **Don't** construir un héroe dividido con tarjeta de producto ni una fila de tres tarjetas iguales.
- **Don't** usar Cyan fuera del sello RECIBIDA.
- **Don't** escribir HEX o `rgba()` sueltos en componentes.
- **Don't** usar Acero (`--brich-steel`) para texto pequeño; los rótulos van en `--text-secondary`.
- **Don't** poner párrafos o textos pequeños en blanco sobre BRich Blue.
- **Don't** usar Montserrat 800 fuera del asunto y del sello.
- **Don't** añadir sombras dentro de la hoja; la única elevación es la hoja sobre el escritorio.
- **Don't** usar la clase `.eyebrow`, `.btn-ghost`, `.on-navy` ni el encabezado navy de `globals.css` en este mundo: pertenecen al estilo anterior que aún usan portal, login, `/f/[slug]` y alta.
- **Don't** escribir "BRich" con una fuente como si fuera el logo.
