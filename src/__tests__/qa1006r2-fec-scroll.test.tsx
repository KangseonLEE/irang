/**
 * 10/6 전체 QA 2차 — FE-C 회귀: 포커스·스크롤·하단 바
 *
 * - R2·R3(Q3): sticky 상태 판정 — 흐름 안 sticky 는 띠가 아니고(지역 상세 시·군 패널), 상자 끝에 밀려나는 sticky 는
 *   붙는 자리까지 덮는다(작물 상세 머리). 판정은 lib/scroll-geometry 순수 함수라 숫자로 고정한다.
 * - N3·F1(Q3): 탭 막대의 활성 탭 가운데 맞추기는 **막대 안에서만** 가로로 — scrollIntoView 는 문서까지 세로로 움직이고
 *   (y 2284→286), 마운트 때 부르면 첫 Tab 이 헤더를 건너뛰었다.
 * - N1(Q3): /stats 하단 바는 사이트 푸터가 보이면 숨는다 — 대시보드 안 <footer>(출처 줄)가 아니라 `body > footer`.
 * - N3(Q3): 하단 바가 숨을 때 그 안에 있던 포커스는 인라인 탭으로 옮긴다(BODY 로 떨어지면 화살표가 먹지 않았다).
 * - 체크리스트 H(Q1): "use client" 훅 모듈은 훅만 내보낸다 — 계산은 lib/scroll-geometry.
 * 레이아웃 결과(실제 스크롤 위치)는 jsdom 이 못 재므로 dev :3000 Playwright 실측으로 확인했다(보고서 수치).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { centeredScrollLeft, stickyCoverBand, stickyStateOf } from "@/lib/scroll-geometry";
import { StatsClient } from "@/app/stats/stats-client";

vi.mock("@/components/stats/farming-stats", () => ({ FarmingStats: () => null }));
vi.mock("@/components/stats/village-stats", () => ({ VillageStats: () => null }));
vi.mock("@/components/stats/youth-stats", () => ({ YouthStats: () => null }));
vi.mock("@/components/stats/mountain-stats", () => ({ MountainStats: () => null }));
vi.mock("@/components/stats/smartfarm-stats", () => ({ SmartfarmStats: () => null }));

const root = path.resolve(__dirname, "../..");
const src = (p: string) => readFileSync(path.join(root, p), "utf8");

function rect(top: number, bottom: number, width = 375): DOMRect {
  return { top, bottom, left: 0, right: width, width, height: bottom - top, x: 0, y: top, toJSON() {} } as DOMRect;
}

describe("sticky 상태 — 흐름 안·붙음·밀려남 (R2·R3)", () => {
  it("top 기준: 붙는 자리보다 아래는 흐름 안, 같으면 붙음, 위로 밀려 올라가면 밀려남", () => {
    expect(stickyStateOf("top", { top: 300, bottom: 360 }, 56, 800)).toBe("flow");
    expect(stickyStateOf("top", { top: 56.8, bottom: 116 }, 56, 800)).toBe("stuck");
    expect(stickyStateOf("top", { top: -20, bottom: 40 }, 56, 800)).toBe("pushed");
  });

  it("bottom 기준(화면 아래에 붙는 바)도 같은 규칙", () => {
    // 화면 812, bottom 64 → 붙는 아래 끝 748
    expect(stickyStateOf("bottom", { top: 600, bottom: 700 }, 64, 812)).toBe("flow");
    expect(stickyStateOf("bottom", { top: 648, bottom: 748 }, 64, 812)).toBe("stuck");
    expect(stickyStateOf("bottom", { top: 700, bottom: 800 }, 64, 812)).toBe("pushed");
  });

  it("흐름 안 sticky 는 띠가 아니다 — 지역 상세 시·군 패널이 '여수시' 보정을 막던 경우(R3)", () => {
    expect(stickyCoverBand("top", { top: 300, bottom: 900 }, 80, 800)).toBeNull();
  });

  it("밀려 올라가는 sticky 머리는 붙는 자리(top + 높이)까지 덮는다 — 작물 상세 '지역 비교' 1/3 가림(R2)", () => {
    // 높이 60 의 머리가 top 56 에 붙는데 상자 끝에 밀려 -20~40 에 있다 → 문서를 위로 굴리면 56~116 까지 내려온다
    expect(stickyCoverBand("top", { top: -20, bottom: 40 }, 56, 800)).toEqual({ top: -20, bottom: 116 });
    // 붙어 있으면 지금 자리 그대로
    expect(stickyCoverBand("top", { top: 56, bottom: 116 }, 56, 800)).toEqual({ top: 56, bottom: 116 });
  });

  it("아래로 밀려 내려가는 바는 붙는 자리까지 위로 덮는다", () => {
    expect(stickyCoverBand("bottom", { top: 700, bottom: 800 }, 64, 812)).toEqual({ top: 648, bottom: 800 });
  });
});

describe("탭 막대 안에서만 가로로 가운데 맞추기 (N3·F1)", () => {
  it("항목을 상자 가운데로 — 상자 범위(0 ~ scrollWidth − clientWidth)로 자른다", () => {
    // 상자 300, 전체 900. 항목 600~700 → 가운데면 scrollLeft 500
    expect(centeredScrollLeft(600, 100, 300, 900)).toBe(500);
    // 첫 항목은 0 아래로 가지 않는다
    expect(centeredScrollLeft(10, 80, 300, 900)).toBe(0);
    // 끝 항목은 최대 600 을 넘지 않는다
    expect(centeredScrollLeft(860, 40, 300, 900)).toBe(600);
    // 넘치지 않는 막대는 0
    expect(centeredScrollLeft(100, 80, 300, 280)).toBe(0);
  });

  it("/stats·/costs 탭 막대는 scrollIntoView 를 쓰지 않는다 — 문서가 세로로 튀고 첫 Tab 시작점이 옮겨 갔다", () => {
    for (const file of ["src/app/stats/stats-client.tsx", "src/app/costs/type-filter.tsx"]) {
      const code = src(file).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
      expect(code, file).not.toMatch(/scrollIntoView\s*\(/);
      expect(code, file).toMatch(/centeredScrollLeft\(/);
    }
  });
});

describe("체크리스트 H — 클라이언트 훅 모듈은 훅만 내보낸다", () => {
  it("use-focus-reveal 은 useFocusReveal 하나만 export, 계산 함수는 'use client' 없는 lib/scroll-geometry", () => {
    const hook = src("src/lib/hooks/use-focus-reveal.ts");
    expect(hook.startsWith('"use client"')).toBe(true);
    const exported = [...hook.matchAll(/^export\s+(?:async\s+)?(?:function|const|let|class|type|interface)\s+(\w+)/gm)].map((m) => m[1]);
    expect(exported).toEqual(["useFocusReveal"]);
    expect(hook).toMatch(/from "@\/lib\/scroll-geometry"/);
    expect(src("src/lib/scroll-geometry.ts")).not.toMatch(/^["']use client["']/m);
  });
});

/* ── /stats 하단 바 ─────────────────────────────────────── */

