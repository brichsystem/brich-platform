import { DiagnosticForm } from "./DiagnosticForm";

export function DiagnosticSection({ defaultSystem }: { defaultSystem?: string }) {
  return (
    <section id="diagnostico" className="section ice">
      <div className="wrap cta">
        <div>
          <p className="eyebrow">Diagnóstico</p>
          <h2>Revisemos tu proceso</h2>
          <p className="lead">
            En 30 minutos revisamos cómo trabaja tu empresa y te decimos qué sistema tiene sentido para ti, o si
            todavía no lo necesitas.
          </p>
          <dl>
            <div><dt>Para quién</dt><dd>Empresas con 3 o más años de operación</dd></div>
            <div><dt>Duración</dt><dd>30 minutos, en línea</dd></div>
            <div><dt>Costo</dt><dd>Sin costo</dd></div>
          </dl>
        </div>
        <DiagnosticForm defaultSystem={defaultSystem} />
      </div>
    </section>
  );
}
