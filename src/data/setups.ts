import minimal from "@/assets/setup-minimal.webp";
import gamer from "@/assets/setup-gamer.webp";
import creator from "@/assets/setup-creator.webp";
import compact from "@/assets/setup-compact.webp";
import hero from "@/assets/hero-setup.webp";
import after from "@/assets/after.webp";

export type Product = {
  id: string;
  category: "Mesa" | "Cadeira" | "Monitor" | "Notebook" | "Iluminação" | "Decoração" | "Periféricos";
  name: string;
  brand: string;
  price: number;
  store: "Amazon BR" | "Mercado Livre" | "Kabum" | "Magalu" | "Pichau";
  rating: number;
  affiliateUrl: string;
  cheaperAlt?: { name: string; price: number; store: string };
  /** position on the image as a percentage 0–100 */
  x: number;
  y: number;
};

export type Setup = {
  id: string;
  slug: string;
  title: string;
  author: string;
  authorRole: "Dev" | "Designer" | "PO/PM" | "Creator" | "Remoto";
  city: string;
  image: string;
  score: number;
  likes: number;
  saves: number;
  styles: string[];
  budget: number;
  description: string;
  products: Product[];
};

export const STYLES = [
  "Todos",
  "Minimalista",
  "Gamer",
  "Produtivo",
  "Apê pequeno",
  "Setup barato",
  "MacBook",
  "Dev",
  "Designer",
  "Creator",
] as const;

export const ROLES = ["Dev", "Designer", "PO/PM", "Creator", "Remoto"] as const;

