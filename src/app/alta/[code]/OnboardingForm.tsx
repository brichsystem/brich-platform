"use client";

import { useEffect, useState } from "react";
import {
  MAX_PEOPLE,
  MAX_SERVICES,
  REMINDER_OPTIONS,
  normalizeOnboarding,
  validateOnboarding,
  type OnboardingErrors,
  type OnboardingPerson,
} from "@/lib/onboarding";
import { submitOnboarding } from "./actions";

type Status = "idle" | "sending" | "sent" | "error";
const emptyPerson = (owner = false): OnboardingPerson => ({ name: "", email: "", phone: "", owner, seller: true });

/** Formulario de alta de un cliente nuevo. Valida en el navegador y otra vez en el servidor. */
export function OnboardingForm({ code, label }: { code: string; label: string }) {
  const [company, setCompany] = useState(label);
  const [services, setServices] = useState(["", "", ""]);
  const [notify, setNotify] = useState("");
  const [people, setPeople] = useState<OnboardingPerson[]>([emptyPerson(true)]);
  const [rotate, setRotate] = useState(true);
  const [hours, setHours] = useState(24);
  const [errors, setErrors] = useState<OnboardingErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");

  // Después de un intento fallido, los errores se actualizan mientras la persona corrige.
  useEffect(() => {
    if (status !== "error") return;
    const e = validateOnboarding(normalizeOnboarding({ company, services, notifyEmails: notify.split(/[,;\s]+/), people }));
    setErrors(e);
    if (Object.keys(e).length === 0) setServerError("");
  }, [status, company, services, notify, people]);

  const sellers = people.filter((p) => p.seller).length;
  const setPerson = (i: number, patch: Partial<OnboardingPerson>) =>
    setPeople((list) => list.map((p, n) => (n === i ? { ...p, ...patch } : p)));

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const raw = { company, services, notifyEmails: notify.split(/[,;\s]+/), people, rotate, reminderHours: hours };
    const e = validateOnboarding(normalizeOnboarding(raw));
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setServerError("Revisa los datos marcados en rojo.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setServerError("");
    try {
      const res = await submitOnboarding(code, raw);
      if (res.ok) return setStatus("sent");
      if (res.errors) setErrors(res.errors);
      setServerError(res.error);
      setStatus("error");
    } catch {
      setServerError("No hay conexión. Revisa tu internet e inténtalo de nuevo.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="form form-sent" role="status">
        <h3>Recibimos tus datos</h3>
        <p>Con esto configuramos tu sistema. Cada persona de tu equipo recibirá su acceso al panel directamente de BRich.</p>
      </div>
    );
  }

  const err = (key: string) => errors[key] && <span id={`a-${key}-err`} className="form-error">{errors[key]}</span>;
  const aria = (key: string) => ({ "aria-invalid": errors[key] ? true : undefined, "aria-describedby": errors[key] ? `a-${key}-err` : undefined });

  return (
    <form className="alta-form" onSubmit={onSubmit} noValidate>
      <fieldset className="alta-step">
        <legend><span>Paso 1</span> Tu empresa</legend>
        <div className="field">
          <label htmlFor="a-company">Nombre comercial</label>
          <input id="a-company" value={company} onChange={(e) => setCompany(e.target.value)} maxLength={120} autoComplete="organization" {...aria("company")} />
          {err("company")}
        </div>
      </fieldset>

      <fieldset className="alta-step">
        <legend><span>Paso 2</span> Qué ofreces</legend>
        <p className="alta-help">Son las opciones que verá una persona en “¿Qué te interesa?” de tu formulario. Hasta {MAX_SERVICES}.</p>
        <div className="alta-list">
          {services.map((s, i) => (
            <div className="field" key={i}>
              <input
                aria-label={`Servicio o producto ${i + 1}`}
                placeholder={`Servicio o producto ${i + 1}`}
                value={s}
                maxLength={80}
                onChange={(e) => setServices((l) => l.map((v, n) => (n === i ? e.target.value : v)))}
                {...(i === 0 ? aria("services") : {})}
              />
            </div>
          ))}
        </div>
        {err("services")}
        {services.length < MAX_SERVICES && (
          <button type="button" className="alta-link" onClick={() => setServices((l) => [...l, ""])}>+ Agregar otro</button>
        )}
      </fieldset>

      <fieldset className="alta-step">
        <legend><span>Paso 3</span> Avisos</legend>
        <div className="field">
          <label htmlFor="a-notify">¿A qué correo llegan los avisos de cada prospecto nuevo?</label>
          <input id="a-notify" type="text" inputMode="email" placeholder="gerencia@tuempresa.com" value={notify} onChange={(e) => setNotify(e.target.value)} maxLength={400} {...aria("notifyEmails")} />
          {err("notifyEmails")}
          <span className="form-legal">Puedes escribir hasta 3, separados por comas.</span>
        </div>
      </fieldset>

      <fieldset className="alta-step">
        <legend><span>Paso 4</span> Tu equipo</legend>
        <p className="alta-help">Las personas que entrarán al panel. Cada una necesita su propio correo: será su usuario.</p>
        {people.map((p, i) => (
          <div className="alta-person" key={i}>
            <div className="alta-person-head">
              <b>Persona {i + 1}</b>
              {people.length > 1 && (
                <button type="button" className="alta-link danger" onClick={() => setPeople((l) => l.filter((_, n) => n !== i))}>Quitar</button>
              )}
            </div>
            <div className="field">
              <label htmlFor={`a-p${i}-name`}>Nombre y apellido</label>
              <input id={`a-p${i}-name`} value={p.name} maxLength={120} autoComplete="off" onChange={(e) => setPerson(i, { name: e.target.value })} {...aria(`people.${i}.name`)} />
              {err(`people.${i}.name`)}
            </div>
            <div className="row">
              <div className="field">
                <label htmlFor={`a-p${i}-email`}>Correo</label>
                <input id={`a-p${i}-email`} type="email" value={p.email} maxLength={160} autoComplete="off" onChange={(e) => setPerson(i, { email: e.target.value })} {...aria(`people.${i}.email`)} />
                {err(`people.${i}.email`)}
              </div>
              <div className="field">
                <label htmlFor={`a-p${i}-phone`}>WhatsApp</label>
                <input id={`a-p${i}-phone`} type="tel" inputMode="tel" placeholder="+593 99 123 4567" value={p.phone} maxLength={40} autoComplete="off" onChange={(e) => setPerson(i, { phone: e.target.value })} {...aria(`people.${i}.phone`)} />
                {err(`people.${i}.phone`)}
              </div>
            </div>
            <div className="alta-checks">
              <label className="alta-check">
                <input type="checkbox" checked={p.owner} onChange={(e) => setPerson(i, { owner: e.target.checked })} />
                <span>Es responsable de la cuenta<small>Puede cambiar quién atiende cada prospecto.</small></span>
              </label>
              <label className="alta-check">
                <input type="checkbox" checked={p.seller} onChange={(e) => setPerson(i, { seller: e.target.checked })} />
                <span>Atiende prospectos<small>Recibe los avisos de los prospectos que se le asignan.</small></span>
              </label>
            </div>
          </div>
        ))}
        {err("people")}
        {people.length < MAX_PEOPLE && (
          <button type="button" className="alta-link" onClick={() => setPeople((l) => [...l, emptyPerson()])}>+ Agregar otra persona</button>
        )}
      </fieldset>

      <fieldset className="alta-step">
        <legend><span>Paso 5</span> Cómo quieres trabajar</legend>
        {sellers > 1 && (
          <label className="alta-check">
            <input type="checkbox" checked={rotate} onChange={(e) => setRotate(e.target.checked)} />
            <span>Repartir los prospectos nuevos por turnos<small>Cada prospecto va a quien lleva más tiempo sin recibir uno.</small></span>
          </label>
        )}
        <div className="field">
          <label htmlFor="a-hours">Si un prospecto sigue sin atender, ¿cuándo se lo recordamos a quien lo atiende?</label>
          <select id="a-hours" value={hours} onChange={(e) => setHours(Number(e.target.value))}>
            {REMINDER_OPTIONS.map((o) => (
              <option key={o.hours} value={o.hours}>{o.label}</option>
            ))}
          </select>
        </div>
      </fieldset>

      {status === "error" && serverError && <p className="form-error" role="alert">{serverError}</p>}
      <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Enviando…" : "Enviar datos"}
      </button>
      <p className="form-legal">Usaremos estos datos solo para configurar y operar tu cuenta en BRich. No pedimos contraseñas: BRich crea los accesos y los entrega a cada persona.</p>
    </form>
  );
}
