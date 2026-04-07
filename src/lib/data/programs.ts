/**
 * 귀농·귀촌 지원사업 데이터
 * - RDA API(policyList) 연동 + 정적 폴백 데이터
 * - RDA_API_KEY 미설정 또는 API 실패 시 샘플 데이터로 폴백
 */

import {
  fetchPolicies,
  mapAreaName,
  stripHtml,
  deriveStatus,
  type RdaPolicyItem,
} from "@/lib/api/rda";
import { getSupabase, isSupabaseConfigured, type ProgramRow } from "@/lib/supabase";

export interface SupportProgram {
  id: string;
  title: string;
  summary: string;
  region: string;
  organization: string;
  supportType: "보조금" | "융자" | "교육" | "현물" | "컨설팅";
  supportAmount: string;
  eligibilityAgeMin: number;
  eligibilityAgeMax: number;
  eligibilityDetail: string;
  applicationStart: string;
  applicationEnd: string;
  status: "모집중" | "모집예정" | "마감";
  relatedCrops: string[];
  sourceUrl: string;
  /** 원문 링크 상태 — 헬스체크 결과 반영 */
  linkStatus?: "active" | "broken" | "unverified";
  year: number;
}

export const REGIONS = [
  "전국",
  "서울특별시",
  "경기도",
  "강원도",
  "충청북도",
  "충청남도",
  "전라북도",
  "전라남도",
  "경상북도",
  "경상남도",
  "제주특별자치도",
] as const;

export const SUPPORT_TYPES = [
  "보조금",
  "융자",
  "교육",
  "현물",
  "컨설팅",
] as const;

