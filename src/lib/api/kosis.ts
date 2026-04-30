/**
 * KOSIS Open API 유틸리티
 * - 농업 관련 통계 데이터 조회
 * - 서버 컴포넌트에서만 호출 (API Key 보호)
 */

import { FETCH_TIMEOUT } from "./_build-phase";

const API_BASE =
  "https://kosis.kr/openapi/Param/statisticsParameterData.do";

/** KOSIS 통계표 ID */
export const KOSIS_TABLE = {
  /** 시군구별·성별 귀농가구원 (귀농인수) */
  RETURN_FARM_PERSON: "DT_1A02002",
  /** 시군구별·가구원수별 귀농가구 (가구수) */
  RETURN_FARM_HOUSEHOLD: "DT_1A02008",
  /** 시군구별·성별 귀촌인 (귀촌인수) */
  RETURN_RURAL_PERSON: "DT_1A02015",
  /** 시군별 논벼 생산량 (재배면적 ha, 생산량 톤) */
  RICE_PRODUCTION: "DT_1ET0034",
  /** 과수 재배 농가 및 면적 */
  FRUIT_AREA: "DT_1AG20411",
  /** 시설작물 재배면적 */
  FACILITY_CROP_AREA: "DT_1ET0017",
  /** 농작물 생산조사 — 식량작물(미곡 제외), 채소, 특용작물 통합 */
  CROP_PRODUCTION: "DT_1ET0292",
  /** 논벼 생산비 — 10a당 총수입·경영비·소득·순수익 */
  RICE_COST: "DT_1EA1501",
  /** 마늘 소득분석 — 10a당 총수입·경영비·소득·순수익 */
  GARLIC_INCOME: "DT_1EC0044",
  /** 양파 소득분석 — 10a당 총수입·경영비·소득·순수익 */
  ONION_INCOME: "DT_1EC0054",
  /** 콩 소득분석 — 10a당 총수입·경영비·소득·순수익 */
  SOYBEAN_INCOME: "DT_1EC0084",
} as const;

/** KOSIS API 응답 원본 아이템 */
interface KOSISRawItem {
  C1_NM: string; // 지역명
  ITM_NM: string; // 항목명
  DT: string; // 데이터 값
  UNIT_NM: string; // 단위
  PRD_DE: string; // 기간
  TBL_NM: string; // 테이블명
}

export interface CropStatItem {
  regionName: string;
  cropName: string;
  cultivationArea: number; // 재배면적 (ha)
  production: number; // 생산량 (톤)
  year: number;
}

// ── 쌀 생산비(소득) 조회 ──

/** 쌀(논벼) 10a당 소득 데이터 */
export interface RiceIncomeData {
  /** 10a당 총수입 (원) */
  grossRevenue: number;
  /** 10a당 경영비 (원) */
  operatingCost: number;
  /** 10a당 소득 = 총수입 − 경영비 (원) */
  income: number;
  /** 10a당 생산비 (원) — 경영비 + 자가노력비 등 */
  productionCost: number;
  /** 10a당 순수익 = 총수입 − 생산비 (원) */
  netProfit: number;
  /** 데이터 연도 (예: 2024) */
  year: number;
}

/**
 * KOSIS에서 쌀(논벼) 10a당 소득 데이터를 조회한다.
 *
 * 통계표: DT_1EA1501 (농축산물생산비조사 - 논벼)
 * 발표: 매년 3월 (전년산 데이터)
 *
 * @returns 최신 연도의 소득 데이터, 조회 실패 시 null
 */
export async function fetchRiceIncome(): Promise<RiceIncomeData | null> {
  const apiKey = process.env.KOSIS_API_KEY;
  if (!apiKey) return null;

  const currentYear = new Date().getFullYear();

  // 생산비조사는 전년산 → 전년도부터 시도, 없으면 2년 전
  for (const year of [currentYear - 1, currentYear - 2]) {
    const data = await fetchRiceIncomeFromKOSIS(apiKey, year);
    if (data) return data;
  }

  return null;
}

