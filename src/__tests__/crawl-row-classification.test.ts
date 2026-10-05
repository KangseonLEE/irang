import { describe, expect, it } from "vitest";
import { deriveStatus, deriveStatusLabel } from "@/lib/program-status";
import { isForestProgram, isSmartfarmProgram } from "@/lib/data/journey-lanes-stats";
import { matchLaneEducation } from "@/lib/data/journey-lanes-hub";
import type { SupportProgram } from "@/lib/data/programs";
import type { EducationCourse } from "@/lib/data/education";

/**
 * 10/3 RDA 수집기 상세 보강(DE-A) 후속 — 수집 행의 값이 바뀌어도 화면 분류·상태가 틀어지지 않는지.
 * ① 상세를 못 받은 행은 "시작 9999 + 실제 마감일" → 표기("~ 마감일")와 같은 판정(마감일까지 모집중)
 * ② 수집 행 summary 는 원문 발췌(대상·자격)라 레인 분류 신호로 쓰지 않는다
 * ③ "…에서 수집했어요" 문구가 사라져도 똑똑!청년농부 과정은 청년농 레인에 남는다(출처 URL)
 */

const program = (p: Partial<SupportProgram>): SupportProgram => p as SupportProgram;
const course = (c: Partial<EducationCourse>): EducationCourse =>
  ({ status: "모집중", applicationEnd: "2026-10-12", description: "", ...c }) as EducationCourse;

describe("시작일 미상(9999) + 마감일 확정", () => {
  it("마감일까지 모집중, 지나면 마감 — 모집예정으로 보이지 않는다", () => {
    expect(deriveStatus("9999-12-31", "2026-10-10", "2026-10-03")).toBe("모집중");
    expect(deriveStatus("9999-12-31", "2026-10-10", "2026-10-10")).toBe("모집중");
    expect(deriveStatus("9999-12-31", "2026-10-10", "2026-10-11")).toBe("마감");
  });

  it("9999 페어(공고 미발표)는 종전대로", () => {
    expect(deriveStatus("9999-12-31", "9999-12-31", "2026-10-03")).toBe("모집예정");
    expect(deriveStatusLabel("9999-12-31", "9999-12-31")).toBe("공고 발표 예정");
  });
});

describe("수집 행 레인 분류는 제목만 본다", () => {
  const facilitySummary = "지원대상 : 시설원예작물 재배 농가 · 지원내용 : 면세유 인상분의 70% 지원";

  it("수집 행 — summary 의 시설원예로 스마트팜에 잡히지 않는다 (남원 면세유)", () => {
    const crawled = program({
      id: "crawl-rda-programs-ef6c077e",
      title: "2026년 하반기 농업용 면세유 지원사업",
      summary: facilitySummary,
    });
    expect(isSmartfarmProgram(crawled)).toBe(false);
  });

  it("큐레이션 행은 summary 까지 본다 (종전 동작)", () => {
    const curated = program({ id: "SP-999", title: "시설 지원사업", summary: facilitySummary });
    expect(isSmartfarmProgram(curated)).toBe(true);
  });

  it("수집 행 — 제목에 스마트팜이 있으면 스마트팜", () => {
    const crawled = program({
      id: "crawl-rda-programs-aaacd312",
      title: "2027년 청년창업 스마트팜 지원사업",
      summary: "지원대상 : 만18세 이상 ~ 만45세 미만 청년농업인",
    });
    expect(isSmartfarmProgram(crawled)).toBe(true);
  });

  it("수집 행 — summary 의 산림 문구로 귀산촌에 잡히지 않는다", () => {
    const crawled = program({
      id: "crawl-rda-programs-0000",
      title: "농지 임대료 지원사업",
      summary: "신청자격 : 산림·농지 소유자 제외",
    });
    expect(isForestProgram(crawled)).toBe(false);
  });
});

describe("똑똑!청년농부 과정 — 청년농 레인", () => {
  it("description 에 출처 문구가 없어도 RDA 청년농 포털 URL 이면 청년농", () => {
    const c = course({
      id: "crawl-rda-education-29e2370a",
      title: "AI 기초 교육",
      description: "교육내용: 생성형 AI의 기본 이해 및 간단한 활용 실습",
      url: "https://www.rda.go.kr/young/custom/edu/view.do?sId=47028",
    });
    expect(matchLaneEducation([c], "youth")).toHaveLength(1);
  });

  it("다른 출처의 과정은 제목에 청년이 없으면 청년농이 아니다", () => {
    const c = course({
      id: "crawl-greendaero-edu-1",
      title: "AI 기초 교육",
      url: "https://www.greendaero.go.kr/edu/1",
    });
    expect(matchLaneEducation([c], "youth")).toHaveLength(0);
  });
});
