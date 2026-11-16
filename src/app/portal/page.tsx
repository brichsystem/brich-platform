import Link from "next/link";
import { getSessionContext, summarize, pendingLeads, fmtWait, fmtDateTime, RUN_STATUS, SYSTEM_NAME, type Lead, type Run } from "@/lib/portal";
import { LeadsTable } from "./LeadsTable";

export default async function PortalHome() {
  const { supabase, profile, company } = await getSessionContext();

  if (!profile || !company) {
    return (
      <section className="p-empty">
        <h1>Tu usuario todavía no tiene una empresa asignada</h1>
        <p>Escríbenos y BRich activará tu acceso. Mientras tanto no hay información que mostrar.</p>
      </section>
    );
  }

  const [leadsRes, runsRes] = await Promise.all([
    supabase
      .from("leads")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false })
      .limit(1000)
      .returns<Lead[]>(),
    supabase
      .from("automation_runs")
      .select("id, system, name, status, detail, ran_at")
      .eq("company_id", company.id)
      .order("ran_at", { ascending: false })
      .limit(8)
      .returns<Run[]>(),
  ]);

  if (leadsRes.error || runsRes.error) {
    return (
      <section className="p-empty">
        <h1>No pudimos cargar tu información</h1>
        <p>Recarga la página en unos segundos. Si el problema sigue, escríbenos para revisarlo.</p>
      </section>
    );
  }

  const leads = leadsRes.data ?? [];
  const runs = runsRes.data ?? [];
  const { kpis, weeks } = summarize(leads);
  const maxWeek = Math.max(1, ...weeks.map((w) => w.n));
  const recent = leads.slice(0, 10);
  const reminderHours = company.lead_reminder_hours ?? 0;
  const pending = pendingLeads(leads, reminderHours);
  const lateCount = pending.filter((p) => p.late).length;
  const rate = kpis.contacted ? Math.round((kpis.won / kpis.contacted) * 100) : null;

  return (
    <div className="p-grid">
      <div className="p-head">
        <p className="eyebrow">Resumen</p>
        <h1>Panel de {company.name}</h1>
        <p className="p-sub">Últimos 30 días{company.is_demo ? " · datos demostrativos" : ""}</p>
      </div>

      <section className="p-kpis" aria-label="Indicadores principales">
        <Kpi label="Prospectos nuevos" value={kpis.total} hint="Llegaron en los últimos 30 días" />
        <Kpi label="Contactados" value={kpis.contacted} hint="Ya recibieron respuesta" />
        <Kpi label="En seguimiento" value={kpis.followUp} hint="Conversaciones abiertas" />
        <Kpi label="Ganados" value={kpis.won} hint={rate === null ? "Sin contactados aún" : `${rate}% de los contactados`} accent />
      </section>

      <section className="p-card p-chart" aria-label="Prospectos por semana">
        <div className="p-card-head">
          <h2>Prospectos por semana</h2>
          <span className="p-note">Últimas 8 semanas</span>
        </div>
        {leads.length === 0 ? (
          <p className="p-muted">Aún no hay prospectos. Aparecerán aquí cuando llegue el primero.</p>
        ) : (
          <div className="p-bars">
            {weeks.map((w, i) => (
              <div key={i} className="p-bar-col" title={`Semana del ${w.label}: ${w.n} prospectos`}>
                <span className="p-bar-val">{w.n}</span>
                <div className={`p-bar${i === weeks.length - 1 ? " now" : ""}`} style={{ height: `${(w.n / maxWeek) * 100}%` }} />
                <span className="p-bar-lbl">{w.label}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="p-card p-runs" aria-label="Estado de las automatizaciones">
        <div className="p-card-head"><h2>Automatizaciones</h2><span className="p-note">Últimas ejecuciones</span></div>
        {runs.length === 0 ? (
          <p className="p-muted">Todavía no hay automatizaciones activas.</p>
        ) : (
          <ul>
            {runs.map((r) => (
              <li key={r.id}>
                <span className={`pill run-${r.status}`}>{RUN_STATUS[r.status]}</span>
                <div>
                  <b>{r.name}</b>
                  <small>{SYSTEM_NAME[r.system]} · {fmtDateTime(r.ran_at)}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="p-card p-pending" aria-label="Prospectos por atender">
        <div className="p-card-head">
          <h2>Por atender</h2>
          <span className="p-note">
            {pending.length === 0
              ? "Ningún prospecto espera respuesta"
              : `${pending.length} en estado Nuevo${lateCount > 0 ? ` · ${lateCount} con más de ${reminderHours} h de espera` : ""}`}
          </span>
        </div>
        {pending.length === 0 ? (
          <p className="p-muted">Todo al día. Cuando llegue un prospecto nuevo aparecerá aquí hasta que alguien lo atienda.</p>
        ) : (
          <>
            <ul>
              {pending.slice(0, 6).map(({ lead, hours, late }) => (
                <li key={lead.id}>
                  <div>
                    <b>{lead.name}</b>
                    <small>{lead.assigned_to ? `Responsable: ${lead.assigned_to}` : "Sin responsable"}</small>
                  </div>
                  <span className={`pill ${late ? "wait-late" : "wait-ok"}`}>Espera hace {fmtWait(hours)}</span>
                </li>
              ))}
            </ul>
            <Link className="p-link" href="/portal/prospectos?estado=nuevo">Ver los {pending.length} por atender →</Link>
          </>
        )}
      </section>

      <section className="p-card p-table" aria-label="Prospectos recientes">
        <div className="p-card-head">
          <h2>Prospectos recientes</h2>
          <Link className="p-link" href="/portal/prospectos">Ver todos ({leads.length}) →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="p-muted">Aún no hay prospectos.</p>
        ) : (
          <LeadsTable leads={recent} />
        )}
      </section>
    </div>
  );
}

function Kpi({ label, value, hint, accent }: { label: string; value: number; hint: string; accent?: boolean }) {
  return (
    <div className={`p-kpi${accent ? " accent" : ""}`}>
      <span>{label}</span>
      <b>{value}</b>
      <small>{hint}</small>
    </div>
  );
}
