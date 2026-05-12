import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { HeroMarketplace } from "@/components/landing/HeroMarketplace";
import { ComoFunciona } from "@/components/landing/ComoFunciona";
import { FerramentasSetup } from "@/components/landing/FerramentasSetup";
import { Galeria } from "@/components/landing/Galeria";
import { CTA, Footer } from "@/components/landing/CTA";

// Reorganização (pivô pra marketplace-first):
// 1. Hero do Marketplace (produto principal)
// 2. Como funciona (reduz fricção: 3 passos vender + 3 passos comprar)
// 3. Ferramentas (IA, Galeria, Kits — reposicionados como suporte)
// 4. Galeria miniatura (prova social / inspiração)
// 5. CTA final
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "HomeOfficeLife",
  alternateName: "HomeOfficeLife BR",
  url: "https://homeofficelife.com.br",
  logo: "https://homeofficelife.com.br/favicon.svg",
  description:
    "Marketplace brasileiro de compra e venda de equipamentos de home office usados. Sem taxa pra anunciar, comunidade BR.",
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
    target: "https://homeofficelife.com.br/marketplace?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HomeOfficeLife — Marketplace de home office usado · Brasil" },
      { name: "description", content: "Compre e venda equipamentos de home office direto entre pessoas: monitor, cadeira, teclado, mesa. Sem taxa pra anunciar, comunidade brasileira." },
      { property: "og:title", content: "HomeOfficeLife — Marketplace de home office usado" },
      { property: "og:description", content: "Compre e venda direto com a comunidade brasileira de home office. Sem taxa pra anunciar." },
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
        <HeroMarketplace />
        <ComoFunciona />
        <FerramentasSetup />
        <Galeria />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
