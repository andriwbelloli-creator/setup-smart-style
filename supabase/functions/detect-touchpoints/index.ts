// Edge function: detect-touchpoints
// Recebe { imageBase64 | imageUrl, knownProducts: [{ category, name }] }
// e devolve coordenadas (x, y em %) de cada produto LOCALIZADO COM CERTEZA
// na foto, usando Chain-of-Thought + confidence score do Gemini.
//
// Filosofia: a IA só responde com objetos que conseguiu identificar com
// confidence >= 85. Resto fica de fora (UI mostra "Não detectados — marque
// manualmente"). Melhor menos touchpoints corretos do que muitos errados.

import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Mesmo rate limit do analyze-setup (compartilha o problema de queimar
// crédito Gemini). Trackeamos via ai_analyses (não criamos tabela nova).
const RATE_LIMIT_PER_HOUR = 30;
const CONFIDENCE_THRESHOLD = 85;
const MAX_PRODUCTS = 8;

function extractUserId(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  try {
    const token = authHeader.slice(7);
    const [, payloadB64] = token.split(".");
    return JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))).sub || null;
  } catch {
    return null;
  }
}

async function checkRateLimit(userId: string): Promise<{ allowed: boolean }> {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SERVICE_ROLE) return { allowed: true };
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/ai_analyses?select=id&owner_id=eq.${userId}&created_at=gte.${since}`,
    {
      headers: {
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
        Prefer: "count=exact",
        Range: "0-0",
      },
    },
  );
  const total = parseInt((r.headers.get("content-range") || "").split("/").pop() || "0", 10) || 0;
  return { allowed: total < RATE_LIMIT_PER_HOUR };
}

const SYSTEM_PROMPT = `Você é um especialista em visão computacional especializado em identificar equipamentos de home office em fotografias.

TAREFA: Analise a imagem e identifique APENAS os equipamentos de home office claramente visíveis na lista fornecida.

REGRAS CRÍTICAS:
1. NUNCA crie um touchpoint se não tiver certeza absoluta de onde o objeto está.
2. NUNCA confunda objetos próximos. Leia o nome do produto e identifique AQUELE objeto específico.
3. Para cada objeto, PRIMEIRO escreva em spatial_context onde ele está na imagem (ex: "monitor preto no centro da mesa, à esquerda do notebook"), DEPOIS forneça as coordenadas.
4. As coordenadas x e y são PERCENTUAIS (0 a 100) do canto superior esquerdo da imagem. O ponto deve estar no CENTRO VISUAL do objeto.
5. Atribua confidence de 0 a 100. Se confidence < 85, NÃO inclua o objeto.
6. Se um objeto da lista não está claramente visível na foto, simplesmente não o inclua.
7. Máximo de 8 produtos por imagem.`;

// Function-calling schema (formato OpenAI compat, Gemini suporta via endpoint v1beta/openai)
const TOOL = {
  type: "function",
  function: {
    name: "locate_products",
    description: "Devolve coordenadas dos produtos detectados com alta certeza na foto.",
    parameters: {
      type: "object",
      properties: {
        products: {
          type: "array",
          maxItems: MAX_PRODUCTS,
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Nome do produto exatamente como veio na lista de entrada." },
              category: { type: "string", description: "Categoria exatamente como veio na lista de entrada." },
              spatial_context: {
                type: "string",
                minLength: 10,
                description: "Descrição textual de ONDE o objeto está na foto. Mínimo 10 caracteres. Ex: 'monitor preto no centro da mesa, à direita do notebook'.",
              },
              x: { type: "number", description: "Coordenada X em PERCENTUAL (0-100) do centro visual do objeto." },
              y: { type: "number", description: "Coordenada Y em PERCENTUAL (0-100) do centro visual do objeto." },
              confidence: { type: "number", description: "Certeza da localização, 0-100. Só inclua se >= 85." },
            },
            required: ["name", "category", "spatial_context", "x", "y", "confidence"],
            additionalProperties: false,
          },
        },
      },
      required: ["products"],
      additionalProperties: false,
    },
  },
};

type KnownProduct = { category: string; name: string };
type DetectedProduct = {
  name: string;
  category: string;
  spatial_context: string;
  x: number;
  y: number;
  confidence: number;
};

function buildUserPrompt(knownProducts: KnownProduct[]): string {
  const list = knownProducts.map((p, i) => `${i + 1}. ${p.category}: ${p.name}`).join("\n");
  return `Analise esta foto de home office. O usuário declarou ter os seguintes equipamentos:
