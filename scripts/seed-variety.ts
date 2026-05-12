// Adiciona 20 setups novos cobrindo lacunas da galeria:
// - Budget baixo (R$ 400-2000): brasileiro real, não showroom
// - Score realista (6.5-7.5): setups "em construção" que educam
// - Cidades Norte/Nordeste/Centro-Oeste subrepresentadas
// - Carreiras fora-tech (advogado, dentista, professor, mãe, estudante)
// - Idempotente: skip se slug já existe

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

type NewUser = { email: string; display_name: string; career: string; username: string };
type NewSetup = {
  slug: string;
  title: string;
  description: string;
  styles: string[];
  career: string;
  budget_brl: number;
  city: string;
  cover_url: string;
  ai_score: number;
  owner_email: string;
  // produtos opcionais: nomes que devem bater com setup_products existentes
  // OU dados completos pra criar novos. Mantemos simples: linkamos a
  // produtos já no banco via nome.
  product_names?: string[];
};

const UNSPLASH = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

const USERS: NewUser[] = [
  { email: "ana.advogada@homeoffice.test", display_name: "Ana Carolina", career: "outro", username: "ana_adv" },
  { email: "marcos.dentista@homeoffice.test", display_name: "Marcos Vinícius", career: "outro", username: "drmarcos" },
  { email: "patricia.prof@homeoffice.test", display_name: "Patrícia Lopes", career: "outro", username: "profpati" },
  { email: "joao.estudante@homeoffice.test", display_name: "João Pedro", career: "outro", username: "jp_med" },
  { email: "carla.mae@homeoffice.test", display_name: "Carla Souza", career: "creator", username: "carla.mae" },
  { email: "lucas.norte@homeoffice.test", display_name: "Lucas Oliveira", career: "dev", username: "lucas_manaus" },
  { email: "renata.podcaster@homeoffice.test", display_name: "Renata Silva", career: "creator", username: "renatapod" },
  { email: "rafael.arquiteto@homeoffice.test", display_name: "Rafael Costa", career: "designer", username: "rafarq" },
  { email: "bia.freelancer@homeoffice.test", display_name: "Beatriz Almeida", career: "remoto", username: "biafree" },
  { email: "henrique.contador@homeoffice.test", display_name: "Henrique Mendes", career: "outro", username: "henrcont" },
];

