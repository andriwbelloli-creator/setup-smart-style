// scripts/seed-marketplace.ts
//
// Insere ~30 anúncios variados no marketplace pra ter volume inicial.
// Usa fotos do Unsplash, preços de mercado real BR, categorias diversas.
// Idempotente: se o título já existe, pula.
//
// Como rodar:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... bun run scripts/seed-marketplace.ts

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

type SeedListing = {
  title: string;
  description: string;
  price: number;
  category_slug: string;
  condition_slug: string;
  images: string[];
  city: string;
  state: string;
};

// Imagens do Unsplash — URLs estáveis, alta qualidade, livre de royalty
const LISTINGS: SeedListing[] = [
  // Monitores
  {
    title: 'LG UltraGear 27GP850 27" 165Hz IPS',
    description: "Monitor gamer top, 165Hz, 1ms, painel IPS. Usei 8 meses pra dev/jogo. Caixa original, manual e cabos inclusos. Nota fiscal disponível. Único dono.",
    price: 2100, category_slug: "monitores", condition_slug: "como-novo",
    images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"],
    city: "São Paulo", state: "SP",
  },
  {
    title: 'Dell UltraSharp U2722DE 27" 4K USB-C',
    description: "Monitor profissional 4K com Hub USB-C. Vendido como saiu da caixa. Marcas leves de uso na base. Vendo pq atualizei pra ultrawide.",
    price: 2800, category_slug: "monitores", condition_slug: "bom",
    images: ["https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800"],
    city: "Rio de Janeiro", state: "RJ",
  },
  {
    title: 'Samsung Odyssey G5 32" 144Hz Curvo',
    description: "Monitor curvo gamer/produtividade. Tela enorme, ideal pra coding lado a lado. Tem alguns riscos quase invisíveis no fundo.",
    price: 1850, category_slug: "monitores", condition_slug: "bom",
    images: ["https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=800"],
    city: "Belo Horizonte", state: "MG",
  },
  {
    title: 'AOC 24" Full HD IPS — entrada',
    description: "Monitor básico mas confiável. Ótimo pra setup secundário ou home office iniciante. HDMI + VGA.",
    price: 420, category_slug: "monitores", condition_slug: "bom",
    images: ["https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800"],
    city: "Curitiba", state: "PR",
  },

  // Cadeiras
  {
    title: "Herman Miller Aeron tamanho B (original)",
    description: "Cadeira ergonômica icônica. Comprei usada e usei 2 anos. Mantida 100%. Apoio lombar perfeito. Vendo pq mudei pra ergohuman.",
    price: 4200, category_slug: "cadeiras", condition_slug: "bom",
    images: ["https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800"],
    city: "São Paulo", state: "SP",
  },
  {
    title: "ThunderX3 EAZE Mesh — mesh respirável",
    description: "Cadeira gamer com tela em mesh, ótima ventilação. Apoio de cabeça e braços ajustáveis. 1 ano de uso, fumante: não.",
    price: 950, category_slug: "cadeiras", condition_slug: "como-novo",
    images: ["https://images.unsplash.com/photo-1505842465776-3d90f616310d?w=800"],
    city: "Florianópolis", state: "SC",
  },
  {
    title: "DT3 Sports Elise — pra mulher/pequena estatura",
    description: "Cadeira ergonômica menor, ideal pra quem tem -1,70m. Conservada. Pistão a gás trocado mês passado.",
    price: 800, category_slug: "cadeiras", condition_slug: "bom",
    images: ["https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800"],
    city: "Porto Alegre", state: "RS",
  },

  // Mesas
  {
    title: "Mesa Pé Standing Desk 120x60 — manual",
    description: "Mesa com altura ajustável manual (manivela). Tampa em MDF imbuia. Aguenta até 80kg. Uso ~6 meses.",
    price: 690, category_slug: "mesas", condition_slug: "bom",
    images: ["https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800"],
    city: "São Paulo", state: "SP",
  },
  {
    title: "Mesa em L 150x150 — madeira natural",
    description: "Mesa em L bonita pra setup duplo (notebook + monitor). Pinus envernizado. Pequenas marcas mas estrutura impecável.",
    price: 520, category_slug: "mesas", condition_slug: "aceitavel",
    images: ["https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800"],
    city: "Brasília", state: "DF",
  },
  {
    title: "Flexispot E7 Standing Desk Elétrica 140x70",
    description: "Mesa elétrica com memória de 4 alturas. Top de linha. Comprei na promo, uso só pelo PM da empresa.",
    price: 2400, category_slug: "mesas", condition_slug: "como-novo",
    images: ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=800"],
    city: "São Paulo", state: "SP",
  },

  // Teclados
  {
    title: "Keychron K2 V2 — Mecânico Brown Switch",
    description: "Teclado mecânico 75% com switches Gateron Brown (silencioso). Pintura está intacta. Cabo USB-C original.",
    price: 480, category_slug: "teclados", condition_slug: "como-novo",
    images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800"],
    city: "Rio de Janeiro", state: "RJ",
  },
  {
    title: 'Logitech MX Keys (Português ABNT2)',
    description: "Teclado low-profile premium. Iluminação automática. Carrega via USB-C. Perfeito pra produtividade. Uso 1 ano.",
    price: 550, category_slug: "teclados", condition_slug: "bom",
    images: ["https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=800"],
    city: "Campinas", state: "SP",
  },
  {
    title: "Apple Magic Keyboard com Touch ID (Português)",
    description: "Magic Keyboard 2 com Touch ID e teclado numérico. Lacrado, ganhei e não uso. Compatível com M1/M2/M3.",
    price: 780, category_slug: "teclados", condition_slug: "novo",
    images: ["https://images.unsplash.com/photo-1561112078-7d24e04c3407?w=800"],
    city: "São Paulo", state: "SP",
  },

  // Mouses
  {
    title: "Logitech MX Master 3S — preto",
    description: "Mouse top pra produtividade. Scroll silencioso, multi-device. 6 meses de uso, sem riscos.",
    price: 380, category_slug: "mouses", condition_slug: "como-novo",
    images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800"],
    city: "São Paulo", state: "SP",
  },
  {
    title: "Logitech G Pro X Superlight — gamer pro",
    description: "Mouse gamer competitivo, 63g, sensor HERO 25K. Branco. Pad original incluso. Vendo pq parei de jogar competitivo.",
    price: 520, category_slug: "mouses", condition_slug: "bom",
    images: ["https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800"],
    city: "Belo Horizonte", state: "MG",
  },
  {
    title: "Logitech MX Anywhere 3 — viagem",
    description: "Mouse compacto pra notebook/viagem. Compatível Mac e Windows. Bateria dura semanas.",
    price: 220, category_slug: "mouses", condition_slug: "bom",
    images: ["https://images.unsplash.com/photo-1563297007-0686b7003af7?w=800"],
    city: "Curitiba", state: "PR",
  },

  // Áudio
  {
    title: "Sony WH-1000XM4 — Cancelamento de Ruído",
    description: "Headphone bluetooth top, ANC excelente. Bateria com 30h+. Estojo, cabo e adaptador inclusos.",
    price: 950, category_slug: "audio", condition_slug: "como-novo",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
    city: "São Paulo", state: "SP",
  },
  {
    title: "AirPods Pro 2 — Lacrado",
    description: "AirPods Pro 2ª geração. Comprei e não usei (tenho Sony). Selo da Apple intacto. Aceito troca por equivalente.",
    price: 1450, category_slug: "audio", condition_slug: "novo",
    images: ["https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800"],
    city: "Brasília", state: "DF",
  },
  {
    title: "Audio-Technica ATH-M40x — monitor profissional",
    description: "Headphone fechado pra estúdio. Som plano, ideal pra edição de áudio/vídeo. Espuma original ok.",
    price: 480, category_slug: "audio", condition_slug: "bom",
    images: ["https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800"],
    city: "Rio de Janeiro", state: "RJ",
  },

  // Webcam
  {
    title: "Logitech C920 Full HD — reuniões",
    description: "Webcam Full HD com autofoco. Plug and play. Microfone integrado decente. Cabo USB original.",
    price: 280, category_slug: "webcams", condition_slug: "bom",
    images: ["https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800"],
    city: "São Paulo", state: "SP",
  },
  {
    title: "Insta360 Link 4K — streamer/criador",
    description: "Webcam profissional 4K com gimbal AI. Tracking automático. Comprei pra YouTube mas mudei pra DSLR.",
    price: 1100, category_slug: "webcams", condition_slug: "como-novo",
    images: ["https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800"],
    city: "Florianópolis", state: "SC",
  },

  // Iluminação
  {
    title: "Elgato Key Light Air — ring light pra streaming",
    description: "Luz LED ajustável (cor + intensidade) controlada por app. Suporte de mesa robusto. Stream/calls profissionais.",
    price: 720, category_slug: "iluminacao", condition_slug: "como-novo",
    images: ["https://images.unsplash.com/photo-1609557927087-f9cf8e88de18?w=800"],
    city: "São Paulo", state: "SP",
  },
  {
    title: "BenQ ScreenBar — luminária de monitor",
    description: "Luminária que prende no topo do monitor. Iluminação focada sem reflexo. Tudo intacto.",
    price: 420, category_slug: "iluminacao", condition_slug: "bom",
    images: ["https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800"],
    city: "Recife", state: "PE",
  },

  // Notebooks
  {
    title: 'MacBook Air M2 13" 16GB / 512GB — Space Gray',
    description: "MacBook Air M2 com upgrade de RAM (16GB). 1 ano de uso, bateria 95% saúde. Saúde verificável. Caixa, carregador, manual.",
    price: 7200, category_slug: "notebooks", condition_slug: "como-novo",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"],
    city: "São Paulo", state: "SP",
  },
  {
    title: 'ThinkPad X1 Carbon Gen 10 i7 16GB',
    description: "ThinkPad ultraportátil dev/exec. Teclado lendário. Tela touch. 2 anos uso corporativo. Reformatado.",
    price: 5500, category_slug: "notebooks", condition_slug: "bom",
    images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800"],
    city: "Brasília", state: "DF",
  },

  // Acessórios
  {
    title: "Suporte Articulado Dual Monitor — VESA",
    description: "Suporte de mesa pra 2 monitores até 27\". Articulação completa. Cabos e parafusos inclusos.",
    price: 320, category_slug: "acessorios", condition_slug: "bom",
    images: ["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800"],
    city: "São Paulo", state: "SP",
  },
  {
    title: "Hub USB-C 11-em-1 Anker — HDMI 4K, SD, Ethernet",
    description: "Hub completíssimo. HDMI 4K@60Hz, 3 USB-A, USB-C PD, SD, microSD, Ethernet, áudio. Caixa original.",
    price: 480, category_slug: "acessorios", condition_slug: "como-novo",
    images: ["https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800"],
    city: "Rio de Janeiro", state: "RJ",
  },
  {
    title: "Mousepad Razer Goliathus Extended 920x294",
    description: "Mousepad XL pra teclado + mouse. Borda costurada. Limpo, sem fissuras.",
    price: 120, category_slug: "acessorios", condition_slug: "bom",
    images: ["https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800"],
    city: "Curitiba", state: "PR",
  },
  {
    title: 'iPad Air M2 11" 256GB Wi-Fi — Magic Keyboard',
    description: "iPad Air M2 com Magic Keyboard original (ambos cinza espacial). Excelente pra design/anotação. 6 meses uso.",
    price: 7500, category_slug: "acessorios", condition_slug: "como-novo",
    images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800"],
    city: "São Paulo", state: "SP",
  },
];

