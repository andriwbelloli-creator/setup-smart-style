// analyze-environment — diagnóstico estruturado do home office em JSON
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  if (Deno.env.get("ENABLE_NEW_IA_FLOW") !== "true") {
    return json({ error: "feature_disabled" }, 503);
  }

  const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_KEY) return json({ error: "GEMINI_API_KEY not set" }, 500);

  let imageUrl: string | undefined;
  let imageBase64: string | undefined;
  let mimeType = "image/jpeg";
  let analysisId: string | undefined;

  try {
    const body = await req.json();
    imageUrl = body.imageUrl;
    imageBase64 = body.imageBase64;
    analysisId = body.analysisId;
    if (body.mimeType) mimeType = body.mimeType;
  } catch {
    return json({ error: "invalid_body" }, 400);
  }

  if (!imageUrl && !imageBase64) {
    return json({ error: "imageUrl or imageBase64 required" }, 400);
  }

  const imagePart = imageUrl
    ? { fileData: { mimeType, fileUri: imageUrl } }
    : { inlineData: { mimeType, data: imageBase64 } };

  const prompt = `Você é um especialista brasileiro em ergonomia, iluminação e design de home offices.

Analise o ambiente na imagem e responda SOMENTE com JSON válido no formato:
{
  "tipo": "home_office" | "setup" | "escritorio" | "canto",
  "ambiente_valido": true/false,
  "scores": {
    "ergonomia": 0-10,
    "iluminacao": 0-10,
    "organizacao": 0-10,
    "estetica": 0-10,
    "cabos": 0-10,
    "produtividade": 0-10
  },
  "nota_geral": 0-10,
  "elementos_detectados": ["lista de itens visíveis"],
  "problemas": [
    { "categoria": "ergonomia|iluminacao|organizacao|estetica|cabos", "descricao": "problema curto", "prioridade": "alta|media|baixa" }
  ],
  "dicas": [
    { "titulo": "dica curta", "descricao": "como resolver em 1-2 frases", "custo": "gratis|baixo|medio|alto" }
  ]
}

Seja objetivo, prático e use linguagem brasileira informal. Foque em melhorias acessíveis.`;

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [imagePart, { text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
      }),
    },
  );

  if (!geminiRes.ok) {
    const err = await geminiRes.text();
    return json({ error: "gemini_error", detail: err }, 502);
  }

  const geminiData = await geminiRes.json();
  const raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleaned);

    // Persiste em ai_diagnostics se analysisId fornecido
    if (analysisId) {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (SUPABASE_URL && SERVICE_ROLE) {
        await fetch(`${SUPABASE_URL}/rest/v1/ai_diagnostics`, {
          method: "POST",
          headers: {
            apikey: SERVICE_ROLE,
            Authorization: `Bearer ${SERVICE_ROLE}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            analysis_id: analysisId,
            ambiente_valido: result.ambiente_valido ?? true,
            tipo: result.tipo ?? "home_office",
            scores: result.scores ?? {},
            raw_response: result,
            model: "gemini-2.5-flash",
          }),
        });
      }
    }

    return json(result);
  } catch {
    return json({ error: "parse_error", raw }, 502);
  }
});
