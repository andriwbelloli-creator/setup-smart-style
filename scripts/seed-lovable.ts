// Adiciona os 6 setups originais do Lovable (src/data/setups.ts) ao banco,
// junto com os setups existentes. Idempotente: pula se slug já existir.
// Slugs: dev-turquesa, cyber-cave, white-clean, creator-studio, ape-32m2, cozy-wood.
// Imagens vêm da pool aprovada de workspaces no Unsplash.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (use .env.local)");
  process.exit(1);
}
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const IMG = {
  imacGeom:    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80",
  whiteImac:   "https://images.unsplash.com/photo-1518373714866-3f1478910cc0?w=1600&q=80",
  standingDesk:"https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=1600&q=80",
  dualMonitor: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=1600&q=80",
  woodMinimal: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1600&q=80",
  chairDesk:   "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
};

type Career = "dev" | "designer" | "pm" | "creator" | "remoto" | "outro";

type LUser = {
  email: string; password: string; username: string; display_name: string;
  bio: string; career: Career; city: string; avatar_url: string;
};

const USERS: LUser[] = [
  { email: "matheus.code@homeoffice.test", password: "HomeOffice.lifeSeed!2026", username: "matheus.code",
    display_name: "Matheus Code", bio: "Dev backend, foco profundo e teclados silenciosos.",
    career: "dev", city: "São Paulo, SP", avatar_url: "https://i.pravatar.cc/200?img=12" },
  { email: "gabi.streams@homeoffice.test", password: "HomeOffice.lifeSeed!2026", username: "gabi.streams",
    display_name: "Gabi Streams", bio: "Streamer e criadora de conteúdo. RGB no talo.",
    career: "creator", city: "Curitiba, PR", avatar_url: "https://i.pravatar.cc/200?img=47" },
  { email: "ana.designer@homeoffice.test", password: "HomeOffice.lifeSeed!2026", username: "ana.designer",
    display_name: "Ana Designer", bio: "Designer minimalista. Tudo branco, zero distração.",
    career: "designer", city: "Belo Horizonte, MG", avatar_url: "https://i.pravatar.cc/200?img=45" },
  { email: "joao.cria@homeoffice.test", password: "HomeOffice.lifeSeed!2026", username: "joao.cria",
    display_name: "João Cria", bio: "Criador focado em vídeo e podcast.",
    career: "creator", city: "Rio de Janeiro, RJ", avatar_url: "https://i.pravatar.cc/200?img=33" },
  { email: "bia.pequena@homeoffice.test", password: "HomeOffice.lifeSeed!2026", username: "bia.pequena",
    display_name: "Bia Pequena", bio: "Remota em apê de 32m². Setup que cabe em 80cm.",
    career: "remoto", city: "Porto Alegre, RS", avatar_url: "https://i.pravatar.cc/200?img=20" },
  { email: "rafa.home@homeoffice.test", password: "HomeOffice.lifeSeed!2026", username: "rafa.home",
    display_name: "Rafa Home", bio: "PM com reuniões o dia todo. Madeira, plantas e luz quente.",
    career: "pm", city: "Florianópolis, SC", avatar_url: "https://i.pravatar.cc/200?img=8" },
];

type Store = "amazon_br" | "mercado_livre" | "kabum" | "magalu" | "pichau" | "outro";

type LProduct = {
  category: string; name: string; brand: string; price_brl: number;
  store: Store; affiliate_url: string; x: number; y: number; position: number; rating: number;
};

