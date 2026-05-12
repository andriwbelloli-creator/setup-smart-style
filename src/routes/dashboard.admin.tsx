import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-is-admin";
import {
  Loader2,
  Users,
  Layers,
  ShoppingBag,
  MousePointerClick,
  DollarSign,
  Sparkles,
  Crown,
  ShieldAlert,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/admin")({
  head: () => ({ meta: [{ title: "Painel Admin · Deskly" }] }),
  component: AdminDashboard,
});

const COMMISSION_RATE: Record<string, number> = {
  amazon_br: 0.04,
  mercado_livre: 0.05,
  kabum: 0.053,
  magalu: 0.04,
  pichau: 0.063,
  outro: 0.03,
};
const STORE_LABEL: Record<string, string> = {
  amazon_br: "Amazon BR",
  mercado_livre: "Mercado Livre",
  kabum: "Kabum",
  magalu: "Magalu",
  pichau: "Pichau",
  outro: "Outro",
};

type Range = "7d" | "30d" | "90d" | "all";

function rangeStart(r: Range): Date | null {
  if (r === "all") return null;
  const days = r === "7d" ? 7 : r === "30d" ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

type Metrics = {
  users: number;
  setupsPublished: number;
  setupsDraft: number;
  products: number;
  comments: number;
  likes: number;
  analyses: number;
  analysesInRange: number;
  newUsersInRange: number;
  newSetupsInRange: number;
  clicks: number;
  clicksByStore: Record<string, number>;
  projectedRevenue: number;
  subsFree: number;
  subsPremium: number;
  subsPro: number;
  mrrCents: number;
  topSetups: Array<{ id: string; slug: string; title: string; clicks: number }>;
  recentUsers: Array<{ id: string; display_name: string; username: string; created_at: string }>;
};

async function fetchCount(table: string, filters?: (q: any) => any): Promise<number> {
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (filters) q = filters(q);
  const { count } = await q;
  return count ?? 0;
}

function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [range, setRange] = useState<Range>("30d");
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const start = rangeStart(range);
      const startIso = start?.toISOString();

      const [
        users,
        setupsPublished,
        setupsDraft,
        products,
        comments,
        likes,
        analyses,
        analysesInRange,
        newUsersInRange,
        newSetupsInRange,
      ] = await Promise.all([
        fetchCount("profiles"),
        fetchCount("setups", (q) => q.eq("status", "published")),
        fetchCount("setups", (q) => q.eq("status", "draft")),
        fetchCount("setup_products"),
        fetchCount("comments"),
        fetchCount("likes"),
        fetchCount("ai_analyses"),
        startIso
          ? fetchCount("ai_analyses", (q) => q.gte("created_at", startIso))
          : fetchCount("ai_analyses"),
        startIso
          ? fetchCount("profiles", (q) => q.gte("created_at", startIso))
          : fetchCount("profiles"),
        startIso
          ? fetchCount("setups", (q) => q.gte("created_at", startIso))
          : fetchCount("setups"),
      ]);

      // Cliques + receita projetada
      let clicksQuery = supabase
        .from("affiliate_clicks")
        .select("id, product_id, setup_id, store, clicked_at")
        .order("clicked_at", { ascending: false })
        .limit(10000);
      if (startIso) clicksQuery = clicksQuery.gte("clicked_at", startIso);
      const { data: clicksData } = await clicksQuery;
      const clicks = (clicksData || []) as Array<{
        id: string;
        product_id: string | null;
        setup_id: string | null;
        store: string;
      }>;

      const productIds = Array.from(
        new Set(clicks.map((c) => c.product_id).filter(Boolean) as string[]),
      );
      const priceByProduct: Record<string, number> = {};
      if (productIds.length > 0) {
        const { data: prods } = await supabase
          .from("setup_products")
          .select("id, price_brl, store")
          .in("id", productIds);
        for (const p of (prods || []) as any[]) {
          priceByProduct[p.id] = p.price_brl;
        }
      }
      const ESTIMATED_CONVERSION = 0.1;
      let projectedRevenue = 0;
      const clicksByStore: Record<string, number> = {};
      const clicksBySetup: Record<string, number> = {};
      for (const c of clicks) {
        clicksByStore[c.store] = (clicksByStore[c.store] || 0) + 1;
        if (c.setup_id) clicksBySetup[c.setup_id] = (clicksBySetup[c.setup_id] || 0) + 1;
        if (c.product_id && priceByProduct[c.product_id]) {
          const rate = COMMISSION_RATE[c.store] ?? 0.03;
          projectedRevenue += priceByProduct[c.product_id] * rate * ESTIMATED_CONVERSION;
        }
      }

      // Top setups por cliques
      const topSetupIds = Object.entries(clicksBySetup)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      let topSetups: Metrics["topSetups"] = [];
      if (topSetupIds.length > 0) {
        const { data: setupsInfo } = await supabase
          .from("setups")
          .select("id, slug, title")
          .in(
            "id",
            topSetupIds.map(([id]) => id),
          );
        const byId: Record<string, { slug: string; title: string }> = {};
        for (const s of (setupsInfo || []) as any[]) {
          byId[s.id] = { slug: s.slug, title: s.title };
        }
        topSetups = topSetupIds.map(([id, count]) => ({
          id,
          slug: byId[id]?.slug ?? "",
          title: byId[id]?.title ?? id.slice(0, 8),
          clicks: count,
        }));
      }

      // Subscriptions
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("tier, status");
      let subsFree = 0, subsPremium = 0, subsPro = 0, mrrCents = 0;
      for (const s of (subs || []) as Array<{ tier: string; status: string }>) {
        const active = s.status === "active" || s.status === "trialing";
        if (!active) continue;
        if (s.tier === "free") subsFree++;
        else if (s.tier === "premium") {
          subsPremium++;
          mrrCents += 990;
        } else if (s.tier === "pro") {
          subsPro++;
          mrrCents += 2990;
        }
      }

      // Usuários recentes
      const { data: recent } = await supabase
        .from("profiles")
        .select("id, display_name, username, created_at")
        .order("created_at", { ascending: false })
        .limit(8);

      if (cancelled) return;
      setMetrics({
        users,
        setupsPublished,
        setupsDraft,
        products,
        comments,
        likes,
        analyses,
        analysesInRange,
        newUsersInRange,
        newSetupsInRange,
        clicks: clicks.length,
        clicksByStore,
        projectedRevenue,
        subsFree,
        subsPremium,
        subsPro,
        mrrCents,
        topSetups,
        recentUsers: (recent || []) as any,
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, isAdmin, range]);

  if (authLoading || roleLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-32 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-24 md:px-6">
          <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
            <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
            <h1 className="mt-4 font-display text-2xl font-bold">Acesso restrito</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Este painel é apenas para administradores da plataforma.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background"
            >
              Voltar para a home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Crown className="h-3 w-3" /> Admin
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Painel de administração</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Métricas em tempo real da plataforma Deskly
            </p>
          </div>
          <div className="flex gap-2 rounded-full bg-card p-1 shadow-soft">
            {(["7d", "30d", "90d", "all"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-smooth ${
                  range === r ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === "7d" ? "7 dias" : r === "30d" ? "30 dias" : r === "90d" ? "90 dias" : "Tudo"}
              </button>
            ))}
          </div>
        </div>

        {loading || !metrics ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Top-level KPIs */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat icon={Users} label="Usuários totais" value={metrics.users.toString()} hint={`+${metrics.newUsersInRange} no período`} />
              <Stat icon={Layers} label="Setups publicados" value={metrics.setupsPublished.toString()} hint={`+${metrics.newSetupsInRange} no período · ${metrics.setupsDraft} rascunhos`} />
              <Stat icon={MousePointerClick} label="Cliques afiliados" value={metrics.clicks.toString()} hint="no período selecionado" />
              <Stat icon={DollarSign} label="Receita projetada" value={`R$ ${metrics.projectedRevenue.toFixed(2)}`} hint="conversão estimada 10%" />
            </div>

            {/* Engagement */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat icon={ShoppingBag} label="Produtos no catálogo" value={metrics.products.toString()} />
              <Stat icon={Sparkles} label="Análises IA" value={metrics.analyses.toString()} hint={`${metrics.analysesInRange} no período`} />
              <Stat icon={Users} label="Comentários" value={metrics.comments.toString()} />
              <Stat icon={Users} label="Curtidas" value={metrics.likes.toString()} />
            </div>

            {/* Subscriptions */}
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
                <h2 className="font-display text-lg font-bold">Assinaturas ativas</h2>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <SubBlock label="Free" value={metrics.subsFree} accent="bg-muted" />
                  <SubBlock label="Premium" value={metrics.subsPremium} accent="bg-primary/15" />
                  <SubBlock label="Pro" value={metrics.subsPro} accent="bg-accent/30" />
                </div>
                <div className="mt-6 flex items-center justify-between rounded-2xl bg-gradient-mesh p-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">MRR projetado</div>
                    <div className="font-display text-3xl font-bold">
                      R$ {(metrics.mrrCents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Premium R$ 9,90 · Pro R$ 29,90
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <h2 className="font-display text-lg font-bold">Cliques por loja</h2>
                {Object.keys(metrics.clicksByStore).length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">Sem cliques no período.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {Object.entries(metrics.clicksByStore)
                      .sort((a, b) => b[1] - a[1])
                      .map(([store, count]) => {
                        const pct = metrics.clicks > 0 ? (count / metrics.clicks) * 100 : 0;
                        return (
                          <div key={store}>
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <span className="font-semibold">{STORE_LABEL[store] ?? store}</span>
                              <span className="text-muted-foreground">{count} · {pct.toFixed(0)}%</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                              <div className="h-full bg-gradient-hero" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            {/* Top setups + Recent users */}
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <h2 className="font-display text-lg font-bold">Top setups por cliques</h2>
                {metrics.topSetups.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">Sem cliques no período.</p>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {metrics.topSetups.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3 text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold">{s.title}</div>
                          {s.slug && (
                            <Link
                              to="/setup/$slug"
                              params={{ slug: s.slug }}
                              className="text-xs text-primary hover:underline"
                            >
                              /setup/{s.slug}
                            </Link>
                          )}
                        </div>
                        <span className="shrink-0 rounded-full bg-foreground/5 px-3 py-1 text-xs font-bold">
                          {s.clicks}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <h2 className="font-display text-lg font-bold">Usuários recentes</h2>
                <ul className="mt-4 space-y-2">
                  {metrics.recentUsers.map((u) => (
                    <li
                      key={u.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold">{u.display_name}</div>
                        <div className="truncate text-xs text-muted-foreground">@{u.username}</div>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/dashboard/afiliados"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition-smooth hover:border-foreground"
              >
                <MousePointerClick className="h-4 w-4" /> Detalhes de afiliados
              </Link>
              <Link
                to="/galeria"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition-smooth hover:border-foreground"
              >
                <Layers className="h-4 w-4" /> Ver galeria
              </Link>
            </div>

            <p className="mt-8 text-xs text-muted-foreground">
              Métricas atualizadas em tempo real. MRR considera apenas assinaturas ativas/trialing. Receita projetada de afiliados usa taxa média por loja e conversão estimada de 10%.
            </p>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <div className="mt-3 font-display text-3xl font-bold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function SubBlock({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className={`rounded-2xl ${accent} p-4`}>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold">{value}</div>
    </div>
  );
}
