import Link from "next/link";
import { Solicitud } from "@/components/Solicitud";
import { Check } from "@/components/Icons";
import { systems } from "@/lib/systems";

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

const situacion = [
  { title: "Todo pasa por el dueño", text: "Si tú no respondes, nadie responde. Tu tiempo se va en tareas que el equipo podría resolver con un proceso claro." },
  { title: "Prospectos que se pierden", text: "Consultas sin registro ni seguimiento. Nadie sabe cuántas llegaron ni cuántas se cerraron." },
  { title: "Decisiones sin datos", text: "La información está repartida entre chats, hojas de cálculo y la memoria del equipo." },
];

/**
 * Recorrido de una consulta en BRich Sales System, con lo que hoy hace el sistema.
 * Nombres y horas son demostrativos (etiquetados en pantalla).
 */
const recorrido = [
  { hora: "09:14", evento: "Llega una consulta por el formulario web", quien: "Formulario", estado: "Recibida" },
  { hora: "09:14", evento: "Se registra sin duplicar: si ya escribió antes, se suma a su ficha", quien: "Sistema", estado: "Registrada" },
  { hora: "09:14", evento: "Se asigna por turno al vendedor que lleva más tiempo sin recibir una", quien: "Vendedor Demo 2", estado: "Asignada" },
  { hora: "09:15", evento: "El vendedor recibe un correo con los datos del prospecto", quien: "Vendedor Demo 2", estado: "Avisada" },
  { hora: "+24 h", evento: "Si sigue sin atender, el sistema se lo recuerda", quien: "Sistema", estado: "Programada" },
  { hora: "Siempre", evento: "Estado, responsable y espera visibles en el panel de tu empresa", quien: "Tu equipo", estado: "Visible" },
];

const procedimiento = [
  { title: "Diagnóstico", text: "Revisamos cómo trabajas hoy y dónde se pierde tiempo o dinero." },
  { title: "Diseño", text: "Definimos el sistema, las herramientas y los indicadores que vamos a medir." },
  { title: "Implementación", text: "Configuramos, conectamos y probamos. Capacitamos a tu equipo." },
  { title: "Acompañamiento", text: "Supervisamos el funcionamiento, resolvemos fallas y aplicamos mejoras." },
];

export default function Home() {
  return (
    <div className="desk">
      <Solicitud
        title="Cada consulta de tu empresa, registrada, con responsable y seguimiento."
        intro="BRich diseña, implementa y administra el sistema; tu equipo lo usa sin tocar la parte técnica. Registra tu solicitud y en 30 minutos revisamos cómo trabajas hoy."
      />

      <article className="sheet detalle" aria-label="Detalle de los sistemas BRich">
        <section className="part">
          <h2>Lo que frena a una empresa que ya tiene clientes</h2>
          <p className="part-lead">Después de unos años, el negocio crece más rápido que su forma de trabajar.</p>
          <ul className="obs">
            {situacion.map((s) => (
              <li key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="part" id="sistemas">
          <h2>Detalle de sistemas</h2>
          <p className="part-lead">No vendemos herramientas sueltas. Cada sistema se adapta a tu empresa y BRich lo mantiene funcionando.</p>
          <div className="tabla" role="table" aria-label="Sistemas BRich">
            <div className="tabla-fila tabla-cab" role="row">
              <span role="columnheader">Sistema</span>
              <span role="columnheader">Para quién</span>
              <span role="columnheader">Incluye</span>
              <span role="columnheader"><span className="sr-only">Ficha</span></span>
            </div>
            {systems.map((s) => (
              <div className="tabla-fila" role="row" key={s.slug}>
                <span role="cell" className="sis">
                  <b>{s.title}</b>
                  <small>{s.name}</small>
                </span>
                <span role="cell" className="para">{cap(s.forWho.replace(/^Para /, ""))}</span>
                <span role="cell">
                  <ul className="incluye">
                    {s.features.map((f) => (
                      <li key={f}><Check />{f}</li>
                    ))}
                  </ul>
                </span>
                <span role="cell" className="ver">
                  <Link href={`/sistemas/${s.slug}`} aria-label={`Ver la ficha de ${s.name}`}>Ver ficha →</Link>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="part" id="recorrido">
          <div className="part-title">
            <h2>Recorrido de una consulta</h2>
            <span className="demo-tag">Demostrativo</span>
          </div>
          <p className="part-lead">Así avanza hoy una consulta en BRich Sales System. Los nombres y horas son de ejemplo.</p>
          <ol className="bitacora">
            {recorrido.map((r) => (
              <li key={r.evento}>
                <span className="hora num">{r.hora}</span>
                <span className="evento">{r.evento}</span>
                <span className="quien">{r.quien}</span>
                <span className="estado">{r.estado}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="part" id="condiciones">
          <h2>Tú diriges tu negocio. Nosotros sostenemos el sistema.</h2>
          <div className="condiciones">
            <div>
              <h3>Corresponde a BRich</h3>
              <ul>
                <li>Diseñar e implementar el sistema</li>
                <li>Configurar las integraciones y el panel</li>
                <li>Supervisar, corregir y mejorar</li>
                <li>Capacitar a tu equipo</li>
              </ul>
            </div>
            <div>
              <h3>Corresponde a tu empresa</h3>
              <ul>
                <li>Explicarnos cómo trabaja hoy</li>
                <li>Autorizar las conexiones necesarias</li>
                <li>Validar que el sistema funcione como espera</li>
                <li>Usar el panel para decidir mejor</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="part" id="procedimiento">
          <h2>Procedimiento</h2>
          <p className="part-lead">De tu proceso actual a un sistema que tu equipo puede seguir.</p>
          <ol className="etapas">
            {procedimiento.map((p, i) => (
              <li key={p.title}>
                <h3><span className="num">{i + 1}</span> · {p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="part" id="portal">
          <h2>Tu copia: el portal de clientes</h2>
          <div className="copia">
            <p>Cada cliente entra con su usuario y ve solo la información de su empresa.</p>
            <ul className="incluye">
              <li><Check />Prospectos, su estado y su responsable</li>
              <li><Check />Los que esperan atención y desde cuándo</li>
              <li><Check />El registro de cada automatización</li>
            </ul>
            <Link className="btn-link" href="/login">Ingresar al portal →</Link>
          </div>
        </section>

        <footer className="cierre">
          <p>Fin del documento. Si algo de esto pasa en tu empresa, empecemos por el diagnóstico.</p>
          <Link className="btn btn-primary" href="#campos">Registrar solicitud</Link>
        </footer>
      </article>
    </div>
  );
}
