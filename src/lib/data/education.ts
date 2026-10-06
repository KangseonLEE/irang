/**
 * 정착 교육 과정 데이터
 * - RDA API(eduList) 연동 + 정적 폴백 데이터
 * - RDA_API_KEY 미설정 또는 API 실패 시 샘플 데이터로 폴백
 */

import {
  fetchEducation as fetchRdaEducation,
  mapAreaName,
  stripHtml,
  type RdaEduItem,
} from "@/lib/api/rda";
import { deriveStatus } from "@/lib/program-status";
import { getSupabase, isSupabaseConfigured, type EducationRow } from "@/lib/supabase";
import { groupCrawlRows, type CrawlGroupInfo } from "@/lib/crawl-grouping";
import { isCrawledRow } from "@/lib/programs/display";
import { matchesListQuery, parseFilterValues } from "@/lib/search-params/filter-match";

export interface EducationCourse {
  id: string;
  title: string;
  region: string;
  /** 시·군·구 (수집 원문 기준). region은 시·도 SSOT라 시·군 단위는 여기에 남는다. */
  sigungu?: string;
  organization: string;
  type: "온라인" | "오프라인" | "혼합";
  duration: string;
  schedule: string;
  target: string;
  cost: string;
  description: string;
  capacity: number | null;
  applicationStart: string;
  applicationEnd: string;
  status: "모집중" | "모집예정" | "마감";
  level: "입문" | "초급" | "중급" | "심화";
  url: string;
  /** 원문 링크 상태 — 헬스체크 결과 반영 */
  linkStatus?: "active" | "broken" | "unverified";
  /** 크롤 row 동일 모사업 그룹핑 결과 — 대표 카드에만 부착 (crawl-grouping.ts) */
  crawlGroup?: CrawlGroupInfo;
}

