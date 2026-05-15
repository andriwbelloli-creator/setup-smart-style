// Deep link engine driven by affiliate_providers no Supabase.
// Substitui o uso hardcoded de TAG_BY_STORE em src/lib/affiliate.ts pra
// cenários novos (recomendações da IA). O fluxo antigo continua funcionando
// pra compatibilidade.

import { supabase } from "@/integrations/supabase/client";

export type AffiliateProviderRow = {
  id: string;
  slug: string;
  name: string;
  network: "direct" | "awin" | "lomadee" | "admitad" | "rakuten" | "impact" | "other";
  status: "active" | "pending" | "paused" | "error";
  affiliate_id: string | null;
  tracking_id: string | null;
  subid_template: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  base_url: string | null;
  deeplink_template: string | null;
  fallback_search_url: string | null;
  commission_estimate: number;
};

export type DeepLinkContext = {
  /** ID do diagnóstico (analyses table) que originou a recomendação */
  diagnosisId?: string;
  /** ID do user logado */
  userId?: string;
  /** ID da sessão anônima */
  sessionId?: string;
  /** Critério da IA: ergonomia, iluminacao, cabos, etc */
  problemCategory?: string;
  /** Categoria do produto: "Monitor", "Cadeira", etc */
  productCategory?: string;
  /** ID do affiliate_product */
  productId?: string;
  /** Página de origem do click */
  sourcePage?: "diagnosis" | "wishlist" | "gallery" | "kit" | "marketplace" | "other";
  /** termo de busca usado no fallback */
  query?: string;
};

/**
 * Gera o subid concatenando os identificadores disponíveis.
 * Usa template do provider se definido, senão concatena com `-`.
 */
function buildSubId(provider: AffiliateProviderRow, ctx: DeepLinkContext): string {
  if (provider.subid_template) {
    return provider.subid_template
      .replace(/{diagnosis_id}/g, ctx.diagnosisId ?? "")
      .replace(/{user_id}/g, ctx.userId ?? "")
      .replace(/{session_id}/g, ctx.sessionId ?? "")
      .replace(/{problem_category}/g, ctx.problemCategory ?? "")
      .replace(/{product_category}/g, ctx.productCategory ?? "")
      .replace(/{product_id}/g, ctx.productId ?? "")
      .replace(/{source_page}/g, ctx.sourcePage ?? "")
      .replace(/-+/g, "-").replace(/^-|-$/g, "");
  }
  return [
    ctx.diagnosisId?.slice(0, 8),
    ctx.problemCategory,
    ctx.productCategory?.toLowerCase().replace(/\s+/g, "_"),
    ctx.sourcePage,
  ].filter(Boolean).join("-");
}

/**
 * Substitui placeholders no template de deep link.
 * Aceita: {base_url}, {affiliate_id}, {tracking_id}, {query},
 *         {utm_source}, {utm_medium}, {utm_campaign}, {subid}
 */
function fillTemplate(template: string, provider: AffiliateProviderRow, query: string, subid: string): string {
  return template
    .replace(/{base_url}/g, provider.base_url ?? "")
    .replace(/{affiliate_id}/g, provider.affiliate_id ?? "")
    .replace(/{tracking_id}/g, provider.tracking_id ?? provider.affiliate_id ?? "")
    .replace(/{query}/g, encodeURIComponent(query))
    .replace(/{query-slug}/g, query.toLowerCase().replace(/\s+/g, "-"))
    .replace(/{utm_source}/g, provider.utm_source ?? "deskly")
    .replace(/{utm_medium}/g, provider.utm_medium ?? "affiliate")
    .replace(/{utm_campaign}/g, provider.utm_campaign ?? "")
    .replace(/{subid}/g, encodeURIComponent(subid));
}

/**
 * Gera URL final pra um produto recomendado.
 *
 * Regras:
 *  1. Se provider.status !== 'active' OU affiliate_id vazio → marca como
 *     "pendente" e usa fallback_search_url (sem comissão mas funciona).
 *  2. Se productUrl direto + deeplink_template definido → usa template.
 *  3. Caso contrário, usa fallback_search_url com a query.
 */
