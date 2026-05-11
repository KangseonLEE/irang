/**
 * 비교 페이지 region item — 시도 또는 시군구 단위 선택 통합
 *
 * 2026-05-11 Phase C: 시군구 선택 가능. URL `?regions=provinceId[:sigunguId]` 형식.
 * - 시도만: `?regions=seoul,gyeonggi,jeonnam`
 * - 시군구: `?regions=jeonnam:suncheon-si,gangwon:chuncheon-si`
 * - 혼합: `?regions=seoul,jeonnam:suncheon-si`
 *
 * Backward compat: 기존 `?stations=108,119,259` 형식도 처리 (시도 단위만).
 */

import { PROVINCES, type Province } from "@/lib/data/regions";
import { SIGUNGUS, type Sigungu } from "@/lib/data/sigungus";
import { STATIONS, type Station } from "@/lib/data/stations";

export interface RegionItem {
  /** "{provinceId}" 또는 "{provinceId}:{sigunguId}" */
  id: string;
  province: Province;
  sigungu: Sigungu | null;
  /** 기상 데이터용 — 시군구는 소속 시도 대표 station 사용 */
  station: Station;
  /** 표시 라벨 — "전남 순천시" 또는 "전남 (목포 관측소)" */
  label: string;
}

/** URL `?regions=` 또는 `?stations=` 파싱 (최대 3개) */
export function parseRegions(
  params: { regions?: string; stations?: string },
): RegionItem[] {
  // 우선: regions 파라미터 (신규)
  if (params.regions) {
    const ids = params.regions.split(",").filter(Boolean).slice(0, 3);
    return ids
      .map((id) => buildRegionItem(id))
      .filter((r): r is RegionItem => r !== null);
  }

  // backward compat: stations 파라미터 (기존)
  if (params.stations) {
    const stnIds = params.stations.split(",").filter(Boolean).slice(0, 3);
    return stnIds
      .map((stnId) => buildRegionItemFromStation(stnId))
      .filter((r): r is RegionItem => r !== null);
  }

  return [];
}

/** "{provinceId}" 또는 "{provinceId}:{sigunguId}" → RegionItem */
function buildRegionItem(id: string): RegionItem | null {
  const [provinceId, sigunguId] = id.split(":");
  const province = PROVINCES.find((p) => p.id === provinceId);
  if (!province) return null;

  const station = STATIONS.find((st) => st.stnId === province.representativeStationId);
  if (!station) return null;

  if (sigunguId) {
    const sigungu = SIGUNGUS.find(
      (sg) => sg.id === sigunguId && sg.sidoId === provinceId,
    );
    if (!sigungu) return null;
    return {
      id: `${provinceId}:${sigunguId}`,
      province,
      sigungu,
      station,
      label: `${province.shortName} ${sigungu.name}`,
    };
  }

  return {
    id: provinceId,
    province,
    sigungu: null,
    station,
    // 2026-05-11: 시도만 선택 시 station 이름 노출 제거 — 회장 발견 (강원=춘천 자동 특정 어색)
    label: province.shortName,
  };
}

/** Backward compat — station ID → RegionItem (시도 단위) */
function buildRegionItemFromStation(stnId: string): RegionItem | null {
  const station = STATIONS.find((st) => st.stnId === stnId);
  if (!station) return null;
  const province = PROVINCES.find((p) => p.stationIds.includes(stnId));
  if (!province) return null;
  return {
    id: province.id,
    province,
    sigungu: null,
    station,
    label: province.shortName,
  };
}

/** RegionItem 배열 → URL 파라미터 ("seoul,jeonnam:suncheon-si") */
export function serializeRegions(items: RegionItem[]): string {
  return items
    .map((r) =>
      r.sigungu ? `${r.province.id}:${r.sigungu.id}` : r.province.id,
    )
    .join(",");
}
