/**
 * 본문 바로가기 (10/8, KWCAG 반복 영역 건너뛰기) — 첫 Tab 에 나타나 헤더·전체 메뉴를 건너뛰고 <main> 으로 간다.
 * 실제 포커스 이동(첫 Tab = 이 링크, Enter 뒤 다음 Tab = 본문 첫 요소)은 dev :3000 Playwright 로 1280·375 랜딩·작물 상세·
 * 지원사업 목록·검색에서 확인했다. 여기서는 연결이 끊기지 않게 고정한다.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { SkipLink } from "@/components/layout/skip-link";
import { MAIN_CONTENT_ID } from "@/components/layout/main-content";
import { HashHighlight } from "@/components/layout/hash-highlight";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

const layoutSrc = readFileSync(path.resolve(__dirname, "../app/layout.tsx"), "utf8");

describe("본문 바로가기", () => {
  it("본문 영역 id 로 가는 링크 하나 — 이름은 '본문 바로가기'", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link", { name: "본문 바로가기" });
    expect(link.getAttribute("href")).toBe(`#${MAIN_CONTENT_ID}`);
  });

  it("루트 레이아웃: 링크가 헤더보다 먼저(첫 Tab), <main> 은 같은 id — tabIndex 는 상시로 두지 않는다", () => {
    const skipAt = layoutSrc.indexOf("<SkipLink />");
    const headerAt = layoutSrc.indexOf("<Header />");
    expect(skipAt).toBeGreaterThan(-1);
    expect(skipAt).toBeLessThan(headerAt);
    expect(layoutSrc).toMatch(/<main id=\{MAIN_CONTENT_ID\}/);
    // 상시 tabindex 는 WebKit 이 버튼 클릭 포커스를 main 에 줘 드롭다운 선택을 지운다(10/8 2차 QA) — 다시 붙지 않게
    const mainTag = layoutSrc.slice(layoutSrc.indexOf("<main"), layoutSrc.indexOf(">", layoutSrc.indexOf("<main")));
    expect(mainTag).not.toMatch(/tabIndex/i);
  });

  it("누르는 순간에만 main 에 tabindex=-1 을 붙여 포커스를 옮기고, 포커스가 떠나면 뗀다", () => {
    const main = document.createElement("main");
    main.id = MAIN_CONTENT_ID;
    document.body.appendChild(main);
    const other = document.createElement("button");
    document.body.appendChild(other);
    try {
      render(<SkipLink />);
      expect(main.hasAttribute("tabindex")).toBe(false);
      act(() => {
        screen.getByRole("link", { name: "본문 바로가기" }).click();
      });
      expect(main.getAttribute("tabindex")).toBe("-1");
      expect(document.activeElement).toBe(main);
      act(() => other.focus());
      expect(main.hasAttribute("tabindex")).toBe(false);
    } finally {
      main.remove();
      other.remove();
    }
  });
});

describe("해시 하이라이트는 본문 전체(<main>)를 깜빡이지 않는다", () => {
  afterEach(() => {
    vi.useRealTimers();
    document.getElementById(MAIN_CONTENT_ID)?.remove();
    window.history.replaceState(null, "", "/");
  });

  it("#main-content 로 와도 main 에 하이라이트 클래스가 붙지 않는다", () => {
    vi.useFakeTimers();
    const main = document.createElement("main");
    main.id = MAIN_CONTENT_ID;
    document.body.appendChild(main);
    window.history.replaceState(null, "", `/#${MAIN_CONTENT_ID}`);
    render(<HashHighlight />);
    act(() => {
      window.dispatchEvent(new HashChangeEvent("hashchange"));
      vi.advanceTimersByTime(400);
    });
    expect(main.classList.contains("hash-target-highlight")).toBe(false);
  });
});
