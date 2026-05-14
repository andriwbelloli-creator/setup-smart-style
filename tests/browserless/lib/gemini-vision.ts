// HOOK pra avaliação visual com Gemini Vision.
//
// Recebe screenshot do QA + retorna issues visuais classificados.
// Não invocado automaticamente pelo teste — chamar manualmente do CI/CD
// ou de um script separado se quiser análise visual deep.
//
// Pré-requisito: GEMINI_API_KEY no ambiente (mesma key do back).

import { readFile } from "node:fs/promises";

export type VisionIssue = {
  area: string;
  problem: string;
  severity: "critical" | "high" | "medium" | "low";
  suggested_fix: string;
};

export type VisionReport = {
  visual_score: number;
  issues: VisionIssue[];
  summary: string;
};

const PROMPT = `Analise este screenshot do HomeOffice.life como QA visual. Avalie layout quebrado, textos cortados, cards desalinhados, botões pouco visíveis, problemas mobile, hierarquia visual, clareza dos touchpoints, clareza dos produtos recomendados e excesso de informação. Retorne apenas JSON válido no formato:
{
  "visual_score": 0,
  "issues": [
    {
      "area": "",
      "problem": "",
      "severity": "critical | high | medium | low",
      "suggested_fix": ""
    }
  ],
  "summary": ""
}`;

const SCHEMA = {
  type: "object",
  properties: {
    visual_score: { type: "number" },
    issues: {
      type: "array",
      items: {
        type: "object",
        properties: {
          area: { type: "string" },
          problem: { type: "string" },
          severity: { type: "string" },
          suggested_fix: { type: "string" },
        },
        required: ["area", "problem", "severity", "suggested_fix"],
      },
    },
    summary: { type: "string" },
  },
  required: ["visual_score", "issues", "summary"],
};

export async function evaluateScreenshot(screenshotPath: string): Promise<VisionReport | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[gemini-vision] GEMINI_API_KEY não configurada — skip");
    return null;
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-pro";
  const buf = await readFile(screenshotPath);
  const b64 = buf.toString("base64");

  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { inline_data: { mime_type: "image/png", data: b64 } },
            { text: PROMPT },
          ],
        }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: SCHEMA,
        },
      }),
    },
  );

  if (!r.ok) {
    console.warn("[gemini-vision] HTTP", r.status, await r.text());
    return null;
  }
  const data = await r.json();
  const txt = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  try {
    return JSON.parse(txt) as VisionReport;
  } catch (e) {
    console.warn("[gemini-vision] JSON parse falhou:", e);
    return null;
  }
}
