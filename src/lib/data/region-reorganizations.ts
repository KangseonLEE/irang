/**
 * 행정구역 개편을 겪은 시·군·구의 화면 안내 SSOT.
 *
 * 2026-07-01 인천 행정체제 개편: 중구·동구·서구 → 제물포구·영종구·서해구·검단구.
 *   근거(10/6 QA·10/7 확인): 옛 중구청 누리집 종료 안내("영종구와 제물포구로 분구", 2026.7.1. 09:00),
 *   옛 동구청 주소 → 제물포구청, 옛 서구청 주소 → 서해구청, 검단구청은 별도 누리집.
 *   10/7 A안: 옛 3개 구 대신 신설 4개 구를 우리 지역 단위로 두었다(sigungus.ts). 심평원(220009~220012)·
 *   교육부 학교 주소는 이미 새 구 기준이라 그대로 세고, SGIS 에는 새 구가 아직 없어 인구는 행정동을 더한다
 *   (region-composites.ts). 옛 주소는 MOVED_REGION_PATHS 로 옮긴다.
 *
 * 2023-07-01 군위군 대구 편입: 10/7 A안으로 경북 → 대구 아래로 옮겼다(/regions/daegu/gunwi).
 */

interface RegionSuccessor {
  /** 화면 표시 이름 (예: "제물포구청") */
  name: string;
  /** 누리집 — 삼중 검증한 주소만 */
  url: string;
}

export interface RegionReorganization {
  /** 시행일 YYYY-MM-DD */
  effectiveDate: string;
  /** 한 문장 설명 — 화면 안내 첫 문장 */
  summary: string;
  /** 이 지역을 이어받은 기관 — '확인 불가' 안내 창에서 새 구청으로 안내할 때만 채운다 */
  successors: RegionSuccessor[];
  /**
   * 의료기관·학교 수를 셀 수 없는가 — 옛 구를 그대로 둔 채 원천(심평원·교육부)만 새 구로 바뀌었을 때 true
   * (10/7 B안의 인천 옛 3개 구). true 면 조회하지 않고 '확인 불가'로 둔다. 지금은 true 인 곳이 없다.
   */
  countsUnavailable: boolean;
  /** 상단 안내의 둘째 문장 — 없으면 '개편 전 기준 자료 + 확인 불가' 기본 문장 */
  detail?: string;
  /** 옛 이름('시·도 약칭 + 시·군·구') — 통합검색이 옛 이름으로 찾으면 이 지역으로 안내한다(search-index) */
  formerNames?: string[];
}

// 통계청 인구 자료(SGIS)에 새 구가 아직 없어 행정동 값을 더한다 — 그 사실만 밝힌다. 귀농·귀촌 통계는 원래 자치구
// 단위로 나오지 않아(KOSIS 귀농어·귀촌인 통계는 시·군만) 새 구라서 없는 게 아니다
const NEW_DISTRICT_DETAIL = "인구는 통계청 2024년 행정동 통계를 새 구에 속한 동별로 더한 값이에요.";

/** 키 = sigungus.ts 의 시·군·구 id */
export const REGION_REORGANIZATIONS: Readonly<Record<string, RegionReorganization>> = {
  jemulpo: {
    effectiveDate: "2026-07-01",
    summary: "2026년 7월 1일 인천 행정체제 개편으로 옛 동구와 옛 중구 내륙이 합쳐져 제물포구가 됐어요.",
    successors: [],
    countsUnavailable: false,
    detail: NEW_DISTRICT_DETAIL,
    formerNames: ["인천 중구", "인천 동구"],
  },
  yeongjong: {
    effectiveDate: "2026-07-01",
    summary: "2026년 7월 1일 인천 행정체제 개편으로 옛 중구의 영종·용유 지역이 영종구가 됐어요.",
    successors: [],
    countsUnavailable: false,
    detail: NEW_DISTRICT_DETAIL,
    formerNames: ["인천 중구"],
  },
  seohae: {
    effectiveDate: "2026-07-01",
    summary: "2026년 7월 1일 인천 행정체제 개편으로 옛 서구가 서해구와 검단구로 나뉘었어요.",
    successors: [],
    countsUnavailable: false,
    detail: NEW_DISTRICT_DETAIL,
    formerNames: ["인천 서구"],
  },
  geomdan: {
    effectiveDate: "2026-07-01",
    summary: "2026년 7월 1일 인천 행정체제 개편으로 옛 서구의 검단 지역이 검단구가 됐어요.",
    successors: [],
    countsUnavailable: false,
    detail: NEW_DISTRICT_DETAIL,
    formerNames: ["인천 서구"],
  },
  gunwi: {
    effectiveDate: "2023-07-01",
    summary: "2023년 7월 1일 군위군은 경상북도에서 대구광역시로 편입됐어요.",
    successors: [],
    countsUnavailable: false,
    detail: "통계와 지원사업 모두 대구광역시 기준으로 보여 드려요.",
    formerNames: ["경북 군위군"],
  },
};

/**
 * 옛 상세 주소 → 새 주소 (`/regions/` 뒤 경로). next.config.ts redirects 와 같은 표다 — 테스트가 맞춰 본다.
 * 나뉜 구(인천 중구·서구)는 두 신설 구가 함께 보이는 시·도 화면으로, 통째로 옮겨 간 곳은 새 상세로.
 */
export const MOVED_REGION_PATHS: Readonly<Record<string, string>> = {
  "incheon/jung-gu-incheon": "incheon",
  "incheon/dong-gu-incheon": "incheon/jemulpo",
  "incheon/seo-gu-incheon": "incheon",
  "gyeongbuk/gunwi": "daegu/gunwi",
};

/** 개편된 시·군·구면 그 정보, 아니면 null */
export function getRegionReorganization(sigunguId: string): RegionReorganization | null {
  return REGION_REORGANIZATIONS[sigunguId] ?? null;
}

/**
 * 상세 상단 안내 문장. 9/28 결정대로 상단 안내엔 밖으로 나가는 링크를 두지 않는다 —
 * 새 구청 링크는 '확인 불가' 카드의 안내 창과 센터 칸(centers.ts)에서 안내한다.
 */
export function reorgNoticeText(reorg: RegionReorganization, sigunguName: string): string {
  const detail =
    reorg.detail ??
    `이 화면은 개편 전 ${sigunguName} 기준 자료예요. 의료기관·학교 수는 공공데이터가 새 구 기준으로 바뀌어 확인할 수 없어요.`;
  return `${reorg.summary} ${detail}`;
}
