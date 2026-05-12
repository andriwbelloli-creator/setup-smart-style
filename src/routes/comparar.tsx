import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { useSaves } from "@/hooks/use-saved";
import { fetchPublishedSetups } from "@/lib/setups-db";
import { SETUPS, type Setup, type Product } from "@/data/setups";
import {
  Crown,
  Sparkles,
  Loader2,
  ArrowLeftRight,
  Star,
  Check,
  X,
  TrendingDown,
  TrendingUp,
  MapPin,
} from "lucide-react";

const searchSchema = z.object({
  setups: z.string().optional(),
});

export const Route = createFileRoute("/comparar")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Comparar setups · Deskly" },
      { name: "description", content: "Compare dois setups lado a lado — nota IA, orçamento, produtos. Recurso Premium do Deskly." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Comparar,
});

function Comparar() {
  const { user, loading: authLoading } = useAuth();
  const subscription = useSubscription();
  const navigate = useNavigate();
  const search = useSearch({ from: "/comparar" });
  const saves = useSaves();
  const [allSetups, setAllSetups] = useState<Setup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    fetchPublishedSetups()
      .then((rows) => setAllSetups([...rows, ...SETUPS]))
      .catch(() => setAllSetups([...SETUPS]))
      .finally(() => setLoading(false));
  }, []);

  const selectedSlugs = useMemo(
    () => (search.setups ?? "").split(",").filter(Boolean),
    [search.setups],
  );

  const selected: Setup[] = useMemo(
    () =>
      selectedSlugs
        .map((slug) => allSetups.find((s) => s.slug === slug))
        .filter(Boolean) as Setup[],
    [selectedSlugs, allSetups],
  );

  const setSelection = (slugs: string[]) => {
    navigate({ to: "/comparar", search: { setups: slugs.length ? slugs.join(",") : undefined } });
  };

  const toggleSelect = (slug: string) => {
    if (selectedSlugs.includes(slug)) {
      setSelection(selectedSlugs.filter((s) => s !== slug));
    } else if (selectedSlugs.length < 2) {
      setSelection([...selectedSlugs, slug]);
    } else {
      // Substitui o primeiro
      setSelection([selectedSlugs[1], slug]);
    }
  };

  if (authLoading || !user || subscription.loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-32 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Premium gate
  if (!subscription.canUse("compare_setups")) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-20 md:px-6">
          <div className="mx-auto max-w-lg rounded-3xl border border-primary/40 bg-card p-10 text-center shadow-elegant ring-2 ring-primary/20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-hero text-primary-foreground">
              <Crown className="h-6 w-6" />
            </div>
            <h1 className="mt-5 font-display text-3xl font-bold tracking-tight">
              Compare setups lado a lado
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Coloque dois setups frente a frente, veja diferença de nota IA,
              orçamento e produto a produto. Recurso exclusivo Premium.
            </p>
            <ul className="mt-6 space-y-2 text-left text-sm">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span>Visualização antes/depois lado a lado</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span>Diff automático de nota e budget</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span>Lista de produtos comparada por categoria</span>
              </li>
            </ul>
            <Link
              to="/premium"
              className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-gradient-hero px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-smooth hover:opacity-90"
            >
              Assinar Premium · R$ 9,90/mês →
            </Link>
            <Link to="/galeria" className="mt-4 inline-block text-xs text-muted-foreground hover:underline">
              Voltar para galeria
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Setups recomendados pra comparar: primeiro salvos, depois galeria geral
  const savedSetups = allSetups.filter((s) => saves.has(s.id));
  const candidates =
    savedSetups.length >= 2
      ? savedSetups
      : [...savedSetups, ...allSetups.filter((s) => !saves.has(s.id))].slice(0, 20);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="mb-8 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <ArrowLeftRight className="h-3 w-3" /> Comparar setups
            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">Premium</span>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Antes e depois, lado a lado
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Escolha 2 setups para colocar frente a frente. Use seus favoritos
            ou qualquer setup da galeria.
          </p>
        </div>

        {/* Selector */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Selecione 2 setups ({selectedSlugs.length}/2)</h2>
            {selectedSlugs.length > 0 && (
              <button
                onClick={() => setSelection([])}
                className="text-xs text-muted-foreground hover:text-foreground hover:underline"
              >
                Limpar seleção
              </button>
            )}
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {candidates.slice(0, 12).map((s) => {
                const isSelected = selectedSlugs.includes(s.slug);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSelect(s.slug)}
                    className={`group relative flex items-center gap-2 rounded-xl border p-2 text-left transition-smooth ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : "border-border bg-background hover:border-foreground"
                    }`}
                  >
                    <img
                      src={s.image}
                      alt=""
                      className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold">{s.title}</div>
                      <div className="truncate text-[10px] text-muted-foreground">{s.author}</div>
                    </div>
                    {isSelected && (
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Side-by-side comparison */}
        {selected.length === 2 ? (
          <ComparisonView a={selected[0]} b={selected[1]} />
        ) : selected.length === 1 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-background p-8 text-center text-sm text-muted-foreground">
            Selecione mais 1 setup pra começar a comparação.
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-background p-8 text-center text-sm text-muted-foreground">
            Selecione 2 setups acima pra ver a comparação.
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function ComparisonView({ a, b }: { a: Setup; b: Setup }) {
  const scoreDiff = +(a.score - b.score).toFixed(1);
  const budgetDiff = a.budget - b.budget;
  const aWon = scoreDiff > 0;
  const aCheaper = budgetDiff < 0;

  // Agrupa produtos por categoria pra comparar lado a lado
  const categories = Array.from(
    new Set([...a.products.map((p) => p.category), ...b.products.map((p) => p.category)]),
  );

  return (
    <div className="mt-10 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <SetupColumn s={a} label="A" highlight={aWon} />
        <SetupColumn s={b} label="B" highlight={!aWon} />
      </div>

      {/* Diff summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {aWon ? <TrendingUp className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-muted-foreground" />}
            Diferença de nota IA
          </div>
          <div className="mt-3 font-display text-3xl font-bold">
            {scoreDiff === 0 ? "Empate" : `${Math.abs(scoreDiff)} pts`}
          </div>
          {scoreDiff !== 0 && (
            <div className="mt-1 text-xs text-muted-foreground">
              {aWon ? `Setup A (${a.score}) é melhor que B (${b.score})` : `Setup B (${b.score}) é melhor que A (${a.score})`}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {aCheaper ? <TrendingDown className="h-4 w-4 text-primary" /> : <TrendingUp className="h-4 w-4 text-coral" />}
            Diferença de orçamento
          </div>
          <div className="mt-3 font-display text-3xl font-bold">
            R$ {Math.abs(budgetDiff).toLocaleString("pt-BR")}
          </div>
          {budgetDiff !== 0 && (
            <div className="mt-1 text-xs text-muted-foreground">
              {aCheaper ? `Setup A é mais barato R$ ${Math.abs(budgetDiff).toLocaleString("pt-BR")}` : `Setup B é mais barato R$ ${Math.abs(budgetDiff).toLocaleString("pt-BR")}`}
            </div>
          )}
        </div>
      </div>

      {/* Products by category */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-lg font-bold">Produtos por categoria</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          O que cada setup tem em cada categoria. Categorias presentes em só um dos lados aparecem em branco do outro.
        </p>
        <div className="mt-5 space-y-3">
          {categories.map((cat) => {
            const pA = a.products.find((p) => p.category === cat);
            const pB = b.products.find((p) => p.category === cat);
            return (
              <div
                key={cat}
                className="grid items-stretch gap-3 rounded-2xl border border-border bg-background p-3 md:grid-cols-[140px_1fr_1fr]"
              >
                <div className="flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {cat}
                </div>
                <ProductCell p={pA} />
                <ProductCell p={pB} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/setup/$slug" params={{ slug: a.slug }}>Ver setup A completo →</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/setup/$slug" params={{ slug: b.slug }}>Ver setup B completo →</Link>
        </Button>
        <Button asChild className="bg-gradient-hero">
          <Link to="/orcamento"><Sparkles className="mr-2 h-4 w-4" /> Montar parecido</Link>
        </Button>
      </div>
    </div>
  );
}

function SetupColumn({ s, label, highlight }: { s: Setup; label: string; highlight: boolean }) {
  return (
    <div className={`rounded-3xl border bg-card p-5 shadow-soft transition-smooth ${highlight ? "border-primary ring-2 ring-primary/30" : "border-border"}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${highlight ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
          {label}
        </span>
        {highlight && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            Maior nota
          </span>
        )}
      </div>
      <div className="aspect-[16/11] overflow-hidden rounded-2xl">
        <img src={s.image} alt={s.title} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <h3 className="mt-4 truncate font-display text-lg font-bold">{s.title}</h3>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{s.author}</span>
        <span>· {s.authorRole}</span>
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.city}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-secondary p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Nota IA</div>
          <div className="mt-1 flex items-center gap-1 font-display text-xl font-bold">
            <Star className="h-4 w-4 fill-accent text-accent" />
            {s.score || "—"}
          </div>
        </div>
        <div className="rounded-xl bg-secondary p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Orçamento</div>
          <div className="mt-1 font-display text-xl font-bold">
            R$ {s.budget.toLocaleString("pt-BR")}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {s.styles.slice(0, 3).map((t) => (
          <span key={t} className="rounded-full bg-background px-2 py-0.5 text-[10px] font-semibold">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function ProductCell({ p }: { p?: Product }) {
  if (!p) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
        <X className="mr-1 h-3 w-3" /> sem produto
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-secondary p-3">
      <div className="truncate text-sm font-semibold">{p.name}</div>
      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>{p.store}</span>
        <span className="font-bold text-foreground">R$ {p.price.toLocaleString("pt-BR")}</span>
      </div>
    </div>
  );
}
