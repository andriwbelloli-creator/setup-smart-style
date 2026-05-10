import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/hooks/use-auth";
import { Check, Sparkles, Crown, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/premium")({
  head: () => ({
    meta: [
      { title: "Premium · Deskly" },
      {
        name: "description",
        content:
          "Análise IA ilimitada, recomendações personalizadas, sem anúncios. Deskly Premium a partir de R$ 9,90/mês.",
      },
    ],
  }),
  component: Premium,
});

type Plan = {
  id: string;
  tier: "free" | "premium" | "pro";
  name: string;
  description: string | null;
  price_cents_brl: number;
  features: string[];
};

const TIER_ICON = {
  free: Sparkles,
  premium: Zap,
  pro: Crown,
} as const;

const TIER_COLOR = {
  free: "border-border",
  premium: "border-primary ring-2 ring-primary",
  pro: "border-accent ring-2 ring-accent",
} as const;

function fmtBRL(cents: number) {
  if (cents === 0) return "Grátis";
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function Premium() {
  const { user } = useAuth();
  const { tier: currentTier, loading: subLoading } = useSubscription();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("subscription_plans")
      .select("*")
      .eq("active", true)
      .order("price_cents_brl", { ascending: true })
      .then(({ data }) => {
        if (cancelled) return;
        setPlans(((data as any[]) || []).map((p) => ({ ...p, features: Array.isArray(p.features) ? p.features : [] })));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubscribe = (tier: Plan["tier"]) => {
    if (!user) {
      toast.error("Faça login pra assinar.");
      return;
    }
    if (tier === currentTier) {
      toast.message("Você já está nesse plano.");
      return;
    }
    if (tier === "free") {
      toast.message("Pra fazer downgrade, contate suporte temporariamente.");
      return;
    }
    // TODO: replace with Stripe Checkout once VITE_STRIPE_PUBLISHABLE_KEY is set
    toast.info("Checkout em construção. Em breve aceitamos cartão e PIX!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:px-6 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> Deskly Premium
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Tire o máximo do seu home office
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Análise IA ilimitada, recomendações personalizadas, sem anúncios. Cancele quando quiser.
          </p>
        </div>

        {loading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mx-auto mt-16 grid max-w-5xl gap-6 lg:grid-cols-3">
            {plans.map((plan) => {
              const Icon = TIER_ICON[plan.tier];
              const isCurrent = plan.tier === currentTier && !subLoading;
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-3xl border-2 bg-card p-8 shadow-soft transition-smooth ${TIER_COLOR[plan.tier]} ${plan.tier === "premium" ? "lg:scale-105" : ""}`}
                >
                  {plan.tier === "premium" && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                      Mais popular
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground shadow-elegant">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="font-display text-2xl font-bold">{plan.name}</h2>
                  </div>
                  {plan.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                  )}
                  <div className="mt-6">
                    <span className="font-display text-4xl font-bold">{fmtBRL(plan.price_cents_brl)}</span>
                    {plan.price_cents_brl > 0 && (
                      <span className="ml-1 text-sm text-muted-foreground">/mês</span>
                    )}
                  </div>
                  <ul className="mt-6 space-y-3 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    {isCurrent ? (
                      <Button disabled className="w-full" variant="outline">
                        Seu plano atual
                      </Button>
                    ) : plan.tier === "free" ? (
                      user ? (
                        <Button disabled className="w-full" variant="outline">
                          Plano padrão
                        </Button>
                      ) : (
                        <Button asChild variant="outline" className="w-full">
                          <Link to="/auth">Criar conta grátis</Link>
                        </Button>
                      )
                    ) : (
                      <Button onClick={() => handleSubscribe(plan.tier)} className="w-full bg-gradient-hero shadow-elegant">
                        Assinar {plan.name}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mx-auto mt-16 max-w-2xl rounded-3xl border border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-soft">
          <strong className="text-foreground">FAQ rápido:</strong> Sem cartão pra começar. Cancele com 1 clique a qualquer momento. Pagamento via cartão ou PIX (em breve). Garantia de 7 dias.
        </div>
      </main>
      <Footer />
    </div>
  );
}
