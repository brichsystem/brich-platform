import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getOnboarding } from "./actions";
import { OnboardingForm } from "./OnboardingForm";
import "../../f/[slug]/form-page.css";
import "./alta.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Alta de cliente", robots: { index: false, follow: false } };

/** Página privada (por enlace) donde un cliente nuevo entrega los datos para configurar su sistema. */
export default async function OnboardingPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let req: Awaited<ReturnType<typeof getOnboarding>> | "error";
  try {
    req = await getOnboarding(code);
  } catch (err) {
    console.error("[alta] No se pudo cargar:", err instanceof Error ? err.message : err);
    req = "error";
  }
  if (!req) notFound();

  return (
    <main className="fp">
      <div className="fp-box alta-box">
        <div className="alta-logo"><Logo variant="navy" height={48} /></div>
        {req === "error" ? (
          <section className="fp-card" role="alert">
            <h1>La página no está disponible en este momento</h1>
            <p className="fp-lead">Recarga en unos minutos. Tus datos no se han perdido.</p>
          </section>
        ) : req.submitted ? (
          <section className="fp-card" role="status">
            <p className="eyebrow">Alta de cliente</p>
            <h1>Ya recibimos los datos de {req.label}</h1>
            <p className="fp-lead">Estamos configurando tu sistema. Si necesitas corregir algo, escríbenos y lo ajustamos.</p>
          </section>
        ) : (
          <section className="fp-card">
            <p className="eyebrow">Alta de cliente · BRich Sales System</p>
            <h1>Bienvenido, {req.label}</h1>
            <p className="fp-lead">Con estos datos configuramos tu formulario, tu panel y los avisos a tu equipo. Toma unos 5 minutos.</p>
            <OnboardingForm code={code} label={req.label} />
          </section>
        )}
      </div>
    </main>
  );
}
