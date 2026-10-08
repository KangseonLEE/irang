/**
 * 본문 바로가기 (10/8, KWCAG 반복 영역 건너뛰기) — 첫 Tab 에 나타나 헤더·전체 메뉴를 건너뛰고 <main> 으로 간다.
 * 실제 포커스 이동(첫 Tab = 이 링크, Enter 뒤 다음 Tab = 본문 첫 요소)은 dev :3000 Playwright 로 1280·375 랜딩·작물 상세·
 * 지원사업 목록·검색에서 확인했다. 여기서는 연결이 끊기지 않게 고정한다.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { SkipLink, MAIN_CONTENT_ID } from "@/components/layout/skip-link";
import { HashHighlight } from "@/components/layout/hash-highlight";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

const layoutSrc = readFileSync(path.resolve(__dirname, "../app/layout.tsx"), "utf8");

describe("본문 바로가기", () => {
  it("본문 영역 id 로 가는 링크 하나 — 이름은 '본문 바로가기'", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link", { name: "본문 바로가기" });
    expect(link.getAttribute("href")).toBe(`#${MAIN_CONTENT_ID}`);
  });

  it("루트 레이아웃: 링크가 헤더보다 먼저(첫 Tab), <main> 은 같은 id + tabIndex -1(포커스가 실제로 넘어온다)", () => {
    const skipAt = layoutSrc.indexOf("<SkipLink />");
    const headerAt = layoutSrc.indexOf("<Header />");
    expect(skipAt).toBeGreaterThan(-1);
    expect(skipAt).toBeLessThan(headerAt);
    expect(layoutSrc).toMatch(/<main id=\{MAIN_CONTENT_ID\} tabIndex=\{-1\}/);
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
