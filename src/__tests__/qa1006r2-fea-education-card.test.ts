/**
 * 10/6 QA2 R2-Q4 W-b — 지역 상세 "정착 교육" 카드가 수집 행의 기본값(오프라인·초급)을 배지로 그리던 것 (278쪽 851장).
 * 판정은 목록·상세와 같은 lib/programs/display 규칙 — 모르는 값은 배지·메타에서 뺀다.
 */
import { describe, expect, it } from "vitest";
import { educationCardFields } from "@/app/regions/[id]/education-card";
import { EDUCATION_COURSES } from "@/lib/data/education";

describe("educationCardFields", () => {
  it("RDA 수집 행: 방식·난이도 배지 없음, 일정 채움값은 메타에서 뺀다", () => {
    const card = educationCardFields({
      id: "crawl-rda-education-a2b161c3",
      type: "오프라인",
      level: "초급",
      organization: "의령군농업기술센터",
      schedule: "상세 공고 참조",
    });
    expect(card).toEqual({ type: null, level: null, meta: "의령군농업기술센터" });
  });

  it("그린대로 수집 행: 원천이 준 방식은 남기고, 기본값 난이도는 뺀다", () => {
    const card = educationCardFields({
      id: "crawl-greendaero-education-2d25f297",
      type: "혼합",
      level: "초급",
      organization: "심농교육원",
      schedule: "2026-10-07 ~ 2026-10-18",
    });
    expect(card).toEqual({ type: "혼합", level: null, meta: "심농교육원 · 2026-10-07 ~ 2026-10-18" });
  });

  it("큐레이션 행: 손으로 확인한 방식·난이도·일정을 그대로", () => {
    const course = EDUCATION_COURSES.find((c) => c.id.startsWith("ED-"))!;
    const card = educationCardFields(course);
    expect(card.type).toBe(course.type);
    expect(card.level).toBe(course.level);
    expect(card.meta).toContain(course.organization);
  });
});
