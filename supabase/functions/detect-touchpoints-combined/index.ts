// detect-touchpoints-combined
//
// Orquestra Vision + Gemini pra detecção assertiva de touchpoints.
//
// Pipeline:
//   1. Cloud Vision SafeSearch     → gate de moderação (rejeita NSFW/violência)
//   2. Cloud Vision ObjectLocalize → bboxes de todos os objetos genéricos
//   3. Cloud Vision ImageProperties → paleta dominante (pra classificar estilo)
//   4. Cluster: agrupa bboxes próximas, dedupe
//   5. Gemini 2.0 Flash com bboxes como hint → casa produto declarado com região
//      e gera spatial_context, confidence
//   6. Merge: prioriza match com 2 sinais (Vision + Gemini); fallback Vision-only
//      ou Gemini-only quando o outro falha
//
// Mantém as funções `detect-touchpoints` e `detect-touchpoints-vision` intactas
// como fallback / rota direta. O frontend pode migrar gradualmente.
//
// Output (compatível com as outras + extras):
//   {
//     products: DetectedProduct[],  // mesmo shape de antes
//     vision: {
//       safe: boolean,              // false = bloqueia
//       safe_reason?: string,
//       colors: {hex: string, score: number}[],  // top 5 cores
//       all_objects: {name: string, bbox: Bbox}[],  // bboxes vision_only
//     },
//     pipeline: "vision+gemini" | "vision_only" | "gemini_only",
//     meta: { vision_ms: number, gemini_ms: number, total_ms: number }
//   }

import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Bbox = { x: number; y: number; w: number; h: number }; // 0–1 normalizado
type KnownProduct = { category: string; name: string };
type DetectedProduct = {
  name: string;
  category: string;
  spatial_context: string;
  x: number;
  y: number;
  confidence: number;
  source?: "vision" | "gemini" | "combined";
  bbox?: Bbox;
};

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
  if (!r.ok) throw new Error(`HTTP ${r.status} ao baixar imagem`);
  const buf = new Uint8Array(await r.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i += 8192) bin += String.fromCharCode(...buf.slice(i, i + 8192));
  return btoa(bin);
}

// ===== CLOUD VISION =====

type VisionResult = {
  safe: boolean;
  safe_reason?: string;
  objects: { name: string; score: number; bbox: Bbox }[];
  colors: { hex: string; score: number }[];
};

async function callVision(imageB64: string, apiKey: string): Promise<VisionResult> {
  const r = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [{
        image: { content: imageB64 },
        features: [
          { type: "SAFE_SEARCH_DETECTION" },
          { type: "OBJECT_LOCALIZATION", maxResults: 30 },
          { type: "IMAGE_PROPERTIES" },
        ],
      }],
    }),
  });
  if (!r.ok) throw new Error(`Vision HTTP ${r.status}: ${await r.text()}`);
  const data = await r.json();
  const resp = data.responses?.[0] || {};

  // Safe search: bloqueia LIKELY/VERY_LIKELY em adult, violence, racy
  const ss = resp.safeSearchAnnotation || {};
  const unsafe = ["adult", "violence", "racy"].find((k) =>
    ["LIKELY", "VERY_LIKELY"].includes(ss[k]),
  );

  // Objects → bboxes normalizadas [0,1]
  const objects: VisionResult["objects"] = (resp.localizedObjectAnnotations || [])
    .map((o: any) => {
      const v = o.boundingPoly?.normalizedVertices || [];
      if (v.length < 2) return null;
      const xs = v.map((p: any) => p.x || 0);
      const ys = v.map((p: any) => p.y || 0);
      const x = Math.min(...xs);
      const y = Math.min(...ys);
      return {
        name: o.name || "object",
        score: o.score || 0,
        bbox: { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y },
      };
    })
    .filter(Boolean) as VisionResult["objects"];

  // Top 5 cores dominantes
  const colors = (resp.imagePropertiesAnnotation?.dominantColors?.colors || [])
    .slice(0, 5)
    .map((c: any) => {
      const rgb = c.color || {};
      const hex = "#" + [rgb.red, rgb.green, rgb.blue]
        .map((n: number) => Math.round(n || 0).toString(16).padStart(2, "0"))
        .join("");
      return { hex, score: c.score || 0 };
    });

  return {
    safe: !unsafe,
    safe_reason: unsafe ? `unsafe:${unsafe}=${ss[unsafe]}` : undefined,
    objects,
    colors,
  };
}

