import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Ingresar al portal", robots: { index: false } };

export default function LoginPage() {
  return (
    <main className="login-page on-navy">
      <div className="login-box">
        <Link href="/" aria-label="BRich, volver al inicio" className="login-logo">
          <Logo />
        </Link>
        <div className="login-card">
          <p className="eyebrow">Portal de clientes</p>
          <h1>Ingresa a tu panel</h1>
          <LoginForm />
        </div>
        <Link href="/" className="crumb">← Volver al sitio</Link>
      </div>
    </main>
  );
}
