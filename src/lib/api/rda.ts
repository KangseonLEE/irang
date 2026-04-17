/**
 * RDA 똑똑!청년농부 Open API
 * - 지원사업(policyList) + 교육(eduList) + 청년사례(youthList) 조회
 * - API 미승인/장애 시 null 반환 → 호출측에서 폴백 처리
 * - 24시간 캐시 (Next.js fetch revalidate)
 *
 * @see https://www.rda.go.kr/young/main/api/writeForm.do
 *
 * API 키 2개:
 *   RDA_API_KEY       — 지원사업(policyList) + 교육(eduList)
 *   RDA_YOUTH_API_KEY — 청년사례(youthList)
 *
 * 응답 구조 (JSON):
 *   policyList → { policy_list: [...], policy_paging: {...} }
 *   eduList    → { edu_list: [...], edu_paging: {...} }
 *   youthList  → { youth_list: [...], youth_paging: {...} }
 *
 * 에러코드: -1(처리오류), -2(페이지없음), -3(권한없음),
 *           -97(URL/필수값오류), -98(키유효하지않음)
 */

const API_BASE = "https://www.rda.go.kr/young/api";
const CACHE_TTL = 60 * 60 * 24; // 24시간

// ─── 공통 타입 ───

interface RdaBaseItem {
  seq: string;           // 게시글 순번 (문자열)
  typeDv: string;        // "policy" | "edu"
  title: string;
  contents: string;      // HTML 가능
  applStDt: string;      // 신청시작일 (YYYY-MM-DD)
  applEdDt: string;      // 신청마감일 (YYYY-MM-DD)
  eduTarget: string | null; // 지원/교육 대상
  area1Nm: string | null;   // 지역(도) — "전남", "경북" 등 (약칭)
  area2Nm: string | null;   // 지역(시군구)
  chargeAgency: string;  // 담당기관
  chargeDept: string;    // 담당부서
  chargeTel: string;     // 담당부서 전화번호
  infoUrl: string;       // 공고 URL
}

// ─── 지원사업 ───

export interface RdaPolicyItem extends RdaBaseItem {
  typeDv: "policy";
  totQuantity: string | null; // 총 수량/모집인원
  price: string | null;       // 지원금액
}

// ─── 교육 ───

export interface RdaEduItem extends RdaBaseItem {
  typeDv: "edu";
  eduStDt: string | null;  // 교육시작일
  eduEdDt: string | null;  // 교육마감일
  eduTime: string | null;  // 교육시간
  eduCnt: string | null;   // 교육인원(정원)
  eduMethod: string | null;  // 교육방식1
  eduMethod2: string | null; // 교육방식2
  eduMethod3: string | null; // 교육방식3
}

// ─── 청년사례 ───

export interface RdaYouthItem {
  bbsSeq: number;
  bbsId: string;
  title: string;
  contents: string | null;
  bbsInfo03: string;     // 농가명(이름)
  bbsInfo04: string;     // 품목명
  bbsInfo07: string;     // 출처
  bbsInfo08: string;     // 외부 주소
  area1Nm: string;       // 지역(광역시/도)
  area2Nm: string;       // 지역(시군구)
}

// ─── 페이징 ───

export interface RdaPaging {
  currentPage: number;
  totalCount: number;
  lastPage: number;
  pagePerRow: number;
}

// ─── 내부 유틸 ───