type LSetup = {
  ownerEmail: string; slug: string; title: string; description: string;
  styles: string[]; career: Career; budget_brl: number; city: string;
  cover_url: string; gallery: string[]; ai_score: number; products: LProduct[];
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

const p = (
  category: string, name: string, brand: string, price: number, store: Store,
  x: number, y: number, position: number, rating = 4.6,
): LProduct => ({
  category, name, brand, price_brl: price, store,
  affiliate_url: searchUrl(store, name), x, y, position, rating,
});

const SETUPS: LSetup[] = [
  {
    ownerEmail: "matheus.code@homeoffice.test",
    slug: "dev-turquesa",
    title: "Dev Turquesa",
    description: "Setup focado em foco profundo. Ultrawide pra ver código + docs lado a lado, teclado mecânico silencioso pra calls e parede turquesa pra cortar a fadiga visual do branco.",
    styles: ["Dev", "Produtivo", "MacBook"],
    career: "dev", budget_brl: 6800, city: "São Paulo, SP",
    cover_url: IMG.dualMonitor,
    gallery: [IMG.woodMinimal, IMG.standingDesk, IMG.chairDesk],
    ai_score: 9.1,
    products: [
      p("Monitor",      "LG Ultrawide 34WP65C",              "LG",       2799, "kabum",         50, 35, 1, 4.7),
      p("Periféricos",  "Keychron K2 Pro",                   "Keychron",  920, "amazon_br",     48, 68, 2, 4.8),
      p("Iluminação",   "Luminária Articulada IKEA Ranarp",  "IKEA",      349, "mercado_livre", 82, 28, 3, 4.6),
      p("Mesa",         "Mesa cavalete madeira maciça",      "Móveis BR", 890, "magalu",        50, 85, 4, 4.5),
    ],
  },
  {
    ownerEmail: "gabi.streams@homeoffice.test",
    slug: "cyber-cave",
    title: "Cyber Cave",
    description: "Dual monitor com RGB pra streaming e edição. Cadeira gamer com sustentação lombar pra maratonas de live.",
    styles: ["Gamer", "Creator"],
    career: "creator", budget_brl: 12500, city: "Curitiba, PR",
    cover_url: IMG.chairDesk,
    gallery: [IMG.dualMonitor, IMG.imacGeom, IMG.woodMinimal],
    ai_score: 8.7,
    products: [
      p("Monitor",     "AOC Hero 27\" 165Hz",   "AOC",   1599, "kabum",     28, 35, 1, 4.6),
      p("Cadeira",     "DT3 Sports Elise",      "DT3",   1490, "pichau",    78, 65, 2, 4.4),
      p("Periféricos", "Razer Huntsman Mini",   "Razer",  850, "amazon_br", 38, 75, 3, 4.7),
    ],
  },
  {
    ownerEmail: "ana.designer@homeoffice.test",
    slug: "white-clean",
    title: "White & Clean",
    description: "Tudo branco, zero distração visual. iMac M3, teclado Magic compacto e plantinha pra cortar.",
    styles: ["Minimalista", "Designer", "MacBook"],
    career: "designer", budget_brl: 4200, city: "Belo Horizonte, MG",
    cover_url: IMG.whiteImac,
    gallery: [IMG.imacGeom, IMG.woodMinimal, IMG.standingDesk],
    ai_score: 9.4,
    products: [
      p("Notebook",    "iMac 24\" M3",                "Apple", 16999, "magalu",        50, 40, 1, 4.9),
      p("Periféricos", "Apple Magic Keyboard",        "Apple",   999, "amazon_br",     45, 65, 2, 4.7),
      p("Decoração",   "Vaso cerâmico + suculenta",   "Plantei",  89, "mercado_livre", 78, 50, 3, 4.5),
    ],
  },
  {
    ownerEmail: "joao.cria@homeoffice.test",
    slug: "creator-studio",
    title: "Creator Studio",
    description: "Foco em vídeo e podcast: ring light, mic shotgun e câmera DSLR num tripé compacto.",
    styles: ["Creator", "Produtivo"],
    career: "creator", budget_brl: 5400, city: "Rio de Janeiro, RJ",
    cover_url: IMG.imacGeom,
    gallery: [IMG.chairDesk, IMG.dualMonitor, IMG.whiteImac],
    ai_score: 8.9,
    products: [
      p("Iluminação",  "Ring Light 18\" Profissional",  "Greika",  449, "amazon_br", 50, 25, 1, 4.5),
      p("Periféricos", "Mic Rode VideoMic Pro",          "Rode",   1290, "kabum",     60, 45, 2, 4.8),
    ],
  },
  {
    ownerEmail: "bia.pequena@homeoffice.test",
    slug: "ape-32m2",
    title: "Apê 32m²",
    description: "Setup que cabe em 80cm. Suporte de notebook + teclado externo + monitor 19\" usado.",
    styles: ["Apê pequeno", "Setup barato", "Minimalista"],
    career: "remoto", budget_brl: 1480, city: "Porto Alegre, RS",
    cover_url: IMG.woodMinimal,
    gallery: [IMG.standingDesk, IMG.whiteImac, IMG.dualMonitor],
    ai_score: 8.3,
    products: [
      p("Mesa",     "Mesa cavalete pinus 100x50",   "Casa Móveis", 320, "magalu",        50, 80, 1, 4.3),
      p("Notebook", "Suporte notebook elevado",      "Multilaser",   89, "mercado_livre", 38, 50, 2, 4.4),
    ],
  },
  {
    ownerEmail: "rafa.home@homeoffice.test",
    slug: "cozy-wood",
    title: "Cozy Wood",
    description: "Madeira, plantas e luz quente. Pra quem tem reunião o dia todo e precisa de fundo bonito na câmera.",
    styles: ["Produtivo", "Minimalista"],
    career: "pm", budget_brl: 5900, city: "Florianópolis, SC",
    cover_url: IMG.standingDesk,
    gallery: [IMG.woodMinimal, IMG.whiteImac, IMG.chairDesk],
    ai_score: 9.0,
    products: [
      p("Iluminação", "Luminária BenQ ScreenBar",  "BenQ",    690, "amazon_br",     75, 30, 1, 4.8),
      p("Decoração",  "Costela de Adão M",          "Plantei", 120, "mercado_livre", 18, 55, 2, 4.6),
    ],
  },
];

async function ensureUser(u: LUser): Promise<string> {
  const { data: list, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) throw error;
  const found = list.users.find((x) => x.email === u.email);
  if (found) return found.id;
  const { data, error: createErr } = await admin.auth.admin.createUser({
    email: u.email, password: u.password, email_confirm: true,
    user_metadata: { display_name: u.display_name },
  });
  if (createErr) throw createErr;
  return data.user.id;
}

async function main() {
  console.log("→ Criando/atualizando 6 usuários Lovable");
  const userId: Record<string, string> = {};
  for (const u of USERS) {
    const id = await ensureUser(u);
    userId[u.email] = id;
    const { error } = await admin.from("profiles").update({
      username: u.username, display_name: u.display_name, bio: u.bio,
      career: u.career, city: u.city, avatar_url: u.avatar_url,
    }).eq("id", id);
    if (error) console.warn(`  ⚠ profile ${u.username}:`, error.message);
    console.log(`  ↳ ${u.username} (${id})`);
  }

  console.log(`→ Inserindo até ${SETUPS.length} setups Lovable (pula se já existir)`);
  let imgs = 0, prods = 0, inserted = 0, skipped = 0;
  for (const s of SETUPS) {
    const { data: existing } = await admin
      .from("setups").select("id").eq("slug", s.slug).maybeSingle();
    if (existing) {
      console.log(`  ↳ ${s.slug} já existe, pulando`);
      skipped++;
      continue;
    }
    const ownerId = userId[s.ownerEmail];
    const { data: setup, error } = await admin.from("setups").insert({
      owner_id: ownerId, slug: s.slug, title: s.title, description: s.description,
      styles: s.styles, career: s.career, budget_brl: s.budget_brl, city: s.city,
      cover_url: s.cover_url, status: "published", ai_score: s.ai_score,
    }).select("id").single();
    if (error || !setup) { console.warn(`  ⚠ ${s.slug}:`, error?.message); continue; }
    console.log(`  ↳ ${s.slug} (${setup.id})`);
    inserted++;

    const imgRows = [
      { setup_id: setup.id, url: s.cover_url, position: 0, is_before: false, is_after: false },
      ...s.gallery.map((url, i) => ({
        setup_id: setup.id, url, position: i + 1, is_before: false, is_after: false,
      })),
    ];
    const { error: imgErr } = await admin.from("setup_images").insert(imgRows);
    if (imgErr) console.warn(`    ⚠ imagens:`, imgErr.message); else imgs += imgRows.length;

    if (s.products.length) {
      const { error: prodErr } = await admin.from("setup_products").insert(
        s.products.map((pp) => ({ ...pp, setup_id: setup.id })),
      );
      if (prodErr) console.warn(`    ⚠ produtos:`, prodErr.message); else prods += s.products.length;
    }
  }
  console.log(`✓ ${inserted} inseridos, ${skipped} já existiam · ${imgs} imagens, ${prods} produtos`);
}

main().catch((e) => { console.error("falhou:", e); process.exit(1); });
