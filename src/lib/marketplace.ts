import { supabase } from "@/integrations/supabase/client";

export type MarketplaceCategory = {
  id: string;
  slug: string;
  name: string;
  position: number;
};

export type MarketplaceCondition = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  position: number;
};

export type ListingStatus = "active" | "paused" | "sold";

export type MarketplaceListing = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category_id: string;
  condition_id: string;
  images: string[];
  contact: string;
  city: string | null;
  state: string | null;
  status: ListingStatus;
  view_count: number;
  created_at: string;
  updated_at: string;
  // joins opcionais
  category?: MarketplaceCategory | null;
  condition?: MarketplaceCondition | null;
  seller?: { id: string; display_name: string | null; username: string | null; avatar_url: string | null } | null;
};

// marketplace_listings.seller_id referencia auth.users(id), NÃO profiles(id),
// por isso o embed via PostgREST (profiles!...seller_id_fkey) dá erro
// PGRST200. Solução: fetch sem join e hidratar profiles no client via lookup
// separado em profiles(id IN ...).
const LISTING_SELECT = `
  *,
  category:marketplace_categories(*),
  condition:marketplace_conditions(*)
` as const;

async function hydrateSellers(rows: MarketplaceListing[]): Promise<MarketplaceListing[]> {
  if (rows.length === 0) return rows;
  const sellerIds = Array.from(new Set(rows.map((r) => r.seller_id).filter(Boolean)));
  if (sellerIds.length === 0) return rows;
  const { data: profs } = await (supabase as any)
    .from("profiles")
    .select("id, display_name, username, avatar_url")
    .in("id", sellerIds);
  const byId = new Map<string, MarketplaceListing["seller"]>(
    ((profs as any[]) || []).map((p) => [
      p.id as string,
      {
        id: p.id as string,
        display_name: p.display_name as string | null,
        username: p.username as string | null,
        avatar_url: p.avatar_url as string | null,
      },
    ]),
  );
  return rows.map((r) => ({ ...r, seller: byId.get(r.seller_id) ?? null }));
}

export async function fetchCategories(): Promise<MarketplaceCategory[]> {
  const { data, error } = await (supabase as any)
    .from("marketplace_categories")
    .select("*")
    .order("position", { ascending: true });
  if (error) {
    console.warn("[marketplace] categories:", error.message);
    return [];
  }
  return (data || []) as MarketplaceCategory[];
}

export async function fetchConditions(): Promise<MarketplaceCondition[]> {
  const { data, error } = await (supabase as any)
    .from("marketplace_conditions")
    .select("*")
    .order("position", { ascending: true });
  if (error) {
    console.warn("[marketplace] conditions:", error.message);
    return [];
  }
  return (data || []) as MarketplaceCondition[];
}

export type ListingFilters = {
  categoryId?: string;
  conditionId?: string;
  minPrice?: number;
  maxPrice?: number;
  query?: string;
};

export async function fetchActiveListings(filters: ListingFilters = {}): Promise<MarketplaceListing[]> {
  let q = (supabase as any)
    .from("marketplace_listings")
    .select(LISTING_SELECT)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (filters.categoryId)  q = q.eq("category_id", filters.categoryId);
  if (filters.conditionId) q = q.eq("condition_id", filters.conditionId);
  if (typeof filters.minPrice === "number") q = q.gte("price", filters.minPrice);
  if (typeof filters.maxPrice === "number") q = q.lte("price", filters.maxPrice);
  if (filters.query && filters.query.trim()) {
    const s = filters.query.trim().replace(/[%_]/g, "");
    q = q.or(`title.ilike.%${s}%,description.ilike.%${s}%`);
  }

  const { data, error } = await q;
  if (error) {
    console.warn("[marketplace] listings:", error.message);
    return [];
  }
  return hydrateSellers((data || []) as MarketplaceListing[]);
}

export async function fetchListingById(id: string): Promise<MarketplaceListing | null> {
  const { data, error } = await (supabase as any)
    .from("marketplace_listings")
    .select(LISTING_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.warn("[marketplace] listing:", error.message);
    return null;
  }
  if (!data) return null;
  const [hydrated] = await hydrateSellers([data as MarketplaceListing]);
  return hydrated ?? null;
}

export async function incrementViewCount(id: string): Promise<void> {
  // Soft increment, fire-and-forget. Race-safe o suficiente pra MVP.
  const { data } = await (supabase as any)
    .from("marketplace_listings")
    .select("view_count")
    .eq("id", id)
    .maybeSingle();
  if (!data) return;
  await (supabase as any)
    .from("marketplace_listings")
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq("id", id);
}

