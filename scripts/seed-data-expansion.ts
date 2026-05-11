// Expansão do seed: +12 personas e +18 setups variados (idempotente).
// Reutiliza a pool de 6 fotos aprovadas como cover; cada setup tem produtos
// realistas com lojas BR e posicionamento (x,y) das anotações.

export type SeedUser = {
  email: string; password: string; username: string; display_name: string;
  bio: string; career: "dev" | "designer" | "pm" | "creator" | "remoto" | "outro";
  city: string; avatar_url: string;
};

export type SeedProduct = {
  category: string; name: string; brand: string; price_brl: number;
  store: "amazon_br" | "mercado_livre" | "kabum" | "magalu" | "pichau" | "outro";
  affiliate_url: string; x: number; y: number; position: number; rating?: number;
};

export type SeedSetup = {
  ownerEmail: string; slug: string; title: string; description: string;
  styles: string[]; career: SeedUser["career"]; budget_brl: number; city: string;
  cover_url: string; ai_score: number; products: SeedProduct[];
};

const IMG = {
  imacGeom:     "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80",
  whiteImac:    "https://images.unsplash.com/photo-1518373714866-3f1478910cc0?w=1600&q=80",
  standingDesk: "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=1600&q=80",
  dualMonitor:  "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=1600&q=80",
  woodMinimal:  "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1600&q=80",
  chairDesk:    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
};

function searchUrl(store: SeedProduct["store"], name: string): string {
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
  category: string, name: string, brand: string, price: number,
  store: SeedProduct["store"], x: number, y: number, position: number, rating = 4.6,
): SeedProduct => ({
  category, name, brand, price_brl: price, store,
  affiliate_url: searchUrl(store, name), x, y, position, rating,
});

export const EXP_USERS: SeedUser[] = [
  { email: "medica.tele@deskly.test", password: "DesklySeed!2026", username: "camila_med",
    display_name: "Dra. Camila Vieira", bio: "Médica de telemedicina. Calma, luz boa e câmera nítida são meu cartão de visita.",
    career: "outro", city: "Salvador, BA", avatar_url: "https://i.pravatar.cc/200?img=36" },
  { email: "advogado@deskly.test", password: "DesklySeed!2026", username: "henrique_adv",
    display_name: "Henrique Camargo", bio: "Advogado tributarista. Audiências online, peças longas, café preto.",
    career: "outro", city: "Brasília, DF", avatar_url: "https://i.pravatar.cc/200?img=7" },
  { email: "audio.eng@deskly.test", password: "DesklySeed!2026", username: "lucas_audio",
    display_name: "Lucas Maciel", bio: "Engenheiro de som. Mix, master e podcast — silêncio acústico é prioridade.",
    career: "creator", city: "Rio de Janeiro, RJ", avatar_url: "https://i.pravatar.cc/200?img=51" },
  { email: "fotografo@deskly.test", password: "DesklySeed!2026", username: "bruna_foto",
    display_name: "Bruna Sato", bio: "Fotógrafa editorial. Calibração de cor, dois monitores, backups eternos.",
    career: "creator", city: "São Paulo, SP", avatar_url: "https://i.pravatar.cc/200?img=24" },
  { email: "tradutor@deskly.test", password: "DesklySeed!2026", username: "marta_trad",
    display_name: "Marta Coelho", bio: "Tradutora EN/PT. Apê pequeno, mesa minimalista, dicionário aberto.",
    career: "outro", city: "Recife, PE", avatar_url: "https://i.pravatar.cc/200?img=39" },
  { email: "youtuber.tut@deskly.test", password: "DesklySeed!2026", username: "andre_yt",
    display_name: "André Borges", bio: "YouTuber de tutoriais técnicos. Câmera fixa, microfone bom, screen recorder no talo.",
    career: "creator", city: "Belo Horizonte, MG", avatar_url: "https://i.pravatar.cc/200?img=14" },
  { email: "animador@deskly.test", password: "DesklySeed!2026", username: "diego_anim",
    display_name: "Diego Pinheiro", bio: "Animador 2D. Wacom Cintiq, paleta na mão, café gelado.",
    career: "designer", city: "Florianópolis, SC", avatar_url: "https://i.pravatar.cc/200?img=18" },
  { email: "coach@deskly.test", password: "DesklySeed!2026", username: "patricia_coach",
    display_name: "Patrícia Aguiar", bio: "Coach executiva. Câmera Logitech, luz suave, fundo neutro.",
    career: "outro", city: "Curitiba, PR", avatar_url: "https://i.pravatar.cc/200?img=48" },
  { email: "modelador3d@deskly.test", password: "DesklySeed!2026", username: "rodrigo_3d",
    display_name: "Rodrigo Tanaka", bio: "Modelador 3D Blender. Workstation potente, monitor secundário vertical.",
    career: "designer", city: "Campinas, SP", avatar_url: "https://i.pravatar.cc/200?img=60" },
  { email: "editor.video@deskly.test", password: "DesklySeed!2026", username: "marina_edit",
    display_name: "Marina Pessoa", bio: "Editora de vídeo. Mac Studio, monitor 5K, projetos longos.",
    career: "creator", city: "Rio de Janeiro, RJ", avatar_url: "https://i.pravatar.cc/200?img=43" },
  { email: "nomad@deskly.test", password: "DesklySeed!2026", username: "felipe_nomad",
    display_name: "Felipe Andrade", bio: "Nômade digital. Mesa minúscula, suporte de laptop, hub USB-C salva vidas.",
    career: "dev", city: "Florianópolis, SC", avatar_url: "https://i.pravatar.cc/200?img=64" },
  { email: "ux.writer@deskly.test", password: "DesklySeed!2026", username: "ines_uxw",
    display_name: "Inês Bittencourt", bio: "UX Writer. Apenas um monitor, mas com tipografia bonita.",
    career: "designer", city: "São Paulo, SP", avatar_url: "https://i.pravatar.cc/200?img=26" },
];

