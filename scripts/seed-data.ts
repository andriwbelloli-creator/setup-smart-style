export type SeedUser = {
  email: string;
  password: string;
  username: string;
  display_name: string;
  bio: string;
  career: "dev" | "designer" | "pm" | "creator" | "remoto" | "outro";
  city: string;
  avatar_url: string;
};

export type SeedProduct = {
  category: string;
  name: string;
  brand: string;
  price_brl: number;
  store: "amazon_br" | "mercado_livre" | "kabum" | "magalu" | "pichau" | "outro";
  affiliate_url: string;
  x: number;
  y: number;
  position: number;
  rating?: number;
};

export type SeedComment = {
  setupSlug: string;
  authorEmail: string;
  body: string;
};

export type SeedSetup = {
  ownerEmail: string;
  slug: string;
  title: string;
  description: string;
  styles: string[];
  career: "dev" | "designer" | "pm" | "creator" | "remoto" | "outro";
  budget_brl: number;
  city: string;
  cover_url: string;
  ai_score: number;
  products: SeedProduct[];
};

export const SEED_USERS: SeedUser[] = [
  {
    email: "dev@homeoffice.test",
    password: "HomeOfficeLifeSeed!2026",
    username: "rafa_dev",
    display_name: "Rafael Souza",
    bio: "Backend dev em RJ, fã de teclados mecânicos e luz quente.",
    career: "dev",
    city: "Rio de Janeiro, RJ",
    avatar_url: "https://i.pravatar.cc/200?img=12",
  },
  {
    email: "designer@homeoffice.test",
    password: "HomeOfficeLifeSeed!2026",
    username: "ju_designer",
    display_name: "Juliana Lima",
    bio: "Product designer remota, paleta minimalista e plantas.",
    career: "designer",
    city: "Florianópolis, SC",
    avatar_url: "https://i.pravatar.cc/200?img=47",
  },
  {
    email: "creator@homeoffice.test",
    password: "HomeOfficeLifeSeed!2026",
    username: "leo_creator",
    display_name: "Leonardo Castro",
    bio: "Criador de conteúdo de tech, foco em produtividade e gear.",
    career: "creator",
    city: "São Paulo, SP",
    avatar_url: "https://i.pravatar.cc/200?img=33",
  },
  {
    email: "estudante@homeoffice.test",
    password: "HomeOfficeLifeSeed!2026",
    username: "mari_estudante",
    display_name: "Mariana Costa",
    bio: "Estudante de eng. de software. Aprendendo a montar setup decente sem quebrar a banca.",
    career: "outro",
    city: "Belo Horizonte, MG",
    avatar_url: "https://i.pravatar.cc/200?img=45",
  },
  {
    email: "arquiteto@homeoffice.test",
    password: "HomeOfficeLifeSeed!2026",
    username: "pedro_arq",
    display_name: "Pedro Almeida",
    bio: "Arquiteto e ilustrador, vive no AutoCAD e Procreate.",
    career: "designer",
    city: "Curitiba, PR",
    avatar_url: "https://i.pravatar.cc/200?img=68",
  },
  {
    email: "executivo@homeoffice.test",
    password: "HomeOfficeLifeSeed!2026",
    username: "carlos_exec",
    display_name: "Carlos Mendes",
    bio: "Diretor financeiro. Setup para reuniões e relatórios.",
    career: "outro",
    city: "São Paulo, SP",
    avatar_url: "https://i.pravatar.cc/200?img=11",
  },
  {
    email: "casal@homeoffice.test",
    password: "HomeOfficeLifeSeed!2026",
    username: "ana_e_bruno",
    display_name: "Ana & Bruno",
    bio: "Trabalhamos juntos em casa. Dividimos um quarto/escritório.",
    career: "remoto",
    city: "Porto Alegre, RS",
    avatar_url: "https://i.pravatar.cc/200?img=20",
  },
  {
    email: "pm@homeoffice.test",
    password: "HomeOfficeLifeSeed!2026",
    username: "isa_pm",
    display_name: "Isabela Ferraz",
    bio: "Product Manager remota. Vivo em chamadas — luz e câmera são prioridade.",
    career: "pm",
    city: "Recife, PE",
    avatar_url: "https://i.pravatar.cc/200?img=49",
  },
  {
    email: "psi@homeoffice.test",
    password: "HomeOfficeLifeSeed!2026",
    username: "renata_psi",
    display_name: "Renata Vargas",
    bio: "Psicóloga clínica online. Acolhimento + qualidade de áudio acima de tudo.",
    career: "outro",
    city: "Niterói, RJ",
    avatar_url: "https://i.pravatar.cc/200?img=44",
  },
  {
    email: "trader@homeoffice.test",
    password: "HomeOfficeLifeSeed!2026",
    username: "mauricio_trader",
    display_name: "Maurício Tanaka",
    bio: "Day trader full-time. 4 monitores, dois teclados, café preto.",
    career: "outro",
    city: "São Paulo, SP",
    avatar_url: "https://i.pravatar.cc/200?img=15",
  },
  {
    email: "empreendedor@homeoffice.test",
    password: "HomeOfficeLifeSeed!2026",
    username: "vini_founder",
    display_name: "Vinícius Tavares",
    bio: "Founder de startup early-stage. Mesa pra tudo: pitch, código, reunião.",
    career: "outro",
    city: "Florianópolis, SC",
    avatar_url: "https://i.pravatar.cc/200?img=22",
  },
  {
    email: "professor@homeoffice.test",
    password: "HomeOfficeLifeSeed!2026",
    username: "helena_prof",
    display_name: "Helena Brandão",
    bio: "Professora de inglês online. Câmera, lousa digital e plantas.",
    career: "outro",
    city: "Belo Horizonte, MG",
    avatar_url: "https://i.pravatar.cc/200?img=41",
  },
  {
    email: "consultor@homeoffice.test",
    password: "HomeOfficeLifeSeed!2026",
    username: "thiago_consult",
    display_name: "Thiago Couto",
    bio: "Consultor de gestão. 80% do tempo em call — setup pra parecer sério.",
    career: "pm",
    city: "São Paulo, SP",
    avatar_url: "https://i.pravatar.cc/200?img=8",
  },
  {
    email: "streamer@homeoffice.test",
    password: "HomeOfficeLifeSeed!2026",
    username: "kaua_stream",
    display_name: "Kauã Reis",
    bio: "Streamer de FPS. RGB no talo, três câmeras, fone aberto premium.",
    career: "creator",
    city: "Brasília, DF",
    avatar_url: "https://i.pravatar.cc/200?img=53",
  },
  {
    email: "datasci@homeoffice.test",
    password: "HomeOfficeLifeSeed!2026",
    username: "fer_data",
    display_name: "Fernanda Otsuka",
    bio: "Cientista de dados. ThinkPad + monitor 4K + muita memória.",
    career: "dev",
    city: "Campinas, SP",
    avatar_url: "https://i.pravatar.cc/200?img=29",
  },
];

