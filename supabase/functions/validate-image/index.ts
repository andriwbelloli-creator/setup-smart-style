// validate-image — rejeita foto de objeto isolado, valida 3+ elementos funcionais
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

  try {
    const body = await req.json();
    imageUrl = body.imageUrl;
    imageBase64 = body.imageBase64;
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

  const prompt = `Você é um validador de imagens de home office brasileiro.

Analise a imagem e responda SOMENTE com JSON válido no formato:
{
  "valid": true/false,
  "elements": ["lista", "de", "elementos", "funcionais", "detectados"],
  "elementCount": número,
  "reason": "explicação curta em português"
}

Regras de validação:
- VÁLIDO: ambiente de trabalho com 3 ou mais elementos funcionais combinados (mesa + cadeira + monitor, notebook + suporte + teclado, etc.)
- INVÁLIDO: produto isolado (apenas uma cadeira, apenas um monitor, apenas um notebook em fundo branco), objeto decorativo isolado, imagem de catálogo/e-commerce

Elementos funcionais contam: mesa, cadeira, monitor, notebook, teclado, mouse, luminária, webcam, suporte, headset, microfone, prateleira, organizador — desde que em contexto de uso real.`;

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [imagePart, { text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 256 },
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
    return json(result);
  } catch {
    return json({ error: "parse_error", raw }, 502);
  }
});
