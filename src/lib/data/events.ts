/**
 * 농촌 정착 체험·행사 데이터
 * - 2026년 실제 검증 데이터 (공식 웹사이트·언론 보도 기반)
 * - Supabase DB 연동 시 폴백으로 사용
 * - 마지막 업데이트: 2026-04-06
 */

import { getSupabase, isSupabaseConfigured, type EventRow } from "@/lib/supabase";
import { kstToday, deriveEventStatus } from "@/lib/program-status";
import { isCrawledRow } from "@/lib/programs/display";
import { matchesListQuery, parseFilterValues } from "@/lib/search-params/filter-match";

export interface FarmEvent {
  id: string;
  title: string;
  region: string;
  /** 시·군·구 (수집 원문 기준). region은 시·도 SSOT라 시·군 단위는 여기에 남는다. */
  sigungu?: string;
  organization: string;
  type: "살아보기" | "일일체험" | "팜스테이" | "박람회" | "설명회" | "멘토링" | "축제";
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
  /** 마을 대표 사진 원본 URL (그린대로) — next/image 로만 소비. 없으면 시·도 배경 폴백 */
  imageUrl?: string;
  /** 입주 가능일 (살아보기) */
  moveInDate?: string;
  /** 모집 가구 수 (capacity 는 인원) */
  households?: number | null;
  /** 귀농형 / 귀촌형 / 프로젝트형 */
  villageType?: string;
}

export const EVENT_TYPES = [
  "살아보기", // 9/30 신설 — 수 주 거주형 정부 프로그램(그린대로). 팜스테이(1~2박)와 분리
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

/**
 * 정적 큐레이션 원본 — status 칸이 없다. 손으로 적은 상태는 시간이 지나면 낡는다(10/6 QA: evt-001~003 이 행사가
 * 끝난 뒤에도 "접수중"). 상태는 신청 기간·행사 종료일에서 파생해 `EVENTS` 로 내보낸다 — 지원사업 `PROGRAMS_RAW` 와 같은 방식.
 */
const EVENTS_RAW: Omit<FarmEvent, "status">[] = [
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
      "기업·기관 전시부스, 일반인 참관등록, 비즈니스 매칭, 특별 체험(그림대회, 생막걸리 만들기) 등이 진행되는 귀농귀촌·지역살리기 전문 박람회예요.",
    capacity: null,
    target: "귀농·귀촌 희망자, 농업 관련 기업·기관",
    url: "https://yfarmexpo.co.kr/fairDash.do",
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
      "120개사 400부스 규모의 스마트농업·귀농귀촌 박람회예요. 스마트팜 기술 전시, 심포지엄·세미나가 진행되며 경남국제축산박람회(GILEX)가 동시 개최돼요.",
    capacity: null,
    target: "스마트팜 도입 희망 농업인, 귀농 예정자",
    url: "https://sfkorea.kr/",
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
      "AgTech 기획관, 도시농업관, 귀농귀촌 정보 등 농업·축산·귀농 분야 종합 박람회예요. 바이어 및 참관객 무료 입장으로 사전등록 후 참여할 수 있어요.",
    capacity: null,
    target: "귀농귀촌 희망자, 농업 기술 관심자",
    url: "https://kfarm.co.kr/",
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
      "농업·축산·귀농귀촌 분야 종합 박람회로 수원메쎄에서 개최돼요. 농촌 정착 정보 상담, 농업 기술 전시, 지역 홍보 부스 등이 운영돼요.",
    capacity: null,
    target: "귀농귀촌 희망자, 농업 관심 시민",
    url: "https://www.showala.com/ex/ex_detail.php?idx=3305",
  },
  {
    id: "evt-005",
    title: "전북에서 살아보기 — 무주군 영농체험 (1기)",
    region: "전라북도",
    organization: "무주군 / 그린대로 플랫폼",
    type: "일일체험",
    date: "2026-04-01",
    dateEnd: "2026-06-30",
    // 원문(무진장뉴스 55756, 2026-03-30 게재)은 마감 "4월 3일까지"만 명시 — 시작일은 게재일로 둔다
    applicationStart: "2026-03-30",
    applicationEnd: "2026-04-03",
    location: "전라북도 무주군",
    cost: "문의 필요 (1551-6858)",
    description:
      "무주군에 3개월간 체류하며 사과, 블루베리 등 지역 특화작목 영농체험을 하는 프로그램이에요. 지역 탐색, 주민 교류 등 정착 전 농촌 생활을 직접 체험할 수 있어요.",
    capacity: null,
    target: "전북 귀농귀촌 관심자",
    url: "https://www.mjjnews.net/news/article.html?no=55756",
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
      "영월군에 3개월간 체류하며 주요 작물 재배기술을 습득하고, 영농실습과 지역 주민 교류를 통해 귀농 적응력을 키우는 프로그램이에요. 5명 선발.",
    capacity: 5,
    target: "농촌 정착 희망자",
    url: "https://gecpo.org/552867",
  },
];

