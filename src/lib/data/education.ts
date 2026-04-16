/**
 * 귀농 교육 과정 데이터
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

export interface EducationCourse {
  id: string;
  title: string;
  region: string;
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

export const EDUCATION_COURSES: EducationCourse[] = [
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
      "전원생활 준비 및 성공사례, 채소·과수·화훼 기초영농기술, 농기계 안전사용법을 배우는 서울시 공식 귀촌 준비 교육 과정입니다. 기별 40명 선착순 모집.",
    capacity: 40,
    applicationStart: "2026-02-10",
    applicationEnd: "2026-04-17",
    status: "모집중",
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
    schedule: "2026.4.21(월) ~ 4.23(수)",
    target: "서울 거주자 (주민등록상)",
    cost: "무료",
    description:
      "식물공장과 아쿠아포닉스, 디지털농업 동향 및 사례, 강남농협 현장견학, 스마트팜 원예작물 재배생리, 온실 구축 및 운영 기초가이드를 배우는 실용 교육입니다.",
    capacity: 45,
    applicationStart: "2026-04-06",
    applicationEnd: "2026-04-10",
    status: "마감",
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
      "기초반은 매주 수·목 오후 4시간씩 총 15회, 주말반은 매주 토요일 7시간씩 총 5회로 직장인도 참여할 수 있는 귀농귀촌 교육입니다. 기초반 50명, 주말반 70명 모집.",
    capacity: 120,
    applicationStart: "2026-02-02",
    applicationEnd: "2026-02-20",
    status: "마감",
    level: "입문",
    url: "https://www.gninews.co.kr/news/article.html?no=769163",
  },
  {
    id: "ED-004",
    title: "서귀포시 귀농귀촌 기본교육 (상반기)",
    region: "제주특별자치도",
    organization: "서귀포시 마을활력과 / 제주특별자치도농업기술원",
    type: "오프라인",
    duration: "16시간 (4일)",
    schedule: "2026.3.10(화) ~ 3.13(금), 오후 1~5시",
    target: "서귀포시 귀농귀촌 희망자",
    cost: "무료",
    description:
      "귀농귀촌 정책사업 안내, 귀농귀촌 성공사례 공유, 제주 농업 분야 이해를 중심으로 한 기본 교육입니다. 제주특별자치도농업기술원 미래농업육성관에서 진행됩니다.",
    capacity: 80,
    applicationStart: "2026-02-25",
    applicationEnd: "2026-02-27",
    status: "마감",
    level: "입문",
    url: "https://www.jejudomin.co.kr/news/articleView.html?idxno=317057",
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
    cost: "무료 (현장실습 훈련비 월 최대 100만원 별도 지급)",
    description:
      "스마트팜 기본역량 이론과정(1개월), 활용능력 실습과정(2개월), 현장실습교육(3개월)을 체계적으로 배우는 청년 대상 창업지원 교육입니다.",
    capacity: 30,
    applicationStart: "2025-12-29",
    applicationEnd: "2026-01-02",
    status: "마감",
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
      "귀농귀촌 아카데미, 맞춤형교육, 농산업 창업교육, 청년귀촌장기교육 등 연간 391개 과정을 운영합니다. 농업교육포털(agriedu.net) 또는 그린대로에서 신청할 수 있습니다.",
    capacity: null,
    applicationStart: "2026-01-01",
    applicationEnd: "2026-12-31",
    status: "모집중",
    level: "입문",
    url: "https://agriedu.net/",
  },
  {
    id: "ED-007",
    title: "무주군 전북에서 살아보기 (영농체험형)",
    region: "전라북도",
    organization: "무주군 / 그린대로 플랫폼",
    type: "오프라인",
    duration: "3개월 (1기) / 2개월 (2기)",
    schedule: "1기 2026.4~6월 / 2기 2026.9~11월",
    target: "전북 귀농귀촌 관심자",
    cost: "문의 필요",
    description:
      "무주군에 3개월간 체류하며 사과, 블루베리 등 지역 특화작목 영농체험을 하는 프로그램입니다. 지역 탐색, 주민 교류 등 귀농 전 농촌생활을 직접 체험할 수 있습니다.",
    capacity: null,
    applicationStart: "2026-03-01",
    applicationEnd: "2026-04-03",
    status: "마감",
    level: "입문",
    url: "https://www.mjjnews.net/news/article.html?no=55756",
  },
  {
    id: "ED-008",
    title: "영주 소백산귀농드림타운 체류형 농업창업교육",
    region: "경상북도",
    organization: "영주시 농업기술센터",
    type: "오프라인",
    duration: "수개월 (체류형)",
    schedule: "수시 접수 (제11기 운영 중)",
    target: "귀농 희망자 (영주 지역 체류 가능자)",
    cost: "입교비 소정 (확인 필요)",
    description:
      "영주 소백산 인근 귀농드림타운에서 체류하며 농업을 학습하고 현장실습을 병행하는 체류형 교육 프로그램입니다. 현재 제11기 운영 중이며 5세대 추가 모집 중입니다.",
    capacity: 5,
    applicationStart: "2026-01-01",
    applicationEnd: "2026-12-31",
    status: "모집중",
    level: "초급",
    url: "http://www.ttlnews.com/news/articleView.html?idxno=3085607",
  },
];

// --- 헬퍼 함수 ---

/** ID로 단일 교육 과정 조회 */
export function getEducationById(id: string): EducationCourse | undefined {
  return EDUCATION_COURSES.find((c) => c.id === id);
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
        const row = data as unknown as EducationRow;
        return {
          id: row.slug,
          title: row.title,
          region: row.region,
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
          status: row.status as EducationCourse["status"],
          level: row.level as EducationCourse["level"],
          url: row.url,
          linkStatus: (row.link_status ?? undefined) as EducationCourse["linkStatus"],
        };
      }
    } catch {
      // Supabase 에러 → 정적 폴백
    }
  }

  // 2️⃣ 정적 폴백
  return EDUCATION_COURSES.find((c) => c.id === id);
}