const SETUPS: NewSetup[] = [
  // === BUDGET BAIXO + SCORE REALISTA (8 setups) ===
  {
    slug: "estudante-medicina-fortaleza",
    title: "Cantinho de estudos · medicina · Fortaleza",
    description: "Cama vira mesa nos intervalos. Setup minúsculo de quem mora em república: mesa dobrável, notebook compartilhado, luminária do mercadão. Funciona pra passar.",
    styles: ["minimalista", "apê pequeno", "estudante"],
    career: "outro",
    budget_brl: 680,
    city: "Fortaleza, CE",
    cover_url: UNSPLASH("1518770660439-4636190af475"),
    ai_score: 6.8,
    owner_email: "joao.estudante@homeoffice.test",
    product_names: ["Suporte notebook elevado", "Luminária mesa LED articulada"],
  },
  {
    slug: "professora-rede-publica-goiania",
    title: "Mesa de canto da professora · Goiânia",
    description: "Aulas online + correção de provas no fim de semana. Setup montado em 2 meses de salário, mesa do bazar reformada com adesivo. Realista demais.",
    styles: ["produtivo", "apê pequeno"],
    career: "outro",
    budget_brl: 1100,
    city: "Goiânia, GO",
    cover_url: UNSPLASH("1497366216548-37526070297c"),
    ai_score: 7.1,
    owner_email: "patricia.prof@homeoffice.test",
    product_names: ["AOC 24B1H 24\" Full HD", "Mesa pinus 120cm"],
  },
  {
    slug: "freelancer-iniciante-vitoria",
    title: "Primeiro setup home office · Vitória",
    description: "Saí do escritório, comecei freelancer. Tudo de segunda mão exceto o teclado. Nota baixa em iluminação mas dá pro gasto enquanto a coisa engata.",
    styles: ["minimalista", "iniciante"],
    career: "remoto",
    budget_brl: 1450,
    city: "Vitória, ES",
    cover_url: UNSPLASH("1483058712412-4245e9b90334"),
    ai_score: 6.9,
    owner_email: "bia.freelancer@homeoffice.test",
    product_names: ["Teclado Logitech MK470 sem fio", "Logitech K480 + Mouse"],
  },
  {
    slug: "primeiro-emprego-dev-manaus",
    title: "Júnior recém-CLT · Manaus",
    description: "Primeiro setup do primeiro emprego dev. Cadeira do trabalho antigo veio pra casa, monitor barato no atacarejo, mesa do quarto da infância repintada.",
    styles: ["dev", "iniciante", "apê pequeno"],
    career: "dev",
    budget_brl: 1750,
    city: "Manaus, AM",
    cover_url: UNSPLASH("1593642634443-44adaa06623a"),
    ai_score: 7.2,
    owner_email: "lucas.norte@homeoffice.test",
    product_names: ["AOC 24B1H 24\" Full HD", "BR Office Bahamas", "Teclado Logitech MK470 sem fio"],
  },
  {
    slug: "cantinho-mae-empreendedora-belem",
    title: "Cantinho da mãe que vende online · Belém",
    description: "Empacotando pedidos do Shopee na sala. Filho de 4 anos ao lado. Setup multi-uso: mesa de marcenaria local, notebook, ring light pra Reels.",
    styles: ["creator", "produtivo", "iniciante"],
    career: "creator",
    budget_brl: 1900,
    city: "Belém, PA",
    cover_url: UNSPLASH("1486312338219-ce68d2c6f44d"),
    ai_score: 7.4,
    owner_email: "carla.mae@homeoffice.test",
    product_names: ["Logitech C922 Pro", "Ring Light 18\" Profissional"],
  },
  {
    slug: "podcaster-iniciante-joao-pessoa",
    title: "Mini estúdio podcast · João Pessoa",
    description: "Cozinha vira estúdio na hora da gravação. Tratamento acústico com painel de espuma colado na parede. Mic decente, resto improvisado.",
    styles: ["creator", "audio", "iniciante"],
    career: "creator",
    budget_brl: 2100,
    city: "João Pessoa, PB",
    cover_url: UNSPLASH("1590602847861-f357a9332bbc"),
    ai_score: 7.5,
    owner_email: "renata.podcaster@homeoffice.test",
    product_names: ["Maono PD400X", "Shure MV7 USB"],
  },
  {
    slug: "consultorio-tecnologia-dentista-bh",
    title: "Setup teleodontologia · BH",
    description: "Consultorias online após o expediente. Mesma cadeira do consultório, monitor pra raio-X digital, câmera HD pra mostrar protocolo aos pacientes.",
    styles: ["produtivo", "profissional"],
    career: "outro",
    budget_brl: 4200,
    city: "Belo Horizonte, MG",
    cover_url: UNSPLASH("1551836022-d5d88e9218df"),
    ai_score: 8.1,
    owner_email: "marcos.dentista@homeoffice.test",
    product_names: ["Dell P2422H 24\" Full HD", "Logitech Brio 4K", "BenQ ScreenBar Halo"],
  },
  {
    slug: "escritorio-advocacia-home-brasilia",
    title: "Mesa de advocacia home · Brasília",
    description: "Audiências por videoconferência, peças no Word, jurisprudência aberta. Mesa de madeira maciça, cadeira séria, sem RGB. Sóbrio.",
    styles: ["profissional", "produtivo"],
    career: "outro",
    budget_brl: 5800,
    city: "Brasília, DF",
    cover_url: UNSPLASH("1497366754035-f200968a6e72"),
    ai_score: 8.4,
    owner_email: "ana.advogada@homeoffice.test",
    product_names: ["Dell P2422H 24\" Full HD", "DT3 Office Nimitz", "Mesa madeira maciça carvalho", "Logitech Brio 4K"],
  },

  // === CARREIRAS FORA-TECH (5 setups) ===
  {
    slug: "arquiteto-tablet-cuiaba",
    title: "Estúdio arquiteto + iPad · Cuiabá",
    description: "Setup híbrido: monitor 27\" pra prancha, iPad Pro de mesa digitalizadora, mesa de desenho ao lado. Plantas e moodboards físicos na parede.",
    styles: ["designer", "criativo", "scandinavian"],
    career: "designer",
    budget_brl: 7300,
    city: "Cuiabá, MT",
    cover_url: UNSPLASH("1517694712202-14dd9538aa97"),
    ai_score: 8.7,
    owner_email: "rafael.arquiteto@homeoffice.test",
    product_names: ["Dell U3223QE 32\" 4K", "Wacom Cintiq 16", "BenQ ScreenBar Halo", "Mesa madeira maciça carvalho"],
  },
  {
    slug: "contabilidade-multi-monitor-curitiba",
    title: "Contador multi-monitor · Curitiba",
    description: "3 monitores pra cruzar planilha, contabilidade e ERP simultâneos. Cadeira de marca, mesa elétrica pra ficar em pé na semana de fechamento.",
    styles: ["produtivo", "profissional"],
    career: "outro",
    budget_brl: 8400,
    city: "Curitiba, PR",
    cover_url: UNSPLASH("1542744095-0d53267d353e"),
    ai_score: 8.5,
    owner_email: "henrique.contador@homeoffice.test",
    product_names: ["Dell P2422H 24\" Full HD", "Mesa elétrica FlexiSpot E5", "DT3 Office Nimitz"],
  },

  // === BUDGET MÉDIO (5 setups) ===
  {
    slug: "creator-iniciante-natal",
    title: "Creator nordestino R$ 3k · Natal",
    description: "Setup completo de creator iniciando: webcam HD, key light, mic USB decente. Produção no MacBook. Cresceu de 100 pra 10k followers nesse setup.",
    styles: ["creator", "audio", "câmera"],
    career: "creator",
    budget_brl: 3200,
    city: "Natal, RN",
    cover_url: UNSPLASH("1611224923853-80b023f02d71"),
    ai_score: 7.8,
    owner_email: "renata.podcaster@homeoffice.test",
    product_names: ["Logitech Brio 4K", "Elgato Key Light Air", "Shure MV7 USB", "BenQ ScreenBar Halo"],
  },
  {
    slug: "designer-junior-floripa",
    title: "Designer júnior · Floripa",
    description: "Mesa de madeira pinus, monitor calibrado pra cor, tablet Wacom de entrada. Vista pra praia ajuda na nota de bem-estar. Trabalha 4-6h/dia.",
    styles: ["designer", "minimalista", "criativo"],
    career: "designer",
    budget_brl: 4500,
    city: "Florianópolis, SC",
    cover_url: UNSPLASH("1518770660439-4636190af475"),
    ai_score: 8.2,
    owner_email: "rafael.arquiteto@homeoffice.test",
    product_names: ["Dell P2422H 24\" Full HD", "Wacom Cintiq 16", "Mesa pinus 120cm"],
  },
  {
    slug: "remote-dev-sao-luis",
    title: "Dev remote internacional · São Luís",
    description: "Trabalha pra startup nos EUA do Maranhão. Monitor ultrawide pra terminal + IDE, mesa elétrica, cadeira ergonômica top. Investiu pesado em produtividade.",
    styles: ["dev", "produtivo", "minimalista"],
    career: "dev",
    budget_brl: 9800,
    city: "São Luís, MA",
    cover_url: UNSPLASH("1593642632559-0c6d3fc62b89"),
    ai_score: 9.0,
    owner_email: "lucas.norte@homeoffice.test",
    product_names: ["LG Ultrawide 34WP65C", "Mesa elétrica FlexiSpot E5", "DT3 Office Nimitz", "Keychron K2 V2 mecânico", "Logitech MX Master 3S", "BenQ ScreenBar Halo"],
  },
  {
    slug: "casal-creators-fortaleza",
    title: "Casal creators dual setup · Fortaleza",
    description: "2 monitores em L, 2 cadeiras lado a lado, key lights cruzadas. Gravam podcast diário, editam separados. Realmente cabe nos 6m² de escritório.",
    styles: ["creator", "casal", "audio"],
    career: "creator",
    budget_brl: 11400,
    city: "Fortaleza, CE",
    cover_url: UNSPLASH("1559136555-9303baea8ebd"),
    ai_score: 8.6,
    owner_email: "carla.mae@homeoffice.test",
    product_names: ["Dell P2422H 24\" Full HD", "Logitech Brio 4K", "Shure SM7B", "Elgato Key Light Air", "DT3 Office Nimitz"],
  },
  {
    slug: "freelancer-pj-tatuape-sp",
    title: "PJ casa nos 35 m² · Tatuapé SP",
    description: "Apê pequeno, mesa contra parede pra ganhar espaço, monitor único 27\" pra não cansar. Plantas pra esconder cabo. Trabalho do dia, leitura à noite.",
    styles: ["minimalista", "apê pequeno", "plantas"],
    career: "remoto",
    budget_brl: 5400,
    city: "São Paulo, SP",
    cover_url: UNSPLASH("1606857521015-7f9fcf423740"),
    ai_score: 8.4,
    owner_email: "bia.freelancer@homeoffice.test",
    product_names: ["Dell P2422H 24\" Full HD", "DT3 Office Nimitz", "BenQ ScreenBar Halo"],
  },

  // === PREMIUM (2 setups) ===
  {
    slug: "advogado-senior-rooftop-rj",
    title: "Escritório rooftop · advogado sênior RJ",
    description: "Vista pra Ipanema. Mesa de mogno maciço sob medida, cadeira Herman Miller, mac studio + monitor 5K. Tudo escolhido com decorador.",
    styles: ["profissional", "premium", "vintage"],
    career: "outro",
    budget_brl: 28500,
    city: "Rio de Janeiro, RJ",
    cover_url: UNSPLASH("1554118811-1e0d58224f24"),
    ai_score: 9.3,
    owner_email: "ana.advogada@homeoffice.test",
    product_names: ["Apple Studio Display", "Mac Studio M2 Max", "Mesa mogno maciço"],
  },
  {
    slug: "arquiteto-renderfarm-vitoria",
    title: "Workstation render · arquiteto Vitória",
    description: "PC com 2x RTX 4090 pra renderizar Lumion. 4K calibrado, Wacom Cintiq 24, mesa elétrica industrial. Não pra office leve.",
    styles: ["designer", "premium", "profissional"],
    career: "designer",
    budget_brl: 32000,
    city: "Vitória, ES",
    cover_url: UNSPLASH("1593642634402-b0eb5e2eebc9"),
    ai_score: 9.5,
    owner_email: "rafael.arquiteto@homeoffice.test",
    product_names: ["LG Ultrawide 34WP65C", "Wacom Cintiq 16", "Mesa Elétrica FlexiSpot E5", "DT3 Office Nimitz", "Elgato Key Light Air"],
  },

  // === SCORES BAIXOS RESTANTES (3 setups educacionais) ===
  {
    slug: "cantinho-iniciante-recife",
    title: "Quarto adolescente virou escritório · Recife",
    description: "Setup honesto: mesa estudante velha, cadeira pra coluna ruim, notebook único. Iluminação só do teto. Sabe que precisa upgrade mas tá no orçamento.",
    styles: ["iniciante", "apê pequeno"],
    career: "remoto",
    budget_brl: 540,
    city: "Recife, PE",
    cover_url: UNSPLASH("1519389950473-47ba0277781c"),
    ai_score: 6.5,
    owner_email: "joao.estudante@homeoffice.test",
    product_names: ["Suporte notebook elevado"],
  },
  {
    slug: "operario-overtime-uberlandia",
    title: "Bico extra notebook · Uberlândia",
    description: "Trabalho regular durante o dia, bico de programador à noite. Mesa de jantar transformada. Cadeira plástica branca. Notebook do trabalho.",
    styles: ["iniciante", "dev"],
    career: "dev",
    budget_brl: 420,
    city: "Uberlândia, MG",
    cover_url: UNSPLASH("1518744386442-2d48ac47a7eb"),
    ai_score: 6.6,
    owner_email: "joao.estudante@homeoffice.test",
    product_names: ["Suporte notebook elevado"],
  },
  {
    slug: "primeiro-apto-sozinha-fortaleza",
    title: "Primeiro apto sozinha · Fortaleza",
    description: "Saiu da casa dos pais, escritório no quarto. Tudo do MagaLu em 12x. Funcional, sem firula. Score mostra que tem upgrade pela frente — mas tá funcionando.",
    styles: ["iniciante", "minimalista", "apê pequeno"],
    career: "remoto",
    budget_brl: 1280,
    city: "Fortaleza, CE",
    cover_url: UNSPLASH("1556745753-b2904692b3cd"),
    ai_score: 7.0,
    owner_email: "bia.freelancer@homeoffice.test",
    product_names: ["AOC 24B1H 24\" Full HD", "BR Office Bahamas", "Mesa pinus 120cm"],
  },
];

