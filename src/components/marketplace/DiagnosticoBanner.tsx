import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

// Mapeia o pior critério da IA pra termo de busca + label amigável.
const CRITERIO_TO_SEARCH: Record<string, { label: string; query: string }> = {
  ergonomia: { label: "Ergonomia", query: "cadeira ergonomica" },
  iluminacao: { label: "Iluminação", query: "luminaria mesa LED" },
  cabos: { label: "Organização de cabos", query: "organizador cabos" },
  organizacao: { label: "Organização", query: "organizador mesa" },
  estetica: { label: "Estética", query: "decoracao home office" },
  produtividade: { label: "Produtividade", query: "monitor 24" },
};

const DISMISS_KEY = "deskly:diagnostico-banner-dismissed";

/**
 * Banner condicional no topo da Loja: se o usuário já fez análise IA,
 * mostra qual critério teve a pior nota + link pra busca filtrada.
 * Pode ser fechado (persiste em localStorage por sessão).
 */
export function DiagnosticoBanner() {
  const { user } = useAuth();
  const [worst, setWorst] = useState<{ key: string; score: number } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (typeof localStorage !== "undefined") {
      const last = localStorage.getItem(DISMISS_KEY);
      // Reabre depois de 7 dias
      if (last && Date.now() - Number(last) < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true);
        return;
      }
    }
    (async () => {
      const { data } = await supabase
        .from("ai_analyses")
        .select("scores")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const scores = (data?.scores as Record<string, number> | null) ?? null;
      if (!scores) return;
      // Acha o critério com pior nota (entre os 6 conhecidos)
      const entries = Object.entries(scores).filter(
        ([k]) => k in CRITERIO_TO_SEARCH,
      );
      if (!entries.length) return;
      entries.sort((a, b) => a[1] - b[1]);
      const [key, score] = entries[0];
      setWorst({ key, score });
    })();
  }, [user]);

  const dismiss = () => {
    setDismissed(true);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
  };

  if (!user || !worst || dismissed) return null;
  const meta = CRITERIO_TO_SEARCH[worst.key];
  if (!meta) return null;

  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-5 shadow-soft md:p-6">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Fechar"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-smooth hover:bg-foreground/5 hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex flex-wrap items-center gap-4 md:flex-nowrap">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-elegant">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-primary">
            Baseado na sua última análise IA
          </div>
          <h3 className="mt-0.5 font-display text-lg font-bold leading-snug md:text-xl">
            Sua pior nota foi em{" "}
            <span className="text-coral">{meta.label}</span> ({worst.score.toFixed(1)}/10).
            Veja produtos que resolvem.
          </h3>
        </div>
        <Link
          to="/marketplace"
          search={{ q: meta.query } as never}
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-smooth hover:scale-[1.02]"
        >
          Ver opções <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
