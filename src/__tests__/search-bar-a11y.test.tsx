import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";

/**
 * 통합검색 입력창 접근성 (10/2 QA C-Y3, axe critical) — 리스트박스는 **옵션 묶음에만**.
 * /search 빈 화면(panelLayout)에서 바깥 상자 전체가 role=listbox 였고 그 안에 버튼·링크 26개, option 0개였다.
 * 입력창 aria-expanded·aria-controls 는 리스트박스가 실제로 있을 때만.
 */
const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/search",
  useSearchParams: () => new URLSearchParams(),
}));

import SearchBar from "@/components/search/search-bar";

const RECENT_KEY = "irang-recent-searches";

// jsdom 에는 scrollIntoView 가 없다 — 키보드 하이라이트 스크롤(useActiveOptionScroll)용 대역
const elProto = Element.prototype as unknown as { scrollIntoView?: unknown };
if (!elProto.scrollIntoView) elProto.scrollIntoView = () => {};

beforeEach(() => {
  push.mockClear();
  localStorage.clear();
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

function input(container: HTMLElement) {
  return container.querySelector<HTMLInputElement>("input[role='combobox']")!;
}

/** 리스트박스 안에는 option(과 그 안 장식)만 — 직속 자식이 전부 option 이어야 한다 */
function expectOnlyOptions(listbox: Element) {
  expect(listbox.children.length).toBeGreaterThan(0);
  for (const child of Array.from(listbox.children)) expect(child.getAttribute("role")).toBe("option");
}

describe("검색 홈(panelLayout) — 최근 검색이 없을 때", () => {
  it("리스트박스가 없고 바깥 상자도 리스트박스·aria-live 가 아니다 — 입력창은 닫힘(aria-expanded=false)", () => {
    const { container } = render(<SearchBar size="large" panelLayout />);
    expect(container.querySelector("[role='listbox']")).toBeNull();
    expect(container.querySelector("[aria-live]")).toBeNull();
    // 추천 검색어·바로 탐색·가이드·FAQ 는 그대로 보인다
    expect(container.textContent).toContain("추천 검색어");
    expect(container.textContent).toContain("바로 탐색");
    const el = input(container);
    expect(el).toHaveAttribute("aria-expanded", "false");
    expect(el).not.toHaveAttribute("aria-controls");
  });
});

describe("검색 홈(panelLayout) — 최근 검색이 있을 때", () => {
  beforeEach(() => {
    localStorage.setItem(
      RECENT_KEY,
      JSON.stringify([
        { query: "사과", date: "2026.10.02" },
        { query: "전남 귀농", date: "2026.10.01" },
      ]),
    );
  });

  it("리스트박스는 최근 검색 옵션 묶음 하나뿐이고 입력창이 그것을 가리킨다", () => {
    const { container } = render(<SearchBar size="large" panelLayout />);
    const boxes = container.querySelectorAll("[role='listbox']");
    expect(boxes.length).toBe(1);
    expectOnlyOptions(boxes[0]);
    // 전체삭제 버튼·추천 검색어 버튼은 리스트박스 밖
    expect(boxes[0].querySelector("button:not([tabindex='-1'])")).toBeNull();
    const el = input(container);
    expect(el).toHaveAttribute("aria-expanded", "true");
    expect(el.getAttribute("aria-controls")).toBe(boxes[0].id);
  });

  it("↓↓ Enter 로 두 번째 최근 검색어로 간다 (키보드 동작 유지)", () => {
    const { container } = render(<SearchBar size="large" panelLayout />);
    const el = input(container);
    act(() => {
      el.focus();
    });
    fireEvent.keyDown(el, { key: "ArrowDown" });
    fireEvent.keyDown(el, { key: "ArrowDown" });
    const active = el.getAttribute("aria-activedescendant");
    expect(active).toBeTruthy();
    expect(document.getElementById(active!)?.textContent).toContain("전남 귀농");
    fireEvent.submit(el.closest("form")!);
    expect(push).toHaveBeenCalledWith(`/search?q=${encodeURIComponent("전남 귀농")}`);
  });
});

describe("입력 중 — 자동완성", () => {
  it("리스트박스는 제안 옵션만 담고, '전체 검색 결과 보기' 링크는 옵션이 아니다", () => {
    vi.useFakeTimers();
    try {
      const { container } = render(<SearchBar size="large" panelLayout />);
      const el = input(container);
      fireEvent.change(el, { target: { value: "사과" } });
      act(() => {
        vi.advanceTimersByTime(200);
      });
      const boxes = container.querySelectorAll("[role='listbox']");
      expect(boxes.length).toBe(1);
      expectOnlyOptions(boxes[0]);
      expect(el.getAttribute("aria-controls")).toBe(boxes[0].id);
      const viewAll = Array.from(container.querySelectorAll("a")).find((a) => a.textContent?.includes("전체 검색 결과 보기"));
      expect(viewAll).toBeDefined();
      expect(viewAll).not.toHaveAttribute("role");
      // 입력 중 제안 변화는 계속 읽어 준다
      expect(container.querySelector("[aria-live='polite']")).not.toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("옵션 안에 대화형 요소가 없다 — 삭제·채우기 버튼은 listbox 밖 형제 (10/3 QA axe nested-interactive)", () => {
  beforeEach(() => {
    localStorage.setItem(
      RECENT_KEY,
      JSON.stringify([
        { query: "사과", date: "2026.10.02" },
        { query: "전남 귀농", date: "2026.10.01" },
      ]),
    );
  });

  it("최근 검색: option 안 button·link 0, 삭제 버튼은 listbox 밖 — 누르면 그 항목만 지우고 이동하지 않는다", () => {
    const { container } = render(<SearchBar size="large" panelLayout />);
    const listbox = container.querySelector("[role='listbox']")!;
    for (const opt of Array.from(listbox.querySelectorAll("[role='option']"))) {
      expect(opt.querySelectorAll("button, a, input, [tabindex]").length).toBe(0);
    }
    const removes = Array.from(container.querySelectorAll<HTMLButtonElement>("button[aria-label$='최근 검색 삭제']"));
    expect(removes).toHaveLength(2);
    for (const b of removes) expect(listbox.contains(b)).toBe(false);
    fireEvent.click(removes[0]);
    expect(push).not.toHaveBeenCalled();
    const left = Array.from(container.querySelectorAll("[role='listbox'] [role='option']")).map((o) => o.textContent);
    expect(left).toHaveLength(1);
    expect(left[0]).toContain("전남 귀농");
  });

  it("자동완성: option 안 button 0, 채우기 버튼은 listbox 밖 — 누르면 입력창만 채운다", () => {
    vi.useFakeTimers();
    try {
      const { container } = render(<SearchBar size="large" panelLayout />);
      const el = input(container);
      fireEvent.change(el, { target: { value: "사과" } });
      act(() => {
        vi.advanceTimersByTime(200);
      });
      const listbox = container.querySelector("[role='listbox']")!;
      expect(listbox.querySelectorAll("button").length).toBe(0);
      const fills = Array.from(container.querySelectorAll<HTMLButtonElement>("button[aria-label$='입력창에 채우기']"));
      expect(fills.length).toBe(listbox.querySelectorAll("[role='option']").length);
      for (const b of fills) expect(listbox.contains(b)).toBe(false);
      const target = listbox.querySelectorAll("[role='option']")[1]?.textContent ?? "";
      fireEvent.click(fills[1]);
      expect(push).not.toHaveBeenCalled();
      expect(el.value).toBe(target);
    } finally {
      vi.useRealTimers();
    }
  });

  it("하이라이트한 최근 검색어는 Delete 로 지운다 — 마우스 전용 삭제 버튼의 키보드 대응", () => {
    const { container } = render(<SearchBar size="large" panelLayout />);
    const el = input(container);
    act(() => {
      el.focus();
    });
    fireEvent.keyDown(el, { key: "ArrowDown" });
    fireEvent.keyDown(el, { key: "ArrowDown" });
    fireEvent.keyDown(el, { key: "Delete" });
    const left = Array.from(container.querySelectorAll("[role='listbox'] [role='option']")).map((o) => o.textContent);
    expect(left).toHaveLength(1);
    expect(left[0]).toContain("사과");
    expect(JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]")).toHaveLength(1);
  });

  it("한글 조합 중 Enter 는 검색으로 새지 않는다 (IME 가드 유지)", () => {
    const { container } = render(<SearchBar size="large" panelLayout />);
    const el = input(container);
    fireEvent.change(el, { target: { value: "배" } });
    const notPrevented = fireEvent.keyDown(el, { key: "Enter", isComposing: true });
    expect(notPrevented).toBe(false);
    expect(push).not.toHaveBeenCalled();
  });
});

describe("인스턴스마다 다른 id — 두 검색창이 함께 떠도 aria 참조가 섞이지 않는다", () => {
  it("리스트박스 id 가 겹치지 않는다", () => {
    localStorage.setItem(RECENT_KEY, JSON.stringify([{ query: "사과", date: "" }]));
    const { container } = render(
      <>
        <SearchBar size="large" panelLayout />
        <SearchBar size="large" panelLayout />
      </>,
    );
    const ids = Array.from(container.querySelectorAll("[role='listbox']")).map((b) => b.id);
    expect(ids.length).toBe(2);
    expect(new Set(ids).size).toBe(2);
  });
});