async function fetchRiceIncomeFromKOSIS(
  apiKey: string,
  year: number,
): Promise<RiceIncomeData | null> {
  const url = new URL(API_BASE);
  url.searchParams.set("method", "getList");
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("itmId", "ALL");
  url.searchParams.set("objL1", "ALL");
  url.searchParams.set("objL2", "");
  url.searchParams.set("format", "json");
  url.searchParams.set("jsonVD", "Y");
  url.searchParams.set("prdSe", "Y");
  url.searchParams.set("startPrdDe", String(year));
  url.searchParams.set("endPrdDe", String(year));
  url.searchParams.set("orgId", "101");
  url.searchParams.set("tblId", KOSIS_TABLE.RICE_COST);

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 86400 * 7 }, // 7일 캐시 (연 1회 갱신)
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });

    if (!res.ok) return null;

    const json = await res.json();
    if (!Array.isArray(json) || json.length === 0) return null;

    return parseRiceIncomeItems(json as KOSISRawItem[], year);
  } catch {
    return null;
  }
}

/**
 * 쌀 생산비조사 KOSIS 응답에서 10a당 주요 지표를 추출한다.
 *
 * ITM_NM 패턴 예시: "10a당 총수입", "10a당 경영비", "10a당 소득",
 *                   "10a당 생산비(비용가)", "10a당 순수익"
 */
function parseRiceIncomeItems(
  raw: KOSISRawItem[],
  year: number,
): RiceIncomeData | null {
  let grossRevenue = 0;
  let operatingCost = 0;
  let income = 0;
  let productionCost = 0;
  let netProfit = 0;
  let found = false;

  for (const item of raw) {
    const value = parseFloat(item.DT);
    if (isNaN(value)) continue;

    const name = item.ITM_NM;

    if (name.includes("총수입") && name.includes("10a")) {
      grossRevenue = value;
      found = true;
    } else if (name.includes("경영비") && name.includes("10a")) {
      operatingCost = value;
    } else if (name.includes("소득") && !name.includes("순수익") && name.includes("10a")) {
      income = value;
    } else if (name.includes("생산비") && name.includes("10a")) {
      productionCost = value;
    } else if (name.includes("순수익") && name.includes("10a")) {
      netProfit = value;
    }
  }

  if (!found) return null;

  // 소득이 직접 제공되지 않으면 계산
  if (income === 0 && grossRevenue > 0 && operatingCost > 0) {
    income = grossRevenue - operatingCost;
  }
  // 순수익이 직접 제공되지 않으면 계산
  if (netProfit === 0 && grossRevenue > 0 && productionCost > 0) {
    netProfit = grossRevenue - productionCost;
  }

  return { grossRevenue, operatingCost, income, productionCost, netProfit, year };
}

// ── 작물 소득분석 조회 (DT_1EC 시리즈: 마늘·양파·콩 등) ──

/** 작물별 소득분석 API 테이블 매핑 */
export const CROP_INCOME_TABLE: Record<string, string> = {
  garlic: KOSIS_TABLE.GARLIC_INCOME,
  onion: KOSIS_TABLE.ONION_INCOME,
  soybean: KOSIS_TABLE.SOYBEAN_INCOME,
};

/**
 * KOSIS에서 작물별 10a당 소득 데이터를 조회한다.
 *
 * DT_1EC 시리즈 통계표 (농축산물생산비조사 - 소득분석)
 * 발표: 마늘·양파는 매년 10월, 콩은 매년 3월 (전년산 데이터)
 *
 * @param tblId KOSIS 통계표 ID (예: "DT_1EC0044")
 * @returns 최신 연도의 소득 데이터, 조회 실패 시 null
 */
export async function fetchCropIncome(
  tblId: string,
): Promise<RiceIncomeData | null> {
  const apiKey = process.env.KOSIS_API_KEY;
  if (!apiKey) return null;

  const currentYear = new Date().getFullYear();

  // 전년산부터 시도, 없으면 2년 전
  for (const year of [currentYear - 1, currentYear - 2]) {
    const data = await fetchCropIncomeFromKOSIS(tblId, apiKey, year);
    if (data) return data;
  }

  return null;
}

