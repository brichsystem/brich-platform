"use client";

import { useState } from "react";
import { systems } from "@/lib/systems";

type Errors = Partial<Record<"name" | "company" | "phone" | "email", string>>;

function validate(d: Record<string, string>): Errors {
  const e: Errors = {};
  if (!d.name?.trim()) e.name = "Escribe tu nombre.";
  if (!d.company?.trim()) e.company = "Escribe el nombre de tu empresa.";
  if (!/^\+?[\d\s-]{7,}$/.test(d.phone?.trim() ?? "")) e.phone = "Escribe un WhatsApp válido, por ejemplo +593 99 999 9999.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email?.trim() ?? "")) e.email = "Escribe un correo válido.";
  return e;
}

/**
 * Formulario de diagnóstico.
 * ETAPA 1: valida los datos pero NO los envía. En la etapa 3 se conecta a /api/leads → n8n → Supabase.
 */
export function DiagnosticForm({ defaultSystem }: { defaultSystem?: string }) {
  const [errors, setErrors] = useState<Errors>({});
  const [valid, setValid] = useState(false);

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const data = Object.fromEntries(new FormData(ev.currentTarget)) as Record<string, string>;
    const e = validate(data);
    setErrors(e);
    setValid(Object.keys(e).length === 0);
  }

  const field = (name: keyof Errors, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
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
        {field("name", "Nombre", { autoComplete: "name" })}
        {field("company", "Empresa", { autoComplete: "organization" })}
      </div>
      <div className="row">
        {field("phone", "WhatsApp", { type: "tel", autoComplete: "tel", placeholder: "+593 99 999 9999" })}
        {field("email", "Correo", { type: "email", autoComplete: "email" })}
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
        <textarea id="f-message" name="message" />
      </div>
      <button className="btn btn-primary" type="submit">Pedir diagnóstico</button>
      <p className={`notice${valid ? " ok" : ""}`} role="status">
        {valid
          ? "Datos válidos. En esta versión no se envió nada; el envío real se activa en la etapa 3."
          : "Versión en construcción: el formulario valida los datos, pero todavía no los envía."}
      </p>
    </form>
  );
}
