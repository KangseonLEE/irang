/**
 * KOSIS Open API 유틸리티
 * - 농업 관련 통계 데이터 조회
 * - 서버 컴포넌트에서만 호출 (API Key 보호)
 */

import { FETCH_TIMEOUT } from "./_build-phase";

const API_BASE =
  "https://kosis.kr/openapi/Param/statisticsParameterData.do";

/** KOSIS 통계표 ID */
const KOSIS_TABLE = {
  /** 시군구별·성별 귀농가구원 (정착자 수) */
  RETURN_FARM_PERSON: "DT_1A02002",
  /** 시군구별·가구원수별 귀농가구 (가구수) */
  RETURN_FARM_HOUSEHOLD: "DT_1A02008",
  /** 시군구별·성별 귀촌인 (귀촌인수) */
  RETURN_RURAL_PERSON: "DT_1A02015",
  // 작물별 시·도 재배면적은 런타임 조회를 쓰지 않는다 — scripts/collect-crop-areas.ts → lib/data/crop-areas.ts (10/9).
  // (10/8: 과실생산량 표를 항목 필터 없이 읽어 콩·마늘 상세에 과일 면적이 그려질 상태였다)
  /** 도별 논벼 소득분석 — C1 도별(00 전국평균) × C2 소득항목(10 총수입·20 생산비·40 순수익·50 경영비·60 소득), ITM 10a당/농가당 (원).
   *  10/10: 종전 DT_1EA1501 은 농가경제조사 표라 항목이 안 맞아 가드가 늘 막았다 */
  RICE_INCOME: "DT_1EC0010",
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
 * 통계표: DT_1EC0010 (농축산물생산비조사 — 도별 논벼 소득분석), 전국평균 행만
 * 발표: 매년 3월 (전년산 데이터 — 2025년산은 2026-03-25)
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
  url.searchParams.set("objL1", "00"); // 전국평균
  url.searchParams.set("objL2", "ALL"); // 소득항목
  url.searchParams.set("objL3", "");
  url.searchParams.set("format", "json");
  url.searchParams.set("jsonVD", "Y");
  url.searchParams.set("prdSe", "Y");
  url.searchParams.set("startPrdDe", String(year));
  url.searchParams.set("endPrdDe", String(year));
  url.searchParams.set("orgId", "101");
  url.searchParams.set("tblId", KOSIS_TABLE.RICE_INCOME);

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 86400 * 7 }, // 7일 캐시 (연 1회 갱신)
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });

    if (!res.ok) return null;

    const json = await res.json();
    if (!Array.isArray(json) || json.length === 0) return null;

    return parseRiceIncomeItems(json as KOSISRiceRawItem[], year);
  } catch {
    return null;
  }
}

/** DT_1EC0010 응답 원본 — C1 = 도별, C2 = 소득항목, ITM = 10a당/농가당 */
export interface KOSISRiceRawItem {
  C1: string;
  C1_NM: string;
  C2_NM: string;
  ITM_NM: string;
  UNIT_NM: string;
  DT: string;
  PRD_DE: string;
}

/**
 * 도별 논벼 소득분석(DT_1EC0010) 응답에서 전국평균·10a당·원 단위 지표만 꺼낸다.
 * 다른 연도·도·단위 행이 섞여 있어도 무시한다. 총수입·경영비·소득 중 하나라도 없으면 null —
 * 계산으로 메우지 않는다(항목을 잘못 짚었는지 가드가 소득 = 총수입 − 경영비로 확인한다).
 */
