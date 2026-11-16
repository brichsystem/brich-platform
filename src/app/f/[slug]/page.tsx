import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadForm } from "@/components/LeadForm";
import { Logo } from "@/components/Logo";
import { getPublicForm, type PublicForm } from "@/lib/public-form";
import "./form-page.css";

// Se consulta en cada visita: si BRich desactiva o cambia un formulario, se refleja al instante.
export const dynamic = "force-dynamic";

async function load(slug: string): Promise<PublicForm | "error" | null> {
  try {
    return await getPublicForm(slug);
  } catch (err) {
    console.error("[f] No se pudo cargar el formulario:", err instanceof Error ? err.message : err);
    return "error";
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const form = await load(slug);
  if (!form || form === "error") return { title: "Formulario", robots: { index: false } };
  return {
    title: { absolute: `Contacta a ${form.name}` },
    description: `Déjanos tus datos y el equipo de ${form.name} te contactará.`,
  };
}

/** Camino B: página pública de formulario de un cliente de BRich. */
export default async function ClientFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const form = await load(slug);
  if (!form) notFound();

  return (
    <main className="fp">
      <div className="fp-box">
        {form === "error" ? (
          <section className="fp-card" role="alert">
            <h1>El formulario no está disponible en este momento</h1>
            <p className="fp-lead">Recarga la página en unos minutos.</p>
          </section>
        ) : (
          <section className="fp-card">
            <p className="eyebrow">Solicitud de información</p>
            <h1>Contacta a {form.name}</h1>
            <p className="fp-lead">Déjanos tus datos y te contactaremos por WhatsApp o correo.</p>
            <LeadForm
              companySlug={form.slug}
              options={form.services.length ? form.services : ["Información general"]}
              messageLabel="¿Qué necesitas? (opcional)"
              submitLabel="Enviar solicitud"
              successTitle="Recibimos tu solicitud"
              successText={`El equipo de ${form.name} revisará tus datos y te contactará pronto.`}
              legal={`Usaremos tus datos solo para que ${form.name} te contacte sobre tu solicitud.`}
            />
          </section>
        )}
        <Link className="fp-powered" href="/" aria-label="Formulario gestionado por BRich System">
          <span>Gestionado por</span>
          <Logo variant="navy" height={36} />
        </Link>
      </div>
    </main>
  );
}
