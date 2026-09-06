import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { HERO_QUICK_ITEMS, HeroQuickMenu } from "@/components/landing/hero-quick-menu";

const APP_DIR = join(process.cwd(), "src", "app");

describe("HeroQuickMenu — 히어로 아이콘 퀵메뉴 (9/7)", () => {
  it("8개 항목, id·href 중복 없음", () => {
    expect(HERO_QUICK_ITEMS).toHaveLength(8);
    expect(new Set(HERO_QUICK_ITEMS.map((i) => i.id)).size).toBe(8);
    expect(new Set(HERO_QUICK_ITEMS.map((i) => i.href)).size).toBe(8);
  });

  it("모든 href 가 src/app 아래 실제 page.tsx 로 존재", () => {
    for (const item of HERO_QUICK_ITEMS) {
      expect(existsSync(join(APP_DIR, item.href.slice(1), "page.tsx")), item.href).toBe(true);
    }
  });

  it("SSR 마크업에 링크 8개와 hero_quick 계측 라벨이 남는다", () => {
    const html = renderToStaticMarkup(<HeroQuickMenu />);
    expect(html.match(/<a /g)?.length).toBe(8);
    for (const item of HERO_QUICK_ITEMS) {
      expect(html).toContain(`data-track="hero_quick:${item.id}"`);
      expect(html).toContain(item.label);
    }
  });

  it("라벨은 10자 이내 명사형", () => {
    for (const item of HERO_QUICK_ITEMS) expect(item.label.length).toBeLessThanOrEqual(10);
  });
});
