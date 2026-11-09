import Link from "next/link";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="site-header">
      <div className="wrap nav">
        <Link className="logo" href="/" aria-label="BRich, inicio">
          <Logo />
        </Link>
        <ul>
          <li><Link href="/#sistemas">Sistemas</Link></li>
          <li><Link href="/#proceso">Proceso</Link></li>
          <li><Link href="/#portal">Portal</Link></li>
          <li><Link href="/login">Ingresar</Link></li>
        </ul>
        <Link className="btn btn-primary" href="/#diagnostico">
          Pedir diagnóstico
        </Link>
      </div>
    </header>
  );
}