/** 현재 연월 문자열 (YYYY-MM) */
export function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** 조회 시점 옵션 생성 (2026년 1~12월) */
export function getPeriodOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const year = 2026;
  for (let m = 1; m <= 12; m++) {
    const value = `${year}-${String(m).padStart(2, "0")}`;
    options.push({ value, label: `${year}년 ${m}월` });
  }
  return options;
}

/** 필터 조건 */
export interface EducationFilters {
  region?: string;
  type?: string;
  level?: string;
  query?: string;
  /** 조회 시점 "YYYY-MM" -- 해당 월에 모집기간이 겹치는 과정만 표시 */
  period?: string;
  includeClosed?: boolean;
}

/** 필터 조건에 맞는 교육 과정 목록 반환 */
export function filterEducation(filters: EducationFilters): EducationCourse[] {
  // 조회 시점 기간 계산
  let periodStart: string | null = null;
  let periodEnd: string | null = null;
  if (filters.period && /^\d{4}-\d{2}$/.test(filters.period)) {
    const [y, m] = filters.period.split("-").map(Number);
    periodStart = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    periodEnd = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  }

  return EDUCATION_COURSES.filter((course) => {
    // 원문 링크 깨진 항목은 목록에서 숨김
    if (course.linkStatus === "broken") {
      return false;
    }

    // 마감 제외 (기본 동작: includeClosed가 true가 아니면 마감 숨김)
    if (!filters.includeClosed && course.status === "마감") {
      return false;
    }

    // 조회 시점 필터 (includeClosed가 true이면 기간 필터 스킵)
    if (!filters.includeClosed && periodStart && periodEnd) {
      if (
        course.applicationStart > periodEnd ||
        course.applicationEnd < periodStart
      ) {
        return false;
      }
    }

    // 텍스트 검색 (제목, 설명, 지역, 기관, 대상)
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const searchable = [
        course.title,
        course.description,
        course.region,
        course.organization,
        course.target,
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) {
        return false;
      }
    }

    if (filters.region && filters.region !== "전체") {
      if (course.region !== "전국" && course.region !== filters.region) {
        return false;
      }
    }

    if (filters.type && filters.type !== "전체") {
      if (course.type !== filters.type) {
        return false;
      }
    }

    if (filters.level && filters.level !== "전체") {
      if (course.level !== filters.level) {
        return false;
      }
    }

    return true;
  });
}

// ─── RDA API 연동 레이어 ───

/** RDA API 응답 → EducationCourse 변환 */
function mapRdaEdu(item: RdaEduItem): EducationCourse {
  const region = mapAreaName(item.area1Nm);
  const status = deriveStatus(item.applStDt, item.appEdDt);

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
    applicationEnd: item.appEdDt,
    status: mappedStatus,
    level: "초급",              // RDA API에 수준 필드 없음 → 기본값
    url: item.infoUrl || "",
  };
}

/**
 * RDA API에서 교육 데이터를 가져오고,
 * 실패 시 정적 샘플 데이터로 폴백
 */
export async function loadEducation(): Promise<{
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
        const rows = data as unknown as EducationRow[];
        const courses: EducationCourse[] = rows.map((row) => ({
          id: row.slug,
          title: row.title,
          region: row.region,
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
          status: row.status as EducationCourse["status"],
          level: row.level as EducationCourse["level"],
          url: row.url,
          linkStatus: (row.link_status ?? undefined) as EducationCourse["linkStatus"],
        }));
        return { courses, source: "supabase" };
      }
    } catch {
      // Supabase 에러 → 다음 소스로
    }
  }

  // 2️⃣ RDA API 시도
  const apiData = await fetchRdaEducation({ pageSize: 100 });
  if (apiData && apiData.length > 0) {
    const courses = apiData.map(mapRdaEdu);
    return { courses, source: "api" };
  }

  // 3️⃣ 정적 폴백 — 날짜 기반 상태 재계산
  const courses = EDUCATION_COURSES.map((c) => {
    const derived = deriveStatus(c.applicationStart, c.applicationEnd);
    const statusMap: Record<string, EducationCourse["status"]> = {
      "모집중": "모집중",
      "모집예정": "모집예정",
      "마감": "마감",
    };
    return { ...c, status: statusMap[derived] ?? c.status };
  });
  return { courses, source: "fallback" };
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

  const filtered = allCourses.filter((course) => {
    // 원문 링크 깨진 항목은 목록에서 숨김
    if (course.linkStatus === "broken") return false;

    if (!filters.includeClosed && course.status === "마감") return false;
    if (!filters.includeClosed && periodStart && periodEnd) {
      if (course.applicationStart > periodEnd || course.applicationEnd < periodStart) {
        return false;
      }
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const searchable = [
        course.title, course.description, course.region,
        course.organization, course.target,
      ].join(" ").toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    if (filters.region && filters.region !== "전체") {
      if (course.region !== "전국" && course.region !== filters.region) return false;
    }
    if (filters.type && filters.type !== "전체") {
      if (course.type !== filters.type) return false;
    }
    if (filters.level && filters.level !== "전체") {
      if (course.level !== filters.level) return false;
    }
    return true;
  });

  return { courses: filtered, source };
}
