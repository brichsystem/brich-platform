import Link from "next/link";
import { FlowDemo } from "@/components/FlowDemo";
import { SystemCard } from "@/components/SystemCard";
import { DiagnosticSection } from "@/components/DiagnosticSection";
import { Check, Spark } from "@/components/Icons";
import { systems } from "@/lib/systems";

const pains = [
  { title: "Todo pasa por el dueño", text: "Si tú no respondes, nadie responde. Tu tiempo se va en tareas que el equipo podría resolver con un proceso claro." },
  { title: "Prospectos que se pierden", text: "Consultas sin registro ni seguimiento. Nadie sabe cuántas llegaron ni cuántas se cerraron." },
  { title: "Decisiones sin datos", text: "La información está repartida entre chats, hojas de cálculo y la memoria del equipo." },
];

const process = [
  { title: "Diagnóstico", text: "Revisamos cómo trabajas hoy y dónde se pierde tiempo o dinero." },
  { title: "Diseño", text: "Definimos el sistema, las herramientas y los indicadores que vamos a medir." },
  { title: "Implementación", text: "Configuramos, conectamos y probamos. Capacitamos a tu equipo." },
  { title: "Acompañamiento", text: "Supervisamos el funcionamiento, resolvemos fallas y aplicamos mejoras." },
];

// Valores de ejemplo para la vista demostrativa del panel (etiquetada en pantalla).
const demoBars = [22, 34, 28, 48, 42, 62, 55, 74, 60, 84, 70, 96];

export default function Home() {
  return (
    <>
      <div className="on-navy">
        <div className="wrap hero">
          <div>
            <p className="eyebrow">Sistemas de automatización empresarial</p>
            <h1>
              Moderniza tu empresa. <span>Escala con sistemas.</span>
            </h1>
            <p className="lead">
              Conectamos tus herramientas, ordenamos tus procesos y medimos tus resultados. BRich diseña, implementa y
              administra el sistema; tu equipo lo usa sin tocar la parte técnica.
            </p>
            <div className="ctas">
              <Link className="btn btn-primary" href="#diagnostico">Pedir diagnóstico</Link>
              <Link className="btn btn-ghost" href="#sistemas">Ver los sistemas</Link>
            </div>
          </div>
          <FlowDemo />
        </div>
      </div>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">El problema</p>
            <h2>Lo que frena a una empresa que ya tiene clientes</h2>
            <p>Después de unos años, el negocio crece más rápido que su forma de trabajar.</p>
          </div>
          <div className="grid3">
            {pains.map((p) => (
              <div key={p.title} className="card">
                <div className="card-head"><Spark /><h3>{p.title}</h3></div>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="sistemas" className="section ice">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Catálogo</p>
            <h2>Tres sistemas, cada uno resuelve un problema concreto</h2>
            <p>No vendemos herramientas sueltas. Cada sistema se adapta a tu empresa y BRich lo mantiene funcionando.</p>
          </div>
          <div className="grid3">
            {systems.map((s) => <SystemCard key={s.slug} s={s} />)}
          </div>
        </div>
      </section>

      <section id="proceso" className="section">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Cómo trabajamos</p>
            <h2>De tu proceso actual a un sistema que tu equipo puede seguir</h2>
          </div>
          <ol className="process">
            {process.map((p) => (
              <li key={p.title}><h3>{p.title}</h3><p>{p.text}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section id="portal" className="section on-navy">
        <div className="wrap portal">
          <div>
            <div className="sec-head" style={{ marginBottom: 0 }}>
              <p className="eyebrow">Portal de clientes</p>
              <h2>Tus resultados en un solo lugar</h2>
              <p>Cada cliente entra con su usuario y ve solo la información de su empresa.</p>
            </div>
            <ul className="checks">
              <li><Check />Prospectos y su estado</li>
              <li><Check />Indicadores de ventas y operación</li>
              <li><Check />Estado de tus sistemas activos</li>
            </ul>
          </div>
          <div className="dash" aria-label="Vista demostrativa del panel de cliente">
            <div className="dash-top">
              <strong>Panel de cliente</strong>
              <span className="demo-badge">Vista demostrativa</span>
            </div>
            <div className="kpis">
              <div className="kpi"><span>Prospectos</span><b>128</b></div>
              <div className="kpi"><span>Contactados</span><b>94</b></div>
              <div className="kpi"><span>Seguimientos</span><b>36</b></div>
            </div>
            <div className="bars" aria-hidden="true">
              {demoBars.map((h, i) => (
                <i key={i} className={i >= 9 ? "hi" : undefined} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Responsabilidades</p>
            <h2>Tú diriges tu negocio. Nosotros sostenemos el sistema.</h2>
          </div>
          <div className="split">
            <div className="card us">
              <h3>Lo que hace BRich</h3>
              <ul>
                <li>Diseña e implementa el sistema</li>
                <li>Configura las integraciones y el panel</li>
                <li>Supervisa, corrige y mejora</li>
                <li>Capacita a tu equipo</li>
              </ul>
            </div>
            <div className="card">
              <h3>Lo que haces tú</h3>
              <ul>
                <li>Nos explicas cómo trabaja tu empresa</li>
                <li>Autorizas las conexiones necesarias</li>
                <li>Validas que el sistema funcione como esperas</li>
                <li>Usas el panel para decidir mejor</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <DiagnosticSection />
    </>
  );
}
