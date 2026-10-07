/**
 * 10/6 전체 QA 2차 — FE-C 회귀: 랜딩 히어로 수치 ↔ 도착 목록, 용어집 관련 용어 포커스, 진단 배너 넘침
 *
 * - R2-Q4 ⚪2: "모집 중인 교육 62개 과정" → /education 110건, "신청 중인 살아보기 11곳" → /events 16건(살아보기만 12건).
 *   숫자는 같은 과정의 시간대별 행을 묶어 셌고, 링크는 다른 조건의 목록으로 갔다. 이제 숫자 = 링크 목록의 "검색 결과 N건".
 * - R2-Q3 F5: 관련 용어 버튼은 접히는 카드 안에 있어, 누르면 포커스가 BODY 로 떨어졌다 → 옮겨 간 용어의 펼침 버튼으로.
 *   지금 필터에 안 보이는 용어(다른 카테고리 76쌍)는 필터를 풀고 간다 — 예전엔 지금 카드만 접히고 아무 데도 안 갔다.
 * - R2-Q3 F9: 진단 배너 버튼의 터치 영역(::after)이 좌우로 4px 나가 scrollWidth 가 넘쳤다 → 위아래로만.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  PROGRAMS_DUE_HREF,
  PROGRAMS_OPEN_HREF,
  STAY_FILTER,
  STAY_OPEN_HREF,
  listStat,
} from "@/components/landing/hero-search-hub";
import { LIST_PAGE_NORMALIZE_OPTIONS, normalizeSearchParams } from "@/lib/search-params/normalize";
import { EVENT_TYPES } from "@/lib/data/events";
import { GlossaryClient } from "@/app/glossary/glossary-client";
import type { GlossaryCategory, GlossaryEntry } from "@/lib/data/glossary";

vi.mock("next/navigation", () => ({
  usePathname: () => "/glossary",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const root = path.resolve(__dirname, "../..");
const src = (p: string) => readFileSync(path.join(root, p), "utf8");

afterEach(() => {
  vi.restoreAllMocks();
});

/* ── 히어로 수치 ─────────────────────────────────────── */
describe("히어로 수치 = 누르면 나오는 목록의 건수 (R2-Q4)", () => {
  it("listStat — 숫자는 목록 건수 그대로(묶지 않는다), 단위는 목록 화면과 같은 '건'", () => {
    const items = [{ status: "모집중" }, { status: "모집중" }, { status: "모집중" }];
    expect(
      listStat({ id: "education_open", items, openStatus: "모집중", openLabel: "모집 중인 교육", mixedLabel: "모집 중·예정 교육", href: "/education" }),
    ).toEqual({ id: "education_open", label: "모집 중인 교육", value: 3, unit: "건", href: "/education" });
  });

  it("listStat — 목록에 예정 건이 섞이면 '모집 중인'이라 부르지 않는다(숫자에서 빼면 목록과 또 어긋난다)", () => {
    const stat = listStat({
      id: "stay_open",
      items: [{ status: "접수중" }, { status: "접수예정" }],
      openStatus: "접수중",
      openLabel: "신청 중인 살아보기",
      mixedLabel: "모집 중·예정 살아보기",
      href: STAY_OPEN_HREF,
    });
    expect(stat.label).toBe("모집 중·예정 살아보기");
    expect(stat.value).toBe(2);
  });

  it("수치 링크는 정규화(normalize)를 그대로 통과한다 — 308 strip 이면 숫자와 다른 목록이 열린다", () => {
    for (const href of [PROGRAMS_OPEN_HREF, PROGRAMS_DUE_HREF, STAY_OPEN_HREF]) {
      const url = new URL(href, "https://irangfarm.com");
      const options = LIST_PAGE_NORMALIZE_OPTIONS[url.pathname];
      expect(options, href).toBeDefined();
      const { cleaned, changed } = normalizeSearchParams(url.searchParams, options);
      expect(changed, href).toBe(false);
      expect(cleaned.toString(), href).toBe(url.searchParams.toString());
    }
  });

  it("살아보기 링크와 숫자는 같은 조건 객체(STAY_FILTER)에서 나오고, 그 유형은 실제 체험 유형이다", () => {
    expect(EVENT_TYPES).toContain(STAY_FILTER.type);
    expect(new URL(STAY_OPEN_HREF, "https://irangfarm.com").searchParams.get("type")).toBe(STAY_FILTER.type);
    const page = src("src/app/page.tsx");
    expect(page).toMatch(/filterEventsAsync\(STAY_FILTER\)/);
    expect(page).toMatch(/href:\s*STAY_OPEN_HREF/);
  });

  it("교육 숫자는 /education 이 조건 없이 열릴 때와 같은 조건(이번 달 period)으로 센다", () => {
    const page = src("src/app/page.tsx");
    expect(page).toMatch(/filterEducationAsync\(\{\s*period:\s*getCurrentPeriod\(\)\s*\}\)/);
    expect(page).toMatch(/href:\s*"\/education"/);
    // /education 의 기본 조건이 바뀌면 히어로도 같이 바꿔야 한다 — 여기서 걸린다
    expect(src("src/app/education/page.tsx")).toMatch(/period\s*=\s*params\.period\s*\|\|\s*getCurrentPeriod\(\)/);
    // 시간대별 행을 묶어 세던 방식은 목록 건수와 달라 쓰지 않는다
    expect(page).not.toMatch(/countDistinctByGroup/);
  });
});

