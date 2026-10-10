import { CROP_AREAS } from "@/lib/data/crop-areas";
import { CROP_SIGUNGU_AREAS, CROP_SIGUNGU_YEAR } from "@/lib/data/crop-sigungu-areas";

/**
 * 작물 주산지(majorRegions)의 근거 (2026-10-10).
 *
 * - "crop-production": KOSIS 농작물생산조사 시·도 재배면적(crop-areas.ts) — 32종
 * - "census": 2025 농림어업총조사 시·도 행(crop-sigungu-areas.ts provinces) — 농작물생산조사에 그 작물 하나의 표가 없는 7종
 * - null: 원천 없음(손 입력) — 화면에는 남기되 검색 결과 설명·JSON-LD 처럼 밖으로 나가는 문구에는 '주산지'로 단정하지 않는다
 */
export type MajorRegionBasis = { kind: "crop-production" | "census"; label: string } | null;

export function majorRegionBasis(cropId: string): MajorRegionBasis {
  const area = CROP_AREAS[cropId];
  if (area) return { kind: "crop-production", label: `국가데이터처 농작물생산조사 ${area.year}` };
  if (CROP_SIGUNGU_AREAS[cropId]) {
    return { kind: "census", label: `국가데이터처 ${CROP_SIGUNGU_YEAR} 농림어업총조사` };
  }
  return null;
}
