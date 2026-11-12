import { NextResponse } from "next/server";
import { normalizeLead, validateLead } from "@/lib/lead";

/**
 * Recibe el formulario de diagnóstico y lo envía a n8n.
 * - Valida los datos en el servidor (no confía en el navegador).
 * - Descarta bots con un campo trampa ("website") que las personas no ven.
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