async function fetchCropIncomeFromKOSIS(
  tblId: string,
  apiKey: string,
  year: number,
): Promise<RiceIncomeData | null> {
  const url = new URL(API_BASE);
  url.searchParams.set("method", "getList");
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("itmId", "ALL");
  url.searchParams.set("objL1", "ALL");
  url.searchParams.set("objL2", "");
  url.searchParams.set("format", "json");
  url.searchParams.set("jsonVD", "Y");
  url.searchParams.set("prdSe", "Y");
  url.searchParams.set("startPrdDe", String(year));
  url.searchParams.set("endPrdDe", String(year));
  url.searchParams.set("orgId", "101");
  url.searchParams.set("tblId", tblId);

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 86400 * 7 }, // 7일 캐시 (연 1회 갱신)
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });

    if (!res.ok) return null;

    const json = await res.json();
    if (!Array.isArray(json) || json.length === 0) return null;

    return parseCropIncomeItems(json as KOSISRawItem[], year);
  } catch {
    return null;
  }
}

/**
 * DT_1EC 시리즈 소득분석 응답에서 10a당 주요 지표를 추출한다.
 *
 * 응답 구조 (DT_1EA와 다름):
 *   ITM_NM = "10a당" | "농가당"  (단위 구분)
 *   C1_NM  = "총수입" | "경영비" | "소득" | "생산비" | "순수익" (항목명)
 */
function parseCropIncomeItems(
  raw: KOSISRawItem[],
  year: number,
): RiceIncomeData | null {
  let grossRevenue = 0;
  let operatingCost = 0;
  let income = 0;
  let productionCost = 0;
  let netProfit = 0;
  let found = false;

  for (const item of raw) {
    // "10a당" 데이터만 사용 ("농가당" 제외)
    if (item.ITM_NM !== "10a당") continue;

    const value = parseFloat(item.DT);
    if (isNaN(value)) continue;

    const name = item.C1_NM;

    if (name === "총수입") {
      grossRevenue = value;
      found = true;
    } else if (name === "경영비") {
      operatingCost = value;
    } else if (name === "소득") {
      income = value;
    } else if (name === "생산비") {
      productionCost = value;
    } else if (name === "순수익") {
      netProfit = value;
    }
  }

  if (!found) return null;

  // 소득이 직접 제공되지 않으면 계산
  if (income === 0 && grossRevenue > 0 && operatingCost > 0) {
    income = grossRevenue - operatingCost;
  }
  // 순수익이 직접 제공되지 않으면 계산
  if (netProfit === 0 && grossRevenue > 0 && productionCost > 0) {
    netProfit = grossRevenue - productionCost;
  }

  return { grossRevenue, operatingCost, income, productionCost, netProfit, year };
}

// ── 작물 생산 통계 조회 ──

/**
 * KOSIS 통계표에서 작물 통계 데이터를 조회한다.
 *
 * 농업 통계는 보통 전년도가 최신이므로,
 * 당해년도를 먼저 시도한 뒤 데이터가 없으면 전년도로 fallback한다.
 */
export async function fetchCropStats(
  tblId: string,
  objL1Code?: string
): Promise<CropStatItem[]> {
  const apiKey = process.env.KOSIS_API_KEY;
  if (!apiKey) return [];

  const currentYear = new Date().getFullYear();

  // 당해년도 시도
  const items = await fetchFromKOSIS(tblId, apiKey, currentYear, objL1Code);
  if (items.length > 0) return items;

  // fallback: 전년도
  return fetchFromKOSIS(tblId, apiKey, currentYear - 1, objL1Code);
}

// --- 내부 함수 ---

async function fetchFromKOSIS(
  tblId: string,
  apiKey: string,
  year: number,
  objL1Code?: string
): Promise<CropStatItem[]> {
  const url = new URL(API_BASE);
  url.searchParams.set("method", "getList");
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("itmId", "ALL");
  url.searchParams.set("objL1", objL1Code || "ALL");
  url.searchParams.set("objL2", "");
  url.searchParams.set("format", "json");
  url.searchParams.set("jsonVD", "Y");
  url.searchParams.set("prdSe", "Y");
  url.searchParams.set("startPrdDe", String(year));
  url.searchParams.set("endPrdDe", String(year));
  url.searchParams.set("orgId", "101");
  url.searchParams.set("tblId", tblId);

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 86400 }, // 24시간 캐시
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });

    if (!res.ok) {
      throw new Error(`KOSIS HTTP ${res.status}`);
    }

    const json = await res.json();

    // KOSIS 는 에러 시에도 200을 반환하며 err 필드를 포함할 수 있다
    if (!Array.isArray(json)) return [];

    const raw: KOSISRawItem[] = json;
    return parseRawItems(raw);
  } catch {
    return [];
  }
}