async function ensureUser(u: NewUser): Promise<string> {
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const existing = list?.users.find((x) => x.email === u.email);
  if (existing) return existing.id;
  const { data, error } = await admin.auth.admin.createUser({
    email: u.email,
    email_confirm: true,
    password: `deskly-test-${Math.random().toString(36).slice(2, 10)}`,
    user_metadata: { display_name: u.display_name, username: u.username },
  });
  if (error) throw error;
  // Atualiza profile com display_name + career
  await admin
    .from("profiles")
    .update({ display_name: u.display_name, career: u.career, username: u.username })
    .eq("id", data.user.id);
  return data.user.id;
}

async function main() {
  console.log("→ criando/verificando usuários");
  const userIdByEmail: Record<string, string> = {};
  for (const u of USERS) {
    userIdByEmail[u.email] = await ensureUser(u);
    console.log(`  ✓ ${u.email}`);
  }

  console.log("\n→ inserindo setups (skip se slug existir)");
  let inserted = 0;
  let skipped = 0;
  let productsLinked = 0;

  for (const s of SETUPS) {
    const ownerId = userIdByEmail[s.owner_email];
    if (!ownerId) {
      console.warn(`  ⚠ owner não encontrado: ${s.owner_email}`);
      continue;
    }
    const { data: existing } = await admin.from("setups").select("id").eq("slug", s.slug).maybeSingle();
    if (existing) {
      skipped++;
      continue;
    }
    const { data: setupRow, error: setupErr } = await admin
      .from("setups")
      .insert({
        owner_id: ownerId,
        slug: s.slug,
        title: s.title,
        description: s.description,
        styles: s.styles,
        career: s.career,
        budget_brl: s.budget_brl,
        city: s.city,
        cover_url: s.cover_url,
        ai_score: s.ai_score,
        likes_count: Math.floor(Math.random() * 25) + 3,
        saves_count: Math.floor(Math.random() * 15) + 1,
        status: "published",
      })
      .select("id")
      .single();
    if (setupErr) {
      console.warn(`  ⚠ ${s.slug}: ${setupErr.message}`);
      continue;
    }

    // cover image
    await admin.from("setup_images").insert({
      setup_id: setupRow.id,
      url: s.cover_url,
      position: 0,
    });

    // produtos (linkar com setup_products existentes via nome)
    if (s.product_names?.length) {
      const { data: prods } = await admin
        .from("setup_products")
        .select("id, name, brand, category, price_brl, store, affiliate_url, rating")
        .in("name", s.product_names);
      // Dedupe por nome (primeiro match)
      const seen = new Set<string>();
      const unique: any[] = [];
      for (const p of (prods || []) as any[]) {
        if (seen.has(p.name)) continue;
        seen.add(p.name);
        unique.push(p);
      }
      const rows = unique.map((p, i) => ({
        setup_id: setupRow.id,
        category: p.category,
        name: p.name,
        brand: p.brand,
        price_brl: p.price_brl,
        store: p.store,
        affiliate_url: p.affiliate_url,
        rating: p.rating,
        x: 30 + Math.random() * 40,
        y: 25 + Math.random() * 55,
        position: i,
      }));
      if (rows.length > 0) {
        await admin.from("setup_products").insert(rows);
        productsLinked += rows.length;
      }
    }

    inserted++;
    console.log(`  ✓ ${s.slug}`);
  }

  console.log(`\n═══════════════════`);
  console.log(`✓ ${inserted} setups novos`);
  console.log(`  ${skipped} já existiam`);
  console.log(`  ${productsLinked} produtos linkados`);
}

main().catch((e) => { console.error("falhou:", e); process.exit(1); });
