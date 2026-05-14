/**
 * QA contínuo do fluxo principal de análise de home office.
 *
 * Roda em browser REMOTO via Browserless (não requer Chrome local).
 * Conecta via WebSocket usando Playwright Core.
 *
 * EXECUTAR:
 *   BROWSERLESS_TOKEN=xxx APP_BASE_URL=https://homeofficelife.com.br \
 *     bun run tests/browserless/homeoffice-analysis-flow.test.ts
 *
 * SAIDAS:
 *   tests/artifacts/homeoffice-analysis-result.png — sucesso
 *   tests/artifacts/error-state.png — falha
 *   exit code 0 = OK, 1 = falha em alguma asserção
 */

import { chromium, type Page, type Browser } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { config, validateEnv } from "./browserless.config";

// ============================================================================
// Logger estruturado — todo passo vira linha [LEVEL] step: detail
// ============================================================================
const log = {
  info: (step: string, detail = "") => console.log(`[INFO] ${step}${detail ? ": " + detail : ""}`),
  ok: (step: string, detail = "") => console.log(`[OK]   ${step}${detail ? ": " + detail : ""}`),
  warn: (step: string, detail = "") => console.warn(`[WARN] ${step}${detail ? ": " + detail : ""}`),
  fail: (step: string, detail = "") => console.error(`[FAIL] ${step}${detail ? ": " + detail : ""}`),
};

// ============================================================================
// Asserções suaves — não param o teste, só registram. Ao final, conta-se fails.
// ============================================================================
const results: { name: string; ok: boolean; detail?: string }[] = [];
function check(name: string, condition: boolean, detail?: string) {
  results.push({ name, ok: condition, detail });
  if (condition) log.ok(name, detail);
  else log.fail(name, detail);
}

// ============================================================================
// Ações no browser
// ============================================================================
async function uploadTestImage(page: Page): Promise<boolean> {
  // Procura input file ou label clicável — algumas UIs escondem o input
  // atrás de um clique no preview/drop zone.
  const fixturePath = resolve(process.cwd(), config.paths.fixtureImage);
  if (!existsSync(fixturePath)) {
    log.fail("upload_fixture_missing", fixturePath);
    return false;
  }

  // 1ª tentativa — input[type=file] direto (pode estar hidden)
  const fileInputs = page.locator('input[type="file"]');
  const count = await fileInputs.count();
  if (count > 0) {
    try {
      await fileInputs.first().setInputFiles(fixturePath);
      log.ok("upload_via_input", `${count} file inputs found, used first`);
      return true;
    } catch (e: any) {
      log.warn("upload_via_input_failed", e.message);
    }
  }

  // 2ª tentativa — clica em drop zone / botão de upload
  const dropZone = page.locator("text=/arrast|drop|upload|envie a foto|enviar foto/i").first();
  if (await dropZone.isVisible().catch(() => false)) {
    // Espera o file chooser aparecer ao clicar
    const [fileChooser] = await Promise.all([
      page.waitForEvent("filechooser", { timeout: 5000 }).catch(() => null),
      dropZone.click(),
    ]);
    if (fileChooser) {
      await fileChooser.setFiles(fixturePath);
      log.ok("upload_via_dropzone", "filechooser opened");
      return true;
    }
  }

  return false;
}

async function waitForAnalysisComplete(page: Page): Promise<boolean> {
  // Loading texts possíveis durante análise
  const loadingPatterns = [
    "Estamos analisando",
    "Analisando",
    "Gerando seus touchpoints",
    "Identificando iluminação",
    "IA processando",
  ];
  // Result indicators — algum desses precisa aparecer pra ser sucesso
  const resultIndicators = [
    "Sua nota",
    "Sua análise",
    "Nota IA",
    "score",
    "Pontos pra evoluir",
    "Touchpoints recomendados",
  ];

  log.info("await_analysis", "Esperando resultado aparecer (timeout 90s)");

  try {
    await page.waitForFunction(
      (patterns) => patterns.some((p) => document.body.innerText.includes(p)),
      resultIndicators,
      { timeout: config.timeouts.analysisCompleteMs },
    );
    log.ok("analysis_complete", "Indicator visível na DOM");
    return true;
  } catch {
    // Diagnose: ainda loading? ou nem começou?
    const stillLoading = await page.evaluate((patterns) =>
      patterns.some((p) => document.body.innerText.includes(p)),
      loadingPatterns,
    );
    log.fail("analysis_timeout", stillLoading ? "ainda em loading" : "nem começou");
    return false;
  }
}

