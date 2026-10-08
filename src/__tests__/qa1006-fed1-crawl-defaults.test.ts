import { describe, expect, it } from "vitest";
import {
  displayAgeRange,
  displayAmount,
  displayEducationLevel,
  displayEducationType,
  displaySupportType,
  displayValue,
  isCapacityKnown,
} from "@/lib/programs/display";
import { parseEligibilityItems } from "@/lib/programs/parse-eligibility";
import { formatAgeRange } from "@/lib/format";
import { PROGRAMS } from "@/lib/data/programs";
import { EDUCATION_COURSES } from "@/lib/data/education";

/**
 * 수집기 기본값·채움값은 수집 행에서만 숨긴다 (10/6 QA Q1-F2·Q1-W4·Q4-W4).
 *
 * sync-crawl 은 지원사업 support_type "보조금"·연령 18~65, 교육 level "초급"·(그린대로 외) type "오프라인"·
 * capacity null 을 원문과 무관하게 일괄로 넣는다. 본문이 "만18세 이상 ~ 만45세 미만 청년농업인"인
 * crawl-rda-programs-aaacd312 가 화면·JSON-LD 에 "만 18~65세"로 나갔다.
 * 큐레이션 행(SP-·ED-)은 손으로 확인한 값이라 한 글자도 바뀌면 안 된다 — 10/4 SP-044·ED-008 회귀 재발 방지.
 */

const CRAWLED_PROGRAM = "crawl-rda-programs-aaacd312";
const CRAWLED_AGRIX = "crawl-agrix-programs-df9c14cd";
const CRAWLED_RDA_EDU = "crawl-rda-education-a2b161c3";
const CRAWLED_GD_EDU = "crawl-greendaero-education-1e8e5362";

describe("지원사업 — 수집 행 기본값 숨김", () => {
  it("지원 유형: 수집 행은 기본값 보조금이라 null, 큐레이션은 그대로", () => {
    expect(displaySupportType(CRAWLED_PROGRAM, "보조금")).toBeNull();
    expect(displaySupportType(CRAWLED_AGRIX, "보조금")).toBeNull();
    expect(displaySupportType("SP-001", "융자")).toBe("융자");
    expect(displaySupportType("SP-018", "현물")).toBe("현물");
  });

  it("대상 연령: 수집 행은 기본값 18~65 라 null, 큐레이션은 formatAgeRange 그대로", () => {
    expect(displayAgeRange(CRAWLED_PROGRAM, 18, 65)).toBeNull();
    expect(displayAgeRange("SP-001", 18, 65)).toBe("만 18~65세");
    expect(displayAgeRange("SP-044", 18, 99)).toBe("만 18세 이상");
  });

  it("자격 조건: 수집 행의 채움값은 null, 원천이 준 구분값(농가 등)은 남긴다", () => {
    expect(displayValue(CRAWLED_PROGRAM, "상세 공고 참조")).toBeNull();
    expect(displayValue(CRAWLED_AGRIX, "농가,농업법인/농업기관")).toBe("농가,농업법인/농업기관");
  });

  it("셀프 체크 항목에 '상세 공고 참조'가 들어가지 않는다 (parse-eligibility 입력을 비운다)", () => {
    // 종전: parseEligibilityItems("상세 공고 참조") → ["상세 공고 참조"] 한 줄이 체크 항목이 됐다
    expect(parseEligibilityItems("상세 공고 참조").map((i) => i.label)).toEqual(["상세 공고 참조"]);
    expect(parseEligibilityItems(displayValue(CRAWLED_PROGRAM, "상세 공고 참조") ?? "")).toEqual([]);
  });

  it("지원 금액: displayAmount 는 displayValue 와 같은 규칙 (기존 시그니처 유지)", () => {
    expect(displayAmount(CRAWLED_PROGRAM, "상세 공고 참조")).toBeNull();
    expect(displayAmount(CRAWLED_PROGRAM, "개소당 5억 원")).toBe("개소당 5억 원");
    expect(displayAmount("ED-008", "입교비 소정 (확인 필요)")).toBe("입교비 소정 (확인 필요)");
  });

  it("큐레이션 지원사업 전건 — 지원 유형·연령·자격 조건·금액 표시값이 원값 그대로", () => {
    for (const p of PROGRAMS) {
      expect(displaySupportType(p.id, p.supportType), p.id).toBe(p.supportType);
      expect(displayAgeRange(p.id, p.eligibilityAgeMin, p.eligibilityAgeMax), p.id).toBe(
        formatAgeRange(p.eligibilityAgeMin, p.eligibilityAgeMax),
      );
      expect(displayValue(p.id, p.eligibilityDetail), p.id).toBe(p.eligibilityDetail.trim() || null);
      expect(displayAmount(p.id, p.supportAmount), p.id).toBe(p.supportAmount.trim() || null);
    }
  });
});

describe("교육 — 수집 행 기본값 숨김", () => {
  it("난이도: 수집 행은 기본값 초급이라 null", () => {
    expect(displayEducationLevel(CRAWLED_RDA_EDU, "초급")).toBeNull();
    expect(displayEducationLevel(CRAWLED_GD_EDU, "초급")).toBeNull();
    expect(displayEducationLevel("ED-006", "입문")).toBe("입문");
  });

  it("교육 방식: 그린대로는 원천 값(온라인)을 쓰고, RDA 는 기본값 오프라인이라 null", () => {
    expect(displayEducationType(CRAWLED_GD_EDU, "온라인")).toBe("온라인");
    expect(displayEducationType(CRAWLED_GD_EDU, "오프라인")).toBe("오프라인");
    expect(displayEducationType(CRAWLED_RDA_EDU, "오프라인")).toBeNull();
    expect(displayEducationType("ED-006", "혼합")).toBe("혼합");
  });

  it("정원: null 은 '제한 없음'이 아니라 싣지 않음 — 수집·큐레이션 모두 (10/8 ED-006 과정별 상이·ED-008 세대 단위)", () => {
    expect(isCapacityKnown(null)).toBe(false);
    expect(isCapacityKnown(undefined)).toBe(false);
    expect(isCapacityKnown(0)).toBe(false);
    expect(isCapacityKnown(100)).toBe(true);
  });

  it("교육 기간·일정·대상·비용 채움값: 수집 행만 null", () => {
    for (const v of ["상세 공고 참조"]) {
      expect(displayValue(CRAWLED_RDA_EDU, v)).toBeNull();
      expect(displayValue(CRAWLED_GD_EDU, v)).toBeNull();
    }
    expect(displayValue(CRAWLED_GD_EDU, "2026-09-30 ~ 2026-09-30")).toBe("2026-09-30 ~ 2026-09-30");
  });

  it("큐레이션 교육 전건 — 난이도·방식·기간·일정·대상·비용·정원 표시값이 원값 그대로", () => {
    for (const c of EDUCATION_COURSES) {
      expect(displayEducationLevel(c.id, c.level), c.id).toBe(c.level);
      expect(displayEducationType(c.id, c.type), c.id).toBe(c.type);
      for (const field of ["duration", "schedule", "target", "cost"] as const) {
        expect(displayValue(c.id, c[field]), `${c.id}.${field}`).toBe(c[field].trim() || null);
      }
      expect(isCapacityKnown(c.capacity), c.id).toBe(c.capacity !== null && c.capacity > 0);
    }
  });
});
