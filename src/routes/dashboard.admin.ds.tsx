// Painel de Data Science — métricas + gráficos pra tomada de decisão.
// Foco: evolução temporal, funil, retenção, distribuições.
// Agregação no client (até ~10k linhas) — performance OK pro volume atual.

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-is-admin";
import {
  Loader2, ArrowLeft, TrendingUp, Users, DollarSign, MousePointerClick,
  Sparkles, ShoppingBag, Zap,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

export const Route = createFileRoute("/dashboard/admin/ds")({
  head: () => ({
    meta: [
      { title: "Data Science · Admin · HomeOfficeLife" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DSAdmin,
});

type Range = "7d" | "30d" | "90d";

const RANGE_DAYS: Record<Range, number> = { "7d": 7, "30d": 30, "90d": 90 };
const COLORS = ["#0d6e6e", "#f97316", "#8b5cf6", "#10b981", "#ef4444", "#3b82f6"];

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 86400_000).toISOString();
}
function dayKey(iso: string): string {
  return iso.slice(0, 10);
}
function emptyDayMap(days: number): Map<string, number> {
  const m = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    m.set(new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10), 0);
  }
  return m;
}

function DSAdmin() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [range, setRange] = useState<Range>("30d");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
    if (!adminLoading && !isAdmin && user) navigate({ to: "/" });
  }, [authLoading, adminLoading, isAdmin, user, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      setLoading(true);
      const since = daysAgo(RANGE_DAYS[range]);

      const [
        { data: subs },
        { data: setups },
        { data: clicks },
        { data: events },
        { data: offers },
        { data: listings },
        { data: aiAnalyses },
        { data: plans },
        { data: products },
      ] = await Promise.all([
        (supabase as any).from("subscriptions").select("user_id, tier, status, created_at").limit(5000),
        (supabase as any).from("setups").select("id, owner_id, career, status, created_at").gte("created_at", since).limit(5000),
        (supabase as any).from("affiliate_clicks").select("id, store, product_id, clicked_at").gte("clicked_at", since).limit(5000),
        (supabase as any).from("analytics_events").select("id, service, event_name, user_id, anon_id, utm_source, created_at").gte("created_at", since).limit(10000),
        (supabase as any).from("marketplace_offers").select("id, status, created_at").limit(5000),
        (supabase as any).from("marketplace_listings").select("id, status, category_slug, created_at").limit(5000),
        (supabase as any).from("ai_analyses").select("id, overall_score, created_at").gte("created_at", since).limit(5000),
        (supabase as any).from("subscription_plans").select("tier, price_cents_brl"),
        (supabase as any).from("setup_products").select("id, price_brl, store, x, y").limit(10000),
      ]);

      setData({ subs, setups, clicks, events, offers, listings, aiAnalyses, plans, products });
      setLoading(false);
    })();
  }, [isAdmin, range]);

  const stats = useMemo(() => (data ? compute(data, RANGE_DAYS[range]) : null), [data, range]);

  if (authLoading || adminLoading || (!isAdmin && user)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-32 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10 md:px-6">
        <Link to="/dashboard/admin" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar ao admin
        </Link>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Zap className="h-3 w-3" /> Data Science
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Painel de decisão
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Evolução de métricas chave + funil + distribuições. Atualiza ao trocar a janela.
            </p>
          </div>
          <div className="flex gap-2 rounded-full bg-card p-1 shadow-soft">
            {(["7d", "30d", "90d"] as Range[]).map((r) => (
              <button key={r} onClick={() => setRange(r)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-smooth ${range === r ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
                {r === "7d" ? "7 dias" : r === "30d" ? "30 dias" : "90 dias"}
              </button>
            ))}
          </div>
        </div>

        {loading || !stats ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-8">
            {/* KPIs no topo */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <KPI icon={<Users className="h-4 w-4" />} label="Usuários totais" value={stats.totalUsers.toLocaleString("pt-BR")} delta={stats.usersDeltaPct} sub={`+${stats.newUsersInRange} no período`} />
              <KPI icon={<TrendingUp className="h-4 w-4" />} label="MAU (30d)" value={stats.mau.toLocaleString("pt-BR")} sub={`${(stats.mauRetention * 100).toFixed(1)}% retenção`} />
              <KPI icon={<DollarSign className="h-4 w-4" />} label="MRR" value={`R$ ${stats.mrr.toFixed(2)}`} sub={`${stats.payingUsers} pagantes`} />
              <KPI icon={<Sparkles className="h-4 w-4" />} label="IA análises" value={stats.aiCount.toLocaleString("pt-BR")} sub={`Nota média ${stats.aiAvgScore.toFixed(1)}`} />
              <KPI icon={<MousePointerClick className="h-4 w-4" />} label="Cliques afiliado" value={stats.totalClicks.toLocaleString("pt-BR")} sub={`R$ ${stats.projRevenue.toFixed(2)} projetado`} />
            </div>

            {/* Time series */}
            <Section title="Evolução diária" subtitle="Novos signups, IA análises e cliques de afiliado por dia">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="day" fontSize={11} tickFormatter={(d) => d.slice(5)} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="signups" name="Signups" stroke="#0d6e6e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="ai" name="IA análises" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="clicks" name="Cliques" stroke="#f97316" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Section>

            {/* MRR Evolution */}
            <Section title="MRR mensal" subtitle="Receita recorrente projetada (com base nos pagantes ativos)">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={stats.mrrSeries}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="day" fontSize={11} tickFormatter={(d) => d.slice(5)} />
                  <YAxis fontSize={11} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip formatter={(v: any) => `R$ ${Number(v).toFixed(2)}`} />
                  <Line type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Section>

            {/* Funil */}
            <Section title="Funil de conversão" subtitle="Visitas → Signups → IA → Paywall → Upgrade. Drop-off % entre cada etapa.">
              <FunnelChart steps={stats.funnel} />
            </Section>

            {/* Distribuições */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Section title="Tier dos usuários">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={stats.tierDist} dataKey="value" nameKey="name" outerRadius={80} label={(e) => `${e.name}: ${e.value}`}>
                      {stats.tierDist.map((_: any, i: number) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Section>
              <Section title="Cliques por loja">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.storeBars} layout="vertical">
                    <XAxis type="number" fontSize={11} />
                    <YAxis dataKey="name" type="category" fontSize={11} width={90} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0d6e6e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Section>
              <Section title="Distribuição nota IA">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.scoreHist}>
                    <XAxis dataKey="range" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Section>
            </div>

            {/* Cohort retenção */}
            <Section title="Retenção por cohort (signup → atividade)" subtitle="% dos novos signups da semana que voltaram em D1, D7, D30. Atividade = evento em analytics_events.">
              <CohortTable cohorts={stats.cohorts} />
            </Section>

            {/* Marketplace + Setup health */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Section title="Marketplace · saúde" subtitle="Status dos anúncios + propostas">
                <div className="space-y-3">
                  <Row label="Anúncios ativos" value={stats.mp.active} />
                  <Row label="Anúncios pausados" value={stats.mp.paused} />
                  <Row label="Anúncios vendidos" value={stats.mp.sold} />
                  <Row label="Propostas pendentes" value={stats.mp.offersPending} />
                  <Row label="Propostas aceitas" value={stats.mp.offersAccepted} highlight />
                  <Row label="Taxa aceite" value={`${(stats.mp.acceptRate * 100).toFixed(1)}%`} highlight />
                </div>
              </Section>
              <Section title="Catálogo · saúde" subtitle="Setups + touchpoints localizados">
                <div className="space-y-3">
                  <Row label="Setups publicados" value={stats.catalog.published} />
                  <Row label="Setups novos no período" value={stats.catalog.newInRange} />
                  <Row label="Produtos cadastrados" value={stats.catalog.products} />
                  <Row label="Com touchpoints válidos" value={stats.catalog.productsWithTouchpoints} />
                  <Row label="% cobertura touchpoints" value={`${(stats.catalog.touchpointCoverage * 100).toFixed(1)}%`} highlight />
                </div>
              </Section>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              MRR = soma dos plan.price × subscriptions.status='active' (não pagantes free). Receita afiliado = comissão (4-6.3%/loja) × ticket × 10% conversão estimada.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function KPI({ icon, label, value, sub, delta }: { icon: React.ReactNode; label: string; value: string; sub?: string; delta?: number }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
        <span className="flex items-center gap-1">{icon} {label}</span>
        {delta !== undefined && (
          <span className={`text-xs font-bold ${delta >= 0 ? "text-emerald-600" : "text-destructive"}`}>
            {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-2 font-display text-2xl font-bold">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({ label, value, highlight }: { label: string; value: any; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 py-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-primary" : ""}`}>{value}</span>
    </div>
  );
}

function FunnelChart({ steps }: { steps: Array<{ label: string; count: number }> }) {
  const top = steps[0]?.count || 1;
  return (
    <div className="space-y-2">
      {steps.map((s, i) => {
        const pct = top > 0 ? (s.count / top) * 100 : 0;
        const prev = i > 0 ? steps[i - 1].count : null;
        const stepConv = prev && prev > 0 ? (s.count / prev) * 100 : null;
        return (
          <div key={s.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>{s.label}</span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">{s.count.toLocaleString("pt-BR")}</strong>{" "}
                {stepConv !== null && <span className="text-xs">({stepConv.toFixed(0)}% ↓)</span>}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-gradient-hero transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CohortTable({ cohorts }: { cohorts: Array<{ week: string; size: number; d1: number; d7: number; d30: number }> }) {
  if (cohorts.length === 0) return <p className="text-sm text-muted-foreground">Sem cohorts no período.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr><th className="py-2 pr-3">Semana</th><th className="py-2 pr-3">Tamanho</th><th className="py-2 pr-3">D1</th><th className="py-2 pr-3">D7</th><th className="py-2 pr-3">D30</th></tr>
        </thead>
        <tbody>
          {cohorts.map((c) => (
            <tr key={c.week} className="border-b border-border/40 last:border-0">
              <td className="py-2 pr-3 font-mono text-xs">{c.week}</td>
              <td className="py-2 pr-3">{c.size}</td>
              <td className="py-2 pr-3"><RetentionPill pct={c.d1} /></td>
              <td className="py-2 pr-3"><RetentionPill pct={c.d7} /></td>
              <td className="py-2 pr-3"><RetentionPill pct={c.d30} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RetentionPill({ pct }: { pct: number }) {
  const color = pct >= 30 ? "bg-emerald-500/15 text-emerald-700" : pct >= 10 ? "bg-amber-500/15 text-amber-700" : "bg-muted text-muted-foreground";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>{pct.toFixed(0)}%</span>;
}

// ===================== Compute =====================
function compute(d: any, days: number) {
  const subs: any[] = d.subs || [];
  const setups: any[] = d.setups || [];
  const clicks: any[] = d.clicks || [];
  const events: any[] = d.events || [];
  const offers: any[] = d.offers || [];
  const listings: any[] = d.listings || [];
  const aiAnalyses: any[] = d.aiAnalyses || [];
  const plans: any[] = d.plans || [];
  const products: any[] = d.products || [];

  const planByTier: Record<string, number> = {};
  for (const p of plans) planByTier[p.tier] = p.price_cents_brl;

  // KPIs
  const totalUsers = subs.length;
  const sinceISO = daysAgo(days);
  const newUsersInRange = subs.filter((s) => s.created_at >= sinceISO).length;
  const usersBeforeRange = totalUsers - newUsersInRange;
  const usersDeltaPct = usersBeforeRange > 0 ? (newUsersInRange / usersBeforeRange) * 100 : 0;

  // MAU = usuários únicos com qualquer evento nos últimos 30d
  const mauSet = new Set<string>();
  for (const e of events) if (e.user_id || e.anon_id) mauSet.add(e.user_id || e.anon_id);
  const mau = mauSet.size;
  const mauRetention = totalUsers > 0 ? Math.min(mauSet.size / totalUsers, 1) : 0;

  // MRR — soma dos planos pagantes ativos
  let mrrCents = 0; let payingUsers = 0;
  for (const s of subs) {
    if (s.status === "active" && s.tier !== "free") {
      mrrCents += planByTier[s.tier] || 0;
      payingUsers += 1;
    }
  }
  const mrr = mrrCents / 100;

  // AI stats
  const aiCount = aiAnalyses.length;
  const aiAvgScore = aiCount > 0 ? aiAnalyses.reduce((s, a) => s + (Number(a.overall_score) || 0), 0) / aiCount : 0;

  // Affiliate
  const totalClicks = clicks.length;
  // Receita projetada: ticket médio do produto × comissão estimada × conversão estimada
  const COMMISSION: Record<string, number> = { amazon_br: 0.04, mercado_livre: 0.05, kabum: 0.053, magalu: 0.04, pichau: 0.063, outro: 0.03 };
  const prodMap: Record<string, any> = {};
  for (const p of products) prodMap[p.id] = p;
  let projRevenue = 0;
  for (const c of clicks) {
    const p = c.product_id ? prodMap[c.product_id] : null;
    if (!p) continue;
    projRevenue += (p.price_brl || 0) * (COMMISSION[p.store] ?? 0.03) * 0.1;
  }

  // Time series — last N days
  const signupMap = emptyDayMap(days);
  const aiMap = emptyDayMap(days);
  const clicksMap = emptyDayMap(days);
  for (const s of subs) if (s.created_at >= sinceISO) signupMap.set(dayKey(s.created_at), (signupMap.get(dayKey(s.created_at)) || 0) + 1);
  for (const a of aiAnalyses) aiMap.set(dayKey(a.created_at), (aiMap.get(dayKey(a.created_at)) || 0) + 1);
  for (const c of clicks) clicksMap.set(dayKey(c.clicked_at), (clicksMap.get(dayKey(c.clicked_at)) || 0) + 1);
  const timeSeries = Array.from(signupMap.keys()).map((day) => ({
    day,
    signups: signupMap.get(day) || 0,
    ai: aiMap.get(day) || 0,
    clicks: clicksMap.get(day) || 0,
  }));

  // MRR series — cumulative pagantes × mrr atual (aproximação)
  const mrrSeries: Array<{ day: string; mrr: number }> = [];
  let running = 0;
  const allDays = Array.from(signupMap.keys());
  for (const day of allDays) {
    const newPaying = subs.filter((s) => s.tier !== "free" && s.status === "active" && dayKey(s.created_at) === day).length;
    running += newPaying * (planByTier.premium / 100); // aproximação grosseira
    mrrSeries.push({ day, mrr: running });
  }

  // Funil
  const pageViews = events.filter((e) => e.event_name === "page_view").length;
  const signups = events.filter((e) => e.event_name === "sign_up").length;
  const iaStarts = events.filter((e) => e.event_name === "ia_upload_start").length;
  const paywallViews = events.filter((e) => e.event_name === "ia_paywall_view").length;
  const upgrades = events.filter((e) => e.event_name === "ia_upgrade_click").length;
  const funnel = [
    { label: "Page views", count: pageViews },
    { label: "Signups", count: signups },
    { label: "IA iniciada", count: iaStarts },
    { label: "Paywall hit", count: paywallViews },
    { label: "Click upgrade", count: upgrades },
  ];

  // Tier distribution
  const tierCount: Record<string, number> = { free: 0, premium: 0, pro: 0 };
  for (const s of subs) tierCount[s.tier] = (tierCount[s.tier] || 0) + 1;
  const tierDist = Object.entries(tierCount).map(([name, value]) => ({ name, value }));

  // Cliques por loja
  const storeCount: Record<string, number> = {};
  for (const c of clicks) storeCount[c.store] = (storeCount[c.store] || 0) + 1;
  const storeBars = Object.entries(storeCount).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));

  // Score histogram
  const bins = [0, 2, 4, 6, 8, 10];
  const scoreHist = bins.slice(0, -1).map((lo, i) => ({
    range: `${lo}-${bins[i + 1]}`,
    count: aiAnalyses.filter((a) => Number(a.overall_score) >= lo && Number(a.overall_score) < bins[i + 1]).length,
  }));

  // Cohort retention — agrupa signups por semana ISO
  const cohortMap = new Map<string, { ids: string[] }>();
  for (const s of subs) {
    if (s.created_at < daysAgo(days * 2)) continue; // só cohorts recentes
    const wk = isoWeek(s.created_at);
    if (!cohortMap.has(wk)) cohortMap.set(wk, { ids: [] });
    cohortMap.get(wk)!.ids.push(s.user_id);
  }
  const cohorts = Array.from(cohortMap.entries()).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 8).map(([week, { ids }]) => {
    const cohortStart = new Date(week + "-1");
    // Eventos por user_id após signup
    const userActivity = new Map<string, number[]>();
    for (const e of events) {
      if (!e.user_id || !ids.includes(e.user_id)) continue;
      const daysSince = Math.floor((new Date(e.created_at).getTime() - cohortStart.getTime()) / 86400_000);
      if (!userActivity.has(e.user_id)) userActivity.set(e.user_id, []);
      userActivity.get(e.user_id)!.push(daysSince);
    }
    const retained = (atDay: number) => {
      let n = 0;
      for (const arr of userActivity.values()) if (arr.some((d) => d >= atDay)) n++;
      return ids.length > 0 ? (n / ids.length) * 100 : 0;
    };
    return { week, size: ids.length, d1: retained(1), d7: retained(7), d30: retained(30) };
  });

  // Marketplace
  const mpActive = listings.filter((l) => l.status === "active").length;
  const mpPaused = listings.filter((l) => l.status === "paused").length;
  const mpSold = listings.filter((l) => l.status === "sold").length;
  const offersPending = offers.filter((o) => o.status === "pending").length;
  const offersAccepted = offers.filter((o) => o.status === "accepted").length;
  const offersRejected = offers.filter((o) => o.status === "rejected").length;
  const totalDecided = offersAccepted + offersRejected;
  const acceptRate = totalDecided > 0 ? offersAccepted / totalDecided : 0;

  // Catalog
  const published = setups.filter((s) => s.status === "published").length;
  const productsWithTouchpoints = products.filter((p) => p.x >= 0 && p.y >= 0).length;
  const touchpointCoverage = products.length > 0 ? productsWithTouchpoints / products.length : 0;

  return {
    totalUsers, newUsersInRange, usersDeltaPct,
    mau, mauRetention,
    mrr, payingUsers,
    aiCount, aiAvgScore,
    totalClicks, projRevenue,
    timeSeries, mrrSeries,
    funnel,
    tierDist, storeBars, scoreHist,
    cohorts,
    mp: { active: mpActive, paused: mpPaused, sold: mpSold, offersPending, offersAccepted, acceptRate },
    catalog: { published, newInRange: setups.length, products: products.length, productsWithTouchpoints, touchpointCoverage },
  };
}

function isoWeek(iso: string): string {
  const d = new Date(iso);
  const year = d.getUTCFullYear();
  const start = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(((d.getTime() - start.getTime()) / 86400_000 + start.getUTCDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}