export const PROGRAMS: SupportProgram[] = [
  {
    id: "SP-001",
    title: "귀농 농업창업 및 주택구입 지원사업",
    summary:
      "귀농인의 농업창업자금과 농촌주택 구입자금을 저금리 융자로 지원하는 농식품부 대표 정착사업.",
    region: "전국",
    organization: "농림축산식품부 / 각 시군 농업기술센터",
    supportType: "융자",
    supportAmount: "농업창업 최대 3억원 / 주택구입 최대 7,500만원 (5년 거치 10년 상환)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "농촌지역 전입일로부터 만 6년 미경과 세대주. 영농 관련 교육 100시간 이상 이수.",
    applicationStart: "2026-01-12",
    applicationEnd: "2026-02-13",
    status: "마감",
    relatedCrops: [],
    sourceUrl: "https://www.gunsan.go.kr/farm/m2435/view/8495763",
    year: 2026,
  },
  {
    id: "SP-002",
    title: "청년농업인 영농정착지원사업 (청년창업형 후계농업경영인)",
    summary:
      "만 39세 이하 청년농업인에게 독립경영 초기 3년간 월 정착지원금을 지급하는 보조금 사업.",
    region: "전국",
    organization: "농림축산식품부",
    supportType: "보조금",
    supportAmount: "독립경영 1년차 월 110만원, 2년차 월 100만원, 3년차 월 90만원",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 39,
    eligibilityDetail:
      "만 18~39세. 총 영농경력 3년 이하. 신청 지자체 실거주 및 주민등록. 연간 약 2,000명 선발.",
    applicationStart: "2025-11-05",
    applicationEnd: "2025-12-11",
    status: "마감",
    relatedCrops: [],
    sourceUrl: "https://agro.seoul.go.kr/archives/54938",
    year: 2026,
  },
  {
    id: "SP-003",
    title: "충남 스마트팜 청년창업 교육 및 창업지원 (제8기)",
    summary:
      "충남 청년농업인 대상 6개월 스마트팜 교육과정(이론+실습+현장)으로 창업역량을 지원.",
    region: "충청남도",
    organization: "충청남도농업기술원",
    supportType: "교육",
    supportAmount: "교육 수강료 전액 지원 + 현장실습 훈련비 월 최대 100만원",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 44,
    eligibilityDetail:
      "충남도내 청년농업인 또는 충남 전입 예정자. 6개월 과정(이론+실습+현장).",
    applicationStart: "2025-12-29",
    applicationEnd: "2026-01-02",
    status: "마감",
    relatedCrops: ["딸기", "토마토", "파프리카"],
    sourceUrl: "https://youth.chungnam.go.kr/web/main/bbs/cnyouth_notice/497",
    year: 2026,
  },
  {
    id: "SP-004",
    title: "완주군 청년창업 스마트팜 패키지 지원사업",
    summary:
      "전북 완주군 청년농업인에게 스마트팜 시설 설치비를 보조금으로 지원하는 패키지 사업.",
    region: "전라북도",
    organization: "완주군농업기술센터 기술보급과",
    supportType: "보조금",
    supportAmount: "스마트팜 시설 설치비 지원 (자기부담 132백만원 이상)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 44,
    eligibilityDetail:
      "만 18~45세 미만 청년농업인. 전북 청년창업보육센터 수료(예정)자. 완주군 주민등록 이전 완료. 사업부지 확보.",
    applicationStart: "2025-09-01",
    applicationEnd: "2025-09-26",
    status: "마감",
    relatedCrops: [],
    sourceUrl: "https://www.wanjuro.org/post/3168",
    year: 2026,
  },
  {
    id: "SP-005",
    title: "함평군 귀농어귀촌 체류형 지원센터 입교 (제6기)",
    summary:
      "함평군에서 귀농 희망자에게 주거공간·공동실습농지·시설하우스를 제공하는 체류형 교육.",
    region: "전라남도",
    organization: "함평군 귀농어귀촌 체류형 지원센터",
    supportType: "현물",
    supportAmount: "주거공간 제공 + 공동실습농지·시설하우스·작업장 이용 (21세대)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "만 65세 이하. 도시지역 1년 이상 거주 후 함평군 전입 6개월 이내 또는 이주 희망 예비귀농인.",
    applicationStart: "2026-01-10",
    applicationEnd: "2026-02-10",
    status: "마감",
    relatedCrops: [],
    sourceUrl: "https://www.asiaa.co.kr/news/articleView.html?idxno=237422",
    year: 2026,
  },
  {
    id: "SP-006",
    title: "금산군 체류형 귀농교육센터 입교",
    summary:
      "금산군에서 1년간 체류하며 인삼·약초 중심 영농교육을 받을 수 있는 체류형 귀농 프로그램.",
    region: "충청남도",
    organization: "금산군귀농교육센터",
    supportType: "현물",
    supportAmount: "체류형 주택 제공 (76㎡ 2세대, 69.4㎡ 1세대, 총 3세대 선발)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "귀농 희망자. 1년간 체류하며 영농 교육 참여.",
    applicationStart: "2026-01-15",
    applicationEnd: "2026-02-10",
    status: "마감",
    relatedCrops: ["인삼", "약초"],
    sourceUrl: "http://www.daejeontoday.com/news/articleView.html?idxno=722515",
    year: 2026,
  },
  {
    id: "SP-007",
    title: "무안군 체류형 귀농인의 집",
    summary:
      "무안군에서 약 10개월간 체류 주거를 제공하며 영농 이론 및 실습 교육을 지원하는 프로그램.",
    region: "전라남도",
    organization: "무안군",
    supportType: "현물",
    supportAmount: "약 10개월간 체류 주거 제공 + 영농 이론·실습 교육",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "귀농 희망자. 10개월간 체류하며 영농 이론 및 실습 교육.",
    applicationStart: "2026-01-10",
    applicationEnd: "2026-02-06",
    status: "마감",
    relatedCrops: [],
    sourceUrl: "https://www.smartbizn.com/news/articleView.html?idxno=132387",
    year: 2026,
  },
  {
    id: "SP-008",
    title: "연천군 신규농업인 선도농가 현장실습 교육",
    summary:
      "연천군 귀농귀촌인 대상 선도농가 현장실습 교육으로 월 80만원 교육훈련비를 지급.",
    region: "경기도",
    organization: "연천군 농업기술센터",
    supportType: "교육",
    supportAmount: "연수생 월 80만원 교육훈련비 + 선도농가 월 40만원 교수수당",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "최근 5년 이내 해당 지역 농촌으로 이주한 귀농귀촌인 또는 만 40세 미만 청장년. 교육기간 2026.6~10월.",
    applicationStart: "2026-04-01",
    applicationEnd: "2026-04-17",
    status: "마감",
    relatedCrops: [],
    sourceUrl: "https://www.post24.kr/319532",
    year: 2026,
  },
  {
    id: "SP-009",
    title: "영월군 강원에서 살아보기 (귀농형)",
    summary:
      "영월군에서 3개월간 체류하며 주거·영농실습·지역교류를 체험하는 귀농형 살아보기 프로그램.",
    region: "강원도",
    organization: "영월군 / 요선농촌체험휴양마을",
    supportType: "현물",
    supportAmount: "3개월 체류 지원 (주거+영농실습+지역교류)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "귀농 희망자. 3개월간 영월군에 체류하며 주요 작물 재배기술 습득. 5명 선발.",
    applicationStart: "2026-03-01",
    applicationEnd: "2026-03-31",
    status: "마감",
    relatedCrops: [],
    sourceUrl: "https://gecpo.org/552867",
    year: 2026,
  },
  {
    id: "SP-010",
    title: "영암군 살아보기 (두 지역 살아보기 3기)",
    summary:
      "영암군에서 3개월간 체류하며 농업·관광·지역문화를 체험하는 귀농귀촌 살아보기 프로그램.",
    region: "전라남도",
    organization: "영암군 인구청년과",
    supportType: "현물",
    supportAmount: "농업·관광·지역문화 체험 + 체류비용 지원",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "귀농귀촌 관심자. 3개월간 영암군에 체류하며 농업·관광·지역문화 체험.",
    applicationStart: "2026-03-11",
    applicationEnd: "2026-03-20",
    status: "마감",
    relatedCrops: [],
    sourceUrl: "https://www.newsro.kr/article243/1142350/",
    year: 2026,
  },
  {
    id: "SP-011",
    title: "귀농닥터 멘토링 (선도농가 현장실습 교육 지원)",
    summary:
      "귀농귀촌 희망자에게 무료 1:1 현장 컨설팅과 선도농가 기술 전수를 제공하는 상시 프로그램.",
    region: "전국",
    organization: "농촌진흥청 / 각 시군 농업기술센터",
    supportType: "컨설팅",
    supportAmount: "무료 1:1 현장 컨설팅 + 선도농가 기술 전수",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "귀농귀촌 희망자 및 농촌 거주 1년 미만. 각 지역 농업기술센터 또는 그린대로에서 신청.",
    applicationStart: "2026-01-01",
    applicationEnd: "2026-12-31",
    status: "모집중",
    relatedCrops: [],
    sourceUrl: "https://www.rda.go.kr/young/content/content76.do",
    year: 2026,
  },
];

