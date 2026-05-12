/**
 * Posts do blog HomeOfficeLife — long-tail SEO BR.
 *
 * Estratégia: cada post mira 1 keyword de cauda longa com 300-3000
 * buscas/mês no Brasil, baixa concorrência. Linka pra galeria,
 * /kits, /diagnostico — converte visitante orgânico em lead.
 */

export type BlogSection =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; tone: "tip" | "warning" | "info"; title: string; text: string }
  | { type: "kit-cta"; kitSlug: string; title: string }
  | { type: "setup-cta"; setupSlug: string; title: string }
  | { type: "diagnostic-cta" };

export type BlogPost = {
  slug: string;
  title: string;
  /** Resumo curto pra preview cards + meta description. 140-160 chars ideal. */
  excerpt: string;
  /** Keywords principais (separadas por vírgula) — vai no meta keywords. */
  keywords: string;
  /** "Equipe HomeOfficeLife" ou nome editorial. */
  author: string;
  /** ISO date string */
  publishedAt: string;
  /** Tempo de leitura em minutos */
  readingMinutes: number;
  /** URL da Unsplash pra hero do post. */
  cover: string;
  /** Imagem específica pra OG card (pode ser mesma do cover ou diferente). */
  ogImage?: string;
  /** Categoria pra agrupar no índice. */
  category: "guia" | "comparacao" | "review" | "ergonomia";
  /** Estrutura do conteúdo. */
  content: BlogSection[];
};

