import type { Metadata } from "next";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@/styles/tokens.css";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Icons } from "@/components/Icons";

export const metadata: Metadata = {
  title: {
    default: "BRich System · Sistemas de automatización empresarial",
    template: "%s · BRich System",
  },
  description:
    "BRich diseña, implementa y administra sistemas de automatización para empresas establecidas: ventas, atención y operaciones.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Icons />
        <Header />
        <main id="inicio">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
