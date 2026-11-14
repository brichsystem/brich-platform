/** Países disponibles para el código de WhatsApp. Ecuador primero; el resto por nombre. */
export type Country = { iso: string; name: string; dial: string; example: string };

export const COUNTRIES: Country[] = [
  { iso: "EC", name: "Ecuador", dial: "+593", example: "99 999 9999" },
  { iso: "AR", name: "Argentina", dial: "+54", example: "9 11 2345 6789" },
  { iso: "BO", name: "Bolivia", dial: "+591", example: "7123 4567" },
  { iso: "BR", name: "Brasil", dial: "+55", example: "11 91234 5678" },
  { iso: "CL", name: "Chile", dial: "+56", example: "9 1234 5678" },
  { iso: "CO", name: "Colombia", dial: "+57", example: "300 123 4567" },
  { iso: "CR", name: "Costa Rica", dial: "+506", example: "8312 3456" },
  { iso: "SV", name: "El Salvador", dial: "+503", example: "7012 3456" },
  { iso: "ES", name: "España", dial: "+34", example: "612 34 56 78" },
  { iso: "US", name: "Estados Unidos", dial: "+1", example: "201 555 0123" },
  { iso: "GT", name: "Guatemala", dial: "+502", example: "5123 4567" },
  { iso: "HN", name: "Honduras", dial: "+504", example: "9123 4567" },
  { iso: "MX", name: "México", dial: "+52", example: "55 1234 5678" },
  { iso: "NI", name: "Nicaragua", dial: "+505", example: "8123 4567" },
  { iso: "PA", name: "Panamá", dial: "+507", example: "6123 4567" },
  { iso: "PY", name: "Paraguay", dial: "+595", example: "981 123 456" },
  { iso: "PE", name: "Perú", dial: "+51", example: "912 345 678" },
  { iso: "PR", name: "Puerto Rico", dial: "+1", example: "787 234 5678" },
  { iso: "DO", name: "República Dominicana", dial: "+1", example: "809 234 5678" },
  { iso: "UY", name: "Uruguay", dial: "+598", example: "94 123 456" },
  { iso: "VE", name: "Venezuela", dial: "+58", example: "412 123 4567" },
];

/** Une código de país y número local. Quita el 0 inicial (099… → +593 99…). */
export function fullPhone(dial: string, local: string) {
  const clean = local.replace(/[^\d\s-]/g, "").trim().replace(/^0+/, "");
  return clean ? `${dial} ${clean}` : "";
}