/** 신청 기간·행사 종료일 → 접수 상태 (KST 오늘 기준) */
function deriveStatusOf(e: Pick<FarmEvent, "applicationStart" | "applicationEnd" | "dateEnd">): FarmEvent["status"] {
  return deriveEventStatus(e.applicationStart, e.applicationEnd, e.dateEnd);
}

/** 정적 데이터에 파생 status를 주입한 배열 — 외부에서 쓰는 공식 export */
export const EVENTS: FarmEvent[] = EVENTS_RAW.map((e) => ({ ...e, status: deriveStatusOf(e) }));

// --- 헬퍼 함수 ---

/** ID로 단일 행사 조회 — 정적 데이터만 (동기, 부르는 날 기준 상태) */
export function getEventById(id: string): FarmEvent | undefined {
  const e = EVENTS_RAW.find((e) => e.id === id);
  return e ? { ...e, status: deriveStatusOf(e) } : undefined;
}

/** DB 행 → FarmEvent. 목록(`loadEvents`)·상세(`getEventByIdAsync`) 공용. status 는 DB 칸이 아니라 날짜에서 파생 */
function mapEventRow(row: EventRow): FarmEvent {
  return {
    id: row.slug,
    title: row.title,
    region: row.region,
    sigungu: row.sigungu ?? undefined,
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
    imageUrl: row.image_url ?? undefined,
    moveInDate: row.move_in_date ?? undefined,
    households: row.households ?? null,
    villageType: row.village_type ?? undefined,
  };
}

/**
 * 순수 비대면 강의인가 — 체험(살아보기·일일체험…)이 아니다 (10/6 QA R2-Q1 🟡4).
 *
 * 그린대로 교육 목록의 "유형특화과정-예비귀촌인 · [비대면] 10/31 (주말반 10시~12시) 농촌융복합 6차산업과 농촌체험관광"
 * (crawl-greendaero-education-2ca872c9)이 강의 주제의 '체험'에 걸려 farm_events·'일일체험'으로 적재됐고, 지역도
 * 교육기관 본사(서울 서초구)로 들어가 서울 상세·/events 에 '일일체험'으로 나왔다. 수집기는 운영 구분(eduOperSeNm)으로
 * 고쳤고(supabase/functions/_shared/greendaero.ts) 이미 적재된 행은 DB 수정 SQL 이 지우지만 결재 대기라, 그 전까지 여기서 막는다.
 *
 * DB 행에는 운영 구분 칸이 없어 제목으로만 판정한다 — **보수적으로** 셋 다일 때만:
 *  ① 수집 행(crawl-*) — 손으로 고른 큐레이션 행은 건드리지 않는다
 *  ② 제목의 한 마디(" · " 로 나뉜 사업명·회차 안내)가 "[비대면]" 으로 시작
 *  ③ 제목 어디에도 대면·현장·실습·오프라인 표지가 없다 — "비대면+현장실습" 체험학교는 체험으로 남는다
 */
export function isOnlineOnlyLecture(event: Pick<FarmEvent, "id" | "title">): boolean {
  if (!isCrawledRow(event.id)) return false;
  const startsOnline = event.title.split("·").some((segment) => segment.trim().startsWith("[비대면]"));
  if (!startsOnline) return false;
  const hasOfflineMark = /(^|[^비])대면|현장|실습|오프라인/.test(event.title);
  return !hasOfflineMark;
}

/** DB 결과에 DB 에 없는 정적 행을 붙인다 — CLAUDE.md "데이터 소스 병합 원칙" (QA Q1-W3: evt-004 수원 케이팜 미노출) */
function withStaticOnly(primary: FarmEvent[]): FarmEvent[] {
  const primaryIds = new Set(primary.map((e) => e.id));
  const staticOnly = EVENTS_RAW.filter((e) => !primaryIds.has(e.id)).map((e) => ({ ...e, status: deriveStatusOf(e) }));
  return [...primary, ...staticOnly];
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
        const event = mapEventRow(data as unknown as EventRow);
        // 체험이 아닌 비대면 강의 — 목록·사이트맵과 같이 상세도 열지 않는다(isOnlineOnlyLecture)
        return isOnlineOnlyLecture(event) ? undefined : event;
      }
    } catch {
      // Supabase 에러 → 정적 폴백
    }
  }

  return getEventById(id);
}

/** 현재 연월 문자열 (YYYY-MM) */
export function getCurrentPeriod(): string {
  // KST 기준 달 — Vercel 서버는 UTC 라 new Date() 로 세면 매월 1일 0~9시(KST)에 지난달이 된다 (10/6 QA)
  return kstToday().slice(0, 7);
}


