import { useEffect, useMemo, useRef } from "react";
import { track } from "@/lib/track";

// A/B test infrastructure
//
// USO:
//   const { variant, convert } = useExperiment("hero_cta_v1", ["control", "variant_a", "variant_b"]);
//
//   <Button>{variant === "control" ? "Analisar setup" : variant === "variant_a" ? "Avaliar meu home office" : "Descobrir minha nota"}</Button>
//   <Link onClick={() => convert("clicked_cta")}>...</Link>
//
// COMO FUNCIONA:
//   1. Cada experimento é deterministically bucketed por anon_id (estável entre sessões)
//   2. Distribuição uniforme entre variantes (hash mod N)
//   3. Primeira renderização dispara evento "experiment_exposure" via track()
//   4. convert(action) registra "experiment_conversion" pra calcular lift
//
// ANALYTICS:
//   Eventos chegam em public.analytics_events com:
//     event_name: "experiment_exposure" | "experiment_conversion"
//     props: { experiment, variant, action? }
//
// CONSIDERAÇÕES:
//   - Não bloqueia render (variant é calculado sincronamente)
//   - Funciona com usuários anônimos (anon_id já existe via track())
//   - Não tem feature flag remoto (overkill pra MVP); variantes são código

function hashString(s: string): number {
  // FNV-1a 32-bit — rápido, determinístico, bem distribuído pra strings curtas
  let hash = 2166136261;
  for (let i = 0; i < s.length; i++) {
    hash ^= s.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return hash;
}

function getAnonId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    return localStorage.getItem("deskly:anon_id") || "anon";
  } catch {
    return "anon";
  }
}

export function useExperiment<T extends string>(
  experimentName: string,
  variants: readonly T[],
): { variant: T; convert: (action?: string, props?: Record<string, unknown>) => void } {
  const exposed = useRef(false);

  const variant = useMemo<T>(() => {
    if (variants.length === 0) throw new Error("useExperiment: variants vazio");
    const anonId = getAnonId();
    const key = `${experimentName}::${anonId}`;
    const idx = hashString(key) % variants.length;
    return variants[idx];
  }, [experimentName, variants]);

  // Dispara exposure 1 vez por mount
  useEffect(() => {
    if (exposed.current) return;
    exposed.current = true;
    track("experiment_exposure", "other", {
      experiment: experimentName,
      variant,
    });
  }, [experimentName, variant]);

  const convert = (action?: string, extra?: Record<string, unknown>) => {
    track("experiment_conversion", "other", {
      experiment: experimentName,
      variant,
      action,
      ...extra,
    });
  };

  return { variant, convert };
}
