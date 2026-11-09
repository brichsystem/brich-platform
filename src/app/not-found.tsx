import Link from "next/link";

export default function NotFound() {
  return (
    <div className="on-navy">
      <div className="wrap sys-hero">
        <p className="eyebrow">Error 404</p>
        <h1>Esta página no existe</h1>
        <p className="lead">Revisa la dirección o vuelve al inicio para ver nuestros sistemas.</p>
        <div className="ctas">
          <Link className="btn btn-primary" href="/">Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