/**
 * KOSIS 원본 응답을 CropStatItem 으로 변환한다.
 *
 * 동일 지역의 여러 항목(재배면적, 생산량 등)을 하나의 레코드로 합친다.
 */
function parseRawItems(raw: KOSISRawItem[]): CropStatItem[] {
  // 지역별로 그룹핑
  const regionMap = new Map<
    string,
    { cultivationArea: number; production: number; cropName: string; year: number }
  >();

  for (const item of raw) {
    const value = parseFloat(item.DT);
    if (isNaN(value)) continue;

    const key = item.C1_NM;
    if (!regionMap.has(key)) {
      regionMap.set(key, {
        cultivationArea: 0,
        production: 0,
        cropName: extractCropName(item.ITM_NM, item.TBL_NM),
        year: parseInt(item.PRD_DE, 10),
      });
    }

    const entry = regionMap.get(key)!;
    const itmLower = item.ITM_NM.toLowerCase();

    if (itmLower.includes("재배면적") || itmLower.includes("면적")) {
      entry.cultivationArea = value;
    } else if (itmLower.includes("생산량") || itmLower.includes("수확량")) {
      entry.production = value;
    }
  }

  return Array.from(regionMap.entries()).map(([regionName, data]) => ({
    regionName,
    cropName: data.cropName,
    cultivationArea: data.cultivationArea,
    production: data.production,
    year: data.year,
  }));
}

/** 항목명 또는 테이블명에서 작물 이름을 추출한다. */
function extractCropName(itmName: string, tblName: string): string {
  // "논벼:재배면적" → "논벼"
  const colonIdx = itmName.indexOf(":");
  if (colonIdx > 0) return itmName.slice(0, colonIdx);

  // 테이블명에서 추출 ("시군별 논벼 생산량" → "논벼")
  const match = tblName.match(/(?:시군별|시도별)\s+(.+?)(?:\s+(?:생산량|재배|면적))/);
  if (match) return match[1];

  return itmName;
}

// ── 귀농·귀촌 시군구별 통계 조회 ──

/** KOSIS 귀농/귀촌 응답 원본 아이템 (C1=지역, C2=성별/가구원수) */
interface KOSISReturnFarmRawItem {
  C1: string;      // 지역코드 (00=전국, 31=경기, 31070=평택 등)
  C1_NM: string;   // 지역명
  C2: string;      // 분류코드 (0=계, 1=남, 2=여 / 00=계, 01=1인 등)
  C2_NM: string;   // 분류명
  ITM_ID: string;  // 항목ID (T01, T02 등)
  ITM_NM: string;  // 항목명
  DT: string;      // 값
  PRD_DE: string;  // 기간 (연도)
}

/** 시군구별 귀농·귀촌 데이터 */
export interface ReturnFarmData {
  /** KOSIS 지역코드 (5자리 시군구) */
  regionCode: string;
  /** 지역명 */
  regionName: string;
  /** 귀농인 수 (명) */
  returnFarmPerson: number;
  /** 귀농가구 수 (가구) */
  returnFarmHousehold: number;
  /** 귀촌인 수 (명) */
  returnRuralPerson: number;
  /** 데이터 연도 */
  year: number;
}

/**
 * KOSIS에서 시군구별 귀농·귀촌 통계를 조회한다.
 *
 * 3개 테이블 병렬 호출:
 * - DT_1A02002: 귀농인 수 (itmId=T02, C2=0 계)
 * - DT_1A02008: 귀농가구 수 (itmId=T01, C2=00 계)
 * - DT_1A02015: 귀촌인 수 (itmId=T01, C2=0 계)
 *
 * @param regionCode 시군구 코드 (5자리, 없으면 전체 조회)
 */
export async function fetchReturnFarmStats(
  regionCode?: string,
): Promise<ReturnFarmData[]> {
  const apiKey = process.env.KOSIS_API_KEY;
  if (!apiKey) return [];

  const currentYear = new Date().getFullYear();

  // 귀농귀촌 통계는 보통 6월에 전년 데이터 공개 → 전년~2년전 시도
  for (const year of [currentYear - 1, currentYear - 2, currentYear - 3]) {
    const data = await fetchReturnFarmForYear(apiKey, year, regionCode);
    if (data.length > 0) return data;
  }

  return [];
}

