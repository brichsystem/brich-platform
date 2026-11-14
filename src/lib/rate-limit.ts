import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/env";

export type RateResult = "ok" | "limit" | "global_limit" | "unavailable";

/** IP del visitante según Vercel. */
export function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "desconocida"
  );
}

/**
 * Huella de la conexión: SHA-256 de la IP con una clave secreta del servidor.
 * No se puede revertir para obtener la IP, y nunca se guarda la IP en claro.
 */
export function connectionKey(ip: string, pepper: string) {
  return createHash("sha256").update(`${ip}|${pepper}`).digest("hex");
}

/**
 * Pregunta a Supabase si esta conexión puede enviar el formulario.
 * Si Supabase no responde, devuelve "unavailable" y el formulario sigue funcionando:
 * es preferible recibir un envío de más que perder un prospecto real.
 */
export async function checkRateLimit(key: string): Promise<RateResult> {
  if (!supabaseConfigured) return "unavailable";
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(4_000) }) },
    });
    const { data, error } = await supabase.rpc("check_form_rate_limit", { p_key: key });
    if (error) {
      console.error("[leads] Límite de envíos no disponible:", error.message);
      return "unavailable";
    }
    if (data === "ok" || data === "limit" || data === "global_limit") return data;
    console.error("[leads] Respuesta inesperada del límite de envíos:", data);
    return "unavailable";
  } catch (err) {
    console.error("[leads] Límite de envíos no disponible:", err instanceof Error ? err.message : err);
    return "unavailable";
  }
}
