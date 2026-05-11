// Gera 50 setups variados na galeria, usando 50 fotos workspace verificadas
// do Unsplash (HEAD-check OK). Idempotente: pula slugs que já existirem.

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

const PHOTOS = [
  "photo-1587831990711-23ca6441447b","photo-1619597455322-4fbbd820250a","photo-1614624533048-a9c2f9cb5a96",
  "photo-1575318634028-6a0cfcb60c59","photo-1590212151175-e58edd96185b","photo-1517518295033-d5ab8ca078cc",
  "photo-1510519138101-570d1dca3d66","photo-1570485071395-29b575ea3b4e","photo-1616440347437-b1c73416efc2",
  "photo-1594636797501-ef436e157819","photo-1616763355548-1b606f439f86","photo-1659958661414-59d7bd483853",
  "photo-1575318633968-0383e7d07ca0","photo-1542315192-1f61a1792f33","photo-1481887328591-3e277f9473dc",
  "photo-1575089976121-8ed7b2a54265","photo-1549692520-acc6669e2f0c","photo-1536148935331-408321065b18",
  "photo-1573495627361-d9b87960b12d","photo-1542744094-3a31f272c490","photo-1580894894513-541e068a3e2b",
  "photo-1604145559206-e3bce0040e2d","photo-1674483699209-25fb6d962119","photo-1623281185000-6940e5347d2e",
  "photo-1615516042934-3324d4c9f928","photo-1624313976965-6410317af475","photo-1753715613382-dc3e8456dbc9",
  "photo-1618254170428-e130099265cc","photo-1624313976899-0fd4989a2fcd","photo-1618254170747-35f7ba2f9a6e",
  "photo-1632603093711-0d93a0bcc6cc","photo-1608682285597-156feb50eb4e","photo-1745910020846-3d4d0088d24d",
  "photo-1598795737928-5918df4205fb","photo-1610641563856-4ec0223d7084","photo-1711816769781-0a8194f44399",
  "photo-1633598046046-1402787c97fc","photo-1632955453423-3369aef721da","photo-1632955422535-8ba21c5b8744",
  "photo-1634711941987-8dbeed545cc5","photo-1634083745114-f8574350c89f","photo-1633594933279-56dec38e9a0c",
  "photo-1633594933256-2ad9fc799f36","photo-1633194486274-8953df0d4064","photo-1634711973511-7571b469428a",
  "photo-1632955403644-006964edf9a5","photo-1681912817694-355072026d80","photo-1681912818658-57e5438fcd3e",
  "photo-1681912819202-3a94a9115bc9","photo-1681912818492-35c55f33fb25",
];

function img(id: string): string {
  return `https://images.unsplash.com/${id}?w=1600&q=80`;
}

type Career = "dev" | "designer" | "pm" | "creator" | "remoto" | "outro";
type Store = "amazon_br" | "mercado_livre" | "kabum" | "magalu" | "pichau" | "outro";

type Product = { category: string; name: string; brand: string; price_brl: number; store: Store; x: number; y: number; position: number; rating: number };

type Setup = {
  ownerEmail: string;
  photoIdx: number;
  slug: string; title: string; description: string;
  styles: string[]; career: Career; budget_brl: number; city: string;
  ai_score: number;
  products: Product[];
};

function p(category: string, name: string, brand: string, price_brl: number, store: Store, x: number, y: number, pos: number, rating = 4.6): Product {
  return { category, name, brand, price_brl, store, x, y, position: pos, rating };
}

