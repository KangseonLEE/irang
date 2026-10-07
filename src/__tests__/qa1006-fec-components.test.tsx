import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { createRef } from "react";
import { TermTooltip } from "@/components/ui/term-tooltip";
import { SnapDots } from "@/components/ui/snap-dots";
import { AnchorTabNav } from "@/components/ui/anchor-tab-nav";
import { CrawlGroupNote } from "@/components/ui/crawl-group-note";
import { GlossaryClient } from "@/app/glossary/glossary-client";
import { TrendCostSection } from "@/components/landing/trend-cost-section";
import { ExperienceSection, OpportunitySection } from "@/components/landing/discover-section";
import { kstToday, type ProgramStatus } from "@/lib/program-status";
import type { GlossaryCategory, GlossaryEntry } from "@/lib/data/glossary";
import type { SupportProgram } from "@/lib/data/programs";
import type { FarmEvent } from "@/lib/data/events";

vi.mock("next/navigation", () => ({
  usePathname: () => "/glossary",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

/**
 * 10/6 전체 QA 1차 — FE-C 컴포넌트 동작 회귀 가드.
 * jsdom 은 레이아웃·:focus-visible 이 없어 스크롤 결과는 Playwright 실측으로 보고, 여기서는 역할·포커스·상태 전이만 본다.
 */

function stubBrowserApis(desktop = true) {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: q.includes("min-width: 1024px") ? desktop : q.includes("max-width: 767px") ? !desktop : false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
  class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  Object.defineProperty(window, "IntersectionObserver", { writable: true, value: IO });
  Object.defineProperty(globalThis, "IntersectionObserver", { writable: true, value: IO });
  const proto = HTMLElement.prototype as unknown as { scrollTo?: unknown; scrollIntoView?: unknown };
  proto.scrollTo = () => {};
  proto.scrollIntoView = () => {};
}

afterEach(() => {
  vi.restoreAllMocks();
});

/* ── 용어 툴팁 (Q4-W8) ─────────────────────────────────────── */
describe("TermTooltip — hover 는 마우스만, 클릭은 늘 열기(고정)", () => {
  const open = () => document.body.textContent?.includes("1헥타르는 10,000㎡예요") ?? false;

  it("데스크탑 — hover 로 열린 뒤 클릭해도 닫히지 않고(고정), 마우스가 떠나도 유지, 다시 클릭하면 닫힌다", () => {
    vi.useFakeTimers();
    render(<TermTooltip term="ha" description="1헥타르는 10,000㎡예요" />);
    const term = screen.getByRole("button", { name: "ha" });
    const wrapper = term.parentElement!;
    fireEvent.pointerEnter(wrapper, { pointerType: "mouse" });
    expect(open()).toBe(true);
    fireEvent.click(term);
    expect(open()).toBe(true); // 예전엔 여기서 닫혔다
    fireEvent.pointerLeave(wrapper, { pointerType: "mouse" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(open()).toBe(true);
    fireEvent.click(term);
    expect(open()).toBe(false);
    vi.useRealTimers();
  });

  it("데스크탑 — 고정하지 않은 hover 미리보기는 마우스가 떠나면 닫힌다", () => {
    vi.useFakeTimers();
    render(<TermTooltip term="ha" description="1헥타르는 10,000㎡예요" />);
    const wrapper = screen.getByRole("button", { name: "ha" }).parentElement!;
    fireEvent.pointerEnter(wrapper, { pointerType: "mouse" });
    expect(open()).toBe(true);
    fireEvent.pointerLeave(wrapper, { pointerType: "mouse" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(open()).toBe(false);
    vi.useRealTimers();
  });

  it("터치 — 탭이 만드는 pointerenter(touch)로는 열리지 않고, 첫 탭(click)에 바로 열린다", () => {
    render(<TermTooltip term="ha" description="1헥타르는 10,000㎡예요" />);
    const term = screen.getByRole("button", { name: "ha" });
    fireEvent.pointerEnter(term.parentElement!, { pointerType: "touch" });
    expect(open()).toBe(false);
    fireEvent.click(term);
    expect(open()).toBe(true); // 예전엔 첫 탭에 열렸다 바로 닫혔다
    expect(term).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(term);
    expect(open()).toBe(false);
  });

  it("키보드 — Enter 로 열고 Esc 로 닫는다", () => {
    render(<TermTooltip term="ha" description="1헥타르는 10,000㎡예요" />);
    const term = screen.getByRole("button", { name: "ha" });
    fireEvent.keyDown(term, { key: "Enter" });
    expect(open()).toBe(true);
    fireEvent.keyDown(term, { key: "Escape" });
    expect(open()).toBe(false);
  });
});

/* ── 위치 점 (Q3 ⚪) ─────────────────────────────────────── */
describe("SnapDots — 탭이 아니라 버튼 묶음 + 지금 위치", () => {
  it("role=group, 점은 버튼, 첫 점에 aria-current", () => {
    const ref = createRef<HTMLUListElement>();
    render(
      <>
        <ul ref={ref}>
          <li>a</li>
          <li>b</li>
        </ul>
        <SnapDots trackRef={ref} count={2} label="카드 위치" />
      </>,
    );
    expect(screen.getByRole("group", { name: "카드 위치" })).toBeInTheDocument();
    expect(screen.queryAllByRole("tab")).toHaveLength(0);
    const dots = screen.getAllByRole("button");
    expect(dots[0]).toHaveAttribute("aria-current", "true");
    expect(dots[1]).not.toHaveAttribute("aria-current");
  });
});

/* ── 섹션 탭 (Q3 ⚪) ─────────────────────────────────────── */
describe("AnchorTabNav — 활성 탭 aria-current", () => {
  it("첫 섹션 탭에 aria-current=true", () => {
    stubBrowserApis();
    render(
      <AnchorTabNav
        sections={[
          { id: "q-a", label: "개요" },
          { id: "q-b", label: "지원" },
        ]}
      />,
    );
    expect(screen.getByRole("button", { name: "개요" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: "지원" })).not.toHaveAttribute("aria-current");
  });
});

/* ── 용어집 목록 구조 (Q3-🟡11) ─────────────────────────────────────── */
describe("GlossaryClient — 목록 역할 없이 초성 구획 + APG 아코디언", () => {
  const entries: GlossaryEntry[] = [
    { slug: "ha", term: "ha", shortDesc: "헥타르", longDesc: "1ha = 10,000㎡", category: "unit", related: ["10a"] },
    { slug: "10a", term: "10a", shortDesc: "10아르", longDesc: "1,000㎡", category: "unit" },
  ] as GlossaryEntry[];
  const labels = { unit: "단위" } as Record<GlossaryCategory, string>;

  it("role=list 가 없고, 용어는 h3 안 버튼(aria-expanded)으로 펼친다 — 펼친 뒤 관련 용어 버튼이 버튼 속 버튼이 아니다", () => {
    stubBrowserApis();
    render(<GlossaryClient entries={entries} categoryLabels={labels} />);
    expect(document.querySelector('[role="list"]')).toBeNull();
    const toggle = screen.getByRole("button", { name: /^ha\s*헥타르/ });
    expect(toggle.closest("h3")).not.toBeNull();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const panel = document.getElementById(toggle.getAttribute("aria-controls")!);
    expect(panel?.textContent).toContain("1ha = 10,000㎡");
    const related = screen.getByRole("button", { name: "10a" });
    expect(related.closest('[role="button"]')).toBeNull();
    expect(toggle.contains(related)).toBe(false);
  });
});

/* ── 같은 사업 다른 지역 칩 ─────────────────────────────────────── */
describe("CrawlGroupNote — 같은 지역 칩 구분", () => {
  it("같은 지역이 겹치면 칩마다 구분 값(데이터 없으면 순번)을 붙인다 — 겹치지 않는 지역은 그대로", () => {
    const html = renderToStaticMarkup(
      <CrawlGroupNote
        basePath="/education"
        group={{
          size: 4,
          others: [
            { id: "c1", region: "서울특별시", status: "모집중" },
            { id: "c2", region: "서울특별시", status: "모집중" },
            { id: "c3", region: "경기도", status: "마감" },
          ],
        }}
      />,
    );
    const chips = [...html.matchAll(/<a [^>]*>(.*?)<\/a>/g)].map((m) => m[1].replace(/<[^>]+>/g, "|"));
    expect(chips[0]).toContain("|1|");
    expect(chips[1]).toContain("|2|");
    expect(chips[2]).not.toMatch(/\|\d\|/);
    expect(chips[2]).toContain("마감");
  });
});

/* ── 랜딩 트렌드·비용 탭 (Q3 ⚪) ─────────────────────────────────────── */
describe("TrendCostSection — 탭 역할과 동작(roving + ←/→ + 패널)", () => {
  beforeEach(() => stubBrowserApis(true));

  it("Tab 은 활성 탭 하나에만, → 로 다음 탭이 선택·포커스되고 두 tablist 가 같은 패널을 가리킨다", () => {
    render(<TrendCostSection />);
    const inline = screen.getByRole("tablist", { name: "정착 유형 선택" });
    const tabs = Array.from(inline.querySelectorAll<HTMLButtonElement>("[role=tab]"));
    expect(tabs.filter((t) => t.tabIndex === 0)).toHaveLength(1);
    const panelId = tabs[0].getAttribute("aria-controls")!;
    const panel = document.getElementById(panelId)!;
    expect(panel).toHaveAttribute("role", "tabpanel");
    expect(panel).toHaveAttribute("aria-labelledby", tabs[0].id);

    act(() => tabs[0].focus());
    fireEvent.keyDown(tabs[0], { key: "ArrowRight" });
    const after = Array.from(inline.querySelectorAll<HTMLButtonElement>("[role=tab]"));
    expect(after[1]).toHaveAttribute("aria-selected", "true");
    expect(document.activeElement).toBe(after[1]);
    expect(panel).toHaveAttribute("aria-labelledby", after[1].id);

    // 하단 고정 묶음(포털)도 같은 패널, 다른 id
    const sticky = screen.getByRole("tablist", { name: "정착 유형 선택 (고정)", hidden: true });
    const stickyTabs = Array.from(sticky.querySelectorAll<HTMLButtonElement>("[role=tab]"));
    expect(stickyTabs[0].getAttribute("aria-controls")).toBe(panelId);
    const ids = [...after, ...stickyTabs].map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);

    // End/Home
    fireEvent.keyDown(after[1], { key: "End" });
    expect(inline.querySelectorAll("[role=tab]")[after.length - 1]).toHaveAttribute("aria-selected", "true");
  });
});

/* ── 랜딩 체험·행사 캐러셀 (Q3-🟡4) ─────────────────────────────────────── */
function inDays(days: number): string {
  return kstToday(Date.now() + days * 86_400_000);
}

function stay(id: string, title: string): FarmEvent {
  return {
    id,
    title,
    region: "경상북도",
    sigungu: "영양군",
    organization: "영양군",
    type: "살아보기",
    date: "2026-10-01",
    dateEnd: "2026-11-30",
    applicationStart: "2026-09-09",
    applicationEnd: inDays(90),
    location: "경북 영양군",
    cost: "무료",
    description: "마을에서 살아보는 프로그램이에요.",
    capacity: 5,
    target: "귀농 희망자",
    url: "https://www.greendaero.go.kr/",
    status: "접수중",
  } as FarmEvent;
}

describe("체험·행사 캐러셀 — ←/→ 는 포커스도 옮긴다(roving)", () => {
  beforeEach(() => stubBrowserApis(true));

  it("카드에 포커스가 있을 때 → 를 누르면 다음 카드로 포커스가 간다 — 제어 버튼에선 그대로", () => {
    render(
      <ExperienceSection
        events={[
          stay("e1", "대티골마을 농촌에서 살아보기 (귀농형)"),
          stay("e2", "청해진마을 농촌에서 살아보기 (귀촌형)"),
          stay("e3", "율곡마을 농촌에서 살아보기 (귀촌형)"),
        ]}
      />,
    );
    const cards = document.querySelectorAll<HTMLAnchorElement>('a[data-track="discover:experience:card"]');
    act(() => cards[0].focus());
    fireEvent.keyDown(cards[0], { key: "ArrowRight" });
    expect(document.activeElement).toBe(cards[1]);
    fireEvent.keyDown(cards[1], { key: "ArrowLeft" });
    expect(document.activeElement).toBe(cards[0]);
    // 맨 앞에서 ← 는 마지막 카드로(goTo 와 같은 순환)
    fireEvent.keyDown(cards[0], { key: "ArrowLeft" });
    expect(document.activeElement).toBe(cards[2]);

    const next = screen.getByRole("button", { name: "다음 카드" });
    act(() => next.focus());
    fireEvent.keyDown(next, { key: "ArrowRight" });
    expect(document.activeElement).toBe(next);
  });
});

/* ── 랜딩 지원사업 카드 — 수집 행 기본값 숨김 (Q1-F2) ─────────────────────────────────────── */
describe("지원사업 카드 — 수집 행의 수집기 기본값(연령 18~65·보조금)은 싣지 않는다", () => {
  function program(over: Partial<SupportProgram> & { id: string }) {
    return {
      title: "청년농업인 영농정착지원사업 공고",
      category: "settlement",
      region: "전국",
      organization: "농림축산식품부",
      supportType: "보조금",
      supportAmount: "상세 공고 참조",
      eligibilityAgeMin: 18,
      eligibilityAgeMax: 65,
      eligibility: "",
      applicationStart: "2026-09-01",
      applicationEnd: inDays(30),
      summary: "",
      sourceUrl: "https://example.go.kr/",
      programStatus: "모집중" as ProgramStatus,
      ...over,
    } as SupportProgram & { programStatus: ProgramStatus };
  }

  it("crawl-* 행은 연령·유형 칩이 없고, 큐레이션 행(SP-*)은 그대로", () => {
    const html = renderToStaticMarkup(
      <OpportunitySection
        activePrograms={[program({ id: "crawl-agrix-programs-x1" }), program({ id: "SP-900", title: "큐레이션 사업" })]}
        ongoingPrograms={[]}
        courses={[]}
      />,
    );
    const cardOf = (id: string) => {
      const start = html.indexOf(`href="/programs/${id}"`);
      return html.slice(start, html.indexOf("</a>", start));
    };
    expect(cardOf("crawl-agrix-programs-x1")).not.toContain("만 18~65세");
    expect(cardOf("crawl-agrix-programs-x1")).not.toContain("보조금");
    expect(cardOf("SP-900")).toContain("만 18~65세");
    expect(cardOf("SP-900")).toContain("보조금");
  });
});
