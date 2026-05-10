import { describe, it, expect } from "vitest";
import { slugify, rowToSetup, type DbSetupRow } from "@/lib/setups-db";

describe("slugify", () => {
  it("converts to lowercase kebab-case", () => {
    expect(slugify("Meu Setup BR")).toBe("meu-setup-br");
  });

  it("removes accents", () => {
    expect(slugify("Cantinho Ergonômico")).toBe("cantinho-ergonomico");
  });

  it("strips special characters", () => {
    expect(slugify("Setup 100% gamer!!!")).toBe("setup-100-gamer");
  });

  it("collapses spaces and trims dashes", () => {
    expect(slugify("  hello   world  ")).toBe("hello-world");
  });

  it("caps length at 60 chars", () => {
    const long = "a".repeat(100);
    expect(slugify(long).length).toBeLessThanOrEqual(60);
  });

  it("returns empty string for empty input", () => {
    expect(slugify("")).toBe("");
  });
});

describe("rowToSetup", () => {
  const baseRow: DbSetupRow = {
    id: "abc-123",
    slug: "meu-setup",
    title: "Meu Setup",
    description: "Descrição",
    owner_id: "user-1",
    city: "São Paulo",
    budget_brl: 5000,
    career: "dev",
    styles: ["minimalista"],
    cover_url: "https://example.com/cover.jpg",
    status: "published",
    ai_score: 8.5,
    likes_count: 12,
    saves_count: 5,
    created_at: "2026-01-01T00:00:00Z",
    profiles: {
      username: "user1",
      display_name: "User One",
      avatar_url: null,
    },
  };

  it("maps DB row to Setup shape", () => {
    const s = rowToSetup(baseRow);
    expect(s.id).toBe("abc-123");
    expect(s.slug).toBe("meu-setup");
    expect(s.title).toBe("Meu Setup");
    expect(s.budget).toBe(5000);
    expect(s.likes).toBe(12);
    expect(s.saves).toBe(5);
    expect(s.author).toBe("@user1");
    expect(s.image).toBe("https://example.com/cover.jpg");
  });

  it("maps career to authorRole label", () => {
    expect(rowToSetup({ ...baseRow, career: "dev" }).authorRole).toBe("Dev");
    expect(rowToSetup({ ...baseRow, career: "designer" }).authorRole).toBe("Designer");
    expect(rowToSetup({ ...baseRow, career: "creator" }).authorRole).toBe("Creator");
    expect(rowToSetup({ ...baseRow, career: "remoto" }).authorRole).toBe("Remoto");
    expect(rowToSetup({ ...baseRow, career: "unknown" as any }).authorRole).toBe("Remoto");
  });

  it("falls back to @deskly when profiles is missing", () => {
    const s = rowToSetup({ ...baseRow, profiles: null });
    expect(s.author).toBe("@deskly");
  });

  it("uses empty image and Brasil city as fallbacks", () => {
    const s = rowToSetup({ ...baseRow, cover_url: null, city: null });
    expect(s.image).toBe("");
    expect(s.city).toBe("Brasil");
  });
});