function getApiKey(type: "policy" | "youth" = "policy"): string | null {
  const envKey = type === "youth" ? "RDA_YOUTH_API_KEY" : "RDA_API_KEY";
  const key = process.env[envKey];
  if (!key) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[RDA] ${envKey} not set — using fallback data`);
    }
    return null;
  }
  return key;
}

/** 엔드포인트명 → 응답 내 리스트 키 */
const LIST_KEY_MAP: Record<string, string> = {
  policyList: "policy_list",
  eduList: "edu_list",
  youthList: "youth_list",
};

const PAGING_KEY_MAP: Record<string, string> = {
  policyList: "policy_paging",
  eduList: "edu_paging",
  youthList: "youth_paging",
};

/**
 * RDA API로부터 목록 데이터를 가져옴
 * - typeDv=json 필수 전달
 * - 응답 구조: { policy_list: [...] } / { edu_list: [...] } / { youth_list: [...] }
 * - 실패 시 null 반환 (호출측에서 폴백 처리)
 */
async function fetchRdaList<T>(
  endpoint: string,
  params: Record<string, string> = {},
  keyType: "policy" | "youth" = "policy",
): Promise<{ list: T[]; paging: RdaPaging } | null> {
  const apiKey = getApiKey(keyType);
  if (!apiKey) return null;

  const url = new URL(`${API_BASE}/${endpoint}`);
  url.searchParams.set("serviceKey", apiKey);
  url.searchParams.set("typeDv", "json");
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: CACHE_TTL },
    });

    if (!res.ok) {
      console.error(`[RDA] ${endpoint} HTTP ${res.status}`);
      return null;
    }

    const json = await res.json();

    // 에러 응답 감지: { code: "-97", msg: "..." } 또는 { result: { code, msg } }
    if (json.code && Number(json.code) < 0) {
      console.error(`[RDA] ${endpoint} error: code=${json.code} msg=${json.msg}`);
      return null;
    }
    if (json.result?.code && Number(json.result.code) < 0) {
      console.error(`[RDA] ${endpoint} error: code=${json.result.code} msg=${json.result.msg}`);
      return null;
    }

    // 응답 구조: { policy_list: [...], policy_paging: {...} }
    const listKey = LIST_KEY_MAP[endpoint];
    const pagingKey = PAGING_KEY_MAP[endpoint];

    const list = listKey ? json[listKey] : null;
    const paging = pagingKey ? json[pagingKey] : null;

    if (Array.isArray(list)) {
      return {
        list: list as T[],
        paging: paging ?? { currentPage: 1, totalCount: list.length, lastPage: 1, pagePerRow: list.length },
      };
    }

    console.warn("[RDA] Unexpected response structure:", Object.keys(json));
    return null;
  } catch (err) {
    console.error(`[RDA] ${endpoint} fetch failed:`, err);
    return null;
  }
}

// ─── 지원사업 API ───

export interface FetchPoliciesOptions {
  /** 제목/내용 검색 키워드 */
  keyword?: string;
  /** 지역코드 (00:전국, 11:서울, 31:경기 등) */
  areaCode?: string;
  /** 신청 시작일 (YYYY-MM-DD) */
  startDate?: string;
  /** 신청 마감일 (YYYY-MM-DD) */
  endDate?: string;
  /** 페이지 번호 */
  page?: number;
  /** 페이지당 건수 */
  pageSize?: number;
}

/**
 * 지원사업 목록 조회 (RDA_API_KEY 사용)
 * @returns { list, paging } | null (실패 시 null)
 */
export async function fetchPolicies(
  options: FetchPoliciesOptions = {}
): Promise<RdaPolicyItem[] | null> {
  const params: Record<string, string> = {};
  if (options.keyword) params.search_keyword = options.keyword;
  if (options.areaCode) params.search_area1 = options.areaCode;
  if (options.startDate) params.sd = options.startDate;
  if (options.endDate) params.ed = options.endDate;
  if (options.page) params.cp = String(options.page);
  if (options.pageSize) params.rowCnt = String(options.pageSize);

  const result = await fetchRdaList<RdaPolicyItem>("policyList", params, "policy");
  return result?.list ?? null;
}

/** 지원사업 목록 + 페이징 정보 함께 반환 */
export async function fetchPoliciesWithPaging(
  options: FetchPoliciesOptions = {}
): Promise<{ list: RdaPolicyItem[]; paging: RdaPaging } | null> {
  const params: Record<string, string> = {};
  if (options.keyword) params.search_keyword = options.keyword;
  if (options.areaCode) params.search_area1 = options.areaCode;
  if (options.startDate) params.sd = options.startDate;
  if (options.endDate) params.ed = options.endDate;
  if (options.page) params.cp = String(options.page);
  if (options.pageSize) params.rowCnt = String(options.pageSize);

  return fetchRdaList<RdaPolicyItem>("policyList", params, "policy");
}

// ─── 교육 API ───

export interface FetchEduOptions {
  keyword?: string;
  areaCode?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

/**
 * 교육 목록 조회 (RDA_API_KEY 사용)
 * @returns RdaEduItem[] | null (실패 시 null)
 */
export async function fetchEducation(
  options: FetchEduOptions = {}
): Promise<RdaEduItem[] | null> {
  const params: Record<string, string> = {};
  if (options.keyword) params.search_keyword = options.keyword;
  if (options.areaCode) params.search_area1 = options.areaCode;
  if (options.startDate) params.sd = options.startDate;
  if (options.endDate) params.ed = options.endDate;
  if (options.page) params.cp = String(options.page);
  if (options.pageSize) params.rowCnt = String(options.pageSize);

  const result = await fetchRdaList<RdaEduItem>("eduList", params, "policy");
  return result?.list ?? null;
}

// ─── 청년사례 API ───

export interface FetchYouthOptions {
  /** 제목/내용 검색 키워드 */
  keyword?: string;
  /** 분류코드: 01(청년농영상), 02(청년농소개), 03(기술우수사례), 04(극복·실패사례) */
  sCode?: string;
  /** 페이지 번호 */
  page?: number;
  /** 페이지당 건수 */
  pageSize?: number;
}

/**
 * 청년사례 목록 조회 (RDA_YOUTH_API_KEY 사용)
 * ⚠️ sCode 필수 — 미전달 시 -97 에러
 * @returns RdaYouthItem[] | null (실패 시 null)
 */
export async function fetchYouthCases(
  options: FetchYouthOptions = {}
): Promise<RdaYouthItem[] | null> {
  const params: Record<string, string> = {};
  if (options.keyword) params.search_keyword = options.keyword;
  // sCode 미전달 시 기본값 — 전체 카테고리 조회 불가하므로 01 기본
  params.sCode = options.sCode ?? "01";
  if (options.page) params.cp = String(options.page);
  if (options.pageSize) params.rowCnt = String(options.pageSize);

  const result = await fetchRdaList<RdaYouthItem>("youthList", params, "youth");
  return result?.list ?? null;
}

// ─── 데이터 매핑 유틸 ───

/**
 * RDA area1Nm → 이랑 지역명 매핑
 * RDA는 약칭("전남")을 사용하고, 이랑은 정식명("전라남도")을 사용
 */
const AREA_NAME_MAP: Record<string, string> = {
  "서울": "서울특별시",
  "경기": "경기도",
  "강원": "강원도",
  "충북": "충청북도",
  "충남": "충청남도",
  "대전": "대전광역시",
  "전북": "전라북도",
  "전남": "전라남도",
  "광주": "광주광역시",
  "경북": "경상북도",
  "경남": "경상남도",
  "대구": "대구광역시",
  "부산": "부산광역시",
  "울산": "울산광역시",
  "인천": "인천광역시",
  "세종": "세종특별자치시",
  "제주": "제주특별자치도",
  "전국": "전국",
};

/** RDA 약칭 지역명 → 이랑 정식 지역명 */
export function mapAreaName(area1Nm: string): string {
  // 이미 정식명이면 그대로 반환
  if (area1Nm.includes("도") || area1Nm.includes("시") || area1Nm === "전국") {
    return area1Nm;
  }
  return AREA_NAME_MAP[area1Nm] ?? area1Nm;
}

/**
 * HTML 태그 제거 (contents 필드 정리용)
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&middot;/g, "·")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&#\d+;/g, (m) => String.fromCharCode(Number(m.slice(2, -1))))
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 신청기간 기반 상태 판별
 * — 실제 로직은 공용 유틸(@/lib/program-status)로 이동.
 *   기존 import 호환을 위해 re-export 유지.
 */
export { deriveStatus } from "@/lib/program-status";