export const EDUCATION_REGIONS = [
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

export const EDUCATION_TYPES = ["온라인", "오프라인", "혼합"] as const;

export const EDUCATION_LEVELS = ["입문", "초급", "중급", "심화"] as const;

/**
 * 정적 큐레이션 원본 — status 칸이 없다. 손으로 적은 상태는 시간이 지나면 낡는다(10/6 QA: ED-001 이 4/17 마감 뒤에도
 * "모집중"). 상태는 신청 기간에서 파생해 `EDUCATION_COURSES` 로 내보낸다 — 지원사업 `PROGRAMS_RAW` 와 같은 방식.
 */
const EDUCATION_COURSES_RAW: Omit<EducationCourse, "status">[] = [
  {
    id: "ED-001",
    title: "서울시 전원생활교육 (귀촌 준비 기초)",
    region: "서울특별시",
    organization: "서울시 농업기술센터",
    type: "오프라인",
    duration: "30시간 (5일)",
    schedule:
      "1기 3.23~27 / 2기 4.6~10 / 3기 4.20~24 (각 5일, 6시간/일)",
    target: "서울시민 (5년 이내 수강자 제외)",
    cost: "무료",
    description:
      "전원생활 준비 및 성공사례, 채소·과수·화훼 기초영농기술, 농기계 안전사용법을 배우는 서울시 공식 귀촌 준비 교육 과정이에요. 기별 40명 선착순 모집.",
    capacity: 40,
    applicationStart: "2026-02-10",
    applicationEnd: "2026-04-16",
    level: "입문",
    url: "https://agro.seoul.go.kr/archives/55475",
  },
  {
    id: "ED-002",
    title: "서울시 스마트팜 실용교육",
    region: "서울특별시",
    organization: "서울시 농업기술센터",
    type: "오프라인",
    duration: "14시간 (3일)",
    schedule: "2026.4.21(화) ~ 4.23(목)",
    target: "서울 거주자 (주민등록상)",
    cost: "무료",
    description:
      "식물공장과 아쿠아포닉스, 디지털농업 동향 및 사례, 강남농협 현장견학, 스마트팜 원예작물 재배생리, 온실 구축 및 운영 기초가이드를 배우는 실용 교육이에요.",
    capacity: 45,
    applicationStart: "2026-04-06",
    applicationEnd: "2026-04-10",
    level: "초급",
    url: "https://agro.seoul.go.kr/archives/55870",
  },
  {
    id: "ED-003",
    title: "화성특례시 귀농귀촌 교육 (기초반+주말반)",
    region: "경기도",
    organization: "화성시농업기술센터 기술기획과",
    type: "오프라인",
    duration: "기초반 60시간(15회) / 주말반 35시간(5회)",
    schedule: "기초반 3~4월(수·목) / 주말반 5~6월(토)",
    target: "화성시 귀농귀촌 희망 시민 및 직장인",
    cost: "무료",
    description:
      "기초반은 매주 수·목 오후 4시간씩 총 15회, 주말반은 매주 토요일 7시간씩 총 5회로 직장인도 참여할 수 있는 귀농귀촌 교육이에요. 기초반 50명, 주말반 70명 모집.",
    capacity: 120,
    applicationStart: "2026-02-02",
    applicationEnd: "2026-02-20",
    level: "입문",
    url: "https://www.gninews.co.kr/news/article.html?no=769163",
  },
  {
    id: "ED-004",
    title: "서귀포시 귀농귀촌 기본교육 (하반기)",
    region: "제주특별자치도",
    organization: "서귀포시 마을활력과 / 제주특별자치도농업기술원",
    type: "오프라인",
    duration: "16시간 (4일)",
    schedule: "2026.8.11(화) ~ 8.14(금), 오후 1~5시",
    target: "서귀포시 귀농귀촌 희망자",
    cost: "무료",
    description:
      "귀농귀촌 정책사업, 농업경영체 제도의 이해 등을 다루는 기본 교육이에요. 제주특별자치도농업기술원 미래농업육성관 대강당에서 진행돼요. 상·하반기 두 차례 열리고, 접수는 이메일 신청서 제출 후 선착순이에요.",
    capacity: 80,
    applicationStart: "2026-07-30",
    applicationEnd: "2026-08-03",
    level: "입문",
    url: "https://www.seogwipo.go.kr/group/selfgoverning/town/farming/education.htm?act=view&seq=154700410",
  },
  {
    id: "ED-005",
    title: "충남 스마트팜 청년창업 교육 (제8기)",
    region: "충청남도",
    organization: "충청남도농업기술원",
    type: "혼합",
    duration: "6개월 (이론1개월+실습2개월+현장3개월)",
    schedule: "2026.2.2. ~ 2026.11.30.",
    target: "충남도내 청년농업인 또는 충남 전입 예정자 (만 18~44세)",
    cost: "무료 (현장실습 훈련비 월 최대 100만 원 별도 지급)",
    description:
      "스마트팜 기본역량 이론과정(1개월), 활용능력 실습과정(2개월), 현장실습교육(3개월)을 체계적으로 배우는 청년 대상 창업지원 교육이에요.",
    capacity: 30,
    applicationStart: "2025-12-29",
    applicationEnd: "2026-01-02",
    level: "중급",
    url: "https://youth.chungnam.go.kr/web/main/bbs/cnyouth_notice/497",
  },
  {
    id: "ED-006",
    title: "농촌진흥청 농촌인적자원개발센터 교육 (연간 391개 과정)",
    region: "전국",
    organization: "농촌진흥청 농촌인적자원개발센터",
    type: "혼합",
    duration: "과정별 상이 (연간 391개 과정)",
    schedule: "상시 운영",
    target: "귀농귀촌 희망자 및 농업인 누구나",
    cost: "국비 70~90% 지원 (개인 부담 최소)",
    description:
      "귀농귀촌 아카데미, 맞춤형교육, 농산업 창업교육, 청년귀촌장기교육 등 연간 391개 과정을 운영해요. 농업교육포털(agriedu.net) 또는 그린대로에서 신청할 수 있어요.",
    capacity: null,
    applicationStart: "2026-01-01",
    applicationEnd: "2026-12-31",
    level: "입문",
    url: "https://agriedu.net/",
  },
  {
    id: "ED-008",
    title: "영주 소백산귀농드림타운 체류형 농업창업교육",
    region: "경상북도",
    organization: "영주시 농업기술센터",
    type: "오프라인",
    duration: "수개월 (체류형)",
    schedule: "수시 접수 (제11기 운영 중)",
    target: "농촌 정착 희망자 (영주 지역 체류 가능자)",
    cost: "입교비 소정 (확인 필요)",
    description:
      "영주 소백산 인근 귀농드림타운에서 체류하며 농업을 학습하고 현장실습을 병행하는 체류형 교육 프로그램이에요. 2026년 3월 제11기 입교식 때 정원 30세대 중 25세대가 입교했고, 남은 5세대는 정원이 찰 때까지 수시로 신청을 받았어요.",
    capacity: 5,
    applicationStart: "2026-01-01",
    applicationEnd: "2026-12-31",
    level: "초급",
    url: "http://www.ttlnews.com/news/articleView.html?idxno=3085607",
  },
];

/** 신청 기간 → 모집 상태 (지원사업과 같은 규칙 — KST 오늘 기준) */
function deriveEducationStatus(c: Pick<EducationCourse, "applicationStart" | "applicationEnd">): EducationCourse["status"] {
  return deriveStatus(c.applicationStart, c.applicationEnd);
}

/** 정적 데이터에 파생 status를 주입한 배열 — 외부에서 쓰는 공식 export */
export const EDUCATION_COURSES: EducationCourse[] = EDUCATION_COURSES_RAW.map((c) => ({
  ...c,
  status: deriveEducationStatus(c),
}));

// --- 헬퍼 함수 ---

/** ID로 단일 교육 과정 조회 — 정적 데이터만 (동기, 부르는 날 기준 상태) */
export function getEducationById(id: string): EducationCourse | undefined {
  const c = EDUCATION_COURSES_RAW.find((c) => c.id === id);
  return c ? { ...c, status: deriveEducationStatus(c) } : undefined;
}

/**
 * DB 행 → EducationCourse. 목록(`loadEducation`)·상세(`getEducationByIdAsync`) 공용.
 * status 는 DB 칸이 아니라 신청 기간에서 파생한다 — 10/6 전에는 교육만 DB status 칸을 그대로 써서 수집기가 적재한 날의
 * 상태(접수중)가 마감 뒤에도 남았다(QA Q1-W19). 지원사업·체험과 같은 규칙.
 */
function mapEducationRow(row: EducationRow): EducationCourse {
  return {
    id: row.slug,
    title: row.title,
    region: row.region,
    sigungu: row.sigungu ?? undefined,
    organization: row.organization,
    type: row.type as EducationCourse["type"],
    duration: row.duration,
    schedule: row.schedule,
    target: row.target,
    cost: row.cost,
    description: row.description,
    capacity: row.capacity,
    applicationStart: row.application_start,
    applicationEnd: row.application_end,
    status: deriveStatus(row.application_start, row.application_end),
    level: row.level as EducationCourse["level"],
    url: row.url,
    linkStatus: (row.link_status ?? undefined) as EducationCourse["linkStatus"],
  };
}

/** 상위 소스(DB·API) 결과에 그 소스에 없는 정적 행을 붙인다 — CLAUDE.md "데이터 소스 병합 원칙" (QA Q1-W3: ED-003~005 미노출) */
function withStaticOnly(primary: EducationCourse[]): EducationCourse[] {
  const primaryIds = new Set(primary.map((c) => c.id));
  const staticOnly = EDUCATION_COURSES_RAW.filter((c) => !primaryIds.has(c.id)).map((c) => ({
    ...c,
    status: deriveEducationStatus(c),
  }));
  return [...primary, ...staticOnly];
}

/**
 * 수집기 기본값 — 원문이 아니라 수집기·API 매핑이 일괄로 채운 칸(10/6 DB):
 * - 수준(level): 수집 행 전부 "초급"(242/242) · RDA API 폴백 행(rda-edu-*)도 "초급"
 * - 방식(type): 원천이 방식을 주지 않는 수집 행(RDA 95/95)·RDA API 폴백 행은 "오프라인".
 *   그린대로 수집 행만 원문(대면·비대면)에서 방식을 정한다(supabase/functions/_shared/greendaero.ts resolveEducationType).
 * 필터에선 '모름'으로 다룬다 — 그 그룹을 고르면 빠지고, 고르지 않은 전체 보기에는 나온다(QA Q1-W4·Q4-W4).
 * 화면 표시 쪽 같은 규칙은 lib/programs/display.ts(displayEducationLevel·displayEducationType).
 */
const TYPE_FROM_SOURCE_PREFIXES = ["crawl-greendaero-"];

function isLevelUnknown(id: string): boolean {
  return isCrawledRow(id) || id.startsWith("rda-edu-");
}

function isTypeUnknown(id: string): boolean {
  if (id.startsWith("rda-edu-")) return true;
  return isCrawledRow(id) && !TYPE_FROM_SOURCE_PREFIXES.some((prefix) => id.startsWith(prefix));
}

/** ID(slug)로 단일 교육과정 조회 — Supabase → 정적 폴백 (비동기) */
export async function getEducationByIdAsync(
  id: string
): Promise<EducationCourse | undefined> {
  // 1️⃣ Supabase 시도
  if (isSupabaseConfigured) {
    try {
      const sb = getSupabase()!;
      const { data, error } = await sb
        .from("education_courses")
        .select("*")
        .eq("slug", id)
        .maybeSingle();

      if (!error && data) {
        return mapEducationRow(data as unknown as EducationRow);
      }
    } catch {
      // Supabase 에러 → 정적 폴백
    }
  }

  // 2️⃣ 정적 폴백
  return getEducationById(id);
}

/** 현재 연월 문자열 (YYYY-MM) */
export function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}


