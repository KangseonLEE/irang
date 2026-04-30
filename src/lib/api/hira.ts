/**
 * 건강보험심사평가원 의료기관 정보 API 유틸리티
 * - 시도별 의료기관 총 수 조회
 * - 서버 컴포넌트에서만 호출 (API Key 보호)
 */

import { FETCH_TIMEOUT } from "./_build-phase";

const API_BASE =
  "https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList";

/** 심평원 시도코드 → 시도명 매핑 */
const SIDO_NAME_MAP: Record<string, string> = {
  "110000": "서울특별시",
  "210000": "부산광역시",
  "220000": "인천광역시",
  "230000": "대구광역시",
  "240000": "광주광역시",
  "250000": "대전광역시",
  "260000": "울산광역시",
  "310000": "경기도",
  "320000": "강원도",
  "330000": "충청북도",
  "340000": "충청남도",
  "350000": "전라북도",
  "360000": "전라남도",
  "370000": "경상북도",
  "380000": "경상남도",
  "390000": "제주특별자치도",
};

/**
 * 구 분할 시: 시 hiraSgguCd → 전체 구 코드 매핑.
 * HIRA는 구별로 sgguCd가 다르므로 시 전체 의료기관 수를 얻으려면
 * 각 구의 totalCount를 합산해야 한다.
 */
const GU_HIRA_CODES_MAP: Record<string, string[]> = {
  "310604": ["310601", "310602", "310603", "310604"], // 수원시 (권선·장안·팔달·영통)
  "310403": ["310401", "310402", "310403"],           // 성남시 (수정·중원·분당)
  "310702": ["310701", "310702"],                     // 안양시 (만안·동안)
  "310303": ["310301", "310302", "310303"],           // 부천시 (소사·오정·원미)
  "311102": ["311101", "311102"],                     // 안산시 (단원·상록)
  "311903": ["311901", "311902", "311903"],           // 고양시 (덕양·일산서·일산동)
  "312003": ["312001", "312002", "312003"],           // 용인시 (기흥·수지·처인)
  "330104": ["330101", "330102", "330103", "330104"], // 청주시 (상당·흥덕·청원·서원)
  "340202": ["340201", "340202"],                     // 천안시 (서북·동남)
  "350402": ["350401", "350402"],                     // 전주시 (완산·덕진)
  "370702": ["370701", "370702"],                     // 포항시 (남·북)
  "380705": ["380701", "380702", "380703", "380704", "380705"], // 창원시 (마산회원·마산합포·진해·의창·성산)
};

export interface MedicalFacilityData {
  sidoCd: string;
  sidoName: string;
  totalCount: number;
}

/**
 * 특정 시도의 의료기관 총 수를 조회한다.
 * numOfRows=1 로 호출하여 totalCount만 추출한다.
 */
async function fetchSidoMedicalCount(
  apiKey: string,
  sidoCd: string
): Promise<MedicalFacilityData | null> {
  const url = new URL(API_BASE);
  // serviceKey는 이미 인코딩된 상태로 전달해야 하므로 searchParams가 아닌 직접 붙이기
  url.searchParams.set("serviceKey", apiKey);
  url.searchParams.set("sidoCd", sidoCd);
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("numOfRows", "1");
  url.searchParams.set("_type", "json");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 86400 }, signal: AbortSignal.timeout(FETCH_TIMEOUT) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const totalCount = json?.response?.body?.totalCount;

    if (totalCount == null) {
      throw new Error("totalCount not found in response");
    }

    return {
      sidoCd,
      sidoName: SIDO_NAME_MAP[sidoCd] ?? sidoCd,
      totalCount: Number(totalCount),
    };
  } catch (error) {
    console.error(
      `Failed to fetch medical facility count for sido ${sidoCd}:`,
      error
    );
    return null;
  }
}

/**
 * 특정 시군구의 의료기관 총 수를 조회한다.
 * sidoCd + sgguCd 조합으로 시군구 수준 필터링.
 */
async function fetchSigunguMedicalCount(
  apiKey: string,
  sidoCd: string,
  sgguCd: string
): Promise<MedicalFacilityData | null> {
  const url = new URL(API_BASE);
  url.searchParams.set("serviceKey", apiKey);
  url.searchParams.set("sidoCd", sidoCd);
  url.searchParams.set("sgguCd", sgguCd);
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("numOfRows", "1");
  url.searchParams.set("_type", "json");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 86400 }, signal: AbortSignal.timeout(FETCH_TIMEOUT) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const totalCount = json?.response?.body?.totalCount;

    if (totalCount == null) {
      throw new Error("totalCount not found in response");
    }

    return {
      sidoCd: `${sidoCd}_${sgguCd}`,
      sidoName: sgguCd,
      totalCount: Number(totalCount),
    };
  } catch (error) {
    console.error(
      `Failed to fetch medical facility count for sigungu ${sidoCd}/${sgguCd}:`,
      error
    );
    return null;
  }
}

/**
 * 시군구 단위 의료기관 수 조회.
 * 구 분할 시(성남시 등)는 각 구의 totalCount를 합산한다.
 * API 실패 시 null을 반환 (상위 시/도 데이터로 폴백 처리는 호출자가 담당).
 */
export async function fetchSigunguMedicalFacilities(
  sidoCd: string,
  sgguCd: string
): Promise<MedicalFacilityData | null> {
  const apiKey = process.env.DATA_GO_KR_API_KEY;
  if (!apiKey) {
    console.error("DATA_GO_KR_API_KEY is not set");
    return null;
  }

  // 구 분할 시: 각 구의 의료기관 수를 병렬 조회하여 합산
  const guCodes = GU_HIRA_CODES_MAP[sgguCd];
  if (guCodes) {
    const results = await Promise.allSettled(
      guCodes.map((guCd) => fetchSigunguMedicalCount(apiKey, sidoCd, guCd))
    );

    let total = 0;
    let hasAny = false;
    for (const r of results) {
      if (r.status === "fulfilled" && r.value) {
        total += r.value.totalCount;
        hasAny = true;
      }
    }

    if (!hasAny) return null;

    return {
      sidoCd: `${sidoCd}_${sgguCd}`,
      sidoName: sgguCd,
      totalCount: total,
    };
  }

  return fetchSigunguMedicalCount(apiKey, sidoCd, sgguCd);
}

/**
 * 여러 시도의 의료기관 수를 병렬 조회한다.
 * API 실패 시 빈 배열을 반환한다 (graceful degradation).
 */
export async function fetchMedicalFacilities(
  sidoCodes: string[]
): Promise<MedicalFacilityData[]> {
  const apiKey = process.env.DATA_GO_KR_API_KEY;
  if (!apiKey) {
    console.error("DATA_GO_KR_API_KEY is not set");
    return [];
  }

  // 중복 제거
  const uniqueCodes = [...new Set(sidoCodes)];

  const results = await Promise.allSettled(
    uniqueCodes.map((code) => fetchSidoMedicalCount(apiKey, code))
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<MedicalFacilityData | null> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value)
    .filter((v): v is MedicalFacilityData => v !== null);
}