export function parseRiceIncomeItems(
  raw: KOSISRiceRawItem[],
  year: number,
): RiceIncomeData | null {
  const v: Record<string, number> = {};
  for (const item of raw) {
    if (item.C1 !== "00" || item.ITM_NM !== "10a당" || item.UNIT_NM !== "원") continue;
    if (item.PRD_DE !== String(year)) continue;
    const value = parseFloat(item.DT);
    if (!Number.isFinite(value)) continue;
    v[item.C2_NM] = value;
  }
  const { 총수입: grossRevenue, 경영비: operatingCost, 소득: income, 생산비: productionCost, 순수익: netProfit } = v;
  if (grossRevenue === undefined || operatingCost === undefined || income === undefined) return null;
  return {
    grossRevenue,
    operatingCost,
    income,
    productionCost: productionCost ?? 0,
    netProfit: netProfit ?? (productionCost !== undefined ? grossRevenue - productionCost : 0),
    year,
  };
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
  /** 정착자 수 (명) */
  returnFarmPerson: number;
  /** 정착 가구 수 (가구) */
  returnFarmHousehold: number;
  /** 귀촌인 수 (명) */
  returnRuralPerson: number;
  /** 데이터 연도 */
  year: number;
}

/**
 * KOSIS 귀농·귀촌 조회 실패 — 시간 초과·HTTP 오류·JSON 아님·`err` 30 이 아닌 오류 응답·세 표 중 하나라도 비었을 때.
 * '그 해 자료 없음(공표 전)'과 구분한다 (10/16 QA 🟡-1): 예전엔 둘 다 빈 배열이라 5초 시간 초과가
 * '2025 공표 전'으로 읽혀 조용히 2024 값으로 내려갔다(수집기가 ACTIVE_RETURN_YEAR 2025 → 2024 로 다시 씀).
 */
export class KosisFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KosisFetchError";
  }
}

/** KOSIS 가 '데이터가 존재하지 않습니다'로 답한 경우 — 그 해(또는 그 지역) 자료가 아직 없다 */
const KOSIS_NO_DATA = "nodata" as const;

/** KOSIS 응답 하나 읽기 — 배열이면 행, `{"err":"30"}`이면 자료 없음, 그 밖은 실패(throw) */
async function readKosisList(
  url: string,
  label: string,
  timeoutMs: number,
): Promise<KOSISReturnFarmRawItem[] | typeof KOSIS_NO_DATA> {
  let res: Response;
  try {
    res = await fetch(url, {
      next: { revalidate: 86400 * 7 },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    throw new KosisFetchError(`${label}: ${e instanceof Error ? e.name : "fetch 실패"}`);
  }
  if (!res.ok) throw new KosisFetchError(`${label}: HTTP ${res.status}`);
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new KosisFetchError(`${label}: JSON 아님`);
  }
  if (Array.isArray(json)) return json.length > 0 ? (json as KOSISReturnFarmRawItem[]) : KOSIS_NO_DATA;
  const err = (json as { err?: unknown })?.err;
  if (String(err) === "30") return KOSIS_NO_DATA;
  throw new KosisFetchError(`${label}: 오류 응답 err=${String(err ?? "?")}`);
}

/** 조회 옵션 — 화면은 기본값(빌드 3s·런타임 5s, 재시도 없음), 수집·대조 스크립트는 길게 + 재시도 */
export interface KosisStrictOptions {
  timeoutMs?: number;
  /** 실패 시 다시 묻는 횟수 (자료 없음은 다시 묻지 않는다) */
  retries?: number;
}

async function withRetries<T>(fn: () => Promise<T>, retries: number): Promise<T> {
  let last: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (!(e instanceof KosisFetchError)) throw e;
    }
  }
  throw last;
}

/**
 * KOSIS에서 시군구별 귀농·귀촌 통계를 조회한다 — **실패는 실패로** (수집·대조 스크립트용).
 *
 * 3개 테이블 병렬 호출:
 * - DT_1A02002: 정착자 수 (itmId=T02, C2=0 계)
 * - DT_1A02008: 정착 가구 수 (itmId=T01, C2=00 계)
 * - DT_1A02015: 귀촌인 수 (itmId=T01, C2=0 계)
 *
 * 연도: 올해−1 → −2 → −3 순으로 묻되, **KOSIS 가 '자료 없음'(err 30)이라고 답했을 때만** 이전 해로 내려간다.
 * 시간 초과·오류는 재시도 후에도 실패면 KosisFetchError 를 던진다 — 전년도로 조용히 내려가지 않는다(10/16 QA 🟡-1).
 *
 * @param regionCode 시군구 코드 (5자리, 없으면 전체 조회)
 * @param expectedName 우리 시·군·구 이름 — 주면 응답 지역명이 같은 행만 돌려준다(다르면 빈 배열)
 */