/** 필터 조건 — region·type·level 은 URL 그대로의 쉼표 목록(CSV, 복수 선택)도 받는다. 그룹 안은 합집합, 그룹 사이는 교집합 */
export interface EducationFilters {
  region?: string;
  type?: string;
  level?: string;
  query?: string;
  /** 조회 시점 "YYYY-MM" -- 해당 월에 모집기간이 겹치는 과정만 표시 */
  period?: string;
  includeClosed?: boolean;
}


// ─── RDA API 연동 레이어 ───

/** RDA API 응답 → EducationCourse 변환 */
function mapRdaEdu(item: RdaEduItem): EducationCourse {
  const region = mapAreaName(item.area1Nm ?? "전국");
  const status = deriveStatus(item.applStDt, item.applEdDt);

  // 교육 상태: 교육 신청기간 기준 (applStDt/appEdDt)
  let mappedStatus: EducationCourse["status"];
  if (status === "모집중") mappedStatus = "모집중";
  else if (status === "모집예정") mappedStatus = "모집예정";
  else mappedStatus = "마감";

  return {
    id: `rda-edu-${item.seq}`,
    title: item.title,
    region,
    organization: item.chargeAgency || item.chargeDept || "농촌진흥청",
    type: "오프라인",           // RDA API에 유형 필드 없음 → 기본값
    duration: item.eduTime || "상세 공고 참조",
    schedule: item.eduStDt && item.eduEdDt
      ? `${item.eduStDt} ~ ${item.eduEdDt}`
      : "상세 공고 참조",
    target: item.eduTarget || "공고문 참조",
    cost: "상세 공고 참조",
    description: stripHtml(item.contents).slice(0, 300),
    capacity: item.eduCnt ? parseInt(item.eduCnt, 10) || null : null,
    applicationStart: item.applStDt,
    applicationEnd: item.applEdDt,
    status: mappedStatus,
    level: "초급",              // RDA API에 수준 필드 없음 → 기본값
    url: item.infoUrl || "",
  };
}

