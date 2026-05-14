// analyze-homeoffice-image
//
// Orquestra: Gemini Vision (detecção objetiva) → motor de regras → (Claude
// premium, Fase 2). Salva resultado em `analyses` + `touchpoints`.
//
// Body:
//   { image_url: string, analysis_type?: "free"|"premium", profile_type?: ProfileType }
//
// Resposta:
//   { analysis_id, overall_score, scores, touchpoints_recomendados,
//     touchpoints_nao_recomendados, observacoes_objetivas, meta }
//
// VARIÁVEIS DE AMBIENTE:
//   GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   ANTHROPIC_API_KEY (opcional — só usado se analysis_type=premium)
//
// HOOK PRO PRODUCT MATCHING (Fase 2 do plano "para depois"):
//   Cada touchpoint já vem com `partners: string[]` (slugs) e
//   `commercial_category`. O productMatchingService futuro lê isso e
//   anexa `recommended_products[]` antes de devolver ao frontend.

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { applyRules, type GeminiSignals, type ProfileType } from "../_shared/touchpoint-rules.ts";
import { matchProducts, normalizeTouchpointKey, type MatchedProduct } from "../_shared/product-matching.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VALID_PROFILES: ProfileType[] = [
  "geral", "dev", "designer", "advogado", "medico", "psicologo",
  "professor", "autonomo", "consultor", "criador", "executivo",
];

const GEMINI_PROMPT = `Você é um avaliador visual de ambientes de home office. Analise a imagem enviada de forma objetiva. Não invente elementos que não estejam visíveis. Retorne apenas JSON válido. Avalie a presença de objetos, sinais visuais, possíveis problemas e scores iniciais. Se algo não estiver visível, marque como false ou reduza a confiança. Não gere recomendações comerciais nesta etapa. Apenas detecte elementos e sinais visuais.`;

// Schema strict pra forçar Gemini a devolver exatamente o shape que o motor de regras espera.
const GEMINI_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    elementos_detectados: {
      type: "object",
      properties: {
        mesa: { type: "boolean" }, cadeira: { type: "boolean" }, monitor: { type: "boolean" },
        notebook: { type: "boolean" }, teclado: { type: "boolean" }, mouse: { type: "boolean" },
        suporte_notebook: { type: "boolean" }, luminaria: { type: "boolean" },
        janela: { type: "boolean" }, cortina: { type: "boolean" }, planta: { type: "boolean" },
        estante: { type: "boolean" }, prateleira: { type: "boolean" },
        papel_de_parede: { type: "boolean" }, quadros: { type: "boolean" },
        tapete: { type: "boolean" }, cabos_visiveis: { type: "boolean" },
        dock_ou_hub: { type: "boolean" }, webcam: { type: "boolean" },
        microfone: { type: "boolean" }, parede_vazia: { type: "boolean" },
        objetos_decorativos: { type: "boolean" },
      },
      required: [
        "mesa", "cadeira", "monitor", "notebook", "teclado", "mouse", "suporte_notebook",
        "luminaria", "janela", "cortina", "planta", "estante", "prateleira",
        "papel_de_parede", "quadros", "tapete", "cabos_visiveis", "dock_ou_hub",
        "webcam", "microfone", "parede_vazia", "objetos_decorativos",
      ],
    },
    sinais_visuais: {
      type: "object",
      properties: {
        pouca_iluminacao: { type: "boolean" }, excesso_de_luz: { type: "boolean" },
        possivel_reflexo_na_tela: { type: "boolean" }, mesa_desorganizada: { type: "boolean" },
        cabos_aparentes: { type: "boolean" }, fundo_vazio: { type: "boolean" },
        fundo_poluito: { type: "boolean" },
        setup_frio_sem_elementos_naturais: { type: "boolean" },
        falta_de_armazenamento: { type: "boolean" },
        possivel_baixa_ergonomia: { type: "boolean" },
        ambiente_com_pouca_personalidade: { type: "boolean" },
        cenario_pouco_profissional: { type: "boolean" },
        risco_de_ruido_visual: { type: "boolean" },
        possivel_problema_acustico: { type: "boolean" },
      },
      required: [
        "pouca_iluminacao", "excesso_de_luz", "possivel_reflexo_na_tela",
        "mesa_desorganizada", "cabos_aparentes", "fundo_vazio", "fundo_poluito",
        "setup_frio_sem_elementos_naturais", "falta_de_armazenamento",
        "possivel_baixa_ergonomia", "ambiente_com_pouca_personalidade",
        "cenario_pouco_profissional", "risco_de_ruido_visual",
        "possivel_problema_acustico",
      ],
    },
    scores_iniciais: {
      type: "object",
      properties: {
        ergonomia: { type: "number" }, iluminacao: { type: "number" },
        organizacao: { type: "number" }, gestao_de_cabos: { type: "number" },
        decoracao: { type: "number" }, fundo_para_video: { type: "number" },
        acustica_provavel: { type: "number" }, produtividade: { type: "number" },
      },
      required: [
        "ergonomia", "iluminacao", "organizacao", "gestao_de_cabos",
        "decoracao", "fundo_para_video", "acustica_provavel", "produtividade",
      ],
    },
    observacoes_objetivas: { type: "array", items: { type: "string" } },
    nivel_confianca_geral: { type: "number" },
  },
  required: [
    "elementos_detectados", "sinais_visuais", "scores_iniciais",
    "observacoes_objetivas", "nivel_confianca_geral",
  ],
};

