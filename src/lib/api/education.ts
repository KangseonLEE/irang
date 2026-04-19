/**
 * 교육부 NEIS 학교 정보 API 유틸리티
 * - 시도교육청별 학교 총 수 조회
 * - 서버 컴포넌트에서만 호출 (API Key 보호)
 *
 * 주의: NEIS API는 data.go.kr과 응답 형식이 다르다.
 *   정상: { schoolInfo: [{ head: [{ list_total_count: N }, ...] }, { row: [...] }] }
 *   에러: { RESULT: { CODE: "...", MESSAGE: "..." } }
 */

const API_BASE = "https://open.neis.go.kr/hub/schoolInfo";

/** 교육청 코드 → 시도명 매핑 */
const EDU_NAME_MAP: Record<string, string> = {
  B10: "서울특별시",
  C10: "부산광역시",
  D10: "대구광역시",
  E10: "인천광역시",
  F10: "광주광역시",
  G10: "대전광역시",
  H10: "울산광역시",
  I10: "세종특별자치시",
  J10: "경기도",
  K10: "강원도",
  M10: "충청북도",
  N10: "충청남도",
  P10: "전라북도",
  Q10: "전라남도",
  R10: "경상북도",
  S10: "경상남도",
  T10: "제주특별자치도",
};

export interface SchoolData {
  eduCode: string;
  sidoName: string;
  totalCount: number;
}

/**
 * 특정 시도교육청의 학교 총 수를 조회한다.
 * pSize=1 로 호출하여 list_total_count만 추출한다.
 */
async function fetchEduSchoolCount(
  apiKey: string,
  eduCode: string
): Promise<SchoolData | null> {
  const url = new URL(API_BASE);
  url.searchParams.set("KEY", apiKey);
  url.searchParams.set("Type", "json");
  url.searchParams.set("pIndex", "1");
  url.searchParams.set("pSize", "1");
  url.searchParams.set("ATPT_OFCDC_SC_CODE", eduCode);

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 86400 }, signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();

    // NEIS 에러 응답 체크
    if (json.RESULT) {
      throw new Error(
        `NEIS error: ${json.RESULT.CODE} - ${json.RESULT.MESSAGE}`
      );
    }

    // 정상 응답: schoolInfo[0].head[0].list_total_count
    const schoolInfo = json?.schoolInfo;
    if (!schoolInfo || !Array.isArray(schoolInfo) || schoolInfo.length === 0) {
      throw new Error("schoolInfo not found in response");
    }

    const head = schoolInfo[0]?.head;
    if (!head || !Array.isArray(head) || head.length === 0) {
      throw new Error("head not found in schoolInfo");
    }

    const totalCount = head[0]?.list_total_count;
    if (totalCount == null) {
      throw new Error("list_total_count not found in head");
    }

    return {
      eduCode,
      sidoName: EDU_NAME_MAP[eduCode] ?? eduCode,
      totalCount: Number(totalCount),
    };
  } catch (error) {
    console.error(
      `Failed to fetch school count for edu code ${eduCode}:`,
      error
    );
    return null;
  }
}

/**
 * 특정 교육청 + 시군구명으로 시군구 단위 학교 수를 조회한다.
 *
 * NEIS API의 LCTN_SC_NM 파라미터는 시도 수준만 지원하므로,
 * 시도 전체 학교를 조회한 뒤 주소(ORG_RDNMA)에 시군구명이 포함된
 * 학교만 카운트한다.
 *
 * 시 단위(예: "영주시")도 정확히 매칭한다.
 * API 실패 시 null을 반환.
 */
async function fetchSigunguSchoolCount(
  apiKey: string,
  eduCode: string,
  sigunguName: string
): Promise<SchoolData | null> {
  // 1단계: 전체 학교 수 확인 (pSize=1)
  const countUrl = new URL(API_BASE);
  countUrl.searchParams.set("KEY", apiKey);
  countUrl.searchParams.set("Type", "json");
  countUrl.searchParams.set("pIndex", "1");
  countUrl.searchParams.set("pSize", "1");
  countUrl.searchParams.set("ATPT_OFCDC_SC_CODE", eduCode);

  try {
    const countRes = await fetch(countUrl.toString(), { next: { revalidate: 86400 }, signal: AbortSignal.timeout(10_000) });
    if (!countRes.ok) throw new Error(`HTTP ${countRes.status}`);

    const countJson = await countRes.json();
    if (countJson.RESULT) {
      if (countJson.RESULT.CODE === "INFO-200") {
        return { eduCode, sidoName: sigunguName, totalCount: 0 };
      }
      throw new Error(`NEIS error: ${countJson.RESULT.CODE}`);
    }

    const totalAll = countJson?.schoolInfo?.[0]?.head?.[0]?.list_total_count ?? 0;
    if (totalAll === 0) {
      return { eduCode, sidoName: sigunguName, totalCount: 0 };
    }

    // 2단계: 전체 학교 목록 받아서 주소 필터링
    const fullUrl = new URL(API_BASE);
    fullUrl.searchParams.set("KEY", apiKey);
    fullUrl.searchParams.set("Type", "json");
    fullUrl.searchParams.set("pIndex", "1");
    fullUrl.searchParams.set("pSize", String(Math.min(totalAll, 1000)));
    fullUrl.searchParams.set("ATPT_OFCDC_SC_CODE", eduCode);

    const fullRes = await fetch(fullUrl.toString(), { next: { revalidate: 86400 }, signal: AbortSignal.timeout(10_000) });
    if (!fullRes.ok) throw new Error(`HTTP ${fullRes.status}`);

    const fullJson = await fullRes.json();
    if (fullJson.RESULT) throw new Error(`NEIS error: ${fullJson.RESULT.CODE}`);

    const rows = fullJson?.schoolInfo?.[1]?.row ?? [];
    const count = rows.filter(
      (r: Record<string, string>) =>
        (r.ORG_RDNMA || "").includes(sigunguName)
    ).length;

    return {
      eduCode,
      sidoName: sigunguName,
      totalCount: count,
    };
  } catch (error) {
    console.error(
      `Failed to fetch school count for ${eduCode}/${sigunguName}:`,
      error
    );
    return null;
  }
}

/**
 * 시군구 단위 학교 수 조회.
 * API 실패 시 null을 반환 (시/도 데이터로 폴백 처리는 호출자가 담당).
 */
export async function fetchSigunguSchoolCounts(
  eduCode: string,
  sigunguName: string
): Promise<SchoolData | null> {
  const apiKey = process.env.NEIS_API_KEY;
  if (!apiKey) {
    console.error("NEIS_API_KEY is not set");
    return null;
  }

  return fetchSigunguSchoolCount(apiKey, eduCode, sigunguName);
}

/**
 * 여러 시도교육청의 학교 수를 병렬 조회한다.
 * API 실패 시 빈 배열을 반환한다 (graceful degradation).
 */
export async function fetchSchoolCounts(
  eduCodes: string[]
): Promise<SchoolData[]> {
  const apiKey = process.env.NEIS_API_KEY;
  if (!apiKey) {
    console.error("NEIS_API_KEY is not set");
    return [];
  }

  // 중복 제거
  const uniqueCodes = [...new Set(eduCodes)];

  const results = await Promise.allSettled(
    uniqueCodes.map((code) => fetchEduSchoolCount(apiKey, code))
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<SchoolData | null> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value)
    .filter((v): v is SchoolData => v !== null);
}
