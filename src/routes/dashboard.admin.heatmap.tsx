import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, MousePointer, BarChart3, ScrollText } from "lucide-react";

export const Route = createFileRoute("/dashboard/admin/heatmap")({
  head: () => ({
    meta: [
      { title: "Heatmap · Admin · home office live" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminHeatmap,
});

type ClickEvent = {
  id: string;
  created_at: string;
  props: {
    path?: string;
    x_norm?: number;
    y_norm?: number;
    vw?: number;
    vh?: number;
    tag?: string;
    action?: string;
  } | null;
};

type ScrollEvent = {
  id: string;
  created_at: string;
  props: { path?: string; bucket?: number } | null;
};

type Range = "24h" | "7d" | "30d";

const RANGE_MS: Record<Range, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

function AdminHeatmap() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  const [range, setRange] = useState<Range>("7d");
  const [path, setPath] = useState<string>("/");
  const [pageOptions, setPageOptions] = useState<string[]>([]);
  const [clicks, setClicks] = useState<ClickEvent[]>([]);
  const [scrolls, setScrolls] = useState<ScrollEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Pagina opções vêm dos próprios eventos
  useEffect(() => {
    if (!isAdmin) return;
    const since = new Date(Date.now() - RANGE_MS[range]).toISOString();
    (async () => {
      const { data } = await supabase
        .from("analytics_events" as any)
        .select("props")
        .eq("event_name", "heatmap_click")
        .gte("created_at", since)
        .limit(10000);
      const set = new Set<string>();
      ((data as any[]) || []).forEach((r) => {
        const p = (r?.props as any)?.path;
        if (typeof p === "string") set.add(p);
      });
      const list = Array.from(set).sort();
      setPageOptions(list);
      if (list.length > 0 && !list.includes(path)) setPath(list[0]);
    })();
  }, [isAdmin, range]);

  // Busca cliques e scroll da página selecionada
  useEffect(() => {
    if (!isAdmin || !path) return;
    setLoading(true);
    const since = new Date(Date.now() - RANGE_MS[range]).toISOString();
    (async () => {
      const [clicksRes, scrollRes] = await Promise.all([
        supabase
          .from("analytics_events" as any)
          .select("id, created_at, props")
          .eq("event_name", "heatmap_click")
          .gte("created_at", since)
          .limit(5000),
        supabase
          .from("analytics_events" as any)
          .select("id, created_at, props")
          .eq("event_name", "scroll_depth")
          .gte("created_at", since)
          .limit(5000),
      ]);

      const cs = ((clicksRes.data as any[]) || []).filter(
        (r) => (r?.props as any)?.path === path,
      ) as ClickEvent[];
      const ss = ((scrollRes.data as any[]) || []).filter(
        (r) => (r?.props as any)?.path === path,
      ) as ScrollEvent[];
      setClicks(cs);
      setScrolls(ss);
      setLoading(false);
    })();
  }, [isAdmin, path, range]);

  // Renderiza o heatmap no canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.clientWidth;
    const h = Math.max(400, Math.round(w * 0.6));
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // Background grid sutil
    ctx.fillStyle = "rgba(0,0,0,0.02)";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo((i * w) / 10, 0);
      ctx.lineTo((i * w) / 10, h);
      ctx.stroke();
    }
    for (let i = 1; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (i * h) / 6);
      ctx.lineTo(w, (i * h) / 6);
      ctx.stroke();
    }

    // Pontos
    for (const c of clicks) {
      const x = (c.props?.x_norm ?? 0) * w;
      const y = (c.props?.y_norm ?? 0) * h;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, 24);
      grad.addColorStop(0, "rgba(243,100,88,0.45)");
      grad.addColorStop(1, "rgba(243,100,88,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, 24, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [clicks]);

  const scrollAgg = useMemo(() => {
    const counts: Record<number, number> = { 25: 0, 50: 0, 75: 0, 100: 0 };
    for (const s of scrolls) {
      const b = s.props?.bucket;
      if (b && counts[b] !== undefined) counts[b]++;
    }
    return counts;
  }, [scrolls]);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-32 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-32 text-center">
          <h1 className="font-display text-3xl font-bold">Acesso restrito</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta página é só para admins.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Voltar para o início</Link>
          </Button>
        </main>
        <Footer />
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
          <ArrowLeft className="h-4 w-4" /> Voltar ao painel admin
        </Link>

        <div className="mb-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Mapa de calor
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Cliques + profundidade de scroll por página. Dados anonimizados,
              só visíveis pra admins.
            </p>
          </div>

          <div className="flex gap-2">
            {(["24h", "7d", "30d"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-smooth ${
                  range === r
                    ? "bg-foreground text-background"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {pageOptions.length === 0 && (
            <span className="text-sm text-muted-foreground">
              Nenhuma página com dados ainda. Aguarde alguns cliques nos próximos minutos.
            </span>
          )}
          {pageOptions.map((p) => (
            <button
              key={p}
              onClick={() => setPath(p)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-smooth ${
                path === p
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <MousePointer className="h-4 w-4" /> Cliques em {path || "—"}
              </h2>
              <span className="text-xs text-muted-foreground">
                {loading ? "carregando…" : `${clicks.length} eventos`}
              </span>
            </div>
            <canvas
              ref={canvasRef}
              className="block w-full rounded-xl border border-border/60 bg-background"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Coordenadas normalizadas (0–1). Eixos diferentes de viewports são
              alinhados pra comparação direta. Cor = densidade de cliques.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 font-semibold">
                <ScrollText className="h-4 w-4" /> Profundidade de scroll
              </h2>
              <ul className="space-y-3">
                {[25, 50, 75, 100].map((b) => (
                  <li key={b}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-semibold">{b}%</span>
                      <span className="text-muted-foreground">{scrollAgg[b]} sessões</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${
                            Math.max(...Object.values(scrollAgg)) > 0
                              ? (scrollAgg[b] / Math.max(...Object.values(scrollAgg))) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 font-semibold">
                <BarChart3 className="h-4 w-4" /> Top elementos clicados
              </h2>
              <TopActions clicks={clicks} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function TopActions({ clicks }: { clicks: ClickEvent[] }) {
  const counts: Record<string, number> = {};
  for (const c of clicks) {
    const key = c.props?.action || c.props?.tag || "—";
    counts[key] = (counts[key] || 0) + 1;
  }
  const top = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  if (top.length === 0) {
    return <p className="text-sm text-muted-foreground">Sem dados ainda.</p>;
  }
  return (
    <ul className="space-y-2">
      {top.map(([k, v]) => (
        <li key={k} className="flex items-center justify-between text-sm">
          <span className="truncate font-mono text-xs">{k}</span>
          <span className="ml-2 shrink-0 font-semibold">{v}</span>
        </li>
      ))}
    </ul>
  );
}
