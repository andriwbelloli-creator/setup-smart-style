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
      { title: "Premium · HomeOfficeLife" },
      {
        name: "description",
        content:
          "Análise IA ilimitada, recomendações personalizadas, sem anúncios. Premium a partir de R$ 9,90/mês.",
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

// Janela em que o banner de recovery aparece após o usuário ter
// batido o paywall. Depois disso o desconto expira (urgência).
const RECOVERY_WINDOW_DAYS = 7;

function Premium() {
  const { user } = useAuth();
  const { tier: currentTier, loading: subLoading } = useSubscription();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [recoveryEligible, setRecoveryEligible] = useState(false);
  const [recoveryDaysLeft, setRecoveryDaysLeft] = useState(RECOVERY_WINDOW_DAYS);

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

  // Recovery: se o user bateu paywall nos últimos 7 dias e ainda
  // não converteu, mostra banner de desconto.
  useEffect(() => {
    if (!user || currentTier !== "free") {
      setRecoveryEligible(false);
      return;
    }
    let cancelled = false;
    (async () => {
      // Tenta DB primeiro (mais confiável)
      const since = new Date(Date.now() - RECOVERY_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("paywall_events")
        .select("hit_at")
        .eq("user_id", user.id)
        .is("converted_at", null)
        .gte("hit_at", since)
        .order("hit_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      let hitAt: string | null = data?.hit_at ?? null;
      // Fallback localStorage (caso tabela ainda não exista)
      if (!hitAt) {
        try { hitAt = localStorage.getItem("deskly:paywall_hit_at"); } catch {}
      }
      if (!hitAt) return;
      const hitTime = new Date(hitAt).getTime();
      const elapsed = (Date.now() - hitTime) / (24 * 60 * 60 * 1000);
      if (elapsed < RECOVERY_WINDOW_DAYS) {
        setRecoveryEligible(true);
        setRecoveryDaysLeft(Math.max(1, Math.ceil(RECOVERY_WINDOW_DAYS - elapsed)));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, currentTier]);

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleSubscribe = async (tier: Plan["tier"]) => {
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
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          tier,
          userId: user.id,
          email: user.email,
          returnUrl: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Checkout URL não retornada");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao criar checkout";
      toast.error(msg);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:px-6 md:py-20">
        {recoveryEligible && (
          <div className="mx-auto mb-10 max-w-3xl rounded-3xl border-2 border-accent bg-gradient-to-r from-accent/15 via-card to-coral/15 p-5 shadow-elegant md:p-6">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-elegant">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-coral px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-coral-foreground">
                    Desconto especial · expira em {recoveryDaysLeft} dia{recoveryDaysLeft === 1 ? "" : "s"}
                  </div>
                  <div className="mt-2 font-display text-xl font-bold leading-tight md:text-2xl">
                    Volta com <span className="text-coral">20% off no 1º mês</span> 🎁
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Como você já testou suas 3 análises grátis, garantimos um desconto
                    só pra você experimentar o Premium sem compromisso. Use o cupom
                    {" "}<code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs font-bold text-foreground">VOLTA20</code>
                    {" "}no checkout.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> Premium
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
                      <Button
                        onClick={() => handleSubscribe(plan.tier)}
                        disabled={checkoutLoading}
                        className="w-full bg-gradient-hero shadow-elegant"
                      >
                        {checkoutLoading ? "Abrindo..." : `Assinar ${plan.name}`}
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
