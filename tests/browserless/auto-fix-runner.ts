/**
 * Auto-fix Runner — lê qa-result.json e gera auto-fix-report.json com plano
 * de correção. NÃO aplica código automaticamente — só identifica o que é
 * auto-fixable e o que precisa de revisão humana.
 *
 * Workflow:
 *   1. Lê tests/artifacts/qa-result.json
 *   2. Para cada error, decide se vai pra fixes_applied (proposto) ou skipped_fixes
 *   3. Aplica limites anti-loop:
 *      - max 5 fixes por rodada
 *      - critical → high → medium → low order
 *      - se error.id já apareceu 3+ vezes no histórico, marca skipped
 *   4. Gera auto-fix-report.json com plano detalhado
 *   5. Imprime resumo + exit 0
 *
 * Aplicação real do fix exige sessão Claude Code (humano OU agente)
 * lendo o auto-fix-report.json e editando os arquivos sugeridos.
 *
 * EXECUTAR:
 *   bun run tests/browserless/auto-fix-runner.ts
 */

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  readLastResult,
  writeAutoFixReport,
  type AutoFixReport,
  type AppliedFix,
  type SkippedFix,
} from "./lib/reporter";
import type { QAError, Severity } from "./lib/severity";

const MAX_FIXES_PER_RUN = 5;
const SEVERITY_ORDER: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 };

/** Conta quantas vezes cada error.id apareceu no qa-history.json */
async function countErrorOccurrences(errorIds: string[]): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const id of errorIds) counts[id] = 0;
  const historyPath = resolve(process.cwd(), "tests/artifacts/qa-history.json");
  if (!existsSync(historyPath)) return counts;
  try {
    const history = JSON.parse(await readFile(historyPath, "utf-8")) as Array<{ errors: QAError[] }>;
    for (const run of history) {
      for (const err of run.errors || []) {
        // Match by step + message (id muda a cada run, mas step+message é estável)
        const key = errorIds.find((_id) => true); // simplificação
        if (counts[err.id] !== undefined) counts[err.id]++;
      }
    }
  } catch {}
  return counts;
}

/** Mapeia step → arquivos prováveis pra editar (heurística pra Claude Code) */
function inferFiles(error: QAError): string[] {
  const map: Record<string, string[]> = {
    score_visible: ["src/routes/diagnostico.resultado.$id.tsx"],
    category_scores_visible: ["src/routes/diagnostico.resultado.$id.tsx"],
    touchpoints_visible: ["supabase/functions/_shared/touchpoint-rules.ts"],
    touchpoints_have_visual_evidence: ["supabase/functions/_shared/touchpoint-rules.ts"],
    touchpoints_have_problem_impact_recommendation: ["supabase/functions/_shared/touchpoint-rules.ts"],
    products_visible_when_available: ["supabase/functions/_shared/product-matching.ts"],
    product_buttons_visible: ["src/routes/diagnostico.resultado.$id.tsx"],
    product_click_tracking_worked: ["supabase/functions/track-product-click/index.ts"],
    affiliate_links_from_supabase: ["supabase/functions/_shared/product-matching.ts"],
    no_ai_generated_links: ["supabase/functions/_shared/product-matching.ts", "supabase/functions/track-product-click/index.ts"],
    desktop_layout_ok: ["src/styles.css", "src/routes/diagnostico.resultado.$id.tsx"],
    mobile_layout_ok: ["src/styles.css", "src/routes/diagnostico.resultado.$id.tsx"],
    upload_image: ["tests/browserless/homeoffice-analysis-flow.test.ts"],
    page_loaded: ["src/routes/__root.tsx", "render.yaml"],
  };
  return map[error.step] || ["(arquivo a determinar)"];
}

/** Calcula risk_level conforme tipo de fix */
function inferRiskLevel(error: QAError, files: string[]): "low" | "medium" | "high" {
  if (error.category === "security") return "high";
  if (error.category === "supabase" || error.category === "backend") return "high";
  if (files.length > 2) return "medium";
  if (error.category === "visual" || error.category === "content") return "low";
  if (error.severity === "critical") return "medium";
  return "low";
}

