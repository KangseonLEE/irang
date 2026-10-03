import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { AnchorTabNav } from "@/components/ui/anchor-tab-nav";

/**
 * 섹션 탭 활성 판정 — 헤더 숨김/보임에 따라 착지 여백(scroll-margin-top)이 바뀌는 페이지 (10/3 QA).
 * /start 는 `scroll-margin-top: calc(var(--sticky-top) + 12px)` — 헤더 보일 때 68, 숨으면 12.
 * 헤더가 보일 때 탭을 누르면 68 로 착지하고, 내려가는 동안 헤더가 숨어 여백이 12 가 되면서
 * 착지한 섹션이 기준선보다 56px 아래에 남아 한 칸 앞 섹션이 켜졌다(1440·375 전 탭 재현).
 * jsdom 은 레이아웃이 없어 섹션 위치·여백을 대역으로 준다.
 */
const SECTIONS = [
  { id: "s-a", label: "현황" },
  { id: "s-b", label: "지원" },
  { id: "s-c", label: "작물" },
];

const tops: Record<string, number> = {};
const margins: Record<string, string> = {};

function setLayout(next: { tops: Record<string, number>; margin: string }) {
  Object.assign(tops, next.tops);
  for (const { id } of SECTIONS) margins[id] = next.margin;
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
  for (const { id } of SECTIONS) {
    const el = document.createElement("section");
    el.id = id;
    document.body.appendChild(el);
  }
  // 문서 끝 규칙(마지막 섹션 강제 활성)이 끼지 않게 — 문서가 충분히 길다
  Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 10_000 });
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    const top = tops[(this as HTMLElement).id] ?? 0;
    return { top, bottom: top + 400, left: 0, right: 0, width: 0, height: 400, x: 0, y: top, toJSON: () => ({}) } as DOMRect;
  });
  const realGCS = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation((el: Element) => {
    const id = (el as HTMLElement).id;
    if (id in margins) return { scrollMarginTop: margins[id] } as CSSStyleDeclaration;
    return realGCS(el);
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  delete document.documentElement.dataset.headerHidden;
  for (const { id } of SECTIONS) document.getElementById(id)?.remove();
});

const active = () => screen.getAllByRole("button").find((b) => b.dataset.active === "true")?.textContent;
const scrollFrame = () =>
  act(() => {
    fireEvent.scroll(window);
    vi.advanceTimersByTime(20);
  });

describe("AnchorTabNav 활성 탭", () => {
  it("헤더가 보일 때 누른 탭 — 내려가며 헤더가 숨어 여백이 68→12 로 줄어도 착지한 섹션이 켜진다", () => {
    // 맨 위, 헤더 보임: 여백 68
    setLayout({ tops: { "s-a": 300, "s-b": 1300, "s-c": 2300 }, margin: "68px" });
    render(<AnchorTabNav sections={SECTIONS} />);
    expect(active()).toBe("현황");

    // '지원' 착지(68) 후 헤더 숨김 → 여백 12
    document.documentElement.dataset.headerHidden = "";
    setLayout({ tops: { "s-a": -932, "s-b": 68, "s-c": 1068 }, margin: "12px" });
    scrollFrame();
    expect(active()).toBe("지원"); // 예전엔 68-12=56 > 8 이라 '현황'(한 칸 앞)
  });

  it("헤더가 숨은 채 누른 탭(여백 12로 착지)도 그 섹션이 켜지고, 다음 섹션을 앞질러 켜지 않는다", () => {
    setLayout({ tops: { "s-a": 300, "s-b": 1300, "s-c": 2300 }, margin: "68px" });
    render(<AnchorTabNav sections={SECTIONS} />);
    document.documentElement.dataset.headerHidden = "";
    setLayout({ tops: { "s-a": -988, "s-b": 12, "s-c": 1012 }, margin: "12px" });
    scrollFrame();
    expect(active()).toBe("지원");
  });

  it("여백이 상수인 페이지(작물·지역)는 예전 규칙 그대로 — 기준선 8px 안쪽만", () => {
    setLayout({ tops: { "s-a": 300, "s-b": 1300, "s-c": 2300 }, margin: "72px" });
    render(<AnchorTabNav sections={SECTIONS} />);
    document.documentElement.dataset.headerHidden = "";
    setLayout({ tops: { "s-a": -900, "s-b": 72, "s-c": 1072 }, margin: "72px" });
    scrollFrame();
    expect(active()).toBe("지원");
    // 기준선(72+8)보다 아래면 아직 이전 섹션
    setLayout({ tops: { "s-a": -800, "s-b": 172, "s-c": 1172 }, margin: "72px" });
    scrollFrame();
    expect(active()).toBe("현황");
  });
});
