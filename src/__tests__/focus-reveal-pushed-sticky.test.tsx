/**
 * 전역 키보드 포커스 노출(use-focus-reveal) — 밀려 올라간(pushed) sticky 띠 (10/8)
 *
 * 10/6 R2 는 상자 끝에 밀려 올라간 sticky 머리를 "붙는 자리(top + 높이)까지 덮는 띠"로 세게 했다 — 덮인 요소를 보이려고
 * 문서를 위로 굴리면 띠가 붙는 자리까지 같이 내려오기 때문이다. 그런데 **지금 자리에서 요소를 덮지 않을 때**도 넓혀 세서,
 * 지역 상세에서 시·군 카드 칸(sticky, 밀려 올라간 채 화면 위 20px 만 남음) 바로 아래 정착 점수 접기 버튼(268px, 다 보임)으로
 * Tab 하면 문서가 509px 위로 튀었다(dev 1280×800 실측). 넓혀 세는 건 지금 덮고 있을 때만.
 * 레이아웃은 jsdom 이 못 재므로 상자·elementFromPoint 를 대역으로 준다(실측은 Playwright 탭 순회로 확인).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { useFocusReveal } from "@/lib/hooks/use-focus-reveal";

function Guard() {
  useFocusReveal();
  return null;
}

function box(top: number, bottom: number, left = 0, right = 900): DOMRect {
  return { top, bottom, left, right, width: right - left, height: bottom - top, x: left, y: top, toJSON() {} } as DOMRect;
}

let pane: HTMLElement;
let target: HTMLButtonElement;
let targetRect: DOMRect;
const scrollBy = vi.fn();

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "setTimeout", "clearTimeout"] });
  Object.defineProperty(document.documentElement, "clientWidth", { configurable: true, value: 1280 });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
  window.scrollBy = scrollBy as unknown as typeof window.scrollBy;
  scrollBy.mockClear();

  // 시·군 카드 칸 — sticky(top 88), 상자 끝에 밀려 올라가 화면 맨 위 20px 만 남은 상태
  pane = document.createElement("div");
  pane.style.position = "sticky";
  pane.style.top = "88px";
  pane.getBoundingClientRect = () => box(-600, 20);
  document.body.appendChild(pane);

  target = document.createElement("button");
  target.textContent = "40점은 어떻게 나왔나요?";
  target.getBoundingClientRect = () => targetRect;
  document.body.appendChild(target);

  // 화면 위 20px 안은 카드 칸, 그 아래는 빈 곳(본문)
  document.elementFromPoint = ((_x: number, y: number) => (y < 20 ? pane : document.body)) as typeof document.elementFromPoint;
  const realMatches = Element.prototype.matches;
  vi.spyOn(Element.prototype, "matches").mockImplementation(function (this: Element, sel: string) {
    if (sel === ":focus-visible") return this === document.activeElement;
    return realMatches.call(this, sel);
  });
});

afterEach(() => {
  pane.remove();
  target.remove();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

async function tabTo(el: HTMLElement) {
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
  el.focus();
  el.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
  // 두 프레임 + 늦은 측정(헤더 전환 420ms) + 재시도 250ms×3 까지
  await vi.advanceTimersByTimeAsync(2500);
}

describe("밀려 올라간 sticky 띠 — 넓혀 세는 건 지금 덮고 있을 때만", () => {
  it("띠 아래에 다 보이는 요소로 Tab 하면 문서를 굴리지 않는다 (예전엔 −448px)", async () => {
    targetRect = box(268, 300);
    render(<Guard />);
    await tabTo(target);
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it("지금 띠에 덮인 요소는 예전처럼 붙는 자리(88 + 높이 620 = 708) 아래까지 굴린다 — 10/6 R2 '지역 비교' 경우", async () => {
    targetRect = box(10, 40);
    render(<Guard />);
    await tabTo(target);
    expect(scrollBy).toHaveBeenCalled();
    const { top } = scrollBy.mock.calls[0][0] as { top: number };
    // 요소 top 10 → 띠 끝 708 + 여유 8 = 716 → −706
    expect(Math.round(top)).toBe(-706);
  });
});