const SETUPS: Setup[] = [
  { ownerEmail: "dev@deskly.test", photoIdx: 0, slug: "minimal-wood-dev-01", title: "Mesa de madeira, dual monitor dev", description: "Setup limpo em madeira maciça, dois monitores 27\" e teclado mecânico de baixo perfil.", styles: ["minimalista","dev","madeira"], career: "dev", budget_brl: 8400, city: "São Paulo, SP", ai_score: 8.9, products: [p("Monitor","LG 27UN850","LG",2299,"kabum",40,30,1),p("Periféricos","Keychron K3","Keychron",799,"amazon_br",50,72,2),p("Cadeira","DT3 Yama1","DT3",1899,"kabum",30,82,3)] },
  { ownerEmail: "designer@deskly.test", photoIdx: 1, slug: "designer-clean-white-02", title: "Designer minimal branco", description: "Mesa branca, iMac M3, organização perfeita. Plantas pra cortar.", styles: ["minimalista","Mac","designer"], career: "designer", budget_brl: 18000, city: "Florianópolis, SC", ai_score: 9.3, products: [p("Notebook","iMac 24\" M3","Apple",16999,"magalu",50,40,1),p("Periféricos","Magic Mouse","Apple",699,"amazon_br",60,72,2)] },
  { ownerEmail: "creator@deskly.test", photoIdx: 2, slug: "creator-rgb-streamer-03", title: "Streamer com RGB e mic shotgun", description: "Setup gamer/streamer com RGB sincronizado, mic Shure SM7B e câmera 4K.", styles: ["creator","gamer","rgb"], career: "creator", budget_brl: 14500, city: "São Paulo, SP", ai_score: 8.8, products: [p("Áudio","Shure SM7B","Shure",4299,"amazon_br",40,60,1),p("Câmera","Sony ZV-1","Sony",4999,"amazon_br",50,25,2),p("Periféricos","Logitech G Pro X","Logitech",1599,"kabum",55,70,3)] },
  { ownerEmail: "estudante@deskly.test", photoIdx: 3, slug: "estudante-laptop-foco-04", title: "Estudante: laptop + suporte + iluminação", description: "Setup compacto e funcional pra concentração. ThinkPad + segundo monitor.", styles: ["apê pequeno","barato","estudante"], career: "outro", budget_brl: 4200, city: "Belo Horizonte, MG", ai_score: 8.0, products: [p("Notebook","Lenovo ThinkPad E14","Lenovo",4499,"magalu",50,45,1),p("Iluminação","Luminária BenQ ScreenBar","BenQ",499,"amazon_br",50,20,2)] },
  { ownerEmail: "arquiteto@deskly.test", photoIdx: 4, slug: "arquiteto-vertical-cintiq-05", title: "Arquiteto com Cintiq e monitor vertical", description: "Workstation pesada pra AutoCAD + Procreate. Wacom Cintiq + Eizo calibrado.", styles: ["pro","designer","render"], career: "designer", budget_brl: 28000, city: "Curitiba, PR", ai_score: 9.2, products: [p("Periféricos","Wacom Cintiq 16","Wacom",7499,"amazon_br",55,55,1),p("Monitor","Eizo CG2700S","Eizo",18999,"outro",30,30,2)] },
  { ownerEmail: "executivo@deskly.test", photoIdx: 5, slug: "executivo-classico-mogno-06", title: "Executivo em mogno e couro", description: "Estética corporativa: mesa de mogno, cadeira de couro, abajur metálico e luz quente. Pra reuniões importantes.", styles: ["profissional","clássico"], career: "outro", budget_brl: 13000, city: "São Paulo, SP", ai_score: 8.6, products: [p("Cadeira","Herman Miller Sayl","Herman Miller",5499,"outro",30,80,1),p("Mesa","Mesa mogno maciço","Custom",4500,"outro",50,90,2)] },
  { ownerEmail: "pm@deskly.test", photoIdx: 6, slug: "pm-camera-zoom-07", title: "PM com câmera Logitech Brio e luz suave", description: "Reuniões o dia todo. Câmera 4K, key light, mic boom.", styles: ["produtivo","câmera","pm"], career: "pm", budget_brl: 6800, city: "Recife, PE", ai_score: 8.7, products: [p("Câmera","Logitech Brio 4K","Logitech",1499,"amazon_br",50,22,1),p("Áudio","Maono PD400X","Maono",999,"amazon_br",38,55,2)] },
  { ownerEmail: "casal@deskly.test", photoIdx: 7, slug: "casal-duplo-home-08", title: "Setup duplo: casal home office", description: "Espaço pra dois trabalharem juntos. Mesa longa, dois monitores cada lado, organização vertical.", styles: ["duplo","casal","produtivo"], career: "remoto", budget_brl: 12500, city: "Porto Alegre, RS", ai_score: 8.5, products: [p("Mesa","Mesa industrial 1,80m","Móveis BR",1299,"magalu",50,90,1),p("Monitor","Par Dell U2723QE","Dell",8598,"amazon_br",50,32,2)] },
  { ownerEmail: "psi@deskly.test", photoIdx: 8, slug: "psi-acolhedor-natural-09", title: "Psicóloga online: luz natural + acolhimento", description: "Atendimento online em ambiente acolhedor. Mic profissional, fundo neutro com plantas.", styles: ["acolhedor","plantas"], career: "outro", budget_brl: 5400, city: "Niterói, RJ", ai_score: 8.9, products: [p("Áudio","Blue Yeti X","Blue",1599,"amazon_br",40,55,1),p("Decoração","Costela de Adão grande","Plantei",180,"mercado_livre",18,55,2)] },
  { ownerEmail: "trader@deskly.test", photoIdx: 9, slug: "trader-4-telas-10", title: "Trader: 4 monitores curvos sincronizados", description: "Day trading: 4 monitores em Z-mount, gráficos, news, ordens, Slack. Cadeira ergo pra 10h diárias.", styles: ["pro","trader","multi-monitor"], career: "outro", budget_brl: 26500, city: "São Paulo, SP", ai_score: 9.1, products: [p("Monitor","4x Samsung Odyssey G5 32\"","Samsung",11196,"kabum",50,30,1),p("Cadeira","Herman Miller Aeron","Herman Miller",12999,"outro",30,80,2)] },
  { ownerEmail: "empreendedor@deskly.test", photoIdx: 10, slug: "founder-mesa-pe-clean-11", title: "Founder: standing desk minimalista", description: "Mesa elétrica que sobe/desce, monitor curvo, sem bagunça pra pitch decks.", styles: ["standing","minimalista"], career: "outro", budget_brl: 9800, city: "Florianópolis, SC", ai_score: 9.0, products: [p("Mesa","Mesa elétrica FlexiSpot","FlexiSpot",2899,"amazon_br",50,90,1),p("Monitor","Samsung Odyssey G7","Samsung",3299,"kabum",50,32,2)] },
  { ownerEmail: "professor@deskly.test", photoIdx: 11, slug: "professora-lousa-camera-12", title: "Professora online: câmera + lousa digital", description: "Aulas online com câmera Logitech, lousa digital atrás e ring light frontal.", styles: ["câmera","educação"], career: "outro", budget_brl: 5900, city: "Belo Horizonte, MG", ai_score: 8.5, products: [p("Câmera","Logitech C922 Pro","Logitech",899,"amazon_br",50,22,1),p("Iluminação","Greika Ring Light 18\"","Greika",449,"amazon_br",78,30,2)] },
  { ownerEmail: "consultor@deskly.test", photoIdx: 12, slug: "consultor-elegante-livros-13", title: "Consultor: estante atrás + iluminação cinematográfica", description: "Fundo curado de livros, key+fill light, câmera DSLR como webcam.", styles: ["profissional","câmera"], career: "pm", budget_brl: 8400, city: "São Paulo, SP", ai_score: 8.8, products: [p("Câmera","Canon M50 + Cam Link","Canon",4799,"amazon_br",50,25,1),p("Iluminação","Aputure AL-MX par","Aputure",2199,"amazon_br",78,30,2)] },
  { ownerEmail: "streamer@deskly.test", photoIdx: 13, slug: "streamer-rgb-completo-14", title: "Streamer FPS RGB total", description: "Triple monitor, RGB sincronizado, mic Shure, capture card, painéis acústicos.", styles: ["gamer","rgb","creator"], career: "creator", budget_brl: 21000, city: "Brasília, DF", ai_score: 9.2, products: [p("Monitor","Triplo AOC AGON 24\" 240Hz","AOC",6300,"kabum",50,32,1),p("Áudio","Shure SM7B","Shure",4299,"amazon_br",40,60,2)] },
  { ownerEmail: "datasci@deskly.test", photoIdx: 14, slug: "data-thinkpad-monitor-4k-15", title: "Data scientist: ThinkPad + monitor 4K", description: "ThinkPad X1 conectado a monitor 32\" 4K, multi-window Jupyter + Slack.", styles: ["dev","produtivo"], career: "dev", budget_brl: 17500, city: "Campinas, SP", ai_score: 9.0, products: [p("Notebook","ThinkPad X1 Carbon Gen 11","Lenovo",14999,"magalu",50,45,1),p("Monitor","Dell U3223QE 32\" 4K","Dell",5999,"amazon_br",50,32,2)] },
  { ownerEmail: "medica.tele@deskly.test", photoIdx: 15, slug: "telemedicina-luz-suave-16", title: "Telemedicina: luz suave e câmera nítida", description: "Atendimento online em ambiente neutro. Key light de gel quente, câmera 4K.", styles: ["minimalista","câmera"], career: "outro", budget_brl: 6200, city: "Salvador, BA", ai_score: 8.8, products: [p("Câmera","Logitech Brio 4K","Logitech",1499,"amazon_br",50,22,1),p("Iluminação","Elgato Key Light Air","Elgato",1899,"amazon_br",78,30,2)] },
  { ownerEmail: "advogado@deskly.test", photoIdx: 16, slug: "advogado-dual-monitor-17", title: "Advogado tributarista: dois monitores 4K", description: "Audiências online, peças longas, jurisprudência em outra tela.", styles: ["profissional","dual-monitor"], career: "outro", budget_brl: 9800, city: "Brasília, DF", ai_score: 8.4, products: [p("Monitor","Dell P2723QE 27\" 4K","Dell",3499,"amazon_br",40,32,1),p("Cadeira","DT3 Office Nimitz","DT3",2299,"kabum",30,80,2)] },
  { ownerEmail: "audio.eng@deskly.test", photoIdx: 17, slug: "audio-eng-yamaha-hs-18", title: "Engenheiro de áudio: Yamaha HS8 + tratamento", description: "Triangulação Yamaha HS8, interface Universal Audio, painéis acústicos.", styles: ["áudio","estúdio"], career: "creator", budget_brl: 14500, city: "Rio de Janeiro, RJ", ai_score: 9.0, products: [p("Áudio","Par Yamaha HS8","Yamaha",5800,"magalu",50,35,1),p("Áudio","UA Volt 276","Universal Audio",2499,"amazon_br",50,65,2)] },
  { ownerEmail: "fotografo@deskly.test", photoIdx: 18, slug: "foto-eizo-mac-studio-19", title: "Fotógrafa editorial: Mac Studio + Eizo", description: "Mac Studio M2 Max + Eizo ColorEdge calibrado mensalmente. Backups RAID.", styles: ["Mac","color-grading","creator"], career: "creator", budget_brl: 38000, city: "São Paulo, SP", ai_score: 9.4, products: [p("Monitor","Eizo ColorEdge CG2700S","Eizo",19999,"outro",50,30,1),p("Notebook","Mac Studio M2 Max","Apple",21999,"magalu",50,75,2)] },
  { ownerEmail: "tradutor@deskly.test", photoIdx: 19, slug: "tradutora-2-monitores-pequeno-20", title: "Tradutora: 2 monitores em apê 40m²", description: "Mesa compacta, suporte VESA duplo, cadeira simples ajustável.", styles: ["apê pequeno","dual-monitor"], career: "outro", budget_brl: 3200, city: "Recife, PE", ai_score: 8.2, products: [p("Monitor","Par AOC 24B1H","AOC",1798,"kabum",40,32,1),p("Suporte","VESA duplo ELG","ELG",299,"mercado_livre",50,22,2)] },
  { ownerEmail: "youtuber.tut@deskly.test", photoIdx: 20, slug: "youtuber-prompter-21", title: "YouTuber tutorial com teleprompter", description: "Câmera Sony, teleprompter, mic Rode Wireless, ring light.", styles: ["creator","câmera"], career: "creator", budget_brl: 11800, city: "Belo Horizonte, MG", ai_score: 8.6, products: [p("Câmera","Sony ZV-E10 + kit","Sony",6499,"amazon_br",50,28,1),p("Áudio","Rode Wireless GO II","Rode",2799,"amazon_br",65,55,2)] },
  { ownerEmail: "animador@deskly.test", photoIdx: 21, slug: "animador-cintiq-paleta-22", title: "Animador 2D: Cintiq 16 + TourBox", description: "Cintiq como display principal, TourBox pra atalhos, fundo escuro.", styles: ["criativo","ilustração"], career: "designer", budget_brl: 13900, city: "Florianópolis, SC", ai_score: 9.1, products: [p("Periféricos","Wacom Cintiq 16","Wacom",7499,"amazon_br",50,50,1),p("Periféricos","TourBox Neo","TourBox",1399,"amazon_br",78,60,2)] },
  { ownerEmail: "coach@deskly.test", photoIdx: 22, slug: "coach-fundo-livraria-23", title: "Coach executiva: fundo de livraria curado", description: "Estante de livros como cenário, luz cinematográfica, Stream Deck pro fluxo.", styles: ["câmera","decoração"], career: "outro", budget_brl: 8900, city: "Curitiba, PR", ai_score: 8.9, products: [p("Câmera","Canon M50 + Cam Link","Canon",4799,"amazon_br",50,25,1),p("Periféricos","Elgato Stream Deck Mini","Elgato",699,"amazon_br",30,75,2)] },
  { ownerEmail: "modelador3d@deskly.test", photoIdx: 23, slug: "3d-blender-vertical-24", title: "Modelador 3D Blender + workstation potente", description: "RTX 4080 pra render, 32\" 4K principal + secundário vertical, SpaceMouse.", styles: ["pro","render","dev"], career: "designer", budget_brl: 18900, city: "Campinas, SP", ai_score: 9.2, products: [p("Monitor","LG 32UN880","LG",4299,"kabum",40,32,1),p("Periféricos","3DConnexion SpaceMouse","3DConnexion",2299,"amazon_br",60,70,2)] },
  { ownerEmail: "editor.video@deskly.test", photoIdx: 24, slug: "editor-mac-studio-25", title: "Editora vídeo: Mac Studio + Studio Display", description: "Premiere o dia todo. Mac Studio M2, Studio Display 5K, Loupedeck CT.", styles: ["Mac","creator"], career: "creator", budget_brl: 28500, city: "Rio de Janeiro, RJ", ai_score: 9.3, products: [p("Notebook","Mac Studio M2","Apple",17999,"magalu",50,72,1),p("Monitor","Apple Studio Display","Apple",8999,"magalu",50,32,2)] },
  { ownerEmail: "nomad@deskly.test", photoIdx: 25, slug: "nomad-portatil-airbnb-26", title: "Nômade digital: kit Airbnb-friendly", description: "Tudo cabe na mochila. Suporte dobrável, teclado/mouse leves, hub USB-C.", styles: ["portátil","viagem"], career: "dev", budget_brl: 2400, city: "Florianópolis, SC", ai_score: 8.0, products: [p("Notebook","Suporte Roost","Multilaser",199,"mercado_livre",50,45,1),p("Periféricos","Logitech MX Keys Mini","Logitech",899,"amazon_br",45,70,2)] },
  { ownerEmail: "ux.writer@deskly.test", photoIdx: 26, slug: "ux-writer-tipografia-27", title: "UX Writer: um monitor, tipografia bonita", description: "Monitor único 27\" 4K, Keychron low-profile, Figma + Notion.", styles: ["minimalista","designer"], career: "designer", budget_brl: 7800, city: "São Paulo, SP", ai_score: 8.7, products: [p("Monitor","LG 27UP850N","LG",3299,"kabum",50,32,1),p("Periféricos","Keychron K3 Pro","Keychron",1199,"amazon_br",50,72,2)] },
  { ownerEmail: "dev@deskly.test", photoIdx: 27, slug: "dev-mobile-ipad-sidecar-28", title: "Dev mobile: iPad como tela secundária", description: "MacBook Pro + iPad em Sidecar pra app preview ao lado do código.", styles: ["mobile","Mac","dev"], career: "dev", budget_brl: 22000, city: "Rio de Janeiro, RJ", ai_score: 9.0, products: [p("Notebook","MacBook Pro 14\" M3","Apple",18999,"magalu",45,55,1),p("Notebook","iPad Pro 11\" M4","Apple",9999,"magalu",70,50,2)] },
  { ownerEmail: "datasci@deskly.test", photoIdx: 28, slug: "data-3-monitores-jupyter-29", title: "Data scientist: 3 monitores Jupyter + dashboard", description: "Notebook, dashboards e Slack em telas separadas. Herman Miller pra 10h.", styles: ["3-monitores","dev","ergonômico"], career: "dev", budget_brl: 24000, city: "Campinas, SP", ai_score: 9.2, products: [p("Monitor","Trio Dell U2723QE","Dell",12897,"amazon_br",50,32,1),p("Cadeira","Herman Miller Sayl","Herman Miller",5499,"outro",30,80,2)] },
  { ownerEmail: "streamer@deskly.test", photoIdx: 29, slug: "streamer-acustico-painel-30", title: "Streamer com tratamento acústico", description: "Painéis acústicos, difusores, Shure MV7, ZV-1 fixa.", styles: ["áudio","creator","streaming"], career: "creator", budget_brl: 9800, city: "Brasília, DF", ai_score: 8.9, products: [p("Áudio","Shure MV7 USB","Shure",2599,"amazon_br",40,55,1),p("Câmera","Sony ZV-1","Sony",4999,"amazon_br",50,25,2)] },
  { ownerEmail: "pm@deskly.test", photoIdx: 30, slug: "pm-quadro-kanban-31", title: "PM com quadro Kanban físico atrás", description: "Quadro magnético com épicos como fundo de call. Brio + boom mic.", styles: ["produtivo","pm"], career: "pm", budget_brl: 6900, city: "Recife, PE", ai_score: 8.7, products: [p("Câmera","Logitech Brio 4K","Logitech",1499,"amazon_br",50,22,1),p("Áudio","Maono PD400X","Maono",999,"amazon_br",38,55,2)] },
  { ownerEmail: "empreendedor@deskly.test", photoIdx: 31, slug: "founder-window-light-32", title: "Founder com luz natural ampla", description: "Janela ampla atrás, monitor curvo, mesa elétrica.", styles: ["standing","luz-natural"], career: "outro", budget_brl: 8900, city: "Florianópolis, SC", ai_score: 9.0, products: [p("Mesa","Mesa elétrica IronFlex","IronFlex",2599,"mercado_livre",50,90,1),p("Cadeira","DT3 Tronos","DT3",2799,"kabum",30,80,2)] },
  { ownerEmail: "consultor@deskly.test", photoIdx: 32, slug: "consultor-mc-call-cenario-33", title: "Consultor de gestão: cenário curado", description: "Estante de design, livros selecionados, planta, mesa carvalho.", styles: ["profissional","decoração"], career: "pm", budget_brl: 7200, city: "São Paulo, SP", ai_score: 8.8, products: [p("Câmera","Canon M50","Canon",4799,"amazon_br",50,25,1),p("Iluminação","Elgato Key Light par","Elgato",3499,"amazon_br",78,30,2)] },
  { ownerEmail: "designer@deskly.test", photoIdx: 33, slug: "designer-ipad-procreate-34", title: "Designer iPad + Procreate", description: "iPad Pro como ferramenta principal, MacBook na docking, mesa branca.", styles: ["minimalista","designer","Mac"], career: "designer", budget_brl: 19500, city: "Florianópolis, SC", ai_score: 9.1, products: [p("Notebook","iPad Pro 12.9 M2","Apple",13999,"magalu",50,55,1),p("Notebook","MacBook Air M3","Apple",11999,"magalu",30,70,2)] },
  { ownerEmail: "creator@deskly.test", photoIdx: 34, slug: "creator-tiktok-vertical-35", title: "Creator TikTok: setup vertical com fundo", description: "Câmera vertical, ring light grande, fundo de tecido configurável.", styles: ["creator","câmera","vertical"], career: "creator", budget_brl: 6800, city: "São Paulo, SP", ai_score: 8.5, products: [p("Iluminação","Ring Light 18\" Profissional","Greika",449,"amazon_br",50,25,1),p("Câmera","iPhone 15 Pro + tripé","Apple",8999,"magalu",50,40,2)] },
  { ownerEmail: "designer@deskly.test", photoIdx: 35, slug: "designer-padrao-pasteis-36", title: "Designer: paleta pastel + plantas", description: "Tons rosé e verde claro, várias plantas, MacBook + iPad.", styles: ["criativo","plantas"], career: "designer", budget_brl: 11500, city: "Belo Horizonte, MG", ai_score: 8.9, products: [p("Notebook","MacBook Pro 14\" M3","Apple",18999,"magalu",50,55,1),p("Decoração","Curadoria plantas (8 un)","Plantei",799,"mercado_livre",18,55,2)] },
  { ownerEmail: "dev@deskly.test", photoIdx: 36, slug: "dev-cave-escura-37", title: "Dev cave: ambiente escuro com bias light", description: "Iluminação ambient azul atrás dos monitores, mesa fixa carvalho escuro.", styles: ["dark","dev","produtivo"], career: "dev", budget_brl: 12500, city: "Rio de Janeiro, RJ", ai_score: 9.0, products: [p("Iluminação","Bias light Govee","Govee",299,"amazon_br",50,18,1),p("Monitor","LG 34WP500-B Ultrawide","LG",2199,"kabum",50,32,2)] },
  { ownerEmail: "casal@deskly.test", photoIdx: 37, slug: "casal-paralelo-mesa-38", title: "Casal: mesa paralela ergonômica", description: "Dois lados independentes, cada um com ergonomia própria. Plantas ao meio.", styles: ["duplo","ergonômico"], career: "remoto", budget_brl: 14800, city: "Porto Alegre, RS", ai_score: 8.6, products: [p("Cadeira","Par DT3 Yama1","DT3",3798,"kabum",30,80,1),p("Monitor","Par Dell U2723QE","Dell",8598,"amazon_br",50,32,2)] },
  { ownerEmail: "estudante@deskly.test", photoIdx: 38, slug: "estudante-pequeno-foco-39", title: "Estudante: mesa de canto compacta", description: "Canto do quarto otimizado, prateleira em L, MacBook + monitor.", styles: ["apê pequeno","estudante"], career: "outro", budget_brl: 3500, city: "Belo Horizonte, MG", ai_score: 8.0, products: [p("Mesa","Mesa canto Casa Móveis","Casa Móveis",489,"magalu",50,90,1),p("Notebook","MacBook Air M2","Apple",10999,"magalu",50,55,2)] },
  { ownerEmail: "professor@deskly.test", photoIdx: 39, slug: "professora-online-completo-40", title: "Professora online: kit completo de aula", description: "Câmera, lousa digital, fone, mic, plantas pra fundo.", styles: ["câmera","educação"], career: "outro", budget_brl: 5900, city: "Belo Horizonte, MG", ai_score: 8.6, products: [p("Câmera","Logitech C922 Pro","Logitech",899,"amazon_br",50,22,1),p("Áudio","Audio-Technica ATR2100x","Audio-Technica",899,"amazon_br",40,55,2)] },
  { ownerEmail: "streamer@deskly.test", photoIdx: 40, slug: "streamer-casual-iniciante-41", title: "Streamer casual: setup acessível", description: "Começando a streamar com orçamento baixo: webcam + mic USB + fone gamer.", styles: ["creator","barato","streaming"], career: "creator", budget_brl: 2900, city: "Brasília, DF", ai_score: 7.8, products: [p("Câmera","Logitech C920s","Logitech",599,"mercado_livre",50,22,1),p("Áudio","HyperX QuadCast","HyperX",1099,"kabum",40,55,2)] },
  { ownerEmail: "consultor@deskly.test", photoIdx: 41, slug: "consultor-clean-zoom-42", title: "Consultor: setup clean pra Zoom", description: "Fundo branco com 1 quadro, câmera 4K, áudio nítido.", styles: ["minimalista","câmera"], career: "pm", budget_brl: 5500, city: "São Paulo, SP", ai_score: 8.5, products: [p("Câmera","Logitech Brio 4K","Logitech",1499,"amazon_br",50,22,1),p("Iluminação","Elgato Key Light Air","Elgato",1899,"amazon_br",78,30,2)] },
  { ownerEmail: "designer@deskly.test", photoIdx: 42, slug: "designer-2-tons-madeira-43", title: "Designer: madeira clara + branco", description: "Mistura escandinava: mesa madeira clara, paredes brancas, plantas.", styles: ["escandinavo","minimalista"], career: "designer", budget_brl: 13800, city: "Florianópolis, SC", ai_score: 9.0, products: [p("Mesa","Mesa carvalho 1,40m","Móveis BR",899,"magalu",50,90,1),p("Cadeira","Herman Miller Sayl","Herman Miller",5499,"outro",30,80,2)] },
  { ownerEmail: "dev@deskly.test", photoIdx: 43, slug: "dev-backend-multi-tela-44", title: "Dev backend: multi-tela vertical", description: "Monitor central wide + 2 verticais nas laterais. Termianl + docs + logs.", styles: ["dev","multi-monitor","pro"], career: "dev", budget_brl: 16800, city: "Rio de Janeiro, RJ", ai_score: 9.1, products: [p("Monitor","LG 34WP65C Ultrawide","LG",2799,"kabum",50,32,1),p("Monitor","Par Dell U2419H vertical","Dell",3998,"amazon_br",70,32,2)] },
  { ownerEmail: "creator@deskly.test", photoIdx: 44, slug: "creator-podcast-acustico-45", title: "Cantinho podcast: tratamento acústico", description: "Cabine improvisada com painéis, mic Shure dinâmico, captura limpa.", styles: ["áudio","creator","podcast"], career: "creator", budget_brl: 4500, city: "São Paulo, SP", ai_score: 8.7, products: [p("Áudio","Shure MV7","Shure",2599,"amazon_br",40,55,1),p("Decoração","Painéis acústicos 12un","Audico",349,"mercado_livre",18,30,2)] },
  { ownerEmail: "datasci@deskly.test", photoIdx: 45, slug: "data-thinkpad-ultrawide-46", title: "Data: ThinkPad + ultrawide curvo", description: "ThinkPad como motor, ultrawide pra ver código + dashboard lado a lado.", styles: ["dev","ultrawide"], career: "dev", budget_brl: 14000, city: "Campinas, SP", ai_score: 8.9, products: [p("Notebook","ThinkPad T14s Gen 4","Lenovo",10999,"magalu",45,55,1),p("Monitor","Samsung Odyssey G9 curvo","Samsung",6999,"kabum",50,32,2)] },
  { ownerEmail: "streamer@deskly.test", photoIdx: 46, slug: "kaua-stream-fps-rgb-47", title: "Streamer FPS: RGB completo + 3 monitores", description: "Triple monitor 240Hz, RGB sincronizado, fone aberto premium.", styles: ["gamer","creator","rgb"], career: "creator", budget_brl: 22000, city: "Brasília, DF", ai_score: 9.3, products: [p("Monitor","Triplo AOC 24G2 240Hz","AOC",6300,"kabum",50,32,1),p("Áudio","Sennheiser HD 660S","Sennheiser",3499,"amazon_br",20,55,2)] },
  { ownerEmail: "datasci@deskly.test", photoIdx: 47, slug: "fer-data-clean-47", title: "Data scientist 2: ambiente clean monotone", description: "Mesa de carvalho claro, monitor 4K, plantas pequenas. Sem distração.", styles: ["minimalista","dev"], career: "dev", budget_brl: 12500, city: "Campinas, SP", ai_score: 9.0, products: [p("Monitor","Dell U2723QE 4K","Dell",4299,"amazon_br",50,32,1),p("Cadeira","Flexform Charm","Flexform",2299,"magalu",30,80,2)] },
  { ownerEmail: "designer@deskly.test", photoIdx: 48, slug: "designer-cores-pasteis-48", title: "Designer: cores pasteis e organizadores", description: "Tons rosa, organizadores transparentes, MacBook + iPad.", styles: ["criativo","cores"], career: "designer", budget_brl: 9800, city: "Belo Horizonte, MG", ai_score: 8.7, products: [p("Notebook","MacBook Air M3","Apple",11999,"magalu",50,55,1),p("Decoração","Organizadores Muji","Muji",399,"outro",78,75,2)] },
  { ownerEmail: "creator@deskly.test", photoIdx: 49, slug: "creator-tech-rgb-completo-49", title: "Creator tech: RGB + dual camera", description: "Streaming tech: ZV-E10 + iPhone como B-roll, RGB Govee, mic Shure.", styles: ["creator","gamer","rgb"], career: "creator", budget_brl: 13800, city: "Rio de Janeiro, RJ", ai_score: 9.0, products: [p("Câmera","Sony ZV-E10","Sony",6499,"amazon_br",50,25,1),p("Iluminação","Govee RGB Strip 5m","Govee",259,"amazon_br",78,18,2)] },
];

