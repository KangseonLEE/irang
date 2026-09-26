/**
 * 검색 결과의 지역 아이템 → 행정 단위 판정 (Phase C, 2026-09-26)
 *
 * `ResultCard` 의 지역 카드와 `RegionResultGroup` 의 시·도 묶음이 같은 판정을 써야 해서
 * 렌더러 밖으로 뺐다. UI 를 모르는 순수 조회 로직이다.
 */

import { getSigunguBySidoAndId, getSigungusBySidoId } from "@/lib/data/sigungus";
import { getGuByIds } from "@/lib/data/gus";
import { getProvinceById } from "@/lib/data/regions";
import { STATIONS } from "@/lib/data/stations";

export interface RegionLookup {
  kind: "province" | "sigungu" | "gu" | "station" | "unknown";
  /** 시·도 id — 시·도 묶음 키 (station·unknown 은 없음) */
  provinceId?: string;
  data?: {
    /** 시·도 약칭 */
    provinceName: string;
    /** 시·도 정식 명칭 (province 카드에서만 사용) */
    provinceFullName?: string;
    /** 상위 시·군·구 이름 (구 카드) */
    parentName?: string;
    mainCrops?: string[];
    description?: string;
    /** 소속 시·군·구 수 (province 카드) */
    sigunguCount?: number;
  };
}

/**
 * SearchItem 의 href 로 지역 종류를 판정한다.
 *
 * id 의 하이픈 split 은 못 쓴다 — `jung-gu-seoul`·`gwangju-gg`·`goseong-gw`·`sejong-si` 처럼
 * **id 자체에 하이픈이 든 시·군·구 31건과 구 32건 전부**가 어긋나 풍부 카드로 못 그렸다
 * (`province-jeonnam` 시·도 hoist 도 마찬가지). href 는 라우트 구조라 경계가 명확하다.
 *
 *   /regions/{sido}                    → 시·도
 *   /regions/{sido}/{sigungu}          → 시·군·구
 *   /regions/{sido}/{sigungu}/{gu}     → 구
 *   /regions?stations={stnId}          → 기상 관측소
 */
export function lookupRegionFromHref(href: string): RegionLookup {
  const [path, queryString] = href.split("?");

  if (path === "/regions" && queryString) {
    const stnId = new URLSearchParams(queryString).get("stations");
    const station = stnId ? STATIONS.find((st) => st.stnId === stnId) : undefined;
    if (station) {
      return {
        kind: "station",
        data: { provinceName: station.province, description: station.description },
      };
    }
    return { kind: "unknown" };
  }

  const segs = path.split("/").filter(Boolean);
  if (segs[0] !== "regions" || segs.length < 2) return { kind: "unknown" };

  const province = getProvinceById(segs[1]);
  if (!province) return { kind: "unknown" };
  const provinceName = province.shortName ?? province.name;

  // 시·도 — 소속 시·군·구 수 + 대표 작물(빈도 상위)
  if (segs.length === 2) {
    const sigungus = getSigungusBySidoId(province.id);
    const freq = new Map<string, number>();
    for (const sg of sigungus) {
      for (const crop of sg.mainCrops) freq.set(crop, (freq.get(crop) ?? 0) + 1);
    }
    const mainCrops = [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([crop]) => crop);
    return {
      kind: "province",
      provinceId: province.id,
      data: {
        provinceName,
        provinceFullName: province.name,
        description: province.description,
        mainCrops,
        sigunguCount: sigungus.length,
      },
    };
  }

  const sigungu = getSigunguBySidoAndId(province.id, segs[2]);
  if (!sigungu) return { kind: "unknown" };

  // 구 — 자기 설명·작물을 쓰고, 메타에 상위 시 이름을 함께 노출
  if (segs.length >= 4) {
    const gu = getGuByIds(province.id, sigungu.id, segs[3]);
    if (!gu) return { kind: "unknown" };
    return {
      kind: "gu",
      provinceId: province.id,
      data: {
        provinceName,
        parentName: sigungu.shortName ?? sigungu.name,
        description: gu.description,
        mainCrops: gu.mainCrops,
      },
    };
  }

  return {
    kind: "sigungu",
    provinceId: province.id,
    data: {
      provinceName,
      description: sigungu.description,
      mainCrops: sigungu.mainCrops,
    },
  };
}
