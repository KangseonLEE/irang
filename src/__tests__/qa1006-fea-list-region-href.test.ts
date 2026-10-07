/**
 * 10/6 QA1 Q2-W1 — 지역 상세 "전체 ○○ 보기" 링크가 목록 정규화에서 잘리지 않는다.
 *
 * 광역시 6곳·세종은 `/programs?region=부산광역시` 처럼 붙이면 middleware 가 308 로 region 을 떼어
 * 전국 목록으로 보냈다. 링크를 middleware 와 같은 정규화 함수에 통과시켜 strip 0 을 확인한다.
 */
import { describe, expect, it } from "vitest";
import { listRegionHref, type RegionListPath } from "@/app/regions/[id]/list-region-href";
import {
  LIST_PAGE_NORMALIZE_OPTIONS,
  normalizeSearchParams,
} from "@/lib/search-params/normalize";
import { PROVINCES } from "@/lib/data/regions";

const PATHS: RegionListPath[] = ["/programs", "/education", "/events"];

/** middleware 판정 재현 — 원본과 정규화 결과의 toString 이 다르면 308 */
function wouldRedirect(href: string): boolean {
  const url = new URL(href, "https://irangfarm.com");
  const { cleaned } = normalizeSearchParams(url.searchParams, LIST_PAGE_NORMALIZE_OPTIONS[url.pathname]);
  return cleaned.toString() !== url.searchParams.toString();
}

describe("listRegionHref — 목록 region 필터가 받는 값일 때만 붙인다", () => {
  it.each(PATHS)("%s: 17개 시·도 전부 정규화 strip 0", (path) => {
    for (const p of PROVINCES) {
      const href = listRegionHref(path, p.name);
      expect(wouldRedirect(href), `${p.name} → ${href}`).toBe(false);
    }
  });

  it("10개 도·서울은 region 을 붙여 그 시·도 목록으로 보낸다", () => {
    for (const name of ["서울특별시", "경기도", "강원도", "충청북도", "충청남도", "전라북도", "전라남도", "경상북도", "경상남도", "제주특별자치도"]) {
      for (const path of PATHS) {
        expect(listRegionHref(path, name)).toBe(`${path}?region=${encodeURIComponent(name)}`);
      }
    }
  });

  it("목록 enum 밖 값(현재 광역시·세종)은 region 없이 전체 목록으로 — 링크가 받아들여질 때만 붙인다", () => {
    for (const name of ["부산광역시", "대구광역시", "인천광역시", "광주광역시", "대전광역시", "울산광역시", "세종특별자치시"]) {
      for (const path of PATHS) {
        const href = listRegionHref(path, name);
        // enum 이 넓어지면(광역시 추가) region 이 붙는 게 맞다 — 어느 쪽이든 middleware 가 떼지 않아야 한다
        expect(wouldRedirect(href)).toBe(false);
        if (!href.includes("?")) expect(href).toBe(path);
      }
    }
  });

  it("빈 값은 경로만", () => {
    expect(listRegionHref("/programs", "")).toBe("/programs");
  });
});
