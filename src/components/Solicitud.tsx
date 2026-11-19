"use client";

import { useEffect, useState } from "react";
import { systems } from "@/lib/systems";
import { LeadForm } from "./LeadForm";
import { Logo } from "./Logo";

const TZ = "America/Guayaquil";
const fmtDay = (d: Date) => new Intl.DateTimeFormat("es-EC", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: TZ }).format(d);
const fmtTime = (d: Date) => new Intl.DateTimeFormat("es-EC", { hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(d);

/** Fecha de hoy. Se calcula en el navegador para que no quede fija la del día en que se publicó la página. */
function Today() {
  const [day, setDay] = useState<string | null>(null);
  useEffect(() => setDay(fmtDay(new Date())), []);
  return <>{day ?? "—"}</>;
}

/** Los pasos que sigue una solicitud de diagnóstico de BRich. Solo el primero ocurre al enviar. */
const TRACK = ["Recibida", "Revisión de BRich", "Te contactamos", "Diagnóstico de 30 min"];

/**
 * Solicitud de diagnóstico con forma de comprobante: emisor, datos de la solicitud,
 * campos en cajas y la casilla del sello, que se estampa al registrar.
 */
export function Solicitud({
  title,
  intro,
  defaultSystem,
  headingLevel = 1,
  compact = false,
}: {
  title: string;
  intro: string;
  defaultSystem?: string;
  headingLevel?: 1 | 2;
  /** Sin la cabecera del emisor: para usarla debajo de otra hoja que ya la muestra. */
  compact?: boolean;
}) {
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <section id="solicitud" className="sheet solicitud" aria-labelledby="solicitud-title">
      {compact ? (
        <dl className="franja">
          <dt>Solicitud de diagnóstico</dt>
          <dd>En línea · 30 minutos · Sin costo</dd>
          <dd>Empresas con 3 o más años de operación</dd>
        </dl>
      ) : (
        <div className="sheet-head">
          <div className="box emisor">
            <Logo variant="navy" height={40} />
            <p>
              <b>BRich System</b>
              <span>Sistemas de automatización empresarial · Quito, Ecuador</span>
            </p>
          </div>
          <div className="box datos">
            <p className="datos-title">Solicitud de diagnóstico</p>
            <dl>
              <dt>Registro</dt>
              <dd>Con fecha y hora al enviar</dd>
              <dt className="fecha">Fecha</dt>
              <dd className="fecha num"><Today /></dd>
              <dt>Modalidad</dt>
              <dd>En línea · 30 minutos · Sin costo</dd>
              <dt>Para</dt>
              <dd>Empresas con 3 o más años de operación</dd>
            </dl>
          </div>
        </div>
      )}

      <div className="asunto">
        <Heading id="solicitud-title">{title}</Heading>
        <p>{intro}</p>
      </div>

      <div className="ficha" id="campos">
        <LeadForm
          options={systems.map((s) => s.name)}
          defaultOption={defaultSystem}
          messageLabel="¿Cuál es tu mayor problema hoy? (opcional)"
          submitLabel="Registrar solicitud"
          successTitle="Recibimos tu solicitud"
          successText="El equipo de BRich revisará tus datos y te contactará por WhatsApp o correo para agendar el diagnóstico."
          legal="Usaremos tus datos solo para contactarte sobre el diagnóstico."
          footer={
            <div className="sello-casilla" aria-hidden="true">
              <span>Sello</span>
            </div>
          }
          renderSent={({ name, at, reset }) => (
            <div className="registrada" role="status">
              <div className="sello-casilla con-sello">
                <span className="sello">
                  Recibida
                  <small className="num">{fmtDay(at)} · {fmtTime(at)}</small>
                </span>
              </div>
              <div className="registrada-txt">
                <h3>{name ? `Gracias, ${name.split(" ")[0]}. Tu solicitud quedó registrada.` : "Tu solicitud quedó registrada."}</h3>
                <p>BRich revisará tus datos y te escribirá por WhatsApp o correo para agendar el diagnóstico.</p>
                <ol className="pista" aria-label="Estado de tu solicitud">
                  {TRACK.map((t, i) => (
                    <li key={t} className={i === 0 ? "hecho" : undefined}>
                      <span>{t}</span>
                      {i === 0 && <small className="num">{fmtTime(at)}</small>}
                    </li>
                  ))}
                </ol>
                <button className="btn-link" type="button" onClick={reset}>Registrar otra solicitud</button>
              </div>
            </div>
          )}
        />
      </div>
    </section>
  );
}
