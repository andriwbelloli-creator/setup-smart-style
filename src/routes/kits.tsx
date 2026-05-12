import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { supabase } from "@/integrations/supabase/client";
import { trackAffiliateClick, affiliateHref, normalizeStore } from "@/lib/affiliate";
import { Button } from "@/components/ui/button";
import { KitCardSkeletonGrid } from "@/components/setup/KitCardSkeleton";
import {
  Sparkles,
  ShoppingBag,
  Check,
  GraduationCap,
  Briefcase,
  Crown,
} from "lucide-react";

// =============================================================
// Catálogo curado: kits por persona/orçamento. Cada kit lista
// nomes EXATOS de produtos que existem no banco — a query
// resolve preço/loja/URL em runtime, então se os preços mudam
// a página atualiza sozinha.
// =============================================================
type Kit = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof GraduationCap;
  budget: number;
  accent: string;
  itemNames: string[]; // ordem de display
};

const KITS: Kit[] = [
  {
    slug: "estudante",
    title: "Kit Estudante",
    subtitle: "Quem está começando",
    description: "Setup completo, ergonômico e bonito sem quebrar a poupança. Foco em produtividade e postura correta.",
    icon: GraduationCap,
    budget: 1500,
    accent: "border-primary/40 bg-primary/5",
    itemNames: [
      "AOC 24B1H 24\" Full HD",
      "BR Office Bahamas",
      "Mesa pinus 120cm",
      "Logitech K480 + Mouse",
      "Luminária mesa LED articulada",
    ],
  },
  {
    slug: "dev-remoto",
    title: "Kit Dev Remoto",
    subtitle: "Quem trabalha 8h+/dia",
    description: "Sweet spot: ergonomia profissional, monitor decente, periféricos confortáveis. Pra quem o desktop é o escritório.",
    icon: Briefcase,
    budget: 5000,
    accent: "border-accent/60 bg-accent/5 ring-2 ring-accent/30",
    itemNames: [
      "Dell P2422H 24\" Full HD",
      "DT3 Office Nimitz",
      "Mesa elétrica FlexiSpot E5",
      "Logitech MX Master 3S",
      "Keychron K2 V2 mecânico",
      "BenQ ScreenBar Halo",
      "Suporte articulado VESA ELG",
    ],
  },
  {
    slug: "cyber-cave",
    title: "Kit Cyber Cave",
    subtitle: "Pra quem leva a sério",
    description: "Sem comprometer. Ultrawide curvo, cadeira premium, mesa elétrica, iluminação cinematográfica, áudio de estúdio.",
    icon: Crown,
    budget: 15000,
    accent: "border-coral/50 bg-coral/5",
    itemNames: [
      "LG Ultrawide 34WP65C",
      "Mesa Elétrica FlexiSpot E5",
      "DT3 Office Nimitz",
      "Keychron K2 V2 mecânico",
      "Logitech MX Master 3S",
      "BenQ ScreenBar Halo",
      "Elgato Key Light Air",
      "Shure SM7B",
      "Logitech Brio 4K",
      "Govee LED Strip 5m",
    ],
  },
];

type ProductRow = {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  price_brl: number;
  store: string;
  affiliate_url: string | null;
};

const STORE_LABEL: Record<string, string> = {
  amazon_br: "Amazon BR",
  mercado_livre: "Mercado Livre",
  kabum: "Kabum",
  magalu: "Magalu",
  pichau: "Pichau",
  outro: "Outro",
};

export const Route = createFileRoute("/kits")({
  head: () => ({
    meta: [
      { title: "Kits Curados · HomeOffice.life" },
      { name: "description", content: "3 kits prontos pra montar seu home office — Estudante, Dev Remoto e Cyber Cave. Produtos curados pela equipe do HomeOffice.life, com preços reais." },
      { property: "og:title", content: "Kits Curados HomeOffice.life — monte seu setup em 1 clique" },
      { property: "og:description", content: "Setup completo curado pra estudante, dev remoto ou setup pro. Lista pronta com preço, loja e link." },
    ],
  }),
  component: Kits,
});

