// suggest-listing: IA preenche um rascunho de anúncio C2C a partir
// de uma foto do produto. User clica "Preencher com IA" no /marketplace/anunciar
// após subir foto e recebe: { title, description, category_slug,
// condition_slug, suggested_price_brl }.

import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Categorias e condições aceitas no marketplace — vem do banco mas
// hardcodadas aqui pra evitar query extra na chamada da IA.
const CATEGORY_SLUGS = ["monitores", "cadeiras", "mesas", "teclados", "mouses", "audio", "iluminacao", "webcams", "notebooks", "acessorios"];
const CONDITION_SLUGS = ["novo", "como-novo", "bom", "aceitavel"];

const SYSTEM_PROMPT = `Você é um especialista em equipamentos de home office no Brasil. Sua tarefa: analisar a foto de um produto USADO e gerar um rascunho de anúncio C2C pra marketplace brasileiro.

REGRAS:
1. Identifique o produto exato pela foto (marca, modelo se possível)
2. Sugira preço em BRL realista pra mercado de usados BR (consulta seu conhecimento; produtos usados custam 50-70% do novo)
3. Categoria precisa ser EXATAMENTE uma destas: ${CATEGORY_SLUGS.join(", ")}
4. Condição precisa ser EXATAMENTE uma destas: ${CONDITION_SLUGS.join(", ")}
   - "novo" só se claramente lacrado/sem uso visível
   - "como-novo" se aberto mas sem marcas
   - "bom" se sinais leves de uso
   - "aceitavel" se marcas visíveis mas funcional
5. Título: descritivo, 30-80 chars (ex: "Monitor LG UltraGear 27GP850 27\\" 165Hz")
6. Descrição: 80-300 chars, mencione marca/modelo, estado de conservação visível, acessórios visíveis (cabo, caixa). Seja honesto.
7. NÃO invente defeitos que você não vê. NÃO prometa garantia.`;

const TOOL = {
  type: "function",
  function: {
    name: "draft_listing",
    description: "Devolve um rascunho de anúncio baseado na foto do produto.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", minLength: 10, maxLength: 100 },
        description: { type: "string", minLength: 50, maxLength: 600 },
        category_slug: { type: "string", enum: CATEGORY_SLUGS },
        condition_slug: { type: "string", enum: CONDITION_SLUGS },
        suggested_price_brl: { type: "number", minimum: 1, maximum: 999999 },
        confidence: { type: "number", minimum: 0, maximum: 100 },
        reasoning: { type: "string", description: "Breve explicação do que você viu na foto (1-2 frases)." },
      },
      required: ["title", "description", "category_slug", "condition_slug", "suggested_price_brl", "confidence", "reasoning"],
      additionalProperties: false,
    },
  },
};

function extractUserId(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  try {
    const token = authHeader.slice(7);
    const [, b64] = token.split(".");
    return JSON.parse(atob(b64.replace(/-/g, "+").replace(/_/g, "/"))).sub || null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const userId = extractUserId(req.headers.get("authorization"));
    if (!userId) {
      return new Response(JSON.stringify({ error: "Login obrigatório" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { imageUrl, imageBase64 } = body;

    if (!imageUrl && !imageBase64) {
      return new Response(JSON.stringify({ error: "imageUrl ou imageBase64 obrigatório" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY não configurada" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageContent = { type: "image_url", image_url: { url: imageUrl ?? imageBase64 } };

    const resp = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${GEMINI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: [
              { type: "text", text: "Analise a foto deste produto e gere um rascunho de anúncio. Use a função draft_listing." },
              imageContent,
            ] },
          ],
          tools: [TOOL],
          tool_choice: { type: "function", function: { name: "draft_listing" } },
        }),
      },
    );

    if (!resp.ok) {
      const t = await resp.text();
      console.error("suggest-listing AI error:", resp.status, t);
      return new Response(JSON.stringify({
        error: "Falha ao chamar IA",
        gemini_status: resp.status,
        gemini_body: t.slice(0, 600),
      }), {
        status: resp.status === 429 ? 429 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) {
      return new Response(JSON.stringify({ error: "IA não retornou estrutura esperada" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed;
    try { parsed = JSON.parse(call.function.arguments); }
    catch (e) {
      return new Response(JSON.stringify({ error: "JSON inválido da IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("suggest-listing error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
