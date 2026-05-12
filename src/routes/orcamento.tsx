import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { Wallet, Check, Sparkles, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { trackAffiliateClick, affiliateHref, normalizeStore } from "@/lib/affiliate";

export const Route = createFileRoute("/orcamento")({
  head: () => ({
    meta: [
      { title: "Monte seu setup por orçamento · HomeOfficeLife" },
      { name: "description", content: "Listas de compras prontas para home office por faixa de orçamento — produtos reais de Amazon BR, Mercado Livre, Kabum e Magalu." },
      { property: "og:title", content: "Monte seu setup por orçamento" },
      { property: "og:description", content: "Essencial, Equilibrado ou Premium — escolha sua faixa e veja a lista pronta." },
    ],
  }),
  component: Orcamento,
});

type Item = {
  id: string;
  cat: string;
  name: string;
  price: number;
  store: string;
  storeRaw: string;
  url: string;
};
type Tier = { id: string; nome: string; valor: number; desc: string; slug: string; destaque?: boolean };

const STORE_LABEL: Record<string, string> = {
  amazon_br: "Amazon BR",
  mercado_livre: "Mercado Livre",
  kabum: "Kabum",
  magalu: "Magalu",
  pichau: "Pichau",
  outro: "Outro",
};

const TIERS: Tier[] = [
  {
    id: "essencial",
    nome: "Essencial",
    valor: 1500,
    desc: "Pra começar bem sem quebrar a poupança",
    slug: "ape-32m2",
  },
  {
    id: "equilibrado",
    nome: "Equilibrado",
    valor: 3800,
    desc: "Sweet spot pra quem trabalha 8h/dia",
    destaque: true,
    slug: "estudante-pequeno-foco-39",
  },
  {
    id: "premium",
    nome: "Premium",
    valor: 12000,
    desc: "Pra quem leva o home office a sério",
    slug: "cyber-cave",
  },
];

function Orcamento() {
  const [active, setActive] = useState<string>("equilibrado");
  const [itemsByTier, setItemsByTier] = useState<Record<string, Item[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const results = await Promise.all(
        TIERS.map(async (t) => {
          const { data: setup } = await supabase.from("setups").select("id").eq("slug", t.slug).maybeSingle();
          if (!setup) return [t.id, [] as Item[]] as const;
          const { data: prods } = await supabase
            .from("setup_products")
            .select("id, category, name, price_brl, store, affiliate_url")
            .eq("setup_id", setup.id)
            .order("position", { ascending: true });
          const items: Item[] = (prods || []).map((p: any) => ({
            id: p.id,
            cat: p.category,
            name: p.name,
            price: p.price_brl,
            store: STORE_LABEL[p.store] ?? p.store,
            storeRaw: p.store,
            url: p.affiliate_url || "#",
          }));
          return [t.id, items] as const;
        }),
      );
      if (!mounted) return;
      setItemsByTier(Object.fromEntries(results));
      setLoading(false);
    })().catch(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const tier = TIERS.find((t) => t.id === active)!;
  const items = itemsByTier[tier.id] || [];
  const total = items.reduce((s, i) => s + i.price, 0);

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
            Listas baseadas em setups reais postados na comunidade. Clique pra abrir cada produto na loja.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {TIERS.map((t) => (
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
              <div className="mt-1 font-display text-2xl font-bold">~ R$ {t.valor.toLocaleString("pt-BR")}</div>
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
              <div className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? "item" : "itens"}</div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : items.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
                Sem itens nesta faixa ainda. Volte em breve.
              </p>
            ) : (
              <>
                <ul className="mt-6 space-y-3">
                  {items.map((it, idx) => (
                    <li key={`${it.name}-${idx}`} className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4">
                      <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{it.cat}</div>
                        <div className="truncate text-sm font-semibold">{it.name}</div>
                        <div className="text-xs text-muted-foreground">{it.store}</div>
                      </div>
                      <div className="font-display text-base font-bold">R$ {it.price.toLocaleString("pt-BR")}</div>
                      <Button asChild size="sm" variant="outline" className="gap-1">
                        <a
                          href={affiliateHref(it.id)}
                          target="_blank"
                          rel="sponsored noopener noreferrer"
                          onClick={() =>
                            trackAffiliateClick({
                              productId: it.id,
                              store: normalizeStore(it.storeRaw),
                            })
                          }
                        >
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
              </>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-elegant">
              <Sparkles className="h-6 w-6 text-accent" />
              <h3 className="mt-3 font-display text-xl font-bold">Quer ajuste personalizado?</h3>
              <p className="mt-2 text-sm text-primary-foreground/80">
                Manda foto do seu espaço e a IA otimiza essa lista pro seu apê e seu trabalho.
              </p>
              <Link to="/diagnostico" className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-smooth hover:scale-105">
                Diagnóstico grátis
              </Link>
            </div>
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lojas representadas</div>
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