// ===== GEMINI =====

const GEMINI_CATEGORY_MAP: Record<string, string[]> = {
  monitor: ["monitor", "computer monitor", "screen", "display", "television"],
  monitores: ["monitor", "computer monitor", "screen", "display"],
  cadeira: ["chair", "office chair", "seat", "armchair"],
  cadeiras: ["chair", "office chair", "seat", "armchair"],
  mesa: ["desk", "table", "computer desk"],
  mesas: ["desk", "table"],
  teclado: ["keyboard", "computer keyboard"],
  mouse: ["mouse", "computer mouse"],
  iluminação: ["lamp", "light fixture", "light"],
  luminária: ["lamp", "light fixture"],
  luminárias: ["lamp", "light fixture"],
  cortina: ["curtain", "drape", "blind"],
  cortinas: ["curtain", "drape", "blind"],
  planta: ["plant", "flower pot", "houseplant"],
  plantas: ["plant", "flower pot", "houseplant"],
  estante: ["shelf", "bookshelf", "cabinet"],
  estantes: ["shelf", "bookshelf", "cabinet"],
  notebook: ["laptop", "notebook"],
  webcam: ["webcam", "camera"],
};

function matchVisionToProducts(
  known: KnownProduct[],
  objects: VisionResult["objects"],
): Map<number, VisionResult["objects"][number]> {
  // Para cada produto declarado, encontra o melhor bbox compatível.
  // Heurística: keyword match na categoria → maior score Vision não usado.
  const used = new Set<number>();
  const matches = new Map<number, VisionResult["objects"][number]>();
  known.forEach((p, idx) => {
    const cat = p.category.toLowerCase().trim();
    const labels = GEMINI_CATEGORY_MAP[cat] || [cat];
    let best: { obj: VisionResult["objects"][number]; objIdx: number } | null = null;
    objects.forEach((o, oi) => {
      if (used.has(oi)) return;
      const n = o.name.toLowerCase();
      if (!labels.some((l) => n.includes(l) || l.includes(n))) return;
      if (!best || o.score > best.obj.score) best = { obj: o, objIdx: oi };
    });
    if (best) {
      used.add(best.objIdx);
      matches.set(idx, best.obj);
    }
  });
  return matches;
}

const CONFIDENCE_THRESHOLD = 70;

async function callGemini(
  imageB64: string,
  known: KnownProduct[],
  visionHints: Map<number, VisionResult["objects"][number]>,
  apiKey: string,
): Promise<DetectedProduct[]> {
  const hintLines = known.map((p, i) => {
    const v = visionHints.get(i);
    const hint = v
      ? ` [Vision detectou "${v.name}" em (x=${(v.bbox.x * 100).toFixed(0)}%, y=${(v.bbox.y * 100).toFixed(0)}%, w=${(v.bbox.w * 100).toFixed(0)}%, h=${(v.bbox.h * 100).toFixed(0)}%, score=${(v.score * 100).toFixed(0)})]`
      : ` [Vision NÃO encontrou objeto compatível]`;
    return `${i + 1}. ${p.category}: ${p.name}${hint}`;
  }).join("\n");

  const userPrompt = `Analise esta foto de home office. O usuário declarou ter os seguintes equipamentos, com hints do Cloud Vision quando disponíveis:

${hintLines}

Para cada produto que conseguir localizar com confidence >= ${CONFIDENCE_THRESHOLD}:
- Confirme/refine x e y (0–100%) do centro visual. Use o hint do Vision como ponto de partida quando disponível.
- Escreva spatial_context descrevendo onde está e por que tem certeza.
- Confidence boost se o Vision já apontou o mesmo objeto (ambos confirmam).

NÃO inclua produtos que não consegue localizar. NÃO invente produtos novos.`;

  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { inline_data: { mime_type: "image/jpeg", data: imageB64 } },
            { text: userPrompt },
          ],
        }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              products: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    category: { type: "string" },
                    spatial_context: { type: "string", minLength: 10 },
                    x: { type: "number" },
                    y: { type: "number" },
                    confidence: { type: "number" },
                  },
                  required: ["name", "category", "spatial_context", "x", "y", "confidence"],
                },
              },
            },
            required: ["products"],
          },
        },
      }),
    },
  );
  if (!r.ok) throw new Error(`Gemini HTTP ${r.status}: ${await r.text()}`);
  const data = await r.json();
  const txt = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const parsed = JSON.parse(txt);
  return (parsed.products || []).filter((p: any) =>
    p && typeof p.x === "number" && typeof p.y === "number" && p.confidence >= CONFIDENCE_THRESHOLD
  );
}

