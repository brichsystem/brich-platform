import type { Metadata } from "next";
import Link from "next/link";
import { getSessionContext, type Lead } from "@/lib/portal";
import { LEAD_STATUS, LEAD_STATUSES, isLeadStatus } from "@/lib/lead-status";
import { LeadsTable } from "../LeadsTable";

export const metadata: Metadata = { title: "Prospectos", robots: { index: false } };

export default async function ProspectosPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  const filter = isLeadStatus(estado) ? estado : null;
  const { supabase, profile, company } = await getSessionContext();

  if (!profile || !company) {
    return (
      <section className="p-empty">
        <h1>Tu usuario todavía no tiene una empresa asignada</h1>
        <p>Escríbenos y BRich activará tu acceso. Mientras tanto no hay información que mostrar.</p>
      </section>
    );
  }

  const { data, error } = await supabase
    .from("leads")
    .select("id, name, company_name, phone, email, interest, status, source, assigned_to, created_at")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false })
    .limit(1000)
    .returns<Lead[]>();

  if (error) {
    return (
      <section className="p-empty">
        <h1>No pudimos cargar tus prospectos</h1>
        <p>Recarga la página en unos segundos. Si el problema sigue, escríbenos para revisarlo.</p>
      </section>
    );
  }

  const all = data ?? [];
  const shown = filter ? all.filter((l) => l.status === filter) : all;
  const count = (s: string) => all.filter((l) => l.status === s).length;

  return (
    <div className="p-grid">
      <div className="p-head">
        <p className="eyebrow">Prospectos</p>
        <h1>Todos los prospectos</h1>
        <p className="p-sub">Cambia el estado de cada prospecto a medida que avanzas con él. Los indicadores del resumen se actualizan solos.</p>
      </div>

      <nav className="p-filters" aria-label="Filtrar por estado">
        <Link href="/portal/prospectos" className={!filter ? "on" : undefined} aria-current={!filter ? "page" : undefined}>
          Todos <span>{all.length}</span>
        </Link>
        {LEAD_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/portal/prospectos?estado=${s}`}
            className={filter === s ? "on" : undefined}
            aria-current={filter === s ? "page" : undefined}
          >
            {LEAD_STATUS[s]} <span>{count(s)}</span>
          </Link>
        ))}
      </nav>

      <section className="p-card p-table" aria-label="Lista de prospectos">
        {shown.length === 0 ? (
          <p className="p-muted">
            {filter ? `No hay prospectos en estado "${LEAD_STATUS[filter]}".` : "Aún no hay prospectos. Aparecerán aquí cuando llegue el primero."}
          </p>
        ) : (
          <LeadsTable leads={shown} showContact />
        )}
      </section>
    </div>
  );
}
