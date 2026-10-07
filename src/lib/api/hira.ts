/**
 * 건강보험심사평가원 의료기관 정보 API 유틸리티
 * - 시도별 의료기관 총 수 조회
 * - 서버 컴포넌트에서만 호출 (API Key 보호)
 */

import { FETCH_TIMEOUT } from "./_build-phase";
import { buildDataGoKrRequest, isDataGoKrProxied } from "./_datagokr";

// 8/30: data.go.kr가 AWS 대역을 400(code 10)으로 위장 차단 → 프록시 스위치(_datagokr.ts)
const HIRA_PATH = "B551182/hospInfoServicev2/getHospBasisList";

// 2026-05-12: HIRA API 응답 시간 변동성 큼 (1~10s). 기본 5s timeout으로 누락 빈발.
// 시도별 의료기관 호출은 12s + 실패 시 1회 retry 적용.
const HIRA_FETCH_TIMEOUT = Math.max(FETCH_TIMEOUT, 12_000);

async function fetchHiraJson(url: string, extraHeaders: Record<string, string> = {}): Promise<unknown> {
  // 1회 retry — 첫 호출 timeout/network 실패 시 한 번 더 시도
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(HIRA_FETCH_TIMEOUT),
        headers: extraHeaders,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === 1) throw err;
      // retry — 짧은 backoff 없이 즉시 재시도 (API 측 transient 실패 가정)
    }
  }
  throw new Error("unreachable");
}

