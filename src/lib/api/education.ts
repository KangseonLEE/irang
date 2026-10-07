/**
 * 교육부 NEIS 학교 정보 API 유틸리티
 * - 시도교육청별 학교 총 수 조회
 * - 서버 컴포넌트에서만 호출 (API Key 보호)
 *
 * 주의: NEIS API는 data.go.kr과 응답 형식이 다르다.
 *   정상: { schoolInfo: [{ head: [{ list_total_count: N }, ...] }, { row: [...] }] }
 *   에러: { RESULT: { CODE: "...", MESSAGE: "..." } }
 */

import { FETCH_TIMEOUT } from "./_build-phase";

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
    const res = await fetch(url.toString(), { next: { revalidate: 86400 }, signal: AbortSignal.timeout(FETCH_TIMEOUT) });
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

/** NEIS 학교 정보 1건 — 이 모듈과 /api/school-list 가 쓰는 필드만 */
export interface NeisSchoolRow {
  SCHUL_NM?: string;
  SCHUL_KND_SC_NM?: string;
  ORG_RDNMA?: string;
  ORG_RDNDA?: string;
  FOND_SC_NM?: string;
}

/** NEIS 가 한 번에 돌려주는 최대 건수 */
const NEIS_MAX_PAGE_SIZE = 1000;

/**
 * 시·도 교육청의 학교 목록을 전부 받는다 — NEIS 는 한 번에 1,000건까지라 나눠 받는다.
 *
 * 10/7: 첫 1,000건만 받아 세던 탓에 학교가 1,000곳이 넘는 서울(1,416)·경기(2,667)·경남(1,017)의
 * 시·군·구 학교 수가 전부 적게 나왔다(수원시 65 → 실제 214).
 * 자료 없음(INFO-200)은 빈 배열, 그 밖의 실패는 예외 — 호출자가 null·502 로 바꾼다.
 */
export async function fetchEduSchoolRows(
  apiKey: string,
  eduCode: string,
  timeoutMs: number
): Promise<NeisSchoolRow[]> {
  const getPage = async (pIndex: number, pSize: number) => {
    const url = new URL(API_BASE);
    url.searchParams.set("KEY", apiKey);
    url.searchParams.set("Type", "json");
    url.searchParams.set("pIndex", String(pIndex));
    url.searchParams.set("pSize", String(pSize));
    url.searchParams.set("ATPT_OFCDC_SC_CODE", eduCode);
    const res = await fetch(url.toString(), { next: { revalidate: 86400 }, signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.RESULT) {
      if (json.RESULT.CODE === "INFO-200") return null;
      throw new Error(`NEIS error: ${json.RESULT.CODE}`);
    }
    return json;
  };

  const head = await getPage(1, 1);
  const total = Number(head?.schoolInfo?.[0]?.head?.[0]?.list_total_count ?? 0);
  if (!head || !total) return [];

  const pageCount = Math.ceil(total / NEIS_MAX_PAGE_SIZE);
  const pages = await Promise.all(
    Array.from({ length: pageCount }, (_, i) => getPage(i + 1, NEIS_MAX_PAGE_SIZE))
  );
  return pages.flatMap((p) => (p?.schoolInfo?.[1]?.row ?? []) as NeisSchoolRow[]);
}

/**
 * 학교 도로명 주소가 그 시·군·구(또는 시 아래 구)에 속하는가 — 주소 낱말이 이름과 같을 때만.
 *
 * 10/7: 이름이 들어 있기만 하면 세던 탓에 '동구'가 남동구(인천), '서구'가 달서구(대구)·강서구(부산)
 * 학교까지 셌다(대구 서구 140 → 실제 31). 띄어쓰기 없이 붙은 원천 주소 1건(전북교육청 전주)은 세지 못한다.
 */
export function isSchoolInDistrict(
  address: string | null | undefined,
  districtName: string
): boolean {
  if (!address || !districtName) return false;
  return address.split(/\s+/).includes(districtName);
}

/**
 * 특정 교육청 + 시군구명으로 시군구 단위 학교 수를 조회한다.
 *
 * NEIS API의 LCTN_SC_NM 파라미터는 시도 수준만 지원하므로,
 * 시도 전체 학교를 조회한 뒤 주소(ORG_RDNMA)의 낱말이 시군구명과 같은
 * 학교만 카운트한다(시 단위 "영주시"·시 아래 구 "장안구" 모두).
 * API 실패 시 null을 반환.
 */
async function fetchSigunguSchoolCount(
  apiKey: string,
  eduCode: string,
  sigunguName: string
): Promise<SchoolData | null> {
  try {
    const rows = await fetchEduSchoolRows(apiKey, eduCode, FETCH_TIMEOUT);
    const count = rows.filter((r) => isSchoolInDistrict(r.ORG_RDNMA, sigunguName)).length;

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
