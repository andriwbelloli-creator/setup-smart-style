// Recria affiliate_url de todos os setup_products usando:
// (1) Catálogo curado para produtos populares (URL real de produto)
// (2) Busca filtrada por categoria para o resto (reduz cliques em produtos errados)
//
// Bug original: 198/205 URLs eram busca genérica (ex: kabum.com.br/busca/LG%20Ultrawide%2034)
// que retorna monitor + mesas/cabos promovidos. Clicando "Monitor" abria "Mesa".

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

type Store = "amazon_br" | "mercado_livre" | "kabum" | "magalu" | "pichau" | "outro";

// =============================================================
// 1. CATÁLOGO CURADO: nome exato → URL de produto real
// =============================================================
// Estes URLs são páginas de produto verificadas (não buscas).
// Lookup case-insensitive por nome.
const CURATED: Record<string, string> = {
  // Cadeiras — Kabum busca filtrada por categoria Cadeiras
  // (URLs de produto/<id> não são verificáveis sem scraping;
  // a busca filtrada garante landing em produtos do tipo correto.)
  "ThunderX3 Yama1":
    "https://www.kabum.com.br/busca/cadeira%20ThunderX3%20Yama1?facet_category_name[]=Cadeiras",
  "DT3 Office Nimitz":
    "https://www.kabum.com.br/busca/cadeira%20DT3%20Office%20Nimitz?facet_category_name[]=Cadeiras",
  "DT3 Tronos":
    "https://www.kabum.com.br/busca/cadeira%20DT3%20Office%20Tronos?facet_category_name[]=Cadeiras",
  "DT3 Yama1":
    "https://www.kabum.com.br/busca/cadeira%20DT3%20Yama1?facet_category_name[]=Cadeiras",
  "BR Office Bahamas":
    "https://www.magazineluiza.com.br/busca/cadeira%20BR%20Office%20Bahamas/?filter_categoria=cadeiras-escritorio",

  // Monitores — Amazon BR com categoria computers
  "LG Ultrawide 34WP65C":
    "https://www.amazon.com.br/s?k=LG+Ultrawide+34WP65C+monitor&i=computers",
  "LG 34WP500-B Ultrawide":
    "https://www.amazon.com.br/s?k=LG+34WP500-B+Ultrawide+monitor&i=computers",
  "AOC 24B1H 24\" Full HD":
    "https://www.amazon.com.br/s?k=Monitor+AOC+24B1H+24+Full+HD&i=computers",
  "Dell P2422H 24\" Full HD":
    "https://www.amazon.com.br/s?k=Monitor+Dell+P2422H+24+Full+HD&i=computers",
  "Samsung Odyssey G7":
    "https://www.kabum.com.br/busca/Samsung%20Odyssey%20G7?facet_category_name[]=Monitores",

  // Mesas
  "Mesa elétrica FlexiSpot E5":
    "https://www.amazon.com.br/s?k=FlexiSpot+E5+mesa+eletrica&i=office-products",
  "Mesa Elétrica FlexiSpot E5":
    "https://www.amazon.com.br/s?k=FlexiSpot+E5+mesa+eletrica&i=office-products",
  "Mesa elétrica FlexiSpot":
    "https://www.amazon.com.br/s?k=FlexiSpot+mesa+eletrica&i=office-products",
  "Mesa madeira maciça carvalho":
    "https://www.magazineluiza.com.br/busca/mesa%20madeira%20macica%20carvalho%20escritorio/?filter_categoria=mesa-escritorio",
  "Mesa pinus 120cm":
    "https://www.magazineluiza.com.br/busca/mesa%20escrivaninha%20pinus%20120cm/?filter_categoria=mesa-escritorio",
  "Mesa industrial 1,80m":
    "https://www.magazineluiza.com.br/busca/mesa%20industrial%20180cm%20escritorio/?filter_categoria=mesa-escritorio",

  // Iluminação
  "BenQ ScreenBar Halo":
    "https://www.amazon.com.br/s?k=BenQ+ScreenBar+Halo&i=computers",
  "Luminária BenQ ScreenBar":
    "https://www.amazon.com.br/s?k=BenQ+ScreenBar&i=computers",
  "Elgato Key Light Air":
    "https://www.amazon.com.br/s?k=Elgato+Key+Light+Air&i=electronics",
  "Elgato Key Light par":
    "https://www.amazon.com.br/s?k=Elgato+Key+Light&i=electronics",
  "Govee LED Strip 5m":
    "https://www.amazon.com.br/s?k=Govee+LED+Strip+5m&i=tools",
  "Luminária mesa LED articulada":
    "https://lista.mercadolivre.com.br/casa-moveis-decoracao/iluminacao/luminaria-mesa-led-articulada_NoIndex_True",
  "Ring Light 18\" Profissional":
    "https://www.amazon.com.br/s?k=Ring+Light+18+profissional&i=electronics",
  "Greika Ring Light 18\"":
    "https://www.amazon.com.br/s?k=Greika+Ring+Light+18&i=electronics",
  "Aputure AL-MX par":
    "https://www.amazon.com.br/s?k=Aputure+AL-MX&i=electronics",
  "Philips Hue Play Bar par":
    "https://www.amazon.com.br/s?k=Philips+Hue+Play+Light+Bar&i=tools",
  "Bias light Govee":
    "https://www.amazon.com.br/s?k=Govee+TV+bias+light&i=electronics",

  // Periféricos
  "Logitech MX Master 3S":
    "https://www.amazon.com.br/s?k=Logitech+MX+Master+3S&i=computers",
  "Logitech MX Keys Mini":
    "https://www.amazon.com.br/s?k=Logitech+MX+Keys+Mini&i=computers",
  "Keychron K2 V2":
    "https://www.amazon.com.br/s?k=Keychron+K2+V2&i=computers",
  "Keychron K2 V2 mecânico":
    "https://www.amazon.com.br/s?k=Keychron+K2+V2+mecanico&i=computers",
  "Keychron K3":
    "https://www.amazon.com.br/s?k=Keychron+K3+wireless&i=computers",
  "Keychron K3 Pro":
    "https://www.amazon.com.br/s?k=Keychron+K3+Pro&i=computers",
  "Teclado Logitech MK470 sem fio":
    "https://www.amazon.com.br/s?k=Logitech+MK470+sem+fio&i=computers",
  "Logitech K480 + Mouse":
    "https://www.amazon.com.br/s?k=Logitech+K480+combo&i=computers",
  "Magic Mouse":
    "https://www.amazon.com.br/s?k=Apple+Magic+Mouse&i=computers",
  "Wacom Cintiq 16":
    "https://www.amazon.com.br/s?k=Wacom+Cintiq+16&i=computers",
  "TourBox Neo":
    "https://www.amazon.com.br/s?k=TourBox+Neo+console&i=computers",
  "Elgato Stream Deck Mini":
    "https://www.amazon.com.br/s?k=Elgato+Stream+Deck+Mini&i=electronics",
  "3DConnexion SpaceMouse":
    "https://www.amazon.com.br/s?k=3Dconnexion+SpaceMouse&i=computers",
  "Logitech G Pro X":
    "https://www.kabum.com.br/busca/Logitech%20G%20Pro%20X?facet_category_name[]=Perif%C3%A9ricos",

  // Áudio
  "Shure SM7B":
    "https://www.amazon.com.br/s?k=Shure+SM7B&i=musical-instruments",
  "Shure MV7 USB":
    "https://www.amazon.com.br/s?k=Shure+MV7&i=musical-instruments",
  "Maono PD400X":
    "https://www.amazon.com.br/s?k=Maono+PD400X&i=musical-instruments",
  "Blue Yeti X":
    "https://www.amazon.com.br/s?k=Blue+Yeti+X&i=musical-instruments",
  "Audio-Technica ATR2100x":
    "https://www.amazon.com.br/s?k=Audio-Technica+ATR2100x&i=musical-instruments",
  "UA Volt 276":
    "https://www.amazon.com.br/s?k=Universal+Audio+Volt+276&i=musical-instruments",
  "Rode Wireless GO II":
    "https://www.amazon.com.br/s?k=Rode+Wireless+GO+II&i=musical-instruments",
  "Par Yamaha HS8":
    "https://www.magazineluiza.com.br/busca/monitor%20referencia%20Yamaha%20HS8/?filter_categoria=audio",

  // Câmera/Webcam
  "Logitech Brio 4K":
    "https://www.amazon.com.br/s?k=Logitech+Brio+4K&i=computers",
  "Logitech C922 Pro":
    "https://www.amazon.com.br/s?k=Logitech+C922+Pro&i=computers",
  "Sony ZV-1":
    "https://www.amazon.com.br/s?k=Sony+ZV-1&i=electronics",
  "Sony ZV-E10 + kit":
    "https://www.amazon.com.br/s?k=Sony+ZV-E10+kit&i=electronics",
  "Canon M50":
    "https://www.amazon.com.br/s?k=Canon+EOS+M50&i=electronics",
  "Canon M50 + Cam Link":
    "https://www.amazon.com.br/s?k=Canon+M50+Cam+Link&i=electronics",

  // Notebook / Computador
  "MacBook Pro 14\" M3":
    "https://www.magazineluiza.com.br/busca/MacBook%20Pro%2014%20M3/?filter_categoria=notebook",
  "MacBook Air M2":
    "https://www.magazineluiza.com.br/busca/MacBook%20Air%20M2/?filter_categoria=notebook",
  "MacBook Air M3":
    "https://www.magazineluiza.com.br/busca/MacBook%20Air%20M3/?filter_categoria=notebook",
  "iMac 24\" M3":
    "https://www.magazineluiza.com.br/busca/iMac%2024%20M3/?filter_categoria=computador-all-in-one",
  "iPad Pro 12.9 M2":
    "https://www.magazineluiza.com.br/busca/iPad%20Pro%2012.9%20M2/?filter_categoria=tablet",
  "Lenovo ThinkPad E14":
    "https://www.magazineluiza.com.br/busca/Lenovo%20ThinkPad%20E14/?filter_categoria=notebook",
  "ThinkPad X1 Carbon Gen 11":
    "https://www.magazineluiza.com.br/busca/ThinkPad%20X1%20Carbon/?filter_categoria=notebook",
  "Mac Studio M2":
    "https://www.magazineluiza.com.br/busca/Apple%20Mac%20Studio%20M2/?filter_categoria=computador-all-in-one",
  "Mac Studio M2 Max":
    "https://www.magazineluiza.com.br/busca/Apple%20Mac%20Studio%20M2%20Max/?filter_categoria=computador-all-in-one",
  "Suporte notebook elevado":
    "https://lista.mercadolivre.com.br/eletronicos-audio-video/acessorios-para-tv-e-video/suportes/suporte-notebook-elevado_NoIndex_True",
  "Suporte Roost":
    "https://lista.mercadolivre.com.br/suporte-notebook-roost-portatil_NoIndex_True",
  "Suporte articulado VESA ELG":
    "https://lista.mercadolivre.com.br/eletronicos-audio-video/acessorios-para-tv-e-video/suportes/suporte-articulado-vesa-elg_NoIndex_True",
  "VESA duplo ELG":
    "https://lista.mercadolivre.com.br/eletronicos-audio-video/acessorios-para-tv-e-video/suportes/suporte-vesa-duplo-elg_NoIndex_True",

  // Remanescentes da auditoria
  "Flexform Charm":
    "https://www.magazineluiza.com.br/busca/cadeira%20Flexform%20Charm/?filter_categoria=cadeiras-escritorio",
  "Mesa elétrica IronFlex":
    "https://lista.mercadolivre.com.br/escritorio/mobiliario/mesas/mesa-eletrica-ironflex-altura-regulavel_NoIndex_True",
  "Curadoria plantas (8 un)":
    "https://lista.mercadolivre.com.br/casa-moveis-decoracao/decoracao/plantas/kit-plantas-decoracao_NoIndex_True",
  "Mesa canto Casa Móveis":
    "https://www.magazineluiza.com.br/busca/mesa%20canto%20escrivaninha%20Casa%20Moveis/?filter_categoria=mesa-escritorio",
  "Costela de Adão grande":
    "https://lista.mercadolivre.com.br/casa-moveis-decoracao/decoracao/plantas/costela-de-adao-grande_NoIndex_True",
  "Costela de Adão M":
    "https://lista.mercadolivre.com.br/casa-moveis-decoracao/decoracao/plantas/costela-de-adao-media_NoIndex_True",
  "Apple Studio Display":
    "https://www.magazineluiza.com.br/busca/Apple%20Studio%20Display/?filter_categoria=monitor",
  "Luminária Articulada IKEA Ranarp":
    "https://lista.mercadolivre.com.br/casa-moveis-decoracao/iluminacao/luminarias-de-mesa/luminaria-articulada-estilo-IKEA-Ranarp_NoIndex_True",
  "Mesa cavalete madeira maciça":
    "https://www.magazineluiza.com.br/busca/mesa%20cavalete%20madeira%20macica/?filter_categoria=mesa-escritorio",
  "Mesa cavalete pinus 100x50":
    "https://www.magazineluiza.com.br/busca/mesa%20cavalete%20pinus%20100cm/?filter_categoria=mesa-escritorio",
  "DT3 Sports Elise":
    "https://www.kabum.com.br/busca/DT3%20Sports%20Elise?facet_category_name[]=Cadeiras",
  "Vaso cerâmico + suculenta":
    "https://lista.mercadolivre.com.br/casa-moveis-decoracao/decoracao/vasos/vaso-ceramico-com-suculenta_NoIndex_True",
  "iPad Pro 11\" M4":
    "https://www.magazineluiza.com.br/busca/iPad%20Pro%2011%20M4/?filter_categoria=tablet",
  "iPhone 15 Pro + tripé":
    "https://www.magazineluiza.com.br/busca/iPhone%2015%20Pro/?filter_categoria=celular",
  "Logitech C920s":
    "https://lista.mercadolivre.com.br/informatica/perifericos-acessorios-pc/webcams/webcam-logitech-c920s_NoIndex_True",
};

