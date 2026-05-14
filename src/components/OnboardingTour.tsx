import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, Sparkles, Image, ShoppingBag, Crown } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { track } from "@/lib/track";
import { hasConsent } from "@/lib/consent";

// Onboarding tour — modal de boas-vindas pós-signup mostrando os 4
// pilares do produto. Aparece 1x por usuário (controle via localStorage
// E flag no Supabase futuramente).
//
// Disparo: monta no __root, verifica se usuário logou recentemente AND
// não viu o tour ainda. Mostra após 1.5s pra não competir com toast
// de boas-vindas / loading inicial.
//
// Tracking: cada step é um evento, dismiss/complete são separados —
// permite calcular drop-off por step.

const STORAGE_KEY = "deskly:tour_shown";
const DELAY_MS = 1500;

type Step = {
  icon: typeof Sparkles;
  title: string;
  body: string;
  cta: { label: string; to: string };
};

const STEPS: Step[] = [
  {
    icon: Sparkles,
    title: "Avalie seu setup com IA em 30s",
    body: "Mande uma foto do seu home office e a IA brasileira analisa ergonomia, iluminação, cabos e estética. 3 análises grátis sem cartão.",
    cta: { label: "Fazer análise agora", to: "/diagnostico" },
  },
  {
    icon: Image,
    title: "Inspire-se com a comunidade",
    body: "Galeria de setups reais de devs, designers, psicólogos, advogados e mais — apartamentos brasileiros, soluções de verdade.",
    cta: { label: "Explorar galeria", to: "/galeria" },
  },
  {
    icon: ShoppingBag,
    title: "Compre e venda usados",
    body: "Loja P2P de equipamentos de home office. Monitor, cadeira, mesa — sem taxa pra anunciar, direto entre pessoas no Brasil.",
    cta: { label: "Ver loja", to: "/marketplace" },
  },
  {
    icon: Crown,
    title: "Quer mais? Premium libera",
    body: "Análises ilimitadas, comparador de setups, plano de ação detalhado, lista de compras priorizada por orçamento.",
    cta: { label: "Conhecer Premium", to: "/premium" },
  },
];

export function OnboardingTour() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (loading || !user) return;
    if (!hasConsent()) return; // respeita cookie consent

    // Já viu o tour?
    try {
      const shown = localStorage.getItem(STORAGE_KEY);
      if (shown) return;
    } catch {}

    const t = setTimeout(() => {
      setOpen(true);
      track("onboarding_tour_shown", "other", {});
    }, DELAY_MS);
    return () => clearTimeout(t);
  }, [user, loading]);

  const markShown = () => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {}
  };

  const next = () => {
    if (step >= STEPS.length - 1) {
      complete();
      return;
    }
    track("onboarding_tour_next", "other", { from_step: step });
    setStep(step + 1);
  };

  const dismiss = () => {
    track("onboarding_tour_dismissed", "other", { at_step: step });
    markShown();
    setOpen(false);
  };

  const complete = () => {
    track("onboarding_tour_completed", "other", {});
    markShown();
    setOpen(false);
  };

  if (!open) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-labelledby="tour-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 px-4 backdrop-blur-sm md:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-elegant md:p-8">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-hero text-primary-foreground">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Fechar tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-primary">
          Passo {step + 1} de {STEPS.length}
        </div>

        <h2 id="tour-title" className="mt-2 font-display text-2xl font-bold tracking-tight">
          {current.title}
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {current.body}
        </p>

        {/* Progress dots */}
        <div className="mt-5 flex gap-1.5" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={STEPS.length}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-secondary"
              }`}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Pular tour
          </button>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" onClick={() => { track("onboarding_tour_cta_click", "other", { step, to: current.cta.to }); markShown(); setOpen(false); }}>
              <Link to={current.cta.to}>{current.cta.label}</Link>
            </Button>
            <Button size="sm" onClick={next} className="gap-1.5 bg-gradient-hero">
              {isLast ? "Concluir" : "Próximo"}
              {!isLast && <ArrowRight className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
