import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { AnaliseIA } from "@/components/landing/AnaliseIA";
import { MarketplaceSection } from "@/components/landing/MarketplaceSection";
import { Galeria } from "@/components/landing/Galeria";
import { AntesDepois } from "@/components/landing/AntesDepois";
import { FaqSection } from "@/components/landing/FaqSection";
import { CTA, Footer } from "@/components/landing/CTA";
import { lazy, Suspense } from "react";

// Onda 4 — nova homepage atrás de ?new=1. Lazy pra não inflar o bundle principal.
const NewHomepageWrapper = lazy(
  () => import("@/components/landing/__new/NewHomepageWrapper"),
);

// Ordem atual (2026-05-13, ajuste UX):
//  1. Hero IA com drop-zone (hook de aquisição)
//  2. AnaliseIA (resultados reais)
//  3. AntesDepois (prova social visual)
//  4. Galeria (inspiração — 2 colunas, acima da loja pra puxar inspiração antes do CTA comercial)
//  5. MarketplaceSection (oferta comercial)
//  6. CTA Comunidade (newsletter + criar conta)
//  Orçamento sai da home (segue acessível em /orcamento).
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Office Planner",
  alternateName: "Office Planner BR",
  url: "https://officeplanner.com.br",
  logo: "https://officeplanner.com.br/favicon.svg",
  description:
    "Plataforma brasileira de IA para transformar e planejar escritórios, consultórios, home offices e ambientes profissionais.",
  areaServed: "BR",
  sameAs: [] as string[],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  url: "https://officeplanner.com.br",
  name: "Office Planner",
  inLanguage: "pt-BR",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://officeplanner.com.br/galeria?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Office Planner — Planeje seu office com IA · Brasil" },
      { name: "description", content: "Envie uma foto do seu espaço e receba ideias decoradas com IA para escritórios, consultórios, home offices e ambientes profissionais. Diagnóstico inteligente e produtos curados." },
      { property: "og:title", content: "Office Planner — Planeje seu office com IA" },
      { property: "og:description", content: "Transforme escritórios, consultórios e home offices com IA. Envie uma foto e receba ideias decoradas, diagnóstico e produtos pra montar seu ambiente." },
      { property: "og:type", content: "website" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(orgSchema) },
      { type: "application/ld+json", children: JSON.stringify(websiteSchema) },
    ],
  }),
  component: Index,
});

function Index() {
  // Onda 5 — nova homepage é o padrão. ?legacy=1 mostra a versão anterior.
  const showLegacy =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("legacy") === "1";

  if (showLegacy) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content">
          <Hero />
          <AnaliseIA />
          <AntesDepois />
          <Galeria />
          <MarketplaceSection />
          <FaqSection />
          <CTA />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <NewHomepageWrapper />
    </Suspense>
  );
}
