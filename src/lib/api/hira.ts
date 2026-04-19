/**
 * 건강보험심사평가원 의료기관 정보 API 유틸리티
 * - 시도별 의료기관 총 수 조회
 * - 서버 컴포넌트에서만 호출 (API Key 보호)
 */

const API_BASE =
  "https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList";

/** 심평원 시도코드 → 시도명 매핑 */
const SIDO_NAME_MAP: Record<string, string> = {
  "110000": "서울특별시",
  "310000": "경기도",
  "320000": "강원도",
  "330000": "충청북도",
  "340000": "충청남도",
  "350000": "전라북도",
  "360000": "전라남도",
  "370000": "경상북도",
  "380000": "경상남도",
  "390000": "제주특별자치도",
  "250000": "대전광역시",
  "220000": "대구광역시",
  "240000": "광주광역시",
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
    const res = await fetch(url.toString(), { next: { revalidate: 86400 }, signal: AbortSignal.timeout(10_000) });
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
    const res = await fetch(url.toString(), { next: { revalidate: 86400 }, signal: AbortSignal.timeout(10_000) });
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
