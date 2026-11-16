import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/env";

export type PublicForm = { name: string; slug: string; services: string[] };

export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Datos públicos del formulario de una empresa (camino B): solo nombre y servicios,
 * y solo si BRich activó su formulario. Devuelve null si no existe o no está activo.
 * Lanza un error si Supabase no responde (para no confundir "caído" con "no existe").
 */
export async function getPublicForm(slug: string): Promise<PublicForm | null> {
  if (!SLUG.test(slug) || slug.length > 60) return null;
  if (!supabaseConfigured) throw new Error("Supabase no está configurado");
  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(4_000) }) },
  });
  const { data, error } = await supabase.rpc("get_public_form", { p_slug: slug });
  if (error) throw new Error(error.message);
  if (!data || typeof data !== "object") return null;
  const f = data as { name?: unknown; slug?: unknown; services?: unknown };
  if (typeof f.name !== "string" || typeof f.slug !== "string") return null;
  const services = Array.isArray(f.services) ? f.services.filter((s): s is string => typeof s === "string" && s.trim() !== "") : [];
  return { name: f.name, slug: f.slug, services };
}