export async function fetchReturnFarmStatsStrict(
  regionCode?: string,
  expectedName?: string,
  options: KosisStrictOptions = {},
): Promise<ReturnFarmData[]> {
  const apiKey = process.env.KOSIS_API_KEY;
  if (!apiKey) throw new KosisFetchError("KOSIS_API_KEY 없음");

  const currentYear = new Date().getFullYear();

  // 귀농귀촌 통계는 보통 6월에 전년 데이터 공개 → 전년~3년전 시도 (자료 없음일 때만)
  for (const year of [currentYear - 1, currentYear - 2, currentYear - 3]) {
    const data = await withRetries(
      () => fetchReturnFarmForYear(apiKey, year, regionCode, options.timeoutMs ?? FETCH_TIMEOUT),
      options.retries ?? 0,
    );
    // 자료 없음(공표 전) — 또는 그 지역 값이 비공개('X')뿐이라 숫자 행이 0개(2025 울릉) — 일 때만 이전 해로
    if (data === KOSIS_NO_DATA || data.length === 0) continue;
    if (!expectedName) return data;
    // 코드가 이웃 지역을 가리키면(10/7: 서천 → 부여 값) 숫자를 내지 않는다 — 다른 해도 같은 코드라 더 찾지 않는다
    const mine = data.filter((d) => isSameRegionName(d.regionName, expectedName));
    if (mine.length === 0) {
      console.warn(`KOSIS 귀농 ${regionCode}: 응답 지역 '${data[0].regionName}' ≠ '${expectedName}' — 표시 안 함`);
    }
    return mine;
  }

  return [];
}

/**
 * 화면용 — 시·군·구 귀농·귀촌 카드. 실패하면 **빈 배열(카드 숨김)**이고 전년도로 내려가지 않는다.
 * 자료 없음(공표 전)일 때만 이전 해를 쓴다(그때 카드에 그 연도가 붙는다). 원천 지역명이 다르면 빈 배열.
 */
export async function fetchReturnFarmStats(
  regionCode?: string,
  expectedName?: string,
): Promise<ReturnFarmData[]> {
  if (!process.env.KOSIS_API_KEY) return [];
  try {
    // 빌드 때 KOSIS 가 몰려 시간 초과가 잦다(10/16 로컬 빌드 13곳) — 1회 재시도. 한도는 빌드 3s·런타임 5s 정책 그대로
    // (_build-phase — 늘리면 빌드 60초 한도에 걸린다). 그래도 실패하면 카드를 숨기고 다음 ISR(하루)에 다시 받는다
    return await fetchReturnFarmStatsStrict(regionCode, expectedName, { retries: 1 });
  } catch (e) {
    console.warn(`KOSIS 귀농 ${regionCode ?? "ALL"} 조회 실패 — 카드 숨김: ${e instanceof Error ? e.message : e}`);
    return [];
  }
}

/**
 * KOSIS 지역명과 우리 시·군·구 이름이 같은 곳인가 — 표기만 다른 경우('세종시' ↔ '세종특별자치시')는 같다고 본다.
 * 코드만 믿고 숫자를 보이지 않기 위한 확인이다(10/7 admCode 15건 밀림).
 */
export function isSameRegionName(kosisName: string | undefined | null, ourName: string): boolean {
  if (!kosisName) return false;
  const norm = (s: string) => s.replace(/\s+/g, "").replace(/특별자치시$/, "시");
  return norm(kosisName) === norm(ourName);
}

/**
 * 특정 연도의 시군구 귀농·귀촌 통계 — 정적 수집(scripts/collect-return-farm-rate.ts)이 최신 연도에서 비공개('X')로
 * 빠진 곳을 전년도 값으로 채울 때 쓴다. 자료 없음이면 빈 배열, **실패면 KosisFetchError**(10/16).
 */
