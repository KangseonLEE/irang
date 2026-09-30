import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { analytics } from "@/lib/analytics";

/**
 * 8/30 랜딩 IA 계측 — GA4 이벤트 이름·라벨 계약.
 * GA4 탐색 보고서가 이 이름을 기준으로 읽으니, 바뀌면 누적 데이터가 끊긴다.
 */
describe("landing analytics 이벤트 계약", () => {
  const gtag = vi.fn();
  beforeEach(() => {
    (globalThis as unknown as { window: unknown }).window = { gtag };
    gtag.mockClear();
  });
  afterEach(() => {
    delete (globalThis as unknown as { window?: unknown }).window;
  });

  it("landing_section_view / landing_cta_click / landing_tab_switch", () => {
    analytics.landingSectionView("discover");
    analytics.landingCtaClick("quick_link:assess");
    analytics.discoverTabSwitch("education");
    expect(gtag).toHaveBeenNthCalledWith(1, "event", "landing_section_view", expect.objectContaining({ event_category: "landing", event_label: "discover" }));
    expect(gtag).toHaveBeenNthCalledWith(2, "event", "landing_cta_click", expect.objectContaining({ event_category: "landing", event_label: "quick_link:assess" }));
    expect(gtag).toHaveBeenNthCalledWith(3, "event", "landing_tab_switch", expect.objectContaining({ event_category: "landing", event_label: "education" }));
  });

  // 지원사업·교육·체험·행사 한 섹션(9/30) — 탭 id 4종이 GA4 label 계약이다
  it("landing_tab_switch 라벨 4종 (지금 열린 기회 탭)", () => {
    for (const tab of ["programs", "education", "experience", "festival"]) {
      analytics.discoverTabSwitch(tab);
      expect(gtag).toHaveBeenLastCalledWith("event", "landing_tab_switch", expect.objectContaining({ event_category: "landing", event_label: tab }));
    }
  });

  it("quick_link 라벨 계약 — 자주 찾는 서비스 아이콘 8종 (9/7)", () => {
    analytics.landingCtaClick("quick_link:regions");
    analytics.landingCtaClick("quick_link:ranking");
    expect(gtag).toHaveBeenNthCalledWith(1, "event", "landing_cta_click", expect.objectContaining({ event_category: "landing", event_label: "quick_link:regions" }));
    expect(gtag).toHaveBeenNthCalledWith(2, "event", "landing_cta_click", expect.objectContaining({ event_category: "landing", event_label: "quick_link:ranking" }));
  });

  it("calendar_row_expand — 작물 id 라벨 (8/30 캘린더 행 확장)", () => {
    analytics.calendarRowExpand("apple");
    expect(gtag).toHaveBeenLastCalledWith("event", "calendar_row_expand", expect.objectContaining({ event_category: "crops", event_label: "apple" }));
  });

  it("gtag 부재(SSR·GA 미로드)면 조용히 no-op", () => {
    delete (globalThis as unknown as { window?: unknown }).window;
    expect(() => analytics.landingSectionView("hero")).not.toThrow();
  });
});
