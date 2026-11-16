import { fmtDate, type Lead, type TeamMember } from "@/lib/portal";
import { AssigneeSelect } from "./AssigneeSelect";
import { StatusSelect } from "./StatusSelect";

/** Tabla de prospectos con el estado editable. Con `team`, el responsable también se puede cambiar (solo el dueño). */
export function LeadsTable({ leads, showContact = false, team }: { leads: Lead[]; showContact?: boolean; team?: TeamMember[] }) {
  return (
    <div className="p-scroll">
      <table>
        <thead>
          <tr>
            <th>Prospecto</th>
            {showContact && <th>Contacto</th>}
            <th>Interés</th>
            <th>Estado</th>
            <th>Responsable</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id}>
              <td>
                <b>{l.name}</b>
                {l.company_name && <small>{l.company_name}</small>}
                {(l.contact_count ?? 1) > 1 && <span className="p-repeat">Escribió {l.contact_count} veces</span>}
              </td>
              {showContact && (
                <td>
                  {l.phone && <span className="p-contact">{l.phone}</span>}
                  {l.email && <small>{l.email}</small>}
                </td>
              )}
              <td>{l.interest ?? "—"}</td>
              <td><StatusSelect leadId={l.id} status={l.status} leadName={l.name} /></td>
              <td>
                {team && team.length > 0 ? (
                  <AssigneeSelect leadId={l.id} leadName={l.name} userId={l.assigned_user_id ?? null} label={l.assigned_to} team={team} />
                ) : (
                  l.assigned_to ?? "Sin asignar"
                )}
              </td>
              <td className="num">{fmtDate(l.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