// --- 헬퍼 함수 ---

/** ID(slug)로 단일 프로그램 조회 — 정적 데이터만 (동기) */
export function getProgramById(id: string): SupportProgram | undefined {
  return PROGRAMS.find((p) => p.id === id);
}

/** ID(slug)로 단일 프로그램 조회 — Supabase → 정적 폴백 (비동기) */
export async function getProgramByIdAsync(
  id: string
): Promise<SupportProgram | undefined> {
  // 1️⃣ Supabase 시도
  if (isSupabaseConfigured) {
    try {
      const sb = getSupabase()!;
      const { data, error } = await sb
        .from("support_programs")
        .select("*")
        .eq("slug", id)
        .maybeSingle();

      if (!error && data) {
        const row = data as unknown as ProgramRow;
        return {
          id: row.slug,
          title: row.title,
          summary: row.summary,
          region: row.region,
          organization: row.organization,
          supportType: row.support_type as SupportProgram["supportType"],
          supportAmount: row.support_amount,
          eligibilityAgeMin: row.eligibility_age_min,
          eligibilityAgeMax: row.eligibility_age_max,
          eligibilityDetail: row.eligibility_detail,
          applicationStart: row.application_start,
          applicationEnd: row.application_end,
          status: row.status as SupportProgram["status"],
          relatedCrops: row.related_crops ?? [],
          sourceUrl: row.source_url,
          linkStatus: (row.link_status ?? undefined) as SupportProgram["linkStatus"],
          year: row.year,
        };
      }
    } catch {
      // Supabase 에러 → 정적 폴백
    }
  }

  // 2️⃣ 정적 폴백
  return PROGRAMS.find((p) => p.id === id);
}

/** 조회 시점 옵션 생성 (프로그램 데이터의 연도 범위 기반) */
export function getPeriodOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  // 2026년 1~12월 (데이터가 모두 2026년이므로)
  const year = 2026;
  for (let m = 1; m <= 12; m++) {
    const value = `${year}-${String(m).padStart(2, "0")}`;
    options.push({ value, label: `${year}년 ${m}월` });
  }
  return options;
}

