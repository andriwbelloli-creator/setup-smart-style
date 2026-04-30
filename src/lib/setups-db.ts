import { supabase } from "@/integrations/supabase/client";
import type { Setup, Product } from "@/data/setups";

export type DbSetupRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  city: string | null;
  budget_brl: number;
  career: string | null;
  styles: string[];
  cover_url: string | null;
  ai_score: number | null;
  likes_count: number;
  saves_count: number;
  owner_id: string;
  status: string;
  created_at: string;
  profiles?: { username: string; display_name: string; avatar_url: string | null } | null;
};

const roleMap: Record<string, Setup["authorRole"]> = {
  dev: "Dev", designer: "Designer", po: "PO/PM", creator: "Creator", remoto: "Remoto", outro: "Remoto",
};

export function rowToSetup(r: DbSetupRow, products: Product[] = []): Setup {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    author: r.profiles ? `@${r.profiles.username}` : "@deskly",
    authorRole: roleMap[r.career || "outro"] || "Remoto",
    city: r.city || "Brasil",
    image: r.cover_url || "",
    score: r.ai_score ? Number(r.ai_score) : 0,
    likes: r.likes_count,
    saves: r.saves_count,
    styles: r.styles || [],
    budget: r.budget_brl,
    description: r.description,
    products,
  };
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export async function fetchPublishedSetups(): Promise<Setup[]> {
  const { data, error } = await supabase
    .from("setups")
    .select("*, profiles!setups_owner_id_fkey(username, display_name, avatar_url)")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) {
    // fallback: try without join
    const r = await supabase.from("setups").select("*").eq("status", "published").order("created_at", { ascending: false });
    return (r.data || []).map((row: any) => rowToSetup(row));
  }
  return (data || []).map((row: any) => rowToSetup(row));
}

export async function fetchSetupBySlug(slug: string): Promise<Setup | null> {
  const { data: setup } = await supabase
    .from("setups")
    .select("*, profiles!setups_owner_id_fkey(username, display_name, avatar_url)")
    .eq("slug", slug)
    .maybeSingle();
  if (!setup) {
    const r = await supabase.from("setups").select("*").eq("slug", slug).maybeSingle();
    if (!r.data) return null;
    const products = await fetchProducts(r.data.id);
    return rowToSetup(r.data as any, products);
  }
  const products = await fetchProducts((setup as any).id);
  return rowToSetup(setup as any, products);
}

async function fetchProducts(setupId: string): Promise<Product[]> {
  const { data } = await supabase
    .from("setup_products")
    .select("*")
    .eq("setup_id", setupId)
    .order("position", { ascending: true });
  return (data || []).map((p: any) => ({
    id: p.id,
    category: p.category,
    name: p.name,
    brand: p.brand || "",
    price: p.price_brl,
    store: p.store,
    rating: p.rating || 4.5,
    affiliateUrl: p.affiliate_url || "#",
    x: Number(p.x),
    y: Number(p.y),
  }));
}