async function main() {
  console.log("[seed-marketplace] Carregando categorias e condições...");
  const [{ data: cats }, { data: conds }] = await Promise.all([
    (admin as any).from("marketplace_categories").select("id, slug"),
    (admin as any).from("marketplace_conditions").select("id, slug"),
  ]);
  if (!cats?.length || !conds?.length) {
    console.error("Categorias ou condições vazias. Rode a migration primeiro.");
    process.exit(1);
  }
  const catBySlug = new Map(cats.map((c: any) => [c.slug, c.id]));
  const condBySlug = new Map(conds.map((c: any) => [c.slug, c.id]));

  // Pega um user existente pra ser seller (pode ser o próprio user logado)
  // Se não houver, cria um seller fictício via auth.admin.createUser
  const { data: existingUsers } = await (admin.auth as any).admin.listUsers();
  let sellerId: string | null = existingUsers?.users?.[0]?.id ?? null;
  if (!sellerId) {
    const { data: created, error: userErr } = await admin.auth.admin.createUser({
      email: "marketplace-seed@homeofficelife.com.br",
      email_confirm: true,
      user_metadata: { username: "comunidade", display_name: "Comunidade HOL" },
    });
    if (userErr) {
      console.error("Falha ao criar seller fictício:", userErr.message);
      process.exit(1);
    }
    sellerId = created.user!.id;
    console.log(`[seed-marketplace] Seller fictício criado: ${sellerId}`);
  } else {
    console.log(`[seed-marketplace] Usando seller existente: ${sellerId}`);
  }

  let inserted = 0;
  let skipped = 0;
  for (const item of LISTINGS) {
    // Idempotência: pula se já existe com mesmo título
    const { data: existing } = await (admin as any)
      .from("marketplace_listings")
      .select("id")
      .eq("title", item.title)
      .limit(1);
    if (existing && existing.length > 0) {
      skipped++;
      continue;
    }
    const catId = catBySlug.get(item.category_slug);
    const condId = condBySlug.get(item.condition_slug);
    if (!catId || !condId) {
      console.warn(`Categoria/condição faltando pra "${item.title}"`);
      skipped++;
      continue;
    }
    const { error } = await (admin as any).from("marketplace_listings").insert({
      seller_id: sellerId,
      title: item.title,
      description: item.description,
      price: item.price,
      category_id: catId,
      condition_id: condId,
      images: item.images,
      city: item.city,
      state: item.state,
      status: "active",
    });
    if (error) {
      console.error(`  ✗ ${item.title}: ${error.message}`);
      skipped++;
    } else {
      console.log(`  ✓ ${item.title}`);
      inserted++;
    }
  }

  console.log(`\n[seed-marketplace] Pronto. ${inserted} novos, ${skipped} pulados.`);
}

main().catch((e) => {
  console.error("[seed-marketplace] Erro fatal:", e);
  process.exit(1);
});
