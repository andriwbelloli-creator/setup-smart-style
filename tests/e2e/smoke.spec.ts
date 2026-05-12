import { test, expect } from "@playwright/test";

const PUBLIC_ROUTES = [
  { path: "/", contains: /avaliado por IA|Seu setup/i, title: /HomeOffice.life/i },
  { path: "/galeria", contains: /Descubra setups/i },
  { path: "/diagnostico", contains: /Descubra a nota|home office em/i },
  { path: "/orcamento", contains: /Diga seu bolso/i },
  { path: "/comunidade", contains: /trocando setup/i },
  { path: "/auth", contains: /Entre no HomeOffice.life/i },
];

test.describe("@smoke public routes", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`renders ${route.path}`, async ({ page }) => {
      const resp = await page.goto(route.path, { waitUntil: "domcontentloaded" });
      expect(resp?.ok(), `${route.path} returned non-2xx`).toBe(true);
      await expect(page.locator("body").getByText(route.contains).first()).toBeVisible({ timeout: 10_000 });
      if (route.title) {
        await expect(page).toHaveTitle(route.title);
      }
    });
  }

  test("/sitemap.xml is reachable", async ({ request }) => {
    const r = await request.get("/sitemap.xml");
    expect(r.ok()).toBe(true);
    const body = await r.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("homeoffice.life");
  });

  test("/robots.txt is reachable", async ({ request }) => {
    const r = await request.get("/robots.txt");
    expect(r.ok()).toBe(true);
    const body = await r.text();
    expect(body).toContain("User-agent");
    expect(body).toContain("Sitemap");
  });

  test("404 page renders for unknown route", async ({ page }) => {
    await page.goto("/this-route-definitely-does-not-exist", { waitUntil: "domcontentloaded" });
    await expect(page.locator("text=/404|not found/i").first()).toBeVisible();
  });
});
