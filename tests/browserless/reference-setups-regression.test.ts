/**
 * QA de regressão semanal — itera sobre os 30 setups de referência em
 * tests/fixtures/reference-setups.json e valida que a rules engine
 * gera os touchpoints esperados (via qa-touchpoints-run edge function).
 *
 * Este teste NÃO usa Browserless — chama direto a edge function
 * qa-touchpoints-run que já existe no projeto e roda os fixtures pela
 * pipeline real.
 *
 * Pré-requisito: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY no env.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { generateRunId } from "./lib/reporter";

type ReferenceSetup = {
  id: string;
  name: string;
  profile_type: string;
  visual_description: string;
  expected_problems: string[];
  recommended_touchpoints: string[];
  not_recommended_touchpoints: string[];
  commercial_categories: string[];
  improvement_priority: string;
  main_purchase_intent: string;
  suggested_partners: string[];
};

type SetupResult = {
  setup_id: string;
  setup_name: string;
  expected_count: number;
  matched_count: number;
  missing: string[];
  unexpected: string[];
  coverage_pct: number;
};

async function main(): Promise<number> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const cronSecret = process.env.CRON_SECRET;

  if (!supabaseUrl) {
    console.error("[FATAL] SUPABASE_URL não configurada");
    return 2;
  }

  await mkdir(resolve(process.cwd(), "tests/artifacts"), { recursive: true });

  const fixturePath = resolve(process.cwd(), "tests/fixtures/reference-setups.json");
  const fixtures = JSON.parse(await readFile(fixturePath, "utf-8")) as { setups: ReferenceSetup[] };
  console.log(`[INFO] Regressão sobre ${fixtures.setups.length} setups de referência`);

  // Aqui não usamos Browserless — chamamos a edge function
  // qa-touchpoints-run que já tem a infra de scoring contra fixtures.
  // (Esta edge function precisa estar deployada e ter as fixtures espelhadas
  // em touchpoint_qa_fixtures no Supabase.)

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cronSecret) headers["x-cron-secret"] = cronSecret;
  else if (serviceKey) headers["Authorization"] = `Bearer ${serviceKey}`;

  const r = await fetch(`${supabaseUrl}/functions/v1/qa-touchpoints-run`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  if (!r.ok) {
    console.error("[FAIL] qa-touchpoints-run:", r.status, await r.text());
    console.error("[INFO] Possíveis causas: edge function não deployada, CRON_SECRET ausente, fixtures não populadas");
    return 1;
  }

  const data = await r.json();
  console.log("[OK] qa-touchpoints-run executou:", data.ran, "fixtures");

  // Persiste resumo
  const summary = {
    run_id: generateRunId(),
    timestamp: new Date().toISOString(),
    mode: "regression",
    fixtures_total: fixtures.setups.length,
    fixtures_ran: data.ran || 0,
    results: data.results || [],
    average_score: (data.results || []).reduce((s: number, r: any) => s + (r.score || 0), 0) / Math.max(1, (data.results || []).length),
  };

  await writeFile(
    resolve(process.cwd(), "tests/artifacts/regression-result.json"),
    JSON.stringify(summary, null, 2),
    "utf-8",
  );

  console.log(`[OK] Score médio: ${summary.average_score.toFixed(2)}`);
  console.log(`[OK] Resultado salvo: tests/artifacts/regression-result.json`);

  // Falha se score médio < 70 (threshold)
  if (summary.average_score < 70 && summary.fixtures_ran > 0) {
    console.error("[FAIL] Score médio abaixo do threshold de 70 — drift detectado");
    return 1;
  }
  return 0;
}

main().then((code) => process.exit(code)).catch((e) => {
  console.error("[FATAL]", e);
  process.exit(2);
});
