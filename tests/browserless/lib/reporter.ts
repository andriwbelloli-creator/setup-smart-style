// Reporter — gera qa-result.json, qa-history.json (append-only) e
// auto-fix-report.json no schema completo do contrato.

import { writeFile, readFile, appendFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { sortBySeverity, type QAError } from "./severity";

export type QAMode = "smoke" | "full" | "regression" | "post_deploy";

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
  affiliate_links_from_supabase: boolean;
  no_ai_generated_links: boolean;
  desktop_layout_ok: boolean;
  mobile_layout_ok: boolean;
  error_state_ok: boolean;
};

export type QAResult = {
  status: "passed" | "failed";
  timestamp: string;
  run_id: string;
  mode: QAMode;
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

export function emptyChecks(): QAChecks {
  return {
    app_opened: false,
    login_worked: true,
    upload_worked: false,
    analysis_started: false,
    loading_visible: false,
    analysis_returned: false,
    score_visible: false,
    category_scores_visible: false,
    touchpoints_visible: false,
    touchpoints_have_visual_evidence: false,
    touchpoints_have_problem_impact_recommendation: false,
    products_visible_when_available: true,
    product_buttons_visible: true,
    product_click_tracking_worked: true,
    affiliate_links_from_supabase: true,
    no_ai_generated_links: true,
    desktop_layout_ok: true,
    mobile_layout_ok: true,
    error_state_ok: true,
  };
}

export function generateRunId(): string {
  return `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function buildSummary(checks: QAChecks, errors: QAError[]): string {
  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.values(checks).length;
  if (errors.length === 0) return `✅ ${passed}/${total} checks passaram.`;
  const c = errors.filter((e) => e.severity === "critical").length;
  const h = errors.filter((e) => e.severity === "high").length;
  const m = errors.filter((e) => e.severity === "medium").length;
  const l = errors.filter((e) => e.severity === "low").length;
  const fixable = errors.filter((e) => e.auto_fix_allowed).length;
  return `${passed}/${total} checks · ${errors.length} erros (${c}c/${h}h/${m}m/${l}l) · ${fixable} auto-fix candidates`;
}

export async function writeResult(opts: {
  attempt: number;
  maxAttempts: number;
  mode: QAMode;
  appBaseUrl: string;
  checks: QAChecks;
  errors: QAError[];
  screenshots: { desktop: string; mobile: string; error: string };
  outputPath?: string;
  runId?: string;
}): Promise<QAResult> {
  const status: "passed" | "failed" = opts.errors.length === 0 ? "passed" : "failed";
  const result: QAResult = {
    status,
    timestamp: new Date().toISOString(),
    run_id: opts.runId ?? generateRunId(),
    mode: opts.mode,
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
  const outPath = opts.outputPath ?? "tests/artifacts/qa-result.json";
  await writeFile(resolve(process.cwd(), outPath), JSON.stringify(result, null, 2), "utf-8");
  await appendToHistory(result);
  return result;
}

/** Mantém um log append-only dos últimos N runs em qa-history.json. */
const HISTORY_PATH = "tests/artifacts/qa-history.json";
const HISTORY_MAX = 100;

async function appendToHistory(result: QAResult): Promise<void> {
  const path = resolve(process.cwd(), HISTORY_PATH);
  let history: QAResult[] = [];
  if (existsSync(path)) {
    try {
      history = JSON.parse(await readFile(path, "utf-8"));
      if (!Array.isArray(history)) history = [];
    } catch {
      history = [];
    }
  }
  history.unshift(result);
  if (history.length > HISTORY_MAX) history = history.slice(0, HISTORY_MAX);
  await writeFile(path, JSON.stringify(history, null, 2), "utf-8");
}

// ============================================================================
// auto-fix-report.json — gerado pelo auto-fix-runner.ts
// ============================================================================

export type AutoFixStatus = "fixed" | "partially_fixed" | "failed" | "skipped";
export type RiskLevel = "low" | "medium" | "high";

export type AppliedFix = {
  error_id: string;
  severity: string;
  category: string;
  files_changed: string[];
  description: string;
  reason: string;
  risk_level: RiskLevel;
  tests_rerun: string[];
  result_after_fix: "passed" | "failed";
};

export type SkippedFix = {
  error_id: string;
  reason: string;
  requires_human_review: boolean;
};

export type AutoFixReport = {
  run_id: string;
  timestamp: string;
  status: AutoFixStatus;
  attempts: number;
  max_attempts: number;
  fixes_applied: AppliedFix[];
  skipped_fixes: SkippedFix[];
  remaining_errors: QAError[];
  final_recommendation: string;
};

export async function writeAutoFixReport(
  report: AutoFixReport,
  outputPath = "tests/artifacts/auto-fix-report.json",
): Promise<void> {
  await writeFile(
    resolve(process.cwd(), outputPath),
    JSON.stringify(report, null, 2),
    "utf-8",
  );
}

/** Lê o último qa-result.json pra alimentar o auto-fix-runner. */
export async function readLastResult(): Promise<QAResult | null> {
  const path = resolve(process.cwd(), "tests/artifacts/qa-result.json");
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(await readFile(path, "utf-8")) as QAResult;
  } catch {
    return null;
  }
}
