"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isLeadStatus } from "@/lib/lead-status";

export type StatusResult = { ok: true } | { ok: false; error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Cambia el estado de un prospecto.
 * La base de datos (set_lead_status) vuelve a comprobar que el prospecto
 * sea de la empresa del usuario: aunque alguien manipule el navegador,
 * no puede tocar prospectos de otra empresa ni cambiar otro dato.
 */
export async function updateLeadStatus(leadId: string, status: string): Promise<StatusResult> {
  if (!UUID.test(leadId) || !isLeadStatus(status)) {
    return { ok: false, error: "No se pudo guardar: el estado no es válido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu sesión expiró. Vuelve a ingresar." };

  const { error } = await supabase.rpc("set_lead_status", { p_lead_id: leadId, p_status: status });
  if (error) {
    console.error("[portal] set_lead_status:", error.message);
    return { ok: false, error: "No pudimos guardar el cambio. Inténtalo de nuevo." };
  }

  revalidatePath("/portal", "layout");
  return { ok: true };
}

/**
 * Cambia el responsable de un prospecto (userId = null lo deja sin asignar).
 * La base de datos (assign_lead) comprueba que quien lo pide sea el dueño de la cuenta
 * y que el prospecto y la persona elegida sean de su misma empresa.
 */
export async function assignLead(leadId: string, userId: string | null): Promise<StatusResult> {
  if (!UUID.test(leadId) || (userId !== null && !UUID.test(userId))) {
    return { ok: false, error: "No se pudo guardar: el responsable no es válido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu sesión expiró. Vuelve a ingresar." };

  const { error } = await supabase.rpc("assign_lead", { p_lead_id: leadId, p_user_id: userId });
  if (error) {
    console.error("[portal] assign_lead:", error.message);
    return { ok: false, error: "No pudimos guardar el cambio. Inténtalo de nuevo." };
  }

  revalidatePath("/portal", "layout");
  return { ok: true };
}
