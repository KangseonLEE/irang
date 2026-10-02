import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { QUICK_LINK_ITEMS, QuickLinkSection } from "@/components/landing/quick-link-section";

const APP_DIR = join(process.cwd(), "src", "app");

describe("QuickLinkSection — 자주 찾는 서비스 아이콘 8종 (9/7)", () => {
  it("8개 항목, id·href 중복 없음", () => {
    expect(QUICK_LINK_ITEMS).toHaveLength(8);
    expect(new Set(QUICK_LINK_ITEMS.map((i) => i.id)).size).toBe(8);
    expect(new Set(QUICK_LINK_ITEMS.map((i) => i.href)).size).toBe(8);
  });

  it("모든 href 가 src/app 아래 실제 page.tsx 로 존재", () => {
    for (const item of QUICK_LINK_ITEMS) {
      expect(existsSync(join(APP_DIR, item.href.slice(1), "page.tsx")), item.href).toBe(true);
    }
  });

  it("SSR 마크업에 링크 8개와 quick_link 계측 라벨이 남는다", () => {
    const html = renderToStaticMarkup(<QuickLinkSection />);
    expect(html.match(/<a /g)?.length).toBe(8);
    for (const item of QUICK_LINK_ITEMS) {
      expect(html).toContain(`data-track="quick_link:${item.id}"`);
      expect(html).toContain(item.label);
    }
  });

  it("제목·설명 멘트는 화면에서 빼고 섹션 이름은 h2 로 남긴다 (10/2)", () => {
    const html = renderToStaticMarkup(<QuickLinkSection />);
    expect(html).not.toContain("QUICK LINK");
    expect(html).not.toContain("준비하는 순서대로");
    expect(html).toMatch(/<h2 id="quick-link-title"[^>]*>\s*자주 찾는 서비스\s*<\/h2>/);
    expect(html).toContain('aria-labelledby="quick-link-title"');
  });

  it("라벨은 10자 이내 명사형", () => {
    for (const item of QUICK_LINK_ITEMS) expect(item.label.length).toBeLessThanOrEqual(10);
  });
});
