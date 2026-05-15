import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { AnaliseIA } from "@/components/landing/AnaliseIA";
import { MarketplaceSection } from "@/components/landing/MarketplaceSection";
import { Galeria } from "@/components/landing/Galeria";
import { AntesDepois } from "@/components/landing/AntesDepois";
import { FaqSection } from "@/components/landing/FaqSection";
import { CTA, Footer } from "@/components/landing/CTA";

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
  name: "HomeOfficeLife",
  alternateName: "HomeOfficeLife BR",
  url: "https://homeofficelife.com.br",
  logo: "https://homeofficelife.com.br/favicon.svg",
  description:
    "Plataforma brasileira para montar, avaliar e melhorar setups de home office com IA, marketplace de usados e produtos curados.",
  areaServed: "BR",
  sameAs: [] as string[],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  url: "https://homeofficelife.com.br",
  name: "HomeOfficeLife",
  inLanguage: "pt-BR",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://homeofficelife.com.br/galeria?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HomeOfficeLife — Transforme seu home office com IA · Brasil" },
      { name: "description", content: "Envie uma foto do seu espaço e receba ideias decoradas, diagnóstico inteligente e produtos por orçamento para montar um home office mais bonito, confortável e produtivo." },
      { property: "og:title", content: "HomeOfficeLife — Transforme seu home office com IA" },
      { property: "og:description", content: "Envie uma foto do seu espaço e receba ideias decoradas + diagnóstico + produtos pra montar um home office melhor." },
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
