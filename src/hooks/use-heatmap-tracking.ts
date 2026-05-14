import { useEffect, useRef } from "react";
import { track } from "@/lib/track";
import { hasConsent } from "@/lib/consent";

// Coleta de dados pra heatmap admin — anonimizada, agregada.
//
// O QUE COLETA:
//  - click: x/y normalizados (0–1), viewport, page path, tag do elemento clicado
//  - scroll_depth: % máximo da página que o usuário rolou (1 evento por sessão por página)
//
// O QUE NÃO COLETA:
//  - texto digitado, conteúdo de inputs, valores de formulário
//  - movimento contínuo do mouse (caro e baixa utilidade)
//  - screenshots, replays
//
// LGPD/PRIVACY:
//  - Roda só com cookie consent aceito
//  - anon_id já é gerado pelo track() — não adiciona identificador
//  - Throttle de cliques pra evitar abuse (max 1 click/100ms)
//  - Eventos de scroll_depth disparam só ao mudar de bucket (25%, 50%, 75%, 100%)

const CLICK_THROTTLE_MS = 100;
const SCROLL_BUCKETS = [25, 50, 75, 100] as const;

export function useHeatmapTracking() {
  const lastClickAt = useRef(0);
  const scrollBucketsHit = useRef<Set<number>>(new Set());
  const currentPath = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasConsent()) return;

    const onClick = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastClickAt.current < CLICK_THROTTLE_MS) return;
      lastClickAt.current = now;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const vw = window.innerWidth || 1;
      const vh = window.innerHeight || 1;

      // Normaliza coords pra comparar entre viewports diferentes
      const x_norm = +(e.clientX / vw).toFixed(4);
      const y_norm = +(e.clientY / vh).toFixed(4);

      // Tag + dataset pra distinguir tipos de elemento sem capturar texto
      const tag = target.tagName?.toLowerCase() || "unknown";
      const role = target.getAttribute("role") || undefined;
      const dataAction = target.closest("[data-action]")?.getAttribute("data-action") || undefined;

      track("heatmap_click", "other", {
        path: window.location.pathname,
        x_norm,
        y_norm,
        vw,
        vh,
        tag,
        role,
        action: dataAction,
      });
    };

    const onScroll = () => {
      const path = window.location.pathname;
      if (path !== currentPath.current) {
        currentPath.current = path;
        scrollBucketsHit.current.clear();
      }
      const doc = document.documentElement;
      const scrolled = window.scrollY + window.innerHeight;
      const total = doc.scrollHeight || 1;
      const pct = Math.min(100, Math.round((scrolled / total) * 100));

      for (const bucket of SCROLL_BUCKETS) {
        if (pct >= bucket && !scrollBucketsHit.current.has(bucket)) {
          scrollBucketsHit.current.add(bucket);
          track("scroll_depth", "other", { path, bucket });
        }
      }
    };

    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
}
