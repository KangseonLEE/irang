/**
 * 한글 IME 조합 가드 (2026-09-07)
 *
 * 배경: 지역 비교 작물 적합도 셀렉터에서 "배추" 입력 후 Enter → 고구마가 선택되는 사고(회장 라이브).
 * 한글 IME 는 마지막 글자가 조합 중일 때 Enter 를 "조합 확정"으로 먼저 보낸다. 그 순간 React 상태의
 * 검색어는 부분 문자열("배")이고, 셀렉터가 설명문까지 검색하면 "재배"가 든 작물 30건이 매칭돼
 * 하이라이트 항목(0 또는 직전에 손이 스친 항목)이 확정된다.
 *
 * 규칙: Enter/Space 확정 키는 `isComposing`(또는 keyCode 229) 이면 무시한다. 모든 커스텀 리스트박스·
 * 검색 폼의 확정 핸들러 첫 줄에서 이 함수를 부른다.
 */

interface ComposingLike {
  nativeEvent?: { isComposing?: boolean };
  keyCode?: number;
  isComposing?: boolean;
}

/** 조합 중인 키 이벤트인가 — React 합성 이벤트·네이티브 이벤트 모두 지원 */
export function isComposingEvent(e: ComposingLike): boolean {
  return Boolean(e.nativeEvent?.isComposing ?? e.isComposing) || e.keyCode === 229;
}

export interface RankedMatch<T> {
  item: T;
  /** 0 = 이름 완전 일치, 1 = 이름 앞부분, 2 = 이름 포함, 3 = 보조 텍스트(카테고리·설명) */
  tier: 0 | 1 | 2 | 3;
}

/**
 * 이름 우선 랭킹 — 검색 결과에서 Enter 가 확정할 첫 항목이 "이름이 맞는 것"이 되도록.
 * 이름 완전 일치 > 이름 앞부분 > 이름 포함 > 보조 텍스트 포함 순. 같은 tier 안에서는 입력 순서 유지.
 */
export function rankByName<T>(
  items: readonly T[],
  query: string,
  getName: (item: T) => string,
  getExtra: (item: T) => string,
): RankedMatch<T>[] {
  const q = query.replace(/\s/g, "").toLowerCase();
  if (!q) return items.map((item) => ({ item, tier: 3 as const }));
  const out: RankedMatch<T>[] = [];
  for (const item of items) {
    const name = getName(item).replace(/\s/g, "").toLowerCase();
    if (name === q) out.push({ item, tier: 0 });
    else if (name.startsWith(q)) out.push({ item, tier: 1 });
    else if (name.includes(q)) out.push({ item, tier: 2 });
    else if (getExtra(item).replace(/\s/g, "").toLowerCase().includes(q)) out.push({ item, tier: 3 });
  }
  return out.sort((a, b) => a.tier - b.tier);
}

/**
 * Enter 확정 대상 — 이름 완전 일치가 있으면 그것, 없고 결과가 1건이면 그것, 아니면 하이라이트 항목.
 * (설명문만 맞는 항목이 30건일 때 하이라이트 0번을 무작정 확정하지 않게 한다)
 */
export function pickOnEnter<T>(
  ranked: readonly RankedMatch<T>[],
  highlighted: T | undefined,
): T | undefined {
  const exact = ranked.find((r) => r.tier === 0);
  if (exact) return exact.item;
  if (ranked.length === 1) return ranked[0].item;
  return highlighted;
}
