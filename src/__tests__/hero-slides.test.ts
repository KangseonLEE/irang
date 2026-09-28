import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { HERO_SLIDES, HERO_SLIDE_INTERVAL_MS } from "@/lib/data/hero-slides";

const APP_DIR = join(process.cwd(), "src", "app");

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

  it("모든 href 가 실제 라우트를 가리킨다 (쿼리 제외)", () => {
    for (const slide of HERO_SLIDES) {
      const path = slide.href.split("?")[0];
      expect(existsSync(join(APP_DIR, path.slice(1), "page.tsx")), slide.href).toBe(true);
    }
  });

  it("카피 톤 — '합니다/입니다' 종결 금지 (copywriting.md)", () => {
    for (const slide of HERO_SLIDES) {
      const text = `${slide.eyebrow} ${slide.caption} ${slide.ctaLabel}`;
      expect(text, slide.id).not.toMatch(/합니다|입니다/);
    }
  });

  it("자동 전환 간격은 6초", () => {
    expect(HERO_SLIDE_INTERVAL_MS).toBe(6000);
  });
});
