/**
 * 귀농 체험·행사 데이터
 * - 2026년 실제 검증 데이터 (공식 웹사이트·언론 보도 기반)
 * - Supabase DB 연동 시 폴백으로 사용
 * - 마지막 업데이트: 2026-04-06
 */

import { getSupabase, isSupabaseConfigured, type EventRow } from "@/lib/supabase";
import { deriveEventStatus } from "@/lib/program-status";

export interface FarmEvent {
  id: string;
  title: string;
  region: string;
  organization: string;
  type: "일일체험" | "팜스테이" | "박람회" | "설명회" | "멘토링" | "축제";
  date: string;
  dateEnd: string | null;
  applicationStart?: string;
  applicationEnd?: string;
  location: string;
  cost: string;
  description: string;
  capacity: number | null;
  target: string;
  url: string;
  status: "접수중" | "접수예정" | "마감";
}

export const EVENT_TYPES = [
  "일일체험",
  "팜스테이",
  "박람회",
  "설명회",
  "멘토링",
  "축제",
] as const;

export const EVENT_REGIONS = [
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

export const EVENTS: FarmEvent[] = [
  {
    id: "evt-001",
    title: "Y-FARM EXPO 2026 귀농귀촌 지역살리기 박람회",
    region: "경기도",
    organization: "Y-FARM EXPO 운영위원회",
    type: "박람회",
    date: "2026-04-24",
    dateEnd: "2026-04-26",
    applicationStart: "2026-03-01",
    applicationEnd: "2026-04-23",
    location: "수원컨벤션센터",
    cost: "사전등록 시 무료",
    description:
      "기업·기관 전시부스, 일반인 참관등록, 비즈니스 매칭, 특별 체험(그림대회, 생막걸리 만들기) 등이 진행되는 귀농귀촌·지역살리기 전문 박람회입니다.",
    capacity: null,
    target: "귀농·귀촌 희망자, 농업 관련 기업·기관",
    url: "https://yfarmexpo.co.kr/fairDash.do",
    status: "접수중",
  },
  {
    id: "evt-002",
    title: "2026 스마트팜코리아 (Smart Farm Korea 2026)",
    region: "경상남도",
    organization: "경상남도·창원특례시",
    type: "박람회",
    date: "2026-05-27",
    dateEnd: "2026-05-29",
    applicationStart: "2026-04-01",
    applicationEnd: "2026-05-26",
    location: "창원컨벤션센터(CECO) 제1,2전시장",
    cost: "무료 (사전등록)",
    description:
      "120개사 400부스 규모의 스마트농업·귀농귀촌 박람회입니다. 스마트팜 기술 전시, 심포지엄·세미나가 진행되며 경남국제축산박람회(GILEX)가 동시 개최됩니다.",
    capacity: null,
    target: "스마트팜 도입 희망 농업인, 귀농 예정자, 농업 기업",
    url: "https://sfkorea.kr/",
    status: "접수중",
  },
  {
    id: "evt-003",
    title: "2026 충청 케이팜 (KFARM CHUNGCHEONG)",
    region: "충청북도",
    organization: "대한민국지방신문협의회",
    type: "박람회",
    date: "2026-06-18",
    dateEnd: "2026-06-20",
    applicationStart: "2026-04-01",
    applicationEnd: "2026-06-17",
    location: "청주 OSCO (오스코)",
    cost: "무료 (사전등록 ~6/17)",
    description:
      "AgTech 기획관, 도시농업관, 귀농귀촌 정보 등 농업·축산·귀농 분야 종합 박람회입니다. 바이어 및 참관객 무료 입장으로 사전등록 후 참여할 수 있습니다.",
    capacity: null,
    target: "귀농귀촌 희망자, 농업 기술 관심자",
    url: "https://kfarm.co.kr/",
    status: "접수중",
  },
  {
    id: "evt-004",
    title: "2026 수원 케이팜 (KFARM SUWON)",
    region: "경기도",
    organization: "대한민국지방신문협의회",
    type: "박람회",
    date: "2026-10-29",
    dateEnd: "2026-10-31",
    location: "수원메쎄",
    cost: "무료 (참관객)",
    description:
      "농업·축산·귀농귀촌 분야 종합 박람회로 수원메쎄에서 개최됩니다. 귀농 정보 상담, 농업 기술 전시, 지역 홍보 부스 등이 운영됩니다.",
    capacity: null,
    target: "귀농귀촌 희망자, 농업 관심 시민",
    url: "https://www.showala.com/ex/ex_detail.php?idx=3305",
    status: "접수예정",
  },
  {
    id: "evt-005",
    title: "전북에서 살아보기 — 무주군 영농체험 (1기)",
    region: "전라북도",
    organization: "무주군 / 그린대로 플랫폼",
    type: "일일체험",
    date: "2026-04-01",
    dateEnd: "2026-06-30",
    applicationStart: "2026-02-01",
    applicationEnd: "2026-03-15",
    location: "전라북도 무주군",
    cost: "문의 필요 (1551-6858)",
    description:
      "무주군에 3개월간 체류하며 사과, 블루베리 등 지역 특화작목 영농체험을 하는 프로그램입니다. 지역 탐색, 주민 교류 등 귀농 전 농촌생활을 직접 체험할 수 있습니다.",
    capacity: null,
    target: "전북 귀농귀촌 관심자",
    url: "https://www.mjjnews.net/news/article.html?no=55756",
    status: "마감",
  },
  {
    id: "evt-006",
    title: "강원에서 살아보기 — 영월군 귀농형",
    region: "강원도",
    organization: "영월군 / 요선농촌체험휴양마을",
    type: "일일체험",
    date: "2026-04-01",
    dateEnd: "2026-06-30",
    applicationStart: "2026-02-01",
    applicationEnd: "2026-03-31",
    location: "강원도 영월군 요선농촌체험휴양마을",
    cost: "체류 지원 (주거+영농실습)",
    description:
      "영월군에 3개월간 체류하며 주요 작물 재배기술을 습득하고, 영농실습과 지역 주민 교류를 통해 귀농 적응력을 키우는 프로그램입니다. 5명 선발.",
    capacity: 5,
    target: "귀농 희망자",
    url: "https://gecpo.org/552867",
    status: "마감",
  },
  {
    id: "evt-007",
    title: "서귀포시 귀농귀촌 기본교육 설명회",
    region: "제주특별자치도",
    organization: "서귀포시 마을활력과 / 제주특별자치도농업기술원",
    type: "설명회",
    date: "2026-03-10",
    dateEnd: "2026-03-13",
    applicationStart: "2026-02-10",
    applicationEnd: "2026-03-07",
    location: "제주특별자치도농업기술원 미래농업육성관 대강당",
    cost: "무료",
    description:
      "귀농귀촌 정책사업 안내, 귀농귀촌 성공사례 공유, 제주 농업 분야 이해를 중심으로 한 기본 교육 겸 설명회입니다. 80명 규모로 진행되었습니다.",
    capacity: 80,
    target: "서귀포시 귀농귀촌 희망자",
    url: "https://www.jejudomin.co.kr/news/articleView.html?idxno=317057",
    status: "마감",
  },
];

// --- 헬퍼 함수 ---

/** ID로 단일 행사 조회 — 정적 데이터만 (동기) */
export function getEventById(id: string): FarmEvent | undefined {
  const e = EVENTS.find((e) => e.id === id);
  if (!e) return undefined;
  return { ...e, status: deriveEventStatus(e.applicationStart, e.applicationEnd, e.dateEnd) };
}

/** ID(slug)로 단일 행사 조회 — Supabase → 정적 폴백 (비동기) */
export async function getEventByIdAsync(
  id: string
): Promise<FarmEvent | undefined> {
  if (isSupabaseConfigured) {
    try {
      const sb = getSupabase()!;
      const { data, error } = await sb
        .from("farm_events")
        .select("*")
        .eq("slug", id)
        .maybeSingle();

      if (!error && data) {
        const row = data as unknown as EventRow;
        const mapped: FarmEvent = {
          id: row.slug,
          title: row.title,
          region: row.region,
          organization: row.organization,
          type: row.type as FarmEvent["type"],
          date: row.date_start,
          dateEnd: row.date_end,
          applicationStart: row.application_start ?? undefined,
          applicationEnd: row.application_end ?? undefined,
          location: row.location,
          cost: row.cost,
          description: row.description,
          capacity: row.capacity,
          target: row.target,
          url: row.url,
          status: deriveEventStatus(row.application_start ?? undefined, row.application_end ?? undefined, row.date_end),
        };
        return mapped;
      }
    } catch {
      // Supabase 에러 → 정적 폴백
    }
  }

  return getEventById(id);
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
export interface EventFilters {
  region?: string;
  type?: string;
  query?: string;
  /** 조회 시점 "YYYY-MM" — 해당 월에 행사일이 겹치는 건만 표시 */
  period?: string;
  /** true이면 마감 행사도 포함 */
  includeClosed?: boolean;
}

/** 필터 조건에 맞는 행사 목록 반환 */
export function filterEvents(filters: EventFilters): FarmEvent[] {
  // 조회 시점 기간 계산
  let periodStart: string | null = null;
  let periodEnd: string | null = null;
  if (filters.period && /^\d{4}-\d{2}$/.test(filters.period)) {
    const [y, m] = filters.period.split("-").map(Number);
    periodStart = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    periodEnd = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  }

  return EVENTS.map((e) => ({
    ...e,
    status: deriveEventStatus(e.applicationStart, e.applicationEnd, e.dateEnd),
  })).filter((event) => {
    // 마감 제외 (기본 동작)
    if (!filters.includeClosed && event.status === "마감") {
      return false;
    }

    // 조회 시점 필터 — 마감 여부와 독립적으로 적용
    if (periodStart && periodEnd) {
      const eventStart = event.date;
      const eventEnd = event.dateEnd ?? event.date;
      if (eventStart > periodEnd || eventEnd < periodStart) {
        return false;
      }
    }

    // 텍스트 검색
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const searchable = [
        event.title,
        event.description,
        event.region,
        event.organization,
        event.location,
        event.type,
        event.target,
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) {
        return false;
      }
    }

    // 지역 필터
    if (filters.region && filters.region !== "전체") {
      if (event.region !== "전국" && event.region !== filters.region) {
        return false;
      }
    }

    // 행사 유형 필터
    if (filters.type && filters.type !== "전체") {
      if (event.type !== filters.type) {
        return false;
      }
    }

    return true;
  });
}

/**
 * 행사 데이터 로더 (Supabase 우선 → 정적 폴백)
 */
export async function loadEvents(): Promise<{
  events: FarmEvent[];
  source: "supabase" | "fallback";
}> {
  if (isSupabaseConfigured) {
    try {
      const sb = getSupabase()!;
      const { data, error } = await sb
        .from("farm_events")
        .select("*")
        .order("date_start", { ascending: true });

      if (!error && data && data.length > 0) {
        const rows = data as unknown as EventRow[];
        const events: FarmEvent[] = rows.map((row) => ({
          id: row.slug,
          title: row.title,
          region: row.region,
          organization: row.organization,
          type: row.type as FarmEvent["type"],
          date: row.date_start,
          dateEnd: row.date_end,
          applicationStart: row.application_start ?? undefined,
          applicationEnd: row.application_end ?? undefined,
          location: row.location,
          cost: row.cost,
          description: row.description,
          capacity: row.capacity,
          target: row.target,
          url: row.url,
          status: deriveEventStatus(row.application_start ?? undefined, row.application_end ?? undefined, row.date_end),
        }));
        return { events, source: "supabase" };
      }
    } catch {
      // Supabase 에러 → 정적 폴백
    }
  }

  const events = EVENTS.map((e) => ({
    ...e,
    status: deriveEventStatus(e.applicationStart, e.applicationEnd, e.dateEnd),
  }));
  return { events, source: "fallback" };
}

/**
 * async 버전: Supabase 우선 데이터로 필터링
 */
export async function filterEventsAsync(
  filters: EventFilters
): Promise<{ events: FarmEvent[]; source: "supabase" | "fallback" }> {
  const { events: allEvents, source } = await loadEvents();

  const filtered = allEvents.filter((event) => {
    // 마감 제외 (기본 동작)
    if (!filters.includeClosed && event.status === "마감") return false;
    // 조회 시점 필터 — 마감 여부와 독립적으로 적용
    if (filters.period && /^\d{4}-\d{2}$/.test(filters.period)) {
      const [y, m] = filters.period.split("-").map(Number);
      const periodStart = `${y}-${String(m).padStart(2, "0")}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      const periodEnd = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      const eventEnd = event.dateEnd || event.date;
      if (event.date > periodEnd || eventEnd < periodStart) return false;
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const searchable = [
        event.title, event.description, event.region,
        event.organization, event.location,
      ].join(" ").toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    if (filters.region && filters.region !== "전체") {
      if (event.region !== "전국" && event.region !== filters.region) return false;
    }
    if (filters.type && filters.type !== "전체") {
      if (event.type !== filters.type) return false;
    }
    return true;
  });

  return { events: filtered, source };
}
