import { Upload, Activity, Lightbulb, Cable, Layout, Sparkles, Armchair } from "lucide-react";

const criterios = [
  { icon: Armchair, label: "Ergonomia", score: 8.5, color: "text-primary" },
  { icon: Lightbulb, label: "Iluminação", score: 9.2, color: "text-accent" },
  { icon: Cable, label: "Cabos", score: 6.8, color: "text-coral" },
  { icon: Layout, label: "Organização", score: 8.0, color: "text-primary" },
  { icon: Sparkles, label: "Estética", score: 9.4, color: "text-accent" },
  { icon: Activity, label: "Produtividade", score: 7.9, color: "text-primary" },
];

export function AnaliseIA() {
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
            Nossa IA analisa 6 critérios essenciais e devolve sugestões práticas — com produtos reais que cabem no seu bolso.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Upload card */}
          <div className="group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card p-12 text-center transition-smooth hover:border-primary hover:bg-primary/5">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-elegant transition-smooth group-hover:scale-110">
              <Upload className="h-7 w-7" />
            </div>
            <h3 className="font-display text-xl font-semibold">Arraste sua foto aqui</h3>
            <p className="mt-2 text-sm text-muted-foreground">ou clique para enviar · JPG, PNG até 10MB</p>
            <button className="mt-6 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-smooth hover:bg-foreground/90">
              Selecionar arquivo
            </button>
          </div>

          {/* Score panel */}
          <div className="rounded-3xl bg-card p-8 shadow-soft">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nota geral</div>
                <div className="font-display text-6xl font-bold">8.3<span className="text-2xl text-muted-foreground">/10</span></div>
              </div>
              <div className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-foreground">+0.7 vs média</div>
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
                      <div
                        className="h-full rounded-full bg-gradient-hero"
                        style={{ width: `${c.score * 10}%` }}
                      />
                    </div>
                  </div>
                  <div className="font-display text-sm font-bold">{c.score}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border-l-4 border-coral bg-coral/10 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-coral-foreground/80">Sugestão da IA</div>
              <p className="mt-1 text-sm text-foreground">
                Seus cabos estão à mostra. Um organizador adesivo (~R$ 35 no Mercado Livre) sobe sua nota geral pra 8.9.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
