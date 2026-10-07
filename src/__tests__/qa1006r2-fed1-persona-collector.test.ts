/**
 * 10/6 전체 QA 2차 — FE-D1: 수집기 기본값이 맞춤 추천 점수·사유·여정 레인 건수로 새지 않는다 (R2-Q1 🟡1).
 *
 * 1차에서 화면의 "만 18~65세"·"보조금"은 뺐지만 페르소나 산식은 그 기본값을 그대로 읽었다 —
 * 연령 상한 65 → 노년 친화(elderRural 4), 보조금 → family·farmYouth +1. 그래서 본문이
 * "만18세 이상 ~ 만45세 미만 청년농업인"인 crawl-rda-programs-aaacd312 가 /programs?persona=elderRural 7위에
 * "4/5 잘 맞아요 · 65세 이하 신청 가능해요 (노년 친화) · 보조금 지원이에요"로 붙었고, 수집 행 5건이
 * family·farmYouth·elderRural 목록 7~15위와 /start/guinong·/start/youth 건수에 섞였다.
 */
import { describe, expect, it } from "vitest";
import type { SupportProgram } from "@/lib/data/programs";
import { PROGRAMS } from "@/lib/data/programs";
import { getProgramPersonaFit, getProgramPersonaFitTrace } from "@/lib/data/persona-fit";
import { orderProgramsForList, PERSONA_MIN_SCORE } from "@/lib/programs/list-order";
import { matchLanePrograms } from "@/lib/data/journey-lanes-stats";

const collected = (id: string, title: string, over: Partial<SupportProgram> = {}): SupportProgram => ({
  id,
  title,
  summary: "지원대상 : 만18세 이상 ~ 만45세 미만 청년농업인",
  region: "경상북도",
  organization: "봉화군농업기술센터",
  supportType: "보조금",
  supportAmount: "상세 공고 참조",
  eligibilityAgeMin: 18,
  eligibilityAgeMax: 65,
  eligibilityDetail: "상세 공고 참조",
  applicationStart: "2026-09-21",
  applicationEnd: "2099-12-31",
  status: "모집중",
  relatedCrops: [],
  sourceUrl: "https://www.rda.go.kr/young/custom/policy/view.do?sId=47040",
  linkStatus: "active",
  year: 2026,
  ...over,
});

const CRAWLED = [
  collected("crawl-rda-programs-aaacd312", "2027년 청년창업 스마트팜 지원사업 신청접수"),
  collected("crawl-rda-programs-7251b1cd", "2026년 청년농업인 스타트업 지원 사업 대상자 모집(2차)"),
  collected("crawl-rda-programs-ef6c077e", "2026년 농업용 면세유 가격연동 보조금 지원사업 안내"),
  collected("crawl-agrix-programs-11118730", "농기계임대", { eligibilityDetail: "지자체" }),
  collected("rda-901", "RDA API 폴백 — 청년 창업 지원"),
];

const SCORING = ["family", "farmYouth", "elderRural", "commuter"] as const;

describe("맞춤 점수 — 수집 행은 연령·유형 기본값을 읽지 않고 중립", () => {
  it("모든 페르소나 3점(중립) — 기준 4점 미만", () => {
    for (const p of CRAWLED) {
      expect(getProgramPersonaFit(p), p.id).toEqual({ family: 3, farmYouth: 3, elderRural: 3, commuter: 3, balanced: 3 });
    }
  });

  it("사유에 '65세 이하 … (노년 친화)'·'보조금 지원이에요'가 없다", () => {
    for (const p of CRAWLED) {
      for (const persona of SCORING) {
        const trace = getProgramPersonaFitTrace(p, persona);
        expect(trace.score, `${p.id}/${persona}`).toBe(3);
        const labels = trace.reasons.map((r) => r.label).join(" | ");
        expect(labels).not.toMatch(/노년 친화|세 이하|세 대상|지원이에요/);
        expect(trace.reasons.map((r) => r.kind)).toEqual(["unknown"]);
      }
    }
  });

  it("큐레이션 행은 종전처럼 연령·유형 사유를 읽는다 (SP-001·SP-002)", () => {
    const sp001 = PROGRAMS.find((p) => p.id === "SP-001")!;
    const sp002 = PROGRAMS.find((p) => p.id === "SP-002")!;
    const kinds = (p: SupportProgram) => getProgramPersonaFitTrace(p, "family").reasons.map((r) => r.kind);
    expect(kinds(sp001)).toEqual(expect.arrayContaining(["age", "category"]));
    expect(kinds(sp002)).toEqual(expect.arrayContaining(["age", "category"]));
    expect(getProgramPersonaFit(sp002).farmYouth).toBe(5);
    // 큐레이션 전건 — 'unknown' 사유는 수집 행 전용
    for (const p of PROGRAMS) {
      for (const persona of SCORING) {
        expect(getProgramPersonaFitTrace(p, persona).reasons.some((r) => r.kind === "unknown"), `${p.id}/${persona}`).toBe(false);
      }
    }
  });
});

describe("맞춤 목록·여정 레인 — 수집 행이 섞이지 않는다", () => {
  const all = [...PROGRAMS, ...CRAWLED];

  it("/programs?persona=… 순서에 수집 행 0건, 큐레이션 결과는 수집 행이 없을 때와 같다", () => {
    for (const persona of SCORING) {
      const withCrawled = orderProgramsForList(all, { persona, sort: "deadline" }).map((p) => p.id);
      const curatedOnly = orderProgramsForList([...PROGRAMS], { persona, sort: "deadline" }).map((p) => p.id);
      expect(withCrawled.filter((id) => CRAWLED.some((c) => c.id === id)), persona).toEqual([]);
      expect(withCrawled, persona).toEqual(curatedOnly);
      expect(withCrawled.every((id) => getProgramPersonaFit(all.find((p) => p.id === id)!)[persona] >= PERSONA_MIN_SCORE)).toBe(true);
    }
  });

  it("/start/guinong·youth 건수에 수집 행이 들어가지 않는다 — 키워드 레인(스마트팜)은 제목 기준 그대로", () => {
    for (const lane of ["guinong", "guichon", "youth"]) {
      const ids = matchLanePrograms(all, lane).map((p) => p.id);
      expect(ids.filter((id) => CRAWLED.some((c) => c.id === id)), lane).toEqual([]);
    }
    // 스마트팜 레인은 페르소나 점수가 아니라 제목 키워드로 고른다 — 제목에 스마트팜이 있는 수집 공고는 남는다
    expect(matchLanePrograms(all, "smartfarm").map((p) => p.id)).toContain("crawl-rda-programs-aaacd312");
  });
});
