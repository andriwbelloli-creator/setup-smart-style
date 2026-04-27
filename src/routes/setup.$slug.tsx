import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { findSetup, type Product } from "@/data/setups";
import { Heart, Bookmark, Share2, MapPin, Star, ExternalLink, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLikes, useSaves } from "@/hooks/use-saved";
import { toast } from "sonner";

export const Route = createFileRoute("/setup/$slug")({
  loader: ({ params }) => {
    const setup = findSetup(params.slug);
    if (!setup) throw notFound();
    return { setup };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.setup.title} — ${loaderData.setup.author} · Deskly` },
          { name: "description", content: loaderData.setup.description },
          { property: "og:title", content: `${loaderData.setup.title} — Setup brasileiro` },
          { property: "og:description", content: loaderData.setup.description },
          { property: "og:image", content: loaderData.setup.image },
          { property: "twitter:image", content: loaderData.setup.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-5xl font-bold">Setup não encontrado</h1>
        <Link to="/galeria" className="mt-6 inline-block text-primary underline">Voltar à galeria</Link>
      </div>
    </div>
  ),
  component: SetupDetail,
});

function SetupDetail() {
  const { setup } = Route.useLoaderData();
  const [active, setActive] = useState<Product | null>(null);
  const total = setup.products.reduce((sum, p) => sum + p.price, 0);
  const likes = useLikes();
  const saves = useSaves();
  const liked = likes.has(setup.id);
  const saved = saves.has(setup.id);

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: setup.title, url });
      else { await navigator.clipboard.writeText(url); toast.success("Link copiado!"); }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10 md:px-6 md:py-14">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {setup.styles.map((t) => (
              <span key={t} className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">{t}</span>
            ))}
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">{setup.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{setup.author}</span>
            <span>· {setup.authorRole}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{setup.city}</span>
            <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-accent text-accent" />Nota IA {setup.score}</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Image with hotspots */}
          <div>
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-elegant">
              <div className="relative aspect-[16/11]">
                <img src={setup.image} alt={setup.title} className="h-full w-full object-cover" />
                {setup.products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActive(p)}
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                    className="group absolute -translate-x-1/2 -translate-y-1/2"
                    aria-label={`Ver produto ${p.name}`}
                  >
                    <span className="absolute inset-0 -m-1 animate-ping rounded-full bg-accent/60" />
                    <span className={`relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-accent text-accent-foreground shadow-elegant transition-smooth group-hover:scale-110 ${active?.id === p.id ? "ring-4 ring-accent/40" : ""}`}>
                      <Plus className="h-4 w-4" />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-6 text-base leading-relaxed text-muted-foreground">{setup.description}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => likes.toggle(setup.id)} className={`gap-2 shadow-elegant ${liked ? "bg-coral text-coral-foreground hover:opacity-90" : "bg-gradient-hero"}`}>
                <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} /> {liked ? "Curtido" : "Curtir"} ({setup.likes + (liked ? 1 : 0)})
              </Button>
              <Button onClick={() => saves.toggle(setup.id)} variant="outline" className="gap-2">
                <Bookmark className={`h-4 w-4 ${saved ? "fill-current text-primary" : ""}`} /> {saved ? "Salvo" : "Salvar"}
              </Button>
              <Button onClick={share} variant="outline" className="gap-2"><Share2 className="h-4 w-4" /> Compartilhar</Button>
              <Button asChild variant="secondary" className="gap-2 bg-coral text-coral-foreground hover:opacity-90">
                <Link to="/orcamento"><Sparkles className="h-4 w-4" /> Quero montar parecido</Link>
              </Button>
            </div>
          </div>

          {/* Products sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-xl font-bold">Lista de equipamentos</h2>
                <span className="text-xs text-muted-foreground">{setup.products.length} itens</span>
              </div>
              <div className="mt-2 text-3xl font-display font-bold">
                R$ {total.toLocaleString("pt-BR")}
              </div>
              <div className="text-xs text-muted-foreground">Soma dos produtos marcados</div>

              <div className="mt-5 space-y-3">
                {setup.products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActive(p)}
                    className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-smooth ${
                      active?.id === p.id ? "border-accent bg-accent/5" : "border-border bg-background hover:border-foreground/30"
                    }`}
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-secondary text-xs font-bold">
                      {p.category[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{p.category}</div>
                      <div className="truncate text-sm font-semibold">{p.name}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-bold text-foreground">R$ {p.price.toLocaleString("pt-BR")}</span>
                        <span>· {p.store}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <Button className="mt-5 w-full gap-2 bg-foreground text-background hover:opacity-90">
                <ExternalLink className="h-4 w-4" /> Ver todos na minha wishlist
              </Button>
            </div>
          </aside>
        </div>

        {/* Active product detail */}
        {active && (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card shadow-elegant md:left-auto md:right-6 md:bottom-6 md:max-w-md md:rounded-3xl md:border">
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{active.category} · {active.brand}</div>
                  <h3 className="mt-1 font-display text-lg font-bold">{active.name}</h3>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <span className="font-bold">R$ {active.price.toLocaleString("pt-BR")}</span>
                    <span className="text-muted-foreground">· {active.store}</span>
                    <span className="flex items-center gap-0.5 text-accent">
                      <Star className="h-3.5 w-3.5 fill-current" /> {active.rating}
                    </span>
                  </div>
                </div>
                <button onClick={() => setActive(null)} className="text-muted-foreground hover:text-foreground" aria-label="Fechar">✕</button>
              </div>

              {active.cheaperAlt && (
                <div className="mt-3 rounded-2xl border-l-4 border-coral bg-coral/10 p-3 text-sm">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-coral-foreground/80">Alternativa mais barata</div>
                  <div className="mt-0.5 font-semibold">{active.cheaperAlt.name}</div>
                  <div className="text-xs text-muted-foreground">R$ {active.cheaperAlt.price.toLocaleString("pt-BR")} · {active.cheaperAlt.store}</div>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Button asChild className="flex-1 gap-2 bg-gradient-hero">
                  <a href={active.affiliateUrl} target="_blank" rel="noopener noreferrer">
                    Comprar <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" className="gap-2"><Bookmark className="h-4 w-4" /> Wishlist</Button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