async function fetchReturnFarmForYear(
  apiKey: string,
  year: number,
  regionCode?: string,
): Promise<ReturnFarmData[]> {
  const buildUrl = (tblId: string, objL2: string) => {
    const url = new URL(API_BASE);
    url.searchParams.set("method", "getList");
    url.searchParams.set("apiKey", apiKey);
    url.searchParams.set("itmId", "ALL");
    url.searchParams.set("objL1", regionCode ?? "ALL");
    url.searchParams.set("objL2", objL2);
    url.searchParams.set("format", "json");
    url.searchParams.set("jsonVD", "Y");
    url.searchParams.set("prdSe", "Y");
    url.searchParams.set("startPrdDe", String(year));
    url.searchParams.set("endPrdDe", String(year));
    url.searchParams.set("orgId", "101");
    url.searchParams.set("tblId", tblId);
    return url.toString();
  };

  try {
    const [personRes, householdRes, ruralRes] = await Promise.allSettled([
      fetch(buildUrl(KOSIS_TABLE.RETURN_FARM_PERSON, "0"), {
        next: { revalidate: 86400 * 7 },
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      }),
      fetch(buildUrl(KOSIS_TABLE.RETURN_FARM_HOUSEHOLD, "00"), {
        next: { revalidate: 86400 * 7 },
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      }),
      fetch(buildUrl(KOSIS_TABLE.RETURN_RURAL_PERSON, "0"), {
        next: { revalidate: 86400 * 7 },
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      }),
    ]);

    const parseJson = async (result: PromiseSettledResult<Response>) => {
      if (result.status !== "fulfilled" || !result.value.ok) return [];
      const json = await result.value.json();
      return Array.isArray(json) ? (json as KOSISReturnFarmRawItem[]) : [];
    };

    const [personItems, householdItems, ruralItems] = await Promise.all([
      parseJson(personRes),
      parseJson(householdRes),
      parseJson(ruralRes),
    ]);

    // 귀농인수가 없으면 해당 연도 데이터 없음
    if (personItems.length === 0) return [];

    return mergeReturnFarmData(personItems, householdItems, ruralItems, year);
  } catch {
    return [];
  }
}

/**
 * 3개 테이블 응답을 지역코드 기준으로 병합한다.
 */
function mergeReturnFarmData(
  personItems: KOSISReturnFarmRawItem[],
  householdItems: KOSISReturnFarmRawItem[],
  ruralItems: KOSISReturnFarmRawItem[],
  year: number,
): ReturnFarmData[] {
  const regionMap = new Map<string, ReturnFarmData>();

  // 귀농인 수 (T02 = 귀농인수)
  for (const item of personItems) {
    if (item.ITM_ID !== "T02") continue;
    const value = parseInt(item.DT, 10);
    if (isNaN(value)) continue;

    const existing = regionMap.get(item.C1);
    if (existing) {
      existing.returnFarmPerson = value;
    } else {
      regionMap.set(item.C1, {
        regionCode: item.C1,
        regionName: item.C1_NM,
        returnFarmPerson: value,
        returnFarmHousehold: 0,
        returnRuralPerson: 0,
        year,
      });
    }
  }

  // 귀농가구 수 (T01 = 가구수)
  for (const item of householdItems) {
    if (item.ITM_ID !== "T01") continue;
    const value = parseInt(item.DT, 10);
    if (isNaN(value)) continue;

    const existing = regionMap.get(item.C1);
    if (existing) {
      existing.returnFarmHousehold = value;
    }
  }

  // 귀촌인 수 (T01 = 귀촌인수)
  for (const item of ruralItems) {
    if (item.ITM_ID !== "T01") continue;
    const value = parseInt(item.DT, 10);
    if (isNaN(value)) continue;

    const existing = regionMap.get(item.C1);
    if (existing) {
      existing.returnRuralPerson = value;
    }
  }

  return Array.from(regionMap.values());
}

// ── 귀농·귀촌 연도별 추이 조회 (10년치 한 번에) ──

/** 연도별 귀농·귀촌 추이 데이터 (단일 지역) */
export interface ReturnFarmTrendItem {
  year: number;
  returnFarmPerson: number;
  returnFarmHousehold: number;
  returnRuralPerson: number;
}

