// detect-touchpoints-vision: alternativa ao detect-touchpoints usando
// Google Cloud Vision API (OBJECT_LOCALIZATION). Cota separada do Gemini.
//
// Diferença vs Gemini:
// - Vision API só retorna labels genéricos em inglês ("Monitor", "Chair").
// - Mapeamos cada label → categoria PT-BR.
// - Se o user declarou 1 item naquela categoria, casa direto.
// - Se mais de 1 na mesma categoria, casa pelo bbox da esquerda pra direita
//   na ordem dos knownProducts (heurística simples; Gemini é melhor pra
//   disambiguar por modelo/marca, Vision não tem essa capacidade).
//
// Vantagens: 1000 chamadas/mês free, separadas do Gemini quota.
// Body, response shape: idênticos ao detect-touchpoints.

import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Categoria PT-BR → keywords que Vision API retorna (case-insensitive)
const CATEGORY_LABELS: Record<string, string[]> = {
  monitores: ["monitor", "computer monitor", "screen", "display", "television", "tv"],
  monitor: ["monitor", "computer monitor", "screen", "display"],
  cadeiras: ["chair", "office chair", "seat", "armchair"],
  cadeira: ["chair", "office chair", "seat", "armchair"],
  mesas: ["desk", "table", "computer desk"],
  mesa: ["desk", "table", "computer desk"],
  teclados: ["keyboard", "computer keyboard"],
  teclado: ["keyboard", "computer keyboard"],
  mouses: ["mouse", "computer mouse"],
  mouse: ["mouse", "computer mouse"],
  perifericos: ["keyboard", "mouse", "computer mouse", "computer keyboard", "speaker", "microphone", "webcam"],
  periféricos: ["keyboard", "mouse", "computer mouse", "computer keyboard", "speaker", "microphone", "webcam"],
  audio: ["speaker", "microphone", "headphones", "audio equipment"],
  áudio: ["speaker", "microphone", "headphones", "audio equipment"],
  iluminacao: ["lamp", "light fixture", "light", "table lamp", "desk lamp", "ceiling lamp", "pendant light", "chandelier", "wall light"],
  iluminação: ["lamp", "light fixture", "light", "table lamp", "desk lamp", "ceiling lamp", "pendant light", "chandelier", "wall light"],
  luminarias: ["lamp", "light fixture", "table lamp", "desk lamp", "floor lamp", "pendant light"],
  luminárias: ["lamp", "light fixture", "table lamp", "desk lamp", "floor lamp", "pendant light"],
  webcams: ["webcam", "camera", "video camera"],
  webcam: ["webcam", "camera", "video camera"],
  notebooks: ["laptop", "computer", "notebook"],
  notebook: ["laptop", "computer", "notebook"],
  // Novos ambientais — separados de "acessorios" pra cada categoria ter
  // sugestão de produto e parceiro específico (ex: Westwing pra cortina,
  // Tok&Stok pra estante, Camicado pra planta, Leroy Merlin pra papel
  // de parede). Mantemos "acessorios/decoracao" como fallback genérico.
  cortinas: ["curtain", "drape", "window blind", "blinds", "window treatment", "shade"],
  cortina: ["curtain", "drape", "window blind", "blinds", "window treatment", "shade"],
  plantas: ["plant", "houseplant", "flower pot", "vase", "potted plant", "flowerpot", "indoor plant"],
  planta: ["plant", "houseplant", "flower pot", "vase", "potted plant", "flowerpot", "indoor plant"],
  estantes: ["shelf", "bookshelf", "bookcase", "shelving", "cabinet", "storage", "wall shelf"],
  estante: ["shelf", "bookshelf", "bookcase", "shelving", "cabinet", "storage", "wall shelf"],
  "papel de parede": ["wallpaper", "wall covering", "wall pattern", "wall decor"],
  "papel-de-parede": ["wallpaper", "wall covering", "wall pattern", "wall decor"],
  papel_parede: ["wallpaper", "wall covering", "wall pattern", "wall decor"],
  acessorios: ["plant", "flower pot", "houseplant", "book", "decoration"],
  acessórios: ["plant", "flower pot", "houseplant", "book", "decoration"],
  decoracao: ["plant", "flower pot", "houseplant", "book", "decoration", "picture frame"],
  decoração: ["plant", "flower pot", "houseplant", "book", "decoration", "picture frame"],
};

function categoryMatches(category: string, visionName: string): boolean {
  const key = category.toLowerCase().trim();
  const labels = CATEGORY_LABELS[key] || [];
  const v = visionName.toLowerCase();
  return labels.some((l) => v.includes(l) || l.includes(v));
}

