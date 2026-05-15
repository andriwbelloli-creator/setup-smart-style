// HomeOfficeLife · Pricing — 3 tiers, lançamento badge, validation-phase friendly
/* eslint-disable */

const PLANS = [
  {
    name: "Gratuito",
    price: "R$ 0",
    period: "pra sempre",
    desc: "Experimente sem compromisso. Sem cartão.",
    cta: "Começar grátis",
    ctaVariant: "outline",
    features: [
      "3 análises IA",
      "Acesso à galeria",
      "Wishlist limitada (5 itens)",
      "Postar seu setup",
      "Recomendações básicas",
    ],
    excluded: [
      "Diagnóstico completo por categoria",
      "Relatório PDF",
      "Comparação de setups",
      "Selo Pro",
    ],
  },
  {
    name: "Premium",
    price: "R$ 4,90",
    period: "/mês",
    desc: "O melhor custo-benefício pra melhorar seu setup.",
    cta: "Assinar Premium",
    ctaVariant: "hero",
    badge: "Mais popular",
    launch: true,
    features: [
      "Análises IA ilimitadas",
      "Recomendações personalizadas",
      "Wishlist ilimitada",
      "Comparação de 2 setups",
      "Relatório simples",
      "Sem anúncios",
      "Histórico de evolução",
      "Sugestões por orçamento",
    ],
  },
  {
    name: "Pro",
    price: "R$ 9,90",
    period: "/mês",
    desc: "Para profissionais e criadores de conteúdo.",
    cta: "Assinar Pro",
    ctaVariant: "coral",
    features: [
      "Tudo do Premium",
      "Comparação ilimitada",
      "Relatório PDF avançado",
      "Destaque no perfil",
      "Selo Pro na comunidade",
      "Análise detalhada p/ vídeo",
      "Cards de portfólio do setup",
      "Insights pra criadores",
    ],
  },
];

const Pricing = ({ onSelect }) => (
  <section id="pricing" className="py-16 md:py-24" style={{ background: "var(--gradient-mesh), var(--background)" }}>
    <div className="mx-auto max-w-[1200px] px-6">
      <div className="mx-auto max-w-2xl text-center">
        <Pill tone="eyebrow" className="mb-4 !text-[10px]">
          <Icon.Sparkles size={11}/> Planos
        </Pill>
        <h2 style={{ fontFamily: "var(--font-display)" }}
            className="text-[32px] sm:text-[44px] font-bold leading-tight tracking-[-0.025em] text-[var(--foreground)]">
          Melhore seu setup{" "}
          <span style={{ backgroundImage: "var(--gradient-warm)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            gastando pouco
          </span>
        </h2>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Comece grátis. Faça upgrade quando quiser. Cancele a qualquer momento.
        </p>
      </div>

      {/* Launch banner */}
      <div className="mx-auto mt-8 max-w-md rounded-2xl border border-[var(--brand-coral-500)]/30 bg-[var(--brand-coral-500)]/8 px-5 py-3 text-center">
        <div className="text-xs font-bold uppercase tracking-wider text-[var(--brand-coral-500)]">
          Preço especial de lançamento
        </div>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Assine agora e mantenha esse valor enquanto sua assinatura estiver ativa.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {PLANS.map((p) => (
          <PricingCard key={p.name} plan={p} onSelect={onSelect}/>
        ))}
      </div>

      {/* Trust */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-[var(--muted-foreground)]">
        {["Sem cartão no gratuito", "Cancele quando quiser", "Sem fidelidade", "Suas fotos são seguras"].map(t => (
          <span key={t} className="flex items-center gap-1.5">
            <Icon.Check size={14} className="text-[var(--success)]"/> {t}
          </span>
        ))}
      </div>
    </div>
  </section>
);

const PricingCard = ({ plan, onSelect }) => {
  const isPremium = plan.name === "Premium";
  return (
    <div className={
      "relative flex flex-col rounded-[28px] border bg-[var(--card)] p-7 transition-all duration-300 " +
      "[transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 " +
      (isPremium
        ? "border-[var(--primary)]/40 shadow-[var(--shadow-elegant)] ring-2 ring-[var(--primary)]/20 scale-[1.02]"
        : "border-[var(--border)] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-elegant)]")
    }>
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Pill tone="primary" className="!text-[10px] !font-bold shadow-sm">
            <Icon.Star size={10}/> {plan.badge}
          </Pill>
        </div>
      )}

      <div className="mb-4">
        <h3 style={{ fontFamily: "var(--font-display)" }}
            className="text-xl font-bold text-[var(--foreground)]">{plan.name}</h3>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{plan.desc}</p>
      </div>

      <div className="mb-5">
        <span style={{ fontFamily: "var(--font-display)" }}
              className="text-[40px] font-bold leading-none tracking-tight text-[var(--foreground)]">
          {plan.price}
        </span>
        <span className="ml-1 text-sm text-[var(--muted-foreground)]">{plan.period}</span>
        {plan.launch && (
          <div className="mt-1">
            <span className="rounded-full bg-[var(--brand-coral-500)]/12 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-coral-500)]">
              Preço de lançamento
            </span>
          </div>
        )}
      </div>

      <Button variant={plan.ctaVariant} className="mb-5 w-full !h-12"
              onClick={() => onSelect?.(plan.name)}>
        {plan.cta}
      </Button>

      <ul className="flex-1 space-y-2.5">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
            <Icon.Check size={15} className="mt-0.5 flex-shrink-0 text-[var(--success)]"/>
            <span>{f}</span>
          </li>
        ))}
        {plan.excluded?.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm text-[var(--muted-foreground)] line-through opacity-50">
            <Icon.X size={15} className="mt-0.5 flex-shrink-0"/>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

window.Pricing = Pricing;
