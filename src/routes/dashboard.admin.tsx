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
  Bug,
  Shield,
  TrendingUp,
  CalendarClock,
  Building2,
  User as UserIcon,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/admin")({
  head: () => ({ meta: [{ title: "Painel Admin · HomeOffice.life" }] }),
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
  botTraps: number;
  recentTraps: Array<{ ip_hash: string; trap_type: string; user_agent: string; detected_at: string }>;
  cspViolations: number;
  recentCspViolations: Array<{ violated_directive: string; blocked_uri: string; document_uri: string; reported_at: string }>;
  paywallHits: number;
  paywallConversions: number;
  paywallRecoveryRate: number;
  rentalLeads: Array<{
    id: string;
    lead_type: "B2B" | "B2C";
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    company_name: string | null;
    employee_count: number | null;
    rental_duration_months: number;
    estimated_budget: number | null;
    status: string;
    created_at: string;
    setup?: { slug: string; title: string } | null;
    partner?: { name: string } | null;
  }>;
  rentalCounts: { pending: number; contacted: number; converted: number; lost: number };
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

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    const { error } = await (supabase as any)
      .from("rental_leads")
      .update({ status: newStatus })
      .eq("id", leadId);
    if (error) {
      console.warn("update lead status:", error.message);
      return;
    }
    // Optimistic update
    setMetrics((m) => m && {
      ...m,
      rentalLeads: m.rentalLeads.map((l) => l.id === leadId ? { ...l, status: newStatus } : l),
    });
  };

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
          mrrCents += 1990;
        }
      }

      // Usuários recentes
      const { data: recent } = await supabase
        .from("profiles")
        .select("id, display_name, username, created_at")
        .order("created_at", { ascending: false })
        .limit(8);

      // Paywall funnel: hits + conversões
      let paywallHits = 0;
      let paywallConversions = 0;
      let paywallRecoveryRate = 0;
      try {
        const q = supabase.from("paywall_events").select("*", { count: "exact", head: true });
        const totalQ = startIso ? q.gte("hit_at", startIso) : q;
        const { count: hits } = await totalQ;
        paywallHits = hits ?? 0;
        const qConv = supabase
          .from("paywall_events")
          .select("*", { count: "exact", head: true })
          .not("converted_at", "is", null);
        const convQ = startIso ? qConv.gte("hit_at", startIso) : qConv;
        const { count: conv } = await convQ;
        paywallConversions = conv ?? 0;
        paywallRecoveryRate = paywallHits > 0 ? (paywallConversions / paywallHits) * 100 : 0;
      } catch {
        // tabela ainda não criada
      }

      // CSP violations (admin via RLS)
      let cspViolations = 0;
      let recentCspViolations: Metrics["recentCspViolations"] = [];
      try {
        const q1 = supabase.from("csp_violations").select("*", { count: "exact", head: true });
        const cspCountQuery = startIso ? q1.gte("reported_at", startIso) : q1;
        const { count: cspCount } = await cspCountQuery;
        cspViolations = cspCount ?? 0;
        const { data: cspRows } = await supabase
          .from("csp_violations")
          .select("violated_directive, blocked_uri, document_uri, reported_at")
          .order("reported_at", { ascending: false })
          .limit(10);
        recentCspViolations = ((cspRows as any[]) || []).map((r) => ({
          violated_directive: r.violated_directive ?? "",
          blocked_uri: r.blocked_uri ?? "",
          document_uri: r.document_uri ?? "",
          reported_at: r.reported_at,
        }));
      } catch {
        // tabela ainda não criada
      }

      // Bot traps (acessível só pra admin via RLS)
      let botTraps = 0;
      let recentTraps: Metrics["recentTraps"] = [];
      try {
        const q1 = supabase.from("bot_traps").select("*", { count: "exact", head: true });
        const trapCountQuery = startIso ? q1.gte("detected_at", startIso) : q1;
        const { count: trapCount } = await trapCountQuery;
        botTraps = trapCount ?? 0;
        const { data: traps } = await supabase
          .from("bot_traps")
          .select("ip_hash, trap_type, user_agent, detected_at")
          .order("detected_at", { ascending: false })
          .limit(10);
        recentTraps = ((traps as any[]) || []).map((t) => ({
          ip_hash: t.ip_hash,
          trap_type: t.trap_type,
          user_agent: t.user_agent ?? "",
          detected_at: t.detected_at,
        }));
      } catch {
        // tabela ainda não criada — não bloqueia o dashboard
      }

      // Rental leads (B2B + B2C)
      let rentalLeads: Metrics["rentalLeads"] = [];
      const rentalCounts = { pending: 0, contacted: 0, converted: 0, lost: 0 } as Metrics["rentalCounts"];
      try {
        const qLeads = (supabase as any)
          .from("rental_leads")
          .select("id, lead_type, customer_name, customer_email, customer_phone, company_name, employee_count, rental_duration_months, estimated_budget, status, created_at, setup:setups(slug,title), partner:rental_partners(name)")
          .order("created_at", { ascending: false })
          .limit(50);
        const { data: leads } = startIso ? await qLeads.gte("created_at", startIso) : await qLeads;
        rentalLeads = (leads || []) as any;
        for (const l of rentalLeads) {
          if (l.status in rentalCounts) rentalCounts[l.status as keyof Metrics["rentalCounts"]]++;
        }
      } catch (err) {
        console.warn("rental_leads:", err);
      }

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
        botTraps,
        recentTraps,
        cspViolations,
        recentCspViolations,
        paywallHits,
        paywallConversions,
        paywallRecoveryRate,
        rentalLeads,
        rentalCounts,
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
              Métricas em tempo real da plataforma HomeOffice.life
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
                    Premium R$ 9,90 · Pro R$ 19,90
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

            {/* Funil de paywall */}
            <div className="mt-10 rounded-3xl border-2 border-accent/40 bg-gradient-to-br from-card via-card to-accent/5 p-6 shadow-soft">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                <h2 className="font-display text-lg font-bold">Funil Freemium</h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                3 análises grátis → paywall → recovery 20% off (7 dias)
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-card p-4 shadow-soft">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Hits no paywall</div>
                  <div className="mt-2 font-display text-3xl font-bold">{metrics.paywallHits}</div>
                </div>
                <div className="rounded-2xl bg-card p-4 shadow-soft">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Converteram após hit</div>
                  <div className="mt-2 font-display text-3xl font-bold">{metrics.paywallConversions}</div>
                </div>
                <div className="rounded-2xl bg-gradient-hero p-4 text-primary-foreground shadow-elegant">
                  <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Taxa de recovery</div>
                  <div className="mt-2 font-display text-3xl font-bold">{metrics.paywallRecoveryRate.toFixed(1)}%</div>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Benchmark: paywall otimizado converte 6-8% (Adapty, ChartMogul 2026). Abaixo de 3% = revisar copy ou preço.
              </p>
            </div>

            {/* Rental Leads — B2B + B2C lead gen */}
            <div className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-coral" />
                  <h2 className="font-display text-lg font-bold">Leads de Locação</h2>
                </div>
                <div className="flex gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-secondary px-3 py-1">
                    {metrics.rentalCounts.pending} pendentes
                  </span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                    {metrics.rentalCounts.contacted} contactados
                  </span>
                  <span className="rounded-full bg-primary px-3 py-1 text-primary-foreground">
                    {metrics.rentalCounts.converted} convertidos
                  </span>
                </div>
              </div>

              {metrics.rentalLeads.length === 0 ? (
                <p className="mt-6 rounded-2xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
                  Sem leads de locação ainda. Apareceram em <code className="rounded bg-secondary px-1">/setup/&lt;slug&gt;</code> os usuários podem solicitar cotação.
                </p>
              ) : (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[800px] text-xs">
                    <thead>
                      <tr className="border-b border-border text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="py-2 pr-3">Data</th>
                        <th className="py-2 pr-3">Tipo</th>
                        <th className="py-2 pr-3">Cliente / Empresa</th>
                        <th className="py-2 pr-3">Setup</th>
                        <th className="py-2 pr-3">Prazo</th>
                        <th className="py-2 pr-3">Orçamento</th>
                        <th className="py-2 pr-3">Status</th>
                        <th className="py-2 pr-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.rentalLeads.map((l) => (
                        <tr key={l.id} className="border-b border-border/40 hover:bg-secondary/30">
                          <td className="py-3 pr-3 whitespace-nowrap text-muted-foreground">
                            {new Date(l.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                          </td>
                          <td className="py-3 pr-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              l.lead_type === "B2B"
                                ? "bg-coral/15 text-coral-foreground"
                                : "bg-primary/10 text-primary"
                            }`}>
                              {l.lead_type === "B2B" ? <Building2 className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                              {l.lead_type}
                            </span>
                          </td>
                          <td className="py-3 pr-3">
                            <div className="font-semibold">
                              {l.lead_type === "B2B" ? l.company_name : l.customer_name}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {l.customer_email} · {l.customer_phone}
                              {l.lead_type === "B2B" && l.employee_count ? ` · ${l.employee_count} setups` : ""}
                            </div>
                          </td>
                          <td className="py-3 pr-3 text-muted-foreground">
                            {l.setup ? (
                              <Link to="/setup/$slug" params={{ slug: l.setup.slug }} className="text-primary hover:underline">
                                {l.setup.title.slice(0, 20)}...
                              </Link>
                            ) : "—"}
                          </td>
                          <td className="py-3 pr-3 text-muted-foreground">{l.rental_duration_months}m</td>
                          <td className="py-3 pr-3 text-muted-foreground">
                            {l.estimated_budget ? `R$ ${Number(l.estimated_budget).toLocaleString("pt-BR")}` : "—"}
                          </td>
                          <td className="py-3 pr-3">
                            <StatusBadge status={l.status} />
                          </td>
                          <td className="py-3 pr-3 text-right">
                            <select
                              value={l.status}
                              onChange={(e) => updateLeadStatus(l.id, e.target.value)}
                              className="h-7 rounded-md border border-border bg-background px-2 text-[10px] font-semibold"
                            >
                              <option value="pending">Pendente</option>
                              <option value="contacted">Contactado</option>
                              <option value="converted">Convertido</option>
                              <option value="lost">Perdido</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-4 text-xs text-muted-foreground">
                Leads B2B costumam ter ticket 5-10x maior. Priorize contato em &lt;24h pra maximizar conversão.
              </p>
            </div>

            {/* Bot traps (segurança) */}
            <div className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bug className="h-5 w-5 text-destructive" />
                  <h2 className="font-display text-lg font-bold">Bots detectados</h2>
                </div>
                <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
                  {metrics.botTraps} total
                </span>
              </div>
              {metrics.recentTraps.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Nenhum bot caiu na armadilha ainda. Boas notícias.
                </p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {metrics.recentTraps.map((t, i) => (
                    <li
                      key={i}
                      className="grid grid-cols-[80px_120px_1fr_120px] items-center gap-3 rounded-xl border border-border bg-background p-3 text-xs"
                    >
                      <span className="font-mono font-bold text-muted-foreground">
                        {t.ip_hash}
                      </span>
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-center font-semibold text-destructive">
                        {t.trap_type}
                      </span>
                      <span className="truncate text-muted-foreground" title={t.user_agent}>
                        {t.user_agent || "—"}
                      </span>
                      <span className="text-right text-muted-foreground">
                        {new Date(t.detected_at).toLocaleString("pt-BR")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 text-xs text-muted-foreground">
                Bots banidos automaticamente até o próximo restart do servidor (~24h).
                Acessos a <code className="rounded bg-secondary px-1">/honeypot</code> ou rate
                limit excedido em <code className="rounded bg-secondary px-1">/r/:id</code>
                {" "}disparam a captura.
              </p>
            </div>

            {/* CSP violations */}
            <div className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-lg font-bold">Violações CSP (report-only)</h2>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  {metrics.cspViolations} total
                </span>
              </div>
              {metrics.recentCspViolations.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Sem violações recentes. Policy compatível.
                </p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {metrics.recentCspViolations.map((v, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-border bg-background p-3 text-xs"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                          {v.violated_directive}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(v.reported_at).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className="mt-1 truncate text-muted-foreground" title={v.blocked_uri}>
                        bloqueado: <code className="rounded bg-secondary px-1">{v.blocked_uri || "—"}</code>
                      </div>
                      <div className="truncate text-muted-foreground" title={v.document_uri}>
                        em: <code className="rounded bg-secondary px-1">{v.document_uri}</code>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 text-xs text-muted-foreground">
                CSP em modo report-only — browser reporta, mas não bloqueia. Após coletar
                violações legítimas e ajustar a policy, trocar para
                {" "}<code className="rounded bg-secondary px-1">Content-Security-Policy</code>{" "}
                enforced.
              </p>
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

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-secondary text-foreground",
  contacted: "bg-primary/15 text-primary",
  converted: "bg-primary text-primary-foreground",
  lost: "bg-destructive/10 text-destructive",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  contacted: "Contactado",
  converted: "Convertido",
  lost: "Perdido",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[status] ?? "bg-secondary"}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
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
