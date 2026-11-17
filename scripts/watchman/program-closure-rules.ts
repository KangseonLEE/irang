/**
 * §20 접수 상태 판정 — check-program-closure.ts 의 순수 규칙 (테스트가 import 한다. 본 스크립트는 import 시 main() 을 돌린다).
 */

/** 화면에서 접수 중인가 — deriveStatus 와 같은 규칙(시작일 없음 + 마감일 있음 = 마감일까지 접수 중, 9999 페어 = 공고 전) */
export function isOpen(start: string | null | undefined, end: string | null | undefined, today: string): boolean {
  const s = start && start !== "9999-12-31" ? start : null;
  const e = end && end !== "9999-12-31" ? end : null;
  if (!s) return e !== null && e >= today;
  return s <= today && (e === null || e >= today);
}

export const realEnd = (end: string | null | undefined) => (!end || end === "9999-12-31" ? null : end);

/**
 * 우리는 접수 중이 아닌데 원천 '접수중'(ddlnYn=N) 탭에 있는 그린대로 교육 행을 어떻게 볼까.
 * 원천 접수중 탭은 접수 전(모집예정) 과정도 담는다 — 11/17 #205: 12/02 시작 7건이 '마감·숨김' 오경보.
 *   · 원문 깨짐(broken)으로 숨긴 행 → 되돌림 누락
 *   · 우리 시작일이 오늘 뒤(모집예정) → 원천 기간과 같으면 정상, 다르면 기간 어긋남
 *   · 그 밖(마감일 지남 등) → 되돌림 누락
 */
export function classifyReopen(
  ours: { start: string | null; end: string | null; broken: boolean },
  src: { start?: string; end?: string },
  today: string,
): null | "원천은 접수 중인데 화면은 마감·숨김" | "모집예정 행의 접수 기간이 원천과 다름" {
  if (ours.broken) return "원천은 접수 중인데 화면은 마감·숨김";
  if (ours.start && ours.start > today) {
    return ours.start === (src.start ?? null) && ours.end === (src.end ?? null) ? null : "모집예정 행의 접수 기간이 원천과 다름";
  }
  return "원천은 접수 중인데 화면은 마감·숨김";
}
