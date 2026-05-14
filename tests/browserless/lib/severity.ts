// Classifica severidade e owner de cada erro encontrado no QA.
//
// Severidade segue regra clara — não interpretação subjetiva:
//   critical: app/análise não funciona (bloqueia produto)
//   high:     funcionalidade quebrada mas degrada (ainda usável)
//   medium:   visual ruim mas funcional (afeta UX)
//   low:      cosmetic
//
// Owner é a IA/ferramenta que deve atuar:
//   browserless    — selectors mudaram, drop zone diferente, timing issue
//   gemini_vision  — algo visualmente quebrado que precisa olho visual
//   claude_quality — touchpoint inventado, recomendação fraca, copy ruim
//   claude_code    — bug de código (TypeScript, lógica, integração)
//   supabase       — RLS, migration, edge function, env var

export type Severity = "critical" | "high" | "medium" | "low";
export type Owner = "browserless" | "gemini_vision" | "claude_quality" | "claude_code" | "supabase";

export type QAError = {
  step: string;
  message: string;
  screenshot: string;
  severity: Severity;
  suggested_owner: Owner;
};

/** Catálogo de erros conhecidos — facilita classificação consistente. */
type ErrorRule = {
  step: string;
  severity: Severity;
  suggested_owner: Owner;
  describe: (detail?: string) => string;
};

export const ERRORS: Record<string, ErrorRule> = {
  // === CRITICAL — bloqueiam o produto ===
  app_not_opened: {
    step: "page_loaded",
    severity: "critical",
    suggested_owner: "claude_code",
    describe: (d) => `App não carregou: ${d || "timeout no navigate"}`,
  },
  login_failed: {
    step: "login",
    severity: "critical",
    suggested_owner: "supabase",
    describe: (d) => `Login falhou: ${d || "auth flow quebrado"}`,
  },
  upload_failed: {
    step: "upload_image",
    severity: "critical",
    suggested_owner: "browserless",
    describe: (d) => `Upload não funcionou: ${d || "input file não encontrado"}`,
  },
  analysis_not_started: {
    step: "analysis_started",
    severity: "critical",
    suggested_owner: "claude_code",
    describe: (d) => `Análise não iniciou após upload: ${d || ""}`,
  },
  analysis_never_returned: {
    step: "analysis_completed",
    severity: "critical",
    suggested_owner: "supabase",
    describe: (d) => `Análise não retornou em 90s — edge function lenta/quebrada: ${d || ""}`,
  },
  edge_function_500: {
    step: "edge_function",
    severity: "critical",
    suggested_owner: "supabase",
    describe: (d) => `Edge function retornou 500: ${d || ""}`,
  },
  result_screen_broken: {
    step: "result_render",
    severity: "critical",
    suggested_owner: "claude_code",
    describe: (d) => `Tela de resultado quebrou: ${d || "JSX/dados inválidos"}`,
  },

  // === HIGH — degrada feature ===
  score_missing: {
    step: "score_visible",
    severity: "high",
    suggested_owner: "claude_code",
    describe: (d) => `Score geral não aparece: ${d || ""}`,
  },
  category_scores_missing: {
    step: "category_scores_visible",
    severity: "high",
    suggested_owner: "claude_code",
    describe: (d) => `Scores por categoria ausentes: ${d || ""}`,
  },
  touchpoints_missing: {
    step: "touchpoints_visible",
    severity: "high",
    suggested_owner: "claude_quality",
    describe: (d) => `Touchpoints não aparecem: ${d || ""}`,
  },
  touchpoint_no_evidence: {
    step: "touchpoints_have_visual_evidence",
    severity: "high",
    suggested_owner: "claude_quality",
    describe: (d) => `Touchpoint sem evidência visual: ${d || ""}`,
  },
  touchpoint_no_pir: {
    step: "touchpoints_have_problem_impact_recommendation",
    severity: "high",
    suggested_owner: "claude_quality",
    describe: (d) => `Touchpoint sem problema/impacto/recomendação: ${d || ""}`,
  },
  products_missing_when_expected: {
    step: "products_visible_when_available",
    severity: "high",
    suggested_owner: "supabase",
    describe: (d) => `Produtos esperados mas não apareceram: ${d || "seed table vazia ou matching falhou"}`,
  },
  ver_produto_btn_broken: {
    step: "product_buttons_visible",
    severity: "high",
    suggested_owner: "claude_code",
    describe: (d) => `Botão Ver produto não funciona: ${d || ""}`,
  },
  tracking_failed: {
    step: "product_click_tracking_worked",
    severity: "high",
    suggested_owner: "supabase",
    describe: (d) => `track-product-click falhou ou redirect inseguro: ${d || ""}`,
  },

  // === MEDIUM — UX afetada ===
  layout_misaligned: {
    step: "desktop_layout_ok",
    severity: "medium",
    suggested_owner: "gemini_vision",
    describe: (d) => `Layout desalinhado: ${d || ""}`,
  },
  text_truncated: {
    step: "desktop_layout_ok",
    severity: "medium",
    suggested_owner: "gemini_vision",
    describe: (d) => `Texto cortado: ${d || ""}`,
  },
  mobile_layout_broken: {
    step: "mobile_layout_ok",
    severity: "medium",
    suggested_owner: "gemini_vision",
    describe: (d) => `Mobile layout problema: ${d || ""}`,
  },
  loading_confusing: {
    step: "loading_visible",
    severity: "medium",
    suggested_owner: "claude_quality",
    describe: (d) => `Loading state confuso: ${d || ""}`,
  },

  // === LOW — cosmético ===
  copy_unclear: {
    step: "copy",
    severity: "low",
    suggested_owner: "claude_quality",
    describe: (d) => `Copy pouco clara: ${d || ""}`,
  },
  visual_polish: {
    step: "visual",
    severity: "low",
    suggested_owner: "gemini_vision",
    describe: (d) => `Pequeno ajuste visual: ${d || ""}`,
  },
};

/** Constrói QAError a partir de uma chave do catálogo. */
export function buildError(
  key: keyof typeof ERRORS,
  detail?: string,
  screenshot = "tests/artifacts/error-state.png",
): QAError {
  const rule = ERRORS[key];
  return {
    step: rule.step,
    message: rule.describe(detail),
    screenshot,
    severity: rule.severity,
    suggested_owner: rule.suggested_owner,
  };
}

/** Ordena erros por severidade (critical primeiro). */
const SEVERITY_ORDER: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 };
export function sortBySeverity(errors: QAError[]): QAError[] {
  return [...errors].sort((a, b) => SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity]);
}

/** Retorna se há ao menos um erro de severidade >= threshold. */
export function hasSeverityAtLeast(errors: QAError[], threshold: Severity): boolean {
  const min = SEVERITY_ORDER[threshold];
  return errors.some((e) => SEVERITY_ORDER[e.severity] >= min);
}