function extractUserId(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  try {
    const [, b64] = authHeader.slice(7).split(".");
    return JSON.parse(atob(b64.replace(/-/g, "+").replace(/_/g, "/"))).sub || null;
  } catch {
    return null;
  }
}

async function fetchImageBase64(url: string): Promise<string> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Falha ao baixar imagem (HTTP ${r.status})`);
  const buf = new Uint8Array(await r.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i += 8192) bin += String.fromCharCode(...buf.slice(i, i + 8192));
  return btoa(bin);
}

async function callGeminiVision(imageB64: string, apiKey: string): Promise<GeminiSignals> {
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
            { text: GEMINI_PROMPT },
          ],
        }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: GEMINI_RESPONSE_SCHEMA,
        },
      }),
    },
  );
  if (!r.ok) throw new Error(`Gemini HTTP ${r.status}: ${await r.text()}`);
  const data = await r.json();
  const txt = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const parsed = JSON.parse(txt);
  if (
    !parsed.elementos_detectados || !parsed.sinais_visuais ||
    !parsed.scores_iniciais || !Array.isArray(parsed.observacoes_objetivas)
  ) {
    throw new Error("Resposta do Gemini com schema inválido");
  }
  return parsed as GeminiSignals;
}

// Claude premium — análise consultiva. Só roda quando analysis_type=premium
// e ANTHROPIC_API_KEY tá configurada. Falha gracefully: análise free sempre
// passa, premium degrada pra free se Claude estiver fora.

const CLAUDE_SYSTEM = `Você é um consultor especialista em ergonomia, decoração, produtividade e ambientes profissionais de home office. Com base nos sinais visuais detectados e nos touchpoints já definidos pelo motor de regras, gere uma análise premium, humana e consultiva. Não adicione novos touchpoints sem evidência. Organize o plano de ação por prioridade, impacto e investimento. Adapte a linguagem ao perfil profissional informado. Retorne apenas JSON válido, sem markdown ou comentários.`;

const CLAUDE_OUTPUT_HINT = `{
  "resumo_consultivo": "string — 2 a 3 frases empáticas falando do estado geral do setup",
  "diagnostico_geral": "string — explicação consultiva do que está bom e do que precisa evoluir",
  "principais_forcas": ["string"],
  "principais_problemas": ["string"],
  "plano_de_acao": [
    {
      "ordem": 1,
      "acao": "string",
      "motivo": "string",
      "impacto_esperado": "string",
      "investimento_estimado": "string",
      "prioridade": "high | medium | low"
    }
  ],
  "recomendacao_por_perfil": "string",
  "mensagem_final": "string"
}`;

async function callClaudePremium(
  signals: GeminiSignals,
  rules: ReturnType<typeof applyRules>,
  profile: ProfileType,
  apiKey: string,
): Promise<any> {
  const userPrompt = `PERFIL PROFISSIONAL: ${profile}

