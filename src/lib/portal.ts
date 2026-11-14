import { createClient } from "@/lib/supabase/server";
import { LEAD_STATUS, type LeadStatus } from "@/lib/lead-status";

export { LEAD_STATUS };

export type Company = { id: string; name: string; is_demo: boolean };
export type Profile = { id: string; full_name: string | null; role: string; company_id: string };
export type Lead = {
  id: string;
  name: string;
  company_name: string | null;
  interest: string | null;
  status: LeadStatus;
  source: string;
  assigned_to: string | null;
  phone?: string | null;
  email?: string | null;
  contact_count?: number;
  created_at: string;
};
export type Run = {
  id: string;
  system: "sales" | "ai-assistant" | "operations";
  name: string;
  status: "ok" | "error" | "en_proceso";
  detail: string | null;
  ran_at: string;
};

export const RUN_STATUS: Record<Run["status"], string> = { ok: "Funcionando", error: "Con error", en_proceso: "En proceso" };
export const SYSTEM_NAME: Record<Run["system"], string> = {
  sales: "Sales System",
  "ai-assistant": "AI Assistant",
  operations: "Operations System",
};

/** Usuario, perfil y empresa de la sesión actual. Todo filtrado por RLS en la base de datos. */
export async function getSessionContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null, company: null } as const;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, company_id")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const { data: company } = profile
    ? await supabase.from("companies").select("id, name, is_demo").eq("id", profile.company_id).maybeSingle<Company>()
    : { data: null };

  return { supabase, user, profile, company } as const;
}

const TZ = "America/Guayaquil";
export const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("es-EC", { day: "numeric", month: "short", timeZone: TZ }).format(new Date(iso));
export const fmtDateTime = (iso: string) =>
  new Intl.DateTimeFormat("es-EC", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(
    new Date(iso),
  );

/** Resumen para el dashboard a partir de los prospectos de la empresa. */
export function summarize(leads: Lead[], now = new Date()) {
  const DAY = 86_400_000;
  const since30 = now.getTime() - 30 * DAY;
  const last30 = leads.filter((l) => new Date(l.created_at).getTime() >= since30);
  const count = (s: Lead["status"][]) => last30.filter((l) => s.includes(l.status)).length;

  const kpis = {
    total: last30.length,
    contacted: count(["contactado", "en_seguimiento", "ganado", "perdido"]),
    followUp: count(["en_seguimiento"]),
    won: count(["ganado"]),
  };

  // Prospectos por semana, últimas 8 semanas (la última termina hoy).
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const end = now.getTime() - (7 - i) * 7 * DAY;
    const start = end - 7 * DAY;
    const n = leads.filter((l) => {
      const t = new Date(l.created_at).getTime();
      return t > start && t <= end;
    }).length;
    return { label: fmtDate(new Date(start + DAY).toISOString()), n };
  });

  return { kpis, weeks };
}