/** 현재 연월 문자열 (YYYY-MM) */
export function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** 연령대 필터 옵션 (19세~79세, 10살 간격) */
export const AGE_RANGES = [
  "19~29세",
  "30~39세",
  "40~49세",
  "50~59세",
  "60~69세",
  "70~79세",
] as const;

/** "19~29세" → { min: 19, max: 29 } */
function parseAgeRange(range: string): { min: number; max: number } | null {
  const match = range.match(/(\d+)~(\d+)/);
  if (!match) return null;
  return { min: Number(match[1]), max: Number(match[2]) };
}

/** 필터 조건에 맞는 프로그램 목록 반환 */
export interface ProgramFilters {
  region?: string;
  age?: string;
  supportType?: string;
  status?: string;
  query?: string;
  includeClosed?: boolean;
  /** 조회 시점 "YYYY-MM" — 해당 월에 모집기간이 겹치는 사업만 표시 */
  period?: string;
}

/** 필터만 적용 (전체 반환) */
export function filterPrograms(filters: ProgramFilters): SupportProgram[] {
  // 조회 시점 기간 계산
  let periodStart: string | null = null;
  let periodEnd: string | null = null;
  if (filters.period && /^\d{4}-\d{2}$/.test(filters.period)) {
    const [y, m] = filters.period.split("-").map(Number);
    periodStart = `${y}-${String(m).padStart(2, "0")}-01`;
    // 해당 월의 마지막 날
    const lastDay = new Date(y, m, 0).getDate();
    periodEnd = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  }

  return PROGRAMS.filter((program) => {
    // 원문 링크 깨진 항목은 목록에서 숨김
    if (program.linkStatus === "broken") {
      return false;
    }

    // 조회 시점 필터: 모집기간과 선택 월이 겹치는지 확인
    if (periodStart && periodEnd) {
      // 모집기간과 조회 월이 겹치려면:
      // program.applicationStart <= periodEnd AND program.applicationEnd >= periodStart
      if (
        program.applicationStart > periodEnd ||
        program.applicationEnd < periodStart
      ) {
        return false;
      }
    }

    // 마감 제외 (기본 동작: includeClosed가 true가 아니면 마감 숨김)
    // 단, 조회 시점이 설정된 경우 마감 여부 대신 기간으로 판단하므로 마감 필터는 유지
    if (!filters.includeClosed && program.status === "마감") {
      return false;
    }

    // 텍스트 검색 (제목, 요약, 지역, 기관, 관련 작물)
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const searchable = [
        program.title,
        program.summary,
        program.region,
        program.organization,
        ...program.relatedCrops,
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) {
        return false;
      }
    }

    if (filters.region && filters.region !== "전체") {
      if (program.region !== "전국" && program.region !== filters.region) {
        return false;
      }
    }

    if (filters.age) {
      const range = parseAgeRange(filters.age);
      if (range && (range.min > program.eligibilityAgeMax || range.max < program.eligibilityAgeMin)) {
        return false;
      }
    }

    if (filters.supportType && filters.supportType !== "전체") {
      if (program.supportType !== filters.supportType) {
        return false;
      }
    }

    if (filters.status && filters.status !== "전체") {
      if (program.status !== filters.status) {
        return false;
      }
    }

    return true;
  });
}

/** 페이지 크기 (3열 × 2행) */
export const PAGE_SIZE = 6;

export interface PaginatedResult {
  programs: SupportProgram[];
  total: number;
  hasMore: boolean;
}

/** 필터 + 페이지네이션 (offset 기반) */
export function filterProgramsPaginated(
  filters: ProgramFilters,
  offset: number = 0,
  limit: number = PAGE_SIZE
): PaginatedResult {
  const all = filterPrograms(filters);
  const programs = all.slice(offset, offset + limit);
  return {
    programs,
    total: all.length,
    hasMore: offset + limit < all.length,
  };
}

// ─── RDA API 연동 레이어 ───

