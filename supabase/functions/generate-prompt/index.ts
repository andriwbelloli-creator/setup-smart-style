// generate-prompt — análise + estilo → prompt visual para geração de imagem
// Gated por ENABLE_NEW_IA_FLOW=true

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

// Descrições visuais por estilo para enriquecer o prompt
const STYLE_VISUAL: Record<string, string> = {
  "home-office-moderno":    "modern Brazilian home office, clean lines, teal and wood accents, minimalist clutter-free desk",
  "home-office-pequeno":    "compact Brazilian home office, smart space-saving furniture, bright neutral tones, organized small desk",
  "escritorio-executivo":   "executive Brazilian home office, dark wood desk, leather chair, premium monitors, sophisticated lighting",
  "consultorio-online":     "professional online consultation room, neutral background, good front lighting, clean bookshelf",
  "home-office-economico":  "budget-friendly Brazilian home office, IKEA-style furniture, bright and organized, cozy feel",
  "criador-de-conteudo":    "Brazilian content creator setup, ring light, camera on arm, RGB accents, microphone, energetic vibe",
  "gamer-clean":            "clean Brazilian gamer setup, dual monitors, mechanical keyboard, subtle RGB, no clutter",
  "escandinavo":            "Scandinavian-inspired Brazilian home office, white and natural wood, plants, warm minimal lighting",
  "escritorio-juridico":    "formal Brazilian legal office, dark tones, law books, mahogany desk, professional atmosphere",
  "professor-online":       "Brazilian online teacher setup, warm lighting, whiteboard or bookshelf background, friendly atmosphere",
  "industrial":             "industrial-style Brazilian home office, exposed brick or concrete, metal shelving, Edison bulbs",
  "minimalista":            "ultra-minimal Brazilian home office, white surfaces, single monitor, no decoration, zen atmosphere",
  "sem-comprar-nada":       "reorganized existing Brazilian home office, same furniture rearranged, better cable management, tidier",
  "home-office-quarto":     "Brazilian bedroom home office corner, compact desk, good task lighting, curtain or divider for separation",
  "home-office-sala":       "Brazilian living room home office, integrated desk area, matching furniture style, natural light",
  "home-office-ergonomico": "ergonomic Brazilian home office, monitor arm, lumbar support chair, keyboard tray, proper posture setup",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  if (Deno.env.get("ENABLE_NEW_IA_FLOW") !== "true") {
    return json({ error: "feature_disabled" }, 503);
  }

  let analysis: Record<string, unknown> = {};
  let styleSlug = "home-office-moderno";
  let budget: number | undefined;

  try {
    const body = await req.json();
    analysis = body.analysis ?? {};
    styleSlug = body.styleSlug ?? "home-office-moderno";
    budget = body.budget;
  } catch {
    return json({ error: "invalid_body" }, 400);
  }

  const styleDesc = STYLE_VISUAL[styleSlug] ?? STYLE_VISUAL["home-office-moderno"];
  const elementos = Array.isArray(analysis.elementos_detectados)
    ? (analysis.elementos_detectados as string[]).join(", ")
    : "desk, chair, monitor";
  const budgetNote = budget != null ? ` Budget: R$ ${budget}.` : "";

  const prompt = [
    styleDesc,
    `photorealistic interior photography, professional camera`,
    `existing elements: ${elementos}`,
    `decorated and organized, beautiful natural light`,
    `Brazilian home office style`,
    budgetNote,
    `high quality, 4k, interior design magazine shot`,
  ]
    .filter(Boolean)
    .join(", ");

  const negativePrompt = [
    "isolated product",
    "white background",
    "catalog shot",
    "text overlay",
    "watermark",
    "blurry",
    "low quality",
    "cartoon",
    "illustration",
  ].join(", ");

  return json({ prompt, negativePrompt, styleSlug });
});
