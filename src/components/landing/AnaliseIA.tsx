import { useRef, useState } from "react";
import { Upload, Activity, Lightbulb, Cable, Layout, Sparkles, Armchair, RotateCcw } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx 10MB).");
      return;
    }
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setAnalyzed(false);
    setAiTip(null);
    try {
      const dataUrl = await fileToDataUrl(file);
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
      setAnalyzed(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao analisar imagem";
      toast.error(msg);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setPreview(null); setAnalyzed(false); setCriterios(baseCriterios); setAiTip(null); };

  const overall = +(criterios.reduce((a, c) => a + c.score, 0) / criterios.length).toFixed(1);
  const worst = [...criterios].sort((a, b) => a.score - b.score)[0];

  return (
    <section id="analise" className="border-y border-border/60 bg-cream py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> Análise por IA
          </div>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Uma nota completa do seu setup em <span className="text-primary">30 segundos</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            6 critérios essenciais e sugestões com produtos reais que cabem no seu bolso.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Upload card */}
          <div
            ref={dragRef}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
            onClick={() => inputRef.current?.click()}
            className="group relative flex min-h-[320px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-border bg-card p-6 text-center transition-smooth hover:border-primary hover:bg-primary/5"
          >
            {preview ? (
              <>
                <img src={preview} alt="Seu setup" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="relative z-10 ml-auto mr-0 flex items-center gap-1 self-end rounded-full bg-background/90 px-3 py-1 text-xs font-semibold backdrop-blur"
                >
                  <RotateCcw className="h-3 w-3" /> Trocar
                </button>
                <div className="relative z-10 mt-auto self-start text-left text-background">
                  <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{loading ? "Analisando..." : analyzed ? "Pronto" : "Aguarde"}</div>
                  <div className="font-display text-2xl font-bold">{loading ? "IA processando" : "Resultados ao lado →"}</div>
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
          <div className="rounded-3xl bg-card p-8 shadow-soft">
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
            <div className="mt-6 rounded-2xl border-l-4 border-coral bg-coral/10 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-coral-foreground/80">Sugestão da IA</div>
              <p className="mt-1 text-sm text-foreground">
                {analyzed
                  ? aiTip ?? `${worst.label} é o ponto fraco (${worst.score}). ${worst.tip}`
                  : "Envie uma foto do seu setup acima e a IA brasileira analisa em segundos."}
              </p>
            </div>
            {analyzed && (
              <Link to="/orcamento" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                Ver lista de upgrades →
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
