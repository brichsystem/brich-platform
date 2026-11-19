import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSystem, systems } from "@/lib/systems";

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
import { Check } from "@/components/Icons";
import { Logo } from "@/components/Logo";
import { Solicitud } from "@/components/Solicitud";

export function generateStaticParams() {
  return systems.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = getSystem(slug);
  return s ? { title: s.name, description: s.summary } : {};
}

/** Ficha de un sistema: el mismo documento de la portada, con el detalle de un solo sistema. */
export default async function SystemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getSystem(slug);
  if (!s) notFound();
  const others = systems.filter((o) => o.slug !== s.slug);

  return (
    <div className="desk">
      <article className="sheet ficha-sistema" aria-labelledby="sistema-title">
        <div className="sheet-head">
          <div className="box emisor">
            <Logo variant="navy" height={40} />
            <p>
              <b>BRich System</b>
              <span>Sistemas de automatización empresarial · Quito, Ecuador</span>
            </p>
          </div>
          <div className="box datos">
            <p className="datos-title">Ficha de sistema</p>
            <dl>
              <dt>Sistema</dt>
              <dd>{s.name}</dd>
              <dt>Para</dt>
              <dd>{cap(s.forWho.replace(/^Para /, "").replace(/\.$/, ""))}</dd>
            </dl>
          </div>
        </div>

        <div className="asunto">
          <Link className="volver" href="/#sistemas">← Todos los sistemas</Link>
          <h1 id="sistema-title">{s.title}</h1>
          <p>{s.summary}</p>
          <Link className="btn btn-primary" href="#campos">Pedir diagnóstico</Link>
        </div>

        <section className="part">
          <h2>Lo que resuelve</h2>
          <ul className="obs">
            {s.problems.map((p) => (
              <li key={p} className="obs-solo"><p>{p}</p></li>
            ))}
          </ul>
        </section>

        <section className="part">
          <h2>Cómo funciona</h2>
          <ol className="etapas">
            {s.howItWorks.map((h, i) => (
              <li key={h.title}>
                <h3><span className="num">{i + 1}</span> · {h.title}</h3>
                <p>{h.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="part">
          <div className="condiciones">
            <div>
              <h2 className="h-sub">Qué incluye</h2>
              <ul className="incluye">
                {s.features.map((f) => <li key={f}><Check />{f}</li>)}
              </ul>
              <h2 className="h-sub">Herramientas que conectamos</h2>
              <ul className="etiquetas">
                {s.tools.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
            <div>
              <h2 className="h-sub">Lo que necesitamos de tu empresa</h2>
              <ul>
                {s.clientProvides.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section className="part">
          <h2>Se combina con</h2>
          <div className="tabla" role="table" aria-label="Otros sistemas BRich">
            {others.map((o) => (
              <div className="tabla-fila tabla-corta" role="row" key={o.slug}>
                <span role="cell" className="sis">
                  <b>{o.title}</b>
                  <small>{o.name}</small>
                </span>
                <span role="cell" className="para">{o.summary}</span>
                <span role="cell" className="ver">
                  <Link href={`/sistemas/${o.slug}`} aria-label={`Ver la ficha de ${o.name}`}>Ver ficha →</Link>
                </span>
              </div>
            ))}
          </div>
        </section>
      </article>

      <Solicitud
        headingLevel={2}
        compact
        defaultSystem={s.name}
        title={`¿${s.title} para tu empresa? Revisemos tu caso.`}
        intro="En 30 minutos revisamos cómo trabaja tu empresa y te decimos qué sistema tiene sentido para ti, o si todavía no lo necesitas."
      />
    </div>
  );
}