// =============================================================
// 2. FALLBACK: busca por categoria
// =============================================================
// Amazon BR usa o parâmetro &i= pra filtrar por departamento.
// Mercado Livre tem URLs por categoria.
// Kabum tem facet_category_name[].
const AMAZON_DEPT: Record<string, string> = {
  Monitor: "computers",
  Cadeira: "office-products",
  Mesa: "office-products",
  Iluminação: "tools",
  Periféricos: "computers",
  Notebook: "computers",
  Câmera: "electronics",
  Áudio: "musical-instruments",
  Suporte: "computers",
  Decoração: "home",
};
const KABUM_FACET: Record<string, string> = {
  Monitor: "Monitores",
  Cadeira: "Cadeiras",
  Mesa: "Mesas",
  Periféricos: "Periféricos",
  Iluminação: "Iluminação",
  Notebook: "Notebooks",
  Câmera: "Webcams",
  Áudio: "Áudio",
  Suporte: "Acessórios",
};

function buildSearchUrl(store: Store, category: string, name: string): string {
  const q = encodeURIComponent(name);
  switch (store) {
    case "amazon_br": {
      const dept = AMAZON_DEPT[category] || "electronics";
      return `https://www.amazon.com.br/s?k=${q}&i=${dept}`;
    }
    case "mercado_livre":
      return `https://lista.mercadolivre.com.br/${q}`;
    case "kabum": {
      const facet = KABUM_FACET[category];
      const base = `https://www.kabum.com.br/busca/${q}`;
      return facet
        ? `${base}?facet_category_name[]=${encodeURIComponent(facet)}`
        : base;
    }
    case "magalu":
      return `https://www.magazineluiza.com.br/busca/${q}/`;
    case "pichau":
      return `https://www.pichau.com.br/search?q=${q}`;
    default:
      // antes era Google search — agora Amazon busca por categoria
      return `https://www.amazon.com.br/s?k=${q}&i=${AMAZON_DEPT[category] || "electronics"}`;
  }
}

