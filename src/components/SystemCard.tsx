import Link from "next/link";
import type { SystemInfo } from "@/lib/systems";
import { Check } from "./Icons";

export function SystemCard({ s }: { s: SystemInfo }) {
  return (
    <Link href={`/sistemas/${s.slug}`} className="card sys">
      <span className="code">{s.name}</span>
      <h3>{s.title}</h3>
      <p>{s.forWho}</p>
      <ul className="checks">
        {s.features.map((f) => (
          <li key={f}><Check />{f}</li>
        ))}
      </ul>
      <p className="chain">
        {s.chain.map((c, i) => (
          <span key={c}>
            {i > 0 && " → "}
            {i === 0 || i === s.chain.length - 1 ? c : <b>{c}</b>}
          </span>
        ))}
      </p>
      <span className="more">Ver cómo funciona →</span>
    </Link>
  );
}
