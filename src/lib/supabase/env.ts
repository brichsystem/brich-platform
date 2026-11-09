/**
 * Datos PÚBLICOS de Supabase (seguros en el navegador gracias a RLS).
 * Se configuran como variables de entorno en Vercel y en .env.local.
 * La clave secreta NUNCA va aquí.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
