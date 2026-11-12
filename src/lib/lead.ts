/**
 * Validación del formulario de diagnóstico.
 * Se usa en el navegador (mensajes inmediatos) y en el servidor (la que manda).
 */
export type LeadInput = {
  name: string;
  company: string;
  phone: string;
  email: string;
  system: string;
  message: string;
};
export type LeadErrors = Partial<Record<"name" | "company" | "phone" | "email", string>>;

const LIMITS = { name: 120, company: 160, phone: 40, email: 160, system: 80, message: 2000 } as const;

export function normalizeLead(raw: Record<string, unknown>): LeadInput {
  const s = (k: keyof typeof LIMITS) => String(raw[k] ?? "").trim().slice(0, LIMITS[k]);
  return { name: s("name"), company: s("company"), phone: s("phone"), email: s("email").toLowerCase(), system: s("system"), message: s("message") };
}

export function validateLead(d: LeadInput): LeadErrors {
  const e: LeadErrors = {};
  if (!d.name) e.name = "Escribe tu nombre.";
  if (!d.company) e.company = "Escribe el nombre de tu empresa.";
  if (!/^\+?[\d\s-]{7,20}$/.test(d.phone)) e.phone = "Escribe un WhatsApp válido, por ejemplo +593 99 999 9999.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) e.email = "Escribe un correo válido.";
  return e;
}