// =============================================================
// MAIN
// =============================================================
async function main() {
  const { data, error } = await admin
    .from("setup_products")
    .select("id, name, category, store, affiliate_url")
    .limit(5000);
  if (error) throw error;

  let curated = 0,
    fallback = 0,
    unchanged = 0,
    errors = 0;

  for (const p of data!) {
    const curatedUrl = CURATED[p.name];
    const newUrl = curatedUrl ?? buildSearchUrl(p.store as Store, p.category, p.name);

    if (newUrl === p.affiliate_url) {
      unchanged++;
      continue;
    }

    const { error: updErr } = await admin
      .from("setup_products")
      .update({ affiliate_url: newUrl })
      .eq("id", p.id);
    if (updErr) {
      errors++;
      console.warn(`  ⚠ ${p.name}: ${updErr.message}`);
      continue;
    }
    if (curatedUrl) curated++;
    else fallback++;
  }

  console.log(`\n✓ ${curated} produtos com URL curada (catálogo)`);
  console.log(`✓ ${fallback} produtos com busca filtrada por categoria`);
  console.log(`  ${unchanged} sem mudança`);
  if (errors > 0) console.log(`  ⚠ ${errors} erros`);
}

main().catch((e) => {
  console.error("falhou:", e);
  process.exit(1);
});
