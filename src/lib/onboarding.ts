/** Alta de clientes: datos que el cliente entrega en /alta/<código>. Sin código de servidor: sirve en el navegador. */

export type OnboardingPerson = { name: string; email: string; phone: string; owner: boolean; seller: boolean };
export type OnboardingData = {
  company: string;
  services: string[];
  notifyEmails: string[];
  people: OnboardingPerson[];
  rotate: boolean;
  reminderHours: number;
};
export type OnboardingErrors = Record<string, string>;

export const ONBOARDING_CODE = /^[0-9a-f]{32}$/;
export const REMINDER_OPTIONS = [
  { hours: 4, label: "A las 4 horas" },
  { hours: 24, label: "A las 24 horas (recomendado)" },
  { hours: 48, label: "A las 48 horas" },
  { hours: 0, label: "No enviar recordatorios" },
] as const;
export const MAX_SERVICES = 5;
export const MAX_PEOPLE = 10;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Limpia lo recibido: recorta textos, descarta filas vacías y campos desconocidos. */
export function normalizeOnboarding(raw: unknown): OnboardingData {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const list = (v: unknown) => (Array.isArray(v) ? v : []);
  const hours = Number(r.reminderHours);
  return {
    company: str(r.company, 120),
    services: list(r.services).map((s) => str(s, 80)).filter(Boolean).slice(0, MAX_SERVICES),
    notifyEmails: list(r.notifyEmails).map((s) => str(s, 160).toLowerCase()).filter(Boolean).slice(0, 3),
    people: list(r.people)
      .map((p) => {
        const o = (p && typeof p === "object" ? p : {}) as Record<string, unknown>;
        return { name: str(o.name, 120), email: str(o.email, 160).toLowerCase(), phone: str(o.phone, 40), owner: o.owner === true, seller: o.seller === true };
      })
      .filter((p) => p.name || p.email || p.phone)
      .slice(0, MAX_PEOPLE),
    rotate: r.rotate === true,
    reminderHours: REMINDER_OPTIONS.some((o) => o.hours === hours) ? hours : 24,
  };
}

/** Errores por campo. Las claves de personas son "people.<n>.<campo>". */
export function validateOnboarding(d: OnboardingData): OnboardingErrors {
  const e: OnboardingErrors = {};
  if (d.company.length < 2) e.company = "Escribe el nombre de tu empresa.";
  if (d.services.length === 0) e.services = "Escribe al menos un servicio o producto.";
  if (d.notifyEmails.length === 0) e.notifyEmails = "Escribe al menos un correo para los avisos.";
  else if (d.notifyEmails.some((m) => !EMAIL.test(m))) e.notifyEmails = "Revisa los correos: alguno no es válido.";

  if (d.people.length === 0) e.people = "Agrega al menos una persona.";
  const seen = new Set<string>();
  d.people.forEach((p, i) => {
    if (p.name.length < 2) e[`people.${i}.name`] = "Escribe nombre y apellido.";
    if (!EMAIL.test(p.email)) e[`people.${i}.email`] = "Escribe un correo válido.";
    else if (seen.has(p.email)) e[`people.${i}.email`] = "Este correo está repetido: cada persona necesita el suyo.";
    seen.add(p.email);
    if (p.phone.replace(/\D/g, "").length < 7) e[`people.${i}.phone`] = "Escribe el WhatsApp con código de país.";
  });
  if (d.people.length > 0 && !d.people.some((p) => p.owner)) e.people = "Marca al menos una persona como responsable de la cuenta.";
  return e;
}
