import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { AnaliseIA } from "@/components/landing/AnaliseIA";
import { Galeria } from "@/components/landing/Galeria";
import { Orcamento } from "@/components/landing/Orcamento";
import { AntesDepois } from "@/components/landing/AntesDepois";
import { CTA, Footer } from "@/components/landing/CTA";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Deskly — Avalie seu home office com IA" },
      { name: "description", content: "Plataforma brasileira para montar, avaliar e melhorar seu home office com IA, produtos reais (Amazon BR, Mercado Livre, Kabum) e inspiração da comunidade." },
      { property: "og:title", content: "Deskly — Avalie seu home office com IA" },
      { property: "og:description", content: "Envie a foto do seu setup e receba nota de IA + sugestões de upgrades com preço de Brasil." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <AnaliseIA />
        <Galeria />
        <Orcamento />
        <AntesDepois />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
