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
import { GUS, SCHOOL_GU_OVERRIDES, getGusOfCity } from "@/lib/data/gus";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";

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
  /** 표준 학교 코드 — 구를 주소로 정할 수 없는 학교의 예외 표(gus.ts SCHOOL_GU_OVERRIDES) 키 */
  SD_SCHUL_CODE?: string;
  SCHUL_NM?: string;
  SCHUL_KND_SC_NM?: string;
  ORG_RDNMA?: string;
  ORG_RDNDA?: string;
  FOND_SC_NM?: string;
}

/** NEIS 가 한 번에 돌려주는 최대 건수 */
const NEIS_MAX_PAGE_SIZE = 1000;

/**
 * NEIS 목록 한 쪽의 시간 제한. 학교 1,000곳짜리 응답은 무거워 기본 제한(빌드 3초·실행 5초)으로는
 * 자주 넘긴다 — 10/7 운영: 나눠 받기로 바꾼 첫 배포에서 시 아래 구 32쪽·시·군·구 16쪽이 시간 초과로
 * 시·도 전체 값으로 대체됐다.
 */
const NEIS_TIMEOUT = Math.max(FETCH_TIMEOUT, 15_000);

/** 같은 교육청 목록을 동시에 여러 번 받지 않는다 — 빌드·동시 렌더가 같은 시·도를 한꺼번에 물을 때 */
const inflightRows = new Map<string, Promise<NeisSchoolRow[]>>();

/**
 * 시·도 교육청의 학교 목록을 전부 받는다 — NEIS 는 한 번에 1,000건까지라 나눠 받는다.
 *
 * 10/7: 첫 1,000건만 받아 세던 탓에 학교가 1,000곳이 넘는 서울(1,416)·경기(2,667)·경남(1,017)의
 * 시·군·구 학교 수가 전부 적게 나왔다(수원시 65 → 실제 214). 첫 쪽(1,000건)에 전체 건수가 함께 오므로
 * 나머지 쪽만 이어서 받는다. 쪽마다 한 번 더 시도하고, 그래도 실패하면 예외 — 호출자가 null·502 로 바꾼다.
 * 자료 없음(INFO-200)은 빈 배열.
 */
export function fetchEduSchoolRows(
  apiKey: string,
  eduCode: string,
  timeoutMs: number = NEIS_TIMEOUT
): Promise<NeisSchoolRow[]> {
  const pending = inflightRows.get(eduCode);
  if (pending) return pending;
  const job = loadEduSchoolRows(apiKey, eduCode, timeoutMs).finally(() => inflightRows.delete(eduCode));
  inflightRows.set(eduCode, job);
  return job;
}

