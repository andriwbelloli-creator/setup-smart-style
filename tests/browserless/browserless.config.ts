// Configuração compartilhada para testes Browserless
//
// Browserless é um navegador remoto headless. Conectamos via WebSocket
// usando Playwright (chromium.connect) — NÃO requer Chrome local.
//
// Não usa @playwright/test runner (é um script Node/Bun standalone),
// então a config é objeto exportado em vez de defineConfig().

export const config = {
  /** URL pública do app (Render preview ou prod). */
  appBaseUrl: process.env.APP_BASE_URL || "https://homeofficelife.com.br",

  /** Token Browserless — pegar em https://account.browserless.io */
  browserlessToken: process.env.BROWSERLESS_TOKEN || "",

  /** Endpoint WebSocket do Browserless cloud. Self-hosted muda o host. */
  browserlessWsEndpoint: (token: string) =>
    `wss://chrome.browserless.io/playwright?token=${token}&launch={"args":["--no-sandbox","--disable-dev-shm-usage"]}`,

  /** Credenciais de teste — opcional (fluxo público funciona sem login) */
  testUser: {
    email: process.env.TEST_USER_EMAIL || "",
    password: process.env.TEST_USER_PASSWORD || "",
  },

  /** Caminhos relativos à raiz do projeto */
  paths: {
    fixtureImage: "tests/fixtures/setup-test.jpg",
    artifactsDir: "tests/artifacts",
    successScreenshot: "tests/artifacts/homeoffice-analysis-result.png",
    errorScreenshot: "tests/artifacts/error-state.png",
  },

  /** Timeouts (ms) — Browserless cloud pode ser lento na 1ª conexão */
  timeouts: {
    connectMs: 30_000,
    navigationMs: 30_000,
    analysisCompleteMs: 90_000, // Gemini Vision pode levar ~30-60s
    selectorMs: 15_000,
  },

  /** Viewport padrão — desktop landscape */
  viewport: { width: 1440, height: 900 },
} as const;

export function validateEnv(): { ok: true } | { ok: false; missing: string[] } {
  const missing: string[] = [];
  if (!config.browserlessToken) missing.push("BROWSERLESS_TOKEN");
  if (!config.appBaseUrl) missing.push("APP_BASE_URL");
  return missing.length === 0 ? { ok: true } : { ok: false, missing };
}
