import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, Search, Plus, Tag, ImageOff, Wallet, Recycle, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchActiveListings, formatBrl, type MarketplaceListing } from "@/lib/marketplace";

// Diversifica os anúncios em destaque na home: pega no máximo 2 por categoria
// pra evitar 6 MacBooks idênticos (era o caso antes). Mantém ordem por mais
// recente dentro de cada categoria.
function diversify(listings: MarketplaceListing[], maxPerCategory = 2, total = 6): MarketplaceListing[] {
  const seen = new Map<string, number>();
  const out: MarketplaceListing[] = [];
  for (const l of listings) {
    const key = l.category?.id ?? "uncategorized";
    const count = seen.get(key) || 0;
    if (count >= maxPerCategory) continue;
    out.push(l);
    seen.set(key, count + 1);
    if (out.length >= total) break;
  }
  // Se não bateu o total (poucas categorias), preenche com o resto
  if (out.length < total) {
    const ids = new Set(out.map((l) => l.id));
    for (const l of listings) {
      if (ids.has(l.id)) continue;
      out.push(l);
      if (out.length >= total) break;
    }
  }
  return out;
}

export function MarketplaceSection() {
  const [previews, setPreviews] = useState<MarketplaceListing[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchActiveListings()
      .then((rows) => setPreviews(diversify(rows, 2, 6)))
      .catch(() => setPreviews([]))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <section className="border-y border-border bg-gradient-to-br from-secondary/40 via-background to-secondary/30 py-14 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header — full width, mais compacto */}
        <div className="mb-8 flex flex-col items-end justify-between gap-4 md:flex-row">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <ShoppingBag className="h-3 w-3" /> Marketplace · Novidade
            </div>
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              Compre e venda{" "}
              <span className="bg-gradient-warm bg-clip-text text-transparent">home office</span>{" "}
              entre pessoas
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
              Monitor, cadeira, teclado, mesa — direto com quem usou.
              Sem taxa pra anunciar.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold">
                <Wallet className="h-3 w-3 text-primary" /> 0% taxa
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold">
                <Recycle className="h-3 w-3 text-accent" /> Reutiliza
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold">
                <ShoppingBag className="h-3 w-3 text-foreground" /> Propostas
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="h-10 gap-2 border-2 px-4 text-sm">
              <Link to="/marketplace/anunciar">
                <Plus className="h-4 w-4" /> Anunciar grátis
              </Link>
            </Button>
            <Button asChild className="h-10 gap-2 bg-gradient-hero px-4 text-sm shadow-elegant">
              <Link to="/marketplace">
                <Search className="h-4 w-4" /> Explorar
              </Link>
            </Button>
          </div>
        </div>

        {/* Grid de 6 cards (2 linhas × 3 cols no desktop, 1×6 scroll horizontal no mobile) */}
        {loaded && previews.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 font-display text-base font-bold">Seja o primeiro a anunciar</h3>
            <p className="mt-1 text-xs text-muted-foreground">Mesa, monitor ou cadeira parada? Coloque a venda.</p>
            <Button asChild size="sm" className="mt-4 gap-2 bg-gradient-hero">
              <Link to="/marketplace/anunciar"><Plus className="h-3 w-3" /> Anunciar agora</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop: grid 2 linhas × 3 cols */}
            <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
              {(loaded ? previews : Array.from({ length: 6 })).map((l, i) => (
                <PreviewCard key={l ? (l as MarketplaceListing).id : i} l={l as MarketplaceListing | undefined} />
              ))}
            </div>
            {/* Mobile: scroll horizontal */}
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-3 sm:hidden">
              {(loaded ? previews : Array.from({ length: 6 })).map((l, i) => (
                <div key={l ? (l as MarketplaceListing).id : i} className="w-[70%] flex-shrink-0">
                  <PreviewCard l={l as MarketplaceListing | undefined} />
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-smooth hover:gap-2"
              >
                Ver todos os anúncios <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function PreviewCard({ l }: { l: MarketplaceListing | undefined }) {
  if (!l) return <div className="aspect-[3/4] animate-pulse rounded-2xl bg-card shadow-soft" />;
  const cover = l.images?.[0];
  return (
    <Link
      to="/marketplace/$id"
      params={{ id: l.id }}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {cover ? (
          <img src={cover} alt={l.title} className="h-full w-full object-cover transition-smooth group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
        {l.condition?.name && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/95 px-2 py-0.5 text-[10px] font-semibold backdrop-blur">
            <Tag className="h-2.5 w-2.5" /> {l.condition.name}
          </span>
        )}
        <div className="absolute bottom-2 right-2 rounded-full bg-foreground/90 px-2.5 py-0.5 text-xs font-bold text-background backdrop-blur">
          {formatBrl(Number(l.price))}
        </div>
      </div>
      <div className="p-2.5">
        <div className="line-clamp-2 text-xs font-semibold leading-tight">{l.title}</div>
        {l.category?.name && (
          <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            {l.category.name}
          </div>
        )}
      </div>
    </Link>
  );
}