function Kits() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Pega todos os nomes únicos das listas de kits e faz 1 query só
  const allNames = useMemo(() => {
    const set = new Set<string>();
    for (const k of KITS) for (const n of k.itemNames) set.add(n);
    return [...set];
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("setup_products")
        .select("id, name, category, brand, price_brl, store, affiliate_url")
        .in("name", allNames);
      if (cancelled) return;
      // Dedupe por nome (mantém o primeiro)
      const seen = new Set<string>();
      const unique: ProductRow[] = [];
      for (const r of (data || []) as ProductRow[]) {
        if (seen.has(r.name)) continue;
        seen.add(r.name);
        unique.push(r);
      }
      setProducts(unique);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [allNames]);

  const productsByName = useMemo(() => {
    const map: Record<string, ProductRow> = {};
    for (const p of products) map[p.name] = p;
    return map;
  }, [products]);

  const buyAll = (kit: Kit) => {
    // Abre cada link em nova aba sequencialmente (com pequeno delay
    // pra não disparar popup blocker no Chrome — mas tem que ser
    // ação síncrona do clique, então abrimos todos no mesmo tick)
    const links = kit.itemNames
      .map((n) => productsByName[n])
      .filter(Boolean)
      .map((p) => ({ id: p.id, store: p.store }));
    for (const item of links) {
      // tracking + open
      trackAffiliateClick({ productId: item.id, store: normalizeStore(item.store) });
      window.open(affiliateHref(item.id), "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-coral/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-coral-foreground">
            <ShoppingBag className="h-3 w-3" /> Kits Curados
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Setup pronto.<span className="text-coral"> 1 clique e tá no carrinho.</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Curados pela equipe HomeOffice.life. 3 perfis, produtos reais, preço de hoje.
            Clique em "Comprar todos" e abre cada produto na loja certa numa aba nova.
          </p>
        </div>

        {loading ? (
          <div className="mt-12">
            <KitCardSkeletonGrid count={3} />
          </div>
        ) : (
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {KITS.map((kit) => {
              const items = kit.itemNames.map((n) => productsByName[n]).filter(Boolean) as ProductRow[];
              const actualTotal = items.reduce((s, p) => s + p.price_brl, 0);
              const Icon = kit.icon;
              return (
                <div
                  key={kit.slug}
                  className={`flex flex-col rounded-3xl border-2 bg-card p-6 shadow-soft transition-smooth hover:shadow-elegant ${kit.accent}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground shadow-elegant">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold">{kit.title}</h2>
                      <div className="text-xs text-muted-foreground">{kit.subtitle}</div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{kit.description}</p>

                  <div className="mt-4 flex items-baseline gap-2 rounded-2xl bg-secondary/50 p-4">
                    <span className="font-display text-3xl font-bold">
                      R$ {actualTotal.toLocaleString("pt-BR")}
                    </span>
                    {actualTotal !== kit.budget && (
                      <span className="text-xs text-muted-foreground">
                        (alvo ~R$ {kit.budget.toLocaleString("pt-BR")})
                      </span>
                    )}
                  </div>

                  <ul className="mt-5 flex-1 space-y-2">
                    {items.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {p.category} · {STORE_LABEL[p.store] || p.store}
                          </div>
                          <div className="mt-0.5 truncate text-sm font-semibold">{p.name}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-display text-sm font-bold">
                            R$ {p.price_brl.toLocaleString("pt-BR")}
                          </span>
                          <a
                            href={affiliateHref(p.id)}
                            target="_blank"
                            rel="sponsored noopener noreferrer"
                            onClick={() => trackAffiliateClick({ productId: p.id, store: normalizeStore(p.store) })}
                            className="text-[10px] text-primary hover:underline"
                          >
                            ver →
                          </a>
                        </div>
                      </li>
                    ))}
                    {items.length === 0 && (
                      <li className="rounded-xl border border-dashed border-border bg-background p-4 text-center text-xs text-muted-foreground">
                        Produtos sendo atualizados — volta em breve.
                      </li>
                    )}
                  </ul>

                  <Button
                    onClick={() => buyAll(kit)}
                    disabled={items.length === 0}
                    className="mt-5 w-full gap-2 bg-gradient-hero shadow-elegant"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Comprar todos ({items.length} itens)
                  </Button>
                  <p className="mt-2 text-center text-[10px] text-muted-foreground">
                    Abre {items.length} abas nas lojas. Ative pop-ups se o navegador bloquear.
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          <Feature icon={Check} title="Curadoria editorial">
            Cada produto foi escolhido a mão pela equipe — não é só algoritmo. Considera ergonomia, durabilidade e custo-benefício real BR.
          </Feature>
          <Feature icon={Check} title="Preço de hoje">
            Pegamos o preço atual da loja toda vez que você abre a página. Sem cilada de preço desatualizado.
          </Feature>
          <Feature icon={Check} title="Sem cilada de afiliado">
            O preço pra você é o mesmo da loja. Quando você compra pelo nosso link, a loja repassa uma fatia pra HomeOffice.life e nos ajuda a manter a plataforma gratuita.
          </Feature>
        </div>

        <div className="mt-16 rounded-3xl bg-gradient-mesh p-8 text-center md:p-12">
          <Sparkles className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-3 font-display text-2xl font-bold">Quer um kit personalizado?</h2>
          <p className="mt-2 text-muted-foreground">
            Manda foto do seu espaço e a IA monta uma lista otimizada pro seu apê e seu trabalho — grátis.
          </p>
          <Link to="/diagnostico" className="mt-5 inline-flex rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background shadow-elegant transition-smooth hover:opacity-90">
            Diagnóstico IA grátis →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Feature({ icon: Icon, title, children }: { icon: typeof Check; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <Icon className="h-5 w-5 text-primary" />
      <h3 className="mt-3 font-display font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
