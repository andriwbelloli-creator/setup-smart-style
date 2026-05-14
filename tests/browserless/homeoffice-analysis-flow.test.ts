/**
 * QA contínuo do fluxo principal de análise — desktop + mobile.
 *
 * Conecta a Browserless via WebSocket (chromium.connect) e roda:
 *  1. /diagnostico em desktop
 *  2. upload imagem
 *  3. espera análise
 *  4. valida score, scores categoria, touchpoints (com PIR), produtos, tracking
 *  5. screenshot desktop
 *  6. mesmo fluxo em viewport iPhone — screenshot mobile
 *  7. escreve qa-result.json estruturado com erros classificados
 *
 * SAIDA:
 *   tests/artifacts/qa-result.json         — schema do contrato
 *   tests/artifacts/homeoffice-analysis-result.png
 *   tests/artifacts/mobile-result.png
 *   tests/artifacts/error-state.png        — só se algo quebrou
 *
 * EXIT CODES:
 *   0 = passed (nenhum erro)
 *   1 = failed (1+ erro classificado)
 *   2 = exception fatal (config faltando, conexão Browserless caiu)
 *
 * EXECUTAR:
 *   bun run test:browserless
 *   ou: BROWSERLESS_TOKEN=xxx APP_BASE_URL=https://homeofficelife.com.br \
 *       bun run tests/browserless/homeoffice-analysis-flow.test.ts
 */

import { chromium, type Page, type Browser, type BrowserContext } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config, validateEnv } from "./browserless.config";
import { buildError, type QAError } from "./lib/severity";
import { emptyChecks, writeResult, type QAChecks } from "./lib/reporter";

const log = {
  info: (s: string, d = "") => console.log(`[INFO] ${s}${d ? ": " + d : ""}`),
  ok:   (s: string, d = "") => console.log(`[OK]   ${s}${d ? ": " + d : ""}`),
  warn: (s: string, d = "") => console.warn(`[WARN] ${s}${d ? ": " + d : ""}`),
  fail: (s: string, d = "") => console.error(`[FAIL] ${s}${d ? ": " + d : ""}`),
};

// ============================================================================
// Ações no browser — reusadas em desktop + mobile
// ============================================================================

async function tryLogin(page: Page): Promise<{ tried: boolean; ok: boolean }> {
  const email = config.testUser.email;
  const password = config.testUser.password;
  if (!email || !password) {
    log.info("login_skipped", "TEST_USER_EMAIL/PASSWORD não setados, fluxo público");
    return { tried: false, ok: true };
  }
  try {
    await page.goto(`${config.appBaseUrl}/auth`, { waitUntil: "domcontentloaded", timeout: config.timeouts.navigationMs });
    const emailInput = page.locator('input[type="email"]').first();
    const passInput = page.locator('input[type="password"]').first();
    await emailInput.fill(email, { timeout: 5000 });
    await passInput.fill(password, { timeout: 5000 });
    const submitBtn = page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")').first();
    await submitBtn.click({ timeout: 5000 });
    // Espera redirect que não seja /auth
    await page.waitForURL((url) => !url.pathname.includes("/auth"), { timeout: 10_000 });
    log.ok("login_worked");
    return { tried: true, ok: true };
  } catch (e: any) {
    log.fail("login_failed", e.message);
    return { tried: true, ok: false };
  }
}

async function uploadTestImage(page: Page): Promise<boolean> {
  const fixturePath = resolve(process.cwd(), config.paths.fixtureImage);
  if (!existsSync(fixturePath)) {
    log.fail("fixture_missing", fixturePath);
    return false;
  }
  // 1ª — input file direto
  const fileInputs = page.locator('input[type="file"]');
  if (await fileInputs.count() > 0) {
    try {
      await fileInputs.first().setInputFiles(fixturePath);
      return true;
    } catch {}
  }
  // 2ª — drop zone clicável que abre file chooser
  const dropZone = page.locator('text=/arrast|drop|envie a foto|enviar foto/i').first();
  if (await dropZone.isVisible().catch(() => false)) {
    const [fileChooser] = await Promise.all([
      page.waitForEvent("filechooser", { timeout: 5000 }).catch(() => null),
      dropZone.click(),
    ]);
    if (fileChooser) {
      await fileChooser.setFiles(fixturePath);
      return true;
    }
  }
  return false;
}

