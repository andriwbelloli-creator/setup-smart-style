import { describe, it, expect } from "vitest";
import {
  decorateAffiliateUrl,
  normalizeStore,
  commissionForStore,
  commissionRate,
} from "@/lib/affiliate";

describe("decorateAffiliateUrl", () => {
  it("adds Amazon tag and UTM params", () => {
    const out = decorateAffiliateUrl("https://www.amazon.com.br/dp/B0123456", "amazon_br");
    const u = new URL(out);
    expect(u.searchParams.get("tag")).toBe("deskly02-20");
    expect(u.searchParams.get("utm_source")).toBe("deskly");
    expect(u.searchParams.get("utm_medium")).toBe("affiliate");
  });

  it("adds ML tracking_id", () => {
    const out = decorateAffiliateUrl("https://produto.mercadolivre.com.br/MLB-1234", "mercado_livre");
    const u = new URL(out);
    expect(u.searchParams.get("tracking_id")).toBe("belloliandriw");
  });

  it("only adds UTM for stores without specific tag", () => {
    const out = decorateAffiliateUrl("https://www.kabum.com.br/produto/123", "kabum");
    const u = new URL(out);
    expect(u.searchParams.get("utm_source")).toBe("deskly");
    expect(u.searchParams.get("tag")).toBeNull();
  });

  it("rewrites Magalu URL through influencer channel", () => {
    const out = decorateAffiliateUrl("https://www.magazineluiza.com.br/cadeira-x/p/12345/", "magalu");
    const u = new URL(out);
    expect(u.hostname).toBe("www.magazinevoce.com.br");
    expect(u.pathname).toBe("/magazinedesklylife/cadeira-x/p/12345/");
    expect(u.searchParams.get("utm_source")).toBe("deskly");
  });

  it("does not override existing params", () => {
    const out = decorateAffiliateUrl("https://www.amazon.com.br/dp/X?tag=other&utm_source=x", "amazon_br");
    const u = new URL(out);
    expect(u.searchParams.get("tag")).toBe("other");
    expect(u.searchParams.get("utm_source")).toBe("x");
  });

  it("returns original string for invalid URLs", () => {
    expect(decorateAffiliateUrl("not-a-url", "amazon_br")).toBe("not-a-url");
  });
});

describe("normalizeStore", () => {
  it("maps display labels to enum", () => {
    expect(normalizeStore("Amazon BR")).toBe("amazon_br");
    expect(normalizeStore("Mercado Livre")).toBe("mercado_livre");
    expect(normalizeStore("Kabum")).toBe("kabum");
  });

  it("passes through enum values unchanged", () => {
    expect(normalizeStore("amazon_br")).toBe("amazon_br");
    expect(normalizeStore("pichau")).toBe("pichau");
  });
});

describe("commissionForStore", () => {
  it("calcula 4% pra Amazon BR", () => {
    expect(commissionForStore("amazon_br", 10000)).toBe(400);
  });

  it("calcula 5% pra Mercado Livre", () => {
    expect(commissionForStore("mercado_livre", 10000)).toBe(500);
  });

  it("calcula 5.3% pra Kabum", () => {
    expect(commissionForStore("kabum", 10000)).toBe(530);
  });

  it("calcula 4% pra Magalu", () => {
    expect(commissionForStore("magalu", 10000)).toBe(400);
  });

  it("calcula 6.3% pra Pichau", () => {
    expect(commissionForStore("pichau", 10000)).toBe(630);
  });

  it("calcula 3% fallback pra outro", () => {
    expect(commissionForStore("outro", 10000)).toBe(300);
  });

  it("arredonda corretamente em valores não-redondos", () => {
    // 199.99 * 0.04 = 7.9996 → 8 (cents)
    expect(commissionForStore("amazon_br", 19999)).toBe(800);
  });
});

describe("commissionRate", () => {
  it("retorna a fração decimal por loja", () => {
    expect(commissionRate("amazon_br")).toBe(0.04);
    expect(commissionRate("kabum")).toBeCloseTo(0.053, 3);
    expect(commissionRate("pichau")).toBeCloseTo(0.063, 3);
  });
});

describe("Roteamento: produto pra retailer correto", () => {
  it("Amazon URL passa por amazon.com.br", () => {
    const out = decorateAffiliateUrl("https://www.amazon.com.br/dp/B0XXX", "amazon_br");
    expect(new URL(out).hostname).toContain("amazon.com.br");
  });

  it("Mercado Livre URL passa por mercadolivre.com.br", () => {
    const out = decorateAffiliateUrl("https://produto.mercadolivre.com.br/MLB-1", "mercado_livre");
    expect(new URL(out).hostname).toContain("mercadolivre.com.br");
  });

  it("Kabum URL passa por kabum.com.br", () => {
    const out = decorateAffiliateUrl("https://www.kabum.com.br/produto/123", "kabum");
    expect(new URL(out).hostname).toContain("kabum.com.br");
  });

  it("Pichau URL passa por pichau.com.br", () => {
    const out = decorateAffiliateUrl("https://www.pichau.com.br/p/teclado", "pichau");
    expect(new URL(out).hostname).toContain("pichau.com.br");
  });

  it("Magalu redireciona pra magazinevoce.com.br/magazinedesklylife", () => {
    const out = decorateAffiliateUrl("https://www.magazineluiza.com.br/p/123/", "magalu");
    const u = new URL(out);
    expect(u.hostname).toBe("www.magazinevoce.com.br");
    expect(u.pathname.startsWith("/magazinedesklylife/")).toBe(true);
  });
});
