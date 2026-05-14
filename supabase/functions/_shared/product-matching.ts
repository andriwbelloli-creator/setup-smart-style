// productMatchingService
//
// Recebe um touchpoint e devolve até 3 produtos REAIS do catálogo Supabase.
// Nunca cria URL. IA pode gerar `reason`, mas link sempre vem do banco.
//
// Match em cascata (para de buscar quando achar 3):
//   1. touchpoint_key + profile_type   (match exato)
//   2. touchpoint_key + 'geral'        (fallback de perfil)
//   3. commercial_category             (fallback temático)
//
// Ordenação: priority DESC → tem affiliate_url → priority do partner → preço.
// Filtro: active=TRUE, ao menos uma URL (product_url ou affiliate_url).

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export type ProfileType =
  | "geral" | "dev" | "designer" | "advogado" | "medico" | "psicologo"
  | "professor" | "autonomo" | "consultor" | "criador" | "executivo";

export interface MatchInput {
  touchpoint_key: string;
  profile_type: ProfileType;
  commercial_category?: string;
  budget_range?: string;
  priority?: "high" | "medium" | "low";
}

export interface MatchedProduct {
  id: string;
  product_name: string;
  partner_name: string;
  price?: number | null;
  price_range?: string;
  image_url?: string;
  /** URL resolvida (prefere affiliate_url, fallback product_url) */
  url: string;
  is_affiliate: boolean;
  reason?: string;
}

const MAX_RESULTS = 3;

/**
 * Normaliza um label PT-BR pra touchpoint_key consistente:
 *  - "Luminária"            → "luminaria"
 *  - "Organização de cabos" → "organizador_cabos"
 *  - "Papel de parede"      → "papel_de_parede"
 *  - "Webcam e microfone"   → "webcam_microfone"
 */
export function normalizeTouchpointKey(label: string): string {
  const norm = label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")  // remove acentos
    .toLowerCase()
    .trim();

  // Aliases conhecidos
  const ALIASES: Record<string, string> = {
    "luminaria": "luminaria",
    "luminarias": "luminaria",
    "organizacao de cabos": "organizador_cabos",
    "organizador de cabos": "organizador_cabos",
    "papel de parede": "papel_de_parede",
    "suporte de notebook": "suporte_notebook",
    "webcam e microfone": "webcam_microfone",
    "webcam_microfone": "webcam_microfone",
    "webcam": "webcam_microfone",
    "microfone": "webcam_microfone",
    "cortina": "cortina",
    "cortinas": "cortina",
    "planta": "planta",
    "plantas": "planta",
    "estante": "estante",
    "prateleira": "estante",
    "monitor": "monitor",
    "tapete": "tapete",
    "quadro": "quadro",
    "quadro decorativo": "quadro",
  };
  if (ALIASES[norm]) return ALIASES[norm];

  // Fallback genérico: troca espaço por underscore
  return norm.replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
}

type ProductRow = {
  id: string;
  product_name: string;
  partner_id: string;
  partner_name: string;
  product_url: string | null;
  affiliate_url: string | null;
  image_url: string | null;
  price: number | null;
  price_range: string | null;
  category: string | null;
  commercial_category: string | null;
  priority: number;
  active: boolean;
};

function resolveUrl(p: ProductRow): { url: string; is_affiliate: boolean } | null {
  if (p.affiliate_url && p.affiliate_url.length > 0) {
    return { url: p.affiliate_url, is_affiliate: true };
  }
  if (p.product_url && p.product_url.length > 0) {
    return { url: p.product_url, is_affiliate: false };
  }
  return null;
}

function rank(rows: ProductRow[]): ProductRow[] {
  return [...rows].sort((a, b) => {
    // priority do produto DESC
    if (b.priority !== a.priority) return b.priority - a.priority;
    // tem affiliate_url tem prioridade
    const aA = !!a.affiliate_url, bA = !!b.affiliate_url;
    if (aA !== bA) return aA ? -1 : 1;
    // preço crescente (se ambos tiverem)
    if (a.price != null && b.price != null) return a.price - b.price;
    return 0;
  });
}

function toMatched(p: ProductRow, reason?: string): MatchedProduct | null {
  const resolved = resolveUrl(p);
  if (!resolved) return null;
  return {
    id: p.id,
    product_name: p.product_name,
    partner_name: p.partner_name,
    price: p.price ?? undefined,
    price_range: p.price_range ?? undefined,
    image_url: p.image_url ?? undefined,
    url: resolved.url,
    is_affiliate: resolved.is_affiliate,
    reason,
  };
}

/**
 * Match em cascata. Retorna até MAX_RESULTS. Nunca retorna produto sem URL.
 * `reason` pode ser passado pela camada que chama (Gemini/Claude geram).
 */
export async function matchProducts(
  admin: SupabaseClient,
  input: MatchInput,
  reasonGenerator?: (p: ProductRow) => string | undefined,
): Promise<MatchedProduct[]> {
  const key = input.touchpoint_key;
  const profile = input.profile_type;

  const seen = new Set<string>();
  const out: MatchedProduct[] = [];

  const pushFrom = (rows: ProductRow[]) => {
    for (const p of rank(rows)) {
      if (out.length >= MAX_RESULTS) break;
      if (seen.has(p.id)) continue;
      const matched = toMatched(p, reasonGenerator?.(p));
      if (!matched) continue;
      seen.add(p.id);
      out.push(matched);
    }
  };

  // 1) touchpoint_key + profile_type
  {
    const { data } = await admin
      .from("recommended_products")
      .select("*")
      .eq("active", true)
      .eq("touchpoint_key", key)
      .eq("profile_type", profile);
    if (data && data.length > 0) pushFrom(data as ProductRow[]);
    if (out.length >= MAX_RESULTS) return out;
  }

  // 2) touchpoint_key + 'geral'
  if (profile !== "geral") {
    const { data } = await admin
      .from("recommended_products")
      .select("*")
      .eq("active", true)
      .eq("touchpoint_key", key)
      .eq("profile_type", "geral");
    if (data && data.length > 0) pushFrom(data as ProductRow[]);
    if (out.length >= MAX_RESULTS) return out;
  }

  // 3) commercial_category
  if (input.commercial_category) {
    const { data } = await admin
      .from("recommended_products")
      .select("*")
      .eq("active", true)
      .eq("commercial_category", input.commercial_category);
    if (data && data.length > 0) pushFrom(data as ProductRow[]);
  }

  return out;
}
