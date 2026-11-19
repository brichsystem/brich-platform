import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./(site)/site.css";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="desk">
        <section className="sheet">
          <div className="asunto">
            <h1>Esta página no existe</h1>
            <p>Revisa la dirección o vuelve al inicio para ver nuestros sistemas.</p>
            <Link className="btn btn-primary" href="/">Volver al inicio</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
