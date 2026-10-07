// @vitest-environment jsdom
/**
 * 10/6 전체 QA 1차 — 통합 검색(FE-S) 화면 회귀 가드
 *  - Q1-F1 교육 결과 카드 상태 배지는 접수 기간에서 파생
 *  - Q4    결과 화면 검색창에 현재 검색어가 채워진다 (주소가 바뀌면 따라 바뀐다)
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
import { ResultCard } from "@/components/search/result-card";
import { EDUCATION_COURSES } from "@/lib/data/education";
import { deriveStatus } from "@/lib/program-status";
import type { SearchItem } from "@/lib/data/search-index";

// jsdom 대역 — 키보드 하이라이트 스크롤·포커스 시 scrollTo
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

const combobox = (c: HTMLElement) => c.querySelector<HTMLInputElement>("input[role='combobox']")!;

describe("교육 결과 카드 — 상태는 접수 기간에서 파생 (Q1-F1)", () => {
  it.each(EDUCATION_COURSES.map((c) => [c.id, c] as const))("%s 배지 = deriveStatus", (_id, course) => {
    const item: SearchItem = {
      type: "education",
      id: course.id,
      title: course.title,
      subtitle: course.description,
      href: `/education/${course.id}`,
      keywords: [],
      icon: "🎓",
    };
    const { container } = render(<ResultCard item={item} query="" highlightCls="hl" rank={1} />);
    const expected = deriveStatus(course.applicationStart, course.applicationEnd);
    const badges = [...container.querySelectorAll("span")].map((s) => s.textContent);
    expect(badges).toContain(expected);
    // 손으로 적은 status 가 기간과 다르면 그 값은 보이지 않는다
    if (course.status !== expected) expect(badges).not.toContain(course.status);
  });
});

describe("결과 화면 검색창 — 현재 검색어를 채운다 (Q4)", () => {
  it("syncQueryFromUrl 이면 ?q= 값으로 시작하고, 아니면 비어 있다", () => {
    const synced = render(<SearchBar syncQueryFromUrl />);
    expect(combobox(synced.container).value).toBe("사과");
    synced.unmount();
    const plain = render(<SearchBar />);
    expect(combobox(plain.container).value).toBe("");
  });

  it("주소의 검색어가 바뀌면(다른 검색·뒤로가기) 입력도 따라 바뀐다", () => {
    const { container, rerender } = render(<SearchBar syncQueryFromUrl />);
    expect(combobox(container).value).toBe("사과");
    currentParams = new URLSearchParams("q=딸기");
    rerender(<SearchBar syncQueryFromUrl />);
    expect(combobox(container).value).toBe("딸기");
  });

  it("주소가 그대로면 사용자가 고친 글자를 덮지 않는다", () => {
    const { container, rerender } = render(<SearchBar syncQueryFromUrl />);
    fireEvent.change(combobox(container), { target: { value: "사과 소득" } });
    rerender(<SearchBar syncQueryFromUrl />);
    expect(combobox(container).value).toBe("사과 소득");
  });

  it("채워진 채로 누르면(포인터) 자동완성이 뜨고 '검색어가 없어요' 안내는 뜨지 않는다", () => {
    const { container } = render(<SearchBar syncQueryFromUrl />);
    act(() => {
      fireEvent.pointerDown(combobox(container));
      fireEvent.focus(combobox(container));
    });
    expect(container.querySelector("[role='listbox']")).not.toBeNull();
    expect(container.textContent).not.toContain("검색어가 없어요");
  });

  it("읽기 전용 표시(모바일)는 placeholder 대신 현재 검색어를 보여준다", () => {
    const filled = render(<SearchBar readOnlyDisplay syncQueryFromUrl placeholder="지역, 작물 검색" />);
    expect(filled.container.textContent).toContain("사과");
    expect(filled.container.textContent).not.toContain("지역, 작물 검색");
    filled.unmount();
    currentParams = new URLSearchParams();
    const empty = render(<SearchBar readOnlyDisplay syncQueryFromUrl placeholder="지역, 작물 검색" />);
    expect(empty.container.textContent).toContain("지역, 작물 검색");
  });
});