export type NewListingInput = {
  title: string;
  description: string;
  price: number;
  category_id: string;
  condition_id: string;
  images: string[];
  contact: string;
  city?: string;
  state?: string;
};

export async function createListing(sellerId: string, input: NewListingInput) {
  return (supabase as any)
    .from("marketplace_listings")
    .insert({ seller_id: sellerId, status: "active", ...input })
    .select("id")
    .single();
}

/**
 * Faz upload de uma imagem do anúncio. Caminho = {userId}/{uuid}.{ext}
 * para casar com a policy de storage (foldername[1] = uid).
 */
export async function uploadListingImage(userId: string, file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const up = await supabase.storage.from("marketplace_images").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (up.error) throw up.error;
  const { data: pub } = supabase.storage.from("marketplace_images").getPublicUrl(path);
  return pub.publicUrl;
}

export function formatBrl(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// =====================================================
// PROPOSTAS (offers)
// =====================================================
export type OfferStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export type MarketplaceOffer = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  price_offered: number;
  message: string | null;
  status: OfferStatus;
  created_at: string;
  updated_at: string;
  // joins
  buyer?: { display_name: string | null; username: string | null; avatar_url: string | null } | null;
  listing?: { id: string; title: string; price: number; images: string[]; status: ListingStatus } | null;
};

export async function createOffer(input: {
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  price_offered: number;
  message?: string;
}) {
  return (supabase as any)
    .from("marketplace_offers")
    .insert({
      listing_id: input.listing_id,
      buyer_id: input.buyer_id,
      seller_id: input.seller_id,
      price_offered: input.price_offered,
      message: input.message || null,
      status: "pending",
    })
    .select("id")
    .single();
}

export async function fetchOffersForListing(listingId: string): Promise<MarketplaceOffer[]> {
  const { data, error } = await (supabase as any)
    .from("marketplace_offers")
    .select("*")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false });
  if (error) return [];
  const rows = (data || []) as MarketplaceOffer[];
  const buyerIds = Array.from(new Set(rows.map((r) => r.buyer_id)));
  if (buyerIds.length === 0) return rows;
  const { data: profs } = await (supabase as any)
    .from("profiles")
    .select("id, display_name, username, avatar_url")
    .in("id", buyerIds);
  const byId = new Map<string, any>(((profs as any[]) || []).map((p) => [p.id, p]));
  return rows.map((r) => ({ ...r, buyer: byId.get(r.buyer_id) ?? null }));
}

export async function fetchMyOffers(buyerId: string): Promise<MarketplaceOffer[]> {
  const { data } = await (supabase as any)
    .from("marketplace_offers")
    .select("*, listing:marketplace_listings(id, title, price, images, status)")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });
  return ((data as any[]) || []) as MarketplaceOffer[];
}

export async function updateOfferStatus(offerId: string, status: OfferStatus) {
  return (supabase as any)
    .from("marketplace_offers")
    .update({ status })
    .eq("id", offerId);
}

// =====================================================
// FAVORITOS (saves)
// =====================================================
export async function fetchMySavedListings(userId: string): Promise<MarketplaceListing[]> {
  const { data: saves } = await (supabase as any)
    .from("marketplace_saves")
    .select("listing_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  const ids = ((saves as any[]) || []).map((s) => s.listing_id).filter(Boolean);
  if (ids.length === 0) return [];
  const { data } = await (supabase as any)
    .from("marketplace_listings")
    .select(LISTING_SELECT)
    .in("id", ids);
  return hydrateSellers(((data as any[]) || []) as MarketplaceListing[]);
}

export async function fetchMySaveIds(userId: string): Promise<Set<string>> {
  const { data } = await (supabase as any)
    .from("marketplace_saves")
    .select("listing_id")
    .eq("user_id", userId);
  return new Set(((data as any[]) || []).map((r) => r.listing_id));
}

export async function toggleSaveListing(userId: string, listingId: string, currentlySaved: boolean) {
  if (currentlySaved) {
    return (supabase as any)
      .from("marketplace_saves")
      .delete()
      .eq("user_id", userId)
      .eq("listing_id", listingId);
  }
  return (supabase as any)
    .from("marketplace_saves")
    .insert({ user_id: userId, listing_id: listingId });
}

// =====================================================
// Ações do dono: mudança de status, deleção
// =====================================================
export async function updateListingStatus(listingId: string, status: ListingStatus) {
  return (supabase as any)
    .from("marketplace_listings")
    .update({ status })
    .eq("id", listingId);
}

export async function deleteListing(listingId: string) {
  return (supabase as any)
    .from("marketplace_listings")
    .delete()
    .eq("id", listingId);
}

export async function fetchMyListings(sellerId: string): Promise<MarketplaceListing[]> {
  const { data } = await (supabase as any)
    .from("marketplace_listings")
    .select(LISTING_SELECT)
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });
  return hydrateSellers(((data as any[]) || []) as MarketplaceListing[]);
}

