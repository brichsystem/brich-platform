import Image from "next/image";

/**
 * Logo oficial de BRich. Nunca reemplazar por texto ni redibujar.
 * Variantes (Brand Book pág. 4):
 *  - white: blanco, para fondos navy o BRich Blue
 *  - navy:  navy, para fondos claros
 * Ancho mínimo digital: 120px (altura >= 36px con estas proporciones).
 * PROVISIONAL: extraído del PNG original. Reemplazar por SVG oficial cuando esté disponible.
 */
const SIZE = { width: 503, height: 151 };

export function Logo({ variant = "white", height = 38 }: { variant?: "white" | "navy"; height?: number }) {
  const h = Math.max(height, 36);
  return (
    <Image
      src={`/brand/logo-${variant}.png`}
      alt="BRich"
      width={Math.round((SIZE.width / SIZE.height) * h)}
      height={h}
      priority
    />
  );
}