function extractUserId(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  try {
    const [, payloadB64] = authHeader.slice(7).split(".");
    return JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))).sub || null;
  } catch {
    return null;
  }
}

async function fetchImageAsBase64(url: string): Promise<string> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Falha ao baixar imagem: HTTP ${r.status}`);
  const buf = new Uint8Array(await r.arrayBuffer());
  let binary = "";
  for (let i = 0; i < buf.length; i += 8192) {
    binary += String.fromCharCode(...buf.slice(i, i + 8192));
  }
  return btoa(binary);
}

type KnownProduct = { category: string; name: string };
type DetectedProduct = {
  name: string;
  category: string;
  spatial_context: string;
  x: number;
  y: number;
  confidence: number;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const userId = extractUserId(req.headers.get("authorization"));
    if (!userId) {
      return new Response(JSON.stringify({ error: "Login obrigatório" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { imageUrl, imageBase64, knownProducts } = body as {
      imageUrl?: string;
      imageBase64?: string;
      knownProducts?: KnownProduct[];
    };
    if (!imageUrl && !imageBase64) {
      return new Response(JSON.stringify({ error: "imageUrl ou imageBase64 obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!Array.isArray(knownProducts) || knownProducts.length === 0) {
      return new Response(JSON.stringify({ error: "knownProducts obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const VISION_KEY = Deno.env.get("VISION_API_KEY") || Deno.env.get("GEMINI_API_KEY");
    if (!VISION_KEY) {
      return new Response(JSON.stringify({ error: "VISION_API_KEY (ou GEMINI_API_KEY) não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Vision API aceita base64 OU referência GCS (não URL HTTP direta).
    // Se veio imageUrl, baixamos e convertemos.
    const content = imageBase64
      ? imageBase64.replace(/^data:image\/[^;]+;base64,/, "")
      : await fetchImageAsBase64(imageUrl!);

    const visionResp = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${VISION_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content },
              features: [
                { type: "OBJECT_LOCALIZATION", maxResults: 30 },
              ],
            },
          ],
        }),
      },
    );

    if (!visionResp.ok) {
      const t = await visionResp.text();
      console.error("Vision API error:", visionResp.status, t);
      return new Response(
        JSON.stringify({
          error: "Falha ao chamar Cloud Vision",
          vision_status: visionResp.status,
          vision_body: t.slice(0, 600),
        }),
        {
          status: visionResp.status === 429 ? 429 : 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const data = await visionResp.json();
    const annotations = data.responses?.[0]?.localizedObjectAnnotations || [];

    // Pra cada knownProduct, acha melhor anotação na mesma categoria
    const detected: DetectedProduct[] = [];
    const usedAnnotations = new Set<number>();

    for (const kp of knownProducts) {
      // Acha todas anotações que casem a categoria
      const candidates: Array<{ idx: number; ann: any; score: number }> = [];
      annotations.forEach((ann: any, idx: number) => {
        if (usedAnnotations.has(idx)) return;
        if (categoryMatches(kp.category, ann.name)) {
          candidates.push({ idx, ann, score: ann.score });
        }
      });
      if (candidates.length === 0) continue;
      // Melhor score primeiro
      candidates.sort((a, b) => b.score - a.score);
      const best = candidates[0];
      usedAnnotations.add(best.idx);

      // Calcula centro do bbox (vertices em coords normalizadas 0-1)
      const verts = best.ann.boundingPoly?.normalizedVertices || [];
      if (verts.length < 2) continue;
      const xs = verts.map((v: any) => v.x ?? 0);
      const ys = verts.map((v: any) => v.y ?? 0);
      const cx = ((Math.min(...xs) + Math.max(...xs)) / 2) * 100;
      const cy = ((Math.min(...ys) + Math.max(...ys)) / 2) * 100;
      // Confidence Vision = 0-1, convertemos pra 0-100
      const conf = Math.round((best.score ?? 0) * 100);
      if (conf < 50) continue; // Threshold mais baixo que Gemini porque Vision é genérica

      detected.push({
        name: kp.name,
        category: kp.category,
        spatial_context: `Vision API detectou "${best.ann.name}" com score ${(best.score * 100).toFixed(0)}%`,
        x: Math.round(cx * 10) / 10,
        y: Math.round(cy * 10) / 10,
        confidence: conf,
      });
    }

    return new Response(
      JSON.stringify({
        products: detected,
        total_requested: knownProducts.length,
        total_detected: detected.length,
        provider: "google-cloud-vision",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("detect-touchpoints-vision error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