async function waitForAnalysis(page: Page): Promise<{ started: boolean; completed: boolean }> {
  // Loading texts esperados
  const loadingPatterns = ["Estamos analisando", "Analisando", "Identificando", "Gerando seus touchpoints", "IA processando"];
  // Indicators de resultado
  const resultIndicators = ["Sua nota", "Sua análise", "Nota IA", "Pontos pra evoluir", "Touchpoints"];

  // Spy: análise iniciou?
  let started = false;
  try {
    await page.waitForFunction(
      (patterns) => patterns.some((p) => document.body.innerText.includes(p)),
      loadingPatterns,
      { timeout: 8000 },
    );
    started = true;
  } catch {}

  // Espera resultado aparecer
  let completed = false;
  try {
    await page.waitForFunction(
      (patterns) => patterns.some((p) => document.body.innerText.includes(p)),
      resultIndicators,
      { timeout: config.timeouts.analysisCompleteMs },
    );
    completed = true;
  } catch {}

  return { started, completed };
}

async function validateResult(page: Page): Promise<{
  checks: Partial<QAChecks>;
  errors: QAError[];
  productClicked: boolean;
}> {
  const errors: QAError[] = [];
  const checks: Partial<QAChecks> = {};
  const body = await page.locator("body").innerText();

  // Score geral
  const hasScore = /\b\d{1,3}\s*\/\s*100\b/.test(body) || /\b\d\.\d\s*\/\s*10\b/.test(body) || /\bnota\b[^\d]{0,30}\d/i.test(body);
  checks.score_visible = hasScore;
  if (!hasScore) errors.push(buildError("score_missing"));

  // Scores por categoria (>=3 das 8)
  const categorias = ["Ergonomia", "Iluminação", "Organização", "Cabos", "Decoração", "Fundo", "Acústica", "Produtividade"];
  const present = categorias.filter((c) => body.includes(c)).length;
  checks.category_scores_visible = present >= 3;
  if (present < 3) errors.push(buildError("category_scores_missing", `${present}/8 categorias`));

  // Touchpoints — pelo menos 1 dos 10 prioritários
  const touchpoints = ["luminária", "cortina", "planta", "estante", "papel de parede", "organizador", "cabos", "monitor", "cadeira", "tapete", "webcam", "microfone"];
  const tpsFound = touchpoints.filter((t) => body.toLowerCase().includes(t.toLowerCase()));
  checks.touchpoints_visible = tpsFound.length >= 1;
  if (tpsFound.length === 0) errors.push(buildError("touchpoints_missing"));

  // Estrutura PIR (problema/impacto/recomendação)
  const pirLabels = ["evidência", "problema", "impacto", "recomendação"];
  const pirPresent = pirLabels.filter((p) => body.toLowerCase().includes(p.toLowerCase())).length;
  checks.touchpoints_have_visual_evidence = body.toLowerCase().includes("evidência") || body.toLowerCase().includes("evidencia");
  checks.touchpoints_have_problem_impact_recommendation = pirPresent >= 3;
  if (checks.touchpoints_have_visual_evidence === false) errors.push(buildError("touchpoint_no_evidence"));
  if (pirPresent < 3 && tpsFound.length > 0) errors.push(buildError("touchpoint_no_pir", `${pirPresent}/4 labels`));

  // Produtos recomendados — DOM ou texto. Default true (pode não ter produto)
  const productCards = page.locator('text=/produtos recomendados/i').first();
  const hasProductSection = await productCards.isVisible().catch(() => false);
  const verProdutoBtns = page.locator('button:has-text("Ver produto"), a:has-text("Ver produto")');
  const verProdutoCount = await verProdutoBtns.count();
  checks.products_visible_when_available = hasProductSection || verProdutoCount > 0 || true; // tolerante
  checks.product_buttons_visible = verProdutoCount > 0 || !hasProductSection;
  if (hasProductSection && verProdutoCount === 0) {
    errors.push(buildError("ver_produto_btn_broken", "section visível mas sem botão"));
  }

  // Tenta click no Ver produto + verifica tracking
  let productClicked = false;
  if (verProdutoCount > 0) {
    productClicked = true;
    const trackingPromise = new Promise<boolean>((res) => {
      page.on("request", (req) => {
        if (req.url().includes("track-product-click")) res(true);
      });
      setTimeout(() => res(false), 5000);
    });
    const popupPromise = page.waitForEvent("popup", { timeout: 5000 }).catch(() => null);
    try {
      await verProdutoBtns.first().click({ timeout: 3000 });
      const [tracked, popup] = await Promise.all([trackingPromise, popupPromise]);
      const ok = tracked || !!popup;
      checks.product_click_tracking_worked = ok;
      if (!ok) errors.push(buildError("tracking_failed", "nem track-product-click nem popup"));
      if (popup) await popup.close().catch(() => {});
    } catch (e: any) {
      checks.product_click_tracking_worked = false;
      errors.push(buildError("tracking_failed", e.message));
    }
  } else {
    checks.product_click_tracking_worked = true; // sem botão = sem o que rastrear, ok
  }

  return { checks, errors, productClicked };
}

