import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Rate limit: 30 análises por hora por usuário (proteção contra abuso/scraping).
// O frontend tem limite mensal por tier (1/mês free, ilimitado premium), mas
// alguém pode criar conta premium e tentar floodar pra raspar dados ou queimar
// crédito Gemini. 30/hora deixa uso humano legítimo passar com folga.
const RATE_LIMIT_PER_HOUR = 30;

function extractUserId(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  try {
    const token = authHeader.slice(7);
    const [, payloadB64] = token.split(".");
    const payload = JSON.parse(
      atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")),
    );
    return payload.sub || null;
  } catch {
    return null;
  }
}

async function checkRateLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SERVICE_ROLE) return { allowed: true, remaining: RATE_LIMIT_PER_HOUR };
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const url = `${SUPABASE_URL}/rest/v1/ai_analyses?select=id&owner_id=eq.${userId}&created_at=gte.${since}`;
  const r = await fetch(url, {
    headers: {
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
      Prefer: "count=exact",
      Range: "0-0",
    },
  });
  const contentRange = r.headers.get("content-range") || "";
  const total = parseInt(contentRange.split("/").pop() || "0", 10) || 0;
  return { allowed: total < RATE_LIMIT_PER_HOUR, remaining: Math.max(0, RATE_LIMIT_PER_HOUR - total) };
}

const SYSTEM_PROMPT = `Você é um especialista brasileiro em ergonomia, iluminação, conforto, produtividade e estética de home offices. Avalie a foto por 10 critérios objetivos: ergonomia, iluminação, gestão de cabos, organização visual, estética, produtividade, conforto, profissionalismo em vídeo (calls/lives), aproveitamento de espaço e custo-benefício. Seja direto, técnico e prático. Use linguagem do dia a dia. Foque em melhorias acessíveis no Brasil (Amazon BR, Mercado Livre, Kabum, Magalu, Tok&Stok).`;

const TOOL = {
  type: "function",
  function: {
    name: "rate_setup",
    description: "Devolve a avaliação completa do home office em JSON com 10 critérios.",
    parameters: {
      type: "object",
      properties: {
        scores: {
          type: "object",
          properties: {
            ergonomia: { type: "number", description: "0 a 10" },
            iluminacao: { type: "number" },
            cabos: { type: "number" },
            organizacao: { type: "number" },
            estetica: { type: "number" },
            produtividade: { type: "number" },
            conforto: { type: "number", description: "Apoio lombar, altura cadeira, conforto pra jornada longa." },
            video_profissional: { type: "number", description: "Profissionalismo em calls/lives — fundo, câmera, áudio, luz frontal." },
            aproveitamento_espaco: { type: "number", description: "Quanto do espaço disponível está bem usado, sem desperdício." },
            custo_beneficio: { type: "number", description: "Equilíbrio entre o que foi investido e a qualidade do setup." },
          },
          required: [
            "ergonomia", "iluminacao", "cabos", "organizacao", "estetica", "produtividade",
            "conforto", "video_profissional", "aproveitamento_espaco", "custo_beneficio",
          ],
          additionalProperties: false,
        },
        tips: {
          type: "array",
          minItems: 3,
          maxItems: 10,
          items: {
            type: "object",
            properties: {
              category: {
                type: "string",
                enum: [
                  "ergonomia", "iluminacao", "cabos", "organizacao", "estetica", "produtividade",
                  "conforto", "video_profissional", "aproveitamento_espaco", "custo_beneficio",
                ],
              },
              severity: { type: "string", enum: ["baixa", "media", "alta"] },
              text: { type: "string", description: "Sugestão prática em 1-2 frases, com produto e faixa de preço em R$ quando aplicável." },
            },
            required: ["category", "severity", "text"],
            additionalProperties: false,
          },
        },
        summary: { type: "string", description: "Resumo de 1 frase do setup." },
      },
      required: ["scores", "tips", "summary"],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Rate limiting por usuário (JWT já validado pelo Supabase em config.toml)
    const userId = extractUserId(req.headers.get("authorization"));
    if (userId) {
      const { allowed, remaining } = await checkRateLimit(userId);
      if (!allowed) {
        return new Response(
          JSON.stringify({
            error: `Limite de ${RATE_LIMIT_PER_HOUR} análises por hora atingido. Tente daqui a pouco.`,
          }),
          {
            status: 429,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
              "X-RateLimit-Limit": String(RATE_LIMIT_PER_HOUR),
              "X-RateLimit-Remaining": "0",
              "Retry-After": "3600",
            },
          },
        );
      }
    }

    const { imageUrl, imageBase64 } = await req.json();
    if (!imageUrl && !imageBase64) {
      return new Response(JSON.stringify({ error: "imageUrl ou imageBase64 é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageContent = imageUrl
      ? { type: "image_url", image_url: { url: imageUrl } }
      : { type: "image_url", image_url: { url: imageBase64 } };

    const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Avalie este home office. Use a função rate_setup." },
              imageContent,
            ],
          },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "rate_setup" } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402 || resp.status === 403) {
        return new Response(JSON.stringify({ error: "Créditos/quota da Gemini API esgotados ou chave inválida." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await resp.text();
      console.error("AI gateway error:", resp.status, t);
      return new Response(JSON.stringify({ error: "Falha ao chamar IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) {
      return new Response(JSON.stringify({ error: "IA não retornou estrutura esperada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const args = JSON.parse(call.function.arguments);
    const scoresArr = Object.values(args.scores) as number[];
    const overall = +(scoresArr.reduce((a, b) => a + b, 0) / scoresArr.length).toFixed(1);

    return new Response(JSON.stringify({ ...args, overall }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-setup error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});