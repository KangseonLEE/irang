import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { HERO_SLIDES, HERO_SLIDE_INTERVAL_MS } from "@/lib/data/hero-slides";

describe("HERO_SLIDES — 데스크탑 슬라이드 히어로 (9/28 시안)", () => {
  it("슬라이드 4장, id·이미지 중복 없음", () => {
    expect(HERO_SLIDES).toHaveLength(4);
    expect(new Set(HERO_SLIDES.map((s) => s.id)).size).toBe(4);
    expect(new Set(HERO_SLIDES.map((s) => s.image)).size).toBe(4);
  });

  it("이미지 경로는 /landing/hero/hero-N.webp 규약을 따른다", () => {
    HERO_SLIDES.forEach((slide, i) => {
      expect(slide.image).toBe(`/landing/hero/hero-${i + 1}.webp`);
    });
  });

  it("배경 레이어에 필요한 필드만 남는다 (9/29 카피 제거 후)", () => {
    for (const slide of HERO_SLIDES) {
      expect(Object.keys(slide).sort(), slide.id).toEqual(["id", "image"]);
      expect(existsSync(join(process.cwd(), "public", slide.image)), slide.image).toBe(true);
    }
  });

  it("자동 전환 간격은 6초", () => {
    expect(HERO_SLIDE_INTERVAL_MS).toBe(6000);
  });
});