export const EXP_SETUPS: SeedSetup[] = [
  {
    ownerEmail: "medica.tele@deskly.test",
    slug: "telemedicina-luz-suave-camera-4k",
    title: "Telemedicina · luz suave + câmera 4K",
    description: "Setup pra atender pacientes online. Fundo neutro, ring light de gel quente e câmera 4K pra detalhe nítido. Cadeira ergo pra 8h de plantão.",
    styles: ["minimalista", "câmera", "ergonômico"],
    career: "outro", budget_brl: 6200, city: "Salvador, BA",
    cover_url: IMG.whiteImac, ai_score: 8.8,
    products: [
      p("Câmera",      "Logitech Brio 4K",        "Logitech",  1499, "amazon_br",     50, 22, 1, 4.7),
      p("Iluminação",  "Elgato Key Light Air",    "Elgato",    1899, "amazon_br",     78, 30, 2, 4.7),
      p("Áudio",       "Microfone Blue Yeti",     "Blue",       899, "amazon_br",     38, 55, 3, 4.6),
      p("Cadeira",     "Cadeira ergonômica Flexform", "Flexform", 1899, "magalu",       30, 80, 4, 4.5),
    ],
  },
  {
    ownerEmail: "advogado@deskly.test",
    slug: "advocacia-tributaria-dois-monitores",
    title: "Advocacia tributária · dois monitores e câmera profissional",
    description: "Audiências virtuais, peças intermináveis e lista de jurisprudência aberta. Dois monitores 27\", câmera externa e estante atrás pra fundo sério.",
    styles: ["profissional", "dual-monitor", "câmera"],
    career: "outro", budget_brl: 9800, city: "Brasília, DF",
    cover_url: IMG.dualMonitor, ai_score: 8.4,
    products: [
      p("Monitor",    "Dell P2723QE 27\" 4K",     "Dell",      3499, "amazon_br",     35, 35, 1, 4.7),
      p("Câmera",     "Logitech C920s",           "Logitech",   599, "mercado_livre", 50, 22, 2, 4.6),
      p("Cadeira",    "DT3 Office Nimitz",        "DT3",       2299, "kabum",         30, 80, 3, 4.5),
      p("Periféricos", "Logitech MX Keys S",      "Logitech",   899, "amazon_br",     48, 68, 4, 4.8),
    ],
  },
  {
    ownerEmail: "audio.eng@deskly.test",
    slug: "estudio-mix-mastering-monitores-yamaha",
    title: "Estúdio de mix + master · monitores Yamaha HS",
    description: "Foco em precisão sonora. Par de Yamaha HS8 em triangulação, interface Universal Audio e tratamento acústico básico de espuma.",
    styles: ["áudio", "estúdio", "creator"],
    career: "creator", budget_brl: 14500, city: "Rio de Janeiro, RJ",
    cover_url: IMG.chairDesk, ai_score: 9.0,
    products: [
      p("Áudio",     "Par Yamaha HS8",              "Yamaha",          5800, "magalu",        50, 35, 1, 4.9),
      p("Áudio",     "Interface Universal Audio Volt 276", "Universal Audio", 2499, "amazon_br", 50, 65, 2, 4.7),
      p("Áudio",     "Fone AKG K371",               "AKG",              999, "amazon_br",     20, 50, 3, 4.7),
      p("Periféricos", "Mesa MIDI Akai MPK Mini",   "Akai",            1099, "kabum",         70, 75, 4, 4.6),
    ],
  },
  {
    ownerEmail: "fotografo@deskly.test",
    slug: "foto-editorial-calibragem-eizo",
    title: "Foto editorial · monitor Eizo calibrado + Mac Studio",
    description: "Trabalho com clientes editoriais e moda. Eizo ColorEdge calibrado mensalmente, Mac Studio M2 Max, backup em RAID.",
    styles: ["criativo", "color-grading", "Mac"],
    career: "creator", budget_brl: 32000, city: "São Paulo, SP",
    cover_url: IMG.imacGeom, ai_score: 9.4,
    products: [
      p("Monitor",   "Eizo ColorEdge CG2700S",  "Eizo",   19999, "outro",         50, 30, 1, 4.9),
      p("Notebook",  "Mac Studio M2 Max",       "Apple",  21999, "magalu",        50, 75, 2, 4.9),
      p("Periféricos", "Calibrador X-Rite i1",  "X-Rite",  2299, "amazon_br",     78, 45, 3, 4.7),
      p("Mesa",      "Mesa fixa MDF carvalho",  "Custom",   899, "mercado_livre", 30, 85, 4, 4.4),
    ],
  },
  {
    ownerEmail: "tradutor@deskly.test",
    slug: "tradutora-apartamento-pequeno-2-monitores",
    title: "Tradutora freelance · 2 monitores leves em apê 40m²",
    description: "Dois monitores compactos lado a lado (texto original + tradução), suporte VESA pra liberar mesa e cadeira simples mas ajustável.",
    styles: ["apê pequeno", "dual-monitor", "minimalista"],
    career: "outro", budget_brl: 3200, city: "Recife, PE",
    cover_url: IMG.woodMinimal, ai_score: 8.2,
    products: [
      p("Monitor",   "Par AOC 24\" 24B1H",       "AOC",     1798, "kabum",         38, 35, 1, 4.5),
      p("Suporte",   "Suporte VESA duplo ELG",   "ELG",      299, "mercado_livre", 50, 22, 2, 4.5),
      p("Cadeira",   "Cadeira BR Office Bahamas", "BR Office", 699, "magalu",       30, 80, 3, 4.3),
      p("Mesa",      "Mesa MDF 1m20 c/ gaveta",  "Casa Móveis", 489, "magalu",     50, 88, 4, 4.4),
    ],
  },
  {
    ownerEmail: "youtuber.tut@deskly.test",
    slug: "youtuber-tutorial-prompter-foco-1pessoa",
    title: "YouTuber tutorial · teleprompter, foco em uma pessoa",
    description: "Câmera Sony alpha em tripé, teleprompter pra falar olhando reto, microfone direcional. Setup pra gravar 20 min de tutorial em um take.",
    styles: ["creator", "câmera", "produção"],
    career: "creator", budget_brl: 11800, city: "Belo Horizonte, MG",
    cover_url: IMG.standingDesk, ai_score: 8.6,
    products: [
      p("Câmera",     "Sony ZV-E10 + lente kit",   "Sony",      6499, "amazon_br",     50, 28, 1, 4.8),
      p("Áudio",      "Rode Wireless GO II",        "Rode",      2799, "amazon_br",     65, 55, 2, 4.8),
      p("Iluminação", "Greika ring light 18\" + softbox", "Greika", 599, "amazon_br",  30, 25, 3, 4.4),
      p("Periféricos", "Teleprompter Neewer",       "Neewer",     799, "mercado_livre", 50, 50, 4, 4.3),
    ],
  },
  {
    ownerEmail: "animador@deskly.test",
    slug: "animador-2d-cintiq-16-paleta-de-cores",
    title: "Animador 2D · Wacom Cintiq 16 + paleta de cores",
    description: "Cintiq 16 ligado à workstation principal, paleta Tourbox pra atalhos rápidos, fundo escuro pra reduzir reflexo no display.",
    styles: ["criativo", "ilustração", "designer"],
    career: "designer", budget_brl: 13900, city: "Florianópolis, SC",
    cover_url: IMG.chairDesk, ai_score: 9.1,
    products: [
      p("Periféricos", "Wacom Cintiq 16",          "Wacom",    7499, "amazon_br",     50, 50, 1, 4.7),
      p("Periféricos", "TourBox Neo",              "TourBox",  1399, "amazon_br",     78, 60, 2, 4.6),
      p("Monitor",     "BenQ PD2700U 27\" 4K",     "BenQ",     3299, "kabum",         30, 30, 3, 4.7),
      p("Iluminação",  "BenQ ScreenBar Halo",      "BenQ",      999, "amazon_br",     50, 18, 4, 4.8),
    ],
  },
  {
    ownerEmail: "coach@deskly.test",
    slug: "coach-executiva-fundo-de-filme-luz-quente",
    title: "Coach executiva · fundo de filme e luz quente",
    description: "Câmera DSLR como webcam, key light + fill light pra rosto sem sombra dura. Fundo de estante curada com livros e plantas.",
    styles: ["câmera", "decoração", "produtivo"],
    career: "outro", budget_brl: 8400, city: "Curitiba, PR",
    cover_url: IMG.imacGeom, ai_score: 8.9,
    products: [
      p("Câmera",     "Canon EOS M50 + Cam Link",  "Canon",      4799, "amazon_br",     50, 25, 1, 4.7),
      p("Iluminação", "Aputure AL-MX duplo + softbox", "Aputure", 2199, "amazon_br",   78, 30, 2, 4.7),
      p("Decoração",  "Plantas variadas (5un) + cachepôs", "Plantei", 549, "mercado_livre", 18, 50, 3, 4.5),
      p("Periféricos", "Stream Deck Mini",          "Elgato",      699, "amazon_br",   30, 75, 4, 4.7),
    ],
  },
  {
    ownerEmail: "modelador3d@deskly.test",
    slug: "modelador-3d-blender-workstation-vertical",
    title: "Modelador 3D Blender · workstation + monitor vertical",
    description: "PC com RTX 4080 pra render Cycles, monitor principal 32\" + secundário em pé pra outliner e ref. Mouse 3DConnexion.",
    styles: ["pro", "dual-monitor", "render"],
    career: "designer", budget_brl: 18900, city: "Campinas, SP",
    cover_url: IMG.dualMonitor, ai_score: 9.2,
    products: [
      p("Monitor",     "LG 32UN880 32\" 4K",        "LG",         4299, "kabum",     35, 32, 1, 4.7),
      p("Monitor",     "Dell U2419H rotacionado",   "Dell",       1999, "amazon_br", 70, 35, 2, 4.6),
      p("Periféricos", "3DConnexion SpaceMouse",    "3DConnexion", 2299, "amazon_br", 60, 70, 3, 4.7),
      p("Cadeira",     "ThunderX3 Yama1 ergo",      "ThunderX3",  1899, "kabum",     30, 80, 4, 4.5),
    ],
  },
  {
    ownerEmail: "editor.video@deskly.test",
    slug: "editor-video-mac-studio-monitor-5k",
    title: "Editora de vídeo · Mac Studio + Studio Display",
    description: "Mac Studio M2 + Studio Display 5K, mesa de cortes Loupedeck CT, fones de monitoração HD25. Edita projetos longos no Premiere.",
    styles: ["Mac", "creator", "color-grading"],
    career: "creator", budget_brl: 28500, city: "Rio de Janeiro, RJ",
    cover_url: IMG.whiteImac, ai_score: 9.3,
    products: [
      p("Notebook",    "Mac Studio M2",             "Apple",   17999, "magalu",        50, 70, 1, 4.9),
      p("Monitor",     "Apple Studio Display",      "Apple",    8999, "magalu",        50, 35, 2, 4.8),
      p("Periféricos", "Loupedeck CT",              "Loupedeck", 4299, "amazon_br",     70, 75, 3, 4.7),
      p("Áudio",       "Sennheiser HD 25",          "Sennheiser", 1099, "amazon_br",    20, 55, 4, 4.8),
    ],
  },
  {
    ownerEmail: "nomad@deskly.test",
    slug: "digital-nomad-airbnb-kit-portatil",
    title: "Nômade digital · kit portátil que cabe na mochila",
    description: "Monta a estação em qualquer Airbnb. MacBook Air, suporte dobrável, teclado/mouse leves e hub USB-C com HDMI pra TV virar segundo monitor.",
    styles: ["portátil", "viagem", "minimalista"],
    career: "dev", budget_brl: 2400, city: "Florianópolis, SC",
    cover_url: IMG.woodMinimal, ai_score: 8.0,
    products: [
      p("Notebook",    "Suporte dobrável Roost ou similar", "Multilaser", 199, "mercado_livre", 50, 45, 1, 4.4),
      p("Periféricos", "Teclado Logitech MX Keys Mini",     "Logitech",   899, "amazon_br",     45, 70, 2, 4.7),
      p("Periféricos", "Mouse Logitech MX Anywhere 3",      "Logitech",   599, "amazon_br",     65, 70, 3, 4.7),
      p("Periféricos", "Hub USB-C 7-em-1",                  "Baseus",     249, "mercado_livre", 80, 50, 4, 4.5),
    ],
  },
  {
    ownerEmail: "ux.writer@deskly.test",
    slug: "ux-writer-um-monitor-tipografia",
    title: "UX Writer · um monitor, tipografia bonita",
    description: "Setup minimalista: monitor único 27\" 4K, teclado mecânico de baixo perfil, Figma + Notion abertos.",
    styles: ["minimalista", "designer", "MacBook"],
    career: "designer", budget_brl: 7800, city: "São Paulo, SP",
    cover_url: IMG.whiteImac, ai_score: 8.7,
    products: [
      p("Monitor",     "LG 27UP850N 27\" 4K",       "LG",        3299, "kabum",         50, 35, 1, 4.7),
      p("Periféricos", "Keychron K3 Pro Low-profile", "Keychron", 1199, "amazon_br",    48, 68, 2, 4.7),
      p("Notebook",    "MacBook Air M3 13\"",       "Apple",    11999, "magalu",        30, 80, 3, 4.9),
      p("Iluminação",  "BenQ ScreenBar Lite",       "BenQ",       499, "amazon_br",     50, 18, 4, 4.7),
    ],
  },
  // Setups extras com personas já existentes do seed-data original
  {
    ownerEmail: "dev@deskly.test",
    slug: "dev-mobile-react-native-ipad-secundario",
    title: "Dev mobile · iPad como tela secundária pra preview",
    description: "MacBook Pro + iPad Pro em Sidecar pra ver app rodando ao lado do código. Suporte de iPad articulado, fone Sony XM4 cortando barulho do prédio.",
    styles: ["mobile", "dev", "Mac"],
    career: "dev", budget_brl: 22000, city: "Rio de Janeiro, RJ",
    cover_url: IMG.standingDesk, ai_score: 9.0,
    products: [
      p("Notebook",    "MacBook Pro 14\" M3",       "Apple",  18999, "magalu",        45, 60, 1, 4.9),
      p("Notebook",    "iPad Pro 11\" M4",          "Apple",   9999, "magalu",        70, 50, 2, 4.8),
      p("Áudio",       "Sony WH-1000XM5",           "Sony",    2799, "amazon_br",     20, 55, 3, 4.8),
      p("Periféricos", "Magic Mouse 2",             "Apple",    679, "amazon_br",     60, 75, 4, 4.5),
    ],
  },
  {
    ownerEmail: "datasci@deskly.test",
    slug: "data-scientist-3-monitores-jupyter",
    title: "Data scientist · 3 monitores pra Jupyter + dashboard + Slack",
    description: "Setup com 3 telas: notebook (workhorse), dashboard de métricas e Slack. Cadeira Herman Miller pra 10h por dia.",
    styles: ["3-monitores", "dev", "ergonômico"],
    career: "dev", budget_brl: 24000, city: "Campinas, SP",
    cover_url: IMG.dualMonitor, ai_score: 9.2,
    products: [
      p("Monitor",   "Trio Dell U2723QE 27\" 4K",  "Dell",   12899, "amazon_br",     50, 30, 1, 4.8),
      p("Cadeira",   "Herman Miller Sayl BR",      "Herman Miller", 5499, "outro", 30, 80, 2, 4.8),
      p("Periféricos", "Logitech MX Master 3S",   "Logitech",   749, "amazon_br",     65, 72, 3, 4.9),
      p("Notebook",  "ThinkPad X1 Carbon Gen 11",  "Lenovo",   14999, "magalu",      45, 60, 4, 4.7),
    ],
  },
  {
    ownerEmail: "streamer@deskly.test",
    slug: "streamer-acustica-painel-difusores",
    title: "Streamer · painéis acústicos e difusores na parede",
    description: "Cuidado com áudio: painéis acústicos atrás, difusores nas laterais. Mic Shure MV7 USB, captura de tela com cam externa.",
    styles: ["áudio", "creator", "streaming"],
    career: "creator", budget_brl: 9800, city: "Brasília, DF",
    cover_url: IMG.chairDesk, ai_score: 8.9,
    products: [
      p("Áudio",       "Shure MV7 USB",             "Shure",      2599, "amazon_br",     38, 55, 1, 4.8),
      p("Câmera",      "Sony ZV-1",                 "Sony",       4999, "amazon_br",     50, 25, 2, 4.7),
      p("Decoração",   "Painéis acústicos espuma 12un", "Audico", 349, "mercado_livre", 18, 35, 3, 4.4),
      p("Periféricos", "Elgato Stream Deck XL",     "Elgato",     2299, "amazon_br",     65, 75, 4, 4.7),
    ],
  },
  {
    ownerEmail: "pm@deskly.test",
    slug: "pm-quadro-canvas-fisico-camera-boa",
    title: "PM · quadro Kanban físico atrás + câmera Logitech Brio",
    description: "Quadro magnético com post-its de épicos atrás (ótimo pra calls), câmera Brio em ângulo alto, mic boom flutuante.",
    styles: ["produtivo", "pm", "câmera"],
    career: "pm", budget_brl: 6900, city: "Recife, PE",
    cover_url: IMG.imacGeom, ai_score: 8.7,
    products: [
      p("Câmera",     "Logitech Brio 4K",          "Logitech",   1499, "amazon_br",     50, 22, 1, 4.7),
      p("Áudio",      "Microfone Maono PD400X",    "Maono",       999, "amazon_br",     38, 55, 2, 4.6),
      p("Iluminação", "Elgato Key Light Air",      "Elgato",     1899, "amazon_br",     78, 30, 3, 4.7),
      p("Decoração",  "Quadro magnético 90x60 + ímãs", "Acrimet", 289, "magalu",       18, 35, 4, 4.5),
    ],
  },
  {
    ownerEmail: "empreendedor@deskly.test",
    slug: "founder-mesa-pe-luz-natural",
    title: "Founder · mesa que sobe/desce + luz natural",
    description: "Standing desk pra varia postura no dia, janela ampla atrás, monitor curvo pra reuniões longas, sem bagunça pra parecer profissional em pitch.",
    styles: ["standing", "minimalista", "produtivo"],
    career: "outro", budget_brl: 8900, city: "Florianópolis, SC",
    cover_url: IMG.standingDesk, ai_score: 9.0,
    products: [
      p("Mesa",       "Mesa elétrica IRONFLEX 140cm", "IronFlex",  2599, "mercado_livre", 50, 85, 1, 4.6),
      p("Monitor",    "Samsung Odyssey G5 32\" curvo", "Samsung",  2799, "kabum",        50, 32, 2, 4.7),
      p("Cadeira",    "DT3 Office Tronos",         "DT3",        2799, "kabum",         30, 78, 3, 4.6),
      p("Periféricos", "Logitech MX Keys + MX Master 3S kit", "Logitech", 1599, "amazon_br", 50, 70, 4, 4.8),
    ],
  },
  {
    ownerEmail: "consultor@deskly.test",
    slug: "consultor-mc-call-cenario-curado",
    title: "Consultor de gestão · cenário curado pra calls VIP",
    description: "Estante de design atrás, livros selecionados, planta artificial, mesa carvalho. Câmera DSLR + key light suave.",
    styles: ["profissional", "câmera", "decoração"],
    career: "pm", budget_brl: 7200, city: "São Paulo, SP",
    cover_url: IMG.imacGeom, ai_score: 8.8,
    products: [
      p("Câmera",     "Canon M50 + Cam Link",      "Canon",     4799, "amazon_br",     50, 25, 1, 4.7),
      p("Iluminação", "Elgato Key Light Air par",  "Elgato",    3499, "amazon_br",     78, 30, 2, 4.7),
      p("Decoração",  "Curadoria livros + planta artificial", "Diversos", 449, "magalu", 18, 50, 3, 4.4),
      p("Periféricos", "Mouse pad couro 90x40",    "Custom",     199, "mercado_livre", 50, 75, 4, 4.6),
    ],
  },
];
