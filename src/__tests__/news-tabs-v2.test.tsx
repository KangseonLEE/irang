import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { NewsTabsV2 } from "@/components/landing/news-tabs-v2";
import type { UnifiedNewsItem } from "@/components/landing/news-tabs";

/**
 * 랜딩 농촌 소식 — 썸네일 카드의 토글 버튼과 (모바일) 펼침 링크는 **형제**여야 한다 (10/3 QA axe nested-interactive).
 * 예전엔 카드 자체가 <button> 이고 그 안에 기사 <a> 가 있었다.
 */
const ITEMS: UnifiedNewsItem[] = [
  { title: "첫 소식", source: "농민신문", date: "2026.10.01", url: "https://example.com/1", category: "policy" },
  { title: "둘째 소식", source: "한국농어민신문", date: "2026.09.30", url: "https://example.com/2", category: "policy", description: "요약" },
  { title: "셋째 소식", source: "농촌진흥청", date: "2026.09.29", url: "https://example.com/3", category: "education" },
];

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("NewsTabsV2 썸네일 내비게이션", () => {
  it("버튼 안에 링크가 없고(그 반대도), 카드마다 토글 버튼 1개 + 기사 링크 1개", () => {
    const { container } = render(<NewsTabsV2 items={ITEMS} />);
    expect(container.querySelectorAll("button a, a button").length).toBe(0);
    const toggles = Array.from(container.querySelectorAll("button[aria-current], button[type='button']:not([role='tab'])"));
    expect(toggles).toHaveLength(ITEMS.length);
    for (const t of toggles) {
      const card = t.parentElement!;
      expect(card.querySelectorAll("button")).toHaveLength(1);
      expect(card.querySelectorAll("a[href]")).toHaveLength(1);
    }
  });

  it("토글 버튼 이름은 제목·출처 — 기사 링크의 설명 문구가 섞이지 않는다", () => {
    const { container } = render(<NewsTabsV2 items={ITEMS} />);
    const second = Array.from(container.querySelectorAll("button:not([role='tab'])"))[1] as HTMLButtonElement;
    expect(second.textContent).toContain("둘째 소식");
    expect(second.textContent).not.toContain("요약");
  });

  it("토글을 누르면 그 카드가 현재 소식(aria-current)이 된다", () => {
    const { container } = render(<NewsTabsV2 items={ITEMS} />);
    const toggles = Array.from(container.querySelectorAll<HTMLButtonElement>("button:not([role='tab'])"));
    expect(toggles[0]).toHaveAttribute("aria-current", "true");
    fireEvent.click(toggles[2]);
    act(() => {
      vi.advanceTimersByTime(400); // 페이드 아웃(150) → 교체
    });
    const after = Array.from(container.querySelectorAll<HTMLButtonElement>("button:not([role='tab'])"));
    expect(after[2]).toHaveAttribute("aria-current", "true");
    expect(after[0]).not.toHaveAttribute("aria-current");
  });
});

describe("NewsTabsV2 키보드 포커스 (10/4 QA — 모바일 펼침 시 포커스 소실 회귀)", () => {
  it("포커스된 토글로 펼치면 포커스가 그 카드의 기사 링크로 간다 (토글이 숨는 모바일 — jsdom 은 offsetParent 가 항상 null)", () => {
    const { container } = render(<NewsTabsV2 items={ITEMS} />);
    const toggles = Array.from(container.querySelectorAll<HTMLButtonElement>("button:not([role='tab'])"));
    toggles[1].focus();
    fireEvent.click(toggles[1]);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    const link = toggles[1].parentElement!.querySelector("a")!;
    expect(document.activeElement).toBe(link);
  });

  it("마우스로 누른 토글(포커스 없음)은 포커스를 옮기지 않는다", () => {
    const { container } = render(<NewsTabsV2 items={ITEMS} />);
    const toggles = Array.from(container.querySelectorAll<HTMLButtonElement>("button:not([role='tab'])"));
    (document.activeElement as HTMLElement | null)?.blur();
    fireEvent.click(toggles[2]);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(document.activeElement).toBe(document.body);
  });

  /** jsdom 은 프로그램 포커스를 :focus-visible 로 보지 않는다 — 키보드/마우스 포커스를 흉내 낸다 */
  function mockFocusVisible(visible: boolean) {
    const original = Element.prototype.matches;
    return vi.spyOn(Element.prototype, "matches").mockImplementation(function (this: Element, selector: string) {
      return selector === ":focus-visible" ? visible : original.call(this, selector);
    });
  }

  it("키보드 포커스(:focus-visible)가 카드 목록 안에 있는 동안 자동 넘김이 멈춘다", () => {
    const spy = mockFocusVisible(true);
    const { container } = render(<NewsTabsV2 items={ITEMS} />);
    const toggles = Array.from(container.querySelectorAll<HTMLButtonElement>("button:not([role='tab'])"));
    act(() => {
      toggles[0].focus();
    });
    act(() => {
      vi.advanceTimersByTime(12000); // 자동 넘김 5초 × 2 이상
    });
    const after = Array.from(container.querySelectorAll<HTMLButtonElement>("button:not([role='tab'])"));
    expect(after[0]).toHaveAttribute("aria-current", "true");
    spy.mockRestore();
  });

  it("마우스로 생긴 포커스(:focus-visible 아님)는 자동 넘김을 멈추지 않는다 — 클릭 뒤 이탈하면 다시 넘어간다", () => {
    const spy = mockFocusVisible(false);
    const { container } = render(<NewsTabsV2 items={ITEMS} />);
    const toggles = Array.from(container.querySelectorAll<HTMLButtonElement>("button:not([role='tab'])"));
    act(() => {
      toggles[0].focus();
    });
    act(() => {
      vi.advanceTimersByTime(5600); // 자동 넘김 1회 + 페이드
    });
    const after = Array.from(container.querySelectorAll<HTMLButtonElement>("button:not([role='tab'])"));
    expect(after[1]).toHaveAttribute("aria-current", "true");
    spy.mockRestore();
  });
});