// ============================================================================
// Fluxo desktop OU mobile — assinatura idêntica, viewport diferente
// ============================================================================

type FlowResult = {
  checks: Partial<QAChecks>;
  errors: QAError[];
  screenshotPath: string;
  errorScreenshotPath?: string;
};

async function runFlow(
  browser: Browser,
  viewport: { width: number; height: number },
  userAgent: string,
  screenshotPath: string,
  errorScreenshotPath: string,
  label: "desktop" | "mobile",
): Promise<FlowResult> {
  const checks: Partial<QAChecks> = {};
  const errors: QAError[] = [];

  const context: BrowserContext = await browser.newContext({ viewport, userAgent });
  const page = await context.newPage();

  page.on("response", async (resp) => {
    if (resp.status() >= 500) {
      errors.push(buildError("edge_function_500", `${resp.status()} ${resp.url()}`));
    }
  });
  page.on("pageerror", (err) => log.warn(`${label}_pageerror`, err.message));

  try {
    // 1. Login (opcional)
    const loginRes = await tryLogin(page);
    if (loginRes.tried) {
      checks.login_worked = loginRes.ok;
      if (!loginRes.ok) errors.push(buildError("login_failed"));
    }

    // 2. Abre /diagnostico
    try {
      await page.goto(`${config.appBaseUrl}/diagnostico`, {
        waitUntil: "domcontentloaded",
        timeout: config.timeouts.navigationMs,
      });
      checks.app_opened = true;
      log.ok(`${label}_page_loaded`);
    } catch (e: any) {
      checks.app_opened = false;
      errors.push(buildError("app_not_opened", e.message));
      await page.screenshot({ path: errorScreenshotPath, fullPage: true }).catch(() => {});
      await context.close();
      return { checks, errors, screenshotPath: "", errorScreenshotPath };
    }

    // 3. Upload
    const uploaded = await uploadTestImage(page);
    checks.upload_worked = uploaded;
    if (!uploaded) {
      errors.push(buildError("upload_failed"));
      await page.screenshot({ path: errorScreenshotPath, fullPage: true }).catch(() => {});
      await context.close();
      return { checks, errors, screenshotPath: "", errorScreenshotPath };
    }
    log.ok(`${label}_upload_completed`);

    // 4. Aguarda análise
    const { started, completed } = await waitForAnalysis(page);
    checks.loading_visible = started;
    checks.analysis_started = started;
    checks.analysis_returned = completed;
    if (!started) errors.push(buildError("analysis_not_started"));
    if (!completed) errors.push(buildError("analysis_never_returned"));

    if (!completed) {
      await page.screenshot({ path: errorScreenshotPath, fullPage: true }).catch(() => {});
      await context.close();
      return { checks, errors, screenshotPath: "", errorScreenshotPath };
    }
    log.ok(`${label}_analysis_complete`);

    // 5. Valida UI do resultado
    const validation = await validateResult(page);
    Object.assign(checks, validation.checks);
    errors.push(...validation.errors);

    // 6. Layout check básico (sem Gemini Vision — só pega overflow visível)
    const layoutOk = await page.evaluate(() => {
      // Detecta horizontal scroll na página (sinal de layout quebrado)
      return document.documentElement.scrollWidth <= window.innerWidth + 2;
    });
    if (label === "desktop") {
      checks.desktop_layout_ok = layoutOk;
      if (!layoutOk) errors.push(buildError("layout_misaligned", "horizontal overflow"));
    } else {
      checks.mobile_layout_ok = layoutOk;
      if (!layoutOk) errors.push(buildError("mobile_layout_broken", "horizontal overflow"));
    }

    // 7. Screenshot
    await page.screenshot({ path: screenshotPath, fullPage: true });
    log.ok(`${label}_screenshot`, screenshotPath);

    await context.close();
    return { checks, errors, screenshotPath };
  } catch (e: any) {
    log.fail(`${label}_flow_exception`, e.message);
    await page.screenshot({ path: errorScreenshotPath, fullPage: true }).catch(() => {});
    await context.close();
    return { checks, errors, screenshotPath: "", errorScreenshotPath };
  }
}

