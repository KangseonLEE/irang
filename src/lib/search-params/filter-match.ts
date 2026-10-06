/**
 * 목록 필터 값·검색어 매칭 공용 규칙 (2026-10-06 QA Q4-F1·Q2-W1·Q4-W2).
 *
 * - 필터는 URL 에 쉼표 목록(CSV)으로 온다 — `FilterShell` 이 모든 그룹을 복수 선택으로 만든다.
 *   그룹 안은 합집합(OR), 그룹 사이는 교집합(AND). 10/6 전까지는 데이터 쪽이 값 하나만 `!==` 로 비교해
 *   "보조금,융자"가 0건, "경기도,강원도"가 전국 사업만 남는 식으로 복수 선택이 통째로 깨져 있었다.
 * - 검색어 1글자는 작물 이름(쌀·콩·감·배·무·밤)만 normalize 를 통과한다. 1글자를 부분 문자열로 찾으면
 *   "배" ⊂ "재배"·"배우기", "무" ⊂ "무주"·"업무"처럼 와일드카드가 된다(9/23 검색 감사와 같은 결함) —
 *   그래서 1글자는 낱말 단위로만 맞춘다.
 *
 * ⚠️ middleware 번들이 이 파일을 끌어간다(normalize.ts) — 의존성 0 을 유지한다.
 */

/**
 * 1글자 작물 이름 — middleware 가 crops.ts(대형 데이터 모듈)를 끌어오지 않도록 목록을 따로 둔다.
 * CROPS 와의 일치는 `qa1006-feb-normalize.test.ts` 가 지킨다(작물 추가·개명 시 실패).
 */
export const SINGLE_CHAR_CROP_NAMES = ["쌀", "콩", "배", "무", "감", "밤"] as const;

/** URL 필터 값(CSV) → 선택 값 목록. 빈 조각·"전체"·중복은 뺀다. 빈 배열 = 그 그룹은 필터 없음 */
export function parseFilterValues(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const values: string[] = [];
  for (const part of raw.split(",")) {
    const value = part.trim();
    if (!value || value === "전체" || values.includes(value)) continue;
    values.push(value);
  }
  return values;
}

/** 낱말 경계 — 한글·영문·숫자가 아닌 글자(공백·가운뎃점·괄호·쉼표 등) */
const TOKEN_BOUNDARY = /[^0-9A-Za-z가-힣]+/;

/**
 * 목록 검색어 매칭.
 * - 2글자 이상: 종전대로 필드를 공백으로 이어 붙인 문자열의 부분 일치(대소문자 무시).
 * - 1글자: 낱말 단위 일치 — "사과·배 재배"는 "배"로 찾히고, "배추"·"재배"만 있는 글은 안 찾힌다.
 *   작물 목록(relatedCrops)을 필드로 넘기면 각 작물 이름이 그대로 낱말이 된다.
 */
export function matchesListQuery(
  query: string | null | undefined,
  fields: readonly (string | null | undefined)[],
): boolean {
  const q = query?.trim().toLowerCase() ?? "";
  if (!q) return true;
  const text = fields.filter(Boolean).join(" ").toLowerCase();
  if (q.length === 1) return text.split(TOKEN_BOUNDARY).includes(q);
  return text.includes(q);
}