function searchUrl(store: Store, name: string): string {
  const q = encodeURIComponent(name);
  switch (store) {
    case "amazon_br": return `https://www.amazon.com.br/s?k=${q}`;
    case "mercado_livre": return `https://lista.mercadolivre.com.br/${q}`;
    case "kabum": return `https://www.kabum.com.br/busca/${q}`;
    case "magalu": return `https://www.magazineluiza.com.br/busca/${q}/`;
    case "pichau": return `https://www.pichau.com.br/search?q=${q}`;
    default: return `https://www.google.com/search?q=${q}`;
  }
}

async function findOwnerId(email: string): Promise<string | null> {
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
  return data.users.find((u) => u.email === email)?.id ?? null;
}

async function main() {
  console.log(`→ Tentando inserir ${SETUPS.length} setups`);
  let inserted = 0, skipped = 0;
  for (const s of SETUPS) {
    const { data: existing } = await admin.from("setups").select("id").eq("slug", s.slug).maybeSingle();
    if (existing) { console.log(`  ↳ ${s.slug} já existe, pulando`); skipped++; continue; }
    const ownerId = await findOwnerId(s.ownerEmail);
    if (!ownerId) { console.warn(`  ⚠ owner ${s.ownerEmail} não encontrado, pulando ${s.slug}`); continue; }
    const coverUrl = img(PHOTOS[s.photoIdx]);
    const { data: setup, error } = await admin.from("setups").insert({
      owner_id: ownerId, slug: s.slug, title: s.title, description: s.description,
      styles: s.styles, career: s.career, budget_brl: s.budget_brl, city: s.city,
      cover_url: coverUrl, status: "published", ai_score: s.ai_score,
    }).select("id").single();
    if (error || !setup) { console.warn(`  ⚠ ${s.slug}:`, error?.message); continue; }
    inserted++;
    await admin.from("setup_images").insert({ setup_id: setup.id, url: coverUrl, position: 0, is_before: false, is_after: false });
    if (s.products.length > 0) {
      await admin.from("setup_products").insert(s.products.map((p) => ({
        setup_id: setup.id,
        category: p.category, name: p.name, brand: p.brand, price_brl: p.price_brl, store: p.store,
        affiliate_url: searchUrl(p.store, p.name),
        x: p.x, y: p.y, position: p.position, rating: p.rating,
      })));
    }
    console.log(`  ↳ ${s.slug} (${setup.id})`);
  }
  console.log(`\n✓ ${inserted} inseridos, ${skipped} já existiam`);
}

main().catch((e) => { console.error("falhou:", e); process.exit(1); });
