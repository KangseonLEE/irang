import { useRef } from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, act, fireEvent } from "@testing-library/react";
import { useFocusDodge } from "@/lib/hooks/use-focus-dodge";

/**
 * 떠 있는 위젯(피드백·맨 위로)이 키보드 포커스를 가리면 비켜난다 (10/3 QA WCAG 2.4.11 — 1440 푸터 '이용약관' 41% 가림).
 * jsdom 은 레이아웃이 없어 상자를 대역으로 주고, :focus-visible 은 늘 false 라 matches 를 스파이한다.
 * 실제 화면 겹침은 Playwright 실측(_fd1-dodge)으로 따로 확인했다.
 */
type Box = { left: number; top: number; width: number; height: number };
const rect = ({ left, top, width, height }: Box) =>
  ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) }) as DOMRect;

function Harness({ enabled = true }: { enabled?: boolean }) {
  const ref = useRef<HTMLButtonElement>(null);
  const dodge = useFocusDodge(ref, enabled);
  return (
    <>
      <a href="/terms" data-testid="near">이용약관</a>
      <a href="/about" data-testid="far">소개</a>
      <button ref={ref} type="button" data-testid="widget" data-dodge={dodge ? "true" : undefined}>
        피드백
      </button>
    </>
  );
}

const BOXES: Record<string, Box> = {
  widget: { left: 1316, top: 808, width: 44, height: 44 }, // 1440×900, bottom 24 · right 80
  near: { left: 1290, top: 820, width: 46, height: 18 }, // 위젯과 겹친다
  far: { left: 100, top: 400, width: 40, height: 18 },
};

let keyboard = true;

beforeEach(() => {
  keyboard = true;
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame"] });
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    const id = (this as HTMLElement).dataset?.testid ?? "";
    return rect(BOXES[id] ?? { left: 0, top: 0, width: 0, height: 0 });
  });
  const realMatches = Element.prototype.matches;
  vi.spyOn(Element.prototype, "matches").mockImplementation(function (this: Element, sel: string) {
    if (sel === ":focus-visible") return keyboard && this === document.activeElement;
    return realMatches.call(this, sel);
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/** 브라우저처럼 focus + focusin, 그리고 측정(rAF·정착 타이머)까지 흘려보낸다 */
function focus(el: HTMLElement) {
  act(() => {
    el.focus();
    fireEvent.focusIn(el);
    vi.advanceTimersByTime(400);
  });
}

describe("useFocusDodge", () => {
  it("키보드 포커스가 위젯과 겹치면 비켜나고, 겹치지 않는 곳으로 가면 돌아온다", () => {
    const { getByTestId } = render(<Harness />);
    const widget = getByTestId("widget");
    expect(widget).not.toHaveAttribute("data-dodge");
    focus(getByTestId("near"));
    expect(widget).toHaveAttribute("data-dodge", "true");
    focus(getByTestId("far"));
    expect(widget).not.toHaveAttribute("data-dodge");
  });

  it("위젯 자신에 Tab 으로 오면 다시 보인다", () => {
    const { getByTestId } = render(<Harness />);
    focus(getByTestId("near"));
    focus(getByTestId("widget"));
    expect(getByTestId("widget")).not.toHaveAttribute("data-dodge");
  });

  it("마우스 클릭 포커스(:focus-visible 아님)로는 비켜나지 않는다", () => {
    keyboard = false;
    const { getByTestId } = render(<Harness />);
    focus(getByTestId("near"));
    expect(getByTestId("widget")).not.toHaveAttribute("data-dodge");
  });

  it("위젯이 안 보이는 동안(enabled=false)에는 비켜날 일도 없다", () => {
    const { getByTestId } = render(<Harness enabled={false} />);
    focus(getByTestId("near"));
    expect(getByTestId("widget")).not.toHaveAttribute("data-dodge");
  });
});
