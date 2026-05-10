import { describe, it, expect } from "vitest";
import { SEED_USERS, SEED_SETUPS, SEED_COMMENTS } from "../../scripts/seed-data";

describe("seed data integrity", () => {
  it("has at least 8 users and 14 setups", () => {
    expect(SEED_USERS.length).toBeGreaterThanOrEqual(8);
    expect(SEED_SETUPS.length).toBeGreaterThanOrEqual(14);
  });

  it("each user has unique email and username", () => {
    const emails = new Set(SEED_USERS.map((u) => u.email));
    const usernames = new Set(SEED_USERS.map((u) => u.username));
    expect(emails.size).toBe(SEED_USERS.length);
    expect(usernames.size).toBe(SEED_USERS.length);
  });

  it("each setup has unique slug", () => {
    const slugs = new Set(SEED_SETUPS.map((s) => s.slug));
    expect(slugs.size).toBe(SEED_SETUPS.length);
  });

  it("every setup owner exists in SEED_USERS", () => {
    const emails = new Set(SEED_USERS.map((u) => u.email));
    for (const s of SEED_SETUPS) {
      expect(emails.has(s.ownerEmail), `owner ${s.ownerEmail} missing for ${s.slug}`).toBe(true);
    }
  });

  it("every setup has a non-empty cover and 1+ products", () => {
    for (const s of SEED_SETUPS) {
      expect(s.cover_url).toMatch(/^https:\/\//);
      expect(s.products.length).toBeGreaterThan(0);
    }
  });

  it("ai_score is between 0 and 10", () => {
    for (const s of SEED_SETUPS) {
      expect(s.ai_score).toBeGreaterThanOrEqual(0);
      expect(s.ai_score).toBeLessThanOrEqual(10);
    }
  });

  it("product prices are positive integers", () => {
    for (const s of SEED_SETUPS) {
      for (const p of s.products) {
        expect(p.price_brl).toBeGreaterThan(0);
        expect(Number.isFinite(p.price_brl)).toBe(true);
      }
    }
  });

  it("product store is from allowed enum", () => {
    const allowed = new Set(["amazon_br", "mercado_livre", "kabum", "magalu", "pichau", "outro"]);
    for (const s of SEED_SETUPS) {
      for (const p of s.products) {
        expect(allowed.has(p.store)).toBe(true);
      }
    }
  });

  it("product x/y coords are within 0-100 (hotspot %)", () => {
    for (const s of SEED_SETUPS) {
      for (const p of s.products) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(100);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(100);
      }
    }
  });

  it("every comment references an existing setup and user", () => {
    const slugs = new Set(SEED_SETUPS.map((s) => s.slug));
    const emails = new Set(SEED_USERS.map((u) => u.email));
    for (const c of SEED_COMMENTS) {
      expect(slugs.has(c.setupSlug), `unknown setup slug ${c.setupSlug}`).toBe(true);
      expect(emails.has(c.authorEmail), `unknown author email ${c.authorEmail}`).toBe(true);
      expect(c.body.trim().length).toBeGreaterThan(0);
    }
  });
});