/** 심평원 시도코드 → 시도명 매핑 */
const SIDO_NAME_MAP: Record<string, string> = {
  "110000": "서울특별시",
  "210000": "부산광역시",
  "220000": "인천광역시",
  "230000": "대구광역시",
  "240000": "광주광역시",
  "250000": "대전광역시",
  "260000": "울산광역시",
  "290000": "세종특별자치시",
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

/** 심평원이 광주를 '전남광주'(360000) 아래로 옮긴 뒤의 광주 5구 코드 — 동·북·서·광산·남 (10/7 전수 대조) */
const GWANGJU_GU_HIRA_CODES = ["360801", "360802", "360803", "360804", "360805"] as const;

/**
 * 우리 시·도 코드(PROVINCES.hiraSidoCd) → 심평원 조회 방식.
 *
 * 10/7 운영 전수 대조: 심평원이 광주 5구를 '전남광주'(360000) 아래 360801~360805 로 옮겨 240000 에는
 * 3곳만 남았고(광주 서구 의료기관 '0개'), 전남 시·도 합계에는 광주 병원이 섞였다. 세종은 심평원 코드가
 * 410000 이라 우리 290000 으로는 0곳이었다. 우리 시·도 체계(광주·전남 분리, PROVINCES SSOT)는 그대로 두고
 * 여기서만 바꿔 센다.
 */
const HIRA_SIDO_QUERY: Record<string, { sidoCd: string; onlyGu?: readonly string[]; exceptGu?: readonly string[] }> = {
  "240000": { sidoCd: "360000", onlyGu: GWANGJU_GU_HIRA_CODES }, // 광주 = 통합 코드 중 광주 5구
  "360000": { sidoCd: "360000", exceptGu: GWANGJU_GU_HIRA_CODES }, // 전남 = 통합 코드 전체 − 광주 5구
  "290000": { sidoCd: "410000" }, // 세종
};

/** 우리 시·도 코드 → 심평원 조회 코드 */
export function toHiraSidoCd(sidoCd: string): string {
  return HIRA_SIDO_QUERY[sidoCd]?.sidoCd ?? sidoCd;
}

/**
 * 의료기관 수 하나를 셀 때 심평원에 실제로 보내는 (sidoCd, sgguCd) 묶음 — 시·도 코드 변환(광주·전남·세종)과
 * 구가 있는 시의 구 전개까지 fetchSidoMedicalCount·fetchSigunguMedicalFacilities·fetchGuMedicalFacilities 와 같다.
 * 프록시 Worker 예열 목록(scripts/gen-hira-warm-list.ts)이 쓴다 — 예열 키가 앱 요청과 달라 예열이 헛돌지 않게.
 */
export function hiraCountRequests(
  sidoCd: string,
  sgguCd?: string,
  opts: { single?: boolean } = {},
): { sidoCd: string; sgguCd?: string }[] {
  const sido = toHiraSidoCd(sidoCd);
  if (!sgguCd) {
    const q = HIRA_SIDO_QUERY[sidoCd];
    if (q?.onlyGu) return q.onlyGu.map((c) => ({ sidoCd: sido, sgguCd: c }));
    if (q?.exceptGu) return [{ sidoCd: sido }, ...q.exceptGu.map((c) => ({ sidoCd: sido, sgguCd: c }))];
    return [{ sidoCd: sido }];
  }
  const codes = !opts.single && GU_HIRA_CODES_MAP[sgguCd] ? GU_HIRA_CODES_MAP[sgguCd] : [sgguCd];
  return codes.map((c) => ({ sidoCd: sido, sgguCd: c }));
}

/** 심평원 의료기관 수 하나 — 실패면 null */
async function fetchHiraTotal(sidoCd: string, sgguCd?: string): Promise<number | null> {
  const params: Record<string, string> = { sidoCd: toHiraSidoCd(sidoCd), pageNo: "1", numOfRows: "1", _type: "json" };
  if (sgguCd) params.sgguCd = sgguCd;
  const req = buildDataGoKrRequest(HIRA_PATH, params);
  if (!req) return null;

  try {
    const json = (await fetchHiraJson(req.url, req.headers)) as {
      response?: { body?: { totalCount?: number | string } };
    };
    const totalCount = json?.response?.body?.totalCount;
    if (totalCount == null) {
      throw new Error("totalCount not found in response");
    }
    return Number(totalCount);
  } catch (error) {
    console.error(
      `Failed to fetch medical facility count for ${sidoCd}${sgguCd ? `/${sgguCd}` : ""}:`,
      error
    );
    return null;
  }
}

/** 여러 구 코드의 합 — 하나라도 실패하면 null. 덜 센 합을 숫자로 내보내지 않는다 (10/7) */
async function sumHiraTotals(sidoCd: string, sgguCds: readonly string[]): Promise<number | null> {
  const parts = await Promise.all(sgguCds.map((c) => fetchHiraTotal(sidoCd, c)));
  if (parts.some((p) => p === null)) return null;
  return (parts as number[]).reduce((a, b) => a + b, 0);
}

/**
 * 구 분할 시: 시 hiraSgguCd → 전체 구 코드 매핑.
 * HIRA는 구별로 sgguCd가 다르므로 시 전체 의료기관 수를 얻으려면
 * 각 구의 totalCount를 합산해야 한다.
 */
export const GU_HIRA_CODES_MAP: Record<string, string[]> = {
  "310604": ["310601", "310602", "310603", "310604"], // 수원시 (권선·장안·팔달·영통)
  "310403": ["310401", "310402", "310403"],           // 성남시 (수정·중원·분당)
  "310702": ["310701", "310702"],                     // 안양시 (만안·동안)
  "310303": ["310301", "310302", "310303"],           // 부천시 (소사·오정·원미)
  "311102": ["311101", "311102"],                     // 안산시 (단원·상록)
  "311903": ["311901", "311902", "311903"],           // 고양시 (덕양·일산서·일산동)
  "312003": ["312001", "312002", "312003"],           // 용인시 (기흥·수지·처인)
  // 화성시: 2026년 구 신설(만세·효행·병점·동탄) — 우리 312504 는 동탄구 하나라 시 전체가 468 로 보였다(실제 1,034, 10/7).
  // 312500 은 시 단위로 남은 2곳
  "312504": ["312500", "312501", "312502", "312503", "312504"], // 화성시 (시·만세·효행·병점·동탄)
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
  sidoCd: string
): Promise<MedicalFacilityData | null> {
  const q = HIRA_SIDO_QUERY[sidoCd];
  let total: number | null;
  if (q?.onlyGu) {
    total = await sumHiraTotals(sidoCd, q.onlyGu);
  } else if (q?.exceptGu) {
    const [all, excluded] = await Promise.all([fetchHiraTotal(sidoCd), sumHiraTotals(sidoCd, q.exceptGu)]);
    total = all === null || excluded === null ? null : all - excluded;
  } else {
    total = await fetchHiraTotal(sidoCd);
  }
  if (total === null) return null;

  return {
    sidoCd,
    sidoName: SIDO_NAME_MAP[sidoCd] ?? sidoCd,
    totalCount: total,
  };
}

/**
 * 특정 시군구의 의료기관 총 수를 조회한다.
 * sidoCd + sgguCd 조합으로 시군구 수준 필터링.
 */
async function fetchSigunguMedicalCount(
  sidoCd: string,
  sgguCd: string
): Promise<MedicalFacilityData | null> {
  const total = await fetchHiraTotal(sidoCd, sgguCd);
  if (total === null) return null;
  return {
    sidoCd: `${sidoCd}_${sgguCd}`,
    sidoName: sgguCd,
    totalCount: total,
  };
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
  if (!isDataGoKrProxied() && !process.env.DATA_GO_KR_API_KEY) {
    console.error("DATA_GO_KR_API_KEY is not set");
    return null;
  }

  // 구 분할 시: 각 구의 의료기관 수를 병렬 조회하여 합산
  const guCodes = GU_HIRA_CODES_MAP[sgguCd];
  if (guCodes) {
    // 한 구라도 실패하면 null — 예전엔 성공한 구만 더해 시 전체를 덜 센 숫자로 보였다 (10/7)
    const total = await sumHiraTotals(sidoCd, guCodes);
    if (total === null) return null;
    return {
      sidoCd: `${sidoCd}_${sgguCd}`,
      sidoName: sgguCd,
      totalCount: total,
    };
  }

  return fetchSigunguMedicalCount(sidoCd, sgguCd);
}

/**
 * 시 아래 구 하나의 의료기관 수 — 구 코드 하나만 센다.
 * 시 대표 코드는 그 시의 구 코드 하나와 같아서(수원 310604 = 영통구) fetchSigunguMedicalFacilities 로
 * 구를 물으면 시 전체가 합쳐졌다(영통구 1,806 → 실제 549, 10/7). 구 상세는 반드시 이 함수로.
 */
export async function fetchGuMedicalFacilities(
  sidoCd: string,
  sgguCd: string
): Promise<MedicalFacilityData | null> {
  if (!isDataGoKrProxied() && !process.env.DATA_GO_KR_API_KEY) {
    console.error("DATA_GO_KR_API_KEY is not set");
    return null;
  }
  return fetchSigunguMedicalCount(sidoCd, sgguCd);
}

/**
 * 의료기관 목록(/api/medical-list)을 이어 붙일 심평원 조회 단위.
 * - 시 아래 구(single) → 구 코드 하나 / 구가 있는 시 → 그 시의 구 전부 / 그 밖 시·군·구 → 코드 하나
 * - 시·도: 광주 = 광주 5구, 전남 = provinceGuCodes(전남 시·군 코드 — 호출자가 데이터에서 넘김), 그 밖 = 시·도 전체
 */
export function hiraListUnits(
  sidoCd: string,
  sgguCd: string | null,
  opts: { single?: boolean; provinceGuCodes?: readonly string[] } = {}
): { sidoCd: string; sgguCd?: string }[] {
  const hiraSido = toHiraSidoCd(sidoCd);
  if (sgguCd) {
    const codes = (!opts.single && GU_HIRA_CODES_MAP[sgguCd]) || [sgguCd];
    return codes.map((c) => ({ sidoCd: hiraSido, sgguCd: c }));
  }
  const q = HIRA_SIDO_QUERY[sidoCd];
  if (q?.onlyGu) return q.onlyGu.map((c) => ({ sidoCd: hiraSido, sgguCd: c }));
  if (q?.exceptGu && opts.provinceGuCodes?.length) {
    return opts.provinceGuCodes.map((c) => ({ sidoCd: hiraSido, sgguCd: c }));
  }
  return [{ sidoCd: hiraSido }];
}

/**
 * 여러 시도의 의료기관 수를 병렬 조회한다.
 * API 실패 시 빈 배열을 반환한다 (graceful degradation).
 */
export async function fetchMedicalFacilities(
  sidoCodes: string[]
): Promise<MedicalFacilityData[]> {
  if (!isDataGoKrProxied() && !process.env.DATA_GO_KR_API_KEY) {
    console.error("DATA_GO_KR_API_KEY is not set");
    return [];
  }

  // 중복 제거
  const uniqueCodes = [...new Set(sidoCodes)];

  const results = await Promise.allSettled(
    uniqueCodes.map((code) => fetchSidoMedicalCount(code))
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<MedicalFacilityData | null> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value)
    .filter((v): v is MedicalFacilityData => v !== null);
}
