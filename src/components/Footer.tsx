import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <Logo variant="navy" height={36} />
        <span>Estructura. Automatización. Crecimiento.</span>
        <Link href="/login">Portal de clientes</Link>
        <span>© {new Date().getFullYear()} BRich System · Quito, Ecuador</span>
      </div>
    </footer>
  );
}