SINAIS DETECTADOS PELA IA VISUAL:
${JSON.stringify(signals, null, 2)}

TOUCHPOINTS GERADOS PELO MOTOR DE REGRAS (NÃO adicione novos, só refine):
${JSON.stringify(rules, null, 2)}

Tarefa: produza uma análise premium, consultiva e humana NO FORMATO EXATO abaixo. Use linguagem adaptada ao perfil ${profile}. Ordene o plano de ação por prioridade (high → medium → low) e dentro de cada bloco por impacto/custo.

Formato de retorno (responda APENAS com este JSON):
${CLAUDE_OUTPUT_HINT}`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      temperature: 0.4,
      system: CLAUDE_SYSTEM,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!r.ok) throw new Error(`Claude HTTP ${r.status}: ${await r.text()}`);
  const data = await r.json();
  const text = data.content?.[0]?.text || "";

  // Claude às vezes mete um ```json antes/depois apesar do prompt. Extrai.
  let raw = text.trim();
  if (raw.startsWith("```")) raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  const parsed = JSON.parse(raw);
  if (
    typeof parsed.resumo_consultivo !== "string" ||
    !Array.isArray(parsed.plano_de_acao)
  ) {
    throw new Error("Claude retornou JSON com schema inválido");
  }
  return parsed;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const t0 = Date.now();
  try {
    const userId = extractUserId(req.headers.get("authorization"));
    if (!userId) {
      return new Response(JSON.stringify({ error: "Login obrigatório" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const imageUrl: string | undefined = body.image_url;
    const analysisType: "free" | "premium" = body.analysis_type === "premium" ? "premium" : "free";
    const profileType: ProfileType = VALID_PROFILES.includes(body.profile_type) ? body.profile_type : "geral";

    if (!imageUrl || typeof imageUrl !== "string") {
      return new Response(JSON.stringify({ error: "image_url obrigatório" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY não configurada" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    // Cria registro inicial em processing
    const { data: analysisRow, error: insertErr } = await admin
      .from("analyses")
      .insert({
        user_id: userId,
        image_url: imageUrl,
        status: "processing",
        analysis_type: analysisType,
        profile_type: profileType,
      })
      .select()
      .single();
    if (insertErr || !analysisRow) {
      console.error("insert analyses:", insertErr);
      return new Response(JSON.stringify({ error: "Falha ao criar análise" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const analysisId = analysisRow.id;

    try {
      // 1. Gemini
      const imageB64 = await fetchImageBase64(imageUrl);
      const geminiResult = await callGeminiVision(imageB64, geminiKey);

      // 2. Motor de regras
      const rulesResult = applyRules(geminiResult, profileType);

      // 3. Claude premium (gate: tipo + key disponível + flag premium do usuário)
      let claudeResult: any = null;
      let claudeFailed = false;
      if (analysisType === "premium") {
        const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

        // Verifica gate de premium ativo (defesa em profundidade — front
        // também checa, mas backend é a fonte de verdade)
        const { data: limits } = await admin
          .from("user_analysis_limits")
          .select("premium_active, premium_expires_at")
          .eq("user_id", userId)
          .maybeSingle();
        const premiumOk = limits?.premium_active === true &&
          (!limits.premium_expires_at || new Date(limits.premium_expires_at) > new Date());

        if (!anthropicKey) {
          console.warn("premium pedido mas ANTHROPIC_API_KEY não configurada");
          claudeFailed = true;
        } else if (!premiumOk) {
          console.warn(`premium pedido mas user ${userId} sem premium_active`);
          claudeFailed = true;
        } else {
          try {
            claudeResult = await callClaudePremium(geminiResult, rulesResult, profileType, anthropicKey);
          } catch (claudeErr) {
            console.warn("Claude premium falhou, degrada pra free:", claudeErr);
            claudeFailed = true;
          }
        }
      }

      // 4. Product Matching — anexa produtos reais do catálogo a cada touchpoint
      //    recomendado. Nada de URL inventada — tudo vem da tabela recommended_products.
      const touchpointsComProdutos = await Promise.all(
        rulesResult.recommended.map(async (t) => {
          try {
            const products = await matchProducts(admin, {
              touchpoint_key: normalizeTouchpointKey(t.item),
              profile_type: profileType,
              commercial_category: t.commercial_category,
              priority: t.priority,
            });
            return { ...t, recommended_products: products };
          } catch (matchErr) {
            console.warn(`matchProducts(${t.item}):`, matchErr);
            return { ...t, recommended_products: [] as MatchedProduct[] };
          }
        }),
      );

      const scores = rulesResult.weighted_scores;
      const finalResult = {
        overall_score: scores.overall,
        scores,
        touchpoints_recomendados: touchpointsComProdutos,
        touchpoints_nao_recomendados: rulesResult.not_recommended,
        observacoes_objetivas: geminiResult.observacoes_objetivas,
        nivel_confianca_geral: geminiResult.nivel_confianca_geral,
        claude_result: claudeResult,
        claude_failed: claudeFailed,
        analysis_type: analysisType,
      };

      // 4. Update analysis + insert touchpoints em lote
      await admin
        .from("analyses")
        .update({
          status: "completed",
          overall_score: scores.overall,
          ergonomics_score: scores.ergonomia,
          lighting_score: scores.iluminacao,
          organization_score: scores.organizacao,
          cable_management_score: scores.gestao_de_cabos,
          decoration_score: scores.decoracao,
          video_background_score: scores.fundo_para_video,
          acoustic_score: scores.acustica_provavel,
          productivity_score: scores.produtividade,
          gemini_raw_result: geminiResult,
          rules_result: rulesResult,
          claude_result: claudeResult,
          final_result: finalResult,
          duration_ms: Date.now() - t0,
        })
        .eq("id", analysisId);

      const touchpointRows = [
        ...rulesResult.recommended.map((t) => ({
          analysis_id: analysisId,
          category: t.category,
          item: t.item,
          commercial_category: t.commercial_category,
          visual_evidence: t.visual_evidence,
          problem: t.problem,
          impact: t.impact,
          recommendation: t.recommendation,
          priority: t.priority,
          confidence: t.confidence,
          estimated_budget: t.estimated_budget,
          partners: t.partners,
          is_recommended: true,
        })),
        ...rulesResult.not_recommended.map((t) => ({
          analysis_id: analysisId,
          category: "not_recommended",
          item: t.item,
          commercial_category: null,
          visual_evidence: "",
          problem: "",
          impact: "",
          recommendation: "",
          priority: "low" as const,
          confidence: 0,
          estimated_budget: null,
          partners: [],
          is_recommended: false,
          not_recommended_reason: t.reason,
        })),
      ];
      if (touchpointRows.length > 0) {
        await admin.from("touchpoints").insert(touchpointRows);
      }

      // Atualiza limites se free: ler valor atual + incrementar atômico via upsert.
      // Race condition possível em uploads concorrentes do mesmo user — aceitável
      // pra contador de free analyses (no pior caso, conta 1 a menos).
      if (analysisType === "free") {
        const { data: cur } = await admin
          .from("user_analysis_limits")
          .select("free_analyses_used")
          .eq("user_id", userId)
          .maybeSingle();
        const next = (cur?.free_analyses_used ?? 0) + 1;
        await admin
          .from("user_analysis_limits")
          .upsert({ user_id: userId, free_analyses_used: next }, { onConflict: "user_id" });
      }

      return new Response(JSON.stringify({
        analysis_id: analysisId,
        ...finalResult,
        meta: { total_ms: Date.now() - t0 },
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } catch (innerErr: any) {
      console.error("analyze inner:", innerErr);
      await admin
        .from("analyses")
        .update({ status: "failed", error_message: innerErr.message || String(innerErr) })
        .eq("id", analysisId);
      return new Response(JSON.stringify({
        error: "Análise falhou",
        details: innerErr.message,
        analysis_id: analysisId,
      }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  } catch (e: any) {
    console.error("analyze-homeoffice-image:", e);
    return new Response(JSON.stringify({ error: e.message || String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
