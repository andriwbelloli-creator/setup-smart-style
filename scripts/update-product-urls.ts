// One-shot: rewrite every setup_products.affiliate_url to a search-based URL
// that actually resolves on the store. Safer than the current product-path
// URLs which mostly 404. Also normalizes UTF-8 / accents in the query.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Faltam vars: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]+/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function searchUrl(store: string, brand: string, name: string): string {
  // Avoid duplicating brand if it's already in the name
  const nameHasBrand =
    brand && name.toLowerCase().includes(brand.toLowerCase());
  const fullName = (nameHasBrand ? name : `${brand} ${name}`).trim();
  const query = encodeURIComponent(fullName);
  const slug = slugify(fullName);
  switch (store) {
    case "amazon_br":
      return `https://www.amazon.com.br/s?k=${query}`;
    case "mercado_livre":
      return `https://lista.mercadolivre.com.br/${slug}`;
    case "magalu":
      return `https://www.magazineluiza.com.br/busca/${slug}/`;
    case "kabum":
      return `https://www.kabum.com.br/busca/${slug}`;
    case "pichau":
      return `https://www.pichau.com.br/search?cat=*&q=${query}`;
    case "outro":
    default:
      // Generic Google Shopping fallback for "outro"
      return `https://www.google.com/search?tbm=shop&q=${query}`;
  }
}

async function main() {
  const { data: products, error } = await admin
    .from("setup_products")
    .select("id, name, brand, store, affiliate_url");
  if (error) throw error;
  if (!products) throw new Error("no products");

  console.log(`→ ${products.length} produtos pra atualizar`);

  let updated = 0;
  let skipped = 0;

  for (const p of products as any[]) {
    const newUrl = searchUrl(p.store, p.brand || "", p.name);
    if (p.affiliate_url === newUrl) {
      skipped++;
      continue;
    }
    const { error: err } = await admin
      .from("setup_products")
      .update({ affiliate_url: newUrl })
      .eq("id", p.id);
    if (err) {
      console.warn(`  ⚠ falhou em ${p.name}: ${err.message}`);
      continue;
    }
    updated++;
    if (updated % 20 === 0) console.log(`  ↳ ${updated} atualizados...`);
  }

  console.log(`✓ ${updated} URLs reescritas, ${skipped} já estavam ok`);
}

main().catch((e) => {
  console.error("update falhou:", e);
  process.exit(1);
});