export const SEED_SETUPS: SeedSetup[] = [
  {
    ownerEmail: "dev@homeoffice.test",
    slug: "setup-dev-minimalista-madeira",
    title: "Setup dev minimalista em madeira",
    description: "Foco total no código com mesa de madeira maciça, ultrawide e teclado mecânico silencioso.",
    styles: ["minimalista", "madeira", "ergonômico"],
    career: "dev",
    budget_brl: 8500,
    city: "Rio de Janeiro, RJ",
    cover_url: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1600&q=80",
    ai_score: 8.7,
    products: [
      { category: "Monitor", name: "LG Ultrawide 34WP65C", brand: "LG", price_brl: 2799, store: "kabum", affiliate_url: "https://www.kabum.com.br/produto/lg-ultrawide", x: 50, y: 30, position: 1, rating: 4.8 },
      { category: "Teclado", name: "Keychron K2 V2", brand: "Keychron", price_brl: 899, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/keychron-k2", x: 45, y: 70, position: 2, rating: 4.7 },
      { category: "Mouse", name: "Logitech MX Master 3S", brand: "Logitech", price_brl: 749, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/mx-master-3s", x: 65, y: 72, position: 3, rating: 4.9 },
      { category: "Cadeira", name: "ThunderX3 Yama1", brand: "ThunderX3", price_brl: 1899, store: "kabum", affiliate_url: "https://www.kabum.com.br/produto/thunderx3-yama1", x: 30, y: 85, position: 4, rating: 4.5 },
    ],
  },
  {
    ownerEmail: "dev@homeoffice.test",
    slug: "home-office-dev-dual-monitor",
    title: "Dual monitor 27\" com luz quente",
    description: "Dois monitores 27\" lado a lado, ideal pra full-stack. Iluminação de canto cria atmosfera relaxada.",
    styles: ["dual-monitor", "warm-light", "dev"],
    career: "dev",
    budget_brl: 12000,
    city: "Rio de Janeiro, RJ",
    cover_url: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=1600&q=80",
    ai_score: 9.1,
    products: [
      { category: "Monitor", name: "Dell U2723QE 4K", brand: "Dell", price_brl: 4299, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/dell-u2723qe", x: 35, y: 35, position: 1, rating: 4.8 },
      { category: "Suporte", name: "Suporte duplo VESA articulado", brand: "ELG", price_brl: 459, store: "mercado_livre", affiliate_url: "https://produto.mercadolivre.com.br/suporte-vesa-elg", x: 50, y: 25, position: 2, rating: 4.6 },
      { category: "Iluminação", name: "Philips Hue Play Bar", brand: "Philips", price_brl: 899, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/philips-hue", x: 80, y: 40, position: 3, rating: 4.7 },
    ],
  },
  {
    ownerEmail: "designer@homeoffice.test",
    slug: "designer-minimal-branco-plantas",
    title: "Mesa branca com plantas — designer remoto",
    description: "Estética clean, plantas, tablet de desenho e monitor único. Mesa pequena que cabe em apartamento.",
    styles: ["minimalista", "white", "plantas", "remoto"],
    career: "designer",
    budget_brl: 6500,
    city: "Florianópolis, SC",
    cover_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80",
    ai_score: 8.9,
    products: [
      { category: "Tablet", name: "Wacom Intuos Pro M", brand: "Wacom", price_brl: 2499, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/wacom-intuos-pro", x: 60, y: 65, position: 1, rating: 4.8 },
      { category: "Monitor", name: "BenQ PD2705U 4K", brand: "BenQ", price_brl: 3899, store: "kabum", affiliate_url: "https://www.kabum.com.br/produto/benq-pd2705u", x: 45, y: 30, position: 2, rating: 4.7 },
      { category: "Cadeira", name: "Herman Miller Sayl", brand: "Herman Miller", price_brl: 5499, store: "outro", affiliate_url: "https://hermanmiller.com.br/sayl", x: 25, y: 80, position: 3, rating: 4.9 },
    ],
  },
  {
    ownerEmail: "designer@homeoffice.test",
    slug: "cantinho-criativo-cores-pasteis",
    title: "Cantinho criativo em tons pastéis",
    description: "Pequeno espaço otimizado, cor pastel e luz natural. Para quem trabalha em apê pequeno.",
    styles: ["pastel", "cozy", "small-space"],
    career: "designer",
    budget_brl: 3800,
    city: "Florianópolis, SC",
    cover_url: "https://images.unsplash.com/photo-1542435503-956c469947f6?w=1600&q=80",
    ai_score: 8.2,
    products: [
      { category: "Mesa", name: "Mesa Madesa Lyon 90cm", brand: "Madesa", price_brl: 449, store: "magalu", affiliate_url: "https://www.magazineluiza.com.br/mesa-madesa", x: 50, y: 60, position: 1, rating: 4.4 },
      { category: "Cadeira", name: "Cadeira Tok&Stok Karim", brand: "Tok&Stok", price_brl: 999, store: "outro", affiliate_url: "https://www.tokstok.com.br/karim", x: 30, y: 80, position: 2, rating: 4.5 },
      { category: "Iluminação", name: "Luminária IKEA Ranarp", brand: "IKEA", price_brl: 349, store: "outro", affiliate_url: "https://ikea.com/br/ranarp", x: 70, y: 35, position: 3, rating: 4.6 },
    ],
  },
  {
    ownerEmail: "creator@homeoffice.test",
    slug: "studio-creator-tech-rgb",
    title: "Studio creator com RGB e câmera 4K",
    description: "Setup pra YouTube/Twitch: ring light, câmera Sony, microfone Shure e iluminação RGB Govee.",
    styles: ["rgb", "creator", "youtube", "streamer"],
    career: "creator",
    budget_brl: 18500,
    city: "São Paulo, SP",
    cover_url: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=1600&q=80",
    ai_score: 9.3,
    products: [
      { category: "Câmera", name: "Sony ZV-E10 + lente 16-50mm", brand: "Sony", price_brl: 6499, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/sony-zv-e10", x: 50, y: 25, position: 1, rating: 4.8 },
      { category: "Microfone", name: "Shure MV7", brand: "Shure", price_brl: 2299, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/shure-mv7", x: 30, y: 40, position: 2, rating: 4.9 },
      { category: "Iluminação", name: "Govee LED Strip + Ring Light", brand: "Govee", price_brl: 599, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/govee-led", x: 75, y: 30, position: 3, rating: 4.6 },
      { category: "Mesa", name: "Mesa Gamer ELG ARENA", brand: "ELG", price_brl: 1199, store: "kabum", affiliate_url: "https://www.kabum.com.br/produto/elg-arena", x: 50, y: 75, position: 4, rating: 4.5 },
    ],
  },
  {
    ownerEmail: "creator@homeoffice.test",
    slug: "cantinho-podcast-acustico",
    title: "Cantinho de podcast com tratamento acústico",
    description: "Espuma acústica, mic dinâmico, monitor compacto. Custo baixo, qualidade profissional.",
    styles: ["podcast", "acustico", "compacto"],
    career: "creator",
    budget_brl: 4200,
    city: "São Paulo, SP",
    cover_url: "https://images.unsplash.com/photo-1581905764498-f1b60bae941a?w=1600&q=80",
    ai_score: 8.5,
    products: [
      { category: "Microfone", name: "Behringer XM8500", brand: "Behringer", price_brl: 249, store: "mercado_livre", affiliate_url: "https://produto.mercadolivre.com.br/behringer-xm8500", x: 50, y: 50, position: 1, rating: 4.5 },
      { category: "Interface", name: "Focusrite Scarlett Solo 3rd Gen", brand: "Focusrite", price_brl: 1399, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/scarlett-solo", x: 65, y: 60, position: 2, rating: 4.8 },
      { category: "Acústica", name: "Espuma acústica perfilada (kit 8)", brand: "Generic", price_brl: 199, store: "mercado_livre", affiliate_url: "https://produto.mercadolivre.com.br/espuma-acustica", x: 20, y: 30, position: 3, rating: 4.3 },
    ],
  },
  {
    ownerEmail: "dev@homeoffice.test",
    slug: "gamer-rgb-triple-monitor",
    title: "Gamer RGB com 3 monitores",
    description: "Setup gamer high-end: 3 monitores 240Hz, RTX 4080, RGB sincronizado e cadeira gamer top.",
    styles: ["gamer", "rgb", "triple-monitor", "high-end"],
    career: "dev",
    budget_brl: 32000,
    city: "Rio de Janeiro, RJ",
    cover_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=80",
    ai_score: 9.4,
    products: [
      { category: "Monitor", name: "AOC Agon Pro 27\" 240Hz (x3)", brand: "AOC", price_brl: 8997, store: "kabum", affiliate_url: "https://www.kabum.com.br/produto/aoc-agon-pro", x: 50, y: 30, position: 1, rating: 4.7 },
      { category: "PC", name: "PC Gamer RTX 4080 + i9-14900K", brand: "Pichau", price_brl: 18999, store: "pichau", affiliate_url: "https://www.pichau.com.br/pc-gamer-rtx-4080", x: 25, y: 60, position: 2, rating: 4.8 },
      { category: "Cadeira", name: "DXRacer Master Series", brand: "DXRacer", price_brl: 3499, store: "kabum", affiliate_url: "https://www.kabum.com.br/produto/dxracer-master", x: 30, y: 85, position: 3, rating: 4.6 },
      { category: "Iluminação", name: "Govee Glide RGB Wall Lights", brand: "Govee", price_brl: 1199, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/govee-glide", x: 75, y: 25, position: 4, rating: 4.7 },
      { category: "Teclado", name: "Razer Huntsman V3 Pro", brand: "Razer", price_brl: 2299, store: "kabum", affiliate_url: "https://www.kabum.com.br/produto/razer-huntsman", x: 50, y: 75, position: 5, rating: 4.8 },
    ],
  },
  {
    ownerEmail: "estudante@homeoffice.test",
    slug: "setup-estudante-orcamento-1500",
    title: "Setup estudante por R$ 1.500",
    description: "Setup completo pra quem tá começando: notebook + monitor extra + cadeira decente, tudo dentro de R$ 1.500.",
    styles: ["compacto", "barato", "estudante"],
    career: "outro",
    budget_brl: 1500,
    city: "Belo Horizonte, MG",
    cover_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80",
    ai_score: 7.8,
    products: [
      { category: "Monitor", name: "Monitor AOC 22\" Full HD", brand: "AOC", price_brl: 599, store: "magalu", affiliate_url: "https://www.magazineluiza.com.br/monitor-aoc-22", x: 50, y: 30, position: 1, rating: 4.4 },
      { category: "Cadeira", name: "Cadeira Best Office", brand: "Best Office", price_brl: 449, store: "mercado_livre", affiliate_url: "https://produto.mercadolivre.com.br/best-office", x: 25, y: 85, position: 2, rating: 4.2 },
      { category: "Suporte", name: "Suporte de notebook ajustável", brand: "Generic", price_brl: 89, store: "mercado_livre", affiliate_url: "https://produto.mercadolivre.com.br/suporte-notebook", x: 65, y: 50, position: 3, rating: 4.5 },
      { category: "Iluminação", name: "Luminária LED Taschibra", brand: "Taschibra", price_brl: 79, store: "magalu", affiliate_url: "https://www.magazineluiza.com.br/luminaria-taschibra", x: 80, y: 35, position: 4, rating: 4.3 },
    ],
  },
  {
    ownerEmail: "designer@homeoffice.test",
    slug: "standing-desk-ergonomico",
    title: "Standing desk com mesa eletrônica",
    description: "Mesa que sobe e desce com motor elétrico, tapete antifadiga e monitor em altura ideal. Adeus dor lombar.",
    styles: ["standing-desk", "ergonomico", "saude"],
    career: "designer",
    budget_brl: 9800,
    city: "Florianópolis, SC",
    cover_url: "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=1600&q=80",
    ai_score: 9.0,
    products: [
      { category: "Mesa", name: "Mesa eletrônica FlexiSpot E7 1.40m", brand: "FlexiSpot", price_brl: 4299, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/flexispot-e7", x: 50, y: 60, position: 1, rating: 4.8 },
      { category: "Tapete", name: "Tapete antifadiga ergonômico", brand: "Topo", price_brl: 449, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/tapete-topo", x: 35, y: 90, position: 2, rating: 4.7 },
      { category: "Monitor", name: "LG UltraFine 27\" 4K", brand: "LG", price_brl: 3199, store: "kabum", affiliate_url: "https://www.kabum.com.br/produto/lg-ultrafine", x: 50, y: 25, position: 3, rating: 4.7 },
      { category: "Cadeira", name: "Flexform Bionic", brand: "Flexform", price_brl: 1899, store: "outro", affiliate_url: "https://flexform.com.br/bionic", x: 25, y: 80, position: 4, rating: 4.6 },
    ],
  },
  {
    ownerEmail: "arquiteto@homeoffice.test",
    slug: "arquiteto-monitor-vertical-cintiq",
    title: "Arquiteto com Cintiq + monitor vertical",
    description: "Wacom Cintiq Pro pro desenho à mão livre, monitor vertical pra ler plantas e código. Setup pesado e preciso.",
    styles: ["arquitetura", "ilustracao", "vertical-monitor"],
    career: "designer",
    budget_brl: 22000,
    city: "Curitiba, PR",
    cover_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80",
    ai_score: 9.1,
    products: [
      { category: "Tablet", name: "Wacom Cintiq Pro 24\"", brand: "Wacom", price_brl: 14999, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/wacom-cintiq-pro-24", x: 45, y: 55, position: 1, rating: 4.9 },
      { category: "Monitor", name: "Dell U2723QE em modo retrato", brand: "Dell", price_brl: 4299, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/dell-u2723qe", x: 75, y: 30, position: 2, rating: 4.8 },
      { category: "Suporte", name: "Suporte VESA pivotante 90°", brand: "ELG", price_brl: 379, store: "mercado_livre", affiliate_url: "https://produto.mercadolivre.com.br/suporte-pivotante", x: 80, y: 20, position: 3, rating: 4.5 },
      { category: "Cadeira", name: "Herman Miller Aeron B", brand: "Herman Miller", price_brl: 13999, store: "outro", affiliate_url: "https://hermanmiller.com.br/aeron", x: 25, y: 85, position: 4, rating: 4.9 },
    ],
  },
  {
    ownerEmail: "executivo@homeoffice.test",
    slug: "executivo-classico-mogno-couro",
    title: "Executivo clássico em mogno e couro",
    description: "Estética corporativa: mesa de mogno escura, cadeira de couro legítima, abajur metal e luz quente. Pra reuniões importantes.",
    styles: ["executivo", "classico", "madeira-escura", "couro"],
    career: "outro",
    budget_brl: 16500,
    city: "São Paulo, SP",
    cover_url: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=1600&q=80",
    ai_score: 8.6,
    products: [
      { category: "Mesa", name: "Mesa de escritório em mogno 1.80m", brand: "Bentwood", price_brl: 5499, store: "outro", affiliate_url: "https://bentwood.com.br/mesa-mogno", x: 50, y: 65, position: 1, rating: 4.7 },
      { category: "Cadeira", name: "Cadeira presidente couro legítimo", brand: "Frisokar", price_brl: 3899, store: "magalu", affiliate_url: "https://www.magazineluiza.com.br/cadeira-presidente-frisokar", x: 30, y: 85, position: 2, rating: 4.6 },
      { category: "Iluminação", name: "Abajur Bauhaus metal preto", brand: "Tok&Stok", price_brl: 599, store: "outro", affiliate_url: "https://www.tokstok.com.br/abajur-bauhaus", x: 80, y: 40, position: 3, rating: 4.5 },
      { category: "Monitor", name: "Dell P2723D QHD", brand: "Dell", price_brl: 2299, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/dell-p2723d", x: 50, y: 35, position: 4, rating: 4.7 },
    ],
  },
  {
    ownerEmail: "casal@homeoffice.test",
    slug: "setup-duplo-casal-home-office",
    title: "Setup duplo lado a lado pra casal",
    description: "Duas estações no mesmo cômodo, sem atrapalhar um ao outro. Mesa em L compartilhada, cabeamento limpo, divisória acústica.",
    styles: ["casal", "duplo", "compartilhado", "remoto"],
    career: "remoto",
    budget_brl: 14000,
    city: "Porto Alegre, RS",
    cover_url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&q=80",
    ai_score: 8.4,
    products: [
      { category: "Mesa", name: "Mesa em L Madesa 1.60m", brand: "Madesa", price_brl: 1199, store: "magalu", affiliate_url: "https://www.magazineluiza.com.br/mesa-l-madesa", x: 50, y: 60, position: 1, rating: 4.5 },
      { category: "Cadeira", name: "Cadeira escritório DT3 Vita (x2)", brand: "DT3", price_brl: 2398, store: "kabum", affiliate_url: "https://www.kabum.com.br/produto/dt3-vita", x: 30, y: 80, position: 2, rating: 4.7 },
      { category: "Monitor", name: "AOC 24\" IPS Full HD (x2)", brand: "AOC", price_brl: 1798, store: "kabum", affiliate_url: "https://www.kabum.com.br/produto/aoc-24-ips", x: 50, y: 30, position: 3, rating: 4.6 },
      { category: "Acústica", name: "Painel divisor acústico", brand: "Sonex", price_brl: 549, store: "mercado_livre", affiliate_url: "https://produto.mercadolivre.com.br/sonex-divisor", x: 50, y: 45, position: 4, rating: 4.4 },
    ],
  },
  {
    ownerEmail: "designer@homeoffice.test",
    slug: "apartamento-minusculo-mesa-dobravel",
    title: "Apto minúsculo com mesa dobrável",
    description: "Pra quem mora em studio: mesa dobrável de parede, cadeira que guarda na vertical, organização extrema.",
    styles: ["compacto", "studio", "dobravel", "small-space"],
    career: "designer",
    budget_brl: 2200,
    city: "Florianópolis, SC",
    cover_url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1600&q=80",
    ai_score: 8.1,
    products: [
      { category: "Mesa", name: "Mesa dobrável de parede Tramontina", brand: "Tramontina", price_brl: 489, store: "magalu", affiliate_url: "https://www.magazineluiza.com.br/mesa-dobravel-tramontina", x: 50, y: 60, position: 1, rating: 4.4 },
      { category: "Cadeira", name: "Cadeira dobrável estofada IKEA", brand: "IKEA", price_brl: 399, store: "outro", affiliate_url: "https://ikea.com/br/cadeira-dobravel", x: 30, y: 80, position: 2, rating: 4.5 },
      { category: "Monitor", name: "Monitor portátil 15.6\" USB-C", brand: "Mountain", price_brl: 899, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/monitor-portatil-mountain", x: 50, y: 35, position: 3, rating: 4.6 },
      { category: "Organização", name: "Painel pegboard parede", brand: "Generic", price_brl: 199, store: "mercado_livre", affiliate_url: "https://produto.mercadolivre.com.br/pegboard", x: 80, y: 25, position: 4, rating: 4.3 },
    ],
  },
  {
    ownerEmail: "pm@homeoffice.test",
    slug: "pm-camera-4k-iluminacao-zoom",
    title: "PM com câmera 4K e iluminação pra Zoom",
    description: "Setup focado em apresentações: câmera Sony 4K, ring light frontal, microfone direcional, mesa limpa, fundo neutro.",
    styles: ["pm", "video", "chamadas", "profissional"],
    career: "pm",
    budget_brl: 11500,
    city: "Recife, PE",
    cover_url: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=1600&q=80",
    ai_score: 9.0,
    products: [
      { category: "Câmera", name: "Sony ZV-1F 4K", brand: "Sony", price_brl: 4299, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/sony-zv-1f", x: 50, y: 25, position: 1, rating: 4.8 },
      { category: "Iluminação", name: "Ring light Elgato Key Light Air", brand: "Elgato", price_brl: 1799, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/elgato-key-light-air", x: 75, y: 30, position: 2, rating: 4.9 },
      { category: "Microfone", name: "Rode NT-USB Mini", brand: "Rode", price_brl: 1299, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/rode-nt-usb-mini", x: 30, y: 45, position: 3, rating: 4.8 },
      { category: "Monitor", name: "Dell P2422H Full HD", brand: "Dell", price_brl: 1499, store: "kabum", affiliate_url: "https://www.kabum.com.br/produto/dell-p2422h", x: 50, y: 40, position: 4, rating: 4.7 },
      { category: "Cadeira", name: "Cadeira Flexform Atos", brand: "Flexform", price_brl: 2599, store: "outro", affiliate_url: "https://flexform.com.br/atos", x: 25, y: 85, position: 5, rating: 4.6 },
    ],
  },

  // ===== Psicóloga Renata =====
  {
    ownerEmail: "psi@homeoffice.test",
    slug: "consultorio-online-acolhedor",
    title: "Consultório online acolhedor",
    description: "Espaço para psicoterapia remota: luz quente, painel acústico, mic profissional e cor sóbria. Privacidade visual e audio limpo.",
    styles: ["acolhedor", "calmo", "profissional", "telessaude"],
    career: "outro",
    budget_brl: 5800,
    city: "Niterói, RJ",
    cover_url: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=1600&q=80",
    ai_score: 8.7,
    products: [
      { category: "Microfone", name: "Rode PodMic USB", brand: "Rode", price_brl: 1499, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/rode-podmic-usb", x: 30, y: 45, position: 1, rating: 4.8 },
      { category: "Acústica", name: "Painel acústico decorativo (kit 4)", brand: "Sonex", price_brl: 349, store: "mercado_livre", affiliate_url: "https://produto.mercadolivre.com.br/sonex-painel", x: 20, y: 25, position: 2, rating: 4.5 },
      { category: "Iluminação", name: "Luminária Yeelight LED warm", brand: "Yeelight", price_brl: 249, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/yeelight-warm", x: 75, y: 35, position: 3, rating: 4.6 },
      { category: "Cadeira", name: "Cadeira Tok&Stok ergonômica", brand: "Tok&Stok", price_brl: 1299, store: "outro", affiliate_url: "https://www.tokstok.com.br/cadeira-ergonomica", x: 30, y: 80, position: 4, rating: 4.4 },
      { category: "Câmera", name: "Logitech C922 Pro Stream", brand: "Logitech", price_brl: 749, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/logitech-c922", x: 50, y: 20, position: 5, rating: 4.7 },
    ],
  },
  {
    ownerEmail: "psi@homeoffice.test",
    slug: "consultorio-plantas-luz-natural",
    title: "Consultório com plantas e luz natural",
    description: "Janela ao lado, cortina blackout pra controle, plantas reais. Ambiente que reduz ansiedade do paciente.",
    styles: ["plantas", "luz-natural", "acolhedor"],
    career: "outro",
    budget_brl: 3900,
    city: "Niterói, RJ",
    cover_url: "https://images.unsplash.com/photo-1545239351-cefa43af60f3?w=1600&q=80",
    ai_score: 8.3,
    products: [
      { category: "Microfone", name: "Blue Yeti Nano", brand: "Blue", price_brl: 999, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/blue-yeti-nano", x: 35, y: 40, position: 1, rating: 4.7 },
      { category: "Iluminação", name: "Abajur de mesa decorativo", brand: "Tok&Stok", price_brl: 199, store: "outro", affiliate_url: "https://www.tokstok.com.br/abajur", x: 80, y: 30, position: 2, rating: 4.5 },
      { category: "Decoração", name: "Plantas naturais (kit 3)", brand: "Genérico", price_brl: 249, store: "magalu", affiliate_url: "https://www.magazineluiza.com.br/plantas-naturais-kit", x: 65, y: 50, position: 3, rating: 4.6 },
      { category: "Cortina", name: "Cortina blackout 2.6m", brand: "Madesa", price_brl: 299, store: "magalu", affiliate_url: "https://www.magazineluiza.com.br/cortina-blackout", x: 85, y: 20, position: 4, rating: 4.3 },
    ],
  },

  // ===== Trader Maurício =====
  {
    ownerEmail: "trader@homeoffice.test",
    slug: "trader-4-monitores-curvos",
    title: "Trader com 4 monitores curvos",
    description: "Operação multi-tela: 4 monitores 27\" com suportes articulados, mesa em L, café à mão. Pra quem opera o dia inteiro.",
    styles: ["trader", "multi-monitor", "high-end"],
    career: "outro",
    budget_brl: 26000,
    city: "São Paulo, SP",
    cover_url: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=1600&q=80",
    ai_score: 9.2,
    products: [
      { category: "Monitor", name: "Samsung 27\" curvo (kit 4 unidades)", brand: "Samsung", price_brl: 8796, store: "kabum", affiliate_url: "https://www.kabum.com.br/produto/samsung-27-curvo", x: 50, y: 30, position: 1, rating: 4.7 },
      { category: "Suporte", name: "Suporte quad VESA articulado", brand: "ELG", price_brl: 1499, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/suporte-quad-vesa", x: 50, y: 20, position: 2, rating: 4.6 },
      { category: "Cadeira", name: "Flexform Lognic 4D", brand: "Flexform", price_brl: 2899, store: "outro", affiliate_url: "https://flexform.com.br/lognic", x: 30, y: 85, position: 3, rating: 4.8 },
      { category: "Mesa", name: "Mesa em L 1.80m madeira escura", brand: "Madesa", price_brl: 1899, store: "magalu", affiliate_url: "https://www.magazineluiza.com.br/mesa-l-madeira-escura", x: 50, y: 65, position: 4, rating: 4.4 },
      { category: "Teclado", name: "Logitech MX Keys + Mouse MX Master 3S", brand: "Logitech", price_brl: 1499, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/logitech-mx-bundle", x: 60, y: 75, position: 5, rating: 4.9 },
    ],
  },
  {
    ownerEmail: "trader@homeoffice.test",
    slug: "trader-compacto-ultrawide",
    title: "Day trader compacto com ultrawide",
    description: "Um monitor ultrawide 49\" substitui 3 telas. Menos cabo, mais foco. Para apê pequeno com alma de Wall Street.",
    styles: ["trader", "ultrawide", "compacto"],
    career: "outro",
    budget_brl: 9500,
    city: "São Paulo, SP",
    cover_url: "https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=1600&q=80",
    ai_score: 8.8,
    products: [
      { category: "Monitor", name: "Samsung Odyssey G9 49\"", brand: "Samsung", price_brl: 6499, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/samsung-odyssey-g9", x: 50, y: 30, position: 1, rating: 4.7 },
      { category: "Cadeira", name: "DXRacer Master", brand: "DXRacer", price_brl: 2299, store: "kabum", affiliate_url: "https://www.kabum.com.br/produto/dxracer-master", x: 30, y: 85, position: 2, rating: 4.6 },
      { category: "Teclado", name: "Keychron Q1 Pro", brand: "Keychron", price_brl: 1699, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/keychron-q1-pro", x: 45, y: 75, position: 3, rating: 4.9 },
    ],
  },

  // ===== Empreendedor Vini =====
  {
    ownerEmail: "empreendedor@homeoffice.test",
    slug: "founder-startup-mesa-de-pe",
    title: "Founder de startup com mesa de pé",
    description: "Mesa eletrônica + cadeira high-end + setup multi-uso (call, código, pitch). Para quem alterna entre 5 chapéus por dia.",
    styles: ["startup", "ergonomico", "high-end"],
    career: "outro",
    budget_brl: 11800,
    city: "Florianópolis, SC",
    cover_url: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=1600&q=80",
    ai_score: 9.0,
    products: [
      { category: "Mesa", name: "FlexiSpot E7 Pro 1.60m", brand: "FlexiSpot", price_brl: 4999, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/flexispot-e7-pro", x: 50, y: 60, position: 1, rating: 4.8 },
      { category: "Cadeira", name: "Herman Miller Sayl", brand: "Herman Miller", price_brl: 4499, store: "outro", affiliate_url: "https://hermanmiller.com.br/sayl", x: 25, y: 85, position: 2, rating: 4.9 },
      { category: "Monitor", name: "LG UltraFine 32UN880 4K", brand: "LG", price_brl: 5999, store: "kabum", affiliate_url: "https://www.kabum.com.br/produto/lg-ultrafine-32", x: 50, y: 25, position: 3, rating: 4.8 },
      { category: "Câmera", name: "Logitech Brio 4K", brand: "Logitech", price_brl: 1299, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/logitech-brio-4k", x: 50, y: 18, position: 4, rating: 4.7 },
    ],
  },

  // ===== Professora Helena =====
  {
    ownerEmail: "professor@homeoffice.test",
    slug: "professora-online-camera-lousa",
    title: "Professora online com câmera + lousa",
    description: "Setup pra aulas remotas: câmera 4K, lousa digital, mic com cancelamento e iluminação difusa pra cara não brilhar.",
    styles: ["ensino", "video", "lousa-digital"],
    career: "outro",
    budget_brl: 8200,
    city: "Belo Horizonte, MG",
    cover_url: "https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=1600&q=80",
    ai_score: 8.9,
    products: [
      { category: "Câmera", name: "Sony ZV-1 Mark II", brand: "Sony", price_brl: 5499, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/sony-zv-1-mark-ii", x: 50, y: 25, position: 1, rating: 4.8 },
      { category: "Tablet", name: "Wacom One 13.3 Display", brand: "Wacom", price_brl: 3499, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/wacom-one-13", x: 60, y: 70, position: 2, rating: 4.6 },
      { category: "Microfone", name: "Razer Seiren Mini", brand: "Razer", price_brl: 599, store: "kabum", affiliate_url: "https://www.kabum.com.br/produto/razer-seiren-mini", x: 30, y: 50, position: 3, rating: 4.5 },
      { category: "Iluminação", name: "Painel LED Neewer 660", brand: "Neewer", price_brl: 599, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/neewer-660", x: 75, y: 30, position: 4, rating: 4.6 },
    ],
  },
  {
    ownerEmail: "professor@homeoffice.test",
    slug: "professor-quarto-pequeno-mesa-canto",
    title: "Professor em quarto pequeno",
    description: "Mesa de canto, parede neutra clara, iluminação artificial bem feita pra não depender da janela. Curinga.",
    styles: ["compacto", "ensino", "casa-pequena"],
    career: "outro",
    budget_brl: 3200,
    city: "Belo Horizonte, MG",
    cover_url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1600&q=80",
    ai_score: 8.1,
    products: [
      { category: "Mesa", name: "Mesa de canto Madesa 90cm", brand: "Madesa", price_brl: 599, store: "magalu", affiliate_url: "https://www.magazineluiza.com.br/mesa-canto-madesa", x: 50, y: 65, position: 1, rating: 4.3 },
      { category: "Câmera", name: "Logitech C920s HD Pro", brand: "Logitech", price_brl: 549, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/logitech-c920s", x: 50, y: 25, position: 2, rating: 4.7 },
      { category: "Iluminação", name: "Ring light 14\" tripé", brand: "Genérico", price_brl: 199, store: "mercado_livre", affiliate_url: "https://produto.mercadolivre.com.br/ring-light-14", x: 75, y: 35, position: 3, rating: 4.4 },
      { category: "Headset", name: "JBL Quantum 100", brand: "JBL", price_brl: 299, store: "kabum", affiliate_url: "https://www.kabum.com.br/produto/jbl-quantum-100", x: 30, y: 55, position: 4, rating: 4.5 },
    ],
  },

  // ===== Consultor Thiago =====
  {
    ownerEmail: "consultor@homeoffice.test",
    slug: "consultor-call-elegante",
    title: "Consultor: a melhor cara em call",
    description: "Mesa sóbria, fundo neutro, câmera ligeiramente acima dos olhos. Pra quem cobra R$ 500/hora a aparência conta.",
    styles: ["consultor", "video", "elegante"],
    career: "pm",
    budget_brl: 8900,
    city: "São Paulo, SP",
    cover_url: "https://images.unsplash.com/photo-1593642634443-44adaa06623a?w=1600&q=80",
    ai_score: 9.0,
    products: [
      { category: "Câmera", name: "Insta360 Link 4K AI", brand: "Insta360", price_brl: 2299, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/insta360-link", x: 50, y: 25, position: 1, rating: 4.8 },
      { category: "Iluminação", name: "Elgato Key Light (2 unidades)", brand: "Elgato", price_brl: 3299, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/elgato-key-light-pair", x: 75, y: 30, position: 2, rating: 4.9 },
      { category: "Microfone", name: "Shure MV7 USB/XLR", brand: "Shure", price_brl: 2199, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/shure-mv7", x: 30, y: 50, position: 3, rating: 4.9 },
      { category: "Cadeira", name: "Flexform Lognic 4D Couro", brand: "Flexform", price_brl: 3499, store: "outro", affiliate_url: "https://flexform.com.br/lognic-couro", x: 25, y: 85, position: 4, rating: 4.8 },
    ],
  },

  // ===== Streamer Kauã =====
  {
    ownerEmail: "streamer@homeoffice.test",
    slug: "streamer-fps-rgb-completo",
    title: "Streamer de FPS com RGB completo",
    description: "PC top + 240Hz + iluminação reativa + braço de mic. Pra quem faz live de FPS competitivo todo dia.",
    styles: ["streamer", "rgb", "fps", "high-end"],
    career: "creator",
    budget_brl: 24000,
    city: "Brasília, DF",
    cover_url: "https://images.unsplash.com/photo-1623934199716-dc28818a3d6f?w=1600&q=80",
    ai_score: 9.4,
    products: [
      { category: "Monitor", name: "ASUS ROG Swift 27\" 360Hz", brand: "ASUS", price_brl: 5999, store: "kabum", affiliate_url: "https://www.kabum.com.br/produto/asus-rog-swift-360", x: 50, y: 25, position: 1, rating: 4.9 },
      { category: "PC", name: "PC Gamer RTX 4070 Ti + i7-14700K", brand: "Pichau", price_brl: 11999, store: "pichau", affiliate_url: "https://www.pichau.com.br/pc-gamer-rtx-4070-ti", x: 20, y: 60, position: 2, rating: 4.8 },
      { category: "Headset", name: "Audeze Maxwell Wireless", brand: "Audeze", price_brl: 3499, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/audeze-maxwell", x: 70, y: 55, position: 3, rating: 4.9 },
      { category: "Microfone", name: "Shure SM7B + interface", brand: "Shure", price_brl: 4299, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/shure-sm7b", x: 35, y: 40, position: 4, rating: 4.9 },
      { category: "Cadeira", name: "Secretlab TITAN Evo 2022", brand: "Secretlab", price_brl: 3799, store: "outro", affiliate_url: "https://secretlab.com.br/titan-evo", x: 30, y: 85, position: 5, rating: 4.9 },
    ],
  },
  {
    ownerEmail: "streamer@homeoffice.test",
    slug: "streamer-casual-comecando",
    title: "Streamer começando — kit essencial",
    description: "Não dá pra comprar tudo de cara. Kit mínimo para começar a streamar com qualidade decente, sem mortgage.",
    styles: ["streamer", "iniciante", "compacto"],
    career: "creator",
    budget_brl: 3900,
    city: "Brasília, DF",
    cover_url: "https://images.unsplash.com/photo-1626218174358-7769486a5b85?w=1600&q=80",
    ai_score: 8.2,
    products: [
      { category: "Microfone", name: "Fifine K669B USB", brand: "Fifine", price_brl: 249, store: "mercado_livre", affiliate_url: "https://produto.mercadolivre.com.br/fifine-k669b", x: 35, y: 45, position: 1, rating: 4.6 },
      { category: "Câmera", name: "Logitech C922 Pro", brand: "Logitech", price_brl: 749, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/logitech-c922-pro", x: 50, y: 25, position: 2, rating: 4.7 },
      { category: "Iluminação", name: "Ring light 18\" com tripé", brand: "Genérico", price_brl: 299, store: "mercado_livre", affiliate_url: "https://produto.mercadolivre.com.br/ring-light-18", x: 75, y: 30, position: 3, rating: 4.4 },
      { category: "Headset", name: "HyperX Cloud Stinger 2", brand: "HyperX", price_brl: 449, store: "kabum", affiliate_url: "https://www.kabum.com.br/produto/hyperx-cloud-stinger-2", x: 25, y: 55, position: 4, rating: 4.6 },
    ],
  },

  // ===== Cientista de Dados Fernanda =====
  {
    ownerEmail: "datasci@homeoffice.test",
    slug: "data-scientist-thinkpad-4k",
    title: "Cientista de dados: ThinkPad + 4K",
    description: "Notebook potente + dock + monitor 4K + cadeira pra 10h de IDE aberta. Sem firula, foco em produtividade.",
    styles: ["data-science", "notebook", "produtivo"],
    career: "dev",
    budget_brl: 13500,
    city: "Campinas, SP",
    cover_url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1600&q=80",
    ai_score: 9.1,
    products: [
      { category: "Notebook", name: "ThinkPad X1 Carbon Gen 11 i7", brand: "Lenovo", price_brl: 8999, store: "magalu", affiliate_url: "https://www.magazineluiza.com.br/thinkpad-x1-carbon-gen-11", x: 30, y: 60, position: 1, rating: 4.8 },
      { category: "Monitor", name: "LG UltraFine 27UN850 4K", brand: "LG", price_brl: 2799, store: "kabum", affiliate_url: "https://www.kabum.com.br/produto/lg-ultrafine-27un850", x: 50, y: 25, position: 2, rating: 4.7 },
      { category: "Dock", name: "Thunderbolt 4 Dock Belkin", brand: "Belkin", price_brl: 1499, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/belkin-thunderbolt-4-dock", x: 65, y: 65, position: 3, rating: 4.6 },
      { category: "Cadeira", name: "Herman Miller Aeron Remastered", brand: "Herman Miller", price_brl: 14999, store: "outro", affiliate_url: "https://hermanmiller.com.br/aeron-remastered", x: 25, y: 85, position: 4, rating: 4.9 },
    ],
  },

  // ===== Adicionais pra usuários existentes =====
  {
    ownerEmail: "dev@homeoffice.test",
    slug: "dev-backend-cave-escura",
    title: "Dev backend cave escura",
    description: "Parede preta, RGB calibrado, monitor curvo. Pra quem trabalha à noite e tem o monitor como única luz.",
    styles: ["dev", "dark-mode", "rgb-discreto"],
    career: "dev",
    budget_brl: 11500,
    city: "Rio de Janeiro, RJ",
    cover_url: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=1600&q=80",
    ai_score: 8.8,
    products: [
      { category: "Monitor", name: "Samsung Odyssey G7 32\" curvo", brand: "Samsung", price_brl: 4499, store: "kabum", affiliate_url: "https://www.kabum.com.br/produto/samsung-odyssey-g7-32", x: 50, y: 30, position: 1, rating: 4.7 },
      { category: "Teclado", name: "Keychron Q1 HE", brand: "Keychron", price_brl: 1899, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/keychron-q1-he", x: 45, y: 75, position: 2, rating: 4.9 },
      { category: "Iluminação", name: "Govee Lyra Floor Lamp RGB", brand: "Govee", price_brl: 899, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/govee-lyra", x: 80, y: 75, position: 3, rating: 4.7 },
      { category: "Cadeira", name: "DT3 Sports Elise", brand: "DT3", price_brl: 1799, store: "kabum", affiliate_url: "https://www.kabum.com.br/produto/dt3-elise", x: 25, y: 85, position: 4, rating: 4.6 },
    ],
  },
  {
    ownerEmail: "designer@homeoffice.test",
    slug: "designer-ipad-procreate-mesa-branca",
    title: "Designer com iPad + Procreate",
    description: "iPad Pro 12.9 como ferramenta principal, mesa branca super limpa. Mobilidade total — leva pra cafeteria fácil.",
    styles: ["minimalista", "ipad", "mobilidade"],
    career: "designer",
    budget_brl: 14000,
    city: "Florianópolis, SC",
    cover_url: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=1600&q=80",
    ai_score: 9.1,
    products: [
      { category: "Tablet", name: "iPad Pro 12.9\" M2 + Pencil 2", brand: "Apple", price_brl: 11999, store: "magalu", affiliate_url: "https://www.magazineluiza.com.br/ipad-pro-12-9", x: 50, y: 55, position: 1, rating: 4.9 },
      { category: "Suporte", name: "Suporte iPad articulado", brand: "Lululook", price_brl: 599, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/lululook-ipad-stand", x: 65, y: 65, position: 2, rating: 4.7 },
      { category: "Teclado", name: "Magic Keyboard for iPad Pro", brand: "Apple", price_brl: 2999, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/magic-keyboard-ipad-pro", x: 50, y: 75, position: 3, rating: 4.8 },
    ],
  },
  {
    ownerEmail: "creator@homeoffice.test",
    slug: "creator-tiktok-vertical-fundo",
    title: "Creator TikTok: setup vertical-first",
    description: "Câmera no celular, ring light na altura do peito, fundo colorido pra reels. Otimizado pra criar vertical.",
    styles: ["tiktok", "vertical", "creator"],
    career: "creator",
    budget_brl: 4500,
    city: "São Paulo, SP",
    cover_url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1600&q=80",
    ai_score: 8.4,
    products: [
      { category: "Iluminação", name: "Ring light Neewer 18\" tripé", brand: "Neewer", price_brl: 499, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/neewer-ring-light-18", x: 65, y: 30, position: 1, rating: 4.7 },
      { category: "Tripé", name: "Tripé articulado Manfrotto Pixi", brand: "Manfrotto", price_brl: 449, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/manfrotto-pixi", x: 35, y: 35, position: 2, rating: 4.7 },
      { category: "Microfone", name: "Rode Wireless Go II (kit duplo)", brand: "Rode", price_brl: 2299, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/rode-wireless-go-ii", x: 30, y: 50, position: 3, rating: 4.8 },
      { category: "Iluminação", name: "Govee Glide RGB Wall", brand: "Govee", price_brl: 899, store: "amazon_br", affiliate_url: "https://www.amazon.com.br/govee-glide", x: 80, y: 25, position: 4, rating: 4.6 },
    ],
  },
];

export const SEED_COMMENTS: SeedComment[] = [
  // setup-dev-minimalista-madeira
  { setupSlug: "setup-dev-minimalista-madeira", authorEmail: "designer@homeoffice.test", body: "Esse tom de madeira tá perfeito! Onde comprou?" },
  { setupSlug: "setup-dev-minimalista-madeira", authorEmail: "creator@homeoffice.test", body: "Keychron K2 é meu também, melhor compra do ano." },
  { setupSlug: "setup-dev-minimalista-madeira", authorEmail: "pm@homeoffice.test", body: "Quanto ficou no total esse setup?" },
  { setupSlug: "setup-dev-minimalista-madeira", authorEmail: "dev@homeoffice.test", body: "@isa_pm uns R$ 8.500 com a cadeira nova. Mesa eu já tinha." },

  // home-office-dev-dual-monitor
  { setupSlug: "home-office-dev-dual-monitor", authorEmail: "estudante@homeoffice.test", body: "Sonho ter dois 4K assim 😍" },
  { setupSlug: "home-office-dev-dual-monitor", authorEmail: "arquiteto@homeoffice.test", body: "O Philips Hue compensa mesmo? Tô em dúvida." },
  { setupSlug: "home-office-dev-dual-monitor", authorEmail: "dev@homeoffice.test", body: "@pedro_arq compensa, mas configura no app que faz diferença na vibe." },
  { setupSlug: "home-office-dev-dual-monitor", authorEmail: "casal@homeoffice.test", body: "Excelente organização de cabos. Inveja!" },

  // designer-minimal-branco-plantas
  { setupSlug: "designer-minimal-branco-plantas", authorEmail: "pm@homeoffice.test", body: "As plantas dão outra vida no espaço, amei." },
  { setupSlug: "designer-minimal-branco-plantas", authorEmail: "executivo@homeoffice.test", body: "Wacom Intuos Pro vale o investimento? Quero começar a desenhar." },
  { setupSlug: "designer-minimal-branco-plantas", authorEmail: "designer@homeoffice.test", body: "@carlos_exec super vale, peso ergonomia + sensibilidade. Recomendo." },
  { setupSlug: "designer-minimal-branco-plantas", authorEmail: "creator@homeoffice.test", body: "Setup limpíssimo. Que monitor é esse?" },

  // cantinho-criativo-cores-pasteis
  { setupSlug: "cantinho-criativo-cores-pasteis", authorEmail: "estudante@homeoffice.test", body: "Adorei a paleta pastel! Cabe num quarto pequeno?" },
  { setupSlug: "cantinho-criativo-cores-pasteis", authorEmail: "designer@homeoffice.test", body: "@mari_estudante cabe sim, mesa tem só 90cm. 😉" },

  // studio-creator-tech-rgb
  { setupSlug: "studio-creator-tech-rgb", authorEmail: "dev@homeoffice.test", body: "Que iluminação maravilhosa! Govee mesmo?" },
  { setupSlug: "studio-creator-tech-rgb", authorEmail: "pm@homeoffice.test", body: "A Sony ZV-E10 é referência pra creator iniciante, ótima escolha." },
  { setupSlug: "studio-creator-tech-rgb", authorEmail: "casal@homeoffice.test", body: "Esse setup deve render uns vídeos lindos." },
  { setupSlug: "studio-creator-tech-rgb", authorEmail: "creator@homeoffice.test", body: "@ana_e_bruno valeu! Em breve tutorial completo no canal." },

  // cantinho-podcast-acustico
  { setupSlug: "cantinho-podcast-acustico", authorEmail: "arquiteto@homeoffice.test", body: "A espuma fez muita diferença na qualidade do som?" },
  { setupSlug: "cantinho-podcast-acustico", authorEmail: "creator@homeoffice.test", body: "@pedro_arq absurda. Antes eco horrível, agora som limpo." },

  // gamer-rgb-triple-monitor
  { setupSlug: "gamer-rgb-triple-monitor", authorEmail: "estudante@homeoffice.test", body: "Daqui uns 5 anos chego nesse nível 🥲" },
  { setupSlug: "gamer-rgb-triple-monitor", authorEmail: "creator@homeoffice.test", body: "Mano, isso aí é o sonho. Quanto FPS no Cyberpunk?" },
  { setupSlug: "gamer-rgb-triple-monitor", authorEmail: "dev@homeoffice.test", body: "@leo_creator 144fps tranquilo no Ultra. RTX 4080 dá conta." },
  { setupSlug: "gamer-rgb-triple-monitor", authorEmail: "pm@homeoffice.test", body: "Como vc consegue se concentrar com tanto RGB? hahaha" },

  // setup-estudante-orcamento-1500
  { setupSlug: "setup-estudante-orcamento-1500", authorEmail: "designer@homeoffice.test", body: "Setup honesto e funcional, parabéns! Começa assim mesmo." },
  { setupSlug: "setup-estudante-orcamento-1500", authorEmail: "casal@homeoffice.test", body: "Adorei a dica do suporte de notebook, vou comprar." },
  { setupSlug: "setup-estudante-orcamento-1500", authorEmail: "estudante@homeoffice.test", body: "@ana_e_bruno vale muito a pena, melhora muito a postura!" },

  // standing-desk-ergonomico
  { setupSlug: "standing-desk-ergonomico", authorEmail: "executivo@homeoffice.test", body: "Vale o investimento na FlexiSpot? Tenho problema de coluna." },
  { setupSlug: "standing-desk-ergonomico", authorEmail: "designer@homeoffice.test", body: "@carlos_exec absolutamente vale, em 1 mês minha lombar já agradeceu." },
  { setupSlug: "standing-desk-ergonomico", authorEmail: "pm@homeoffice.test", body: "Passei 1h em pé hoje, mudei o jogo." },

  // arquiteto-monitor-vertical-cintiq
  { setupSlug: "arquiteto-monitor-vertical-cintiq", authorEmail: "designer@homeoffice.test", body: "Cintiq Pro é caro mas é outro patamar. Inveja boa." },
  { setupSlug: "arquiteto-monitor-vertical-cintiq", authorEmail: "dev@homeoffice.test", body: "Curiosidade: o monitor vertical ajuda mesmo no AutoCAD?" },

  // executivo-classico-mogno-couro
  { setupSlug: "executivo-classico-mogno-couro", authorEmail: "pm@homeoffice.test", body: "Estética muito profissional. Perfeita pra reuniões importantes." },
  { setupSlug: "executivo-classico-mogno-couro", authorEmail: "creator@homeoffice.test", body: "Setup raro nessa galeria. Bem clássico, gostei." },

  // setup-duplo-casal-home-office
  { setupSlug: "setup-duplo-casal-home-office", authorEmail: "designer@homeoffice.test", body: "Como vocês fazem com chamadas simultâneas?" },
  { setupSlug: "setup-duplo-casal-home-office", authorEmail: "casal@homeoffice.test", body: "@ju_designer fone com cancelamento de ruído pra cada um, salva." },

  // apartamento-minusculo-mesa-dobravel
  { setupSlug: "apartamento-minusculo-mesa-dobravel", authorEmail: "estudante@homeoffice.test", body: "Genial! Moro num studio e isso é exatamente o que preciso." },

  // pm-camera-4k-iluminacao-zoom
  { setupSlug: "pm-camera-4k-iluminacao-zoom", authorEmail: "executivo@homeoffice.test", body: "A diferença que uma boa câmera faz nas calls é absurda." },
  { setupSlug: "pm-camera-4k-iluminacao-zoom", authorEmail: "creator@homeoffice.test", body: "Elgato Key Light Air é top, uso a versão grande aqui." },
];