${list}

Para cada produto que você conseguir localizar com ALTA CERTEZA (confidence >= ${CONFIDENCE_THRESHOLD}):
- Preencha spatial_context com onde ele está na foto
- Forneça x e y (0-100%) do centro do objeto
- Dê um confidence score

Se não conseguir localizar com certeza, NÃO inclua na resposta.`;
}

function validateProduct(p: any): DetectedProduct | null {
  if (
    !p ||
    typeof p.name !== "string" ||
    typeof p.category !== "string" ||
    typeof p.spatial_context !== "string" ||
    p.spatial_context.length < 10 ||
    typeof p.x !== "number" || p.x < 0 || p.x > 100 ||
    typeof p.y !== "number" || p.y < 0 || p.y > 100 ||
    typeof p.confidence !== "number" || p.confidence < 0 || p.confidence > 100
  ) {
    return null;
  }
  return {
    name: p.name,
    category: p.category,
    spatial_context: p.spatial_context,
    x: p.x,
    y: p.y,
    confidence: p.confidence,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const userId = extractUserId(req.headers.get("authorization"));
    if (userId) {
      const { allowed } = await checkRateLimit(userId);
      if (!allowed) {
        return new Response(
          JSON.stringify({ error: `Limite de ${RATE_LIMIT_PER_HOUR} análises/hora atingido.` }),
          {
            status: 429,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
              "X-RateLimit-Limit": String(RATE_LIMIT_PER_HOUR),
              "Retry-After": "3600",
            },
          },
        );
      }
    }

    const body = await req.json();
    const { imageUrl, imageBase64, knownProducts } = body as {
      imageUrl?: string;
      imageBase64?: string;
      knownProducts?: KnownProduct[];
    };

    if (!imageUrl && !imageBase64) {
      return new Response(JSON.stringify({ error: "imageUrl ou imageBase64 é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!Array.isArray(knownProducts) || knownProducts.length === 0) {
      return new Response(
        JSON.stringify({ error: "knownProducts (array com pelo menos 1 item) é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageContent = { type: "image_url", image_url: { url: imageUrl ?? imageBase64 } };

    const resp = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: [{ type: "text", text: buildUserPrompt(knownProducts) }, imageContent],
            },
          ],
          tools: [TOOL],
          tool_choice: { type: "function", function: { name: "locate_products" } },
        }),
      },
    );

    if (!resp.ok) {
      const t = await resp.text();
      console.error("detect-touchpoints AI error:", resp.status, t);
      // Devolve o body do Google direto pro caller. Ajuda muito a debugar
      // problemas de billing/quota/key sem precisar ir nos logs.
      return new Response(
        JSON.stringify({
          error: "Falha ao chamar IA de visão",
          gemini_status: resp.status,
          gemini_body: t.slice(0, 2000),
        }),
        {
          status: resp.status === 429 ? 429 : 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const data = await resp.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) {
      return new Response(
        JSON.stringify({ products: [], reason: "IA não retornou estrutura esperada" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(call.function.arguments);
    } catch (e) {
      console.error("Parse error:", e, call.function.arguments);
      return new Response(JSON.stringify({ products: [], reason: "JSON inválido da IA" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const raw: any[] = Array.isArray(parsed.products) ? parsed.products : [];
    const validated = raw
      .map(validateProduct)
      .filter((p): p is DetectedProduct => p !== null)
      .filter((p) => p.confidence >= CONFIDENCE_THRESHOLD)
      .slice(0, MAX_PRODUCTS);

    return new Response(
      JSON.stringify({
        products: validated,
        total_requested: knownProducts.length,
        total_detected: validated.length,
        confidence_threshold: CONFIDENCE_THRESHOLD,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("detect-touchpoints error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
