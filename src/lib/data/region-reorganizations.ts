/**
 * 행정구역 개편으로 나뉘거나 합쳐진 시·군·구 — 우리 데이터는 개편 전 체계로 남아 있는 곳의 안내용 SSOT.
 *
 * 2026-07-01 인천 행정체제 개편: 중구 → 제물포구·영종구, 동구 → 제물포구, 서구 → 서해구·검단구.
 * 근거(10/6 QA·10/7 확인): 옛 중구청 누리집 종료 안내("영종구와 제물포구로 분구", 2026.7.1. 09:00),
 * 옛 동구청 주소 → 제물포구청, 옛 서구청 주소 → 서해구청으로 넘어가고, 검단구청은 별도 누리집.
 *
 * 공공데이터는 이미 새 구 기준이라 옛 이름·코드로 세면 0이 나온다(10/7 운영 실측: 심평원 의료기관
 * 중구·동구·서구 0곳, 교육부 학교 주소는 제물포구·영종구·서해구·검단구로 바뀜). 이 지역의 의료기관·학교
 * 수는 '확인 불가'로 두고 새 구청으로 안내한다(B안). 새 구로 데이터 전체를 옮기는 A안은 별도 결정.
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
  /** 이 지역을 이어받은 구 */
  successors: RegionSuccessor[];
}

const JEMULPO: RegionSuccessor = { name: "제물포구청", url: "https://www.jemulpo.go.kr/" };
const YEONGJONG: RegionSuccessor = { name: "영종구청", url: "https://www.yeongjong.go.kr/main/main.do" };
const SEOHAE: RegionSuccessor = { name: "서해구청", url: "https://www.seohae.go.kr/open_content/main/" };
const GEOMDAN: RegionSuccessor = { name: "검단구청", url: "https://www.geomdan.go.kr/" };

/** 키 = sigungus.ts 의 시·군·구 id */
export const REGION_REORGANIZATIONS: Readonly<Record<string, RegionReorganization>> = {
  "jung-gu-incheon": {
    effectiveDate: "2026-07-01",
    summary: "2026년 7월 1일 인천 행정체제 개편으로 중구는 제물포구와 영종구로 나뉘었어요.",
    successors: [JEMULPO, YEONGJONG],
  },
  "dong-gu-incheon": {
    effectiveDate: "2026-07-01",
    summary: "2026년 7월 1일 인천 행정체제 개편으로 동구는 제물포구가 됐어요.",
    successors: [JEMULPO],
  },
  "seo-gu-incheon": {
    effectiveDate: "2026-07-01",
    summary: "2026년 7월 1일 인천 행정체제 개편으로 서구는 서해구와 검단구로 나뉘었어요.",
    successors: [SEOHAE, GEOMDAN],
  },
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
  return `${reorg.summary} 이 화면은 개편 전 ${sigunguName} 기준 자료예요. 의료기관·학교 수는 공공데이터가 새 구 기준으로 바뀌어 확인할 수 없어요.`;
}