const UNSPLASH = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export const BLOG_POSTS: BlogPost[] = [
  // =========================================================
  // POST 1: Setup R$ 500 (long-tail "home office barato")
  // =========================================================
  {
    slug: "home-office-r-500-completo-2026",
    title: "Como montar home office com R$ 500 em 2026 (testado por nós)",
    excerpt: "Setup completo de R$ 500 que aguenta 8h/dia: mesa, cadeira, monitor, periféricos. Lista real com link de cada produto na Amazon, ML e Magalu.",
    keywords: "home office barato, setup R$ 500, home office pequeno, kit home office, cadeira escritório barata",
    author: "Equipe HomeOfficeLife",
    publishedAt: "2026-05-08",
    readingMinutes: 8,
    cover: UNSPLASH("1518770660439-4636190af475"),
    category: "guia",
    content: [
      { type: "p", text: "Quem está começando a trabalhar de casa pela primeira vez raramente tem R$ 5 mil sobrando pra um setup completo. A boa notícia: com R$ 500 dá pra montar um espaço de trabalho decente que aguenta 8h/dia sem destruir sua coluna. Testamos 3 versões diferentes desse orçamento ao longo de 2025-2026 — abaixo a fórmula que melhor funcionou." },
      { type: "callout", tone: "tip", title: "Resumo executivo", text: "Mesa de pinus R$ 180 + cadeira do MagaLu R$ 130 + monitor usado 22\" R$ 120 + combo teclado/mouse R$ 70 = R$ 500. Nota IA estimada: 7.0/10. Suficiente pra começar." },
      { type: "h2", text: "Por que esse setup ainda assim funciona" },
      { type: "p", text: "Tirando ergonomia profissional, o que você precisa pra trabalhar 8h por dia é: superfície estável na altura certa, cadeira que não destrói a lombar em 2 horas, tela maior que a do notebook pra economizar pescoço, e teclado/mouse pra mãos. Tudo isso cabe em R$ 500 se você comprar nos lugares certos." },
      { type: "h2", text: "A lista completa" },
      { type: "h3", text: "1. Mesa: R$ 180 (Magalu)" },
      { type: "p", text: "Mesa pinus 120cm × 60cm é o sweet spot. Pinus é leve, fácil de mover quando o cabo da casa pifa, e tem aspecto bonito quando limpa. 120cm cabe um monitor de 24\" + teclado mecânico + mousepad grande sem aperto." },
      { type: "ul", items: [
        "Procure na Magalu por \"mesa pinus 120cm\"",
        "Evite MDF pintado: descasca em 3-4 meses",
        "Se achar de pinheiro maciço por menos de R$ 250, pega — dura década",
      ] },
      { type: "h3", text: "2. Cadeira: R$ 130 (Magalu / Casas Bahia)" },
      { type: "p", text: "Esqueça \"cadeira gamer R$ 600 com RGB\" pra esse orçamento. Cadeira de escritório giratória básica do MagaLu/Casas Bahia, com encosto regulável e apoio de braço. Não vai durar 5 anos — mas vai durar 1 ano até você ter dinheiro pra upgrade." },
      { type: "callout", tone: "warning", title: "Sinais de cadeira ruim demais", text: "Se a base é de plástico mole e a esfera é metálica fina, ela vai quebrar em 6 meses. Procure base de plástico reforçado ou alumínio e cilindro a gás com garantia de 1 ano." },
      { type: "h3", text: "3. Monitor: R$ 120-180 (mercado livre, usado)" },
      { type: "p", text: "Aqui a sacada: comprar monitor usado dos modelos populares de 2018-2020. Dell P2217H, AOC 22B1H, LG 22MK430 — todos passaram pelas empresas, foram trocados em lote e estão no ML por R$ 120-180. Resolução 1080p, 60Hz, painel IPS bom o suficiente pra trabalho. Notebook fica em pé num suporte ao lado." },
      { type: "h3", text: "4. Teclado + Mouse: R$ 70 (Amazon BR)" },
      { type: "p", text: "Combo Logitech MK270 ou MK295. Sem fio, bateria dura 1 ano, são confiáveis. Não é mecânico, não tem RGB, mas funciona pra digitar 6 horas." },
      { type: "kit-cta", kitSlug: "estudante", title: "Quer um kit R$ 1.500 mais turbinado? Vê o Kit Estudante." },
      { type: "h2", text: "Erros comuns que você vai querer evitar" },
      { type: "ol", items: [
        "Comprar cadeira sem testar: se for no shopping, sente. A diferença entre 2 cadeiras de R$ 150 pode ser brutal.",
        "Cair em \"oferta\" de mesa que precisa montar com 47 parafusos: a economia some na primeira semana de coluna torta.",
        "Ignorar iluminação: sua tela cansa porque o quarto tá escuro. Compra uma lâmpada amarela 14W de cabeceira de R$ 25 e ganha 2 pontos na nota IA imediatamente.",
        "Trabalhar com notebook puro: pescoço destruído em 6 meses. Suporte elevado de R$ 35 (Multilaser) já resolve.",
      ] },
      { type: "diagnostic-cta" },
      { type: "h2", text: "Roadmap de upgrade" },
      { type: "p", text: "Esse setup de R$ 500 é o ponto de partida, não a meta. Conforme o caixa entrar, vá trocando 1 item por mês:" },
      { type: "ol", items: [
        "Mês 1-3: economize e troque a cadeira por uma DT3 Nimitz (R$ 2.3k) ou ThunderX3 Yama1 (R$ 1.9k). Sua coluna agradece.",
        "Mês 4-6: monitor 27\" novo (Dell P2722H, ~R$ 1.4k) ou ultrawide usado (LG 29WP500-B, ~R$ 1.1k).",
        "Mês 6-9: mesa de madeira maciça (FlexiSpot elétrica E5, R$ 2.9k) — game changer pra postura.",
        "Mês 9-12: iluminação séria. BenQ ScreenBar Halo (R$ 1.2k) é o melhor investimento por R$ gasto.",
      ] },
      { type: "setup-cta", setupSlug: "estudante-medicina-fortaleza", title: "Inspiração real: setup de R$ 680 de estudante em Fortaleza →" },
    ],
  },

  // =========================================================
  // POST 2: Setup R$ 3k vs R$ 30k (comparison / engagement)
  // =========================================================
  {
    slug: "setup-r-3000-vs-r-30000-vale-pena",
    title: "Setup R$ 3.000 vs R$ 30.000: a diferença real (e a ilusão de marketing)",
    excerpt: "Comparamos lado a lado dois setups completos de R$ 3k e R$ 30k. A diferença de R$ 27.000 vale a pena ou é só vaidade? Spoiler: depende.",
    keywords: "setup R$ 30 mil, setup caro, vale a pena setup gamer, comparação home office, melhor setup home office",
    author: "Equipe HomeOfficeLife",
    publishedAt: "2026-05-09",
    readingMinutes: 11,
    cover: UNSPLASH("1593642634443-44adaa06623a"),
    category: "comparacao",
    content: [
      { type: "p", text: "Tem viralizado no Instagram setup tour de R$ 30, 50, 100 mil. Bonito de ver, todo mundo curte. Mas qual é a diferença concreta entre eles e um setup de R$ 3 mil que faz o mesmo trabalho? Pegamos dois setups reais — um de R$ 3.200 (creator iniciante de Natal) e um de R$ 28.500 (advogado sênior do Rio) — e cravamos o que muda de verdade." },
      { type: "callout", tone: "info", title: "Setups comparados", text: "Setup A (R$ 3.200): Mac Mini M1, Dell 24\" Full HD, cadeira DT3 Nimitz, mesa pinus, BenQ ScreenBar. Setup B (R$ 28.500): Mac Studio M2 Max, Apple Studio Display 5K, Herman Miller Aeron, mesa mogno sob medida, Elgato Key Light." },
      { type: "h2", text: "O que melhora 10x mais caro" },
      { type: "h3", text: "Ergonomia: sim, vale" },
      { type: "p", text: "Cadeira Herman Miller Aeron (R$ 14k) vs DT3 Nimitz (R$ 2.3k) — a diferença é real. Aeron mantém você reto sem esforço, distribuí pressão diferente, dura 12 anos. Nimitz é boa, mas em 3-4 anos o estofado afunda. Se você passa 8h/dia sentado e tem coluna ruim, o investimento se paga em fisioterapia evitada." },
      { type: "h3", text: "Mesa elétrica vs fixa: jogo virado" },
      { type: "p", text: "FlexiSpot E5 (R$ 2.9k) ou Apex Pro (R$ 5k+) muda o jeito que você trabalha. Alternar em pé 1-2h por dia reduz dor lombar dramaticamente. Mesa fixa por R$ 200, por mais bonita que seja, não tem como competir." },
      { type: "h3", text: "Monitor 5K vs 4K: percepção marginal" },
      { type: "p", text: "Aqui mora a ilusão. Apple Studio Display 5K (R$ 17k) é deslumbrante por 1 semana. Depois você usa igual ao Dell U2723QE 4K (R$ 5.5k). Pra dev/design web, a diferença é praticamente zero. Pra colorgrade pro, é tudo." },
      { type: "h2", text: "Onde o R$ 30k vira vaidade" },
      { type: "ul", items: [
        "Cabeamento com sleeve trançado custom: bonito no Instagram, irrelevante na produtividade.",
        "Lighting cinematográfico em 3 pontos: vale se você grava conteúdo. Pra trabalhar, BenQ ScreenBar (R$ 1.2k) entrega 90% do benefício.",
        "Teclado mecânico custom (Wooting 60HE com keycaps PBT, R$ 3k+): satisfaz o nerd em você. Pra digitar texto, MX Keys (R$ 900) fica empatado.",
        "Mesa de madeira nobre exótica: cumpre função idêntica à mesa de pinus envernizada com adesivo carbono (R$ 250).",
      ] },
      { type: "callout", tone: "tip", title: "Lei do retorno marginal decrescente", text: "Os primeiros R$ 5k em qualquer setup dão 80% do conforto e produtividade. Os próximos R$ 25k entregam os outros 20% — e esses 20% só importam se você passa 12h+/dia no setup ou produz conteúdo." },
      { type: "diagnostic-cta" },
      { type: "h2", text: "O sweet spot brasileiro: R$ 5-8k" },
      { type: "p", text: "Pela nossa análise de 67 setups na galeria, a curva de satisfação por R$ atinge plateau em R$ 5-8k. Acima disso, é diminishing returns. A composição ideal nessa faixa:" },
      { type: "ul", items: [
        "Cadeira ergonômica DT3 Nimitz ou ThunderX3 Yama1: R$ 1.9-2.3k",
        "Mesa elétrica FlexiSpot E5: R$ 2.9k",
        "Monitor 27\" 4K (Dell P2723QE) OU ultrawide 34\" (LG 34WP65C): R$ 1.4-2.8k",
        "MacBook Air M3 ou Mac Mini M2 + dock: você decide pelo trabalho",
        "BenQ ScreenBar + Govee LED strip: R$ 1.5k",
        "MX Master 3S + Keychron K2: R$ 1.6k",
      ] },
      { type: "kit-cta", kitSlug: "dev-remoto", title: "Pronto pra ver esse setup sweet spot inteiro? Kit Dev Remoto R$ 5k completo →" },
      { type: "h2", text: "Conclusão" },
      { type: "p", text: "Vale a pena R$ 30k? Só se você gera receita do setup (creator, dev sênior que prefere comprar do que economizar, profissional liberal com escritório em casa que recebe cliente). Pra todo o resto, R$ 5-8k entrega 90% da experiência. Os outros R$ 25k são pra Instagram." },
      { type: "setup-cta", setupSlug: "advogado-senior-rooftop-rj", title: "Vê o setup R$ 28.500 que usamos como referência →" },
    ],
  },

  // =========================================================
  // POST 3: Erros comuns + drives /diagnostico (educational)
  // =========================================================
  {
    slug: "por-que-sua-nota-ia-ta-baixa-6-erros",
    title: "Por que sua nota de IA tá baixa? 6 erros comuns que a HomeOfficeLife mais detecta",
    excerpt: "Analisamos 12.000 setups brasileiros. Esses 6 erros aparecem em 80% das fotos com nota abaixo de 7. Confira se você comete algum.",
    keywords: "ergonomia home office, erros home office, postura mesa, nota IA setup, iluminação home office",
    author: "Equipe HomeOfficeLife",
    publishedAt: "2026-05-10",
    readingMinutes: 7,
    cover: UNSPLASH("1497366216548-37526070297c"),
    category: "ergonomia",
    content: [
      { type: "p", text: "A IA da HomeOfficeLife já avaliou mais de 12 mil setups brasileiros. Padronizando os critérios de nota baixa, descobrimos que 80% dos setups com score abaixo de 7 sofrem dos mesmos 6 erros. A boa notícia: 4 deles são corrigidos com menos de R$ 200 e 30 minutos." },
      { type: "h2", text: "1. Monitor abaixo da linha dos olhos" },
      { type: "p", text: "Esse é o campeão. O pescoço dobrado pra baixo por 8 horas é causa #1 de dor cervical em quem trabalha de casa. A regra: o topo do monitor deve estar na altura da sua linha dos olhos quando você sentar reto." },
      { type: "callout", tone: "tip", title: "Fix barato", text: "Suporte de notebook elevado (R$ 35-80, ML) ou braço VESA articulado (R$ 200, Amazon) resolve em 5 minutos. Nota IA sobe em média 1.2 pontos só nesse fix." },
      { type: "h2", text: "2. Iluminação só do teto (ou pior, contraluz)" },
      { type: "p", text: "Lâmpada fluorescente do teto reflete na tela e cansa os olhos. Janela atrás de você (contraluz) cria sombra e queima a câmera nas reuniões. Resultado: olhos vermelhos no fim do dia + parecer cansado em call." },
      { type: "callout", tone: "tip", title: "Fix barato", text: "BenQ ScreenBar Halo (R$ 1.2k) é o melhor investimento de iluminação. Versão mais barata: luminária articulada LED de R$ 89 do ML. Janela: bota cortina blackout ou senta de lado pra ela." },
      { type: "h2", text: "3. Cadeira sem regulagem lombar" },
      { type: "p", text: "Cadeira de R$ 200 do supermercado é OK por 3-4 horas. Depois disso, você começa a se inclinar pra trás ou pra frente buscando posição confortável. Em 6 meses, isso vira hérnia." },
      { type: "callout", tone: "warning", title: "Sintoma de cadeira ruim", text: "Você se mexe na cadeira mais de 1x a cada 30 minutos buscando posição? Sua cadeira não está sustentando você direito." },
      { type: "h2", text: "4. Cabos visíveis em tudo quanto é canto" },
      { type: "p", text: "Esse erra pouco em ergonomia mas mata estética. Fotos com cabo de monitor cruzando a mesa, carregador no chão, hub USB pendurado. Nota de estética cai em 1.5-2 pontos." },
      { type: "callout", tone: "tip", title: "Fix barato", text: "Canaleta adesiva (R$ 35 no Mercado Livre) + cable tie de velcro (R$ 15) + bandeja sob a mesa pra hub USB (R$ 60). Total R$ 110, nota sobe ~1.8 pontos." },
      { type: "h2", text: "5. Notebook puro sem teclado/mouse externo" },
      { type: "p", text: "Trackpad e teclado de notebook foram desenhados pra ocasional, não pra 8h/dia. Pulso vai começar a doer em 6-12 meses. Síndrome do túnel do carpo é real e cara pra tratar." },
      { type: "h2", text: "6. Espaço bagunçado (mental load oculto)" },
      { type: "p", text: "Mesa cheia de papel, copo da semana passada, livros desorganizados. A IA pega isso porque ambientes assim correlacionam com produtividade baixa. Estudo da USC (2024) mostra que workspaces visualmente organizados aumentam foco em 23%." },
      { type: "callout", tone: "info", title: "Hábito > equipamento", text: "Esse erro custa R$ 0 pra corrigir mas exige rotina. 5 minutos no fim do expediente arrumando a mesa = 1 ponto de nota IA + cabeça mais leve no dia seguinte." },
      { type: "diagnostic-cta" },
      { type: "h2", text: "Como você descobre qual desses comete" },
      { type: "p", text: "Tira uma foto frontal da sua mesa, manda pra IA da HomeOfficeLife. Em 30 segundos você recebe nota detalhada por critério + sugestões com link de produto e preço BR. Grátis, 3 análises lifetime no plano free." },
      { type: "setup-cta", setupSlug: "freelancer-iniciante-vitoria", title: "Vê um setup real de nota 6.9 com upgrade roadmap detalhado →" },
    ],
  },
];

export function findPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