async function validateResult(page: Page): Promise<void> {
  const body = await page.locator("body").innerText();

  // Score geral — número de 0-100 ou 0-10 perto de palavra "nota"
  const hasScore = /\bnota[^\d]{0,30}\d/i.test(body) || /\b\d{1,3}\s*\/\s*100\b/.test(body) || /\b\d\.\d\s*\/\s*10\b/.test(body);
  check("score_geral_visivel", hasScore);

  // Categorias de score — pelo menos 3 das 8
  const categorias = ["Ergonomia", "Iluminação", "Organização", "Cabos", "Decoração", "Fundo", "Acústica", "Produtividade"];
  const categoriasPresentes = categorias.filter((c) => body.includes(c)).length;
  check("scores_por_categoria", categoriasPresentes >= 3, `${categoriasPresentes}/8 categorias presentes`);

  // Cards de touchpoints — pelo menos 1 dos itens-chave
  const touchpoints = ["luminária", "cortina", "planta", "estante", "papel de parede", "organizador de cabos", "cabos", "monitor", "cadeira", "tapete", "quadro", "webcam", "microfone"];
  const touchpointsPresentes = touchpoints.filter((t) =>
    body.toLowerCase().includes(t.toLowerCase()),
  );
  check("touchpoints_visiveis", touchpointsPresentes.length >= 1, `${touchpointsPresentes.length} touchpoints: ${touchpointsPresentes.slice(0, 5).join(", ")}`);

  // Estrutura do card — evidência + problema + impacto + recomendação
  const cardStructure = ["evidência", "problema", "impacto", "recomendação"]
    .filter((label) => body.toLowerCase().includes(label.toLowerCase())).length;
  check("estrutura_card_touchpoint", cardStructure >= 2, `${cardStructure}/4 labels do card visíveis`);

  // Produtos recomendados — pelo menos texto ou card
  const hasProducts = body.toLowerCase().includes("produto") || body.toLowerCase().includes("recomendado");
  check("produtos_recomendados_section", hasProducts);

  // Botão "Ver produto" (não obrigatório — só se tem produto)
  const verProdutoBtn = page.locator('button:has-text("Ver produto"), a:has-text("Ver produto")');
  const verProdutoCount = await verProdutoBtn.count();
  if (verProdutoCount > 0) {
    check("ver_produto_btn_exists", true, `${verProdutoCount} botões "Ver produto"`);

    // Tenta clicar no primeiro e verifica se tracking foi chamado OU se abriu nova tab
    const trackingCalled = new Promise<boolean>((resolveTrack) => {
      page.on("request", (req) => {
        if (req.url().includes("track-product-click")) resolveTrack(true);
      });
      setTimeout(() => resolveTrack(false), 5000);
    });
    const popupPromise = page.waitForEvent("popup", { timeout: 5000 }).catch(() => null);

    try {
      await verProdutoBtn.first().click({ timeout: 3000 });
      const [tracked, popup] = await Promise.all([trackingCalled, popupPromise]);
      check("tracking_ou_redirect", tracked || !!popup,
        tracked ? "track-product-click chamado" : popup ? "popup aberto" : "nenhum dos dois");
      if (popup) await popup.close().catch(() => {});
    } catch (e: any) {
      log.warn("ver_produto_click_failed", e.message);
    }
  } else {
    log.info("ver_produto_skipped", "nenhum botão Ver produto encontrado (ok — pode não ter produto)");
  }
}

// ============================================================================
// Main flow
// ============================================================================
async function run(): Promise<number> {
  const envCheck = validateEnv();
  if (!envCheck.ok) {
    log.fail("env_validation", `Variáveis faltando: ${envCheck.missing.join(", ")}`);
    return 1;
  }

  // Garante artifacts dir
  await mkdir(resolve(process.cwd(), config.paths.artifactsDir), { recursive: true });

  log.info("connect_browserless", config.appBaseUrl);
  const wsEndpoint = config.browserlessWsEndpoint(config.browserlessToken);

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await chromium.connect(wsEndpoint, { timeout: config.timeouts.connectMs });
    log.ok("connect_browserless");

    const context = await browser.newContext({
      viewport: config.viewport,
      userAgent: "HomeOfficeLife-QA-Browserless/1.0",
    });
    page = await context.newPage();

    // Loga erros JS do browser pra debug
    page.on("pageerror", (err) => log.warn("browser_pageerror", err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") log.warn("browser_console_error", msg.text());
    });

    // 1. Abrir app (vai pra /diagnostico direto pra economizar passo)
    const targetUrl = `${config.appBaseUrl}/diagnostico`;
    await page.goto(targetUrl, { timeout: config.timeouts.navigationMs, waitUntil: "domcontentloaded" });
    check("page_loaded", true, targetUrl);

    // 2. Upload imagem
    const uploaded = await uploadTestImage(page);
    check("upload_completed", uploaded);

    if (!uploaded) {
      throw new Error("Falha no upload da imagem — abortando antes da análise");
    }

    // 3. Aguarda análise terminar
    const analyzed = await waitForAnalysisComplete(page);
    check("analysis_finished", analyzed);

    if (!analyzed) {
      throw new Error("Análise não completou no timeout");
    }

    // 4. Valida UI do resultado
    await validateResult(page);

    // 5. Screenshot de sucesso
    await page.screenshot({
      path: resolve(process.cwd(), config.paths.successScreenshot),
      fullPage: true,
    });
    log.ok("screenshot_success", config.paths.successScreenshot);

    // ========================================================================
    // Resumo final
    // ========================================================================
    const passed = results.filter((r) => r.ok).length;
    const failed = results.filter((r) => !r.ok).length;
    console.log(`\n===== RESUMO QA =====`);
    console.log(`Passou: ${passed} / Falhou: ${failed} / Total: ${results.length}`);
    if (failed > 0) {
      console.log(`\nFalhas:`);
      results.filter((r) => !r.ok).forEach((r) => console.log(`  - ${r.name}${r.detail ? ` (${r.detail})` : ""}`));
    }
    return failed > 0 ? 1 : 0;
  } catch (e: any) {
    log.fail("test_run_exception", e.message || String(e));
    if (page) {
      try {
        await page.screenshot({
          path: resolve(process.cwd(), config.paths.errorScreenshot),
          fullPage: true,
        });
        log.ok("screenshot_error", config.paths.errorScreenshot);
      } catch (sErr: any) {
        log.warn("screenshot_error_failed", sErr.message);
      }
    }
    return 1;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

// Bootstrap
run().then((code) => process.exit(code)).catch((e) => {
  console.error("[FATAL]", e);
  process.exit(2);
});
