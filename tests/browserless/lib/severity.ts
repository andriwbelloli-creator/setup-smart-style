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
export type Category =
  | "frontend" | "backend" | "supabase" | "ai" | "product_matching"
  | "tracking" | "visual" | "content" | "security" | "performance";

export type QAError = {
  id: string;
  step: string;
  message: string;
  severity: Severity;
  category: Category;
  screenshot: string;
  log_excerpt?: string;
  probable_cause?: string;
  suggested_owner: Owner;
  auto_fix_allowed: boolean;
  auto_fix_reason: string;
};

/** Catálogo de erros conhecidos — facilita classificação consistente. */
type ErrorRule = {
  step: string;
  severity: Severity;
  category: Category;
  suggested_owner: Owner;
  /** Se Claude Code pode corrigir sem revisão humana */
  auto_fix_allowed: boolean;
  /** Justificativa pro auto_fix_allowed (vai pro auto-fix-report) */
  auto_fix_reason: string;
  describe: (detail?: string) => string;
};

export const ERRORS: Record<string, ErrorRule> = {
  // === CRITICAL ===
  app_not_opened: {
    step: "page_loaded", severity: "critical", category: "frontend",
    suggested_owner: "claude_code", auto_fix_allowed: false,
    auto_fix_reason: "App não abrir geralmente indica config/deploy quebrado — exige revisão humana",
    describe: (d) => `App não carregou: ${d || "timeout no navigate"}`,
  },
  login_failed: {
    step: "login", severity: "critical", category: "security",
    suggested_owner: "supabase", auto_fix_allowed: false,
    auto_fix_reason: "Auth é segurança crítica — nunca auto-fix",
    describe: (d) => `Login falhou: ${d || "auth flow quebrado"}`,
  },
  upload_failed: {
    step: "upload_image", severity: "critical", category: "frontend",
    suggested_owner: "browserless", auto_fix_allowed: true,
    auto_fix_reason: "Selector pode ter mudado — ajustar uploadTestImage é seguro",
    describe: (d) => `Upload não funcionou: ${d || "input file não encontrado"}`,
  },
  analysis_not_started: {
    step: "analysis_started", severity: "critical", category: "frontend",
    suggested_owner: "claude_code", auto_fix_allowed: true,
    auto_fix_reason: "Geralmente loading state ausente — fix de UI seguro",
    describe: (d) => `Análise não iniciou após upload: ${d || ""}`,
  },
  analysis_never_returned: {
    step: "analysis_completed", severity: "critical", category: "backend",
    suggested_owner: "supabase", auto_fix_allowed: false,
    auto_fix_reason: "Edge function lenta/quebrada exige investigação manual de logs",
    describe: (d) => `Análise não retornou em 90s: ${d || ""}`,
  },
  edge_function_500: {
    step: "edge_function", severity: "critical", category: "backend",
    suggested_owner: "supabase", auto_fix_allowed: false,
    auto_fix_reason: "500 pode indicar problema de dados/RLS/env — não auto-fix",
    describe: (d) => `Edge function retornou 500: ${d || ""}`,
  },
  result_screen_broken: {
    step: "result_render", severity: "critical", category: "frontend",
    suggested_owner: "claude_code", auto_fix_allowed: true,
    auto_fix_reason: "JSX/parse error em frontend é fix isolado e seguro",
    describe: (d) => `Tela de resultado quebrou: ${d || "JSX/dados inválidos"}`,
  },
  ai_generated_link: {
    step: "no_ai_generated_links", severity: "critical", category: "security",
    suggested_owner: "claude_code", auto_fix_allowed: false,
    auto_fix_reason: "Risco de segurança — IA inventando link exige revisão manual",
    describe: (d) => `IA gerou hyperlink (deveria vir do Supabase): ${d || ""}`,
  },
  open_redirect_risk: {
    step: "no_ai_generated_links", severity: "critical", category: "security",
    suggested_owner: "claude_code", auto_fix_allowed: false,
    auto_fix_reason: "Open redirect é vulnerabilidade — exige revisão humana",
    describe: (d) => `Frontend força destination_url arbitrária: ${d || ""}`,
  },

  // === HIGH ===
  score_missing: {
    step: "score_visible", severity: "high", category: "frontend",
    suggested_owner: "claude_code", auto_fix_allowed: true,
    auto_fix_reason: "Render de score é fix isolado",
    describe: (d) => `Score geral não aparece: ${d || ""}`,
  },
  category_scores_missing: {
    step: "category_scores_visible", severity: "high", category: "frontend",
    suggested_owner: "claude_code", auto_fix_allowed: true,
    auto_fix_reason: "Render de scores é fix isolado",
    describe: (d) => `Scores por categoria ausentes: ${d || ""}`,
  },
  touchpoints_missing: {
    step: "touchpoints_visible", severity: "high", category: "ai",
    suggested_owner: "claude_quality", auto_fix_allowed: false,
    auto_fix_reason: "Rules engine vazia exige análise manual da regra",
    describe: (d) => `Touchpoints não aparecem: ${d || ""}`,
  },
  touchpoint_no_evidence: {
    step: "touchpoints_have_visual_evidence", severity: "high", category: "ai",
    suggested_owner: "claude_quality", auto_fix_allowed: false,
    auto_fix_reason: "IA pode estar inventando — revisar rule + prompt",
    describe: (d) => `Touchpoint sem evidência visual: ${d || ""}`,
  },
  touchpoint_no_pir: {
    step: "touchpoints_have_problem_impact_recommendation", severity: "high", category: "ai",
    suggested_owner: "claude_quality", auto_fix_allowed: false,
    auto_fix_reason: "Rule incompleta exige revisão de prompt/template",
    describe: (d) => `Touchpoint sem problema/impacto/recomendação: ${d || ""}`,
  },
  products_missing_when_expected: {
    step: "products_visible_when_available", severity: "high", category: "product_matching",
    suggested_owner: "supabase", auto_fix_allowed: false,
    auto_fix_reason: "Catálogo vazio exige seed manual",
    describe: (d) => `Produtos esperados mas não apareceram: ${d || ""}`,
  },
  ver_produto_btn_broken: {
    step: "product_buttons_visible", severity: "high", category: "frontend",
    suggested_owner: "claude_code", auto_fix_allowed: true,
    auto_fix_reason: "Handler de click é fix isolado",
    describe: (d) => `Botão Ver produto não funciona: ${d || ""}`,
  },
  tracking_failed: {
    step: "product_click_tracking_worked", severity: "high", category: "tracking",
    suggested_owner: "supabase", auto_fix_allowed: false,
    auto_fix_reason: "Tracking quebrado exige verificar edge function + RLS",
    describe: (d) => `track-product-click falhou: ${d || ""}`,
  },
  affiliate_url_not_prioritized: {
    step: "affiliate_links_from_supabase", severity: "high", category: "product_matching",
    suggested_owner: "claude_code", auto_fix_allowed: true,
    auto_fix_reason: "Lógica de resolveUrl é fix de uma função isolada",
    describe: (d) => `affiliate_url não tem prioridade sobre product_url: ${d || ""}`,
  },
  inactive_product_shown: {
    step: "product_buttons_visible", severity: "high", category: "product_matching",
    suggested_owner: "claude_code", auto_fix_allowed: true,
    auto_fix_reason: "Filter .eq('active', true) ausente em productMatchingService",
    describe: (d) => `Produto inativo aparece: ${d || ""}`,
  },
  mobile_flow_broken: {
    step: "mobile_layout_ok", severity: "high", category: "frontend",
    suggested_owner: "claude_code", auto_fix_allowed: true,
    auto_fix_reason: "Responsividade quebrada é fix de Tailwind class isolado",
    describe: (d) => `Mobile quebra fluxo principal: ${d || ""}`,
  },

  // === MEDIUM ===
  layout_misaligned: {
    step: "desktop_layout_ok", severity: "medium", category: "visual",
    suggested_owner: "gemini_vision", auto_fix_allowed: true,
    auto_fix_reason: "Ajuste de spacing/grid é fix de CSS isolado",
    describe: (d) => `Layout desalinhado: ${d || ""}`,
  },
  text_truncated: {
    step: "desktop_layout_ok", severity: "medium", category: "visual",
    suggested_owner: "gemini_vision", auto_fix_allowed: true,
    auto_fix_reason: "Truncation é fix de CSS overflow isolado",
    describe: (d) => `Texto cortado: ${d || ""}`,
  },
  mobile_layout_broken: {
    step: "mobile_layout_ok", severity: "medium", category: "visual",
    suggested_owner: "gemini_vision", auto_fix_allowed: true,
    auto_fix_reason: "Mobile layout fix via Tailwind breakpoints é seguro",
    describe: (d) => `Mobile layout problema: ${d || ""}`,
  },
  loading_confusing: {
    step: "loading_visible", severity: "medium", category: "content",
    suggested_owner: "claude_quality", auto_fix_allowed: true,
    auto_fix_reason: "Copy de loading state é fix isolado",
    describe: (d) => `Loading state confuso: ${d || ""}`,
  },
  product_missing_reason: {
    step: "products_visible_when_available", severity: "medium", category: "content",
    suggested_owner: "claude_quality", auto_fix_allowed: false,
    auto_fix_reason: "Reason vem de Claude — exige reprompt",
    describe: (d) => `Produto aparece sem reason: ${d || ""}`,
  },

  // === LOW ===
  copy_unclear: {
    step: "copy", severity: "low", category: "content",
    suggested_owner: "claude_quality", auto_fix_allowed: true,
    auto_fix_reason: "Copy refinement é fix de string isolado",
    describe: (d) => `Copy pouco clara: ${d || ""}`,
  },
  visual_polish: {
    step: "visual", severity: "low", category: "visual",
    suggested_owner: "gemini_vision", auto_fix_allowed: true,
    auto_fix_reason: "Polish visual é fix isolado de CSS",
    describe: (d) => `Pequeno ajuste visual: ${d || ""}`,
  },
};

/** Gerador simples de ID curto (16 chars) pra rastrear erro entre runs */
function shortId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36).slice(-8);
}

/** Constrói QAError a partir de uma chave do catálogo. */
export function buildError(
  key: keyof typeof ERRORS,
  detail?: string,
  opts: { screenshot?: string; log_excerpt?: string; probable_cause?: string } = {},
): QAError {
  const rule = ERRORS[key];
  return {
    id: shortId(),
    step: rule.step,
    message: rule.describe(detail),
    severity: rule.severity,
    category: rule.category,
    screenshot: opts.screenshot ?? "tests/artifacts/error-state.png",
    log_excerpt: opts.log_excerpt,
    probable_cause: opts.probable_cause,
    suggested_owner: rule.suggested_owner,
    auto_fix_allowed: rule.auto_fix_allowed,
    auto_fix_reason: rule.auto_fix_reason,
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
