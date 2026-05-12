import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { AnaliseIA } from "@/components/landing/AnaliseIA";
import { MarketplaceSection } from "@/components/landing/MarketplaceSection";
import { Galeria } from "@/components/landing/Galeria";
import { Orcamento } from "@/components/landing/Orcamento";
import { AntesDepois } from "@/components/landing/AntesDepois";
import { CTA, Footer } from "@/components/landing/CTA";

// Nova estrutura (auditoria UX 2026-05):
//  1. Hero IA com drop-zone (hook de aquisição)
//  2. AnaliseIA (resultados — ÚNICO bloco repete um pouco da promessa, mas
//     necessário porque renderiza o resultado real). Container compactado.
//  3. MarketplaceSection (segunda posição — alta lucratividade, 6 cards)
//  4. Galeria compacta (1 linha de 4 cards no desktop)
//  5. Orçamento (kits por faixa de preço)
//  6. Antes & Depois (transformação visual)
//  7. CTA final focado em Premium (não mais repetindo IA)
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
        <MarketplaceSection />
        <Galeria />
        <Orcamento />
        <AntesDepois />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
