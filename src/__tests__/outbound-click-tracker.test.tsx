// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { OutboundClickTracker } from "@/components/analytics/outbound-click-tracker";

const gtag = vi.fn();

function clickLink(href: string, opts: MouseEventInit & { type?: string } = {}) {
  const a = document.createElement("a");
  a.href = href;
  a.textContent = "x";
  document.body.appendChild(a);
  const { type = "click", ...init } = opts;
  a.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, ...init }));
  a.remove();
}

describe("OutboundClickTracker — 외부 링크 이탈 계측", () => {
  beforeEach(() => {
    (window as unknown as { gtag: typeof gtag }).gtag = gtag;
    gtag.mockClear();
    render(<OutboundClickTracker />);
  });
  afterEach(() => cleanup());

  it("외부 http(s) 링크 클릭 → external_click, 라벨은 host/path", () => {
    clickLink("https://www.rda.go.kr/board/board.do?id=1");
    expect(gtag).toHaveBeenCalledWith("event", "external_click", expect.objectContaining({ event_category: "outbound", event_label: "www.rda.go.kr/board/board.do" }));
  });

  it("내부 링크·mailto·tel 은 집계하지 않는다", () => {
    clickLink("/programs");
    clickLink("https://irangfarm.com/crops");
    clickLink("mailto:loyal3270@gmail.com");
    clickLink("tel:01012345678");
    expect(gtag).not.toHaveBeenCalled();
  });

  it("가운데 버튼(auxclick button 1)은 집계, 오른쪽 버튼은 무시", () => {
    clickLink("https://example.org/a", { type: "auxclick", button: 1 });
    clickLink("https://example.org/b", { type: "auxclick", button: 2 });
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag.mock.calls[0][2]).toMatchObject({ event_label: "example.org/a" });
  });

  it("라벨은 100자에서 자른다", () => {
    clickLink("https://example.org/" + "a".repeat(200));
    expect((gtag.mock.calls[0][2] as { event_label: string }).event_label).toHaveLength(100);
  });
});
