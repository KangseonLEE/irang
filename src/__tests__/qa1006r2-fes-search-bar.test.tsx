// @vitest-environment jsdom
/**
 * 10/6 전체 QA 2차 R2-Q3 N2 — 결과 화면 검색창(검색어 채움)의 키보드 동작
 *  - Tab 으로 들어오면 자동완성을 띄우지 않는다 (운영과 같음) — ↓ 키로 연다
 *  - 포커스가 검색창 밖으로 나가면 닫는다 (Tab 이탈 후 열린 채 지식 패널 링크를 덮던 결함)
 *  - 검색창 안·포털 대화상자(정보 추가 요청 모달 등)로 가는 포커스는 닫지 않는다
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, cleanup, fireEvent, act } from "@testing-library/react";

let currentParams = new URLSearchParams("q=사과");
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/search",
  useSearchParams: () => currentParams,
}));

import SearchBar from "@/components/search/search-bar";

const elProto = Element.prototype as unknown as { scrollIntoView?: unknown };
if (!elProto.scrollIntoView) elProto.scrollIntoView = () => {};

beforeEach(() => {
  currentParams = new URLSearchParams("q=사과");
  localStorage.clear();
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});
afterEach(() => cleanup());

function setup() {
  const utils = render(
    <>
      <SearchBar syncQueryFromUrl />
      <button type="button" data-testid="outside">지식 패널 링크 자리</button>
      <div role="dialog" aria-modal="true">
        <button type="button" data-testid="dialog-btn">요청 보내기</button>
      </div>
    </>,
  );
  const input = utils.container.querySelector<HTMLInputElement>("input[role='combobox']")!;
  const listbox = () => utils.container.querySelector("[role='listbox']");
  return { ...utils, input, listbox };
}

describe("Tab 으로 들어오면 열지 않는다", () => {
  it("키보드 포커스(포인터 없이) — 리스트박스 없음, aria-expanded=false", () => {
    const { input, listbox } = setup();
    act(() => {
      fireEvent.focus(input);
    });
    expect(listbox()).toBeNull();
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("↓ 키로 연다 — 자동완성(입력값이 첫 후보)", () => {
    const { input, listbox } = setup();
    act(() => {
      fireEvent.focus(input);
    });
    act(() => {
      fireEvent.keyDown(input, { key: "ArrowDown" });
    });
    expect(listbox()).not.toBeNull();
    expect(listbox()?.querySelector("[role='option']")?.textContent).toContain("사과");
  });

  it("빈 입력은 종전대로 포커스로 연다 (최근 검색)", () => {
    currentParams = new URLSearchParams();
    localStorage.setItem("irang-recent-searches", JSON.stringify([{ query: "딸기", date: "" }]));
    const { input, listbox } = setup();
    act(() => {
      fireEvent.focus(input);
    });
    expect(listbox()?.textContent).toContain("딸기");
  });
});

describe("포커스가 밖으로 나가면 닫는다", () => {
  function openByPointer(input: HTMLInputElement) {
    act(() => {
      fireEvent.pointerDown(input);
      fireEvent.focus(input);
    });
  }

  it("Tab 으로 바깥 요소(지식 패널 링크 자리)로 나가면 닫힌다", () => {
    const { input, listbox, getByTestId } = setup();
    openByPointer(input);
    expect(listbox()).not.toBeNull();
    act(() => {
      fireEvent.blur(input, { relatedTarget: getByTestId("outside") });
    });
    expect(listbox()).toBeNull();
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("검색창 안의 링크(전체 검색 결과 보기)로 가면 열린 채", () => {
    const { input, listbox, container } = setup();
    openByPointer(input);
    const inner = [...container.querySelectorAll("a")].find((a) => a.textContent?.includes("전체 검색 결과 보기"))!;
    expect(inner).toBeDefined();
    act(() => {
      fireEvent.blur(input, { relatedTarget: inner });
    });
    expect(listbox()).not.toBeNull();
  });

  it("포털 대화상자로 가는 포커스는 닫지 않는다 (요청 모달이 함께 사라지지 않게)", () => {
    const { input, listbox, getByTestId } = setup();
    openByPointer(input);
    act(() => {
      fireEvent.blur(input, { relatedTarget: getByTestId("dialog-btn") });
    });
    expect(listbox()).not.toBeNull();
  });

  it("relatedTarget 없는 blur(빈 곳 클릭·창 전환)는 바깥 클릭 처리에 맡긴다 — 여기서는 닫지 않는다", () => {
    const { input, listbox } = setup();
    openByPointer(input);
    act(() => {
      fireEvent.blur(input, { relatedTarget: null });
    });
    expect(listbox()).not.toBeNull();
  });
});
