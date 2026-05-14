import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, AlertCircle, ArrowLeft, Crown, Sparkles, CheckCircle2,
  AlertTriangle, ShoppingBag, ExternalLink, Info,
} from "lucide-react";
import type {
  Touchpoint, NotRecommendedTouchpoint, Priority, ClaudeResult, RecommendedProduct,
} from "@/types/homeoffice-analysis";

export const Route = createFileRoute("/diagnostico/resultado/$id")({
  head: () => ({
    meta: [
      { title: "Sua análise · Diagnóstico · home office live" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResultadoAnalise,
});

type AnalysisRow = {
  id: string;
  user_id: string;
  image_url: string;
  status: string;
  analysis_type: "free" | "premium";
  profile_type: string;
  overall_score: number | null;
  ergonomics_score: number | null;
  lighting_score: number | null;
  organization_score: number | null;
  cable_management_score: number | null;
  decoration_score: number | null;
  video_background_score: number | null;
  acoustic_score: number | null;
  productivity_score: number | null;
  final_result: any;
  claude_result: ClaudeResult | null;
  error_message: string | null;
  created_at: string;
};

type TouchpointRow = Touchpoint & { id: string; analysis_id: string };

function ResultadoAnalise() {
  const { id } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisRow | null>(null);
  const [touchpoints, setTouchpoints] = useState<TouchpointRow[]>([]);
  const [notRecommended, setNotRecommended] = useState<NotRecommendedTouchpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    setLoading(true);
    (async () => {
      try {
        const { data: a, error: aErr } = await supabase
          .from("analyses" as any)
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (aErr) throw aErr;
        if (!a) {
          setError("Análise não encontrada");
          setLoading(false);
          return;
        }
        setAnalysis(a as unknown as AnalysisRow);

        const { data: tps } = await supabase
          .from("touchpoints" as any)
          .select("*")
          .eq("analysis_id", id);
        const all = (tps as any[]) || [];
        setTouchpoints(all.filter((t) => t.is_recommended) as TouchpointRow[]);
        setNotRecommended(
          all
            .filter((t) => !t.is_recommended)
            .map((t) => ({
              item: t.item,
              is_recommended: false as const,
              reason: t.not_recommended_reason || "Não aplicável a este setup.",
            })),
        );
      } catch (e: any) {
        setError(e.message || "Erro ao carregar análise");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" className="container mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
          {/* Loading com skeleton — percepção de velocidade */}
          <div className="skeleton mb-6 h-4 w-32" />
          <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
            <div className="skeleton aspect-[4/3] w-full rounded-3xl" />
            <div className="space-y-4">
              <div className="skeleton h-40 w-full rounded-3xl" />
              <div className="skeleton h-64 w-full rounded-3xl" />
            </div>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-56 w-full rounded-3xl" />
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-muted-foreground" role="status" aria-live="polite">
            Analisando ergonomia, iluminação, cabos e decoração...
          </p>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-24 text-center">
          <h1 className="font-display text-3xl font-bold">Login necessário</h1>
          <p className="mt-2 text-muted-foreground">Entre na sua conta pra ver a análise.</p>
          <Button asChild className="mt-6"><Link to="/auth">Entrar</Link></Button>
        </main>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto max-w-2xl px-4 py-24 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 font-display text-2xl font-bold">
            Não conseguimos concluir a análise agora.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tente novamente com uma imagem mais nítida e bem iluminada.
          </p>
          {error && <p className="mt-1 text-xs text-muted-foreground/70">{error}</p>}
          <Button asChild className="mt-6"><Link to="/diagnostico">Nova análise</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (analysis.status === "failed") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto max-w-2xl px-4 py-24 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 font-display text-2xl font-bold">Análise falhou</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {analysis.error_message || "Erro inesperado."}
          </p>
          <Button asChild className="mt-6"><Link to="/diagnostico">Tentar de novo</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  const overall = analysis.overall_score ?? 0;
  const claude: ClaudeResult | null = analysis.claude_result;
  const isPremium = analysis.analysis_type === "premium";
  const claudeFailed = analysis.final_result?.claude_failed === true;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10 md:px-6 md:py-14">
        <Link to="/diagnostico" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Nova análise
        </Link>

        <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
          {/* Imagem analisada. Skip se for placeholder de upload base64. */}
          {analysis.image_url && !analysis.image_url.startsWith("data:") ? (
            <div className="rounded-3xl border border-border bg-card shadow-elegant overflow-hidden">
              <img src={analysis.image_url} alt="Setup analisado" className="w-full object-cover" />
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 p-8 text-center">
              <p className="text-xs text-muted-foreground">
                Imagem analisada localmente — não foi armazenada no servidor pra privacidade.
              </p>
            </div>
          )}

          {/* Score geral */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-border bg-gradient-mesh p-6">
              <div className="text-xs font-bold uppercase tracking-wider text-primary">
                Nota geral · perfil {analysis.profile_type}
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-6xl font-bold tracking-tight">{Math.round(overall)}</span>
                <span className="text-2xl font-semibold text-muted-foreground">/ 100</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Seu setup recebeu nota <strong className="text-foreground">{Math.round(overall)}/100</strong>
                {" "}com base em {touchpoints.length} pontos analisados.
              </p>
            </div>

            <ScoresGrid analysis={analysis} />
          </div>
        </div>

        {/* Banner Claude failed (premium degradado) */}
        {isPremium && claudeFailed && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900/50 dark:bg-amber-950/30">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-700" />
            <div>
              A análise consultiva premium ficou temporariamente indisponível.
              Sua análise técnica completa está abaixo. Tente recarregar em
              alguns minutos pra ver a versão consultiva.
            </div>
          </div>
        )}

        {/* Resumo consultivo (premium) */}
        {claude && (
          <section className="mt-10 rounded-3xl border border-primary/30 bg-primary/5 p-6 md:p-8">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <Crown className="h-3 w-3" /> Análise premium
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold leading-tight md:text-3xl">
              {claude.resumo_consultivo}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              {claude.diagnostico_geral}
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {claude.principais_forcas?.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-4">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> Pontos fortes
                  </h3>
                  <ul className="space-y-1 text-sm">
                    {claude.principais_forcas.map((f, i) => <li key={i}>• {f}</li>)}
                  </ul>
                </div>
              )}
              {claude.principais_problemas?.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-4">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-700">
                    <AlertTriangle className="h-4 w-4" /> Problemas principais
                  </h3>
                  <ul className="space-y-1 text-sm">
                    {claude.principais_problemas.map((p, i) => <li key={i}>• {p}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {claude.plano_de_acao?.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-4 font-display text-lg font-bold">Plano de ação</h3>
                <ol className="space-y-3">
                  {claude.plano_de_acao.map((step) => (
                    <li key={step.ordem} className="flex gap-3 rounded-2xl border border-border bg-card p-4">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background">
                        {step.ordem}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          {step.acao}
                          <PriorityBadge p={step.prioridade} />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{step.motivo}</p>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs">
                          <span className="text-muted-foreground">
                            <strong className="text-foreground">Impacto:</strong> {step.impacto_esperado}
                          </span>
                          <span className="text-muted-foreground">
                            <strong className="text-foreground">Investimento:</strong> {step.investimento_estimado}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {claude.mensagem_final && (
              <p className="mt-6 border-t border-border/40 pt-6 text-sm italic text-muted-foreground">
                {claude.mensagem_final}
              </p>
            )}
          </section>
        )}

        {/* Touchpoints recomendados */}
        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold md:text-3xl">
                Pontos pra evoluir <span className="text-muted-foreground">({touchpoints.length})</span>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Recomendações com evidência visual. Ordenadas por prioridade.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {touchpoints.map((t) => <TouchpointCard key={t.id} t={t} />)}
          </div>
        </section>

        {/* Não recomendados (transparência) */}
        {notRecommended.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-lg font-bold">O que NÃO recomendamos pra você</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Itens que outros sites sugeririam, mas que pra seu caso não fazem sentido.
            </p>
            <ul className="mt-4 space-y-2">
              {notRecommended.map((t, i) => (
                <li key={i} className="rounded-xl border border-border bg-card/60 p-3 text-sm">
                  <strong className="text-foreground">{labelize(t.item)}:</strong>{" "}
                  <span className="text-muted-foreground">{t.reason}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CTA Premium */}
        <section className="mt-12">
          {!isPremium ? (
            <div className="rounded-3xl border border-primary/30 bg-gradient-hero p-6 text-primary-foreground md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <Sparkles className="h-5 w-5" />
                  <h3 className="mt-2 font-display text-xl font-bold md:text-2xl">
                    Desbloquear análise premium com plano de ação completo
                  </h3>
                  <p className="mt-1 text-sm opacity-90">
                    Consultoria escrita por IA especialista, plano de ação ordenado,
                    recomendação adaptada ao seu perfil profissional.
                  </p>
                </div>
                <Button asChild variant="secondary" size="lg">
                  <Link to="/premium">Conhecer Premium</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
              <h3 className="font-display text-xl font-bold">Próximo passo</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Veja produtos recomendados pra cada touchpoint na lista de compras.
              </p>
              <Button asChild className="mt-4 gap-2">
                <Link to="/marketplace">
                  <ShoppingBag className="h-4 w-4" /> Ver lista de compras recomendada
                </Link>
              </Button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

// ===== Componentes internos =====

function ScoresGrid({ analysis }: { analysis: AnalysisRow }) {
  const rows: { label: string; value: number | null }[] = [
    { label: "Ergonomia", value: analysis.ergonomics_score },
    { label: "Iluminação", value: analysis.lighting_score },
    { label: "Organização", value: analysis.organization_score },
    { label: "Cabos", value: analysis.cable_management_score },
    { label: "Decoração", value: analysis.decoration_score },
    { label: "Fundo videochamada", value: analysis.video_background_score },
    { label: "Acústica", value: analysis.acoustic_score },
    { label: "Produtividade", value: analysis.productivity_score },
  ];
  return (
    <div className="rounded-3xl border border-border bg-card p-4">
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Notas por critério
      </div>
      <ul className="mt-3 space-y-2">
        {rows.map((r) => {
          const v = r.value ?? 0;
          const color = v >= 80 ? "bg-emerald-500" : v >= 60 ? "bg-amber-500" : "bg-rose-500";
          return (
            <li key={r.label} className="flex items-center gap-3 text-xs">
              <span className="w-32 flex-shrink-0">{r.label}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <div className={`h-full ${color} transition-all`} style={{ width: `${Math.min(100, v)}%` }} />
              </div>
              <span className="w-8 text-right font-semibold tabular-nums">{Math.round(v)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PriorityBadge({ p }: { p: Priority }) {
  const cls =
    p === "high" ? "bg-rose-100 text-rose-800 border-rose-200" :
    p === "medium" ? "bg-amber-100 text-amber-800 border-amber-200" :
    "bg-slate-100 text-slate-700 border-slate-200";
  const label = p === "high" ? "Alta" : p === "medium" ? "Média" : "Baixa";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  );
}

function TouchpointCard({ t }: { t: TouchpointRow }) {
  return (
    <article className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-5 shadow-soft">
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {labelize(t.category)}
          </div>
          <h3 className="font-display text-lg font-bold leading-tight">{labelize(t.item)}</h3>
        </div>
        <div className="flex flex-col items-end gap-1">
          <PriorityBadge p={t.priority} />
          <span className="text-[10px] text-muted-foreground">{Math.round(t.confidence)}% conf.</span>
        </div>
      </header>

      <p className="text-xs italic text-muted-foreground">"{t.visual_evidence}"</p>

      <dl className="space-y-2 text-sm">
        <Field label="Problema" value={t.problem} />
        <Field label="Impacto" value={t.impact} />
        <Field label="Recomendação" value={t.recommendation} />
      </dl>

      <footer className="mt-auto flex flex-wrap items-center gap-2 border-t border-border/40 pt-3 text-xs">
        <span className="font-semibold text-foreground">{t.estimated_budget}</span>
        <span className="text-muted-foreground">·</span>
        <div className="flex flex-wrap gap-1">
          {t.partners.slice(0, 3).map((slug) => (
            <span key={slug} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium">
              {prettyPartner(slug)}
            </span>
          ))}
        </div>
      </footer>

      {/* Product Matching: cards de produtos recomendados, clique vai por
          track-product-click pra registrar antes de redirecionar. */}
      {t.recommended_products && t.recommended_products.length > 0 && (
        <div className="mt-2 space-y-2 border-t border-border/40 pt-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Produtos recomendados
          </h4>
          {t.recommended_products.map((p) => (
            <ProductCard
              key={p.id || p.product_name}
              product={p}
              touchpointId={t.id}
              analysisId={t.analysis_id}
            />
          ))}
        </div>
      )}
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-sm leading-snug">{value}</dd>
    </div>
  );
}

function ProductCard({
  product,
  touchpointId,
  analysisId,
}: {
  product: RecommendedProduct;
  touchpointId?: string;
  analysisId?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      // Abre a aba ANTES da chamada async — alguns navegadores bloqueiam
      // window.open chamado em callback de promise (popup blocker).
      const win = window.open("", "_blank", "noopener,noreferrer");
      const { data, error } = await supabase.functions.invoke("track-product-click", {
        body: {
          product_id: product.id,
          analysis_id: analysisId,
          touchpoint_id: touchpointId,
          source: "analysis_result",
        },
      });
      if (error || !data?.destination_url) {
        // Fallback: usa URL que veio do backend ao montar a página (já validada lá).
        // NUNCA usa URL arbitrária do client.
        if (win) {
          win.location.href = product.url;
        } else {
          window.location.href = product.url;
        }
        return;
      }
      if (win) {
        win.location.href = data.destination_url;
      } else {
        window.location.href = data.destination_url;
      }
    } catch (err) {
      console.warn("track-product-click:", err);
      toast.error("Não conseguimos abrir o produto agora. Tenta de novo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex w-full items-center gap-2 rounded-xl border border-border p-2 text-left text-xs transition-smooth hover:border-primary hover:bg-primary/5 disabled:opacity-60"
    >
      {product.image_url && (
        <img src={product.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">{product.product_name}</div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <span>{product.partner_name}</span>
          {(product.price_range || product.price) && (
            <>
              <span>·</span>
              <span>{product.price_range || `R$ ${product.price}`}</span>
            </>
          )}
          {product.is_affiliate && (
            <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
              afiliado
            </span>
          )}
        </div>
        {product.reason && (
          <div className="mt-1 line-clamp-2 italic text-muted-foreground/80">"{product.reason}"</div>
        )}
      </div>
      <ExternalLink className={`h-3.5 w-3.5 flex-shrink-0 text-muted-foreground ${loading ? "animate-pulse" : ""}`} />
    </button>
  );
}

// ===== Helpers =====

function labelize(s: string): string {
  return s
    .replace(/_/g, " ")
    .replace(/\b(\w)/g, (m) => m.toUpperCase());
}

const PARTNER_NAMES: Record<string, string> = {
  tokstok: "Tok&Stok",
  madeira_madeira: "MadeiraMadeira",
  mobly: "Mobly",
  leroy_merlin: "Leroy Merlin",
  amazon_br: "Amazon",
  mercado_livre: "Mercado Livre",
  kalunga: "Kalunga",
  shopee: "Shopee",
  magalu: "Magalu",
  cobasi: "Cobasi",
  petz: "Petz",
};

function prettyPartner(slug: string): string {
  return PARTNER_NAMES[slug] || slug;
}