async function loadEduSchoolRows(apiKey: string, eduCode: string, timeoutMs: number): Promise<NeisSchoolRow[]> {
  const getPage = async (pIndex: number) => {
    const url = new URL(API_BASE);
    url.searchParams.set("KEY", apiKey);
    url.searchParams.set("Type", "json");
    url.searchParams.set("pIndex", String(pIndex));
    url.searchParams.set("pSize", String(NEIS_MAX_PAGE_SIZE));
    url.searchParams.set("ATPT_OFCDC_SC_CODE", eduCode);
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const res = await fetch(url.toString(), { next: { revalidate: 86400 }, signal: AbortSignal.timeout(timeoutMs) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.RESULT) {
          if (json.RESULT.CODE === "INFO-200") return null;
          throw new Error(`NEIS error: ${json.RESULT.CODE}`);
        }
        return json;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  };

  const first = await getPage(1);
  if (!first) return [];
  const total = Number(first?.schoolInfo?.[0]?.head?.[0]?.list_total_count ?? 0);
  const rows: NeisSchoolRow[] = [...(first?.schoolInfo?.[1]?.row ?? [])];
  const pageCount = Math.ceil(total / NEIS_MAX_PAGE_SIZE);
  if (pageCount > 1) {
    const rest = await Promise.all(Array.from({ length: pageCount - 1 }, (_, i) => getPage(i + 2)));
    for (const p of rest) rows.push(...(p?.schoolInfo?.[1]?.row ?? []));
  }
  return rows;
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

/** 학교 주소의 낱말 — 도로명 주소(읍·면이 여기 있다) + 상세 주소(법정동: "(상동, ○○초등학교)"·"상동 ○○초"·"(산척동 741)") */
function addressTokens(row: NeisSchoolRow): string[] {
  return [...(row.ORG_RDNMA ?? "").split(/\s+/), ...(row.ORG_RDNDA ?? "").split(/[\s(),]+/)].filter(Boolean);
}

/**
 * 이 학교가 그 시·군·구(또는 시 아래 구)에 속하는가 — 상세 카드의 학교 수와 학교 목록(/api/school-list)이 같은 판정을 쓴다.
 *
 * 기본은 도로명 주소 낱말이 이름과 같을 때(isSchoolInDistrict). 원천 주소에 구 이름이 거의 없는 시(부천 2024·화성 2026 구
 * 설치 — gus.ts legalAreas)의 구는 이렇게 정한다(10/7 — 구 이름만 세면 부천 원미구 14곳·화성 병점구 4곳으로 나왔다):
 *   1) 주소에 이 구 이름 → 이 구, 다른 구 이름 → 그 구
 *   2) 그 시 주소인데 구 이름이 없으면 법정 읍·면·동으로 — 한 구로만 가리킬 때만
 *   3) 그래도 못 정하는 학교(상세 주소에 동이 없음·두 구에 걸친 법정동)는 SCHOOL_GU_OVERRIDES
 * 10/7 통계청 주소 좌표 변환 대조: 부천 134곳 전부·화성 198곳 전부 같은 구(화성 2곳은 주소가 불완전해 좌표 변환 실패).
 */
export function schoolMatcher(eduCode: string, districtName: string): (row: NeisSchoolRow) => boolean {
  const province = PROVINCES.find((p) => p.eduCode === eduCode);
  const gu = province ? GUS.find((g) => g.sidoId === province.id && g.name === districtName && g.legalAreas) : undefined;
  const city = gu ? SIGUNGUS.find((s) => s.id === gu.parentSigunguId && s.sidoId === gu.sidoId) : undefined;
  if (!gu || !city) return (row) => isSchoolInDistrict(row.ORG_RDNMA, districtName);

  const siblings = getGusOfCity(gu.sidoId, gu.parentSigunguId);
  const areaToGu = new Map(siblings.flatMap((g) => (g.legalAreas ?? []).map((a) => [a, g.id] as const)));
  return (row) => {
    if (isSchoolInDistrict(row.ORG_RDNMA, gu.name)) return true;
    if (!isSchoolInDistrict(row.ORG_RDNMA, city.name)) return false;
    if (siblings.some((g) => isSchoolInDistrict(row.ORG_RDNMA, g.name))) return false;
    const override = row.SD_SCHUL_CODE ? SCHOOL_GU_OVERRIDES[row.SD_SCHUL_CODE] : undefined;
    if (override) return override === gu.id;
    const hits = new Set(addressTokens(row).flatMap((t) => areaToGu.get(t) ?? []));
    return hits.size === 1 && hits.has(gu.id);
  };
}

/**
 * 특정 교육청 + 시군구명으로 시군구 단위 학교 수를 조회한다.
 *
 * NEIS API의 LCTN_SC_NM 파라미터는 시도 수준만 지원하므로,
 * 시도 전체 학교를 조회한 뒤 주소(ORG_RDNMA)의 낱말이 시군구명과 같은
 * 학교만 카운트한다(시 단위 "영주시"·시 아래 구 "장안구" 모두). 부천·화성의 구는 법정동까지 본다(schoolMatcher).
 * API 실패 시 null을 반환.
 */
async function fetchSigunguSchoolCount(
  apiKey: string,
  eduCode: string,
  sigunguName: string
): Promise<SchoolData | null> {
  try {
    const rows = await fetchEduSchoolRows(apiKey, eduCode);
    const count = rows.filter(schoolMatcher(eduCode, sigunguName)).length;

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
