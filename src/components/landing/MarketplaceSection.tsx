import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, Search, Plus, Tag, ImageOff, Wallet, Recycle } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchActiveListings, formatBrl, type MarketplaceListing } from "@/lib/marketplace";

// Seção do meio da home — destaque pro marketplace C2C (compra/venda).
// Banner horizontal, não-Hero, posicionado entre Galeria e Orçamento.
export function MarketplaceSection() {
  const [previews, setPreviews] = useState<MarketplaceListing[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchActiveListings()
      .then((rows) => setPreviews(rows.slice(0, 3)))
      .catch(() => setPreviews([]))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <section className="border-y border-border bg-gradient-to-br from-secondary/40 via-background to-secondary/30 py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:items-center">
          {/* Lado esquerdo: copy */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <ShoppingBag className="h-3 w-3" /> Marketplace · Novidade
            </div>
            <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
              Compre e venda{" "}
              <span className="bg-gradient-warm bg-clip-text text-transparent">home office</span>{" "}
              entre pessoas
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Monitor, cadeira, teclado, mesa — direto com quem usou. Sem taxa pra
              anunciar, negociação justa, comunidade brasileira.
            </p>

            {/* Pills de benefícios */}
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold">
                <Wallet className="h-3 w-3 text-primary" /> 0% taxa anunciar
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold">
                <Recycle className="h-3 w-3 text-accent" /> Reutiliza, gasta menos
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold">
                <ShoppingBag className="h-3 w-3 text-foreground" /> Propostas + contraoferta
              </span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 gap-2 bg-gradient-hero px-6 text-sm shadow-elegant transition-smooth hover:shadow-glow">
                <Link to="/marketplace">
                  <Search className="h-4 w-4" />
                  Explorar anúncios
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 gap-2 border-2 px-6 text-sm">
                <Link to="/marketplace/anunciar">
                  <Plus className="h-4 w-4" /> Anunciar grátis
                </Link>
              </Button>
            </div>
          </div>

          {/* Lado direito: 3 cards reais (ou empty state) */}
          <div className="relative">
            <div className="grid grid-cols-3 gap-3">
              {loaded && previews.length === 0 ? (
                <div className="col-span-3 rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center">
                  <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-3 font-display text-base font-bold">Seja o primeiro a anunciar</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Mesa, monitor ou cadeira parada? Coloque a venda.</p>
                  <Button asChild size="sm" className="mt-4 gap-2 bg-gradient-hero">
                    <Link to="/marketplace/anunciar"><Plus className="h-3 w-3" /> Anunciar agora</Link>
                  </Button>
                </div>
              ) : (
                (loaded ? previews : Array.from({ length: 3 })).map((l, i) => (
                  <PreviewCard key={l ? (l as MarketplaceListing).id : i} l={l as MarketplaceListing | undefined} />
                ))
              )}
            </div>
            {/* blobs decorativos */}
            <div className="absolute -right-6 -top-6 -z-10 h-32 w-32 rounded-full bg-accent/20 blur-3xl" />
            <div className="absolute -bottom-6 -left-6 -z-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
          </div>
        </div>
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
      </div>
    </Link>
  );
}
