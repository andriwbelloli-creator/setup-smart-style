import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `Você é um especialista brasileiro em ergonomia, iluminação e estética de home offices. Avalie a foto enviada por critérios objetivos. Seja direto, técnico e prático. Use linguagem do dia a dia. Foque em melhorias acessíveis no Brasil (Amazon BR, Mercado Livre, Kabum, Magalu).`;

const TOOL = {
  type: "function",
  function: {
    name: "rate_setup",
    description: "Devolve a avaliação completa do home office em JSON.",
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
          },
          required: ["ergonomia", "iluminacao", "cabos", "organizacao", "estetica", "produtividade"],
          additionalProperties: false,
        },
        tips: {
          type: "array",
          minItems: 3,
          maxItems: 6,
          items: {
            type: "object",
            properties: {
              category: { type: "string", enum: ["ergonomia", "iluminacao", "cabos", "organizacao", "estetica", "produtividade"] },
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
        model: "gemini-2.5-flash",
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