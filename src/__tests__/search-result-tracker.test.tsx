// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { SearchResultTracker } from "@/components/analytics/search-result-tracker";
import { analytics } from "@/lib/analytics";

/**
 * 9/26 검색 결과 클릭 계측 — GA4 이벤트 이름·라벨 계약 + 위임 동작.
 * GA4 탐색 보고서가 `search_result_click` × `<type>:<순위>` 를 기준으로 읽으니
 * 이름이 바뀌면 누적 데이터가 끊긴다.
 */
const gtag = vi.fn();

function clickCard(label: string | null) {
  const card = document.createElement("article");
  if (label !== null) card.setAttribute("data-search-result", label);
  const title = document.createElement("a");
  title.href = "/crops/apple";
  title.textContent = "사과";
  card.appendChild(title);
  document.body.appendChild(card);
  title.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  card.remove();
}

describe("search_result_click 이벤트 계약", () => {
  beforeEach(() => {
    (window as unknown as { gtag: typeof gtag }).gtag = gtag;
    gtag.mockClear();
  });
  afterEach(() => cleanup());

  it("analytics.searchResultClick — category search, label <type>:<순위>", () => {
    analytics.searchResultClick("crop:1");
    expect(gtag).toHaveBeenLastCalledWith(
      "event",
      "search_result_click",
      expect.objectContaining({ event_category: "search", event_label: "crop:1" }),
    );
  });

  it("카드 안 어디를 눌러도 data-search-result 라벨로 1건 집계", () => {
    render(<SearchResultTracker />);
    clickCard("region:3");
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag.mock.calls[0][2]).toMatchObject({ event_label: "region:3" });
  });

  it("속성이 없는 카드는 집계하지 않는다", () => {
    render(<SearchResultTracker />);
    clickCard(null);
    expect(gtag).not.toHaveBeenCalled();
  });

  it("gtag 부재(SSR·GA 미로드)면 조용히 no-op", () => {
    delete (window as unknown as { gtag?: typeof gtag }).gtag;
    expect(() => analytics.searchResultClick("crop:1")).not.toThrow();
  });
});
