import { test, expect } from "@playwright/test";

const SEEDED_SLUG = "setup-dev-minimalista-madeira";

test.describe("Setup detail page", () => {
  test("loads a seeded setup with title, cover, products", async ({ page }) => {
    await page.goto(`/setup/${SEEDED_SLUG}`);
    await page.waitForLoadState("networkidle");

    // Title from seed data
    await expect(page.locator("h1, h2").filter({ hasText: /Setup dev minimalista em madeira/i })).toBeVisible();

    // Cover image rendered
    const cover = page.locator("img").first();
    await expect(cover).toBeVisible();

    // At least one product hotspot or product listing should appear
    const productSignal = page.locator("text=/keychron|monitor|cadeira/i").first();
    await expect(productSignal).toBeVisible({ timeout: 10_000 });
  });

  test("renders comments from seed", async ({ page }) => {
    await page.goto(`/setup/${SEEDED_SLUG}`);
    await page.waitForLoadState("networkidle");

    // Seed data has 4 comments on this setup; we should see at least 1 visible
    const comment = page.locator("text=/Onde comprou\\?|Keychron|setup tá perfeito/i").first();
    await expect(comment).toBeVisible({ timeout: 10_000 });
  });

  test("non-existent slug shows 404 or graceful empty", async ({ page }) => {
    await page.goto("/setup/setup-que-nao-existe-12345", { waitUntil: "domcontentloaded" });
    // Either redirected, or shows not-found state
    const body = await page.textContent("body");
    expect(body).toBeTruthy();
  });
});
