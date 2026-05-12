import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { useSaves } from "@/hooks/use-saved";
import { fetchPublishedSetups, fetchMySetups } from "@/lib/setups-db";
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
  const [mySetups, setMySetups] = useState<Setup[]>([]);
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

  // Carrega setups do user logado pra exibir grupo "Meus setups" no topo
  useEffect(() => {
    if (!user) {
      setMySetups([]);
      return;
    }
    let cancelled = false;
    fetchMySetups(user.id)
      .then((rows) => {
        if (!cancelled) setMySetups(rows);
      })
      .catch(() => {
        if (!cancelled) setMySetups([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Auto-prefill: se o user tem setup próprio e nada está selecionado,
  // pré-popula com o setup dele mais recente. Faz o aha moment do
  // "antes (meu) vs depois (galeria)" acontecer sem clique extra.
  const prefillAppliedRef = useRef(false);
  useEffect(() => {
    if (prefillAppliedRef.current) return;
    if (!mySetups.length) return;
    if (selectedSlugs.length > 0) {
      prefillAppliedRef.current = true;
      return;
    }
    prefillAppliedRef.current = true;
    setSelection([mySetups[0].slug]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mySetups, selectedSlugs.length]);

  const selectedSlugs = useMemo(
    () => (search.setups ?? "").split(",").filter(Boolean),
    [search.setups],
  );

  const mySlugSet = useMemo(() => new Set(mySetups.map((s) => s.slug)), [mySetups]);

  // Mescla pra resolver os slugs selecionados (próprios + galeria, sem duplicar)
  const universe = useMemo(() => {
    const seen = new Set<string>();
    const merged: Setup[] = [];
    for (const s of [...mySetups, ...allSetups]) {
      if (seen.has(s.slug)) continue;
      seen.add(s.slug);
      merged.push(s);
    }
    return merged;
  }, [mySetups, allSetups]);

  const selected: Setup[] = useMemo(
    () =>
      selectedSlugs
        .map((slug) => universe.find((s) => s.slug === slug))
        .filter(Boolean) as Setup[],
    [selectedSlugs, universe],
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

  // Galeria filtrada: salvos primeiro, depois resto, exclui os "meus"
  const savedSetups = allSetups.filter((s) => saves.has(s.id) && !mySlugSet.has(s.slug));
  const galleryCandidates =
    savedSetups.length >= 2
      ? savedSetups
      : [...savedSetups, ...allSetups.filter((s) => !saves.has(s.id) && !mySlugSet.has(s.slug))].slice(0, 12);

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
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-border bg-background p-2">
                  <div className="h-12 w-12 flex-shrink-0 animate-pulse rounded-lg bg-secondary" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-secondary" />
                    <div className="h-2 w-1/2 animate-pulse rounded bg-secondary" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Grupo: Meus setups */}
              {mySetups.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-primary">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5">⭐ Meus setups</span>
                    <span className="text-muted-foreground">use o seu como base "antes"</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {mySetups.map((s) => (
                      <SelectorCard
                        key={s.id}
                        s={s}
                        isSelected={selectedSlugs.includes(s.slug)}
                        onToggle={() => toggleSelect(s.slug)}
                        mine
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Grupo: galeria */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span className="rounded-full bg-secondary px-2 py-0.5">📦 Galeria</span>
                  {savedSetups.length > 0 && <span>favoritos primeiro</span>}
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {galleryCandidates.map((s) => (
                    <SelectorCard
                      key={s.id}
                      s={s}
                      isSelected={selectedSlugs.includes(s.slug)}
                      onToggle={() => toggleSelect(s.slug)}
                    />
                  ))}
                </div>
              </div>

              {mySetups.length === 0 && user && (
                <div className="rounded-2xl border border-dashed border-border bg-background p-4 text-center text-xs text-muted-foreground">
                  Você ainda não postou nenhum setup.{" "}
                  <Link to="/postar" className="text-primary hover:underline">
                    Poste o seu
                  </Link>{" "}
                  pra comparar com a galeria.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Side-by-side comparison */}
        {selected.length === 2 ? (
          <ComparisonView
            a={selected[0]}
            b={selected[1]}
            mySlugs={mySlugSet}
          />
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

function SelectorCard({
  s,
  isSelected,
  onToggle,
  mine = false,
}: {
  s: Setup;
  isSelected: boolean;
  onToggle: () => void;
  mine?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      className={`group relative flex items-center gap-2 rounded-xl border p-2 text-left transition-smooth ${
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary/30"
          : mine
            ? "border-primary/30 bg-primary/5 hover:border-primary"
            : "border-border bg-background hover:border-foreground"
      }`}
    >
      <img src={s.image} alt="" className="h-12 w-12 flex-shrink-0 rounded-lg object-cover" loading="lazy" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold">{s.title}</div>
        <div className="truncate text-[10px] text-muted-foreground">
          {mine ? "Você" : s.author} · R$ {s.budget.toLocaleString("pt-BR")}
        </div>
      </div>
      {isSelected && (
        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3 w-3" />
        </span>
      )}
    </button>
  );
}

function ComparisonView({ a, b, mySlugs }: { a: Setup; b: Setup; mySlugs: Set<string> }) {
  const scoreDiff = +(a.score - b.score).toFixed(1);
  const budgetDiff = a.budget - b.budget;
  const aWon = scoreDiff > 0;
  const aCheaper = budgetDiff < 0;
  const aIsMine = mySlugs.has(a.slug);
  const bIsMine = mySlugs.has(b.slug);
  const labelA = aIsMine ? "Meu" : "Galeria A";
  const labelB = bIsMine ? "Meu" : "Galeria B";

  // Agrupa produtos por categoria pra comparar lado a lado
  const categories = Array.from(
    new Set([...a.products.map((p) => p.category), ...b.products.map((p) => p.category)]),
  );

  return (
    <div className="mt-10 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <SetupColumn s={a} label={labelA} highlight={aWon} mine={aIsMine} />
        <SetupColumn s={b} label={labelB} highlight={!aWon} mine={bIsMine} />
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

function SetupColumn({ s, label, highlight, mine = false }: { s: Setup; label: string; highlight: boolean; mine?: boolean }) {
  return (
    <div className={`rounded-3xl border bg-card p-5 shadow-soft transition-smooth ${highlight ? "border-primary ring-2 ring-primary/30" : mine ? "border-primary/30" : "border-border"}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
          mine
            ? "bg-primary text-primary-foreground"
            : highlight
              ? "bg-primary/15 text-primary"
              : "bg-secondary text-muted-foreground"
        }`}>
          {mine ? "⭐ " : ""}{label}
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
