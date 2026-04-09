/**
 * RDA 똑똑!청년농부 Open API
 * - 지원사업(policyList) + 교육(eduList) 데이터 조회
 * - API 미승인/장애 시 null 반환 → 호출측에서 폴백 처리
 * - 24시간 캐시 (Next.js fetch revalidate)
 *
 * @see https://www.rda.go.kr/young/main/api/writeForm.do
 */

const API_BASE = "https://www.rda.go.kr/young/api";
const CACHE_TTL = 60 * 60 * 24; // 24시간

// ─── 공통 타입 ───

interface RdaBaseItem {
  seq: number;
  typeDv: string;        // "policy" | "edu"
  title: string;
  contents: string;      // HTML 가능
  applStDt: string;      // 신청시작일 (YYYY-MM-DD)
  appEdDt: string;       // 신청마감일 (YYYY-MM-DD)
  eduTarget: string;     // 지원/교육 대상
  area1Nm: string;       // 지역(도) — "전국", "전남", "경북" 등
  area2Nm: string;       // 지역(시군구) — 빈 문자열 가능
  chargeAgency: string;  // 담당기관
  chargeDept: string;    // 담당부서
  chargeTel: string;     // 담당부서 전화번호
  infoUrl: string;       // 공고 URL
}

// ─── 지원사업 ───

export interface RdaPolicyItem extends RdaBaseItem {
  typeDv: "policy";
  totQuantity: string;   // 총 수량/모집인원
  price: string;         // 지원금액
}

// ─── 교육 ───

export interface RdaEduItem extends RdaBaseItem {
  typeDv: "edu";
  eduStDt: string;       // 교육시작일
  eduEdDt: string;       // 교육마감일
  eduTime: string;       // 교육시간
  eduCnt: string;        // 교육인원(정원)
}

// ─── API 응답 래퍼 (추정 구조, 실제 응답에 맞게 조정 필요) ───

// ─── 내부 유틸 ───

function getApiKey(): string | null {
  const key = process.env.RDA_API_KEY;
  if (!key) {
    // 키 미설정 시 경고만 (승인 대기 중일 수 있음)
    if (process.env.NODE_ENV === "development") {
      console.log("[RDA] RDA_API_KEY not set — using fallback data");
    }
    return null;
  }
  return key;
}

/**
 * RDA API로부터 목록 데이터를 가져옴
 * - 응답이 배열인지 래핑 객체인지 자동 감지
 * - 실패 시 null 반환 (호출측에서 폴백 처리)
 */
async function fetchRdaList<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T[] | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const url = new URL(`${API_BASE}/${endpoint}`);
  url.searchParams.set("serviceKey", apiKey);
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

    // 응답 구조 자동 감지:
    // 1) 직접 배열
    if (Array.isArray(json)) return json as T[];
    // 2) { list: [...] } 또는 { data: [...] } 또는 { items: [...] }
    if (json.list && Array.isArray(json.list)) return json.list as T[];
    if (json.data && Array.isArray(json.data)) return json.data as T[];
    if (json.items && Array.isArray(json.items)) return json.items as T[];

    // 예상 못한 구조
    console.warn("[RDA] Unexpected response structure:", Object.keys(json));
    return null;
  } catch (err) {
    console.error(`[RDA] ${endpoint} fetch failed:`, err);
    return null;
  }
}

// ─── 지원사업 API ───

export interface FetchPoliciesOptions {
  /** 검색 카테고리 코드 (쉼표 구분) */
  category?: string;
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
 * 지원사업 목록 조회
 * @returns RdaPolicyItem[] | null (실패 시 null)
 */
export async function fetchPolicies(
  options: FetchPoliciesOptions = {}
): Promise<RdaPolicyItem[] | null> {
  const params: Record<string, string> = {};
  if (options.category) params.search_category = options.category;
  if (options.startDate) params.sd = options.startDate;
  if (options.endDate) params.ed = options.endDate;
  if (options.page) params.cp = String(options.page);
  if (options.pageSize) params.rowCnt = String(options.pageSize);

  return fetchRdaList<RdaPolicyItem>("policyList", params);
}

// ─── 교육 API ───

export interface FetchEduOptions {
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

/**
 * 교육 목록 조회
 * @returns RdaEduItem[] | null (실패 시 null)
 */
export async function fetchEducation(
  options: FetchEduOptions = {}
): Promise<RdaEduItem[] | null> {
  const params: Record<string, string> = {};
  if (options.category) params.search_category = options.category;
  if (options.startDate) params.sd = options.startDate;
  if (options.endDate) params.ed = options.endDate;
  if (options.page) params.cp = String(options.page);
  if (options.pageSize) params.rowCnt = String(options.pageSize);

  return fetchRdaList<RdaEduItem>("eduList", params);
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
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 신청기간 기반 상태 판별
 * — 실제 로직은 공용 유틸(@/lib/program-status)로 이동.
 *   기존 import 호환을 위해 re-export 유지.
 */
export { deriveStatus } from "@/lib/program-status";
