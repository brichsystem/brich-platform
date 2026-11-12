"use client";

import { useState } from "react";
import { systems } from "@/lib/systems";
import { normalizeLead, validateLead, type LeadErrors } from "@/lib/lead";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Formulario de diagnóstico.
 * Envía a /api/leads → n8n → Supabase. Muestra estados de envío, éxito y error.
 */
export function DiagnosticForm({ defaultSystem }: { defaultSystem?: string }) {
  const [errors, setErrors] = useState<LeadErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const raw = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const e = validateLead(normalizeLead(raw));
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setStatus("sending");
    setServerError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(raw),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus("sent");
        form.reset();
        return;
      }
      if (data.errors) setErrors(data.errors);
      setServerError(data.error ?? "Revisa los datos marcados e inténtalo de nuevo.");
      setStatus("error");
    } catch {
      setServerError("No hay conexión. Revisa tu internet e inténtalo de nuevo.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="form form-sent" role="status">
        <h3>Recibimos tu solicitud</h3>
        <p>El equipo de BRich revisará tus datos y te contactará por WhatsApp o correo para agendar el diagnóstico.</p>
        <button className="btn btn-navy" type="button" onClick={() => setStatus("idle")}>
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  const field = (name: keyof LeadErrors, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="field">
      <label htmlFor={`f-${name}`}>{label}</label>
      <input
        id={`f-${name}`}
        name={name}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={errors[name] ? `f-${name}-err` : undefined}
        {...props}
      />
      {errors[name] && <span id={`f-${name}-err`} className="form-error">{errors[name]}</span>}
    </div>
  );

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <div className="row">
        {field("name", "Nombre", { autoComplete: "name", maxLength: 120 })}
        {field("company", "Empresa", { autoComplete: "organization", maxLength: 160 })}
      </div>
      <div className="row">
        {field("phone", "WhatsApp", { type: "tel", autoComplete: "tel", placeholder: "+593 99 999 9999", maxLength: 20 })}
        {field("email", "Correo", { type: "email", autoComplete: "email", maxLength: 160 })}
      </div>
      <div className="field">
        <label htmlFor="f-system">¿Qué te interesa?</label>
        <select id="f-system" name="system" defaultValue={defaultSystem ?? systems[0].name}>
          {systems.map((s) => (
            <option key={s.slug}>{s.name}</option>
          ))}
          <option>Todavía no lo sé</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="f-message">¿Cuál es tu mayor problema hoy? (opcional)</label>
        <textarea id="f-message" name="message" maxLength={2000} />
      </div>
      {/* Campo trampa para bots: invisible para las personas */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-website">No llenar</label>
        <input id="f-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {status === "error" && serverError && (
        <p className="form-error" role="alert">{serverError}</p>
      )}
      <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Enviando…" : "Pedir diagnóstico"}
      </button>
      <p className="form-legal">
        Usaremos tus datos solo para contactarte sobre el diagnóstico.
      </p>
    </form>
  );
}
