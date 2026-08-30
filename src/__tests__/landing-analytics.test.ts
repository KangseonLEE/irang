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

  it("landing_section_view / landing_cta_click / programs_tab_switch", () => {
    analytics.landingSectionView("programs");
    analytics.landingCtaClick("quickstart:assess");
    analytics.programsTabSwitch("ongoing");
    expect(gtag).toHaveBeenNthCalledWith(1, "event", "landing_section_view", expect.objectContaining({ event_category: "landing", event_label: "programs" }));
    expect(gtag).toHaveBeenNthCalledWith(2, "event", "landing_cta_click", expect.objectContaining({ event_category: "landing", event_label: "quickstart:assess" }));
    expect(gtag).toHaveBeenNthCalledWith(3, "event", "programs_tab_switch", expect.objectContaining({ event_category: "landing", event_label: "ongoing" }));
  });

  it("gtag 부재(SSR·GA 미로드)면 조용히 no-op", () => {
    delete (globalThis as unknown as { window?: unknown }).window;
    expect(() => analytics.landingSectionView("hero")).not.toThrow();
  });
});
