import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";

/**
 * /search 모바일 검색창 — 오버레이는 click 에서만 연다 (10/2 QA C-Y5).
 * 예전 pointerup 판정은 손을 떼는 순간 오버레이를 열어, 뒤따른 click 이 오버레이 안 링크('작물 정보')에 떨어졌다.
 */
vi.mock("@/components/search/search-bar", () => ({
  default: ({ readOnlyDisplay }: { readOnlyDisplay?: boolean }) => (
    <div data-testid="search-bar" data-readonly={readOnlyDisplay ? "1" : "0"} />
  ),
}));

import SearchPageSearchBar from "@/components/search/search-page-search-bar";
import { SearchOverlayProvider } from "@/components/search/search-overlay";

function setViewport(mobile: boolean) {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: q.includes("max-width: 639px") ? mobile : false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

function setup() {
  return render(
    <SearchOverlayProvider>
      <SearchPageSearchBar />
    </SearchOverlayProvider>,
  );
}

const overlayOpen = () => document.querySelector("[role='dialog'][aria-label='통합 검색']") !== null;

beforeEach(() => {
  (window as unknown as { gtag: unknown }).gtag = vi.fn();
});

describe("SearchPageSearchBar — 모바일", () => {
  beforeEach(() => setViewport(true));

  it("누르고 떼기(pointerdown·pointerup)만으로는 열지 않는다 — click 이 와야 연다", () => {
    const { getByRole } = setup();
    const trigger = getByRole("button", { name: "통합 검색 열기" });
    fireEvent.pointerDown(trigger, { clientX: 100, clientY: 200 });
    fireEvent.pointerUp(trigger, { clientX: 100, clientY: 200 });
    expect(overlayOpen()).toBe(false);
    act(() => {
      fireEvent.click(trigger);
    });
    expect(overlayOpen()).toBe(true);
  });

  it("키보드 Enter·Space 로도 연다", () => {
    const { getByRole, unmount } = setup();
    act(() => {
      fireEvent.keyDown(getByRole("button", { name: "통합 검색 열기" }), { key: "Enter" });
    });
    expect(overlayOpen()).toBe(true);
    unmount();
    const second = setup();
    act(() => {
      fireEvent.keyDown(second.getByRole("button", { name: "통합 검색 열기" }), { key: " " });
    });
    expect(overlayOpen()).toBe(true);
  });

  it("읽기 전용 모양의 검색창을 감싼다", () => {
    const { getByTestId } = setup();
    expect(getByTestId("search-bar")).toHaveAttribute("data-readonly", "1");
  });
});

describe("SearchPageSearchBar — 데스크탑", () => {
  beforeEach(() => setViewport(false));

  it("버튼 역할 없이 실제 검색창(인라인)을 그린다", () => {
    const { queryByRole, getByTestId } = setup();
    expect(queryByRole("button", { name: "통합 검색 열기" })).toBeNull();
    expect(getByTestId("search-bar")).toHaveAttribute("data-readonly", "0");
  });
});
