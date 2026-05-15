// HomeOfficeLife · Análise IA — diagnostic results panel.
// Simulates the post-upload AI-analysis view.
/* eslint-disable */

const SCORE_AXES = [
  { label: "Ergonomia",   value: 9.0, tone: "var(--success)" },
  { label: "Iluminação",  value: 7.2, tone: "var(--warning)" },
  { label: "Organização", value: 8.4, tone: "var(--primary)" },
  { label: "Estética",    value: 8.9, tone: "var(--brand-coral-500)" },
];

const TIPS = [
  { title: "Sua iluminação está fraca à esquerda", text: "Uma luminária de mesa LED com braço articulado (~R$ 180) eliminaria a sombra no teclado." },
  { title: "Cabeça inclinada pra baixo no monitor",  text: "Levante o monitor em 6–8cm com um suporte (~R$ 120) ou uma pilha de livros. Topo da tela na linha dos olhos." },
  { title: "Excelente uso de plantas",               text: "Mantém o ar visualmente leve. Considere uma de samambaia pra refrescar o canto direito." },
];

const PICKS = [
  { name: "Luminária Yeelight LED",  price: "R$ 169", store: "Amazon BR" },
  { name: "Suporte VESA Multilaser", price: "R$ 119", store: "Mercado Livre" },
  { name: "Apoio lombar Flexform",   price: "R$ 249", store: "Amazon BR" },
];

const AnaliseIA = ({ uploadedSrc, onReset }) => {
  const [stage, setStage] = useState("analyzing");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!uploadedSrc) return;
    setStage("analyzing");
    setProgress(0);
    let p = 0;
    const id = setInterval(() => {
      p += 7;
      setProgress(Math.min(p, 100));
      if (p >= 100) { clearInterval(id); setStage("done"); }
    }, 110);
    return () => clearInterval(id);
  }, [uploadedSrc]);

  if (!uploadedSrc) return null;

  return (
    <section id="diagnostico" className="border-y border-[var(--border)] bg-[var(--cream)] py-14">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <Pill tone="eyebrow" className="mb-3 !text-[10px]"><Icon.Sparkles size={11}/> Resultado IA</Pill>
            <h2 style={{ fontFamily: "var(--font-display)" }}
                className="text-[32px] sm:text-[40px] font-bold leading-tight tracking-[-0.025em] text-[var(--foreground)]">
              {stage === "analyzing" ? "Analisando seu setup…" : "Pronto — sua nota tá aí 👇"}
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onReset}><Icon.X size={14}/> Mandar outra foto</Button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          {/* Photo */}
          <Card className="relative overflow-hidden !rounded-[24px] !p-0">
            <div className="relative aspect-[16/11]">
              <img src={uploadedSrc} alt="Setup do usuário" className="h-full w-full object-cover"/>
              <Watermark/>
              {stage === "analyzing" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--foreground)]/50 backdrop-blur-[2px]">
                  <div className="rounded-full bg-white/95 p-4 shadow-[var(--shadow-elegant)]">
                    <Icon.Sparkles size={28} className="text-[var(--brand-coral-500)]" style={{ animation: "pulse 1.5s ease-in-out infinite" }}/>
                  </div>
                  <div className="w-[280px] max-w-[70%]">
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/30">
                      <div className="h-full rounded-full bg-white transition-[width] duration-200"
                           style={{ width: progress + "%" }}/>
                    </div>
                    <div className="mt-2 text-center text-xs font-medium text-white">
                      Avaliando ergonomia, iluminação, organização… {progress}%
                    </div>
                  </div>
                </div>
              )}
              {stage === "done" && (
                <>
                  <div className="absolute right-3 top-3 rounded-xl bg-white/96 p-3 shadow-[var(--shadow-elegant)] backdrop-blur">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Nota geral</div>
                    <div style={{ fontFamily: "var(--font-display)" }}
                         className="text-3xl font-bold leading-none text-[var(--foreground)]">
                      8.4<span className="text-base text-[var(--muted-foreground)]">/10</span>
                    </div>
                  </div>
                  <div className="absolute left-3 top-3">
                    <Pill tone="coral"><Icon.Sparkles size={11}/> Top 18% Brasil</Pill>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Score axes */}
          <Card className="!rounded-[24px] p-6">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Análise por área</div>
            <div className="mt-4 flex flex-col gap-4">
              {SCORE_AXES.map((a) => (
                <div key={a.label}>
                  <div className="mb-1.5 flex items-baseline justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">{a.label}</span>
                    <strong className="text-[var(--foreground)]" style={{ fontFamily: "var(--font-display)" }}>{a.value.toFixed(1)}</strong>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                    <div className="h-full rounded-full transition-[width] duration-[1200ms]"
                         style={{
                           width: stage === "done" ? (a.value * 10) + "%" : "0%",
                           background: a.tone,
                           transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                         }}/>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Tips */}
        {stage === "done" && (
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {TIPS.map((t, i) => (
              <Card key={i} className="!rounded-[20px] p-5">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                  <Icon.Sparkles size={16}/>
                </div>
                <h4 style={{ fontFamily: "var(--font-display)" }} className="text-[15px] font-bold leading-tight text-[var(--foreground)]">
                  {t.title}
                </h4>
                <p className="mt-1.5 text-sm leading-[1.55] text-[var(--muted-foreground)]">{t.text}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Picks */}
        {stage === "done" && (
          <Card className="mt-5 !rounded-[24px] p-6">
            <div className="mb-4 flex items-baseline justify-between">
              <div>
                <Pill tone="wood" className="mb-2 !text-[10px]">Lista de compras priorizada</Pill>
                <h3 style={{ fontFamily: "var(--font-display)" }} className="text-xl font-bold text-[var(--foreground)]">
                  3 upgrades em ordem de impacto
                </h3>
              </div>
              <Button variant="link" size="sm">Ver kit completo →</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {PICKS.map((p, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] font-bold" style={{ fontFamily: "var(--font-display)" }}>
                    #{i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-[var(--foreground)]">{p.name}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">{p.price} · {p.store}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </section>
  );
};

window.AnaliseIA = AnaliseIA;
