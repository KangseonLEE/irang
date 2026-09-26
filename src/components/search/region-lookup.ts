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
 * href → 판정 결과 캐시 (2026-09-26 Phase D).
 *
 * 결과 행마다 `getSigungusBySidoId`(SIGUNGUS 229건 전량 필터)·`getSigunguBySidoAndId`·`GUS.find`·
 * `STATIONS.find` 를 새로 돌렸다. 입력은 href 하나, 출처는 전부 정적 데이터라 같은 href 는 항상 같은 답이다.
 * "전남 귀농"(지역 56건)처럼 지역 결과가 많은 검색에서 `ResultCard` 와 `RegionResultGroup` 이
 * 같은 href 를 각각 판정하던 중복까지 함께 사라진다. 반환 객체는 호출처에서 읽기만 한다(공유 안전).
 */
const _lookupCache = new Map<string, RegionLookup>();

/** 시·도 판정의 파생값(대표 작물·시·군·구 수)은 시·도 단위로 한 번만 집계한다 */
const _provinceLookupCache = new Map<string, RegionLookup>();

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
  const cached = _lookupCache.get(href);
  if (cached) return cached;
  const result = computeRegionLookup(href);
  _lookupCache.set(href, result);
  return result;
}

function computeRegionLookup(href: string): RegionLookup {
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
    const memo = _provinceLookupCache.get(province.id);
    if (memo) return memo;
    const sigungus = getSigungusBySidoId(province.id);
    const freq = new Map<string, number>();
    for (const sg of sigungus) {
      for (const crop of sg.mainCrops) freq.set(crop, (freq.get(crop) ?? 0) + 1);
    }
    const mainCrops = [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([crop]) => crop);
    const result: RegionLookup = {
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
    _provinceLookupCache.set(province.id, result);
    return result;
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
