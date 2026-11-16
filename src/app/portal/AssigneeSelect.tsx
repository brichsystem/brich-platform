"use client";

import { useState, useTransition } from "react";
import type { TeamMember } from "@/lib/portal";
import { assignLead } from "./actions";

/** Selector de responsable de un prospecto (solo para el dueño de la cuenta). Guarda al elegir. */
export function AssigneeSelect({
  leadId,
  leadName,
  userId,
  label,
  team,
}: {
  leadId: string;
  leadName: string;
  userId: string | null;
  /** Nombre guardado cuando el responsable no es un usuario del portal (datos anteriores). */
  label: string | null;
  team: TeamMember[];
}) {
  const [value, setValue] = useState(userId ?? "");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onChange(next: string) {
    const previous = value;
    setValue(next);
    setError("");
    startTransition(async () => {
      const res = await assignLead(leadId, next === "" ? null : next);
      if (!res.ok) {
        setValue(previous);
        setError(res.error);
      }
    });
  }

  return (
    <div className="status-cell">
      <select
        className="assignee-select"
        aria-label={`Responsable de ${leadName}`}
        value={value}
        disabled={pending}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{userId === null && label ? label : "Sin asignar"}</option>
        {team.map((m) => (
          <option key={m.id} value={m.id}>{m.full_name}</option>
        ))}
      </select>
      {pending && <span className="status-saving" role="status">Guardando…</span>}
      {error && <span className="form-error" role="alert">{error}</span>}
    </div>
  );
}
