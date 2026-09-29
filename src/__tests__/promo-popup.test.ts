import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { PROMO_POPUPS, getActivePromos, isPromoActive } from "@/lib/data/promo-popup";

const PROMO_POPUP = PROMO_POPUPS[0] ?? null;

describe("promo popup data", () => {
  it("활성 항목이 있으면 포스터 파일이 public 에 실존하고 링크는 https/tel 이다", () => {
    if (!PROMO_POPUP) return;
    expect(existsSync(join(process.cwd(), "public", PROMO_POPUP.image))).toBe(true);
    expect(PROMO_POPUP.href.startsWith("https://")).toBe(true);
    expect(PROMO_POPUP.facts.some((f) => f.href?.startsWith("tel:"))).toBe(true);
    expect(PROMO_POPUP.facts[0].label).toBe("모집 기간");
    expect(PROMO_POPUP.until).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(PROMO_POPUP.facts.length).toBeGreaterThan(0);
  });

  it("카피는 '~합니다/입니다' 를 쓰지 않는다", () => {
    if (!PROMO_POPUP) return;
    const texts = [PROMO_POPUP.tagline, PROMO_POPUP.note, ...PROMO_POPUP.facts.map((f) => f.value)];
    for (const t of texts) expect(t).not.toMatch(/합니다|입니다/);
  });

  it("isPromoActive 는 KST 기준 until 당일까지 참, 다음 날부터 거짓", () => {
    const item = { ...PROMO_POPUP!, until: "2026-11-15" };
    // 2026-11-15 23:30 KST = 2026-11-15T14:30Z → 활성
    expect(isPromoActive(item, new Date("2026-11-15T14:30:00Z"))).toBe(true);
    // 2026-11-16 00:30 KST = 2026-11-15T15:30Z → UTC 로는 아직 15일이지만 KST 는 16일 → 비활성
    expect(isPromoActive(item, new Date("2026-11-15T15:30:00Z"))).toBe(false);
    expect(isPromoActive(null)).toBe(false);
  });

  it("getActivePromos 는 until 이 지난 항목을 제외하고, 주최·문의 행이 있다", () => {
    expect(getActivePromos(new Date("2027-01-01T00:00:00Z"))).toEqual([]);
    for (const it of PROMO_POPUPS) {
      expect(it.facts.some((f) => f.label === "주최")).toBe(true);
      expect(it.facts.some((f) => f.label === "문의")).toBe(true);
    }
  });
});
