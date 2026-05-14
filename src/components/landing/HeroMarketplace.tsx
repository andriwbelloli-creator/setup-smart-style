import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, Search, Plus, ShieldCheck, ArrowRight, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchActiveListings, formatBrl, type MarketplaceListing } from "@/lib/marketplace";

// Hero focado no Marketplace C2C — produto principal da plataforma.
// Mostra 3-4 anúncios reais como prova social. Cai num placeholder se
// o banco estiver vazio.
export function HeroMarketplace() {
  const [previews, setPreviews] = useState<MarketplaceListing[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchActiveListings()
      .then((rows) => setPreviews(rows.slice(0, 4)))
      .catch(() => setPreviews([]))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-mesh">
      <div className="container mx-auto grid gap-12 px-4 py-20 md:px-6 md:py-28 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-32">
        {/* Lado esquerdo: messaging */}
        <div className="flex flex-col justify-center animate-fade-up">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <ShoppingBag className="h-3.5 w-3.5 text-accent" />
            Loja de equipamentos usados · Brasil
          </div>

          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Compre e venda{" "}
            <span className="bg-gradient-warm bg-clip-text text-transparent">home office</span>{" "}
            entre pessoas.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Monitor, cadeira, teclado, mesa — direto com quem usou. Sem taxa pra anunciar,
            negociação justa, comunidade brasileira que entende de setup.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-14 gap-2 bg-gradient-hero px-8 text-base shadow-elegant transition-smooth hover:shadow-glow">
              <Link to="/marketplace">
                <Search className="h-5 w-5" />
                Explorar anúncios
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 gap-2 border-2 px-8 text-base">
              <Link to="/marketplace/anunciar">
                <Plus className="h-4 w-4" /> Anunciar grátis
              </Link>
            </Button>
          </div>

          {/* Social proof / props */}
          <div className="mt-10 grid grid-cols-3 gap-6 text-sm text-muted-foreground md:max-w-md">
            <div>
              <div className="font-display text-2xl font-bold text-foreground">0%</div>
              <div className="text-xs">Taxa pra anunciar</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-foreground">100%</div>
              <div className="text-xs">Comunidade BR</div>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <div className="text-xs leading-tight">Propostas com<br />contraoferta</div>
            </div>
          </div>
        </div>

        {/* Lado direito: preview de anúncios */}
        <div className="relative">
          <div className="relative grid grid-cols-2 gap-4">
            {loaded && previews.length === 0 ? (
              <EmptyState />
            ) : (
              (loaded ? previews : Array.from({ length: 4 })).map((l, i) => (
                <PreviewCard key={l ? (l as MarketplaceListing).id : i} l={l as MarketplaceListing | undefined} delay={i * 80} />
              ))
            )}
          </div>
          {/* Decorative blobs */}
          <div className="absolute -right-8 -top-8 -z-10 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 -z-10 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />

          {previews.length > 0 && (
            <Link
              to="/marketplace"
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-smooth hover:gap-2"
            >
              Ver todos os {previews.length}+ anúncios <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function PreviewCard({ l, delay }: { l: MarketplaceListing | undefined; delay: number }) {
  if (!l) {
    return <div className="aspect-[4/5] animate-pulse rounded-2xl bg-card shadow-soft" style={{ animationDelay: `${delay}ms` }} />;
  }
  const cover = l.images?.[0];
  return (
    <Link
      to="/marketplace/$id"
      params={{ id: l.id }}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {cover ? (
          <img src={cover} alt={l.title} className="h-full w-full object-cover transition-smooth group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ShoppingBag className="h-8 w-8" />
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
      <div className="p-3">
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

function EmptyState() {
  return (
    <div className="col-span-2 rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center shadow-soft">
      <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
      <h3 className="mt-3 font-display text-base font-bold">Seja o primeiro a anunciar</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Tem cadeira, monitor ou teclado parado? Comece o marketplace.
      </p>
      <Button asChild size="sm" className="mt-4 gap-2 bg-gradient-hero">
        <Link to="/marketplace/anunciar">
          <Plus className="h-3 w-3" /> Anunciar grátis
        </Link>
      </Button>
    </div>
  );
}
