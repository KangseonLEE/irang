import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { HeroShowcase } from "@/components/landing/hero-showcase";
import { JOURNEY_LANES } from "@/lib/data/journey-lanes";

describe("랜딩 히어로 — efusioni 번안 (10/1)", () => {
  const html = renderToStaticMarkup(<HeroShowcase />);

  it("h1 은 1개이고 SSR 에 완전한 문장이 남는다", () => {
    expect(html.match(/<h1/g)?.length).toBe(1);
    expect(html).toContain("도시에서 귀농·귀촌·귀산촌·청년농·스마트팜으로 새 출발");
    expect(html).not.toContain("aria-live");
  });

  it("여정 카드 6장이 전부 SSR <a> 로 남고 계측 라벨이 붙는다 (유입 61% Organic)", () => {
    expect(JOURNEY_LANES.length).toBe(6);
    for (const lane of JOURNEY_LANES) {
      expect(html).toContain(`href="${lane.href}"`);
      expect(html).toContain(`data-track="hero_card:${lane.id}"`);
    }
  });

  it("투명 헤더 게이트(data-landing-hero)를 더 이상 세우지 않는다", () => {
    expect(html).not.toContain("data-landing-hero");
  });
});
