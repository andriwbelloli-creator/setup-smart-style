import { describe, it, expect } from "vitest";
import { decorateAffiliateUrl, normalizeStore } from "@/lib/affiliate";

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
    expect(u.searchParams.get("tracking_id")).toBe("deskly");
  });

  it("only adds UTM for stores without specific tag", () => {
    const out = decorateAffiliateUrl("https://www.kabum.com.br/produto/123", "kabum");
    const u = new URL(out);
    expect(u.searchParams.get("utm_source")).toBe("deskly");
    expect(u.searchParams.get("tag")).toBeNull();
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