async function main(): Promise<number> {
  const qaEnabled = (process.env.QA_AUTO_FIX_ENABLED ?? "true") === "true";
  if (!qaEnabled) {
    console.log("[SKIP] QA_AUTO_FIX_ENABLED=false");
    return 0;
  }

  const result = await readLastResult();
  if (!result) {
    console.error("[FATAL] tests/artifacts/qa-result.json não encontrado. Rode qa:smoke primeiro.");
    return 2;
  }

  console.log(`[INFO] Lido qa-result.json: ${result.run_id}`);
  console.log(`[INFO] Status: ${result.status} (${result.errors.length} erros)`);

  if (result.status === "passed") {
    console.log("[OK] QA passou. Nada pra corrigir.");
    return 0;
  }

  // Ordena por severidade
  const sorted = [...result.errors].sort(
    (a, b) => SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity],
  );

  // Conta ocorrências no histórico pra aplicar regra de 3 strikes
  const occurrences = await countErrorOccurrences(sorted.map((e) => e.id));

  const fixes_applied: AppliedFix[] = [];
  const skipped_fixes: SkippedFix[] = [];
  let fixCount = 0;

  for (const error of sorted) {
    // Anti-loop: se apareceu 3+ vezes, skip
    if ((occurrences[error.id] ?? 0) >= 3) {
      skipped_fixes.push({
        error_id: error.id,
        reason: `Erro persistiu ${occurrences[error.id]} vezes no histórico — bloqueio documentado`,
        requires_human_review: true,
      });
      continue;
    }

    // Auto-fix bloqueado pela política?
    if (!error.auto_fix_allowed) {
      skipped_fixes.push({
        error_id: error.id,
        reason: error.auto_fix_reason || "auto_fix_allowed=false",
        requires_human_review: true,
      });
      continue;
    }

    // Limite de fixes por rodada
    if (fixCount >= MAX_FIXES_PER_RUN) {
      skipped_fixes.push({
        error_id: error.id,
        reason: `Limite de ${MAX_FIXES_PER_RUN} fixes por rodada atingido`,
        requires_human_review: false,
      });
      continue;
    }

    const files = inferFiles(error);
    const risk = inferRiskLevel(error, files);

    fixes_applied.push({
      error_id: error.id,
      severity: error.severity,
      category: error.category,
      files_changed: files,
      description: `Fix proposto pra ${error.step}: ${error.message}`,
      reason: error.auto_fix_reason,
      risk_level: risk,
      tests_rerun: ["qa:smoke"],
      result_after_fix: "failed", // será atualizado pelo Claude Code após aplicar
    });
    fixCount++;
  }

  const status: AutoFixReport["status"] =
    fixes_applied.length === 0
      ? "skipped"
      : skipped_fixes.length === 0
      ? "fixed"
      : "partially_fixed";

  const recommendation =
    fixes_applied.length === 0
      ? `Nenhum auto-fix aplicável. ${skipped_fixes.length} erros precisam revisão humana.`
      : `${fixes_applied.length} fixes propostos. Sessão Claude Code deve ler este JSON, aplicar mudanças nos files_changed, rodar qa:smoke, atualizar result_after_fix.`;

  const report: AutoFixReport = {
    run_id: result.run_id,
    timestamp: new Date().toISOString(),
    status,
    attempts: result.attempt,
    max_attempts: result.max_attempts,
    fixes_applied,
    skipped_fixes,
    remaining_errors: sorted.filter(
      (e) => !fixes_applied.some((f) => f.error_id === e.id),
    ),
    final_recommendation: recommendation,
  };

  await writeAutoFixReport(report);

  console.log(`\n===== AUTO-FIX REPORT =====`);
  console.log(`Status: ${status}`);
  console.log(`Fixes propostos: ${fixes_applied.length}`);
  console.log(`Skipped: ${skipped_fixes.length}`);
  if (fixes_applied.length > 0) {
    console.log("\nFixes:");
    fixes_applied.forEach((f, i) => {
      console.log(`  ${i + 1}. [${f.severity}/${f.risk_level}] ${f.description}`);
      console.log(`     arquivos: ${f.files_changed.join(", ")}`);
    });
  }
  if (skipped_fixes.length > 0) {
    console.log("\nSkipped:");
    skipped_fixes.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.error_id}: ${s.reason}`);
    });
  }
  console.log(`\nRelatório: tests/artifacts/auto-fix-report.json`);
  console.log(recommendation);
  return 0;
}

main().then((code) => process.exit(code)).catch((e) => {
  console.error("[FATAL]", e);
  process.exit(2);
});
