import { NextResponse } from "next/server";
import { normalizeLead, validateLead } from "@/lib/lead";
import { checkRateLimit, clientIp, connectionKey } from "@/lib/rate-limit";

/** Una persona tarda más que esto en llenar el formulario; un bot, mucho menos. */
const MIN_FILL_MS = 2_500;

/**
 * Recibe el formulario de diagnóstico y lo envía a n8n.
 * - Valida los datos en el servidor (no confía en el navegador).
 * - Descarta bots: campo trampa ("website") y envíos más rápidos de lo humano.
 * - Limita envíos por conexión (3 cada 10 min, 10 al día) y en total (60 por hora).
 * - Envía a n8n con una clave secreta en la cabecera. La URL y la clave
 *   viven solo en variables de entorno del servidor (Vercel), nunca en el navegador.
 */
export async function POST(request: Request) {
  const webhookUrl = process.env.N8N_LEAD_WEBHOOK_URL;
  const secret = process.env.N8N_WEBHOOK_SECRET;

  let raw: Record<string, unknown>;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Solicitud inválida." }, { status: 400 });
  }

  // Campo trampa: si viene lleno, es un bot. Respondemos OK sin guardar nada.
  if (typeof raw.website === "string" && raw.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  // Prueba de tiempo: sin el tiempo de llenado, o demasiado rápido, es un bot.
  if (typeof raw.elapsedMs !== "number" || raw.elapsedMs < MIN_FILL_MS) {
    return NextResponse.json({ ok: true });
  }

  const lead = normalizeLead(raw);
  const errors = validateLead(lead);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  if (!webhookUrl || !secret) {
    console.error("[leads] Falta N8N_LEAD_WEBHOOK_URL o N8N_WEBHOOK_SECRET");
    return NextResponse.json(
      { ok: false, error: "El formulario no está disponible en este momento. Inténtalo de nuevo más tarde." },
      { status: 503 },
    );
  }

  const limit = await checkRateLimit(connectionKey(clientIp(request), secret));
  if (limit === "limit") {
    return NextResponse.json(
      { ok: false, error: "Ya recibimos varias solicitudes desde tu conexión. Espera unos minutos e inténtalo de nuevo." },
      { status: 429 },
    );
  }
  if (limit === "global_limit") {
    return NextResponse.json(
      { ok: false, error: "Estamos recibiendo muchas solicitudes en este momento. Inténtalo de nuevo en una hora." },
      { status: 429 },
    );
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-brich-secret": secret },
      body: JSON.stringify({ ...lead, source: "web_form", submittedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("[leads] n8n respondió", res.status);
      throw new Error(`n8n ${res.status}`);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[leads] Error enviando a n8n:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { ok: false, error: "No pudimos registrar tu solicitud. Inténtalo de nuevo en unos minutos." },
      { status: 502 },
    );
  }
}
