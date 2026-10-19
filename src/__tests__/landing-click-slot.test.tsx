import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { LandingClickTracker } from "@/components/analytics/landing-click-tracker";
import { landingSlot } from "@/lib/landing-slot";

/**
 * 10/19 랜딩 클릭 자리 계측 — 실제 위임 리스너(LandingClickTracker)로 클릭해 gtag 호출을 본다.
 * jsdom 은 레이아웃이 없어 getClientRects 가 늘 비므로, `hidden`·`display:none` 조상이 있으면
 * 안 그려진 것으로 흉내 낸다(브라우저와 같은 판정).
 */
describe("landing_click_slot", () => {
  const gtag = vi.fn();
  let rectsSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    (window as unknown as { gtag: unknown }).gtag = gtag;
    gtag.mockClear();
    rectsSpy = vi.spyOn(Element.prototype, "getClientRects").mockImplementation(function (this: Element) {
      const hiddenAncestor = this.closest("[hidden], [style*='display: none']");
      return { length: hiddenAncestor ? 0 : 1 } as DOMRectList;
    });
  });
  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    rectsSpy.mockRestore();
    delete (window as unknown as { gtag?: unknown }).gtag;
  });

  const slotCalls = () => gtag.mock.calls.filter((c) => c[1] === "landing_click_slot");

  function mount(html: string) {
    const host = document.createElement("div");
    host.innerHTML = html;
    document.body.appendChild(host);
    render(<LandingClickTracker />);
    return host;
  }

  it("섹션 안 자리를 1부터 매기고, 기존 landing_cta_click 라벨은 그대로 보낸다", () => {
    const host = mount(`
      <a data-track="quick_link:regions">지역</a>
      <a data-track="quick_link:ranking">순위</a>
      <a data-track="quick_link:assess">진단</a>
      <a data-track="region_map:all">지도</a>`);
    host.querySelector<HTMLElement>('[data-track="quick_link:assess"]')!.click();
    // 기존 이벤트는 정확히 1회, 자리 이벤트보다 먼저 (라벨·순서 불변 — 10/19 QA ⚪2)
    expect(gtag.mock.calls.map((c) => c[1])).toEqual(["landing_cta_click", "landing_click_slot"]);
    expect(gtag).toHaveBeenNthCalledWith(1, "event", "landing_cta_click", expect.objectContaining({ event_label: "quick_link:assess" }));
    expect(slotCalls()).toEqual([
      ["event", "landing_click_slot", { event_category: "landing", event_label: "quick_link:assess#3", value: 3 }],
    ]);
  });

  it("숨긴 탭 패널·display:none 이중 렌더는 세지 않는다", () => {
    const host = mount(`
      <div hidden><a data-track="discover:education:card">숨은 탭 1</a><a data-track="discover:education:card">숨은 탭 2</a></div>
      <div style="display: none"><a data-track="discover:programs:card">모바일판 1</a></div>
      <div><a data-track="discover:programs:card">카드 1</a><a id="t" data-track="discover:programs:card">카드 2</a></div>`);
    host.querySelector<HTMLElement>("#t")!.click();
    expect(slotCalls()[0][2]).toMatchObject({ event_label: "discover:programs:card#2", value: 2 });
  });

  it("같은 접두어라도 다른 <section> 이면 따로 센다 (지금 열린 기회 ↔ 체험)", () => {
    const host = mount(`
      <section><a data-track="discover:programs:view_all">전체</a><a data-track="discover:programs:card">사업 1</a></section>
      <section><a data-track="discover:experience:view_all">전체</a><a id="t" data-track="discover:experience:card">체험 1</a></section>`);
    host.querySelector<HTMLElement>("#t")!.click();
    expect(slotCalls()[0][2]).toMatchObject({ event_label: "discover:experience:card#2", value: 2 });
  });

  it("섹션에 링크가 하나뿐이면 자리를 보내지 않는다", () => {
    const host = mount(`<a data-track="trend:more">더보기</a><a data-track="quick_link:regions">지역</a>`);
    host.querySelector<HTMLElement>('[data-track="trend:more"]')!.click();
    expect(gtag).toHaveBeenCalledWith("event", "landing_cta_click", expect.anything());
    expect(slotCalls()).toHaveLength(0);
  });

  it("안쪽 요소를 눌러도 가장 가까운 [data-track] 기준으로 센다", () => {
    const host = mount(`<a data-track="hero_tag:사과"><span>사과</span></a><a data-track="hero_tag:배"><span id="t">배</span></a>`);
    host.querySelector<HTMLElement>("#t")!.click();
    expect(slotCalls()[0][2]).toMatchObject({ event_label: "hero_tag:배#2" });
  });

  it("landingSlot: 섹션은 라벨 첫 마디, 그룹 크기 포함", () => {
    document.body.innerHTML = `<a data-track="promo:a:detail"></a><a data-track="promo:a:request"></a><a id="t" data-track="promo:b:detail"></a>`;
    expect(landingSlot(document.getElementById("t")!)).toEqual({ section: "promo", slot: 3, size: 3 });
  });
});
