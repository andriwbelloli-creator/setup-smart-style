// Para cada setup com menos de 4 produtos, adiciona 2-3 produtos
// complementares baseado no que faltar (Mesa, Cadeira, Iluminação).
// Idempotente: nunca duplica produto com mesmo nome no mesmo setup.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type Store = "amazon_br" | "mercado_livre" | "kabum" | "magalu" | "pichau" | "outro";

type Filler = {
  category: string; name: string; brand: string; price_brl: number; store: Store;
  x: number; y: number; rating: number;
};

function searchUrl(store: Store, name: string): string {
  const q = encodeURIComponent(name);
  switch (store) {
    case "amazon_br":     return `https://www.amazon.com.br/s?k=${q}`;
    case "mercado_livre": return `https://lista.mercadolivre.com.br/${q}`;
    case "kabum":         return `https://www.kabum.com.br/busca/${q}`;
    case "magalu":        return `https://www.magazineluiza.com.br/busca/${q}/`;
    case "pichau":        return `https://www.pichau.com.br/search?q=${q}`;
    default:              return `https://www.google.com/search?q=${q}`;
  }
}

// Pool de produtos por categoria pra preencher onde faltar.
const FILLERS: Record<string, Filler[]> = {
  Cadeira: [
    { category: "Cadeira", name: "DT3 Office Nimitz",            brand: "DT3",       price_brl: 2299, store: "kabum",     x: 28, y: 82, rating: 4.5 },
    { category: "Cadeira", name: "ThunderX3 Yama1",              brand: "ThunderX3", price_brl: 1899, store: "kabum",     x: 30, y: 80, rating: 4.5 },
    { category: "Cadeira", name: "Flexform Charm",               brand: "Flexform",  price_brl: 2299, store: "magalu",    x: 32, y: 84, rating: 4.4 },
  ],
  Mesa: [
    { category: "Mesa",    name: "Mesa madeira maciça carvalho", brand: "Móveis BR", price_brl: 899,  store: "magalu",        x: 50, y: 92, rating: 4.5 },
    { category: "Mesa",    name: "Mesa pinus 120cm",             brand: "Casa Móveis", price_brl: 489, store: "magalu",       x: 50, y: 90, rating: 4.3 },
    { category: "Mesa",    name: "Mesa elétrica FlexiSpot E5",   brand: "FlexiSpot", price_brl: 2899, store: "amazon_br",    x: 50, y: 92, rating: 4.7 },
  ],
  Iluminação: [
    { category: "Iluminação", name: "BenQ ScreenBar Halo",      brand: "BenQ",      price_brl: 1199, store: "amazon_br",     x: 50, y: 18, rating: 4.8 },
    { category: "Iluminação", name: "Elgato Key Light Air",     brand: "Elgato",    price_brl: 1899, store: "amazon_br",     x: 78, y: 28, rating: 4.7 },
    { category: "Iluminação", name: "Govee LED Strip 5m",       brand: "Govee",     price_brl: 259,  store: "amazon_br",     x: 80, y: 18, rating: 4.6 },
  ],
  Periféricos: [
    { category: "Periféricos", name: "Logitech MX Master 3S",   brand: "Logitech",  price_brl: 749,  store: "amazon_br",     x: 60, y: 72, rating: 4.9 },
    { category: "Periféricos", name: "Keychron K2 V2",          brand: "Keychron",  price_brl: 899,  store: "amazon_br",     x: 48, y: 70, rating: 4.7 },
    { category: "Periféricos", name: "Logitech MX Keys S",      brand: "Logitech",  price_brl: 899,  store: "amazon_br",     x: 48, y: 72, rating: 4.8 },
  ],
};

const ORDER = ["Cadeira", "Mesa", "Iluminação", "Periféricos"];

async function main() {
  // Setups com produtos atuais
  const { data: setups } = await admin
    .from("setups")
    .select("id, slug, setup_products(category, name)")
    .eq("status", "published");
  if (!setups) return;

  console.log(`→ ${setups.length} setups, identificando os com < 4 produtos`);

  let added = 0;
  let setupsTouched = 0;
  for (const s of setups as any[]) {
    const current = (s.setup_products || []) as Array<{ category: string; name: string }>;
    if (current.length >= 4) continue;

    const have = new Set(current.map((p) => p.category));
    const haveName = new Set(current.map((p) => p.name.toLowerCase()));
    const need = ORDER.filter((c) => !have.has(c)).slice(0, 4 - current.length);

    const rows: any[] = [];
    let pos = current.length + 1;
    for (const cat of need) {
      const pool = FILLERS[cat] || [];
      // Pick a deterministic option based on setup id hash so re-runs choose the same
      const hash = (s.id as string).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const candidate = pool[hash % pool.length];
      if (!candidate || haveName.has(candidate.name.toLowerCase())) continue;
      rows.push({
        setup_id: s.id,
        category: candidate.category, name: candidate.name, brand: candidate.brand,
        price_brl: candidate.price_brl, store: candidate.store,
        affiliate_url: searchUrl(candidate.store, candidate.name),
        x: candidate.x, y: candidate.y, position: pos++,
        rating: candidate.rating,
      });
    }

    if (rows.length === 0) continue;
    const { error } = await admin.from("setup_products").insert(rows);
    if (error) {
      console.warn(`  ⚠ ${s.slug}:`, error.message);
      continue;
    }
    added += rows.length;
    setupsTouched++;
    console.log(`  ↳ ${s.slug}: +${rows.length} produtos`);
  }
  console.log(`\n✓ ${added} produtos adicionados em ${setupsTouched} setups`);
}

main().catch((e) => { console.error("falhou:", e); process.exit(1); });
