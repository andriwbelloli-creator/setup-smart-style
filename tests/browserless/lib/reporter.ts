// Reporter — gera qa-result.json no schema exigido + summary humano-legível.

import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { sortBySeverity, type QAError } from "./severity";

export type QAChecks = {
  app_opened: boolean;
  login_worked: boolean;
  upload_worked: boolean;
  analysis_started: boolean;
  loading_visible: boolean;
  analysis_returned: boolean;
  score_visible: boolean;
  category_scores_visible: boolean;
  touchpoints_visible: boolean;
  touchpoints_have_visual_evidence: boolean;
  touchpoints_have_problem_impact_recommendation: boolean;
  products_visible_when_available: boolean;
  product_buttons_visible: boolean;
  product_click_tracking_worked: boolean;
  desktop_layout_ok: boolean;
  mobile_layout_ok: boolean;
};

export type QAResult = {
  status: "passed" | "failed";
  timestamp: string;
  attempt: number;
  max_attempts: number;
  app_base_url: string;
  errors: QAError[];
  checks: QAChecks;
  screenshots: {
    desktop_result: string;
    mobile_result: string;
    error_state: string;
  };
  summary: string;
};

/** Estado inicial — todos os checks otimistas (true), erros pegam isso pra false. */
export function emptyChecks(): QAChecks {
  return {
    app_opened: false,
    login_worked: true, // assume optional login worked (vira false se tentou e falhou)
    upload_worked: false,
    analysis_started: false,
    loading_visible: false,
    analysis_returned: false,
    score_visible: false,
    category_scores_visible: false,
    touchpoints_visible: false,
    touchpoints_have_visual_evidence: false,
    touchpoints_have_problem_impact_recommendation: false,
    products_visible_when_available: true,    // default true (pode não ter produto, ok)
    product_buttons_visible: true,            // idem
    product_click_tracking_worked: true,      // idem
    desktop_layout_ok: true,
    mobile_layout_ok: true,
  };
}

export function buildSummary(checks: QAChecks, errors: QAError[]): string {
  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.values(checks).length;
  const errCounts = {
    critical: errors.filter((e) => e.severity === "critical").length,
    high: errors.filter((e) => e.severity === "high").length,
    medium: errors.filter((e) => e.severity === "medium").length,
    low: errors.filter((e) => e.severity === "low").length,
  };
  const total_errors = errors.length;
  if (total_errors === 0) {
    return `✅ ${passed}/${total} checks passaram. Sem erros.`;
  }
  return `${passed}/${total} checks passaram. ` +
    `${total_errors} erros (${errCounts.critical} critical, ${errCounts.high} high, ` +
    `${errCounts.medium} medium, ${errCounts.low} low). ` +
    `Priorizar: ${errCounts.critical > 0 ? "critical" : errCounts.high > 0 ? "high" : errCounts.medium > 0 ? "medium" : "low"}.`;
}

export async function writeResult(opts: {
  attempt: number;
  maxAttempts: number;
  appBaseUrl: string;
  checks: QAChecks;
  errors: QAError[];
  screenshots: { desktop: string; mobile: string; error: string };
  outputPath: string;
}): Promise<QAResult> {
  const status: "passed" | "failed" = opts.errors.length === 0 ? "passed" : "failed";
  const result: QAResult = {
    status,
    timestamp: new Date().toISOString(),
    attempt: opts.attempt,
    max_attempts: opts.maxAttempts,
    app_base_url: opts.appBaseUrl,
    errors: sortBySeverity(opts.errors),
    checks: opts.checks,
    screenshots: {
      desktop_result: opts.screenshots.desktop,
      mobile_result: opts.screenshots.mobile,
      error_state: opts.screenshots.error,
    },
    summary: buildSummary(opts.checks, opts.errors),
  };
  await writeFile(
    resolve(process.cwd(), opts.outputPath),
    JSON.stringify(result, null, 2),
    "utf-8",
  );
  return result;
}
