"use client";

import { useEffect, useId, useRef, useState } from "react";
import { EC, AR, BO, BR, CL, CO, CR, SV, ES, US, GT, HN, MX, NI, PA, PY, PE, PR, DO, UY, VE } from "country-flag-icons/react/3x2";
import { COUNTRIES, type Country } from "@/lib/countries";

// Solo las banderas de la lista, para no cargar las de todos los países.
const FLAGS: Record<string, typeof EC> = {
  EC, AR, BO, BR, CL, CO, CR, SV, ES, US, GT, HN, MX, NI, PA, PY, PE, PR, DO, UY, VE,
};

function Flag({ iso }: { iso: string }) {
  const F = FLAGS[iso];
  return F ? <F className="cc-flag" aria-hidden="true" /> : <span className="cc-flag" />;
}

/**
 * Selector de código de país con banderas.
 * Teclado: Enter/Espacio/flechas abren; flechas mueven; Enter elige; Esc cierra; letras saltan al país.
 */
export function CountryCodePicker({ value, onChange }: { value: Country; onChange: (c: Country) => void }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    listRef.current?.focus();
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function openList() {
    setActive(Math.max(0, COUNTRIES.findIndex((c) => c.iso === value.iso)));
    setOpen(true);
  }
  function choose(i: number) {
    onChange(COUNTRIES[i]);
    setOpen(false);
    btnRef.current?.focus();
  }

  function onListKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(COUNTRIES.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(COUNTRIES.length - 1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(active); }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false); btnRef.current?.focus(); }
    else if (e.key === "Tab") setOpen(false);
    else if (/^[a-z]$/i.test(e.key)) {
      const k = e.key.toLowerCase();
      const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
      const i = COUNTRIES.findIndex((c, idx) => idx > active && norm(c.name).startsWith(k));
      const j = i >= 0 ? i : COUNTRIES.findIndex((c) => norm(c.name).startsWith(k));
      if (j >= 0) setActive(j);
    }
  }

  return (
    <div className="cc" ref={wrapRef}>
      <button
        ref={btnRef}
        type="button"
        className="cc-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Código de país: ${value.name} ${value.dial}`}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={(e) => {
          if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); openList(); }
        }}
      >
        <Flag iso={value.iso} />
        <span className="cc-dial">{value.dial}</span>
        <svg className="cc-caret" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          className="cc-list"
          aria-label="Elige tu país"
          aria-activedescendant={`${listId}-${active}`}
          onKeyDown={onListKey}
        >
          {COUNTRIES.map((c, i) => (
            <li
              key={c.iso}
              id={`${listId}-${i}`}
              data-i={i}
              role="option"
              aria-selected={c.iso === value.iso}
              className={`cc-opt${i === active ? " active" : ""}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(i)}
            >
              <Flag iso={c.iso} />
              <span className="cc-name">{c.name}</span>
              <span className="cc-code">{c.dial}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
