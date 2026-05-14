import { useEffect, useRef, useState } from "react";
import { Upload, Activity, Lightbulb, Cable, Layout, Sparkles, Armchair, RotateCcw, Crown, Lock, LogIn, Share2, ExternalLink, Monitor } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { track } from "@/lib/track";
import { toast } from "sonner";

// Estratégia freemium: 3 análises lifetime no plano gratuito.
// Tentativa 1 = prova de valor (aha moment)
// Tentativa 2 = engajamento (testa melhorias sugeridas)
// Tentativa 3 = hábito formado, vê evolução
// Tentativa 4 = paywall com usuário já convencido
const FREE_ANALYSES_LIFETIME = 3;

type Crit = { icon: typeof Upload; label: string; score: number; tip: string; color: string };

const baseCriterios: Crit[] = [
  { icon: Armchair, label: "Ergonomia", score: 8.5, color: "text-primary", tip: "Monitor está na altura dos olhos. Bom!" },
  { icon: Lightbulb, label: "Iluminação", score: 9.2, color: "text-accent", tip: "Luz natural lateral excelente, evita reflexo." },
  { icon: Cable, label: "Cabos", score: 6.8, color: "text-coral", tip: "Cabos visíveis. Use canaleta adesiva (~R$ 35 ML)." },
  { icon: Layout, label: "Organização", score: 8.0, color: "text-primary", tip: "Mesa limpa. Adicione um organizador de canetas." },
  { icon: Sparkles, label: "Estética", score: 9.4, color: "text-accent", tip: "Paleta coesa, ótimo equilíbrio visual." },
  { icon: Activity, label: "Produtividade", score: 7.9, color: "text-primary", tip: "Adicione segundo monitor pra +15% de eficiência." },
];

const SCORE_KEY_MAP: Record<string, string> = {
  Ergonomia: "ergonomia",
  Iluminação: "iluminacao",
  Cabos: "cabos",
  Organização: "organizacao",
  Estética: "estetica",
  Produtividade: "produtividade",
};

// Cada tip da IA vem com category (ergonomia/iluminacao/etc) e severidade.
// Mapa pra termo de busca + label do produto típico que resolve o problema.
// Link aponta pra Amazon BR com tag de afiliado deskly02-20.
const AFFILIATE_TAG = "deskly02-20";
const PRODUCT_HINT: Record<string, { label: string; query: string; Icon: typeof Armchair }> = {
  ergonomia: { label: "Cadeira ergonômica home office", query: "cadeira ergonomica home office", Icon: Armchair },
  iluminacao: { label: "Luminária de mesa LED com regulagem", query: "luminaria mesa LED escritorio", Icon: Lightbulb },
  cabos: { label: "Kit organizador de cabos", query: "organizador de cabos mesa", Icon: Cable },
  organizacao: { label: "Organizador de mesa", query: "organizador mesa escritorio", Icon: Layout },
  estetica: { label: "Decoração de home office", query: "decoracao home office quadros plantas", Icon: Sparkles },
  produtividade: { label: "Monitor 24-27 polegadas Full HD", query: "monitor 24 polegadas full hd", Icon: Monitor },
};

