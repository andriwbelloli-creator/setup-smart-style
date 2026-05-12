import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { AnaliseIA } from "@/components/landing/AnaliseIA";
import { Galeria } from "@/components/landing/Galeria";
import { MarketplaceSection } from "@/components/landing/MarketplaceSection";
import { Orcamento } from "@/components/landing/Orcamento";
import { AntesDepois } from "@/components/landing/AntesDepois";
import { CTA, Footer } from "@/components/landing/CTA";

// Estrutura da home:
//  1. Hero (IA como protagonista — gancho de aquisição)
//  2. AnaliseIA (componente interativo: foto → nota)
//  3. Galeria (inspiração / prova social)
//  4. MarketplaceSection (compra e venda usados — destaque secundário)
//  5. Orçamento (kits curados por faixa de preço)
//  6. AntesDepois (transformação visual)
//  7. CTA + Footer
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
      { title: "HomeOfficeLife — Avalie seu home office com IA · Brasil" },
      { name: "description", content: "Plataforma brasileira para montar, avaliar e melhorar seu home office com IA, marketplace de usados, kits curados e inspiração da comunidade." },
      { property: "og:title", content: "HomeOfficeLife — Avalie seu home office com IA" },
      { property: "og:description", content: "Envie a foto do seu setup e receba nota de IA + sugestões de upgrades com preço de Brasil." },
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
      <main>
        <Hero />
        <AnaliseIA />
        <Galeria />
        <MarketplaceSection />
        <Orcamento />
        <AntesDepois />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