/** RDA API 응답 → SupportProgram 변환 */
function mapRdaPolicy(item: RdaPolicyItem): SupportProgram {
  const region = mapAreaName(item.area1Nm);
  const status = deriveStatus(item.applStDt, item.appEdDt);

  return {
    id: `rda-${item.seq}`,
    title: item.title,
    summary: stripHtml(item.contents).slice(0, 200),
    region,
    organization: item.chargeAgency || item.chargeDept || "농촌진흥청",
    supportType: "보조금",  // RDA API에 유형 필드 없음 → 기본값
    supportAmount: item.price || "상세 공고 참조",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail: item.eduTarget || "공고문 참조",
    applicationStart: item.applStDt,
    applicationEnd: item.appEdDt,
    status,
    relatedCrops: [],
    sourceUrl: item.infoUrl || "",
    year: new Date().getFullYear(),
  };
}

/**
 * RDA API에서 지원사업 데이터를 가져오고,
 * 실패 시 정적 샘플 데이터로 폴백
 *
 * @returns { programs, source } — source는 "api" 또는 "fallback"
 */
export async function loadPrograms(): Promise<{
  programs: SupportProgram[];
  source: "supabase" | "api" | "fallback";
}> {
  // 1️⃣ Supabase 시도
  if (isSupabaseConfigured) {
    try {
      const sb = getSupabase()!;
      const { data, error } = await sb
        .from("support_programs")
        .select("*")
        .order("application_end", { ascending: true });

      if (!error && data && data.length > 0) {
        const rows = data as unknown as ProgramRow[];
        const programs: SupportProgram[] = rows.map((row) => ({
          id: row.slug,
          title: row.title,
          summary: row.summary,
          region: row.region,
          organization: row.organization,
          supportType: row.support_type as SupportProgram["supportType"],
          supportAmount: row.support_amount,
          eligibilityAgeMin: row.eligibility_age_min,
          eligibilityAgeMax: row.eligibility_age_max,
          eligibilityDetail: row.eligibility_detail,
          applicationStart: row.application_start,
          applicationEnd: row.application_end,
          status: row.status as SupportProgram["status"],
          relatedCrops: row.related_crops ?? [],
          sourceUrl: row.source_url,
          linkStatus: (row.link_status ?? undefined) as SupportProgram["linkStatus"],
          year: row.year,
        }));
        return { programs, source: "supabase" };
      }
    } catch {
      // Supabase 에러 → 다음 소스로
    }
  }

  // 2️⃣ RDA API 시도
  const apiData = await fetchPolicies({ pageSize: 100 });
  if (apiData && apiData.length > 0) {
    const programs = apiData.map(mapRdaPolicy);
    return { programs, source: "api" };
  }

  // 3️⃣ 정적 폴백
  return { programs: PROGRAMS, source: "fallback" };
}

/**
 * async 버전: API 데이터로 필터링
 * - 서버 컴포넌트에서 사용
 */
export async function filterProgramsAsync(
  filters: ProgramFilters
): Promise<{ programs: SupportProgram[]; source: "supabase" | "api" | "fallback" }> {
  const { programs: allPrograms, source } = await loadPrograms();

  // 조회 시점 기간 계산
  let periodStart: string | null = null;
  let periodEnd: string | null = null;
  if (filters.period && /^\d{4}-\d{2}$/.test(filters.period)) {
    const [y, m] = filters.period.split("-").map(Number);
    periodStart = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    periodEnd = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  }

  const filtered = allPrograms.filter((program) => {
    // 원문 링크 깨진 항목은 목록에서 숨김
    if (program.linkStatus === "broken") return false;

    if (periodStart && periodEnd) {
      if (
        program.applicationStart > periodEnd ||
        program.applicationEnd < periodStart
      ) {
        return false;
      }
    }
    if (!filters.includeClosed && program.status === "마감") return false;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const searchable = [
        program.title,
        program.summary,
        program.region,
        program.organization,
        ...program.relatedCrops,
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    if (filters.region && filters.region !== "전체") {
      if (program.region !== "전국" && program.region !== filters.region) return false;
    }
    if (filters.age) {
      const range = parseAgeRange(filters.age);
      if (range && (range.min > program.eligibilityAgeMax || range.max < program.eligibilityAgeMin)) return false;
    }
    if (filters.supportType && filters.supportType !== "전체") {
      if (program.supportType !== filters.supportType) return false;
    }
    if (filters.status && filters.status !== "전체") {
      if (program.status !== filters.status) return false;
    }
    return true;
  });

  return { programs: filtered, source };
}