export function generateAffiliateUrl(
  provider: AffiliateProviderRow,
  query: string,
  ctx: DeepLinkContext,
  productUrl?: string,
): { url: string; isPending: boolean } {
  const subid = buildSubId(provider, ctx);
  const isPending = provider.status !== "active" || !provider.affiliate_id;

  // Pending → usa fallback sem affiliate_id
  if (isPending) {
    const fallback = provider.fallback_search_url ?? provider.base_url ?? "";
    return { url: fillTemplate(fallback, provider, query, subid), isPending: true };
  }

  // Active + URL direto + template
  if (productUrl && provider.deeplink_template) {
    const t = provider.deeplink_template.replace(/{product_url}/g, encodeURIComponent(productUrl));
    return { url: fillTemplate(t, provider, query, subid), isPending: false };
  }

  // Active + fallback (busca com tag)
  const fallback = provider.fallback_search_url ?? provider.base_url ?? "";
  return { url: fillTemplate(fallback, provider, query, subid), isPending: false };
}

/**
 * Track evento de affiliate (cliente) — fire-and-forget.
 * Salva linha em affiliate_clicks com TODO o contexto.
 */
export function trackAffiliateDeepClick(input: {
  provider: AffiliateProviderRow;
  ctx: DeepLinkContext;
  finalUrl: string;
}): void {
  queueMicrotask(() => {
    const device = typeof window === "undefined"
      ? "server"
      : /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";

    (supabase as any)
      .from("affiliate_clicks")
      .insert({
        provider_id: input.provider.id,
        affiliate_product_id: input.ctx.productId ?? null,
        diagnosis_id: input.ctx.diagnosisId ?? null,
        user_id: input.ctx.userId ?? null,
        session_id: input.ctx.sessionId ?? null,
        problem_category: input.ctx.problemCategory ?? null,
        product_category: input.ctx.productCategory ?? null,
        source_page: input.ctx.sourcePage ?? "other",
        final_url: input.finalUrl,
        device,
        // colunas legacy mantidas
        store: input.provider.slug.startsWith("amazon")
          ? "amazon_br"
          : input.provider.slug.startsWith("mercado")
          ? "mercado_livre"
          : "outro",
        // product_id legacy — null porque é affiliate_product, não setup_product
        product_id: null,
      })
      .then(({ error }: { error: { message: string } | null }) => {
        if (error) console.warn("[affiliate-deeplink] click tracking:", error.message);
      });
  });
}

/**
 * Busca provider ativo pra uma categoria de problema da IA.
 * Retorna o primeiro da fila de prioridade (filtrado por allowed_categories).
 */
export async function pickProviderForCategory(
  problemCategory: string,
): Promise<AffiliateProviderRow | null> {
  const { data } = await supabase
    .from("affiliate_providers")
    .select("*")
    .eq("status", "active")
    .or(`allowed_categories.cs.{${problemCategory}},allowed_categories.eq.{}`)
    .order("commission_estimate", { ascending: false })
    .limit(1);
  return (data as AffiliateProviderRow[] | null)?.[0] ?? null;
}

/**
 * Lista produtos recomendados pra um problema.
 * Ordena por priority desc + commission desc do provider.
 */
export async function fetchRecommendedProducts(
  problemCategory: string,
  limit = 3,
): Promise<
  Array<{
    id: string;
    name: string;
    category: string;
    image_url: string | null;
    price_range: string | null;
    reason: string | null;
    provider: AffiliateProviderRow;
  }>
> {
  const { data } = await supabase
    .from("affiliate_products")
    .select("*, provider:affiliate_providers!provider_id(*)")
    .eq("problem_category", problemCategory)
    .eq("status", "active")
    .order("priority", { ascending: false })
    .limit(limit);
  return (data as any[]) ?? [];
}