/** 필터 조건 — region·type 은 URL 그대로의 쉼표 목록(CSV, 복수 선택)도 받는다. 그룹 안은 합집합, 그룹 사이는 교집합 */
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

  const regions = parseFilterValues(filters.region);
  const types = parseFilterValues(filters.type);

  return EVENTS_RAW.map((e) => ({ ...e, status: deriveStatusOf(e) })).filter((event) => {
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

    // 텍스트 검색 — 1글자(작물 이름만 normalize 통과)는 낱말 단위 (filter-match.ts)
    if (
      !matchesListQuery(filters.query, [
        event.title,
        event.description,
        event.region,
        event.organization,
        event.location,
        event.type,
        event.target,
      ])
    ) {
      return false;
    }

    // 지역 필터 (복수 선택 = 합집합, 전국 행사는 항상 남김)
    if (regions.length > 0 && event.region !== "전국" && !regions.includes(event.region)) {
      return false;
    }

    // 행사 유형 필터 (복수 선택 = 합집합)
    if (types.length > 0 && !types.includes(event.type)) {
      return false;
    }

    return true;
  });
}

/**
 * 행사 데이터 로더 (Supabase 우선 → 정적 폴백)
 */
async function loadEvents(): Promise<{
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
        // 체험이 아닌 순수 비대면 강의는 뺀다 — 지역 상세·/events·랜딩·사이트맵이 모두 이 로더를 쓴다 (10/6 QA R2)
        const dbEvents = (data as unknown as EventRow[]).map(mapEventRow).filter((e) => !isOnlineOnlyLecture(e));
        // 정적 데이터 중 DB에 없는 행사 병합 (10/6 전엔 없어서 evt-004 수원 케이팜이 목록에 0회 노출)
        return { events: withStaticOnly(dbEvents), source: "supabase" };
      }
    } catch {
      // Supabase 에러 → 정적 폴백
    }
  }

  // 정적 폴백 — 부르는 날 기준 상태
  return { events: withStaticOnly([]), source: "fallback" };
}

/**
 * async 버전: Supabase 우선 데이터로 필터링
 */
export async function filterEventsAsync(
  filters: EventFilters
): Promise<{ events: FarmEvent[]; source: "supabase" | "fallback" }> {
  const { events: allEvents, source } = await loadEvents();
  // 복수 선택(CSV) — 그룹 안은 합집합, 그룹 사이는 교집합 (10/6 QA Q4-F1)
  const regions = parseFilterValues(filters.region);
  const types = parseFilterValues(filters.type);

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
    // 검색어 — 1글자(작물 이름만 normalize 통과)는 낱말 단위, 2글자 이상은 부분 일치 (filter-match.ts)
    if (
      !matchesListQuery(filters.query, [
        event.title, event.description, event.region,
        event.organization, event.location,
      ])
    ) {
      return false;
    }
    if (regions.length > 0 && event.region !== "전국" && !regions.includes(event.region)) return false;
    if (types.length > 0 && !types.includes(event.type)) return false;
    return true;
  });

  return { events: filtered, source };
}

// ─── 정렬 (5/25 회장 결재 — programs·education과 동일 패턴) ─────────────────

/**
 * 정렬 키:
 *  deadline: status='마감'은 뒤로 + applicationEnd(또는 date) asc.
 *            applicationEnd 없으면 date 사용. 9999-12-31(미정) 가장 뒤.
 *  recent:   id desc (createdAt 부재).
 */
export type EventSortKey = "deadline" | "recent";

export const EVENT_SORT_OPTIONS: readonly {
  value: EventSortKey;
  label: string;
}[] = [
  { value: "deadline", label: "마감 임박순" },
  { value: "recent", label: "최근 등록순" },
];

export const DEFAULT_EVENT_SORT: EventSortKey = "deadline";

export function sortEvents(
  events: FarmEvent[],
  sort: EventSortKey,
): FarmEvent[] {
  if (sort === "recent") {
    const indexed = events.map((e, i) => ({ e, i }));
    indexed.sort((a, b) => {
      const aid = a.e.id ?? "";
      const bid = b.e.id ?? "";
      if (aid === bid) return a.i - b.i;
      return bid.localeCompare(aid);
    });
    return indexed.map((x) => x.e);
  }
  // deadline (default) — applicationEnd 우선, 없으면 행사일(date)
  const indexed = events.map((e, i) => ({ e, i }));
  indexed.sort((a, b) => {
    const aClosed = a.e.status === "마감" ? 1 : 0;
    const bClosed = b.e.status === "마감" ? 1 : 0;
    if (aClosed !== bClosed) return aClosed - bClosed;
    const ae = a.e.applicationEnd || a.e.date || "9999-12-31";
    const be = b.e.applicationEnd || b.e.date || "9999-12-31";
    if (ae === be) return a.i - b.i;
    return ae.localeCompare(be);
  });
  return indexed.map((x) => x.e);
}