export async function fetchReturnFarmStatsOfYear(
  year: number,
  regionCode?: string,
  options: KosisStrictOptions = {},
): Promise<ReturnFarmData[]> {
  const apiKey = process.env.KOSIS_API_KEY;
  if (!apiKey) throw new KosisFetchError("KOSIS_API_KEY 없음");
  const data = await withRetries(
    () => fetchReturnFarmForYear(apiKey, year, regionCode, options.timeoutMs ?? FETCH_TIMEOUT),
    options.retries ?? 0,
  );
  return data === KOSIS_NO_DATA ? [] : data;
}

/**
 * 한 해 조회 — 정착자 표가 자료 없음이면 KOSIS_NO_DATA, 세 표 중 하나라도 실패하거나
 * 정착자는 있는데 가구·귀촌 표가 비면 throw(반쪽 결과를 0 으로 채워 내지 않는다 — T17).
 */
async function fetchReturnFarmForYear(
  apiKey: string,
  year: number,
  regionCode: string | undefined,
  timeoutMs: number,
): Promise<ReturnFarmData[] | typeof KOSIS_NO_DATA> {
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

  const tag = `KOSIS 귀농 ${year} ${regionCode ?? "ALL"}`;
  const results = await Promise.allSettled([
    readKosisList(buildUrl(KOSIS_TABLE.RETURN_FARM_PERSON, "0"), `${tag} 귀농인`, timeoutMs),
    readKosisList(buildUrl(KOSIS_TABLE.RETURN_FARM_HOUSEHOLD, "00"), `${tag} 귀농가구`, timeoutMs),
    readKosisList(buildUrl(KOSIS_TABLE.RETURN_RURAL_PERSON, "0"), `${tag} 귀촌인`, timeoutMs),
  ]);
  const failed = results.find((r): r is PromiseRejectedResult => r.status === "rejected");
  if (failed) throw failed.reason;
  const [personItems, householdItems, ruralItems] = results.map(
    (r) => (r as PromiseFulfilledResult<KOSISReturnFarmRawItem[] | typeof KOSIS_NO_DATA>).value,
  );

  // 정착자 수가 없으면 해당 연도 데이터 없음
  if (personItems === KOSIS_NO_DATA) return KOSIS_NO_DATA;
  if (householdItems === KOSIS_NO_DATA || ruralItems === KOSIS_NO_DATA) {
    throw new KosisFetchError(`${tag}: 귀농인은 있는데 가구·귀촌 표가 비었어요`);
  }

  return mergeReturnFarmData(personItems, householdItems, ruralItems, year);
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

  // 정착자 수 (T02 = 정착자 수)
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

  // 정착 가구 수 (T01 = 가구수)
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
 * @param expectedName 우리 시·군·구 이름 — 주면 응답 지역명이 같은 행만 쓴다
 */
export async function fetchReturnFarmTrend(
  regionCode: string,
  years = 10,
  expectedName?: string,
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

    // 세 표 중 하나라도 실패하면 추이를 내지 않는다 — 예전엔 실패한 표가 0 으로 채워져 가구·귀촌이 '0'인 해가 그려졌다 (10/16, T17)
    const parseJson = async (result: PromiseSettledResult<Response>): Promise<KOSISReturnFarmRawItem[] | null> => {
      if (result.status !== "fulfilled" || !result.value.ok) return null;
      const json = await result.value.json();
      if (Array.isArray(json)) return json as KOSISReturnFarmRawItem[];
      return String((json as { err?: unknown })?.err) === "30" ? [] : null;
    };

    const parsed = await Promise.all([
      parseJson(personRes),
      parseJson(householdRes),
      parseJson(ruralRes),
    ]);
    if (parsed.some((items) => items === null)) return [];
    const raw = parsed as KOSISReturnFarmRawItem[][];
    // 응답 지역명이 우리 이름과 다른 행은 버린다 — 코드가 이웃 지역을 가리켜도 그 숫자를 그리지 않는다
    const [personItems, householdItems, ruralItems] = expectedName
      ? raw.map((items) => items.filter((i) => isSameRegionName(i.C1_NM, expectedName)))
      : raw;

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
