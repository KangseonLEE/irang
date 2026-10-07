/**
 * 지역 상세 → 목록 페이지 "전체 ○○ 보기" 링크 (2026-10-06 QA1 Q2-W1).
 *
 * `/programs`·`/education`·`/events` 의 `?region=` 은 middleware 정규화 enum(전국 + 10개 시·도)만 받는다.
 * 광역시 6곳·세종의 이름을 그대로 붙이면 middleware 가 308 로 떼어 내 사용자가 전국 목록에 떨어졌다.
 * 받아 주는 값일 때만 붙인다 — 판정은 middleware 와 같은 `normalizeSearchParams` 로 해서,
 * 목록 enum 이 넓어지면(광역시 추가 등) 여기도 자동으로 따라간다.
 */
import {
  LIST_PAGE_NORMALIZE_OPTIONS,
  normalizeSearchParams,
} from "@/lib/search-params/normalize";

export type RegionListPath = "/programs" | "/education" | "/events";

export function listRegionHref(path: RegionListPath, regionName: string): string {
  const options = LIST_PAGE_NORMALIZE_OPTIONS[path];
  if (!options || !regionName) return path;
  const raw = new URLSearchParams({ region: regionName });
  const { cleaned } = normalizeSearchParams(raw, options);
  // middleware 는 원본·정규화 결과의 toString 이 다를 때만 308 — 같으면 그대로 통과한다
  return cleaned.toString() === raw.toString()
    ? `${path}?region=${encodeURIComponent(regionName)}`
    : path;
}
