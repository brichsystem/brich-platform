"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/portal", label: "Resumen" },
  { href: "/portal/prospectos", label: "Prospectos" },
];

export function PortalNav() {
  const path = usePathname();
  return (
    <nav className="portal-nav" aria-label="Secciones del portal">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
