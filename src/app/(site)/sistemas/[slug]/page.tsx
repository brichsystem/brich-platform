import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSystem, systems } from "@/lib/systems";
import { Check, Spark } from "@/components/Icons";
import { DiagnosticSection } from "@/components/DiagnosticSection";

export function generateStaticParams() {
  return systems.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = getSystem(slug);
  return s ? { title: s.name, description: s.summary } : {};
}

export default async function SystemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getSystem(slug);
  if (!s) notFound();
  const others = systems.filter((o) => o.slug !== s.slug);

  return (
    <>
      <div className="on-navy">
        <div className="wrap sys-hero">
          <Link className="crumb" href="/#sistemas">← Todos los sistemas</Link>
          <p className="eyebrow" style={{ marginTop: 24 }}>{s.name}</p>
          <h1>{s.title}</h1>
          <p className="lead">{s.summary}</p>
          <div className="ctas">
            <Link className="btn btn-primary" href="#diagnostico">Pedir diagnóstico</Link>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">El problema</p>
            <h2>{s.forWho}</h2>
          </div>
          <div className="grid3">
            {s.problems.map((p) => (
              <div key={p} className="card">
                <div className="card-head"><Spark /></div>
                <p style={{ color: "var(--text-primary)" }}>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section ice">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Cómo funciona</p>
            <h2>El recorrido, paso a paso</h2>
          </div>
          <ol className="process cols-auto">
            {s.howItWorks.map((h) => (
              <li key={h.title}><h3>{h.title}</h3><p>{h.text}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="split">
            <div className="card">
              <h3>Qué incluye</h3>
              <ul className="checks">
                {s.features.map((f) => <li key={f}><Check />{f}</li>)}
              </ul>
              <h3 style={{ marginTop: 16 }}>Herramientas que conectamos</h3>
              <ul className="tools">
                {s.tools.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
            <div className="card us">
              <h3>Lo que necesitamos de tu empresa</h3>
              <ul>
                {s.clientProvides.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section ice" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Otros sistemas</p>
            <h2>Se pueden combinar según tu operación</h2>
          </div>
          <div className="others">
            {others.map((o) => (
              <Link key={o.slug} href={`/sistemas/${o.slug}`} className="card sys">
                <span className="code">{o.name}</span>
                <h3>{o.title}</h3>
                <p>{o.summary}</p>
                <span className="more">Ver cómo funciona →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <DiagnosticSection defaultSystem={s.name} />
    </>
  );
}