/**
 * KOSIS에서 특정 지역의 귀농·귀촌 연도별 추이를 조회한다.
 * startPrdDe ~ endPrdDe 범위를 넓혀 한 번에 여러 연도를 가져온다.
 *
 * @param regionCode 시군구 코드 (5자리)
 * @param years 조회할 연도 수 (기본 10)
 */
export async function fetchReturnFarmTrend(
  regionCode: string,
  years = 10,
): Promise<ReturnFarmTrendItem[]> {
  const apiKey = process.env.KOSIS_API_KEY;
  if (!apiKey) return [];

  const currentYear = new Date().getFullYear();
  const endYear = currentYear - 1;
  const startYear = endYear - years + 1;

  const buildUrl = (tblId: string, objL2: string) => {
    const url = new URL(API_BASE);
    url.searchParams.set("method", "getList");
    url.searchParams.set("apiKey", apiKey);
    url.searchParams.set("itmId", "ALL");
    url.searchParams.set("objL1", regionCode);
    url.searchParams.set("objL2", objL2);
    url.searchParams.set("format", "json");
    url.searchParams.set("jsonVD", "Y");
    url.searchParams.set("prdSe", "Y");
    url.searchParams.set("startPrdDe", String(startYear));
    url.searchParams.set("endPrdDe", String(endYear));
    url.searchParams.set("orgId", "101");
    url.searchParams.set("tblId", tblId);
    return url.toString();
  };

  try {
    const [personRes, householdRes, ruralRes] = await Promise.allSettled([
      fetch(buildUrl(KOSIS_TABLE.RETURN_FARM_PERSON, "0"), {
        next: { revalidate: 86400 * 7 },
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      }),
      fetch(buildUrl(KOSIS_TABLE.RETURN_FARM_HOUSEHOLD, "00"), {
        next: { revalidate: 86400 * 7 },
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      }),
      fetch(buildUrl(KOSIS_TABLE.RETURN_RURAL_PERSON, "0"), {
        next: { revalidate: 86400 * 7 },
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      }),
    ]);

    const parseJson = async (result: PromiseSettledResult<Response>) => {
      if (result.status !== "fulfilled" || !result.value.ok) return [];
      const json = await result.value.json();
      return Array.isArray(json) ? (json as KOSISReturnFarmRawItem[]) : [];
    };

    const [personItems, householdItems, ruralItems] = await Promise.all([
      parseJson(personRes),
      parseJson(householdRes),
      parseJson(ruralRes),
    ]);

    if (personItems.length === 0) return [];

    return mergeReturnFarmTrendData(personItems, householdItems, ruralItems);
  } catch {
    return [];
  }
}

/**
 * 다년도 3개 테이블 응답을 연도별로 병합한다.
 */
function mergeReturnFarmTrendData(
  personItems: KOSISReturnFarmRawItem[],
  householdItems: KOSISReturnFarmRawItem[],
  ruralItems: KOSISReturnFarmRawItem[],
): ReturnFarmTrendItem[] {
  const yearMap = new Map<number, ReturnFarmTrendItem>();

  for (const item of personItems) {
    if (item.ITM_ID !== "T02") continue;
    const value = parseInt(item.DT, 10);
    if (isNaN(value)) continue;
    const year = parseInt(item.PRD_DE, 10);

    const existing = yearMap.get(year);
    if (existing) {
      existing.returnFarmPerson = value;
    } else {
      yearMap.set(year, {
        year,
        returnFarmPerson: value,
        returnFarmHousehold: 0,
        returnRuralPerson: 0,
      });
    }
  }

  for (const item of householdItems) {
    if (item.ITM_ID !== "T01") continue;
    const value = parseInt(item.DT, 10);
    if (isNaN(value)) continue;
    const year = parseInt(item.PRD_DE, 10);
    const existing = yearMap.get(year);
    if (existing) existing.returnFarmHousehold = value;
  }

  for (const item of ruralItems) {
    if (item.ITM_ID !== "T01") continue;
    const value = parseInt(item.DT, 10);
    if (isNaN(value)) continue;
    const year = parseInt(item.PRD_DE, 10);
    const existing = yearMap.get(year);
    if (existing) existing.returnRuralPerson = value;
  }

  return Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
}
