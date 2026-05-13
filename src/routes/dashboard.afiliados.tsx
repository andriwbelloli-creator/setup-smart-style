import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, TrendingUp, MousePointerClick, ShoppingBag, DollarSign } from "lucide-react";

export const Route = createFileRoute("/dashboard/afiliados")({
  head: () => ({ meta: [{ title: "Analytics de Afiliados · HomeOfficeLife" }] }),
  component: AffiliateDashboard,
});

const COMMISSION_RATE: Record<string, number> = {
  amazon_br: 0.04,
  mercado_livre: 0.05,
  kabum: 0.053,
  magalu: 0.04,
  pichau: 0.063,
  outro: 0.03,
};

type Click = {
  id: string;
  product_id: string | null;
  setup_id: string | null;
  store: string;
  clicked_at: string;
};

type Range = "7d" | "30d" | "90d" | "all";

function rangeStart(r: Range): Date | null {
  if (r === "all") return null;
  const days = r === "7d" ? 7 : r === "30d" ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

const STORE_LABEL: Record<string, string> = {
  amazon_br: "Amazon BR",
  mercado_livre: "Mercado Livre",
  kabum: "Kabum",
  magalu: "Magalu",
  pichau: "Pichau",
  outro: "Outro",
};

function AffiliateDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>("30d");
  const [clicks, setClicks] = useState<Click[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, { name: string; price_brl: number; store: string; setup_slug?: string }>>({});
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const start = rangeStart(range);
      let q = supabase.from("affiliate_clicks").select("id, product_id, setup_id, store, clicked_at").order("clicked_at", { ascending: false }).limit(5000);
      if (start) q = q.gte("clicked_at", start.toISOString());
      const { data: clicksData } = await q;
      const list = (clicksData || []) as Click[];
      setClicks(list);

      const productIds = Array.from(new Set(list.map((c) => c.product_id).filter(Boolean) as string[]));
      if (productIds.length > 0) {
        const { data: products } = await supabase
          .from("setup_products")
          .select("id, name, price_brl, store, setup_id, setups(slug)")
          .in("id", productIds);
        const map: Record<string, { name: string; price_brl: number; store: string; setup_slug?: string }> = {};
        for (const p of (products || []) as any[]) {
          map[p.id] = { name: p.name, price_brl: p.price_brl, store: p.store, setup_slug: p.setups?.slug };
        }
        setProductsMap(map);
      }
      setLoading(false);
    })();
  }, [user, range]);

  // Realtime: novos cliques aparecem sem reload
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("affiliate_clicks_live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "affiliate_clicks" },
        async (payload) => {
          const click = payload.new as Click;
          const start = rangeStart(range);
          if (start && new Date(click.clicked_at) < start) return;
          setClicks((prev) => (prev.some((c) => c.id === click.id) ? prev : [click, ...prev]));
          setLiveCount((n) => n + 1);
          if (click.product_id && !productsMap[click.product_id]) {
            const { data } = await supabase
              .from("setup_products")
              .select("id, name, price_brl, store, setup_id, setups(slug)")
              .eq("id", click.product_id)
              .maybeSingle();
            if (data) {
              const d = data as any;
              setProductsMap((prev) => ({
                ...prev,
                [d.id]: { name: d.name, price_brl: d.price_brl, store: d.store, setup_slug: d.setups?.slug },
              }));
            }
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, range, productsMap]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-32 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  const totalClicks = clicks.length;
  const clicksByProduct: Record<string, number> = {};
  const clicksBySetup: Record<string, number> = {};
  // Breakdown por parceiro: cliques, soma de preços dos produtos clicados,
  // comissão média e receita projetada (com conversão estimada).
  const ESTIMATED_CONVERSION = 0.1;
  type StoreRow = { store: string; clicks: number; pricedClicks: number; sumPrice: number; revenue: number };
  const byStore: Record<string, StoreRow> = {};
  for (const c of clicks) {
    if (c.product_id) clicksByProduct[c.product_id] = (clicksByProduct[c.product_id] || 0) + 1;
    if (c.setup_id) clicksBySetup[c.setup_id] = (clicksBySetup[c.setup_id] || 0) + 1;
    const p = c.product_id ? productsMap[c.product_id] : null;
    // O store de um clique pode ser diferente do produto (raro, mas possível). Usa o do produto se existir.
    const storeKey = p?.store ?? c.store;
    if (!byStore[storeKey]) byStore[storeKey] = { store: storeKey, clicks: 0, pricedClicks: 0, sumPrice: 0, revenue: 0 };
    byStore[storeKey].clicks += 1;
    if (p) {
      const commission = COMMISSION_RATE[p.store] ?? 0.04;
      byStore[storeKey].pricedClicks += 1;
      byStore[storeKey].sumPrice += p.price_brl;
      byStore[storeKey].revenue += p.price_brl * commission * ESTIMATED_CONVERSION;
    }
  }
  const projectedRevenue = Object.values(byStore).reduce((s, r) => s + r.revenue, 0);
  const storesRanked = Object.values(byStore).sort((a, b) => b.revenue - a.revenue || b.clicks - a.clicks);

  const topProducts = Object.entries(clicksByProduct)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id, count]) => ({ id, count, info: productsMap[id] }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Analytics de Afiliados</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>Tempo real{liveCount > 0 ? ` · ${liveCount} clique${liveCount !== 1 ? "s" : ""} desde que abriu` : ""}</span>
            </p>
          </div>
          <div className="flex gap-2 rounded-full bg-card p-1 shadow-soft">
            {(["7d", "30d", "90d", "all"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-smooth ${range === r ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
              >
                {r === "7d" ? "7 dias" : r === "30d" ? "30 dias" : r === "90d" ? "90 dias" : "Tudo"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat icon={MousePointerClick} label="Cliques" value={totalClicks.toString()} />
              <Stat icon={ShoppingBag} label="Produtos únicos clicados" value={Object.keys(clicksByProduct).length.toString()} />
              <Stat icon={TrendingUp} label="Setups que geraram cliques" value={Object.keys(clicksBySetup).length.toString()} />
              <Stat icon={DollarSign} label="Receita projetada" value={`R$ ${projectedRevenue.toFixed(2)}`} hint="conversão estimada 10%" />
            </div>

            <div className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-bold">Receita por parceiro</h2>
                  <p className="text-xs text-muted-foreground">Quebra de R$ por loja · conversão estimada {Math.round(ESTIMATED_CONVERSION * 100)}%</p>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Total combinado</div>
                  <div className="font-display text-xl font-bold">R$ {projectedRevenue.toFixed(2)}</div>
                </div>
              </div>
              {storesRanked.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">Sem cliques no período.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <tr className="border-b border-border">
                        <th className="py-2 pr-3">Parceiro</th>
                        <th className="py-2 pr-3">Cliques</th>
                        <th className="py-2 pr-3">Ticket médio</th>
                        <th className="py-2 pr-3">Comissão</th>
                        <th className="py-2 pr-3 text-right">Receita projetada</th>
                        <th className="py-2 pr-3 text-right">% do total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storesRanked.map((s) => {
                        const ticketAvg = s.pricedClicks > 0 ? s.sumPrice / s.pricedClicks : 0;
                        const commissionPct = (COMMISSION_RATE[s.store] ?? 0.04) * 100;
                        const sharePct = projectedRevenue > 0 ? (s.revenue / projectedRevenue) * 100 : 0;
                        return (
                          <tr key={s.store} className="border-b border-border/40 last:border-0">
                            <td className="py-3 pr-3 font-semibold">{STORE_LABEL[s.store] ?? s.store}</td>
                            <td className="py-3 pr-3">{s.clicks}</td>
                            <td className="py-3 pr-3">{ticketAvg > 0 ? `R$ ${ticketAvg.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}` : "—"}</td>
                            <td className="py-3 pr-3">{commissionPct.toFixed(1)}%</td>
                            <td className="py-3 pr-3 text-right font-bold">R$ {s.revenue.toFixed(2)}</td>
                            <td className="py-3 pr-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-xs text-muted-foreground">{sharePct.toFixed(0)}%</span>
                                <div className="h-2 w-16 overflow-hidden rounded-full bg-secondary">
                                  <div className="h-full bg-gradient-hero" style={{ width: `${sharePct}%` }} />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <h2 className="font-display text-lg font-bold">Cliques por loja</h2>
                {storesRanked.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">Sem cliques no período.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {storesRanked.map((s) => {
                      const pct = totalClicks > 0 ? (s.clicks / totalClicks) * 100 : 0;
                      return (
                        <div key={s.store}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="font-semibold">{STORE_LABEL[s.store] ?? s.store}</span>
                            <span className="text-muted-foreground">{s.clicks} clique{s.clicks !== 1 ? "s" : ""} · {pct.toFixed(0)}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-secondary">
                            <div className="h-full bg-gradient-hero" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <h2 className="font-display text-lg font-bold">Top 10 produtos mais clicados</h2>
                {topProducts.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">Sem cliques no período.</p>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {topProducts.map(({ id, count, info }) => (
                      <li key={id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3 text-sm">
                        <div className="min-w-0">
                          <div className="truncate font-semibold">{info?.name || id.slice(0, 8)}</div>
                          <div className="text-xs text-muted-foreground">
                            {info?.store || "—"} · R$ {info?.price_brl?.toLocaleString("pt-BR") ?? "—"}
                            {info?.setup_slug ? (
                              <> · <Link to="/setup/$slug" params={{ slug: info.setup_slug }} className="text-primary hover:underline">ver setup</Link></>
                            ) : null}
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full bg-foreground/5 px-3 py-1 text-xs font-bold">{count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <p className="mt-8 text-xs text-muted-foreground">
              Receita projetada é uma estimativa baseada em taxas de comissão médias por loja (Amazon 4%, ML 5%, Kabum 5,3%, Magalu 4%, Pichau 6,3%) e uma taxa de conversão estimada de 10% dos cliques em vendas confirmadas. Valor real chega via relatórios de cada plataforma de afiliados.
            </p>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint }: { icon: typeof MousePointerClick; label: string; value: string; hint?: string }) {
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
