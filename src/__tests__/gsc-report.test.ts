import { describe, expect, it } from "vitest";
import { pageType, monthRange, prevMonth, halves, summarize, byType, summarizeInspection, renderReport } from "../../scripts/watchman/gsc-report.mjs";

/** 서치 콘솔 월간 보고서 계산·렌더링 (2026-10-06) — 9월 수동 분석과 같은 잣대 */

type Row = { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number };
const row = (key: string | null, clicks: number, impressions: number, position: number): Row => ({
  ...(key ? { keys: [key] } : {}),
  clicks,
  impressions,
  ctr: impressions ? clicks / impressions : 0,
  position,
});
const U = (p: string) => `https://irangfarm.com${p}`;

describe("기본 계산", () => {
  it("페이지 유형 — 9월 분석 분류", () => {
    expect(pageType(U("/"))).toBe("랜딩");
    expect(pageType(U("/crops/blueberry"))).toBe("작물-상세");
    expect(pageType(U("/crops/compare"))).toBe("작물-목록·비교");
    expect(pageType(U("/programs/SP-018"))).toBe("지원사업-상세");
    expect(pageType(U("/programs/roadmap"))).toBe("지원사업-목록");
    expect(pageType(U("/regions/jeonnam"))).toBe("지역-시도");
    expect(pageType(U("/regions/jeonnam/suncheon"))).toBe("지역-시군구");
    expect(pageType(U("/regions/gyeonggi/suwon/jangan-gu"))).toBe("지역-구");
    expect(pageType(U("/regions/compare"))).toBe("지역-목록·비교·순위");
    expect(pageType(U("/education/crawl-greendaero-education-1"))).toBe("교육-상세");
  });

  it("월 범위·전월", () => {
    expect(monthRange("2026-09")).toEqual({ start: "2026-09-01", end: "2026-09-30", days: 30 });
    expect(monthRange("2028-02").days).toBe(29);
    expect(prevMonth("2026-01")).toBe("2025-12");
    expect(prevMonth("2026-10")).toBe("2026-09");
  });

  it("합계는 노출 가중 순위, 전반·후반 일평균", () => {
    expect(summarize([row("a", 1, 100, 5), row("b", 1, 300, 9)])).toMatchObject({ clicks: 2, impressions: 400, position: 8 });
    const h = halves([row("2026-09-01", 2, 200, 7), row("2026-09-15", 2, 300, 7), row("2026-09-16", 1, 150, 7)]);
    expect(h.first.perDay).toBe(250);
    expect(h.second.perDay).toBe(150);
  });

  it("유형별 묶음은 노출 많은 순", () => {
    const g = byType([row(U("/crops/a"), 1, 50, 6), row(U("/crops/b"), 1, 70, 6), row(U("/programs/SP-018"), 4, 669, 8.4)]);
    expect(g[0]).toMatchObject({ type: "지원사업-상세", pages: 1, impressions: 669 });
    expect(g[1]).toMatchObject({ type: "작물-상세", pages: 2, impressions: 120 });
  });

  it("URL 검사 결과는 상태별로 묶는다(실패는 사유로)", () => {
    const s = summarizeInspection([
      { url: U("/a"), coverageState: "크롤링됨 - 현재 색인이 생성되지 않음" },
      { url: U("/b"), coverageState: "크롤링됨 - 현재 색인이 생성되지 않음" },
      { url: U("/c"), error: "검사 실패(500)" },
    ]);
    expect(s[0]).toMatchObject({ state: "크롤링됨 - 현재 색인이 생성되지 않음", count: 2 });
    expect(s[1]).toMatchObject({ state: "검사 실패(500)", count: 1 });
  });
});

describe("보고서", () => {
  const base = {
    ym: "2026-10",
    totalRows: [row(null, 130, 6400, 6.6)],
    prevTotalRows: [row(null, 101, 5922, 7.0)],
    dateRows: [row("2026-10-01", 4, 200, 6.8), row("2026-10-20", 5, 220, 6.5)],
    pageRows: [row(U("/programs/SP-018"), 20, 700, 7.9), row(U("/costs"), 6, 130, 5.0), row(U("/crops/blueberry"), 8, 230, 6.2)],
    prevPageRows: [row(U("/programs/SP-018"), 4, 669, 8.4), row(U("/costs"), 0, 114, 5.19), row(U("/crops/blueberry"), 6, 217, 6.77)],
    queryRows: [row("농지은행 임대 조건", 3, 90, 8.1)],
    countryRows: [row("kor", 128, 4800, 6.6), row("usa", 1, 1000, 6.7)],
    deviceRows: [row("DESKTOP", 80, 4000, 6.6)],
    inspection: {
      sitemapCount: 593,
      zeroCount: 2,
      results: [{ url: U("/regions/jeonnam/naju"), coverageState: "발견됨 - 현재 색인이 생성되지 않음" }],
    },
  };

  it("합계·전월 비교·지켜보는 페이지·색인 상태가 한 문서에", () => {
    const md = renderReport(base);
    expect(md).toContain("## 구글 검색 성과 — 2026-10");
    expect(md).toContain("| 클릭 | 130 | 101 | +29% |");
    expect(md).toContain("| /programs/SP-018 (농지은행 임대·위탁 조건) | 700 | 20 | 2.86% | 7.9 | 0.60% | 669 |");
    expect(md).toContain("| /costs (귀농 비용 가이드) | 130 | 6 | 4.62% | 5.0 | 0.00% | 114 |");
    expect(md).toMatch(/\| 작물 상세 전체 \(1쪽\) \| 230 \| 8 \|/);
    expect(md).toContain("색인 상태 — 사이트맵 593개 중 이번 달 노출 0인 2개 가운데 1개 검사");
    expect(md).toContain("| 발견됨 - 현재 색인이 생성되지 않음 | 1 | 지역-시군구 | /regions/jeonnam/naju |");
    expect(md).toContain("국가: 한국 노출 4,800회(75%)");
    expect(md).not.toMatch(/undefined|NaN/);
  });

  it("지켜보는 페이지가 이번 달 노출 0이어도 줄은 남는다", () => {
    const md = renderReport({ ...base, pageRows: [] });
    expect(md).toContain("| /glossary (귀농 농업 용어집) | 0 | 0 | - | - | - | 0 |");
  });
});
