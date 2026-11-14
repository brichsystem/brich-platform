"use client";

import { useState, useTransition } from "react";
import { LEAD_STATUS, LEAD_STATUSES, type LeadStatus } from "@/lib/lead-status";
import { updateLeadStatus } from "./actions";

/** Selector de estado de un prospecto. Guarda al elegir; si falla, vuelve al estado anterior. */
export function StatusSelect({ leadId, status, leadName }: { leadId: string; status: LeadStatus; leadName: string }) {
  const [value, setValue] = useState<LeadStatus>(status);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onChange(next: LeadStatus) {
    const previous = value;
    setValue(next);
    setError("");
    startTransition(async () => {
      const res = await updateLeadStatus(leadId, next);
      if (!res.ok) {
        setValue(previous);
        setError(res.error);
      }
    });
  }

  return (
    <div className="status-cell">
      <select
        className={`status-select lead-${value}`}
        aria-label={`Estado de ${leadName}`}
        value={value}
        disabled={pending}
        onChange={(e) => onChange(e.target.value as LeadStatus)}
      >
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s}>{LEAD_STATUS[s]}</option>
        ))}
      </select>
      {pending && <span className="status-saving" role="status">Guardando…</span>}
      {error && <span className="form-error" role="alert">{error}</span>}
    </div>
  );
}
