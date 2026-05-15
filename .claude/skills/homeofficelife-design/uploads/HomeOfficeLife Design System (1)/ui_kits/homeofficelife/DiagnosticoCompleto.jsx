// HomeOfficeLife · DiagnosticoCompleto — expanded 10-axis results + paywall + level badges + budget tiers
/* eslint-disable */

const LEVEL_BADGES = [
  { max: 30, label: "Básico",            color: "var(--destructive)",       bg: "oklch(0.6 0.22 27 / 0.12)" },
  { max: 50, label: "Bom",               color: "var(--warning)",           bg: "oklch(0.72 0.15 75 / 0.12)" },
  { max: 70, label: "Otimizado",         color: "var(--primary)",           bg: "oklch(0.42 0.07 195 / 0.12)" },
  { max: 90, label: "Profissional",      color: "var(--success)",           bg: "oklch(0.6 0.13 155 / 0.12)" },
  { max: 100, label: "Setup dos sonhos", color: "var(--brand-coral-500)",   bg: "oklch(0.72 0.18 35 / 0.12)" },
];

const getLevel = (score) => LEVEL_BADGES.find(l => score <= l.max) || LEVEL_BADGES[4];

const FULL_AXES = [
  { label: "Ergonomia",             value: 62, tone: "var(--warning)",          tip: "Seu monitor parece baixo. Um suporte simples (~R$ 120) já melhora a postura." },
  { label: "Iluminação",            value: 48, tone: "var(--destructive)",      tip: "Iluminação fraca à esquerda. Uma luminária LED (~R$ 180) eliminaria a sombra." },
  { label: "Organização",           value: 78, tone: "var(--primary)",          tip: "Boa organização geral. Canaletas de cabo completariam o visual." },
  { label: "Gestão de cabos",       value: 45, tone: "var(--destructive)",      tip: "Cabos visíveis prejudicam a estética e podem ser tropeço." },
  { label: "Estética",              value: 82, tone: "var(--success)",          tip: "Visual coerente, bom uso de plantas e cores." },
  { label: "Produtividade",         value: 71, tone: "var(--primary)",          tip: "Monitor único limita multitasking. Considere um segundo monitor ou ultrawide." },
  { label: "Conforto",              value: 65, tone: "var(--warning)",          tip: "Cadeira sem apoio lombar. Um suporte lombar (~R$ 80) ajuda muito." },
  { label: "Profissionalismo vídeo", value: 55, tone: "var(--warning)",         tip: "Iluminação e ângulo da câmera não ideais para videochamadas." },
  { label: "Aproveitamento espaço", value: 88, tone: "var(--success)",          tip: "Excelente uso do espaço disponível. Muito bem aproveitado." },
  { label: "Custo-benefício",       value: 74, tone: "var(--primary)",          tip: "Bom equilíbrio preço × resultado. Os upgrades sugeridos têm ótimo ROI." },
];

const BUDGET_TIERS = [
  { label: "Até R$ 50",  items: ["Organizador de cabos velcro", "Apoio de pulso mouse"] },
  { label: "Até R$ 100", items: ["Apoio lombar avulso", "Luminária grampo LED"] },
  { label: "Até R$ 300", items: ["Suporte para monitor", "Mouse ergonômico", "Luminária articulada"] },
  { label: "Até R$ 700", items: ["Cadeira com apoio lombar", "Braço articulado monitor", "Teclado externo"] },
];

const OVERALL_SCORE = 67;

