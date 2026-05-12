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
];

export const findSetup = (slug: string) => SETUPS.find((s) => s.slug === slug);