// =====================================================
// CROSS-SELLING IA / Setup → Marketplace
// =====================================================
// Dada uma lista de produtos (do setup ou da IA), busca anúncios no
// marketplace que match por categoria + palavras-chave do nome. Retorna
// um Map productId -> melhor match (menor preço encontrado).
//
// Heurística de match: extraímos as 2 primeiras palavras significativas
// do nome do produto e fazemos um or-ilike. Imperfeito mas suficiente
// pra MVP. Filtra só listings active com preço < ref_price (sempre vale
// a pena exibir se mais barato).
//
// Categoria mapeamento: produtos do setup têm category livre ("Monitor",
// "Cadeira"); marketplace tem categorias com slugs. Mapeamos no client.
const CATEGORY_TO_MARKETPLACE_SLUG: Record<string, string> = {
  Monitor: "monitores",
  Cadeira: "cadeiras",
  Mesa: "mesas",
  Teclado: "teclados",
  Mouse: "mouses",
  Áudio: "audio",
  Audio: "audio",
  Iluminação: "iluminacao",
  Iluminacao: "iluminacao",
  Webcam: "webcams",
  Notebook: "notebooks",
};

export type CrossSellInput = {
  product_id: string;
  category: string;
  name: string;
  ref_price: number;
};

export type CrossSellMatch = {
  product_id: string;
  listing: MarketplaceListing;
  savings: number;
};

function extractKeywords(name: string): string[] {
  // Pega palavras com 4+ letras, ignorando palavras muito genéricas
  const stopwords = new Set([
    "para", "com", "polegadas", "pulgadas", "high", "definition", "monitor",
    "cadeira", "mesa", "novo", "modelo", "sem", "fios",
  ]);
  return name
    .toLowerCase()
    .replace(/[^a-z0-9á-ú\s]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !stopwords.has(w))
    .slice(0, 2);
}

export async function fetchCrossSellMatches(
  products: CrossSellInput[],
): Promise<Map<string, CrossSellMatch>> {
  const matches = new Map<string, CrossSellMatch>();
  if (products.length === 0) return matches;

  // 1) Resolve categorias do marketplace que aparecem nos produtos
  const allSlugs = new Set<string>();
  for (const p of products) {
    const slug = CATEGORY_TO_MARKETPLACE_SLUG[p.category];
    if (slug) allSlugs.add(slug);
  }
  if (allSlugs.size === 0) return matches;

  const { data: cats } = await (supabase as any)
    .from("marketplace_categories")
    .select("id, slug")
    .in("slug", Array.from(allSlugs));
  const catBySlug = new Map<string, string>(
    ((cats as any[]) || []).map((c) => [c.slug as string, c.id as string]),
  );

  // 2) Busca listings active das categorias relevantes (1 query batch)
  const catIds = Array.from(catBySlug.values());
  if (catIds.length === 0) return matches;

  const { data: listings } = await (supabase as any)
    .from("marketplace_listings")
    .select(LISTING_SELECT)
    .in("category_id", catIds)
    .eq("status", "active")
    .order("price", { ascending: true });

  const allListings = ((listings as any[]) || []) as MarketplaceListing[];

  // 3) Pra cada produto, busca melhor match no client
  for (const p of products) {
    const slug = CATEGORY_TO_MARKETPLACE_SLUG[p.category];
    if (!slug) continue;
    const catId = catBySlug.get(slug);
    if (!catId) continue;
    const keywords = extractKeywords(p.name);
    if (keywords.length === 0) continue;

    const candidates = allListings.filter(
      (l) =>
        l.category_id === catId &&
        Number(l.price) < p.ref_price &&
        keywords.some((kw) => l.title.toLowerCase().includes(kw)),
    );
    if (candidates.length === 0) continue;
    // Já vem ordenado por preço asc → primeiro é o mais barato com match
    const best = candidates[0];
    matches.set(p.product_id, {
      product_id: p.product_id,
      listing: best,
      savings: Math.round(p.ref_price - Number(best.price)),
    });
  }

  return matches;
}
