import { fmtDate, type Lead } from "@/lib/portal";
import { StatusSelect } from "./StatusSelect";

/** Tabla de prospectos con el estado editable. */
export function LeadsTable({ leads, showContact = false }: { leads: Lead[]; showContact?: boolean }) {
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
              <td>{l.assigned_to ?? "Sin asignar"}</td>
              <td className="num">{fmtDate(l.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
