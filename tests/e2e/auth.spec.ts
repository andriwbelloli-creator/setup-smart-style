import { test, expect } from "@playwright/test";

test.describe("Auth flow", () => {
  test("/auth shows both signin and signup tabs", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.getByRole("tab", { name: /Entrar/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Criar conta/i })).toBeVisible();
  });

  test("'Esqueci minha senha' opens forgot password form", async ({ page }) => {
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");
    await page.locator("#email").waitFor({ timeout: 10_000 });
    await page.getByText(/Esqueci minha senha/i).click();
    await expect(page.getByText(/Recuperar senha/i)).toBeVisible();
    await expect(page.locator("#email-forgot")).toBeVisible();

    // Back button restores main view
    await page.getByText(/Voltar ao login/i).click();
    await expect(page.getByText(/Entre no HomeOffice.life/i)).toBeVisible();
  });

  test.skip("invalid credentials show error", async ({ page }) => {
    // TODO: toast disappears too fast for assertion; need to slow toast or grab earlier

    await page.goto("/auth");
    await page.locator("#email").waitFor({ timeout: 10_000 });
    await page.locator("#email").fill("naoexiste@example.com");
    await page.locator("#password").fill("wrongpassword");
    await page.locator('button[type="submit"]', { hasText: /Entrar|Entrando/ }).first().click();
    // sonner toast or error appears (any toast on page)
    await expect(page.locator("[data-sonner-toast], [role='status'], li[data-styled]").first()).toBeVisible({ timeout: 15_000 });
  });

  test("signup tab reveals signup fields", async ({ page }) => {
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");
    await page.locator("#email").waitFor({ timeout: 10_000 });
    await page.getByText(/Criar conta/i).first().click();
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#email2")).toBeVisible();
    await expect(page.locator("#password2")).toBeVisible();
  });

  test("/reset-password loads (invalid link shows fallback)", async ({ page }) => {
    await page.goto("/reset-password");
    // Without a valid recovery token, should show "invalid or expired"
    await expect(page.getByText(/link de recuperação inválido|expirado/i)).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("protected routes redirect when logged out", () => {
  test("/postar redirects to /auth", async ({ page }) => {
    await page.goto("/postar");
    await page.waitForURL(/\/auth/, { timeout: 10_000 });
    expect(page.url()).toContain("/auth");
  });

  test("/perfil redirects to /auth", async ({ page }) => {
    await page.goto("/perfil");
    await page.waitForURL(/\/auth/, { timeout: 10_000 });
    expect(page.url()).toContain("/auth");
  });
});
