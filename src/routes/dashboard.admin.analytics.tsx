import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, TrendingUp, BarChart3, Users, MousePointerClick } from "lucide-react";

export const Route = createFileRoute("/dashboard/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics · Admin · HomeOfficeLife" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminAnalytics,
});

type Range = "7d" | "30d" | "all";

type Row = {
  id: string;
  service: "inspiration" | "ia" | "affiliate" | "marketplace" | "auth" | "subscription" | "other";
  event_name: string;
  user_id: string | null;
  anon_id: string | null;
  session_id: string | null;
  utm_source: string | null;
  created_at: string;
  props: Record<string, unknown> | null;
};

const SERVICES = ["inspiration", "ia", "affiliate", "marketplace"] as const;
const SERVICE_LABEL: Record<(typeof SERVICES)[number], string> = {
  inspiration: "Inspiração",
  ia: "Avaliação IA",
  affiliate: "Afiliados",
  marketplace: "Marketplace",
};
const SERVICE_COLOR: Record<(typeof SERVICES)[number], string> = {
  inspiration: "bg-blue-500",
  ia: "bg-purple-500",
  affiliate: "bg-amber-500",
  marketplace: "bg-emerald-500",
};

function AdminAnalytics() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [range, setRange] = useState<Range>("7d");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
    if (!adminLoading && !isAdmin && user) navigate({ to: "/" });
  }, [authLoading, adminLoading, isAdmin, user, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    const since = range === "all"
      ? new Date(0).toISOString()
      : new Date(Date.now() - (range === "7d" ? 7 : 30) * 24 * 60 * 60 * 1000).toISOString();

    (supabase as any)
      .from("analytics_events")
      .select("id, service, event_name, user_id, anon_id, session_id, utm_source, created_at, props")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(5000)
      .then(({ data, error }: { data: Row[] | null; error: { message: string } | null }) => {
        if (error) console.warn("analytics_events query:", error.message);
        setRows(data || []);
        setLoading(false);
      });
  }, [isAdmin, range]);

  // ===== Aggregations =====
  const stats = useMemo(() => calcStats(rows), [rows]);

  if (authLoading || adminLoading || (!isAdmin && user)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-32 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10 md:px-6">
        <Link
          to="/dashboard/admin"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao admin
        </Link>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <BarChart3 className="h-3 w-3" /> Analytics
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Métricas dos 4 serviços
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Dados de <code>analytics_events</code> — top 5000 eventos da janela.
            </p>
          </div>
          <div className="flex gap-2 rounded-full bg-card p-1 shadow-soft">
            {(["7d", "30d", "all"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-smooth ${
                  range === r ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === "7d" ? "7 dias" : r === "30d" ? "30 dias" : "Tudo"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center">
            <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 font-display text-lg font-semibold">Sem dados ainda</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Eventos começam a aparecer assim que usuários navegarem. Aguarde algumas horas após o deploy.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Quick stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<TrendingUp className="h-5 w-5" />}
                label="Eventos totais"
                value={stats.totalEvents.toLocaleString("pt-BR")}
              />
              <StatCard
                icon={<Users className="h-5 w-5" />}
                label="Usuários únicos"
                value={stats.uniqueUsers.toLocaleString("pt-BR")}
                sub={`${stats.loggedUsers} logados`}
              />
              <StatCard
                icon={<MousePointerClick className="h-5 w-5" />}
                label="Sessões"
                value={stats.sessions.toLocaleString("pt-BR")}
                sub={stats.totalEvents > 0 ? `${(stats.totalEvents / Math.max(stats.sessions, 1)).toFixed(1)} eventos/sessão` : ""}
              />
              <StatCard
                icon={<BarChart3 className="h-5 w-5" />}
                label="Serviço líder"
                value={stats.topService ? SERVICE_LABEL[stats.topService] : "—"}
                sub={stats.topService ? `${stats.byService[stats.topService].toLocaleString("pt-BR")} eventos` : ""}
              />
            </div>

            {/* Por serviço */}
            <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-display text-lg font-bold">Distribuição por serviço</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                % de eventos totais. Use pra decidir onde investir.
              </p>
              <div className="mt-5 space-y-3">
                {SERVICES.map((svc) => {
                  const count = stats.byService[svc] || 0;
                  const pct = stats.totalEvents > 0 ? (count / stats.totalEvents) * 100 : 0;
                  return (
                    <div key={svc}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-semibold">{SERVICE_LABEL[svc]}</span>
                        <span className="text-muted-foreground">
                          {count.toLocaleString("pt-BR")} <span className="text-xs">({pct.toFixed(1)}%)</span>
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full ${SERVICE_COLOR[svc]} transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Top eventos */}
            <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-display text-lg font-bold">Top eventos</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="pb-2">Evento</th>
                      <th className="pb-2">Serviço</th>
                      <th className="pb-2 text-right">Eventos</th>
                      <th className="pb-2 text-right">Únicos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topEvents.slice(0, 15).map((e) => (
                      <tr key={`${e.service}:${e.event_name}`} className="border-t border-border">
                        <td className="py-2 font-mono text-xs">{e.event_name}</td>
                        <td className="py-2 text-xs text-muted-foreground">{SERVICE_LABEL[e.service as keyof typeof SERVICE_LABEL] ?? e.service}</td>
                        <td className="py-2 text-right font-semibold">{e.count.toLocaleString("pt-BR")}</td>
                        <td className="py-2 text-right text-muted-foreground">{e.uniques.toLocaleString("pt-BR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Funil IA */}
            <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-display text-lg font-bold">Funil — Avaliação IA</h2>
              <p className="mt-1 text-xs text-muted-foreground">Drop-off de cada etapa</p>
              <Funnel
                steps={[
                  { label: "Página /diagnostico", count: stats.iaFunnel.pageView },
                  { label: "Upload iniciado", count: stats.iaFunnel.uploadStart },
                  { label: "Resultado visualizado", count: stats.iaFunnel.resultView },
                  { label: "Paywall hit", count: stats.iaFunnel.paywallView },
                  { label: "Click em upgrade", count: stats.iaFunnel.upgradeClick },
                ]}
              />
            </section>

            {/* Funil Marketplace */}
            <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-display text-lg font-bold">Funil — Marketplace</h2>
              <Funnel
                steps={[
                  { label: "/marketplace view", count: stats.mpFunnel.listView },
                  { label: "Detalhe view", count: stats.mpFunnel.detailView },
                  { label: "Proposta enviada", count: stats.mpFunnel.offerCreate },
                  { label: "Proposta aceita", count: stats.mpFunnel.offerAccepted },
                ]}
              />
              <div className="mt-3 text-xs text-muted-foreground">
                Anúncios criados na janela: <strong>{stats.mpFunnel.listingCreate}</strong>
              </div>
            </section>

            {/* UTM sources */}
            <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-display text-lg font-bold">Origem de tráfego (UTM)</h2>
              {stats.utmSources.length === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Nenhum UTM detectado na janela. Use links com <code>?utm_source=...</code> nas campanhas pra atribuir corretamente.
                </p>
              ) : (
                <table className="mt-4 w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="pb-2">Source</th>
                      <th className="pb-2 text-right">Eventos</th>
                      <th className="pb-2 text-right">Únicos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.utmSources.map((u) => (
                      <tr key={u.source} className="border-t border-border">
                        <td className="py-2">{u.source}</td>
                        <td className="py-2 text-right font-semibold">{u.count.toLocaleString("pt-BR")}</td>
                        <td className="py-2 text-right text-muted-foreground">{u.uniques.toLocaleString("pt-BR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function StatCard({
  icon, label, value, sub,
}: {
  icon: React.ReactNode; label: string; value: string; sub?: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Funnel({ steps }: { steps: Array<{ label: string; count: number }> }) {
  const top = steps[0]?.count || 0;
  return (
    <div className="mt-4 space-y-2">
      {steps.map((s, i) => {
        const pct = top > 0 ? (s.count / top) * 100 : 0;
        const prev = i > 0 ? steps[i - 1].count : null;
        const stepConv = prev && prev > 0 ? (s.count / prev) * 100 : null;
        return (
          <div key={s.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>{s.label}</span>
              <span className="text-muted-foreground">
                {s.count.toLocaleString("pt-BR")}{" "}
                {stepConv !== null && (
                  <span className="text-xs">
                    ({stepConv.toFixed(0)}% do anterior)
                  </span>
                )}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-gradient-hero" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ===== Agregadores no client (5k linhas é OK pra ser barato) =====
function calcStats(rows: Row[]) {
  const byService: Record<string, number> = {};
  const eventCounter: Record<string, { service: string; event_name: string; count: number; uniqueSet: Set<string> }> = {};
  const userSet = new Set<string>();
  const loggedSet = new Set<string>();
  const sessionSet = new Set<string>();
  const utmCounter: Record<string, { count: number; uniqueSet: Set<string> }> = {};

  const iaFunnel = { pageView: 0, uploadStart: 0, resultView: 0, paywallView: 0, upgradeClick: 0 };
  const mpFunnel = { listView: 0, detailView: 0, offerCreate: 0, offerAccepted: 0, listingCreate: 0 };

  for (const r of rows) {
    byService[r.service] = (byService[r.service] || 0) + 1;
    const key = `${r.service}:${r.event_name}`;
    if (!eventCounter[key]) eventCounter[key] = { service: r.service, event_name: r.event_name, count: 0, uniqueSet: new Set() };
    eventCounter[key].count += 1;
    const ident = r.user_id || r.anon_id || "";
    if (ident) eventCounter[key].uniqueSet.add(ident);
    if (ident) userSet.add(ident);
    if (r.user_id) loggedSet.add(r.user_id);
    if (r.session_id) sessionSet.add(r.session_id);
    if (r.utm_source) {
      if (!utmCounter[r.utm_source]) utmCounter[r.utm_source] = { count: 0, uniqueSet: new Set() };
      utmCounter[r.utm_source].count += 1;
      if (ident) utmCounter[r.utm_source].uniqueSet.add(ident);
    }

    // Funis específicos
    if (r.service === "ia") {
      if (r.event_name === "page_view") iaFunnel.pageView++;
      else if (r.event_name === "ia_upload_start") iaFunnel.uploadStart++;
      else if (r.event_name === "ia_result_view") iaFunnel.resultView++;
      else if (r.event_name === "ia_paywall_view") iaFunnel.paywallView++;
      else if (r.event_name === "ia_upgrade_click") iaFunnel.upgradeClick++;
    }
    if (r.service === "marketplace") {
      if (r.event_name === "page_view") {
        const route = (r.props as any)?.route;
        if (route === "list") mpFunnel.listView++;
        else if (route === "listing_detail") mpFunnel.detailView++;
      } else if (r.event_name === "marketplace_offer_create") mpFunnel.offerCreate++;
      else if (r.event_name === "marketplace_offer_accepted") mpFunnel.offerAccepted++;
      else if (r.event_name === "marketplace_listing_create") mpFunnel.listingCreate++;
    }
  }

  const topService = (Object.keys(byService) as Array<keyof typeof SERVICE_LABEL>)
    .filter((s) => SERVICES.includes(s as any))
    .sort((a, b) => byService[b] - byService[a])[0] as (typeof SERVICES)[number] | undefined;

  return {
    totalEvents: rows.length,
    uniqueUsers: userSet.size,
    loggedUsers: loggedSet.size,
    sessions: sessionSet.size,
    byService,
    topService,
    topEvents: Object.values(eventCounter)
      .map((e) => ({ service: e.service, event_name: e.event_name, count: e.count, uniques: e.uniqueSet.size }))
      .sort((a, b) => b.count - a.count),
    iaFunnel,
    mpFunnel,
    utmSources: Object.entries(utmCounter)
      .map(([source, v]) => ({ source, count: v.count, uniques: v.uniqueSet.size }))
      .sort((a, b) => b.count - a.count),
  };
}
