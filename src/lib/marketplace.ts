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

const LISTING_SELECT = `
  *,
  category:marketplace_categories(*),
  condition:marketplace_conditions(*),
  seller:profiles!marketplace_listings_seller_id_fkey(id, display_name, username, avatar_url)
` as const;

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
  return (data || []) as MarketplaceListing[];
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
  return (data as MarketplaceListing) || null;
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
  return ((data as any[]) || []) as MarketplaceListing[];
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
  return ((data as any[]) || []) as MarketplaceListing[];
}