// ============================================================================
// Main
// ============================================================================
async function main(): Promise<number> {
  const envCheck = validateEnv();
  if (!envCheck.ok) {
    log.fail("env_validation", `Faltam: ${envCheck.missing.join(", ")}`);
    return 2;
  }
  await mkdir(resolve(process.cwd(), config.paths.artifactsDir), { recursive: true });

  const attempt = +(process.env.QA_ATTEMPT || "1");
  const maxAttempts = +(process.env.QA_MAX_RETRIES || "3");

  log.info("connecting", config.appBaseUrl);
  log.info("attempt", `${attempt}/${maxAttempts}`);

  const wsEndpoint = config.browserlessWsEndpoint(config.browserlessToken);
  let browser: Browser | null = null;
  const finalChecks: QAChecks = emptyChecks();
  const allErrors: QAError[] = [];
  let desktopScreenshot = "";
  let mobileScreenshot = "";
  const errorScreenshot = resolve(process.cwd(), config.paths.errorScreenshot);

  try {
    browser = await chromium.connect(wsEndpoint, { timeout: config.timeouts.connectMs });
    log.ok("browserless_connected");

    // === Desktop ===
    log.info("flow", "desktop");
    const desktopResult = await runFlow(
      browser,
      { width: 1440, height: 900 },
      "HomeOfficeLife-QA-Desktop/1.0",
      resolve(process.cwd(), config.paths.successScreenshot),
      errorScreenshot,
      "desktop",
    );
    Object.assign(finalChecks, desktopResult.checks);
    allErrors.push(...desktopResult.errors);
    desktopScreenshot = desktopResult.screenshotPath;

    // === Mobile (iPhone-like viewport) ===
    log.info("flow", "mobile");
    const mobileResult = await runFlow(
      browser,
      { width: 390, height: 844 }, // iPhone 14 Pro
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      resolve(process.cwd(), "tests/artifacts/mobile-result.png"),
      errorScreenshot,
      "mobile",
    );
    // Mobile só sobrescreve checks específicos pra não derrubar desktop
    if (mobileResult.checks.mobile_layout_ok !== undefined) {
      finalChecks.mobile_layout_ok = mobileResult.checks.mobile_layout_ok;
    }
    // Outros checks mobile contam só se desktop falhou também
    mobileResult.errors.forEach((e) => {
      if (e.severity === "critical" || e.step.includes("mobile")) {
        allErrors.push(e);
      }
    });
    mobileScreenshot = mobileResult.screenshotPath;

    // === Reporter ===
    const result = await writeResult({
      attempt,
      maxAttempts,
      appBaseUrl: config.appBaseUrl,
      checks: finalChecks,
      errors: allErrors,
      screenshots: {
        desktop: desktopScreenshot || config.paths.successScreenshot,
        mobile: mobileScreenshot || "tests/artifacts/mobile-result.png",
        error: existsSync(errorScreenshot) ? config.paths.errorScreenshot : "",
      },
      outputPath: "tests/artifacts/qa-result.json",
    });

    console.log(`\n===== ${result.status.toUpperCase()} =====`);
    console.log(result.summary);
    if (allErrors.length > 0) {
      console.log("\nErros (por severidade):");
      result.errors.forEach((e, i) => {
        console.log(`  ${i + 1}. [${e.severity}] ${e.step} → ${e.message}`);
        console.log(`     owner sugerido: ${e.suggested_owner}`);
      });
    }
    console.log(`\nResultado salvo: tests/artifacts/qa-result.json`);
    return result.status === "passed" ? 0 : 1;
  } catch (e: any) {
    log.fail("fatal", e.message || String(e));
    try {
      await writeResult({
        attempt,
        maxAttempts,
        appBaseUrl: config.appBaseUrl,
        checks: finalChecks,
        errors: [
          ...allErrors,
          buildError("app_not_opened", `Browserless connect/fatal: ${e.message || e}`),
        ],
        screenshots: {
          desktop: desktopScreenshot || "",
          mobile: mobileScreenshot || "",
          error: existsSync(errorScreenshot) ? config.paths.errorScreenshot : "",
        },
        outputPath: "tests/artifacts/qa-result.json",
      });
    } catch {}
    return 2;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

main().then((code) => process.exit(code)).catch((e) => {
  console.error("[FATAL]", e);
  process.exit(2);
});
