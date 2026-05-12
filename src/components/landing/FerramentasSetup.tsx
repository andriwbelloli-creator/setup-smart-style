import { Link } from "@tanstack/react-router";
import { Sparkles, Image as ImageIcon, ShoppingBag, ArrowRight } from "lucide-react";

// Após o Hero do Marketplace, reposicionamos os 3 outros serviços
// (IA, Inspiração/Galeria, Sugestões de compra) como FERRAMENTAS
// que dão suporte ao Marketplace — não como produtos principais.
//
// A narrativa muda: "antes de comprar (novo ou usado), use essas
// ferramentas pra decidir bem".
const TOOLS = [
  {
    icon: Sparkles,
    title: "Avaliação IA do seu setup",
    blurb: "Mande uma foto, receba nota de ergonomia, iluminação e dicas. Saiba o que falta no seu home office antes de comprar.",
    cta: "Avaliar grátis",
    to: "/diagnostico",
    color: "text-primary",
  },
  {
    icon: ImageIcon,
    title: "Galeria de setups reais",
    blurb: "Inspiração de 50+ home offices brasileiros. Veja o que outros estão usando, qual mesa, qual cadeira, qual orçamento.",
    cta: "Explorar galeria",
    to: "/galeria",
    color: "text-accent",
  },
  {
    icon: ShoppingBag,
    title: "Comprar novo? Veja preços BR",
    blurb: "Listas curadas com produtos da Amazon BR, Mercado Livre, Kabum. Use pra comparar preço de novo vs. usado no marketplace.",
    cta: "Ver kits e orçamentos",
    to: "/kits",
    color: "text-foreground",
  },
] as const;

export function FerramentasSetup() {
  return (
    <section className="bg-secondary/30 py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Ferramentas
          </div>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Mais que marketplace — uma plataforma completa
          </h2>
          <p className="mt-3 text-muted-foreground">
            Antes de comprar (usado ou novo), use essas ferramentas pra acertar.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TOOLS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="group flex flex-col rounded-3xl border border-border bg-card p-6 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-background ${t.color}`}>
                <t.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold leading-tight">{t.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{t.blurb}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-smooth group-hover:gap-2">
                {t.cta} <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