/**
 * RDA API에서 교육 데이터를 가져오고,
 * 실패 시 정적 샘플 데이터로 폴백
 */
async function loadEducation(): Promise<{
  courses: EducationCourse[];
  source: "supabase" | "api" | "fallback";
}> {
  // 1️⃣ Supabase 시도
  if (isSupabaseConfigured) {
    try {
      const sb = getSupabase()!;
      const { data, error } = await sb
        .from("education_courses")
        .select("*")
        .order("application_end", { ascending: true });

      if (!error && data && data.length > 0) {
        const dbCourses = (data as unknown as EducationRow[]).map(mapEducationRow);
        // 정적 데이터 중 DB에 없는 과정 병합 (10/6 전엔 없어서 ED-003~005 가 운영 목록에 0회 노출)
        return { courses: withStaticOnly(dbCourses), source: "supabase" };
      }
    } catch {
      // Supabase 에러 → 다음 소스로
    }
  }

  // 2️⃣ RDA API 시도 — 정적 큐레이션 과정도 붙인다
  const apiData = await fetchRdaEducation({ pageSize: 100 });
  if (apiData && apiData.length > 0) {
    return { courses: withStaticOnly(apiData.map(mapRdaEdu)), source: "api" };
  }

  // 3️⃣ 정적 폴백 — 부르는 날 기준 상태
  return { courses: withStaticOnly([]), source: "fallback" };
}