/* ── 용어집 관련 용어 ─────────────────────────────────────── */
describe("용어집 관련 용어 — 옮겨 간 용어로 포커스 (F5)", () => {
  const entries = [
    { slug: "ha", term: "ha", shortDesc: "헥타르", longDesc: "1ha = 10,000㎡", category: "unit", related: ["10a", "작부체계", "없는용어"] },
    { slug: "10a", term: "10a", shortDesc: "10아르", longDesc: "1,000㎡", category: "unit", related: ["ha"] },
    { slug: "작부체계", term: "작부체계", shortDesc: "연간 재배 순서", longDesc: "어떤 작물을 어떤 순서로", category: "cultivation" },
  ] as GlossaryEntry[];
  const labels = { unit: "단위", cultivation: "재배" } as Record<GlossaryCategory, string>;

  function setup() {
    const proto = HTMLElement.prototype as unknown as { scrollIntoView?: unknown };
    proto.scrollIntoView = () => {};
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => window.setTimeout(() => cb(0), 0));
    render(<GlossaryClient entries={entries} categoryLabels={labels} />);
  }
  const toggleOf = (slug: string) => document.getElementById(slug)!.querySelector<HTMLButtonElement>("h3 button")!;
  const flush = () => act(async () => {
    await new Promise((r) => setTimeout(r, 5));
  });

  it("관련 용어 버튼을 누르면 그 용어가 펼쳐지고 펼침 버튼에 포커스가 간다(스크롤은 한 번 — preventScroll)", async () => {
    setup();
    fireEvent.click(toggleOf("ha"));
    const related = screen.getByRole("button", { name: "10a" });
    act(() => related.focus());
    const focusSpy = vi.spyOn(HTMLElement.prototype, "focus");
    fireEvent.click(related);
    await flush();
    expect(toggleOf("10a")).toHaveAttribute("aria-expanded", "true");
    expect(toggleOf("ha")).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(toggleOf("10a"));
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  it("지금 카테고리 필터에 없는 용어면 필터를 풀고 간다", async () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "단위" }));
    expect(document.getElementById("작부체계")).toBeNull();
    fireEvent.click(toggleOf("ha"));
    fireEvent.click(screen.getByRole("button", { name: "작부체계" }));
    await flush();
    expect(screen.getByRole("button", { name: "전체" })).toHaveAttribute("aria-pressed", "true");
    expect(toggleOf("작부체계")).toHaveAttribute("aria-expanded", "true");
    expect(document.activeElement).toBe(toggleOf("작부체계"));
  });

  it("없는 용어를 가리키면 아무것도 바꾸지 않는다 — 지금 카드가 접혀 포커스를 잃지 않게", async () => {
    setup();
    fireEvent.click(toggleOf("ha"));
    const broken = screen.getByRole("button", { name: "없는용어" });
    act(() => broken.focus());
    fireEvent.click(broken);
    await flush();
    expect(toggleOf("ha")).toHaveAttribute("aria-expanded", "true");
    expect(document.activeElement).toBe(broken);
  });
});

/* ── 진단 배너 버튼 ─────────────────────────────────────── */
describe("진단 배너 버튼 터치 영역 (F9)", () => {
  it("::after 는 위아래로만 넓힌다 — 좌우로 나가면 링크 scrollWidth 가 넘친다", () => {
    const css = src("src/components/persona/persona-cta.module.css");
    const block = css.match(/\.cta::after\s*\{([^}]*)\}/)?.[1] ?? "";
    const inset = block.match(/inset:\s*([^;]+);/)?.[1].trim().split(/\s+/) ?? [];
    expect(inset[0]).toBe("-5px");
    expect(["0", "0px"]).toContain(inset[1]);
    expect(inset.length).toBe(2);
  });
});