const DiagnosticoCompleto = ({ imageSrc, onUpgrade, onBack }) => {
  const [showPaywall, setShowPaywall] = useState(false);
  const level = getLevel(OVERALL_SCORE);
  const FREE_LIMIT = 4; // show first 4 axes free, rest behind paywall

  return (
    <section id="resultado" className="py-10">
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Back */}
        <button onClick={onBack} className="mb-6 flex items-center gap-1 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          ← Voltar
        </button>

        {/* Header — score + level */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          {/* Photo */}
          <Card className="relative overflow-hidden !rounded-[24px] !p-0">
            <div className="relative aspect-[16/11]">
              <img src={imageSrc || "../../assets/hero-setup.webp"} alt="" className="h-full w-full object-cover"/>
              <Watermark/>
              {/* Level badge */}
              <div className="absolute right-3 top-3 rounded-xl p-3 backdrop-blur shadow-[var(--shadow-elegant)]"
                   style={{ background: "rgba(255,255,255,0.96)" }}>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Nota geral</div>
                <div style={{ fontFamily: "var(--font-display)" }}
                     className="text-[36px] font-bold leading-none text-[var(--foreground)]">
                  {OVERALL_SCORE}<span className="text-base text-[var(--muted-foreground)]">/100</span>
                </div>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                     style={{ background: level.bg, color: level.color }}>
                  <Icon.Star size={10}/> {level.label}
                </div>
              </div>
              {/* Ranking pill */}
              <div className="absolute left-3 top-3">
                <Pill tone="coral"><Icon.Flame size={11}/> Top 32% Brasil</Pill>
              </div>
            </div>
          </Card>

          {/* Score summary + AI resume */}
          <div>
            <Card className="!rounded-[24px] p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Resumo da IA</div>
                  <h2 style={{ fontFamily: "var(--font-display)" }}
                      className="mt-1 text-xl font-bold text-[var(--foreground)]">
                    Seu setup está bom, mas pode ficar muito melhor com ajustes simples.
                  </h2>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                O maior ganho está na <strong className="text-[var(--foreground)]">iluminação</strong> e na <strong className="text-[var(--foreground)]">gestão de cabos</strong>.
                Com até R$ 300 você resolve os dois problemas principais. A ergonomia precisa de atenção: seu monitor está baixo demais.
              </p>

              {/* Pontos fortes / atenção */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--success)]/30 bg-[var(--success)]/8 p-4">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--success)]">Pontos fortes</div>
                  {["Excelente uso de plantas", "Bom aproveitamento do espaço", "Estética coerente"].map(p => (
                    <div key={p} className="flex items-start gap-2 text-sm text-[var(--foreground)] mt-1">
                      <Icon.Check size={13} className="mt-0.5 flex-shrink-0 text-[var(--success)]"/> {p}
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-[var(--warning)]/30 bg-[var(--warning)]/8 p-4">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--warning)]">Pontos de atenção</div>
                  {["Monitor muito baixo", "Iluminação fraca na esquerda", "Cabos visíveis"].map(p => (
                    <div key={p} className="flex items-start gap-2 text-sm text-[var(--foreground)] mt-1">
                      <Icon.ArrowRight size={13} className="mt-0.5 flex-shrink-0 text-[var(--warning)]"/> {p}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* 10-axis grid */}
        <div className="mt-6">
          <h3 style={{ fontFamily: "var(--font-display)" }}
              className="mb-4 text-xl font-bold text-[var(--foreground)]">Análise por categoria</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {FULL_AXES.map((a, i) => {
              const locked = i >= FREE_LIMIT && !showPaywall;
              return (
                <div key={a.label} className={
                  "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-soft)] " +
                  "transition-all duration-300 " +
                  (locked ? "relative overflow-hidden" : "")
                }>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-sm font-medium text-[var(--muted-foreground)]">{a.label}</span>
                    <strong style={{ fontFamily: "var(--font-display)" }}
                            className="text-lg text-[var(--foreground)]">{a.value}<span className="text-xs text-[var(--muted-foreground)]">/100</span></strong>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                    <div className="h-full rounded-full" style={{ width: a.value + "%", background: a.tone }}/>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted-foreground)]">{a.tip}</p>
                  {locked && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[var(--card)]/90 backdrop-blur-[3px]">
                      <Pill tone="eyebrow" className="!text-[11px]">
                        <Icon.Crown size={12}/> Premium
                      </Pill>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Paywall */}
        {!showPaywall && (
          <div className="mt-6 rounded-[24px] border-2 border-dashed border-[var(--primary)]/30 bg-[var(--primary)]/5 p-8 text-center">
            <Icon.Crown size={28} className="mx-auto mb-3 text-[var(--primary)]"/>
            <h3 style={{ fontFamily: "var(--font-display)" }}
                className="text-xl font-bold text-[var(--foreground)]">
              Desbloqueie a análise completa
            </h3>
            <p className="mt-2 max-w-md mx-auto text-sm text-[var(--muted-foreground)]">
              Veja todas as 10 categorias, sugestões por orçamento, lista de produtos e plano de ação priorizado.
            </p>
            <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button variant="hero" size="lg" onClick={() => { setShowPaywall(true); onUpgrade?.(); }}>
                <Icon.Crown size={16}/> Desbloquear por R$ 4,90/mês
              </Button>
              <button onClick={() => setShowPaywall(true)}
                      className="text-sm font-semibold text-[var(--primary)] underline-offset-4 hover:underline">
                Ver prévia grátis →
              </button>
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">Cancele quando quiser · Sem fidelidade</p>
          </div>
        )}

        {/* Budget tiers (shown after paywall unlock) */}
        {showPaywall && (
          <div className="mt-6">
            <h3 style={{ fontFamily: "var(--font-display)" }}
                className="mb-4 text-xl font-bold text-[var(--foreground)]">
              Melhorias por orçamento
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {BUDGET_TIERS.map(t => (
                <Card key={t.label} className="!rounded-2xl p-5">
                  <div style={{ fontFamily: "var(--font-display)" }}
                       className="mb-3 text-lg font-bold text-[var(--foreground)]">{t.label}</div>
                  <ul className="space-y-2">
                    {t.items.map(item => (
                      <li key={item} className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                        <Icon.Check size={13} className="flex-shrink-0 text-[var(--success)]"/> {item}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" size="sm" className="mt-4 w-full">
                    Ver produtos <Icon.ArrowRight size={12}/>
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

window.DiagnosticoCompleto = DiagnosticoCompleto;
