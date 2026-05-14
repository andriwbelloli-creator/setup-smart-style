import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Store = Database["public"]["Enums"]["product_store"];

const STORE_NORMALIZE: Record<string, Store> = {
  "Amazon BR": "amazon_br",
  "Mercado Livre": "mercado_livre",
  Kabum: "kabum",
  Magalu: "magalu",
  Pichau: "pichau",
  // Parceiros de móveis/decoração — usados pelos novos touchpoints
  // (cortinas, plantas, luminárias, papel de parede, estantes).
  "Tok&Stok": "tokstok" as Store,
  "Tok Stok": "tokstok" as Store,
  "MadeiraMadeira": "madeira_madeira" as Store,
  "Madeira Madeira": "madeira_madeira" as Store,
  Westwing: "westwing" as Store,
  "Leroy Merlin": "leroy_merlin" as Store,
  Etna: "etna" as Store,
  Camicado: "camicado" as Store,
  Mobly: "mobly" as Store,
  Outro: "outro",
};

export function normalizeStore(raw: string): Store {
  if (raw in STORE_NORMALIZE) return STORE_NORMALIZE[raw];
  return raw as Store; // already an enum value
}

/**
 * Comissão média estimada por loja, usada nos cálculos do dashboard.
 * Valores baseados nas faixas oficiais 2026 (eletrônicos/periféricos).
 */
const COMMISSION_RATE: Record<Store, number> = {
  amazon_br: 0.04,
  mercado_livre: 0.05,
  kabum: 0.053,
  magalu: 0.04,
  pichau: 0.063,
  // Parceiros móveis/decoração — taxas iniciais conservadoras (4–7%).
  // Negociar via Lomadee/Awin/programa próprio antes de produzir.
  tokstok: 0.05,
  madeira_madeira: 0.06,
  westwing: 0.07,
  leroy_merlin: 0.04,
  etna: 0.05,
  camicado: 0.05,
  mobly: 0.05,
  outro: 0.03,
} as Record<Store, number>;

export function commissionForStore(store: Store, priceCents: number): number {
  const rate = COMMISSION_RATE[store] ?? 0.03;
  return Math.round(priceCents * rate);
}

export function commissionRate(store: Store): number {
  return COMMISSION_RATE[store] ?? 0.03;
}

/**
 * Track an outbound click on a product affiliate link.
 * Fire-and-forget; never throws, never blocks navigation.
 */
export function trackAffiliateClick(input: {
  productId: string;
  setupId?: string;
  store: Store;
}): void {
  // Microtask + no await so the click → window.open happens immediately.
  queueMicrotask(() => {
    supabase
      .from("affiliate_clicks")
      .insert({
        product_id: input.productId,
        setup_id: input.setupId ?? null,
        store: input.store,
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 200) : null,
      })
      .then(({ error }) => {
        if (error) console.warn("[affiliate] click tracking failed:", error.message);
      });
  });
}

/**
 * Append our tracking ID + UTMs to an affiliate URL.
 * Each partner has slightly different conventions; this normalizes them.
 */
const TAG_BY_STORE: Partial<Record<Store, { param: string; value: string }>> = {
  amazon_br: { param: "tag", value: "deskly02-20" },
  mercado_livre: { param: "tracking_id", value: "belloliandriw" },
  // magalu uses path rewrite, not query param — see below
};

const MAGALU_CHANNEL = "magazinedesklylife";

/**
 * Cloaked affiliate href: aponta para o redirect interno /r/<productId>.
 * O servidor (start.js) resolve a affiliate_url no DB e faz 302.
 * Mantém o DOM sem URLs de Amazon/ML/Kabum expostas — dificulta scraping
 * cego de strings e troca de tags de afiliado por terceiros.
 */
export function affiliateHref(productId: string): string {
  return `/r/${productId}`;
}

export function decorateAffiliateUrl(url: string, store: Store): string {
  try {
    const u = new URL(url);

    // Magalu: rewrite magazineluiza.com.br → magazinevoce.com.br/<channel>
    if (store === "magalu" && /(^|\.)magazineluiza\.com\.br$/i.test(u.hostname)) {
      u.hostname = "www.magazinevoce.com.br";
      const path = u.pathname.startsWith("/") ? u.pathname : `/${u.pathname}`;
      u.pathname = `/${MAGALU_CHANNEL}${path}`;
    }

    const partner = TAG_BY_STORE[store];
    if (partner && !u.searchParams.has(partner.param)) {
      u.searchParams.set(partner.param, partner.value);
    }
    // Generic UTM for analytics on any store
    if (!u.searchParams.has("utm_source")) u.searchParams.set("utm_source", "deskly");
    if (!u.searchParams.has("utm_medium")) u.searchParams.set("utm_medium", "affiliate");
    return u.toString();
  } catch {
    return url; // Malformed URL — return as-is
  }
}
