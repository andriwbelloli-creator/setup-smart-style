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
/**
 * Tag / tracking ID por loja com programa de afiliado direto (não via rede).
 * Quando uma loja entra num programa próprio com query param de affiliate,
 * adiciona aqui. Pra redes (Awin/Lomadee) usamos um wrapper diferente — ver
 * AFFILIATE_NETWORK_BY_STORE abaixo.
 *
 * ✅ Ativo: Amazon BR, Mercado Livre, Magalu (via canal — usa path rewrite)
 * 🟡 Pendente cadastro: Shopee (programa próprio)
 */
const TAG_BY_STORE: Partial<Record<Store, { param: string; value: string }>> = {
  amazon_br: { param: "tag", value: "deskly02-20" },
  mercado_livre: { param: "tracking_id", value: "belloliandriw" },
  // magalu uses path rewrite, not query param — see below

  // PENDENTE CADASTRO:
  // shopee: { param: "smtt", value: "<shopee-tracking-id>" },
};

const MAGALU_CHANNEL = "magazinedesklylife";

/**
 * Lojas BR que operam via rede de afiliados (Awin / Lomadee) — não têm
 * programa próprio direto com query param. Pra essas, geramos o link
 * usando o DeepLink Generator da rede correspondente.
 *
 * Status (preencher os IDs quando os cadastros forem aprovados):
 *
 * AWIN BR — uma conta cobre 5 lojas. Cadastro: https://www.awin.com/br/cadastro-de-publicacao
 *   - Tok&Stok        (advertiser id: ___)
 *   - MadeiraMadeira  (advertiser id: ___)
 *   - Westwing        (advertiser id: ___)
 *   - Leroy Merlin    (advertiser id: ___)
 *   - Camicado        (advertiser id: ___)
 *   Awin publisher id (afiliado): ___
 *
 * LOMADEE — uma conta cobre 4 lojas. Cadastro: https://lomadee.com/cadastro
 *   - Kabum   (sourceId / programa: ___)
 *   - Pichau  (sourceId / programa: ___)
 *   - Etna    (sourceId / programa: ___)
 *   - Mobly   (sourceId / programa: ___)
 *   Lomadee publisher id (sourceId base): ___
 */
type AffiliateNetwork = "awin" | "lomadee" | null;

interface AwinConfig {
  type: "awin";
  advertiserId: string; // id do anunciante na Awin
}
interface LomadeeConfig {
  type: "lomadee";
  sourceId: string; // id do programa na Lomadee
}

const AFFILIATE_NETWORK_BY_STORE: Partial<Record<Store, AwinConfig | LomadeeConfig>> = {
  // Awin BR — descomentar e preencher advertiserId quando cadastros aprovados
  // tokstok:         { type: "awin", advertiserId: "" },
  // madeira_madeira: { type: "awin", advertiserId: "" },
  // westwing:        { type: "awin", advertiserId: "" },
  // leroy_merlin:    { type: "awin", advertiserId: "" },
  // camicado:        { type: "awin", advertiserId: "" },

  // Lomadee — descomentar e preencher sourceId quando cadastros aprovados
  // kabum:  { type: "lomadee", sourceId: "" },
  // pichau: { type: "lomadee", sourceId: "" },
  // etna:   { type: "lomadee", sourceId: "" },
  // mobly:  { type: "lomadee", sourceId: "" },
};

/**
 * IDs globais das redes — só precisam ser definidos uma vez.
 * Pegam da env via VITE_ pra não vazar no código.
 */
const AWIN_PUBLISHER_ID =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_AWIN_PUBLISHER_ID) || "";
const LOMADEE_SOURCE_ID =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_LOMADEE_SOURCE_ID) || "";

function wrapWithNetwork(
  url: string,
  cfg: AwinConfig | LomadeeConfig,
): string {
  // Não wrappa sem ID configurado — devolve url direta (perde comissão mas não quebra link)
  if (cfg.type === "awin") {
    if (!AWIN_PUBLISHER_ID || !cfg.advertiserId) return url;
    const u = new URL("https://www.awin1.com/cread.php");
    u.searchParams.set("awinmid", cfg.advertiserId);
    u.searchParams.set("awinaffid", AWIN_PUBLISHER_ID);
    u.searchParams.set("ued", url);
    return u.toString();
  }
  if (cfg.type === "lomadee") {
    if (!LOMADEE_SOURCE_ID || !cfg.sourceId) return url;
    // Lomadee deeplink padrão — pode variar conforme programa. Conferir docs Lomadee.
    const u = new URL("https://redirect.lomadee.com/v2/deeplink");
    u.searchParams.set("sourceId", LOMADEE_SOURCE_ID);
    u.searchParams.set("url", url);
    return u.toString();
  }
  return url;
}

/**
 * Cloaked affiliate href: aponta para o redirect interno /r/<productId>.
 * O servidor (start.js) resolve a affiliate_url no DB e faz 302.
 * Mantém o DOM sem URLs de Amazon/ML/Kabum expostas — dificulta scraping
 * cego de strings e troca de tags de afiliado por terceiros.
 *
 * Aceita string (productId) pra retrocompat, ou objeto produto com
 * fallback pra affiliateUrl direta quando setup é file-only (sem DB).
 */
export function affiliateHref(
  input: string | { id: string; affiliateUrl?: string },
): string {
  if (typeof input === "string") return `/r/${input}`;
  // Produto curado em file (id >= 27, sem seed no DB) traz URL direta —
  // perde o cloaking mas garante que click funciona end-to-end.
  if (input.affiliateUrl && input.affiliateUrl !== "#" && input.affiliateUrl !== "") {
    return input.affiliateUrl;
  }
  return `/r/${input.id}`;
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

    const finalUrl = u.toString();

    // Se a loja opera via rede (Awin / Lomadee), wrappa a URL final.
    // Quando os IDs não estão configurados, devolve a URL direta sem wrapper
    // (perde comissão mas não quebra o click).
    const network = AFFILIATE_NETWORK_BY_STORE[store];
    if (network) return wrapWithNetwork(finalUrl, network);

    return finalUrl;
  } catch {
    return url; // Malformed URL — return as-is
  }
}