export const SETUPS: Setup[] = [
  {
    id: "1",
    slug: "dev-turquesa",
    title: "Dev Turquesa",
    author: "@matheus.code",
    authorRole: "Dev",
    city: "São Paulo, SP",
    image: hero,
    score: 9.1,
    likes: 842,
    saves: 312,
    styles: ["Dev", "Produtivo", "MacBook"],
    budget: 6800,
    description:
      "Setup focado em foco profundo. Ultrawide pra ver código + docs lado a lado, teclado mecânico silencioso pra calls e parede turquesa pra cortar a fadiga visual do branco.",
    products: [
      { id: "p1", category: "Monitor", name: "LG Ultrawide 34WP65C", brand: "LG", price: 2799, store: "Kabum", rating: 4.7, affiliateUrl: "#", x: 50, y: 35, cheaperAlt: { name: "Samsung CJ791 34\"", price: 2299, store: "Amazon BR" } },
      { id: "p2", category: "Periféricos", name: "Keychron K2 Pro", brand: "Keychron", price: 920, store: "Amazon BR", rating: 4.8, affiliateUrl: "#", x: 48, y: 68, cheaperAlt: { name: "Redragon Kumara K552", price: 199, store: "Mercado Livre" } },
      { id: "p3", category: "Iluminação", name: "Luminária Articulada IKEA Ranarp", brand: "IKEA", price: 349, store: "Mercado Livre", rating: 4.6, affiliateUrl: "#", x: 82, y: 28 },
      { id: "p4", category: "Mesa", name: "Mesa cavalete madeira maciça", brand: "Móveis BR", price: 890, store: "Magalu", rating: 4.5, affiliateUrl: "#", x: 50, y: 85 },
    ],
  },
  {
    id: "2",
    slug: "cyber-cave",
    title: "Cyber Cave",
    author: "@gabi.streams",
    authorRole: "Creator",
    city: "Curitiba, PR",
    image: gamer,
    score: 8.7,
    likes: 1240,
    saves: 489,
    styles: ["Gamer", "Creator"],
    budget: 12500,
    description: "Dual monitor com RGB pra streaming e edição. Cadeira gamer com sustentação lombar pra maratonas de live.",
    products: [
      { id: "p5", category: "Monitor", name: "AOC Hero 27\" 165Hz", brand: "AOC", price: 1599, store: "Kabum", rating: 4.6, affiliateUrl: "#", x: 28, y: 35 },
      { id: "p6", category: "Cadeira", name: "DT3 Sports Elise", brand: "DT3", price: 1490, store: "Pichau", rating: 4.4, affiliateUrl: "#", x: 78, y: 65, cheaperAlt: { name: "ThunderX3 EC1", price: 890, store: "Kabum" } },
      { id: "p7", category: "Periféricos", name: "Razer Huntsman Mini", brand: "Razer", price: 850, store: "Amazon BR", rating: 4.7, affiliateUrl: "#", x: 38, y: 75 },
    ],
  },
  {
    id: "3",
    slug: "white-clean",
    title: "White & Clean",
    author: "@ana.designer",
    authorRole: "Designer",
    city: "Belo Horizonte, MG",
    image: minimal,
    score: 9.4,
    likes: 980,
    saves: 612,
    styles: ["Minimalista", "Designer", "MacBook"],
    budget: 4200,
    description: "Tudo branco, zero distração visual. iMac M3, teclado Magic compacto e plantinha pra cortar.",
    products: [
      { id: "p8", category: "Notebook", name: "iMac 24\" M3", brand: "Apple", price: 16999, store: "Magalu", rating: 4.9, affiliateUrl: "#", x: 50, y: 40 },
      { id: "p9", category: "Periféricos", name: "Apple Magic Keyboard", brand: "Apple", price: 999, store: "Amazon BR", rating: 4.7, affiliateUrl: "#", x: 45, y: 65, cheaperAlt: { name: "Logitech MX Keys Mini", price: 690, store: "Mercado Livre" } },
      { id: "p10", category: "Decoração", name: "Vaso cerâmico + suculenta", brand: "Plantei", price: 89, store: "Mercado Livre", rating: 4.5, affiliateUrl: "#", x: 78, y: 50 },
    ],
  },
  {
    id: "4",
    slug: "creator-studio",
    title: "Creator Studio",
    author: "@joao.cria",
    authorRole: "Creator",
    city: "Rio de Janeiro, RJ",
    image: creator,
    score: 8.9,
    likes: 1560,
    saves: 740,
    styles: ["Creator", "Produtivo"],
    budget: 5400,
    description: "Foco em vídeo e podcast: ring light, mic shotgun e câmera DSLR num tripé compacto.",
    products: [
      { id: "p11", category: "Iluminação", name: "Ring Light 18\" Profissional", brand: "Greika", price: 449, store: "Amazon BR", rating: 4.5, affiliateUrl: "#", x: 50, y: 25 },
      { id: "p12", category: "Periféricos", name: "Mic Rode VideoMic Pro", brand: "Rode", price: 1290, store: "Kabum", rating: 4.8, affiliateUrl: "#", x: 60, y: 45, cheaperAlt: { name: "Boya BY-MM1", price: 199, store: "Mercado Livre" } },
    ],
  },
  {
    id: "5",
    slug: "ape-32m2",
    title: "Apê 32m²",
    author: "@bia.pequena",
    authorRole: "Remoto",
    city: "Porto Alegre, RS",
    image: compact,
    score: 8.3,
    likes: 612,
    saves: 290,
    styles: ["Apê pequeno", "Setup barato", "Minimalista"],
    budget: 1480,
    description: "Setup que cabe em 80cm. Suporte de notebook + teclado externo + monitor 19\" usado.",
    products: [
      { id: "p13", category: "Mesa", name: "Mesa cavalete pinus 100x50", brand: "Casa Móveis", price: 320, store: "Magalu", rating: 4.3, affiliateUrl: "#", x: 50, y: 80 },
      { id: "p14", category: "Notebook", name: "Suporte notebook elevado", brand: "Multilaser", price: 89, store: "Mercado Livre", rating: 4.4, affiliateUrl: "#", x: 38, y: 50 },
    ],
  },
  {
    id: "6",
    slug: "cozy-wood",
    title: "Cozy Wood",
    author: "@rafa.home",
    authorRole: "PO/PM",
    city: "Florianópolis, SC",
    image: after,
    score: 9.0,
    likes: 720,
    saves: 410,
    styles: ["Produtivo", "Minimalista"],
    budget: 5900,
    description: "Madeira, plantas e luz quente. Pra quem tem reunião o dia todo e precisa de fundo bonito na câmera.",
    products: [
      { id: "p15", category: "Iluminação", name: "Luminária BenQ ScreenBar", brand: "BenQ", price: 690, store: "Amazon BR", rating: 4.8, affiliateUrl: "#", x: 75, y: 30 },
      { id: "p16", category: "Decoração", name: "Costela de Adão M", brand: "Plantei", price: 120, store: "Mercado Livre", rating: 4.6, affiliateUrl: "#", x: 18, y: 55 },
    ],
  },
  // === 20 setups novos (id 7-26) — diversidade de profissões/perfis/cidades ===
  {
    id: "7", slug: "psi-acolhedor", title: "Consultório Acolhedor",
    author: "@dra.helena", authorRole: "Remoto", city: "São Paulo, SP",
    image: after, score: 9.2, likes: 540, saves: 320,
    styles: ["Minimalista", "Produtivo"], budget: 4800,
    description: "Atendimento psicológico online com fundo neutro, iluminação quente e zero distração visual. Plantas pra acolhimento + painel acústico discreto.",
    products: [
      { id: "p17", category: "Iluminação", name: "Ring Light com difusor 18\"", brand: "Greika", price: 449, store: "Amazon BR", rating: 4.5, affiliateUrl: "#", x: 50, y: 25 },
      { id: "p18", category: "Periféricos", name: "Webcam Logitech C920", brand: "Logitech", price: 599, store: "Kabum", rating: 4.7, affiliateUrl: "#", x: 50, y: 40 },
    ],
  },
  {
    id: "8", slug: "advocacia-presenca", title: "Advocacia com Presença",
    author: "@dr.ricardo", authorRole: "Remoto", city: "Brasília, DF",
    image: hero, score: 9.3, likes: 890, saves: 510,
    styles: ["Produtivo"], budget: 8200,
    description: "Estante de livros como fundo de autoridade, iluminação frontal direta e cadeira executiva em couro. Pra audiências online e atendimento de clientes.",
    products: [
      { id: "p19", category: "Cadeira", name: "Cadeira executiva couro premium", brand: "Tok&Stok", price: 2890, store: "Magalu", rating: 4.6, affiliateUrl: "#", x: 78, y: 65 },
      { id: "p20", category: "Periféricos", name: "Webcam 4K com autofoco", brand: "Logitech", price: 1490, store: "Amazon BR", rating: 4.8, affiliateUrl: "#", x: 50, y: 38 },
    ],
  },
  {
    id: "9", slug: "telemedicina-clean", title: "Telemedicina Clean",
    author: "@dr.marina", authorRole: "Remoto", city: "Rio de Janeiro, RJ",
    image: minimal, score: 9.1, likes: 670, saves: 380,
    styles: ["Minimalista"], budget: 5200,
    description: "Ambiente clínico clean: fundo neutro, luz branca 5000K, microfone com cancelamento de ruído. Profissionalismo em consultas online.",
    products: [
      { id: "p21", category: "Periféricos", name: "Microfone USB com NC", brand: "Blue Yeti", price: 990, store: "Kabum", rating: 4.7, affiliateUrl: "#", x: 35, y: 55 },
      { id: "p22", category: "Iluminação", name: "Luminária LED 5000K neutra", brand: "Philips", price: 280, store: "Magalu", rating: 4.5, affiliateUrl: "#", x: 82, y: 28 },
    ],
  },
  {
    id: "10", slug: "professor-aulas-online", title: "Studio Aulas Online",
    author: "@prof.lucas", authorRole: "Remoto", city: "Belo Horizonte, MG",
    image: creator, score: 8.8, likes: 1120, saves: 680,
    styles: ["Creator", "Produtivo"], budget: 6500,
    description: "Setup pra dar aula online: dual monitor pra ver slides + alunos, mic USB direcional, ring light frontal e segunda câmera pra mostrar quadro.",
    products: [
      { id: "p23", category: "Monitor", name: "Monitor 24\" Full HD secundário", brand: "Samsung", price: 899, store: "Magalu", rating: 4.4, affiliateUrl: "#", x: 25, y: 35 },
      { id: "p24", category: "Periféricos", name: "Microfone USB condensador cardioide", brand: "Rode", price: 990, store: "Amazon BR", rating: 4.8, affiliateUrl: "#", x: 55, y: 50 },
    ],
  },
  {
    id: "11", slug: "executive-clean", title: "Executive Clean",
    author: "@carla.ceo", authorRole: "PO/PM", city: "São Paulo, SP",
    image: hero, score: 9.4, likes: 1340, saves: 890,
    styles: ["Produtivo", "Minimalista"], budget: 11200,
    description: "Home office C-level: arte intencional no fundo, câmera 4K na altura dos olhos, mesa de mogno e iluminação ambiente neutra. Reuniões estratégicas com presença.",
    products: [
      { id: "p25", category: "Mesa", name: "Mesa executiva mogno 160x80", brand: "Tok&Stok", price: 4200, store: "Magalu", rating: 4.7, affiliateUrl: "#", x: 50, y: 80 },
      { id: "p26", category: "Periféricos", name: "Webcam 4K Logitech Brio", brand: "Logitech", price: 1690, store: "Kabum", rating: 4.8, affiliateUrl: "#", x: 50, y: 32 },
    ],
  },
  {
    id: "12", slug: "arquiteto-projetos", title: "Atelier Arquitetura",
    author: "@arq.julia", authorRole: "Designer", city: "Porto Alegre, RS",
    image: minimal, score: 9.0, likes: 720, saves: 450,
    styles: ["Designer", "Produtivo"], budget: 9800,
    description: "Monitor ultrawide pra plantas inteiras, mesa digitalizadora, mesa ampla pra material físico. Cor calibrada pra fidelidade em renderizações.",
    products: [
      { id: "p27", category: "Monitor", name: "Monitor 34\" ultrawide IPS sRGB 99%", brand: "Dell", price: 3990, store: "Kabum", rating: 4.8, affiliateUrl: "#", x: 50, y: 35 },
      { id: "p28", category: "Periféricos", name: "Wacom Intuos M Bluetooth", brand: "Wacom", price: 1290, store: "Amazon BR", rating: 4.6, affiliateUrl: "#", x: 38, y: 70 },
    ],
  },
  {
    id: "13", slug: "freela-versatil", title: "Freela Versátil",
    author: "@ju.freela", authorRole: "Designer", city: "Recife, PE",
    image: compact, score: 8.5, likes: 480, saves: 240,
    styles: ["Apê pequeno", "Designer", "Setup barato"], budget: 2400,
    description: "Cabe em qualquer canto: notebook + monitor portátil + suporte ergonômico. Multifuncional pra rodar entre design, reuniões e edição de vídeo.",
    products: [
      { id: "p29", category: "Monitor", name: "Monitor portátil 15.6\" USB-C", brand: "ASUS", price: 1290, store: "Kabum", rating: 4.4, affiliateUrl: "#", x: 35, y: 35 },
      { id: "p30", category: "Notebook", name: "Suporte ajustável alumínio", brand: "Multilaser", price: 149, store: "Mercado Livre", rating: 4.5, affiliateUrl: "#", x: 60, y: 48 },
    ],
  },
  {
    id: "14", slug: "estudante-cs", title: "Estudante CS Focado",
    author: "@edu.csstudy", authorRole: "Dev", city: "Campinas, SP",
    image: compact, score: 7.8, likes: 320, saves: 180,
    styles: ["Setup barato", "Apê pequeno", "Dev"], budget: 1850,
    description: "Setup acadêmico enxuto: cadeira boa (#1 prioridade pra coluna), iluminação adequada e quadro com metas semanais.",
    products: [
      { id: "p31", category: "Cadeira", name: "Cadeira ergonômica básica mesh", brand: "Multilaser", price: 690, store: "Mercado Livre", rating: 4.3, affiliateUrl: "#", x: 78, y: 68 },
      { id: "p32", category: "Iluminação", name: "Luminária de mesa LED dimerizável", brand: "Avant", price: 159, store: "Magalu", rating: 4.4, affiliateUrl: "#", x: 82, y: 30 },
    ],
  },
  {
    id: "15", slug: "consultor-reunioes", title: "Consultor de Reuniões",
    author: "@pedro.consult", authorRole: "PO/PM", city: "São Paulo, SP",
    image: hero, score: 9.0, likes: 580, saves: 340,
    styles: ["Produtivo"], budget: 7400,
    description: "Setup pra reunião + análise simultânea: dois monitores externos, fundo limpo com elemento de marca pessoal, headset profissional pra calls longas.",
    products: [
      { id: "p33", category: "Monitor", name: "Dois monitores Dell 24\" Full HD", brand: "Dell", price: 1800, store: "Magalu", rating: 4.6, affiliateUrl: "#", x: 50, y: 35 },
      { id: "p34", category: "Periféricos", name: "Headset Jabra Evolve2 65", brand: "Jabra", price: 1490, store: "Amazon BR", rating: 4.7, affiliateUrl: "#", x: 35, y: 60 },
    ],
  },
  {
    id: "16", slug: "podcaster-pro", title: "Podcaster Pro",
    author: "@thiago.cast", authorRole: "Creator", city: "São Paulo, SP",
    image: creator, score: 9.1, likes: 1890, saves: 980,
    styles: ["Creator"], budget: 8900,
    description: "Estúdio podcast caseiro: mic shotgun em braço, painéis acústicos hexagonais, mesa de mixagem básica. Áudio é 70% do conteúdo.",
    products: [
      { id: "p35", category: "Periféricos", name: "Microfone Shure SM7B + Cloudlifter", brand: "Shure", price: 3490, store: "Kabum", rating: 4.9, affiliateUrl: "#", x: 50, y: 50 },
      { id: "p36", category: "Iluminação", name: "Softbox 50x70cm 5500K", brand: "Greika", price: 549, store: "Mercado Livre", rating: 4.5, affiliateUrl: "#", x: 78, y: 25 },
    ],
  },
  {
    id: "17", slug: "design-mobile-tablet", title: "Designer Mobile + Tablet",
    author: "@nai.mobile", authorRole: "Designer", city: "Rio de Janeiro, RJ",
    image: minimal, score: 8.9, likes: 920, saves: 540,
    styles: ["Designer", "MacBook", "Minimalista"], budget: 9400,
    description: "iPad Pro M2 + MacBook + monitor calibrado. Pra design mobile-first com workflow Figma → tablet → real device em tempo real.",
    products: [
      { id: "p37", category: "Notebook", name: "iPad Pro 12.9\" M2 Wi-Fi", brand: "Apple", price: 9999, store: "Magalu", rating: 4.9, affiliateUrl: "#", x: 30, y: 50 },
      { id: "p38", category: "Monitor", name: "Monitor LG 27UP850 4K IPS", brand: "LG", price: 3290, store: "Kabum", rating: 4.7, affiliateUrl: "#", x: 60, y: 35 },
    ],
  },
  {
    id: "18", slug: "dev-mae-trabalho", title: "Dev + Mãe (workspace flex)",
    author: "@marina.dev", authorRole: "Dev", city: "Belo Horizonte, MG",
    image: after, score: 8.6, likes: 1240, saves: 760,
    styles: ["Produtivo", "Apê pequeno"], budget: 4200,
    description: "Setup que vira escritório E mesa de tarefa pros filhos: mesa ampla, cadeira ergonômica boa e organização vertical. Cabe família inteira no espaço.",
    products: [
      { id: "p39", category: "Mesa", name: "Mesa cavalete madeira maciça 140cm", brand: "Madeira Madeira", price: 1290, store: "Magalu", rating: 4.5, affiliateUrl: "#", x: 50, y: 80 },
      { id: "p40", category: "Decoração", name: "Organizador vertical 4 nichos", brand: "Tramontina", price: 189, store: "Mercado Livre", rating: 4.4, affiliateUrl: "#", x: 88, y: 50 },
    ],
  },
  {
    id: "19", slug: "tiktoker-vertical", title: "TikToker Vertical",
    author: "@duda.tiktok", authorRole: "Creator", city: "Rio de Janeiro, RJ",
    image: creator, score: 8.2, likes: 2100, saves: 890,
    styles: ["Creator", "Setup barato"], budget: 1900,
    description: "Setup vertical pra TikTok/Reels: tripé de chão + ring light + smartphone com gimbal. Fundo decorado com adesivo de parede e LED RGB.",
    products: [
      { id: "p41", category: "Iluminação", name: "Ring Light 26\" com tripé 2.1m", brand: "Greika", price: 449, store: "Amazon BR", rating: 4.5, affiliateUrl: "#", x: 50, y: 40 },
      { id: "p42", category: "Decoração", name: "Fita LED RGB 5m c/ controle", brand: "Mi", price: 89, store: "Shopee", rating: 4.3, affiliateUrl: "#", x: 50, y: 15 },
    ],
  },
  {
    id: "20", slug: "empreendedor-solo", title: "Empreendedor Solo",
    author: "@gus.solo", authorRole: "PO/PM", city: "Curitiba, PR",
    image: hero, score: 8.7, likes: 540, saves: 290,
    styles: ["Produtivo"], budget: 6800,
    description: "Setup versátil pra gestão + vendas + gravação de conteúdo. Mesa ajustável (sit-stand), webcam decente, whiteboard digital. Multi-modo.",
    products: [
      { id: "p43", category: "Mesa", name: "Mesa sit-stand elétrica 120x60", brand: "FlexiSpot", price: 2890, store: "Amazon BR", rating: 4.6, affiliateUrl: "#", x: 50, y: 80 },
      { id: "p44", category: "Periféricos", name: "Webcam Insta360 Link", brand: "Insta360", price: 1990, store: "Kabum", rating: 4.7, affiliateUrl: "#", x: 50, y: 35 },
    ],
  },
  {
    id: "21", slug: "stream-3monitor", title: "Stream 3 Monitor Pro",
    author: "@viny.stream", authorRole: "Creator", city: "São Paulo, SP",
    image: gamer, score: 9.0, likes: 1450, saves: 720,
    styles: ["Gamer", "Creator"], budget: 14500,
    description: "Battlestation profissional pra streaming: monitor principal 144Hz + monitor secundário pra chat + tablet pra arte. Áudio com mixer e iluminação RGB controlável.",
    products: [
      { id: "p45", category: "Monitor", name: "Monitor 27\" QHD 165Hz", brand: "MSI", price: 2490, store: "Kabum", rating: 4.7, affiliateUrl: "#", x: 50, y: 35 },
      { id: "p46", category: "Periféricos", name: "GoXLR Mini mixer streamer", brand: "TC-Helicon", price: 2890, store: "Amazon BR", rating: 4.8, affiliateUrl: "#", x: 38, y: 65 },
    ],
  },
  {
    id: "22", slug: "minimal-mono", title: "Mono Black ZEN",
    author: "@victor.mono", authorRole: "Designer", city: "São Paulo, SP",
    image: minimal, score: 8.7, likes: 680, saves: 410,
    styles: ["Minimalista", "Designer", "Produtivo"], budget: 5800,
    description: "Tudo preto matte: monitor único, teclado mecânico low-profile e mouse minimalista. Zero distração cromática.",
    products: [
      { id: "p47", category: "Periféricos", name: "Keychron K3 Pro low profile", brand: "Keychron", price: 1090, store: "Amazon BR", rating: 4.7, affiliateUrl: "#", x: 48, y: 70 },
      { id: "p48", category: "Periféricos", name: "Logitech MX Master 3S preto", brand: "Logitech", price: 690, store: "Magalu", rating: 4.8, affiliateUrl: "#", x: 68, y: 72 },
    ],
  },
  {
    id: "23", slug: "vintage-warm", title: "Vintage Warm Wood",
    author: "@rodrigo.vintage", authorRole: "Designer", city: "Curitiba, PR",
    image: after, score: 8.6, likes: 590, saves: 320,
    styles: ["Minimalista", "Produtivo"], budget: 5400,
    description: "Mesa de madeira escura, luminária dourada de banker e luz quente. Café num caneco esmaltado. Vibe escritório anos 60.",
    products: [
      { id: "p49", category: "Iluminação", name: "Luminária banker dourada vintage", brand: "Lazyboy", price: 489, store: "Magalu", rating: 4.5, affiliateUrl: "#", x: 78, y: 32 },
      { id: "p50", category: "Decoração", name: "Caderno couro + caneta tinteiro", brand: "Moleskine", price: 320, store: "Amazon BR", rating: 4.6, affiliateUrl: "#", x: 45, y: 70 },
    ],
  },
  {
    id: "24", slug: "varanda-office", title: "Varanda Office",
    author: "@marina.varanda", authorRole: "Remoto", city: "São Paulo, SP",
    image: compact, score: 8.4, likes: 780, saves: 460,
    styles: ["Apê pequeno", "Minimalista"], budget: 3200,
    description: "Varanda transformada em escritório: mesa dobrável, cadeira portátil e plantas penduradas. Luz natural máxima, fundo verde de jardim vertical.",
    products: [
      { id: "p51", category: "Mesa", name: "Mesa dobrável MDF 80x50", brand: "Casa Móveis", price: 290, store: "Mercado Livre", rating: 4.2, affiliateUrl: "#", x: 50, y: 80 },
      { id: "p52", category: "Decoração", name: "Kit 3 vasos suspensos macramê", brand: "Plantei", price: 159, store: "Shopee", rating: 4.4, affiliateUrl: "#", x: 80, y: 20 },
    ],
  },
  {
    id: "25", slug: "remote-mae-flex", title: "Mãe Remote Flex",
    author: "@renata.mae", authorRole: "Remoto", city: "Belo Horizonte, MG",
    image: after, score: 8.0, likes: 920, saves: 510,
    styles: ["Apê pequeno", "Produtivo"], budget: 3600,
    description: "Setup que precisa virar mesa de tarefa em 30s: organização vertical, cadeira ergonômica boa, monitor pra liberar olho do notebook em chamadas longas.",
    products: [
      { id: "p53", category: "Cadeira", name: "Cadeira ergonômica com apoio lombar", brand: "DT3", price: 1290, store: "Pichau", rating: 4.5, affiliateUrl: "#", x: 78, y: 68 },
      { id: "p54", category: "Monitor", name: "Monitor 24\" Full HD secundário", brand: "Samsung", price: 899, store: "Magalu", rating: 4.4, affiliateUrl: "#", x: 50, y: 35 },
    ],
  },
  {
    id: "26", slug: "apt-quarto-sala", title: "Apê Quarto-Sala",
    author: "@alice.qs", authorRole: "Dev", city: "São Paulo, SP",
    image: compact, score: 7.9, likes: 410, saves: 220,
    styles: ["Apê pequeno", "Setup barato", "Dev"], budget: 3100,
    description: "30m² compartilhados entre quarto, sala e escritório. Solução: setup vertical contra a parede, cadeira que vira de leitura, divisória com biombo vegetal.",
    products: [
      { id: "p55", category: "Decoração", name: "Biombo bambu 3 painéis 170cm", brand: "Tok&Stok", price: 590, store: "Magalu", rating: 4.5, affiliateUrl: "#", x: 80, y: 50 },
      { id: "p56", category: "Notebook", name: "Suporte vertical MacBook compacto", brand: "OMOTON", price: 99, store: "Amazon BR", rating: 4.6, affiliateUrl: "#", x: 30, y: 50 },
    ],
  },
];

export const findSetup = (slug: string) => SETUPS.find((s) => s.slug === slug);
