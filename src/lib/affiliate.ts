import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Store = Database["public"]["Enums"]["product_store"];

const STORE_NORMALIZE: Record<string, Store> = {
  "Amazon BR": "amazon_br",
  "Mercado Livre": "mercado_livre",
  Kabum: "kabum",
  Magalu: "magalu",
  Pichau: "pichau",
  Outro: "outro",
};

export function normalizeStore(raw: string): Store {
  if (raw in STORE_NORMALIZE) return STORE_NORMALIZE[raw];
  return raw as Store; // already an enum value
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
