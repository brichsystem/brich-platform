import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./site.css";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="inicio">{children}</main>
      <Footer />
    </>
  );
}
