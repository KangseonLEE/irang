/**
 * 지역 상세(시·도 · 시·군·구 · 구) "정착 교육" 카드에 싣는 값 (2026-10-06 QA2 R2-Q4 W-b).
 *
 * 수집 행은 원천이 방식·난이도를 주지 않으면 수집기 기본값("오프라인"·"초급")이, 일정 칸은 채움값
 * ("상세 공고 참조")이 들어 있다 — 그 값을 배지·메타 줄에 그리면 사실처럼 보였다(278쪽 851장).
 * 판정은 목록·상세와 같은 `lib/programs/display` 규칙을 따르고, 모르는 값(null)은 그리지 않는다.
 */
import {
  displayEducationLevel,
  displayEducationType,
  displayValue,
} from "@/lib/programs/display";
import type { EducationCourse } from "@/lib/data/education";

export interface EducationCardFields {
  /** 온라인·오프라인·혼합 — 원천이 방식을 준 경우만 */
  type: EducationCourse["type"] | null;
  /** 입문·초급·중급·심화 — 큐레이션 행만 */
  level: EducationCourse["level"] | null;
  /** 메타 줄 — "주관 기관 · 일정", 일정이 채움값이면 기관만 */
  meta: string;
}

export function educationCardFields(
  course: Pick<EducationCourse, "id" | "type" | "level" | "organization" | "schedule">,
): EducationCardFields {
  const schedule = displayValue(course.id, course.schedule);
  return {
    type: displayEducationType(course.id, course.type),
    level: displayEducationLevel(course.id, course.level),
    meta: [course.organization?.trim(), schedule].filter(Boolean).join(" · "),
  };
}
