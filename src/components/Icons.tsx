/**
 * Iconos reutilizables (sprite SVG). Se usan con <svg><use href="#spark" /></svg>.
 * - spark: destello de 4 puntas, elemento gráfico de marca (pág. 6). No es el logo.
 * - check: icono de línea de 2px (pág. 6).
 */
export function Icons() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <symbol id="spark" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0Z"
        />
      </symbol>
      <symbol id="check" viewBox="0 0 24 24">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 6 9 17l-5-5"
        />
      </symbol>
    </svg>
  );
}

export function Check() {
  return (
    <svg className="icon" aria-hidden="true">
      <use href="#check" />
    </svg>
  );
}

export function Spark() {
  return (
    <svg className="sparkle" aria-hidden="true">
      <use href="#spark" />
    </svg>
  );
}
