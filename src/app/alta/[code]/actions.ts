"use server";

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/env";
import { normalizeOnboarding, validateOnboarding, ONBOARDING_CODE, type OnboardingErrors } from "@/lib/onboarding";

export type OnboardingResult = { ok: true } | { ok: false; error: string; errors?: OnboardingErrors };

/** Cliente sin sesión: la página de alta es pública y solo puede usar las dos funciones de alta. */
function anonClient() {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(6_000) }) },
  });
}

/** Nombre del cliente y si ya envió sus datos. null = el enlace no existe. Lanza error si Supabase no responde. */
export async function getOnboarding(code: string): Promise<{ label: string; submitted: boolean } | null> {
  if (!ONBOARDING_CODE.test(code)) return null;
  if (!supabaseConfigured) throw new Error("Supabase no está configurado");
  const { data, error } = await anonClient().rpc("get_onboarding", { p_code: code });
  if (error) throw new Error(error.message);
  const d = data as { label?: unknown; submitted?: unknown } | null;
  if (!d || typeof d.label !== "string") return null;
  return { label: d.label, submitted: d.submitted === true };
}

/** Guarda los datos de alta. Vuelve a validar en el servidor: no confía en el navegador. */
export async function submitOnboarding(code: string, raw: unknown): Promise<OnboardingResult> {
  if (!ONBOARDING_CODE.test(code) || !supabaseConfigured) {
    return { ok: false, error: "Este enlace no es válido. Pide uno nuevo a BRich." };
  }
  const data = normalizeOnboarding(raw);
  const errors = validateOnboarding(data);
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: "Revisa los datos marcados e inténtalo de nuevo.", errors };
  }

  const { data: saved, error } = await anonClient().rpc("submit_onboarding", { p_code: code, p_data: data });
  if (error) {
    console.error("[alta] submit_onboarding:", error.message);
    return { ok: false, error: "No pudimos guardar tus datos. Inténtalo de nuevo en unos minutos." };
  }
  if (saved !== true) {
    return { ok: false, error: "Este enlace ya fue utilizado. Si necesitas corregir algo, escríbenos." };
  }
  return { ok: true };
}
