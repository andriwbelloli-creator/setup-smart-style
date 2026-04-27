import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { Wallet, Check, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/orcamento")({
  head: () => ({
    meta: [
      { title: "Monte seu setup por orçamento · Deskly" },
      { name: "description", content: "Listas de compras prontas para home office por faixa de orçamento — produtos reais de Amazon BR, Mercado Livre, Kabum e Magalu." },
      { property: "og:title", content: "Monte seu setup por orçamento" },
      { property: "og:description", content: "Essencial, Equilibrado ou Premium — escolha sua faixa e veja a lista pronta." },
    ],
  }),
  component: Orcamento,
});

type Item = { cat: string; name: string; price: number; store: string; url: string };
type Tier = { id: string; nome: string; valor: number; desc: string; destaque?: boolean; items: Item[] };

const tiers: Tier[] = [
  {
    id: "essencial",
    nome: "Essencial",
    valor: 1500,
    desc: "Pra começar bem sem quebrar a poupança",
    items: [
      { cat: "Monitor", name: "AOC 24\" Full HD", price: 699, store: "Kabum", url: "#" },
      { cat: "Cadeira", name: "Cadeira ergonômica básica", price: 450, store: "Magalu", url: "#" },
      { cat: "Suporte", name: "Suporte de notebook ajustável", price: 89, store: "Mercado Livre", url: "#" },
      { cat: "Periféricos", name: "Logitech K380 + M170", price: 180, store: "Amazon BR", url: "#" },
      { cat: "Iluminação", name: "Luminária LED de mesa", price: 82, store: "Mercado Livre", url: "#" },
    ],
  },
  {
    id: "equilibrado",
    nome: "Equilibrado",
    valor: 3000,
    desc: "Sweet spot pra quem trabalha 8h/dia",
    destaque: true,
    items: [
      { cat: "Monitor", name: "LG 27\" QHD IPS 27QN600", price: 1299, store: "Kabum", url: "#" },
      { cat: "Cadeira", name: "DT3 Sports Mizano", price: 980, store: "Pichau", url: "#" },
      { cat: "Suporte", name: "Suporte articulado VESA ELG", price: 220, store: "Amazon BR", url: "#" },
      { cat: "Periféricos", name: "Redragon Kumara + Logitech G203", price: 350, store: "Mercado Livre", url: "#" },
      { cat: "Iluminação", name: "Lâmpada Yeelight + bias light", price: 150, store: "Amazon BR", url: "#" },
    ],
  },
  {
    id: "premium",
    nome: "Premium",
    valor: 7500,
    desc: "Pra quem leva o home office a sério",
    items: [
      { cat: "Monitor", name: "LG Ultrawide 34WP65C 34\" curvo", price: 2799, store: "Kabum", url: "#" },
      { cat: "Cadeira", name: "Flexform Air ou Herman Miller usada", price: 3200, store: "Mercado Livre", url: "#" },
      { cat: "Mesa", name: "Mesa com elevação elétrica", price: 1800, store: "Magalu", url: "#" },
      { cat: "Periféricos", name: "Keychron K2 Pro + MX Master 3S", price: 850, store: "Amazon BR", url: "#" },
      { cat: "Iluminação", name: "Philips Hue Play + Smart Bulbs", price: 600, store: "Amazon BR", url: "#" },
    ],
  },
];

function Orcamento() {
  const [active, setActive] = useState<string>("equilibrado");
  const tier = tiers.find((t) => t.id === active)!;
  const total = tier.items.reduce((s, i) => s + i.price, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-coral/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-coral-foreground">
            <Wallet className="h-3 w-3" /> Setup por orçamento
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Diga seu bolso. <span className="text-coral">A gente monta.</span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Listas prontas com produtos disponíveis no Brasil. Clique pra ver detalhes e abrir na loja.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {tiers.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`rounded-3xl border p-5 text-left transition-smooth ${
                active === t.id
                  ? "border-foreground bg-foreground text-background shadow-elegant"
                  : "border-border bg-card hover:-translate-y-0.5 hover:shadow-elegant"
              } ${t.destaque ? "ring-2 ring-accent" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="font-display text-xl font-bold">{t.nome}</div>
                {t.destaque && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">Top</span>
                )}
              </div>
              <div className="mt-1 font-display text-2xl font-bold">R$ {t.valor.toLocaleString("pt-BR")}</div>
              <div className={`mt-1 text-sm ${active === t.id ? "text-background/80" : "text-muted-foreground"}`}>
                {t.desc}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-2xl font-bold">Lista — {tier.nome}</h2>
              <div className="text-sm text-muted-foreground">{tier.items.length} itens</div>
            </div>
            <ul className="mt-6 space-y-3">
              {tier.items.map((it) => (
                <li key={it.name} className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4">
                  <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{it.cat}</div>
                    <div className="truncate text-sm font-semibold">{it.name}</div>
                    <div className="text-xs text-muted-foreground">{it.store}</div>
                  </div>
                  <div className="font-display text-base font-bold">R$ {it.price.toLocaleString("pt-BR")}</div>
                  <Button asChild size="sm" variant="outline" className="gap-1">
                    <a href={it.url} target="_blank" rel="noopener noreferrer">
                      Loja <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center justify-between rounded-2xl bg-gradient-mesh p-4">
              <div className="text-sm font-semibold">Total estimado</div>
              <div className="font-display text-2xl font-bold">R$ {total.toLocaleString("pt-BR")}</div>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-elegant">
              <Sparkles className="h-6 w-6 text-accent" />
              <h3 className="mt-3 font-display text-xl font-bold">Quer ajuste personalizado?</h3>
              <p className="mt-2 text-sm text-primary-foreground/80">
                Manda foto do seu espaço e a gente otimiza essa lista pro seu apê e seu trabalho.
              </p>
              <Link to="/diagnostico" className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-smooth hover:scale-105">
                Diagnóstico grátis
              </Link>
            </div>
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lojas parceiras</div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                {["Amazon BR", "Mercado Livre", "Kabum", "Magalu", "Pichau"].map((s) => (
                  <span key={s} className="rounded-full bg-secondary px-3 py-1">{s}</span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
