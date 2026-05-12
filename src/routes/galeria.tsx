import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { SetupCard } from "@/components/setup/SetupCard";
import { SETUPS, STYLES, ROLES, type Setup } from "@/data/setups";
import { fetchPublishedSetups } from "@/lib/setups-db";
import { supabase } from "@/integrations/supabase/client";
import { Search, SlidersHorizontal, Loader2, ChevronLeft, ChevronRight, Flame, Sparkles, Star, Wallet } from "lucide-react";

type SortKey = "popular" | "recent" | "score" | "budget_asc";

const SORT_LABELS: Record<SortKey, { label: string; icon: typeof Flame }> = {
  popular: { label: "Mais clicados", icon: Flame },
  recent: { label: "Recentes", icon: Sparkles },
  score: { label: "Maior nota IA", icon: Star },
  budget_asc: { label: "Menor orçamento", icon: Wallet },
};

const PAGE_SIZE = 9;

export const Route = createFileRoute("/galeria")({
  head: () => ({
    meta: [
      { title: "Galeria — Setups brasileiros · Deskly" },
      { name: "description", content: "Descubra setups de home office por estilo: minimalista, gamer, MacBook, dev, designer, apê pequeno e mais." },
      { property: "og:title", content: "Galeria de setups — Deskly" },
      { property: "og:description", content: "Inspiração real de devs, designers e creators brasileiros." },
    ],
  }),
  component: Galeria,
});

function Galeria() {
  const [style, setStyle] = useState<string>("Todos");
  const [role, setRole] = useState<string>("Todos");
  const [budget, setBudget] = useState<string>("Todos");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("popular");
  const [dbSetups, setDbSetups] = useState<Setup[]>([]);
  const [clicksBySetup, setClicksBySetup] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchPublishedSetups()
      .then((rows) => setDbSetups(rows))
      .catch(() => setDbSetups([]))
      .finally(() => setLoading(false));
  }, []);

  // Carrega contagem de cliques por setup pra ordenação "Mais clicados".
  // Pega últimos 30 dias pra evitar bias dos primeiros setups da plataforma.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("affiliate_clicks")
        .select("setup_id")
        .gte("clicked_at", since)
        .not("setup_id", "is", null)
        .limit(10000);
      if (cancelled) return;
      const counts: Record<string, number> = {};
      for (const c of (data || []) as Array<{ setup_id: string | null }>) {
        if (!c.setup_id) continue;
        counts[c.setup_id] = (counts[c.setup_id] || 0) + 1;
      }
      setClicksBySetup(counts);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const all: Setup[] = [...dbSetups, ...SETUPS];

  const filtered = all.filter((s) => {
    if (style !== "Todos" && !s.styles.includes(style)) return false;
    if (role !== "Todos" && s.authorRole !== role) return false;
    if (budget === "<2k" && s.budget >= 2000) return false;
    if (budget === "2-5k" && (s.budget < 2000 || s.budget > 5000)) return false;
    if (budget === "5-10k" && (s.budget < 5000 || s.budget > 10000)) return false;
    if (budget === "10-20k" && (s.budget < 10000 || s.budget > 20000)) return false;
    if (budget === "20k+" && s.budget < 20000) return false;
    if (q && !`${s.title} ${s.author} ${s.city} ${s.styles.join(" ")}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case "popular":
        // Empate por cliques resolvido por nota IA, depois por likes
        return arr.sort((a, b) => {
          const ca = clicksBySetup[a.id] || 0;
          const cb = clicksBySetup[b.id] || 0;
          if (cb !== ca) return cb - ca;
          if (b.score !== a.score) return b.score - a.score;
          return b.likes - a.likes;
        });
      case "score":
        return arr.sort((a, b) => b.score - a.score);
      case "budget_asc":
        return arr.sort((a, b) => a.budget - b.budget);
      case "recent":
      default:
        return arr;
    }
  }, [filtered, sort, clicksBySetup]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [style, role, budget, q, sort]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Galeria
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Descubra setups por estilo
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            {all.length} setups de devs, designers e remotos brasileiros. Filtre, salve e clone os que combinam com você.
          </p>
        </div>

        {/* Search + filters */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nome, autor ou cidade…"
                className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-sm transition-smooth focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" /> Filtros
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <FilterRow label="Estilo" value={style} setValue={setStyle} options={[...STYLES]} />
            <FilterRow label="Função" value={role} setValue={setRole} options={["Todos", ...ROLES]} />
            <FilterRow
              label="Orçamento"
              value={budget}
              setValue={setBudget}
              options={["Todos", "<2k", "2-5k", "5-10k", "10-20k", "20k+"]}
              format={(o) =>
                o === "Todos" ? o :
                o === "<2k" ? "Até R$ 2k" :
                o === "20k+" ? "R$ 20k+" :
                `R$ ${o}`
              }
            />
          </div>
        </div>

        {/* Sort + counter */}
        <div className="mt-8 mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {sorted.length} {sorted.length === 1 ? "setup encontrado" : "setups encontrados"}
          </div>
          <div className="flex flex-wrap gap-1.5 rounded-full bg-card p-1 shadow-soft">
            {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => {
              const Icon = SORT_LABELS[key].icon;
              const active = sort === key;
              return (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-smooth ${
                    active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-pressed={active}
                >
                  <Icon className="h-3.5 w-3.5" /> {SORT_LABELS[key].label}
                </button>
              );
            })}
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : sorted.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center text-muted-foreground">
            Nenhum setup encontrado. Tenta limpar os filtros.
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((s, i) => {
                const globalIdx = (currentPage - 1) * PAGE_SIZE + i;
                const showTrending = sort === "popular" && globalIdx < 3 && (clicksBySetup[s.id] || 0) > 0;
                return (
                  <SetupCard
                    key={s.id}
                    s={s}
                    featured={i === 0 && currentPage === 1}
                    trending={showTrending ? clicksBySetup[s.id] : undefined}
                    onDeleted={(id) => setDbSetups((prev) => prev.filter((x) => x.id !== id))}
                  />
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex h-10 items-center gap-1 rounded-full border border-border bg-background px-4 text-sm font-medium transition-smooth hover:border-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" /> Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`h-10 w-10 rounded-full text-sm font-semibold transition-smooth ${
                      n === currentPage
                        ? "bg-foreground text-background"
                        : "border border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                    aria-current={n === currentPage ? "page" : undefined}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-10 items-center gap-1 rounded-full border border-border bg-background px-4 text-sm font-medium transition-smooth hover:border-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Próxima página"
                >
                  Próxima <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function FilterRow({
  label, value, setValue, options, format,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  options: string[];
  format?: (o: string) => string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-20 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => setValue(o)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-smooth ${
              value === o
                ? "bg-foreground text-background"
                : "border border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            {format ? format(o) : o}
          </button>
        ))}
      </div>
    </div>
  );
}