function productHintFor(category: string) {
  const hint = PRODUCT_HINT[category.toLowerCase()];
  if (!hint) return null;
  const url = `https://www.amazon.com.br/s?k=${encodeURIComponent(hint.query)}&tag=${AFFILIATE_TAG}`;
  return { ...hint, url };
}

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export function AnaliseIA() {
  const [preview, setPreview] = useState<string | null>(null);
  const [criterios, setCriterios] = useState<Crit[]>(baseCriterios);
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);
  // Paywall suave: armazenamos TODAS as tips, mas só revelamos as 3 piores
  // pro free. Premium destrava o restante + lista de compras detalhada.
  const [allTips, setAllTips] = useState<Array<{ category: string; severity: string; text: string }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const subscription = useSubscription();
  const navigate = useNavigate();
  const [limitReached, setLimitReached] = useState(false);
  const [usedAnalyses, setUsedAnalyses] = useState(0);
  // Estratégia "curiosity gap": usuário deslogado pode subir foto,
  // ver preview, esperar análise — mas resultados ficam borrados
  // com CTA de login. Maior conversão de signup que pedir auth antes.
  const [needsLoginToSeeResults, setNeedsLoginToSeeResults] = useState(false);
  // Guardamos o data URL pra disparar a "análise detalhada" (pipeline novo
  // com touchpoints + produtos) sem ter que subir a foto de novo.
  const [lastDataUrl, setLastDataUrl] = useState<string | null>(null);
  const [deepLoading, setDeepLoading] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx 10MB).");
      return;
    }
    track("ia_upload_start", "ia", { size_kb: Math.round(file.size / 1024), is_anon: !user });

    // ANONYMOUS PATH: deixa o user ver o preview + fake loading +
    // resultado borrado. Converte muito mais que bloquear no clique.
    if (!user) {
      setPreview(URL.createObjectURL(file));
      setLoading(true);
      setAnalyzed(false);
      setAiTip(null);
      setNeedsLoginToSeeResults(false);
      // Simula análise (~2.5s) — sensação realista. NÃO chama API real.
      await new Promise((r) => setTimeout(r, 2500));
      setLoading(false);
      setNeedsLoginToSeeResults(true);
      // Score fake otimista pra teaser ("8.4" + critérios fictícios)
      setCriterios(baseCriterios.map((c) => ({ ...c, score: +(7 + Math.random() * 2.4).toFixed(1) })));
      setAnalyzed(true);
      setAiTip("Para ver as sugestões personalizadas da IA e a nota detalhada, faça login grátis (3 análises lifetime).");
      track("ia_blurred_teaser_shown", "ia", { variant: "anon_curiosity_gap" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx 10MB).");
      return;
    }
    // Free tier: 3 análises lifetime. Premium/Pro: ilimitado.
    if (!subscription.canUse("unlimited_analysis")) {
      const { count } = await supabase
        .from("ai_analyses")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", user.id);
      const used = count ?? 0;
      setUsedAnalyses(used);
      if (used >= FREE_ANALYSES_LIFETIME) {
        setLimitReached(true);
        track("ia_paywall_view", "ia", { source: "analyze_limit", analyses_used: used });
        // registra evento pra funil de recovery (não bloqueia UI)
        supabase
          .from("paywall_events")
          .insert({ user_id: user.id, source: "analyze_limit", analyses_used: used })
          .then(({ error: ev }) => {
            if (ev) console.warn("paywall_events insert:", ev.message);
            // grava localStorage também (pro banner de recovery funcionar
            // mesmo sem o evento persistido — failsafe)
            try {
              localStorage.setItem("deskly:paywall_hit_at", new Date().toISOString());
            } catch {}
          });
        return;
      }
    }
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setAnalyzed(false);
    setAiTip(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      setLastDataUrl(dataUrl);
      const { data, error } = await supabase.functions.invoke("analyze-setup", {
        body: { imageBase64: dataUrl },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const next = baseCriterios.map((c) => {
        const key = SCORE_KEY_MAP[c.label];
        const score = Number(data.scores?.[key]);
        const tipObj = (data.tips as Array<{ category: string; text: string }>)?.find(
          (t) => t.category === key,
        );
        return {
          ...c,
          score: Number.isFinite(score) ? +score.toFixed(1) : c.score,
          tip: tipObj?.text ?? c.tip,
        };
      });
      setCriterios(next);
      const overallTipObj = (data.tips as Array<{ severity: string; text: string }>)?.find(
        (t) => t.severity === "alta",
      ) ?? data.tips?.[0];
      setAiTip(overallTipObj?.text ?? data.summary ?? null);
      setAllTips((data.tips as Array<{ category: string; severity: string; text: string }>) ?? []);
      setAnalyzed(true);
      track("ia_result_view", "ia", {
        overall: data.overall,
        analyses_used_after: usedAnalyses + 1,
        tier: subscription.tier,
      });

      // persist analysis (fire-and-forget, don't block UI)
      supabase
        .from("ai_analyses")
        .insert({
          owner_id: user.id,
          scores: data.scores,
          tips: data.tips,
          overall_score: data.overall,
        })
        .then(({ error: persistErr }) => {
          if (persistErr) console.warn("ai_analyses persist failed:", persistErr.message);
        });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao analisar imagem";
      toast.error(msg);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setAnalyzed(false);
    setCriterios(baseCriterios);
    setAiTip(null);
    setAllTips([]);
    setNeedsLoginToSeeResults(false);
    setLastDataUrl(null);
  };

  // Análise detalhada: dispara o pipeline novo (Gemini Vision + motor
  // de regras + product matching) e navega pra /diagnostico/resultado/{id}.
  // É OPCIONAL — o usuário pode ficar só com o resultado inline.
  const runDeepAnalysis = async () => {
    if (!lastDataUrl || !user || deepLoading) return;
    setDeepLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-homeoffice-image", {
        body: {
          image_base64: lastDataUrl,
          analysis_type: subscription.canUse("unlimited_analysis") ? "premium" : "free",
          profile_type: "geral",
        },
      });
      if (error) throw error;
      if (data?.error || !data?.analysis_id) {
        throw new Error(data?.error || "Sem analysis_id na resposta");
      }
      track("ia_deep_analysis_click", "ia", {
        tier: subscription.tier,
        touchpoints_count: data.touchpoints_recomendados?.length ?? 0,
      });
      navigate({ to: "/diagnostico/resultado/$id", params: { id: data.analysis_id } });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao gerar análise detalhada";
      console.warn("deep analysis:", e);
      toast.error(msg);
    } finally {
      setDeepLoading(false);
    }
  };

  // Compartilhar a nota: Web Share API nativa em mobile, clipboard em desktop.
  // Pré-popula texto pra ser viral ("Meu home office tirou nota 8.5/10 na
  // IA do HomeOfficeLife! 🤖"). Não gera OG image dinâmica ainda — a OG
  // padrão da home aparece nos links compartilhados.
  const shareScore = async () => {
    const overall = +(criterios.reduce((a, c) => a + c.score, 0) / criterios.length).toFixed(1);
    const worstCat = [...criterios].sort((a, b) => a.score - b.score)[0];
    const url = "https://homeofficelife.com.br/diagnostico";
    const text = `Meu home office tirou nota ${overall}/10 na IA do HomeOfficeLife! 🤖\nPonto fraco: ${worstCat.label} (${worstCat.score}). Avalie o seu também:`;
    track("ia_share_click", "ia", { overall, worst: worstCat.label });
    if (navigator.share) {
      try {
        await navigator.share({ title: `Setup nota ${overall}/10`, text, url });
      } catch {
        /* usuário cancelou */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast.success("Link copiado! Cole onde quiser compartilhar.");
    } catch {
      toast.info(`Copia o texto: ${text} ${url}`);
    }
  };

  // Escuta upload feito no Hero (drop-zone). Converte dataURL de volta
  // pra File e dispara handleFile como se o usuário tivesse subido aqui.
  useEffect(() => {
    const PENDING_KEY = "deskly:pending-upload";
    const consume = async () => {
      const dataUrl = sessionStorage.getItem(PENDING_KEY);
      if (!dataUrl) return;
      sessionStorage.removeItem(PENDING_KEY);
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], "hero-upload.jpg", { type: blob.type || "image/jpeg" });
        await handleFile(file);
      } catch (e) {
        console.warn("[hero-upload] consume failed:", e);
      }
    };
    // Mount: se já tinha pendente
    consume();
    // Listener: Hero dispara esse event após salvar
    const listener = () => consume();
    window.addEventListener("deskly:pending-upload", listener);
    return () => window.removeEventListener("deskly:pending-upload", listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overall = +(criterios.reduce((a, c) => a + c.score, 0) / criterios.length).toFixed(1);
  const worst = [...criterios].sort((a, b) => a.score - b.score)[0];

  return (
    <section id="analise-ia" className="border-y border-border/60 bg-cream py-10 md:py-14">
      {limitReached && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 px-4" onClick={() => setLimitReached(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl bg-card p-8 shadow-elegant">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-hero text-primary-foreground">
              <Crown className="h-6 w-6" />
            </div>
            <h3 className="text-center font-display text-2xl font-bold">
              Você já melhorou seu setup {usedAnalyses}x 🚀
            </h3>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Pra continuar acompanhando sua evolução, comparar setups lado a lado e
              gerar relatório PDF, faça upgrade para o <strong>Premium por R$ 9,90/mês</strong>.
              Cancela quando quiser.
            </p>
            <ul className="mt-5 space-y-2 text-xs text-foreground">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Análise IA ilimitada
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Comparação Antes/Depois lado a lado
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Recomendações personalizadas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Relatório PDF do seu setup
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Sem anúncios
              </li>
            </ul>
            <div className="mt-6 flex flex-col gap-3">
              <Link to="/premium" onClick={() => { track("ia_upgrade_click", "ia", { from: "analyze_limit_paywall", analyses_used: usedAnalyses }); setLimitReached(false); }} className="block rounded-full bg-gradient-hero px-5 py-3 text-center text-sm font-semibold text-primary-foreground shadow-elegant transition-smooth hover:opacity-90">
                Assinar Premium · R$ 9,90/mês →
              </Link>
              <button type="button" onClick={() => setLimitReached(false)} className="text-xs text-muted-foreground hover:text-foreground">
                Talvez depois
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 md:px-6">
        {/* Header compactado — Hero acima já comunica a proposta.
            Mantemos um título curto pra estrutura visual sem repetir promessa. */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> Diagnóstico ao vivo
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Solte sua foto e veja o resultado abaixo
          </h2>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Upload card */}
          <div
            ref={dragRef}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => {
              // handleFile já cuida do path anônimo (preview borrado + CTA login).
              e.preventDefault();
              handleFile(e.dataTransfer.files?.[0]);
            }}
            onClick={() => inputRef.current?.click()}
            className="group relative flex min-h-[240px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-border bg-card p-6 text-center transition-smooth hover:border-primary hover:bg-primary/5"
          >
            {preview ? (
              <>
                <img src={preview} alt="Seu setup" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
                <div className="relative z-10 ml-auto mr-0 flex flex-wrap items-center gap-2 self-end">
                  {analyzed && !needsLoginToSeeResults && lastDataUrl && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); runDeepAnalysis(); }}
                      disabled={deepLoading}
                      className="flex items-center gap-1 rounded-full bg-foreground px-3 py-1 text-xs font-bold text-background shadow-elegant backdrop-blur transition-smooth hover:scale-105 disabled:opacity-60"
                      aria-label="Análise detalhada com produtos recomendados"
                    >
                      <Sparkles className="h-3 w-3" /> {deepLoading ? "Gerando..." : "Análise detalhada"}
                    </button>
                  )}
                  {analyzed && !needsLoginToSeeResults && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); shareScore(); }}
                      className="flex items-center gap-1 rounded-full bg-gradient-hero px-3 py-1 text-xs font-bold text-primary-foreground shadow-elegant backdrop-blur transition-smooth hover:scale-105"
                      aria-label="Compartilhar minha nota"
                    >
                      <Share2 className="h-3 w-3" /> Compartilhar nota
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); reset(); }}
                    className="flex items-center gap-1 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold backdrop-blur"
                  >
                    <RotateCcw className="h-3 w-3" /> Trocar
                  </button>
                </div>
                <div className="relative z-10 mt-auto w-full self-start text-left text-background">
                  <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{loading ? "Analisando..." : analyzed ? "Pronto" : "Aguarde"}</div>
                  <div className="font-display text-2xl font-bold">{loading ? "IA processando" : "Resultados ao lado →"}</div>
                  {loading && (
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-background/20">
                      <div className="h-full w-2/5 animate-pulse rounded-full bg-gradient-hero" />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-elegant transition-smooth group-hover:scale-110">
                  <Upload className="h-7 w-7" />
                </div>
                <h3 className="font-display text-xl font-semibold">Arraste sua foto aqui</h3>
                <p className="mt-2 text-sm text-muted-foreground">ou clique para enviar · JPG, PNG até 10MB</p>
                <span className="mt-6 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background">
                  Selecionar arquivo
                </span>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          {/* Score panel */}
          <div className="relative rounded-3xl bg-card p-8 shadow-soft">
            {/* Conteúdo (borrado quando needsLoginToSeeResults) */}
            <div className={needsLoginToSeeResults ? "select-none pointer-events-none blur-md" : ""} aria-hidden={needsLoginToSeeResults}>
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {analyzed ? "Sua nota geral" : "Nota geral (exemplo)"}
                  </div>
                  <div className="font-display text-6xl font-bold transition-smooth">
                    {overall}<span className="text-2xl text-muted-foreground">/10</span>
                  </div>
                </div>
                <div className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-foreground">
                  {analyzed ? (overall > 8 ? "Acima da média" : "Tem upgrades fáceis") : "+0.7 vs média"}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {criterios.map((c) => (
                  <div key={c.label} className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-card ${c.color}`}>
                      <c.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{c.label}</div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-border">
                        <div className="h-full rounded-full bg-gradient-hero transition-all duration-700"
                          style={{ width: `${c.score * 10}%` }} />
                      </div>
                    </div>
                    <div className="font-display text-sm font-bold">{c.score}</div>
                  </div>
                ))}
              </div>
              {/* PAYWALL SUAVE — free vê top 3 problemas, premium vê tudo */}
              {(() => {
                if (!analyzed) {
                  return (
                    <div className="mt-6 rounded-2xl border-l-4 border-coral bg-coral/10 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wider text-coral-foreground/80">Sugestão da IA</div>
                      <p className="mt-1 text-sm text-foreground">
                        Envie uma foto do seu setup acima e a IA brasileira analisa em segundos.
                      </p>
                    </div>
                  );
                }
                const isPremium = subscription.canUse("unlimited_analysis");
                // Ordena tips por severidade (alta > media > baixa)
                const severityOrder = { alta: 0, media: 1, baixa: 2 } as Record<string, number>;
                const sortedTips = [...allTips].sort(
                  (a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9),
                );
                const freeTips = sortedTips.slice(0, 3);
                const premiumTips = sortedTips.slice(3);

                return (
                  <>
                    <div className="mt-6">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-display text-base font-bold">
                          {freeTips.length > 0 ? `Top ${freeTips.length} problemas identificados` : "Análise pronta"}
                        </h3>
                        {!needsLoginToSeeResults && (
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                            Grátis
                          </span>
                        )}
                      </div>
                      <div className="space-y-3">
                        {freeTips.map((t, i) => {
                          const prod = productHintFor(t.category);
                          return (
                          <div key={i} className={`overflow-hidden rounded-2xl border-l-4 ${
                            t.severity === "alta" ? "border-coral bg-coral/10" :
                            t.severity === "media" ? "border-accent bg-accent/10" :
                            "border-primary bg-primary/10"
                          }`}>
                            <div className="flex gap-3 p-3">
                              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-foreground/10 text-xs font-bold">
                                {i + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                  {t.category} · {t.severity}
                                </div>
                                <p className="mt-0.5 text-sm text-foreground">{t.text}</p>
                              </div>
                            </div>
                            {prod && (
                              <a
                                href={prod.url}
                                target="_blank"
                                rel="sponsored noopener noreferrer"
                                onClick={() => track("ia_inline_product_click", "affiliate", {
                                  category: t.category,
                                  severity: t.severity,
                                  store: "amazon_br",
                                  product_query: prod.query,
                                })}
                                className="flex items-center justify-between gap-2 border-t border-foreground/5 bg-background/60 px-3 py-2 text-xs transition-smooth hover:bg-background"
                              >
                                <div className="flex min-w-0 items-center gap-2">
                                  <prod.Icon className="h-4 w-4 flex-shrink-0 text-primary" />
                                  <span className="truncate">
                                    <strong className="text-foreground">{prod.label}</strong>
                                    <span className="text-muted-foreground"> · Amazon BR</span>
                                  </span>
                                </div>
                                <span className="flex flex-shrink-0 items-center gap-1 font-bold text-primary">
                                  Ver opções <ExternalLink className="h-3 w-3" />
                                </span>
                              </a>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Plano de ação detalhado — bloqueado pra free */}
                    {!needsLoginToSeeResults && (premiumTips.length > 0 || !isPremium) && (
                      <div className={`mt-4 overflow-hidden rounded-2xl border-2 ${isPremium ? "border-primary/40 bg-primary/5" : "border-dashed border-primary/40 bg-gradient-to-br from-primary/5 to-accent/5"}`}>
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-2">
                            {isPremium ? <Sparkles className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4 text-primary" />}
                            <h3 className="font-display text-sm font-bold">
                              Plano de ação detalhado + Lista de compras
                            </h3>
                          </div>
                          <span className="rounded-full bg-gradient-hero px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                            <Crown className="mr-1 inline h-3 w-3" /> Premium
                          </span>
                        </div>
                        {isPremium ? (
                          <div className="space-y-2 px-4 pb-4">
                            {premiumTips.map((t, i) => (
                              <div key={i} className="flex gap-3 rounded-xl bg-card p-3">
                                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-foreground/10 text-xs font-bold">
                                  {freeTips.length + i + 1}
                                </div>
                                <p className="text-sm">{t.text}</p>
                              </div>
                            ))}
                            <Link to="/orcamento" className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                              Ver lista de compras completa →
                            </Link>
                          </div>
                        ) : (
                          <div className="border-t border-primary/20 bg-card/50 p-4">
                            <p className="text-xs text-muted-foreground">
                              <strong className="text-foreground">{premiumTips.length || 3}+ ações detalhadas</strong>, lista de compras com produtos exatos e priorização por orçamento. Destravado no Premium.
                            </p>
                            <Link
                              to="/premium"
                              onClick={() => track("ia_upgrade_click", "ia", { from: "soft_paywall_action_plan" })}
                              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-hero px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-elegant transition-smooth hover:opacity-90"
                            >
                              <Crown className="h-3.5 w-3.5" /> Destravar plano completo
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Overlay de login — aparece sobre o conteúdo borrado */}
            {needsLoginToSeeResults && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-background/40 p-6 text-center backdrop-blur-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-hero text-primary-foreground shadow-elegant">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="mt-4 max-w-xs font-display text-xl font-bold leading-tight">
                  Sua nota está pronta!
                </h3>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  Faça login grátis pra ver as 6 notas detalhadas e as sugestões personalizadas da IA.
                </p>
                <button
                  type="button"
                  onClick={() => { track("ia_anon_login_click", "ia", { from: "blurred_teaser" }); navigate({ to: "/auth" }); }}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background shadow-elegant transition-smooth hover:scale-105"
                >
                  <LogIn className="h-4 w-4" />
                  Ver minha nota completa
                </button>
                <p className="mt-3 text-[10px] text-muted-foreground">
                  10 segundos. Conta grátis pra sempre.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
