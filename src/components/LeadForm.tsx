"use client";

import { useEffect, useRef, useState } from "react";
import { normalizeLead, validateLead, type LeadErrors } from "@/lib/lead";
import { COUNTRIES, fullPhone } from "@/lib/countries";
import { CountryCodePicker } from "./CountryCodePicker";

type Status = "idle" | "sending" | "sent" | "error";

export type LeadFormProps = {
  /** Empresa que recibe el prospecto. Sin valor = BRich. */
  companySlug?: string;
  /** Opciones de "¿Qué te interesa?". */
  options: string[];
  defaultOption?: string;
  messageLabel: string;
  submitLabel: string;
  successTitle: string;
  successText: string;
  legal: string;
  /** Se muestra junto al botón de envío (por ejemplo, la casilla del sello del comprobante). */
  footer?: React.ReactNode;
  /** Reemplaza la pantalla de "enviado" por defecto. */
  renderSent?: (sent: { name: string; at: Date; reset: () => void }) => React.ReactNode;
};

/**
 * Formulario de prospectos reutilizable (web de BRich y páginas /f/<slug> de clientes).
 * Envía a /api/leads → n8n → Supabase. Muestra estados de envío, éxito y error.
 */
export function LeadForm({
  companySlug,
  options,
  defaultOption,
  messageLabel,
  submitLabel,
  successTitle,
  successText,
  legal,
  footer,
  renderSent,
}: LeadFormProps) {
  const [errors, setErrors] = useState<LeadErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [sent, setSent] = useState<{ name: string; at: Date } | null>(null);
  // Momento en que el formulario apareció en pantalla (prueba de tiempo contra bots).
  const shownAt = useRef(0);
  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const { phone_local, ...rest } = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const raw = { ...rest, phone: fullPhone(country.dial, phone_local ?? "") };
    const e = validateLead(normalizeLead(raw));
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setStatus("sending");
    setServerError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...raw, companySlug, elapsedMs: shownAt.current ? Date.now() - shownAt.current : 0 }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setSent({ name: String(rest.name ?? "").trim(), at: new Date() });
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

  if (status === "sent" && renderSent && sent) {
    return <>{renderSent({ ...sent, reset: () => setStatus("idle") })}</>;
  }

  if (status === "sent") {
    return (
      <div className="form form-sent" role="status">
        <h3>{successTitle}</h3>
        <p>{successText}</p>
        <button className="btn btn-navy" type="button" onClick={() => setStatus("idle")}>
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  const field = (name: keyof LeadErrors, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="field" data-field={name}>
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
      <div className="row row-phone">
        <div className="field" data-field="phone">
          <label htmlFor="f-phone">WhatsApp</label>
          <div className="phone-group">
            <CountryCodePicker value={country} onChange={setCountry} />
            <input
              id="f-phone"
              name="phone_local"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder={country.example}
              maxLength={20}
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? "f-phone-err" : undefined}
            />
          </div>
          {errors.phone && <span id="f-phone-err" className="form-error">{errors.phone}</span>}
        </div>
        {field("email", "Correo", { type: "email", autoComplete: "email", maxLength: 160 })}
      </div>
      <div className="field" data-field="system">
        <label htmlFor="f-system">¿Qué te interesa?</label>
        <select id="f-system" name="system" defaultValue={defaultOption ?? options[0]}>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
          <option>Todavía no lo sé</option>
        </select>
      </div>
      <div className="field" data-field="message">
        <label htmlFor="f-message">{messageLabel}</label>
        <textarea id="f-message" name="message" maxLength={2000} />
      </div>
      {/* Campo trampa para bots: invisible para las personas */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-website">No llenar</label>
        <input id="f-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="form-foot" data-field="foot">
        {footer}
        <div className="form-actions">
          {status === "error" && serverError && (
            <p className="form-error" role="alert">{serverError}</p>
          )}
          <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Enviando…" : submitLabel}
          </button>
          <p className="form-legal">{legal}</p>
        </div>
      </div>
    </form>
  );
}
