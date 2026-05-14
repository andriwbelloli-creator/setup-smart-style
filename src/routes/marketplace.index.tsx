import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListingCard } from "@/components/marketplace/ListingCard";
import {
  fetchActiveListings,
  fetchCategories,
  fetchConditions,
  fetchMySaveIds,
  type MarketplaceCategory,
  type MarketplaceCondition,
  type MarketplaceListing,
} from "@/lib/marketplace";
import { useAuth } from "@/hooks/use-auth";
import { track, trackPageView } from "@/lib/track";
import { Loader2, Search, ShoppingBag, Plus, SlidersHorizontal } from "lucide-react";

export const Route = createFileRoute("/marketplace/")({
  head: () => ({
    meta: [
      { title: "Loja de usados · home office live" },
      {
        name: "description",
        content:
          "Compre e venda equipamentos de home office usados — monitores, cadeiras, teclados — com taxas justas e direto entre pessoas no Brasil.",
      },
    ],
  }),
  component: MarketplaceIndex,
});

function MarketplaceIndex() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [conditions, setConditions] = useState<MarketplaceCondition[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const [categoryId, setCategoryId] = useState<string>("");
  const [conditionId, setConditionId] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchConditions()]).then(([cats, conds]) => {
      setCategories(cats);
      setConditions(conds);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchMySaveIds(user.id).then(setSavedIds);
  }, [user]);

  useEffect(() => {
    trackPageView("marketplace", { route: "list" });
  }, []);

  // Trackeia filtros pra entender o que o usuário busca
  useEffect(() => {
    if (!categoryId && !conditionId && !minPrice && !maxPrice && !query) return;
    track("marketplace_filter", "marketplace", {
      categoryId: categoryId || null,
      conditionId: conditionId || null,
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
      query: query || null,
    });
  }, [categoryId, conditionId, minPrice, maxPrice, query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchActiveListings({
      categoryId: categoryId || undefined,
      conditionId: conditionId || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      query: query || undefined,
    })
      .then((rows) => !cancelled && setListings(rows))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [categoryId, conditionId, minPrice, maxPrice, query]);

  const total = listings.length;

  const clearFilters = () => {
    setCategoryId("");
    setConditionId("");
    setMinPrice("");
    setMaxPrice("");
    setQuery("");
  };

  const filtersContent = useMemo(
    () => (
      <FiltersPanel
        categories={categories}
        conditions={conditions}
        categoryId={categoryId}
        conditionId={conditionId}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onCategory={setCategoryId}
        onCondition={setConditionId}
        onMin={setMinPrice}
        onMax={setMaxPrice}
        onClear={clearFilters}
      />
    ),
    [categories, conditions, categoryId, conditionId, minPrice, maxPrice],
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <ShoppingBag className="h-3 w-3" /> Marketplace
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Equipamentos usados, taxas justas
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
              Compre e venda monitores, cadeiras, teclados e mais — direto entre pessoas
              da comunidade HomeOfficeLife.
            </p>
          </div>
          <Button asChild className="gap-2 bg-gradient-hero shadow-elegant">
            <Link to="/marketplace/anunciar">
              <Plus className="h-4 w-4" /> Anunciar produto
            </Link>
          </Button>
        </div>

        {/* Busca + toggle de filtros mobile */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título ou descrição..."
              className="h-11 pl-10"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="gap-2 lg:hidden"
            onClick={() => setMobileFiltersOpen((v) => !v)}
          >
            <SlidersHorizontal className="h-4 w-4" /> Filtros
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar desktop */}
          <aside className="hidden lg:block">{filtersContent}</aside>

          {/* Sidebar mobile (colapsável) */}
          {mobileFiltersOpen && (
            <div className="lg:hidden">{filtersContent}</div>
          )}

          <section>
            <div className="mb-4 text-sm text-muted-foreground">
              {loading ? "Buscando..." : `${total} anúncio${total === 1 ? "" : "s"} encontrado${total === 1 ? "" : "s"}`}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : total === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((l) => (
                  <ListingCard
                    key={l.id}
                    l={l}
                    saved={savedIds.has(l.id)}
                    onSaveToggle={(id, nowSaved) => {
                      setSavedIds((prev) => {
                        const next = new Set(prev);
                        if (nowSaved) next.add(id); else next.delete(id);
                        return next;
                      });
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function FiltersPanel({
  categories,
  conditions,
  categoryId,
  conditionId,
  minPrice,
  maxPrice,
  onCategory,
  onCondition,
  onMin,
  onMax,
  onClear,
}: {
  categories: MarketplaceCategory[];
  conditions: MarketplaceCondition[];
  categoryId: string;
  conditionId: string;
  minPrice: string;
  maxPrice: string;
  onCategory: (v: string) => void;
  onCondition: (v: string) => void;
  onMin: (v: string) => void;
  onMax: (v: string) => void;
  onClear: () => void;
}) {
  const hasAny = categoryId || conditionId || minPrice || maxPrice;
  return (
    <div className="space-y-6 rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categoria</Label>
        <div className="mt-2 flex flex-col gap-1">
          <FilterPill active={!categoryId} onClick={() => onCategory("")}>Todas</FilterPill>
          {categories.map((c) => (
            <FilterPill key={c.id} active={categoryId === c.id} onClick={() => onCategory(c.id)}>
              {c.name}
            </FilterPill>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Condição</Label>
        <div className="mt-2 flex flex-col gap-1">
          <FilterPill active={!conditionId} onClick={() => onCondition("")}>Todas</FilterPill>
          {conditions.map((c) => (
            <FilterPill key={c.id} active={conditionId === c.id} onClick={() => onCondition(c.id)}>
              {c.name}
            </FilterPill>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preço (R$)</Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Mín."
            value={minPrice}
            onChange={(e) => onMin(e.target.value)}
            className="h-10"
          />
          <Input
            type="number"
            min={0}
            placeholder="Máx."
            value={maxPrice}
            onChange={(e) => onMax(e.target.value)}
            className="h-10"
          />
        </div>
      </div>

      {hasAny && (
        <Button variant="ghost" size="sm" onClick={onClear} className="w-full">
          Limpar filtros
        </Button>
      )}
    </div>
  );
}

function FilterPill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-left text-sm font-medium transition-smooth ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center">
      <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
      <h3 className="mt-4 font-display text-lg font-semibold">Nenhum anúncio encontrado</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Ajuste os filtros ou seja o primeiro a anunciar nesta categoria.
      </p>
      <Button asChild className="mt-5 bg-gradient-hero">
        <Link to="/marketplace/anunciar">Anunciar meu produto</Link>
      </Button>
    </div>
  );
}
