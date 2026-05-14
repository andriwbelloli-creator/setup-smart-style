// HOOK pra avaliação de qualidade do diagnóstico com Claude.
//
// Recebe o JSON final da análise (do endpoint analyze-homeoffice-image)
// e retorna avaliação de qualidade: touchpoints inventados, prioridades
// fracas, recomendações comerciais forçadas.
//
// Pré-requisito: ANTHROPIC_API_KEY no ambiente.

export type QualityReport = {
  quality_score: number;
  invalid_touchpoints: Array<{
    touchpoint: string;
    reason: string;
    severity: "critical" | "high" | "medium" | "low";
  }>;
  weak_touchpoints: string[];
  strong_touchpoints: string[];
  recommended_changes: string[];
};

const SYSTEM = `Analise este resultado do HomeOffice.life como QA de qualidade de diagnóstico. Verifique se cada touchpoint tem evidência visual, se algum touchpoint parece inventado, se a prioridade faz sentido, se a recomendação resolve o problema, se o perfil profissional foi considerado, se o texto parece consultivo e confiável, e se há risco de recomendação comercial forçada. Retorne apenas JSON válido no formato:
{
  "quality_score": 0,
  "invalid_touchpoints": [
    {
      "touchpoint": "",
      "reason": "",
      "severity": "critical | high | medium | low"
    }
  ],
  "weak_touchpoints": [],
  "strong_touchpoints": [],
  "recommended_changes": []
}`;

export async function evaluateAnalysis(analysisJson: unknown): Promise<QualityReport | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("[claude-quality] ANTHROPIC_API_KEY não configurada — skip");
    return null;
  }

  const model = process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6";
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1500,
      temperature: 0.2,
      system: SYSTEM,
      messages: [
        { role: "user", content: `Resultado pra avaliar:\n\n${JSON.stringify(analysisJson, null, 2)}` },
      ],
    }),
  });

  if (!r.ok) {
    console.warn("[claude-quality] HTTP", r.status, await r.text());
    return null;
  }
  const data = await r.json();
  let txt = data.content?.[0]?.text || "{}";
  txt = txt.trim();
  if (txt.startsWith("```")) txt = txt.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  try {
    return JSON.parse(txt) as QualityReport;
  } catch (e) {
    console.warn("[claude-quality] JSON parse falhou:", e);
    return null;
  }
}