/**
 * async 버전: API 데이터로 필터링
 * - 서버 컴포넌트에서 사용
 */
export async function filterEducationAsync(
  filters: EducationFilters
): Promise<{ courses: EducationCourse[]; source: "supabase" | "api" | "fallback" }> {
  const { courses: allCourses, source } = await loadEducation();

  let periodStart: string | null = null;
  let periodEnd: string | null = null;
  if (filters.period && /^\d{4}-\d{2}$/.test(filters.period)) {
    const [y, m] = filters.period.split("-").map(Number);
    periodStart = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    periodEnd = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  }

  // 복수 선택(CSV) — 그룹 안은 합집합, 그룹 사이는 교집합 (10/6 QA Q4-F1)
  const regions = parseFilterValues(filters.region);
  const types = parseFilterValues(filters.type);
  const levels = parseFilterValues(filters.level);

  const filtered = allCourses.filter((course) => {
    // 원문 링크 깨진 항목은 목록에서 숨김
    if (course.linkStatus === "broken") return false;

    if (!filters.includeClosed && course.status === "마감") return false;
    if (!filters.includeClosed && periodStart && periodEnd) {
      if (course.applicationStart > periodEnd || course.applicationEnd < periodStart) {
        return false;
      }
    }
    // 검색어 — 1글자(작물 이름만 normalize 통과)는 낱말 단위, 2글자 이상은 부분 일치 (filter-match.ts)
    if (
      !matchesListQuery(filters.query, [
        course.title, course.description, course.region,
        course.organization, course.target,
      ])
    ) {
      return false;
    }
    // 지역 — 전국 과정은 어느 지역을 골라도 남는다
    if (regions.length > 0 && course.region !== "전국" && !regions.includes(course.region)) return false;
    // 방식·수준 — 수집기 기본값은 '모름'(빠짐)
    if (types.length > 0 && (isTypeUnknown(course.id) || !types.includes(course.type))) return false;
    if (levels.length > 0 && (isLevelUnknown(course.id) || !levels.includes(course.level))) return false;
    return true;
  });

  // 크롤 row 동일 모사업 그룹핑 (대표 1건 + "외 N개 지역"). 정적·API row는 통과.
  return { courses: groupCrawlRows(filtered), source };
}

// ─── 정렬 (5/25 회장 결재 — programs와 동일 패턴) ─────────────────────────────

/**
 * 정렬 키:
 *  deadline: status='마감'은 뒤로 + applicationEnd asc. 9999-12-31(미정) 가장 뒤.
 *  recent:   id desc (createdAt 부재). 후순위 i 안정 정렬.
 */
export type EducationSortKey = "deadline" | "recent";

export const EDUCATION_SORT_OPTIONS: readonly {
  value: EducationSortKey;
  label: string;
}[] = [
  { value: "deadline", label: "마감 임박순" },
  { value: "recent", label: "최근 등록순" },
];

export const DEFAULT_EDUCATION_SORT: EducationSortKey = "deadline";

export function sortEducation(
  courses: EducationCourse[],
  sort: EducationSortKey,
): EducationCourse[] {
  if (sort === "recent") {
    const indexed = courses.map((c, i) => ({ c, i }));
    indexed.sort((a, b) => {
      // createdAt 부재 — id desc fallback (ED-XXX 큰 번호가 최근 추가)
      const aid = a.c.id ?? "";
      const bid = b.c.id ?? "";
      if (aid === bid) return a.i - b.i;
      return bid.localeCompare(aid);
    });
    return indexed.map((x) => x.c);
  }
  // deadline (default)
  const indexed = courses.map((c, i) => ({ c, i }));
  indexed.sort((a, b) => {
    const aClosed = a.c.status === "마감" ? 1 : 0;
    const bClosed = b.c.status === "마감" ? 1 : 0;
    if (aClosed !== bClosed) return aClosed - bClosed;
    const ae = a.c.applicationEnd || "9999-12-31";
    const be = b.c.applicationEnd || "9999-12-31";
    if (ae === be) return a.i - b.i;
    return ae.localeCompare(be);
  });
  return indexed.map((x) => x.c);
}