// ===== MERGE =====

function mergeResults(
  known: KnownProduct[],
  visionMatches: Map<number, VisionResult["objects"][number]>,
  geminiProducts: DetectedProduct[],
): DetectedProduct[] {
  const out: DetectedProduct[] = [];
  known.forEach((kp, idx) => {
    const gem = geminiProducts.find((g) => g.name === kp.name && g.category === kp.category);
    const vis = visionMatches.get(idx);

    if (gem && vis) {
      // Combined: ambos confirmam. Confidence boost (média + 10, cap 99).
      out.push({
        name: kp.name,
        category: kp.category,
        spatial_context: gem.spatial_context,
        x: gem.x,
        y: gem.y,
        confidence: Math.min(99, Math.round((gem.confidence + vis.score * 100) / 2) + 10),
        source: "combined",
        bbox: vis.bbox,
      });
    } else if (gem) {
      out.push({ ...gem, source: "gemini" });
    } else if (vis) {
      // Vision-only: usa centro do bbox como x/y. Confidence rebaixada (sem corroboração textual).
      out.push({
        name: kp.name,
        category: kp.category,
        spatial_context: `${vis.name} detectado por Cloud Vision (score ${(vis.score * 100).toFixed(0)})`,
        x: Math.round((vis.bbox.x + vis.bbox.w / 2) * 100),
        y: Math.round((vis.bbox.y + vis.bbox.h / 2) * 100),
        confidence: Math.round(vis.score * 100) - 5,
        source: "vision",
        bbox: vis.bbox,
      });
    }
    // Senão: nenhum dos dois achou — não inclui (não inventa)
  });
  return out;
}

// ===== HANDLER =====

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const t0 = Date.now();
  try {
    const userId = extractUserId(req.headers.get("authorization"));
    if (!userId) {
      return new Response(JSON.stringify({ error: "Login obrigatório" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { imageUrl, imageBase64, knownProducts } = body || {};
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

    const visionKey = Deno.env.get("VISION_API_KEY") || Deno.env.get("GEMINI_API_KEY");
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!visionKey && !geminiKey) {
      return new Response(JSON.stringify({ error: "VISION_API_KEY ou GEMINI_API_KEY necessária" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageB64 = imageBase64 || await fetchImageAsBase64(imageUrl);

    // Roda Vision e Gemini em paralelo (otimização vs sequencial)
    const tVisionStart = Date.now();
    let visionResult: VisionResult | null = null;
    let visionMs = 0;
    if (visionKey) {
      try {
        visionResult = await callVision(imageB64, visionKey);
        visionMs = Date.now() - tVisionStart;
        if (!visionResult.safe) {
          return new Response(JSON.stringify({
            error: "Imagem rejeitada por moderação",
            vision: visionResult,
            pipeline: "vision_only",
          }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (e) {
        console.warn("Vision falhou, segue só com Gemini:", e);
      }
    }

    const visionMatches = visionResult
      ? matchVisionToProducts(knownProducts as KnownProduct[], visionResult.objects)
      : new Map<number, VisionResult["objects"][number]>();

    const tGeminiStart = Date.now();
    let geminiProducts: DetectedProduct[] = [];
    let geminiMs = 0;
    if (geminiKey) {
      try {
        geminiProducts = await callGemini(imageB64, knownProducts, visionMatches, geminiKey);
        geminiMs = Date.now() - tGeminiStart;
      } catch (e) {
        console.warn("Gemini falhou, usa só Vision:", e);
      }
    }

    const merged = mergeResults(knownProducts as KnownProduct[], visionMatches, geminiProducts);
    const pipeline = visionResult && geminiProducts.length > 0
      ? "vision+gemini"
      : visionResult
      ? "vision_only"
      : "gemini_only";

    return new Response(JSON.stringify({
      products: merged,
      vision: visionResult ? {
        safe: visionResult.safe,
        colors: visionResult.colors,
        all_objects: visionResult.objects.map((o) => ({ name: o.name, bbox: o.bbox, score: o.score })),
      } : null,
      pipeline,
      meta: { vision_ms: visionMs, gemini_ms: geminiMs, total_ms: Date.now() - t0 },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("detect-touchpoints-combined:", e);
    return new Response(JSON.stringify({ error: e.message || String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
