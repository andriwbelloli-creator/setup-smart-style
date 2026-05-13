import { useEffect, useState } from "react";
import beforeImg from "@/assets/before.jpg";
import afterImg from "@/assets/after.jpg";
import { ArrowLeftRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

type Stats = { total: number; avgBudget: number };

function fmtBRL(v: number): string {
  return v >= 1000 ? `R$ ${(v / 1000).toFixed(1)}k` : `R$ ${v}`;
}

export function AntesDepois() {
  const [pos, setPos] = useState(50);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { count } = await supabase
        .from("setups")
        .select("*", { count: "exact", head: true })
        .eq("status", "published");
      const { data } = await supabase
        .from("setups")
        .select("budget_brl")
        .eq("status", "published");
      const budgets = (data || []).map((r: any) => r.budget_brl).filter(Boolean);
      const avg = budgets.length ? Math.round(budgets.reduce((a, b) => a + b, 0) / budgets.length) : 0;
      if (active) setStats({ total: count ?? 0, avgBudget: avg });
    })().catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="antes-depois" className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-wood/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-wood">
              <ArrowLeftRight className="h-3 w-3" /> Antes & Depois
            </div>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Da bagunça ao{" "}
              <span className="bg-gradient-warm bg-clip-text text-transparent">setup dos sonhos</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Arraste o controle e veja transformações reais da comunidade. As mais virais ganham destaque na home toda semana.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="rounded-2xl bg-card p-4 shadow-soft">
                <div className="font-display text-2xl font-bold text-primary">{stats?.total ?? "—"}</div>
                <div className="text-xs text-muted-foreground">Setups na galeria</div>
              </div>
              <div className="rounded-2xl bg-card p-4 shadow-soft">
                <div className="font-display text-2xl font-bold text-accent">6 lojas</div>
                <div className="text-xs text-muted-foreground">Catálogo BR</div>
              </div>
              <div className="rounded-2xl bg-card p-4 shadow-soft">
                <div className="font-display text-2xl font-bold text-coral">{stats ? fmtBRL(stats.avgBudget) : "—"}</div>
                <div className="text-xs text-muted-foreground">Investimento médio</div>
              </div>
            </div>
            <Link to="/postar" className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-smooth hover:opacity-90">
              Compartilhar minha transformação
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-elegant select-none">
            <div className="relative aspect-[4/3]">
              <img
                src={afterImg}
                alt="Setup depois da transformação"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${pos}%` }}
              >
                <img
                  src={beforeImg}
                  alt="Setup antes da transformação"
                  className="h-full w-full object-cover"
                  style={{ width: `${(100 / pos) * 100}%`, maxWidth: "none" }}
                  loading="lazy"
                />
              </div>
              {/* Slider line */}
              <div
                className="absolute inset-y-0 w-1 -translate-x-1/2 bg-background shadow-elegant"
                style={{ left: `${pos}%` }}
              >
                <div className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background shadow-elegant">
                  <ArrowLeftRight className="h-5 w-5 text-foreground" />
                </div>
              </div>
              {/* Labels */}
              <div className="absolute bottom-4 left-4 rounded-full bg-foreground/90 px-3 py-1 text-xs font-bold text-background backdrop-blur">
                ANTES
              </div>
              <div className="absolute bottom-4 right-4 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                DEPOIS
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={pos}
              onChange={(e) => setPos(Number(e.target.value))}
              className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
              aria-label="Comparar antes e depois"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
