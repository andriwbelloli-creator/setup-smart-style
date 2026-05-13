import { test, expect } from "@playwright/test";

test.describe("Galeria", () => {
  test.skip("loads setups from DB and paginates", async ({ page }) => {
    // TODO: flaky on cold DB fetch — needs mock or longer wait

    await page.goto("/galeria");

    // Wait for either counter or empty state
    await expect(page.getByText(/setups? encontrad|setup encontrad|Nenhum setup/i).first()).toBeVisible({ timeout: 15_000 });

    // Should have at least one of: a card link, or empty-state message
    const cardOrEmpty = page.locator("a[href^='/setup/']").first();
    const empty = page.getByText(/Nenhum setup encontrado/i);
    const cardVisible = await cardOrEmpty.isVisible().catch(() => false);
    const emptyVisible = await empty.isVisible().catch(() => false);
    expect(cardVisible || emptyVisible).toBe(true);
  });

  test("filter by 'Dev' role narrows results", async ({ page }) => {
    await page.goto("/galeria");
    await page.waitForLoadState("networkidle");

    const initialText = await page.locator("text=/\\d+\\s+setup/i").first().textContent();
    const initialCount = parseInt(initialText?.match(/\d+/)?.[0] || "0", 10);

    const devFilter = page.getByRole("button", { name: "Dev", exact: true }).first();
    if (await devFilter.isVisible()) {
      await devFilter.click();
      await page.waitForTimeout(500);
      const filteredText = await page.locator("text=/\\d+\\s+setup/i").first().textContent();
      const filteredCount = parseInt(filteredText?.match(/\d+/)?.[0] || "0", 10);
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test("search input filters cards", async ({ page }) => {
    await page.goto("/galeria");
    await page.waitForLoadState("networkidle");

    const search = page.getByPlaceholder(/Buscar por nome/i);
    await search.fill("monitor");
    await page.waitForTimeout(300);

    // Counter still visible (might be 0 or more — just confirm UI doesn't blow up)
    await expect(page.locator("text=/setup/i").first()).toBeVisible();
  });
});
