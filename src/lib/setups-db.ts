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
    author: r.profiles ? `@${r.profiles.username}` : "@homeofficelife",
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

// setups.owner_id referencia auth.users(id), não public.profiles(id).
// Por isso o embed `profiles!setups_owner_id_fkey(...)` dá 400 no PostgREST.
// Solução: lookup separado por owner_id em profiles (profiles.id = auth.users.id).
async function hydrateOwners(rows: DbSetupRow[]): Promise<DbSetupRow[]> {
  if (rows.length === 0) return rows;
  const ownerIds = Array.from(new Set(rows.map((r) => r.owner_id).filter(Boolean)));
  if (ownerIds.length === 0) return rows;
  const { data: profs } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .in("id", ownerIds);
  const byId = new Map<string, DbSetupRow["profiles"]>(
    ((profs as any[]) || []).map((p) => [
      p.id as string,
      { username: p.username, display_name: p.display_name, avatar_url: p.avatar_url },
    ]),
  );
  return rows.map((r) => ({ ...r, profiles: byId.get(r.owner_id) ?? null }));
}

export async function fetchMySetups(ownerId: string): Promise<Setup[]> {
  const { data } = await supabase
    .from("setups")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  const rows = await hydrateOwners(((data as any[]) || []) as DbSetupRow[]);
  return rows.map((row) => rowToSetup(row));
}

export async function fetchPublishedSetups(): Promise<Setup[]> {
  const { data } = await supabase
    .from("setups")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  const rows = await hydrateOwners(((data as any[]) || []) as DbSetupRow[]);

  // Conta touchpoints válidos (x>=0 AND y>=0) por setup pra ordenar: setups
  // com mais produtos posicionados pela IA aparecem primeiro. Setups novos
  // sem touchpoints vão pro fim. Tiebreaker: created_at desc (já vem assim).
  if (rows.length > 0) {
    const setupIds = rows.map((r) => r.id);
    const { data: tps } = await supabase
      .from("setup_products")
      .select("setup_id")
      .in("setup_id", setupIds)
      .gte("x", 0)
      .gte("y", 0);
    const counts = new Map<string, number>();
    for (const tp of ((tps as any[]) || [])) {
      counts.set(tp.setup_id, (counts.get(tp.setup_id) || 0) + 1);
    }
    rows.sort((a, b) => {
      const ca = counts.get(a.id) || 0;
      const cb = counts.get(b.id) || 0;
      if (ca !== cb) return cb - ca;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  return rows.map((row) => rowToSetup(row));
}

export async function fetchSetupBySlug(slug: string): Promise<Setup | null> {
  const { data: setup } = await supabase
    .from("setups")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!setup) return null;
  const [hydrated] = await hydrateOwners([setup as DbSetupRow]);
  const [products, gallery] = await Promise.all([
    fetchProducts(hydrated.id),
    fetchGallery(hydrated.id),
  ]);
  const built = rowToSetup(hydrated, products);
  (built as any).gallery = gallery;
  return built;
}

async function fetchGallery(setupId: string): Promise<string[]> {
  const { data } = await supabase
    .from("setup_images")
    .select("url, position")
    .eq("setup_id", setupId)
    .order("position", { ascending: true });
  return (data || []).map((r: any) => r.url).filter(Boolean);
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