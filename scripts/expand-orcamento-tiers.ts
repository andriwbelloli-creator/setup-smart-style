// Expande os 3 setups que alimentam a página /orcamento (Essencial,
// Equilibrado, Premium) com produtos extras coerentes com o budget.
// Idempotente: skip se produto já existir (por nome) no setup.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type Store = "amazon_br" | "mercado_livre" | "kabum" | "magalu" | "pichau" | "outro";

function search(store: Store, name: string): string {
  const q = encodeURIComponent(name);
  switch (store) {
    case "amazon_br": return `https://www.amazon.com.br/s?k=${q}`;
    case "mercado_livre": return `https://lista.mercadolivre.com.br/${q}`;
    case "kabum": return `https://www.kabum.com.br/busca/${q}`;
    case "magalu": return `https://www.magazineluiza.com.br/busca/${q}/`;
    case "pichau": return `https://www.pichau.com.br/search?q=${q}`;
    default: return `https://www.google.com/search?q=${q}`;
  }
}

type ExtraProduct = { category: string; name: string; brand: string; price_brl: number; store: Store; x: number; y: number; rating: number };

const EXPANSIONS: Record<string, ExtraProduct[]> = {
  // Essencial — budget R$ 1.500 (~total)
  "ape-32m2": [
    { category: "Monitor",     name: "AOC 24B1H 24\" Full HD",       brand: "AOC",        price_brl: 749,  store: "kabum",         x: 50, y: 35, rating: 4.4 },
    { category: "Cadeira",     name: "BR Office Bahamas",            brand: "BR Office",  price_brl: 699,  store: "magalu",        x: 28, y: 80, rating: 4.3 },
    { category: "Periféricos", name: "Logitech K480 + Mouse",        brand: "Logitech",   price_brl: 299,  store: "amazon_br",     x: 48, y: 70, rating: 4.5 },
    { category: "Iluminação",  name: "Luminária mesa LED articulada", brand: "Multilaser", price_brl: 89,   store: "mercado_livre", x: 78, y: 30, rating: 4.4 },
    { category: "Notebook",    name: "Suporte notebook elevado",     brand: "Multilaser", price_brl: 79,   store: "mercado_livre", x: 38, y: 50, rating: 4.4 },
  ],
  // Equilibrado — budget R$ 3.800
  "estudante-pequeno-foco-39": [
    { category: "Monitor",     name: "Dell P2422H 24\" Full HD",     brand: "Dell",       price_brl: 1399, store: "amazon_br",     x: 50, y: 35, rating: 4.7 },
    { category: "Cadeira",     name: "DT3 Office Nimitz",            brand: "DT3",        price_brl: 2299, store: "kabum",         x: 28, y: 82, rating: 4.5 },
    { category: "Suporte",     name: "Suporte articulado VESA ELG",  brand: "ELG",        price_brl: 219,  store: "mercado_livre", x: 50, y: 22, rating: 4.5 },
    { category: "Periféricos", name: "Teclado Logitech MK470 sem fio", brand: "Logitech", price_brl: 349,  store: "amazon_br",     x: 48, y: 70, rating: 4.6 },
    { category: "Iluminação",  name: "Luminária BenQ ScreenBar",     brand: "BenQ",       price_brl: 599,  store: "amazon_br",     x: 50, y: 18, rating: 4.8 },
  ],
  // Premium — budget R$ 12.000+
  "cyber-cave": [
    { category: "Mesa",          name: "Mesa Elétrica FlexiSpot E5",   brand: "FlexiSpot",      price_brl: 2899, store: "amazon_br", x: 50, y: 92, rating: 4.7 },
    { category: "Cadeira",       name: "Herman Miller Flexform",       brand: "Herman Miller",  price_brl: 3200, store: "outro",     x: 28, y: 82, rating: 4.8 },
    { category: "Monitor",       name: "LG Ultrawide 34WP65C",         brand: "LG",             price_brl: 2799, store: "kabum",     x: 50, y: 32, rating: 4.7 },
    { category: "Periféricos",   name: "Keychron K2 V2 mecânico",      brand: "Keychron",       price_brl: 899,  store: "amazon_br", x: 48, y: 70, rating: 4.7 },
    { category: "Iluminação",    name: "Philips Hue Play Bar par",     brand: "Philips Hue",    price_brl: 1199, store: "amazon_br", x: 78, y: 30, rating: 4.6 },
  ],
};

async function main() {
  for (const [slug, extras] of Object.entries(EXPANSIONS)) {
    const { data: setup } = await admin.from("setups").select("id").eq("slug", slug).maybeSingle();
    if (!setup) { console.warn(`⚠ ${slug} não existe, pulando`); continue; }
    const { data: existing } = await admin.from("setup_products").select("name, position").eq("setup_id", setup.id);
    const haveName = new Set((existing || []).map((p: any) => p.name.toLowerCase()));
    const maxPos = Math.max(0, ...(existing || []).map((p: any) => p.position || 0));

    const rows: any[] = [];
    let pos = maxPos + 1;
    for (const e of extras) {
      if (haveName.has(e.name.toLowerCase())) continue;
      rows.push({
        setup_id: setup.id, category: e.category, name: e.name, brand: e.brand,
        price_brl: e.price_brl, store: e.store, affiliate_url: search(e.store, e.name),
        x: e.x, y: e.y, position: pos++, rating: e.rating,
      });
    }
    if (rows.length === 0) { console.log(`  ↳ ${slug}: nada a adicionar`); continue; }
    const { error } = await admin.from("setup_products").insert(rows);
    if (error) { console.warn(`  ⚠ ${slug}:`, error.message); continue; }
    console.log(`  ↳ ${slug}: +${rows.length} produtos`);
  }
  console.log("✓ pronto");
}

main().catch((e) => { console.error("falhou:", e); process.exit(1); });
