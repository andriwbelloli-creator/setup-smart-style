// HomeOfficeLife · Kits — curated product bundles by profession + budget
/* eslint-disable */

const KITS_DATA = [
  { name: "Kit Home Office Básico", desc: "Postura, iluminação e organização gastando pouco.", budget: "~R$ 250", impact: "Alto", color: "var(--primary)", items: ["Suporte para notebook", "Mouse externo", "Organizador de cabos", "Luminária de mesa"] },
  { name: "Kit Reuniões Online", desc: "Pareça profissional em videochamadas.", budget: "~R$ 400", impact: "Alto", color: "oklch(0.45 0.1 210)", items: ["Ring light discreto", "Webcam HD", "Mic lapela", "Fundo neutro"] },
  { name: "Kit Psicólogo Online", desc: "Ambiente acolhedor e profissional para atendimentos.", budget: "~R$ 600", impact: "Médio", color: "oklch(0.6 0.13 155)", items: ["Luminária quente", "Webcam 1080p", "Mic USB", "Painel de fundo", "Cadeira confortável"] },
  { name: "Kit Dev Produtivo", desc: "Código limpo, setup limpo. Foco em ergonomia.", budget: "~R$ 1.200", impact: "Alto", color: "var(--brand-teal-500)", items: ["Monitor 24\"", "Suporte VESA", "Teclado mecânico", "Mouse ergonômico", "Organizador de cabos"] },
  { name: "Kit Criador de Conteúdo", desc: "Cenário, iluminação e áudio prontos para gravar.", budget: "~R$ 1.500", impact: "Alto", color: "var(--brand-coral-500)", items: ["Key light LED", "Mic condensador", "Webcam 4K", "Braço articulado", "Painel de fundo"] },
  { name: "Kit Minimalista", desc: "Menos é mais. Setup clean e funcional.", budget: "~R$ 800", impact: "Médio", color: "var(--wood)", items: ["Mesa clean", "Monitor slim", "Teclado compacto", "Luminária minimalista", "Canaleta de cabos"] },
  { name: "Kit Apê Pequeno", desc: "Maximize cada centímetro do seu espaço.", budget: "~R$ 500", impact: "Alto", color: "oklch(0.55 0.12 80)", items: ["Mesa dobrável", "Suporte parede p/ monitor", "Organizador vertical", "Luminária grampo"] },
  { name: "Kit Premium Executivo", desc: "Impressione em reuniões. Setup top.", budget: "~R$ 5.000+", impact: "Premium", color: "var(--brand-teal-900)", items: ["Cadeira ergonômica top", "Monitor ultrawide", "Webcam 4K", "Iluminação studio", "Mesa standing desk"] },
];

const Kits = ({ onSelect }) => (
  <section id="kits" className="py-16 md:py-24">
    <div className="mx-auto max-w-[1200px] px-6">
      <div className="mx-auto max-w-2xl text-center mb-10">
        <Pill tone="wood" className="mb-4 !text-[10px]">Kits recomendados</Pill>
        <h2 style={{ fontFamily: "var(--font-display)" }}
            className="text-[32px] sm:text-[44px] font-bold leading-tight tracking-[-0.025em] text-[var(--foreground)]">
          Monte um setup melhor{" "}
          <span style={{ backgroundImage: "var(--gradient-warm)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            sem gastar muito
          </span>
        </h2>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Kits curados com produtos do Brasil. Escolha o que faz sentido pro seu orçamento e profissão.
        </p>
      </div>

      {/* Budget quick-filter chips */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {["Todos", "Até R$ 300", "Até R$ 700", "Até R$ 1.500", "Premium"].map((f, i) => (
          <button key={f} className={
            "rounded-full px-4 py-1.5 text-xs font-medium transition-colors duration-300 " +
            (i === 0
              ? "bg-[var(--foreground)] text-[var(--background)]"
              : "border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]")
          }>
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {KITS_DATA.map(k => (
          <div key={k.name} onClick={() => onSelect?.(k)}
               className="group flex cursor-pointer flex-col rounded-[22px] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-soft)] transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)] overflow-hidden">
            {/* Color band */}
            <div className="h-2 w-full" style={{ background: k.color }}/>
            <div className="flex flex-1 flex-col p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 style={{ fontFamily: "var(--font-display)" }}
                    className="text-[15px] font-bold leading-tight text-[var(--foreground)]">{k.name}</h3>
                <span className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: `color-mix(in oklch, ${k.color} 15%, transparent)`, color: k.color }}>
                  {k.impact}
                </span>
              </div>
              <p className="text-[13px] leading-relaxed text-[var(--muted-foreground)]">{k.desc}</p>

              <ul className="mt-3 flex-1 space-y-1.5">
                {k.items.map(item => (
                  <li key={item} className="flex items-center gap-2 text-[12px] text-[var(--foreground)]">
                    <Icon.Check size={12} className="flex-shrink-0 text-[var(--success)]"/>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between">
                <span style={{ fontFamily: "var(--font-display)" }}
                      className="text-lg font-bold text-[var(--foreground)]">{k.budget}</span>
                <span className="text-sm font-semibold text-[var(--primary)] transition-all group-hover:gap-2 inline-flex items-center gap-1">
                  Ver kit <Icon.ArrowRight size={13}/>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

window.Kits = Kits;
