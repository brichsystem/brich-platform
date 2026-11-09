import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="site-footer on-navy">
      <div className="wrap">
        <Logo height={36} />
        <span>Estructura. Automatización. Crecimiento.</span>
        <Link href="/login">Portal de clientes</Link>
        <span>© {new Date().getFullYear()} BRich System · Quito, Ecuador</span>
      </div>
    </footer>
  );
}
