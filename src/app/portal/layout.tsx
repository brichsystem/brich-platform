import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getSessionContext } from "@/lib/portal";
import { logout } from "@/app/login/actions";
import "./portal.css";

export const metadata: Metadata = { title: "Portal", robots: { index: false } };

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, company } = await getSessionContext();
  if (!user) redirect("/login");

  return (
    <div className="portal-shell">
      <header className="portal-bar">
        <div className="portal-wrap portal-bar-inner">
          <Link href="/portal" aria-label="Inicio del portal"><Logo height={36} /></Link>
          <div className="portal-user">
            <span className="portal-company">{company?.name ?? "Sin empresa asignada"}</span>
            <span className="portal-email">{profile?.full_name ?? user.email}</span>
          </div>
          <form action={logout}>
            <button className="btn btn-ghost portal-logout" type="submit">Cerrar sesión</button>
          </form>
        </div>
      </header>
      {company?.is_demo && (
        <div className="demo-banner" role="note">
          <div className="portal-wrap">
            <strong>Datos de demostración.</strong> Esta empresa y sus registros son ficticios y sirven solo para
            mostrar cómo funciona el portal.
          </div>
        </div>
      )}
      <main className="portal-wrap portal-main">{children}</main>
    </div>
  );
}