function stubMobile() {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: q.includes("max-width: 767px"),
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

const appended: Element[] = [];
function addFooter(top: number, nested = false): HTMLElement {
  const f = document.createElement("footer");
  f.getBoundingClientRect = () => rect(top, top + 300);
  if (nested) {
    const wrap = document.createElement("div");
    wrap.appendChild(f);
    document.body.appendChild(wrap);
    appended.push(wrap);
  } else {
    document.body.appendChild(f);
    appended.push(f);
  }
  return f;
}

function scroll() {
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
}

function setup() {
  stubMobile();
  const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  render(<StatsClient initialTab="farming" />);
  const [inline, bar] = screen.getAllByRole("tablist", { hidden: true });
  const barBox = bar.closest("nav")!.parentElement!;
  const setInlineBottom = (bottom: number) => {
    inline.getBoundingClientRect = () => rect(bottom - 50, bottom);
  };
  return { inline, bar, barBox, setInlineBottom, scrollSpy };
}

afterEach(() => {
  appended.splice(0).forEach((el) => el.remove());
  vi.restoreAllMocks();
});

describe("/stats 모바일 하단 바 (N1·N3)", () => {
  it("인라인 탭이 화면 위로 사라지면 바가 나오고, 사이트 푸터가 보이면 숨는다 — 대시보드 안 <footer> 는 세지 않는다", () => {
    addFooter(100, true); // 대시보드 출처 줄 같은 섹션 안 footer — 화면 안에 있어도 무시해야 한다
    const site = addFooter(2000); // 사이트 푸터 — 아직 화면 밖
    const { barBox, setInlineBottom } = setup();
    expect(barBox).toHaveAttribute("inert");

    setInlineBottom(-10);
    scroll();
    expect(barBox).not.toHaveAttribute("inert");
    expect(barBox).toHaveAttribute("aria-hidden", "false");

    site.getBoundingClientRect = () => rect(500, 800); // 문서 끝 — 푸터가 화면에 들어왔다
    scroll();
    expect(barBox).toHaveAttribute("inert");
  });

  it("바 안 탭에서 ←/→ — 문서는 움직이지 않고 포커스는 바 안 다음 탭으로", () => {
    const { bar, setInlineBottom, scrollSpy } = setup();
    setInlineBottom(-10);
    scroll();
    const tabs = Array.from(bar.querySelectorAll<HTMLButtonElement>("[role=tab]"));
    act(() => tabs[0].focus());
    fireEvent.keyDown(tabs[0], { key: "ArrowRight" });
    const next = bar.querySelectorAll<HTMLButtonElement>("[role=tab]")[1];
    expect(next).toHaveAttribute("aria-selected", "true");
    expect(document.activeElement).toBe(next);
    expect(scrollSpy).not.toHaveBeenCalled();
  });

  it("바가 숨을 때 포커스가 바 안에 있으면 인라인의 같은 탭으로 옮긴다(스크롤 없이) — BODY 로 떨어지지 않는다", () => {
    const { inline, bar, setInlineBottom } = setup();
    setInlineBottom(-10);
    scroll();
    const barTab = bar.querySelector<HTMLButtonElement>('[role=tab][aria-selected="true"]')!;
    act(() => barTab.focus());
    const focusSpy = vi.spyOn(HTMLElement.prototype, "focus");

    setInlineBottom(200); // 인라인 탭이 다시 보인다 → 바가 숨는다
    scroll();
    const inlineTab = inline.querySelector<HTMLButtonElement>('[role=tab][aria-selected="true"]')!;
    expect(document.activeElement).toBe(inlineTab);
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });
});
