/**
 * 지역 검색 인덱스 — 시·도 17 + 시·군·구 229 (2026-09-02 공용 추출)
 *
 * `RegionSearch`(/regions 검색창)와 `RegionCardsSelector`(/regions/compare)가 같은 인덱스를
 * 각자 만들던 중복을 하나로. 매칭 규칙(이름·약칭 공백 제거 includes, 대소문자 무시)도 여기서 고정.
 * 모듈 로드 시 1회 계산되는 상수라 컴포넌트 useMemo가 필요 없다.
 */

import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";

export interface RegionSearchEntry {
  /** compare 선택 id — 시·도 `"gyeongbuk"`, 시·군·구 `"gyeongbuk:yeongju"` */
  id: string;
  /** 상세 페이지 경로 — `/regions/gyeongbuk` · `/regions/gyeongbuk/yeongju` */
  href: string;
  type: "sido" | "sigungu";
  /** 표시명 — 시·도는 약칭, 시·군·구는 `"경북 영주시"` */
  label: string;
  /** 공백 제거·소문자 매칭 대상 */
  searchText: string;
  provinceId: string;
  provinceShortName: string;
  sigunguId?: string;
  sigunguName?: string;
}

function buildIndex(): RegionSearchEntry[] {
  const provinceById = new Map(PROVINCES.map((p) => [p.id, p]));
  const items: RegionSearchEntry[] = [];
  for (const p of PROVINCES) {
    items.push({
      id: p.id,
      href: `/regions/${p.id}`,
      type: "sido",
      label: p.shortName,
      searchText: `${p.name}${p.shortName}`.replace(/\s/g, "").toLowerCase(),
      provinceId: p.id,
      provinceShortName: p.shortName,
    });
  }
  for (const sg of SIGUNGUS) {
    const province = provinceById.get(sg.sidoId);
    if (!province) continue;
    items.push({
      id: `${sg.sidoId}:${sg.id}`,
      href: `/regions/${sg.sidoId}/${sg.id}`,
      type: "sigungu",
      label: `${province.shortName} ${sg.name}`,
      searchText: `${province.name}${province.shortName}${sg.name}${sg.shortName}`
        .replace(/\s/g, "")
        .toLowerCase(),
      provinceId: province.id,
      provinceShortName: province.shortName,
      sigunguId: sg.id,
      sigunguName: sg.name,
    });
  }
  return items;
}

export const REGION_SEARCH_INDEX: readonly RegionSearchEntry[] = buildIndex();

/** 검색어 정규화 — 공백 제거·소문자. 빈 문자열이면 "입력 없음" */
export function normalizeRegionQuery(query: string): string {
  return query.trim().replace(/\s/g, "").toLowerCase();
}

/** 정규화된 검색어로 인덱스 매칭 (최대 limit건). 빈 검색어면 빈 배열 */
export function searchRegions(normalizedQuery: string, limit = 30): RegionSearchEntry[] {
  if (!normalizedQuery) return [];
  return REGION_SEARCH_INDEX.filter((r) => r.searchText.includes(normalizedQuery)).slice(0, limit);
}
