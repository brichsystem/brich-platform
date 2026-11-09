"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

export type LoginState = { error?: string; email?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!supabaseConfigured) return { error: "El acceso todavía no está configurado. Contacta a BRich.", email };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Escribe un correo válido.", email };
  if (!password) return { error: "Escribe tu contraseña.", email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const msg =
      error.status === 400 || error.code === "invalid_credentials"
        ? "Correo o contraseña incorrectos. Revisa los datos e inténtalo de nuevo."
        : "No pudimos iniciar sesión en este momento. Inténtalo de nuevo en unos minutos.";
    return { error: msg, email };
  }
  redirect("/portal");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
