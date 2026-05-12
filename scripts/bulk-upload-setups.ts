// Upload em lote de setups a partir da pasta scripts/uploads/.
// Fluxo:
//   1) Detecta JPGs/PNGs em scripts/uploads/.
//   2) Se scripts/uploads/setups.json não existir → gera template e sai.
//   3) Se existir → para cada entrada:
//        - upload da imagem pro bucket "setups" em uploads/<slug>.<ext>
//        - cria/pula setup no banco (idempotente por slug)
//        - insere produtos (com affiliate_url auto-gerada se vazia)

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { extname, join } from "node:path";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (use .env.local)");
  process.exit(1);
}
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const UPLOADS_DIR = new URL("./uploads/", import.meta.url).pathname;
const META_PATH = join(UPLOADS_DIR, "setups.json");
const IMG_EXTS = [".jpg", ".jpeg", ".png", ".webp"];

type Career = "dev" | "designer" | "pm" | "creator" | "remoto" | "outro";
type Store = "amazon_br" | "mercado_livre" | "kabum" | "magalu" | "pichau" | "outro";

type Product = {
  category: string; name: string; brand: string; price_brl: number;
  store: Store; affiliate_url?: string; x: number; y: number; position: number; rating?: number;
};

type SetupEntry = {
  image: string; slug: string; title: string; description: string; ownerEmail: string;
  career?: Career; budget_brl?: number; city?: string; styles?: string[];
  ai_score?: number; products?: Product[];
};

function slugify(s: string): string {
  return s.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

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

function listImages(): string[] {
  if (!existsSync(UPLOADS_DIR)) return [];
  return readdirSync(UPLOADS_DIR)
    .filter((f) => IMG_EXTS.includes(extname(f).toLowerCase()))
    .sort();
}

function generateTemplate(images: string[]): SetupEntry[] {
  return images.map((image) => ({
    image,
    slug: slugify(image),
    title: "PREENCHA: título do setup",
    description: "PREENCHA: descrição curta",
    ownerEmail: "dev@homeoffice.test",
    career: "outro",
    budget_brl: 0,
    city: "Brasil",
    styles: [],
    ai_score: 8.0,
    products: [],
  }));
}

async function uploadImage(image: string, slug: string): Promise<string> {
  const localPath = join(UPLOADS_DIR, image);
  const bytes = readFileSync(localPath);
  const ext = extname(image).toLowerCase().replace(".", "");
  const contentType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  const storagePath = `uploads/${slug}.${ext}`;
  const { error } = await admin.storage.from("setups").upload(storagePath, bytes, {
    contentType, upsert: true, cacheControl: "31536000",
  });
  if (error) throw new Error(`upload ${image}: ${error.message}`);
  return `${SUPABASE_URL}/storage/v1/object/public/setups/${storagePath}`;
}

async function findOwnerId(email: string): Promise<string | null> {
  const { data: list, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  return list.users.find((u) => u.email === email)?.id ?? null;
}

async function main() {
  const images = listImages();

  // No images? Avisa e sai.
  if (images.length === 0) {
    console.log(`Nenhuma imagem em ${UPLOADS_DIR}`);
    console.log("Joga JPG/PNG/WEBP na pasta e roda de novo.");
    return;
  }

  console.log(`→ ${images.length} imagens encontradas`);

  // Gera template se setups.json não existe
  if (!existsSync(META_PATH)) {
    const tmpl = generateTemplate(images);
    writeFileSync(META_PATH, JSON.stringify(tmpl, null, 2), "utf8");
    console.log(`\n✓ Template criado em scripts/uploads/setups.json`);
    console.log("Edita esse arquivo preenchendo título/descrição/produtos e roda o script de novo.");
    return;
  }

  // Carrega metadata
  const raw = readFileSync(META_PATH, "utf8");
  const entries = JSON.parse(raw) as SetupEntry[];
  console.log(`→ ${entries.length} entradas em setups.json`);

  // Valida placeholders
  const pending = entries.filter((e) => e.title.startsWith("PREENCHA"));
  if (pending.length > 0) {
    console.log(`\n⚠ ${pending.length} entradas ainda com "PREENCHA:" no título:`);
    for (const e of pending) console.log(`  • ${e.image}`);
    console.log("\nEdita scripts/uploads/setups.json antes de rodar de novo.");
    return;
  }

  let inserted = 0, skipped = 0, uploaded = 0;
  for (const e of entries) {
    // Pula se slug já existe
    const { data: existing } = await admin.from("setups").select("id").eq("slug", e.slug).maybeSingle();
    if (existing) { console.log(`  ↳ ${e.slug} já existe, pulando`); skipped++; continue; }

    // Owner
    const ownerId = await findOwnerId(e.ownerEmail);
    if (!ownerId) { console.warn(`  ⚠ ownerEmail "${e.ownerEmail}" não encontrado, pulando ${e.slug}`); continue; }

    // Upload imagem
    let coverUrl: string;
    try {
      coverUrl = await uploadImage(e.image, e.slug);
      uploaded++;
    } catch (err: any) {
      console.warn(`  ⚠ upload falhou (${e.image}):`, err.message);
      continue;
    }

    // Cria setup
    const { data: setup, error } = await admin.from("setups").insert({
      owner_id: ownerId, slug: e.slug, title: e.title, description: e.description,
      styles: e.styles ?? [], career: e.career ?? "outro",
      budget_brl: e.budget_brl ?? 0, city: e.city ?? "Brasil",
      cover_url: coverUrl, status: "published", ai_score: e.ai_score ?? 8.0,
    }).select("id").single();
    if (error || !setup) { console.warn(`  ⚠ ${e.slug}:`, error?.message); continue; }
    inserted++;
    console.log(`  ↳ ${e.slug} (${setup.id})`);

    // Cover na tabela setup_images
    await admin.from("setup_images").insert({
      setup_id: setup.id, url: coverUrl, position: 0, is_before: false, is_after: false,
    });

    // Produtos
    if (e.products && e.products.length > 0) {
      const rows = e.products.map((p, idx) => ({
        setup_id: setup.id,
        category: p.category, name: p.name, brand: p.brand, price_brl: p.price_brl,
        store: p.store,
        affiliate_url: p.affiliate_url || searchUrl(p.store, p.name),
        x: p.x, y: p.y, position: p.position ?? idx + 1,
        rating: p.rating ?? 4.5,
      }));
      const { error: prodErr } = await admin.from("setup_products").insert(rows);
      if (prodErr) console.warn(`    ⚠ produtos:`, prodErr.message);
    }
  }

  console.log(`\n✓ ${inserted} inseridos, ${skipped} já existiam · ${uploaded} imagens em storage`);
}

main().catch((e) => { console.error("falhou:", e); process.exit(1); });
