"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { title: "Llega una consulta", detail: "WhatsApp o formulario web", status: "Recibido" },
  { title: "Se registra el contacto", detail: "Nombre, teléfono y servicio", status: "Guardado" },
  { title: "Se clasifica la oportunidad", detail: "Según urgencia y servicio", status: "Clasificado" },
  { title: "Se avisa al vendedor", detail: "Notificación inmediata", status: "Notificado" },
  { title: "Aparece en tu panel", detail: "Con estado y seguimiento", status: "Visible" },
];

/** Animación ilustrativa del recorrido de un prospecto. No usa datos reales. */
export function FlowDemo() {
  const [active, setActive] = useState(STEPS.length);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setActive(1);
    const id = setInterval(() => setActive((n) => (n >= STEPS.length ? 1 : n + 1)), 1100);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flow" aria-label="Ejemplo del recorrido de un prospecto en BRich Sales System">
      <div className="flow-head">
        <strong>Recorrido de un prospecto</strong>
        <span className="demo-badge">Demostrativo</span>
      </div>
      <ol className="steps">
        {STEPS.map((s, i) => (
          <li key={s.title} className={`step${i < active ? " on" : ""}`}>
            <span className="num">{i + 1}</span>
            <div>
              <b>{s.title}</b>
              <small>{s.detail}</small>
            </div>
            <span className="st">{s.status}</span>
          </li>
        ))}
      </ol>
      <p className="flow-note">Muestra cómo funciona el sistema. No contiene datos de clientes reales.</p>
    </div>
  );
}
