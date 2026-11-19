import Link from "next/link";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="site-header">
      <div className="wrap nav">
        <Link className="logo" href="/" aria-label="BRich, inicio">
          <Logo variant="navy" />
        </Link>
        <nav aria-label="Principal">
          <ul>
            <li><Link href="/#sistemas">Sistemas</Link></li>
            <li><Link href="/#recorrido">Recorrido</Link></li>
            <li><Link href="/#procedimiento">Procedimiento</Link></li>
            <li><Link href="/login">Ingresar</Link></li>
          </ul>
        </nav>
        <Link className="btn btn-primary" href="/#campos" aria-label="Pedir diagnóstico">
          <span className="cta-largo">Pedir diagnóstico</span>
          <span className="cta-corto" aria-hidden="true">Diagnóstico</span>
        </Link>
      </div>
    </header>
  );
}
