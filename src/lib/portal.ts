import { createClient } from "@/lib/supabase/server";
import { LEAD_STATUS, type LeadStatus } from "@/lib/lead-status";

export { LEAD_STATUS };

export type Company = { id: string; name: string; is_demo: boolean; lead_reminder_hours?: number };
export type TeamMember = { id: string; full_name: string; receives_leads: boolean };
export type Profile = { id: string; full_name: string | null; role: string; company_id: string };
export type Lead = {
  id: string;
  name: string;
  company_name: string | null;
  interest: string | null;
  status: LeadStatus;
  source: string;
  assigned_to: string | null;
  assigned_user_id?: string | null;
  attention_since?: string | null;
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
    ? await supabase.from("companies").select("*").eq("id", profile.company_id).maybeSingle<Company>()
    : { data: null };

  return { supabase, user, profile, company } as const;
}

/** Personas de la empresa (para elegir responsable). Si la base aún no tiene la función, devuelve lista vacía. */
export async function getTeam(supabase: Awaited<ReturnType<typeof createClient>>): Promise<TeamMember[]> {
  const { data, error } = await supabase.rpc("company_team");
  if (error) {
    console.error("[portal] company_team:", error.message);
    return [];
  }
  return (data ?? []) as TeamMember[];
}

/** Prospectos en "nuevo", del que más espera al más reciente. */
export function pendingLeads(leads: Lead[], reminderHours = 0, now = new Date()) {
  return leads
    .filter((l) => l.status === "nuevo")
    .map((l) => {
      const hours = Math.max(0, Math.floor((now.getTime() - new Date(l.attention_since ?? l.created_at).getTime()) / 3_600_000));
      return { lead: l, hours, late: reminderHours > 0 && hours >= reminderHours };
    })
    .sort((a, b) => b.hours - a.hours);
}

/** "3 h", "2 días". */
export const fmtWait = (hours: number) =>
  hours < 1 ? "menos de 1 h" : hours < 48 ? `${hours} h` : `${Math.floor(hours / 24)} días`;

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
