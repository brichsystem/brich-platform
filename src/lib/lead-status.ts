/** Estados de un prospecto. Archivo sin código de servidor: se puede usar en el navegador. */
export const LEAD_STATUSES = ["nuevo", "contactado", "en_seguimiento", "ganado", "perdido"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS: Record<LeadStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  en_seguimiento: "En seguimiento",
  ganado: "Ganado",
  perdido: "Perdido",
};

export const isLeadStatus = (v: unknown): v is LeadStatus =>
  typeof v === "string" && (LEAD_STATUSES as readonly string[]).includes(v);
