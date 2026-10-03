/**
 * 크롤링 유틸리티
 * - HTML 파싱, 소프트 404 감지, URL 헬스체크
 * - CLAUDE.md 규칙 8번 "외부 URL 검증은 이중 체크 필수" 준수
 *
 * 크롤 대상:
 *   1. rda.go.kr/young/custom.do — 똑똑!청년농부 (지원사업 + 교육 + 행사)
 *   2. uni.agrix.go.kr — 농림부 통합 지원사업 (JSON API)
 *   3. greendaero.go.kr — 지자체 귀농귀촌 교육·체험 (JSON, greendaero.ts)
 *
 * ※ returnfarm.com → 도메인 만료(2026년 기준)
 * ※ greenroad.go.kr → 접속 불가
 */

// ─── 소프트 404 감지 키워드 ───

const SOFT_404_KEYWORDS = [
  "찾을 수 없",
  "not found",
  "404",
  "에러",
  "존재하지",
  "서비스를 찾",
  "오류",
  "접근할 수 없",
  "페이지를 찾",
  "페이지 없",
];

/** HTML에서 <title> 추출 */
export function parseHtmlTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? match[1].trim() : "";
}

/** 소프트 404 여부 판별 (타이틀 기반) */
export function isSoft404(html: string): boolean {
  const title = parseHtmlTitle(html).toLowerCase();
  return SOFT_404_KEYWORDS.some((kw) => title.includes(kw.toLowerCase()));
}

/** URL 헬스 체크 (이중 검증: 상태코드 + 타이틀) */
export async function checkUrlHealth(
  url: string
): Promise<"active" | "broken" | "unverified"> {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return "broken";

    const html = await res.text();
    if (isSoft404(html)) return "broken";

    return "active";
  } catch {
    return "unverified";
  }
}

// ─── 크롤링 대상 정의 ───

export type CrawlTargetType =
  | "rda-listing"
  | "agrix-api"
  | "rda-events"
  | "greendaero-education"
  | "greendaero-live";

export interface CrawlTarget {
  id: string;
  name: string;
  url: string;
  category: "programs" | "education" | "events";
  type: CrawlTargetType;
  /** POST 요청 시 추가 파라미터 */
  params?: Record<string, string>;
}

export const CRAWL_TARGETS: CrawlTarget[] = [
  {
    id: "rda-programs",
    name: "똑똑!청년농부 지원사업",
    url: "https://www.rda.go.kr/young/custom.do",
    category: "programs",
    type: "rda-listing",
    // 사업 체크박스 → JS에서 세부 카테고리 문자열로 변환하여 전송
    params: {
      search_category: "자금,창업,주거,일자리,농지,네트워크,컨설팅,판로",
      search_ingState: "진행중",
    },
  },
  {
    id: "rda-education",
    name: "똑똑!청년농부 교육과정",
    url: "https://www.rda.go.kr/young/custom.do",
    category: "education",
    type: "rda-listing",
    params: { search_category: "교육", search_ingState: "진행중" },
  },
  {
    id: "agrix-programs",
    name: "농림부 통합 지원사업",
    url: "https://uni.agrix.go.kr/docs7/customizedNew/introduce/IntroduceSaupList.do",
    category: "programs",
    type: "agrix-api",
  },
  {
    id: "rda-events",
    name: "똑똑!청년농부 행사·체험",
    url: "https://www.rda.go.kr/young/custom.do",
    category: "events",
    type: "rda-events",
  },
  {
    // 강의형은 education_courses, 체험형(디딤돌·마실·팸투어)은 farm_events로
    // 항목 단위 분기된다 (CrawledItem.category). 자세한 규칙은 greendaero.ts 참조.
    id: "greendaero-education",
    name: "그린대로 귀농귀촌 교육",
    url: "https://www.greendaero.go.kr/svc/rfph/edc/offline/front/applicationList.do",
    category: "education",
    type: "greendaero-education",
  },
  {
    id: "greendaero-live",
    name: "그린대로 농촌에서 살아보기",
    url: "https://www.greendaero.go.kr/svc/rfph/edc/live/front/apply/list.do",
    category: "events",
    type: "greendaero-live",
  },
];

// ─── 크롤 결과 타입 ───

export interface CrawledItem {
  title: string;
  url: string;
  /** 원문 지역 표기. 적재 직전 `normalizeRegion()`으로 SSOT 귀결된다. */
  region: string;
  organization: string;
  status: string;
  /** 접수 시작일 (YYYY-MM-DD) */
  dateStart?: string;
  /** 접수 종료일 (YYYY-MM-DD) */
  dateEnd?: string;
  /** 대상·자격 문구 */
  capacity?: string;

  // ── 2026-09-29 그린대로 타겟용 확장 ──
  /**
   * 원천 시스템의 고유 키. 있으면 slug를 제목 해시 대신 이 값으로 만든다.
   * 같은 과정명이 회차별로 반복되는 그린대로에서 슬러그 충돌을 막는다.
   */
  sourceKey?: string;
  /** 타겟 기본 category를 항목 단위로 덮어쓴다 (교육 목록 안의 체험형 분리). */
  category?: "programs" | "education" | "events";
  /** farm_events.type 지정 (미지정 시 제목에서 추론) */
  eventType?: string;
  /** 운영(교육) 기간 — 접수 기간과 별개 */
  operationStart?: string;
  operationEnd?: string;
  /** 정원 */
  capacityCount?: number | null;
  /** 교육 운영 형태 → education_courses.type */
  educationType?: "온라인" | "오프라인" | "혼합";
  /** 본문에 덧붙일 출처·주의 문구 (접수 기간 불일치 안내 등) */
  note?: string;

  // ── 2026-09-30 살아보기 마을 카드 필드 (farm_events 전용) ──
  /** 마을 대표 사진 원본 URL */
  imageUrl?: string;
  /** 입주 가능일 (YYYY-MM-DD) */
  moveInDate?: string;
  /** 모집 가구 수 (capacityCount 는 인원) */
  households?: number | null;
  /** 귀농형 / 귀촌형 / 프로젝트형 */
  villageType?: string;

  // ── 2026-10-03 RDA 상세 보강 (parseRdaDetailHtml · applyRdaDetail) ──
  /**
   * 원문의 지원 내용 요약 (태그 제거). 없으면 빈 문자열 — "…에서 수집했어요" 같은 출처 상투문은
   * 정보량이 0 이라 넣지 않는다. 출처는 source_url·url 로 충분하다.
   */
  summary?: string;
  /** 지원 금액 문구 — 원문 구조화 칸(지원금액)에 값이 있을 때만 */
  amount?: string;
  /** 사업 연도 — 원천이 준 목록 연도 (agrix 는 saupYear 폴백이면 작년). 없으면 적재 시 KST 올해 */
  year?: number;
  /**
   * 상세 보강을 못 한 목록 값뿐인 항목. 주관 기관은 목록의 지역 표기, 접수 시작일은 미상
   * (`UNKNOWN_DATE`)으로 채워져 있다. 적재 시 is_verified=false 로 남겨 다음 실행에서 다시 받고,
   * 이미 검증된 행은 이 값으로 덮어쓰지 않는다 (sync-crawl).
   */
  detailMissing?: boolean;
}

/** 원문 링크 상태 — support_programs·education_courses.link_status 어휘 */
export type LinkStatus = "active" | "broken" | "unverified";

// ─── 원천 요청 공통 ("성공·0건" 금지, 10/4) ───

/**
 * 수집 결과 — 항목과 함께 **원천 실패**를 돌려준다.
 * 10/3 이전 수집기는 요청 실패·타임아웃·응답 형식 변경을 전부 빈 배열로 삼켜, 원천이 죽어도
 * 함수가 "성공·0건"으로 끝났다 (sync-rda 6개월 무음과 같은 유형). `errors` 가 하나라도 있으면
 * sync-crawl 이 그 타깃을 ok:false 로 집계하고 → sync-data.yml Phase B 가 실패로 표시한다.
 * 실패해도 그때까지 모은 항목은 그대로 적재한다 (검증된 기존 행은 건드리지 않는다).
 */
export interface CollectResult {
  items: CrawledItem[];
  errors: string[];
}

/** 원천 요청 공통 UA — 우리가 누구인지 밝힌다 (RDA·agrix 10/3~4 실측: 응답 동일) */
export const CRAWL_UA = "Mozilla/5.0 (compatible; irang-datasync/1.0; +https://irangfarm.com)";

export interface RetryOptions {
  /** 첫 시도 타임아웃 (ms) */
  timeoutMs: number;
  /** 재시도 타임아웃 (ms) — 일시 지연을 넉넉히 기다린다 */
  retryTimeoutMs?: number;
  /** 재시도 전 대기 (ms) */
  backoffMs?: number;
  /** false 면 재시도 없이 한 번만 */
  retry?: boolean;
}

/**
 * 원천 요청 — 네트워크 오류·타임아웃·5xx 는 한 번 더 시도한다 (4xx 는 다시 해도 같아 바로 실패).
 * 기본 대기 10초 + 재시도 25초: 10/3 실측에서 RDA 목록이 15초 넘게 2회 연속 지연된 뒤
 * 약 20초 후 3.5초로 정상 응답했다 — 30~40초짜리 지연 창을 흡수하는 크기다.
 * 끝내 실패하면 throw → 호출부가 `CollectResult.errors` 로 옮긴다.
 */
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  options: RetryOptions,
): Promise<Response> {
  const attempts = options.retry === false ? 1 : 2;
  let lastError: unknown = new Error("요청하지 않음");
  for (let attempt = 1; attempt <= attempts; attempt++) {
    if (attempt > 1) await new Promise((resolve) => setTimeout(resolve, options.backoffMs ?? 10_000));
    try {
      const res = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(
          attempt === 1 ? options.timeoutMs : (options.retryTimeoutMs ?? options.timeoutMs),
        ),
      });
      if (res.ok) return res;
      lastError = new Error(`HTTP ${res.status}`);
      await res.body?.cancel().catch(() => {});
      if (res.status < 500) break;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/** 오류 → 보고용 한 줄 (타임아웃은 사람이 읽기 쉽게) */
export function describeError(err: unknown): string {
  if (err instanceof Error) {
    return err.name === "TimeoutError" || err.name === "AbortError" ? "타임아웃" : err.message;
  }
  return String(err);
}

/**
 * 실패 문구 꼬리 — 재시도를 켠 요청이고 재시도 대상 오류(4xx 아님)였으면 "(재시도 후)"를 붙인다.
 * 보고를 읽는 사람이 "한 번 튄 것"과 "두 번 연속 실패"를 가를 수 있게.
 */
export function describeFailure(err: unknown, retried: boolean): string {
  const clientError = err instanceof Error && /^HTTP 4\d\d$/.test(err.message);
  return `${retried && !clientError ? "(재시도 후)" : ""} — ${describeError(err)}`;
}

// ═══════════════════════════════════════
// 1. RDA 똑똑!청년농부 HTML 파서
// ═══════════════════════════════════════
//
// ── 원천 구조 (2026-10-03 실측: 목록 4종·상세 21건) ──────────────────────
//  목록  POST /young/custom.do (pKey=L) → <tbody> 행 7칸
//        [0] 진행상태 [1] 유형 [2] 지역("경북 &nbsp;봉화") [3] 사업명 — fn_detailView('policy', '47040')
//        [4] 지원금액(실측 전건 빈칸) [5] 신청마감일 [6] 첨부
//        "총 N건" 문구, 한 페이지 10행. 범위 밖 cp 는 마지막 페이지를 다시 준다.
//        ⚠ 목록에는 주관 기관·접수 시작일·지원 내용이 없다. (제목은 상세 h4 와 같다 — 10/4 마감 142건 전수
//          대조. "…모집 공"처럼 잘린 제목은 원천 자체가 그렇게 저장한 것이라 상세에서도 복원되지 않는다.)
//  상세  GET /young/custom/{policy|edu}/view.do?sId= → <div class="table type02 tdLeft pc"> 표
//        신청기간 "2026-09-21 ~ 2026-10-06" · 교육기간 · 교육인원(명) · 교육대상 · 주관기관
//        ("봉화군농업기술센터") · 담당부서 · 요약내용(원문 공고 HTML 그대로 — 중첩 표·이미지 포함)
//        모바일 표는 같은 값을 담당기관·지원금액(총사업량)·지원대상·사업요약내용 라벨로 반복한다.
//        삭제된 게시글은 HTTP 200 + 정상 <title> + alert("삭제된 게시글입니다.") — 제목 검사로 못 거른다.
//
// 10/3 이전 구현은 목록만 읽고 주관 기관을 "농촌진흥청"(포털 운영 기관일 뿐)으로, 접수 시작일을
// 수집일로, 요약을 "…에서 수집했어요"로 채웠다 → 운영 DB crawl-rda-* 행 전부 오표시.
// 지금은 적재할 항목만 상세 페이지를 받아(enrichRdaItems) 원문 값으로 채우고,
// 상세를 못 받으면 **틀린 값 대신 미상**으로 둔다.

/** 날짜 미상 — src/lib/program-status.ts ALWAYS_OPEN 과 같은 값 (9999 페어 관례) */
export const UNKNOWN_DATE = "9999-12-31";

const RDA_BASE = "https://www.rda.go.kr";
const RDA_LIST_URL = `${RDA_BASE}/young/custom.do`;
const RDA_UA = CRAWL_UA;
/** 목록이 비었을 때 RDA 가 그리는 행 — 이게 있으면 "진행중 0건"은 정상이다 */
const RDA_EMPTY_ROW = /조회된\s*데이터가\s*없습니다/;

/** 주관 기관을 끝내 모를 때 — 목록 지역 칸까지 비어 있는 경우 (실측 0건) */
const RDA_UNKNOWN_ORG = "원문 공고 기관";

/** 한국 시간(KST) 기준 오늘 YYYY-MM-DD — Edge Function 은 UTC 로 돈다 (5/15 UTC 함정) */
export function kstToday(nowMs: number = Date.now()): string {
  return new Date(nowMs + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

// ─── 공통 텍스트 유틸 ───

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  ensp: " ",
  emsp: " ",
  thinsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  middot: "·",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  hellip: "…",
  ndash: "–",
  mdash: "—",
  bull: "•",
  times: "×",
};

/** HTML 엔티티 해제. 두 번 인코딩된 "&amp;nbsp;" 가 실측돼(sId 46753) 두 번까지 푼다 */
export function decodeHtmlEntities(text: string): string {
  let out = text;
  for (let pass = 0; pass < 2; pass++) {
    const next = out.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) => {
      if (code[0] === "#") {
        const cp = code[1] === "x" || code[1] === "X"
          ? Number.parseInt(code.slice(2), 16)
          : Number.parseInt(code.slice(1), 10);
        return Number.isFinite(cp) && cp > 0 && cp < 0x110000 ? String.fromCodePoint(cp) : whole;
      }
      return NAMED_ENTITIES[code.toLowerCase()] ?? whole;
    });
    if (next === out) break;
    out = next;
  }
  return out;
}

/** 셀 HTML → 한 줄 평문 (태그 제거 · 엔티티 해제 · 공백 정리) */
function cellText(html: string): string {
  return decodeHtmlEntities(html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, ""))
    .replace(/[\s 　​]+/g, " ")
    .trim();
}

/**
 * 원문 HTML → 평문 줄 목록. 블록 경계(br·p·div·li…)를 줄로 보고 인라인 태그는 지운다.
 * 본문 속 표(지원단가 등)·주석·스크립트는 요약에 쓰지 않으므로 버린다.
 */
export function htmlToTextLines(html: string): string[] {
  const text = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<table\b[\s\S]*?<\/table>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(?:p|div|li|ul|ol|h[1-6]|tr|section|article|blockquote|dd|dt)\b[^>]*>/gi, "\n")
    .replace(/<[^>]*>/g, "");
  return decodeHtmlEntities(text)
    .split("\n")
    .map((line) => line.replace(/[\s 　​]+/g, " ").trim())
    .filter((line) => line.length > 0);
}

/** "2026-09-21" · "2026.9.21" · "2026/09/21" → ISO. 달력에 없는 날짜는 버린다 */
function looseIsoDate(text: string | undefined): string | undefined {
  const m = (text ?? "").match(/(\d{4})\s*[-./]\s*(\d{1,2})\s*[-./]\s*(\d{1,2})/);
  if (!m) return undefined;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return undefined;
  const probe = new Date(Date.UTC(y, mo - 1, d));
  if (probe.getUTCMonth() !== mo - 1) return undefined; // 2026-02-30 같은 값
  return `${m[1]}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/**
 * "2026-09-21 ~ 2026-10-06" → { start, end }.
 * "~ 2026-09-30" 은 끝만, "2026-09-21 ~" 는 시작만. 물결 없이 날짜 하나면 마감일로 본다
 * (시작일을 추정하지 않는다).
 */
export function parseDateRange(text: string | undefined): { start?: string; end?: string } {
  const value = (text ?? "").trim();
  if (!value) return {};
  const tilde = value.search(/[~∼～]/);
  if (tilde < 0) return { end: looseIsoDate(value) };
  return {
    start: looseIsoDate(value.slice(0, tilde)),
    end: looseIsoDate(value.slice(tilde + 1)),
  };
}

/**
 * 접수 기간 확정 규칙 (data-engineer 가드 #3 · CLAUDE.md "추정 일자는 9999 페어").
 *  · 마감일을 모르면 시작일이 있어도 쓰지 않고 9999 페어 — "시작만 확정 + 끝 9999"는
 *    시작일에 자동으로 모집중 전환되는 금지 패턴이다.
 *  · 마감일만 알면 시작일은 미상(9999) — 수집일로 채우지 않는다.
 *    화면(formatApplicationPeriod)은 이 조합을 "~ {마감일}"로 그린다.
 *  · 시작이 마감보다 늦은 모순 값은 시작을 미상으로 돌린다.
 */
export function resolveRdaWindow(
  start: string | undefined,
  end: string | undefined,
  listingEnd: string | undefined,
): { start: string; end: string } {
  const close = end ?? listingEnd;
  if (!close || close === UNKNOWN_DATE) return { start: UNKNOWN_DATE, end: UNKNOWN_DATE };
  if (!start || start === UNKNOWN_DATE || start > close) return { start: UNKNOWN_DATE, end: close };
  return { start, end: close };
}

/**
 * 확정된 접수 기간 → 상태 (RDA·agrix 공용). 시작 미상이면 마감일만 보고,
 * 9999 페어는 "모집예정"(공고 발표 예정)
 */
export function windowStatus(start: string, end: string, today: string): "모집중" | "모집예정" | "마감" {
  if (end === UNKNOWN_DATE) return "모집예정";
  if (today > end) return "마감";
  if (start !== UNKNOWN_DATE && today < start) return "모집예정";
  return "모집중";
}

// ─── 목록 ───

/** 목록 행 → 지역 표기 그대로 주관 기관 자리에 둔다 (상세를 못 받았을 때만 남는 값) */
function listingOrganization(region: string): string {
  const value = region.trim();
  return value && value !== "전국" ? value : RDA_UNKNOWN_ORG;
}

/**
 * RDA 목록 HTML 파싱.
 * 실제 테이블 컬럼 (7개):
 *   [0] 진행상태  [1] 유형  [2] 지역  [3] 사업명  [4] 지원금액  [5] 신청마감일  [6] 첨부파일
 *
 * 목록만으로는 주관 기관·접수 시작일·지원 내용을 알 수 없다 → `detailMissing: true` 로 내보내고
 * `enrichRdaItems` 가 상세 페이지 값으로 채운다. 상세를 못 받아도 남는 값이 틀리지 않도록
 * 시작일은 미상, 주관 기관은 목록의 지역 표기로 둔다 ("농촌진흥청"·수집일 금지).
 */
export function parseRdaListingHtml(html: string): CrawledItem[] {
  const items: CrawledItem[] = [];

  // <tbody> 이후의 <tr> 행만 파싱 (thead 제외)
  const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/i);
  if (!tbodyMatch) return items;

  const tbodyHtml = tbodyMatch[1];
  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowPattern.exec(tbodyHtml)) !== null) {
    const rowHtml = rowMatch[1];

    const cells: string[] = [];
    const cellPattern = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let cellMatch;
    while ((cellMatch = cellPattern.exec(rowHtml)) !== null) {
      cells.push(cellText(cellMatch[1]));
    }

    // 최소 6개 셀 필요 (상태, 유형, 지역, 제목, 금액, 마감일)
    if (cells.length < 6) continue;

    const state = cells[0]; // 진행중, 예정, 마감
    const region = cells[2];
    const title = cells[3];
    const deadline = looseIsoDate(cells[5]); // 5번 = 신청 마감일 (4번은 지원금액)

    if (!title || title.length < 3) continue;
    // "조회된 데이터가 없습니다" 행 스킵
    if (title.includes("조회된") && title.includes("없습니다")) continue;

    // fn_detailView('policy', '46753') 패턴에서 상세 URL 생성
    const detailMatch = rowHtml.match(
      /fn_detailView\s*\(\s*['"](\w+)['"],\s*['"](\d+)['"]\s*\)/
    );
    const detailUrl = detailMatch
      ? `${RDA_BASE}/young/custom/${detailMatch[1]}/view.do?sId=${detailMatch[2]}`
      : "";

    let status = "모집중";
    if (state.includes("마감")) status = "마감";
    else if (state.includes("예정")) status = "모집예정";

    const window = resolveRdaWindow(undefined, undefined, deadline);
    items.push({
      title,
      url: detailUrl,
      region: region || "전국",
      organization: listingOrganization(region),
      status,
      dateStart: window.start,
      dateEnd: window.end,
      summary: "",
      detailMissing: true,
    });
  }

  return items;
}

/** "총 15건" → 15. 못 찾으면 null */
export function parseRdaListingTotal(html: string): number | null {
  const m = html.match(/총\s*([\d,]+)\s*건/);
  if (!m) return null;
  const n = Number.parseInt(m[1].replace(/,/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * 목록 한 페이지 POST. 실패하면 throw (fetchWithRetry).
 * `retry` 는 1페이지에만 켠다 — 1페이지가 응답했다면 원천은 살아 있고, 뒤 페이지까지 재시도하면
 * 최악의 경우 목록만으로 Edge Function 150초를 넘긴다.
 */
async function fetchRdaListingPage(params: Record<string, string>, retry: boolean): Promise<string> {
  const formData = new URLSearchParams({
    cp: "1",
    pKey: "L",       // 리스트 뷰 (테이블 형식)
    search_sort: "",
    search_keyword: "",
    search_area1: "00",  // 00 = 전국
    search_area2: "",
    search_category: "",
    search_ingState: "",
    search_agency: "",
    search_only: "",
    so: "",
    sd: "",
    ed: "",
    sv: "",
    oc: "",
    ob: "",
    sId: "",
    checkedSId: "",
    ...params,
  });

  const res = await fetchWithRetry(
    RDA_LIST_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": RDA_UA,
      },
      body: formData.toString(),
    },
    { timeoutMs: 15_000, retryTimeoutMs: 25_000, backoffMs: 10_000, retry },
  );
  return await res.text();
}

/**
 * rda.go.kr/young/custom.do POST 로 목록 수집 (전통적 form POST, AJAX 아님).
 *
 * "총 N건"을 읽어 필요한 페이지만 받는다 (최대 `maxPages`). 10/3 이전엔 1페이지만 받아
 * 한 분류에 진행중 공고가 10건을 넘으면 나머지가 영영 수집되지 않았다.
 * 범위 밖 cp 는 마지막 페이지를 다시 주므로 총건수로 페이지 수를 정한다. `cp` 는 이 함수가 관리한다.
 *
 * 실패를 0건으로 삼키지 않는다 (10/4):
 *  · 1페이지 요청 실패(재시도 후에도 타임아웃·5xx·4xx) → errors
 *  · "총 N건"(N>0)인데 해석한 행 0건 → 표 구조 변경 → errors
 *  · "총 N건"도 표도 "조회된 데이터가 없습니다" 행도 없음 → 응답 형식 변경 → errors
 *  · 뒤 페이지 실패 → 앞 페이지 항목은 살리고 errors
 * "총 0건"(또는 '조회된 데이터가 없습니다') 은 정상 0건이다.
 */
export async function fetchRdaListing(
  params: Record<string, string> = {},
  maxPages = 3,
): Promise<CollectResult> {
  let firstHtml: string;
  try {
    firstHtml = await fetchRdaListingPage({ ...params, cp: "1" }, true);
  } catch (err) {
    return { items: [], errors: [`RDA 목록 요청 실패${describeFailure(err, true)}`] };
  }

  const items = parseRdaListingHtml(firstHtml);
  const total = parseRdaListingTotal(firstHtml);
  const errors: string[] = [];

  if (items.length === 0) {
    if (total !== null && total > 0) {
      errors.push(`RDA 목록: 총 ${total}건인데 해석한 행이 0건 — 표 구조 변경 의심`);
    } else if (total === null && !RDA_EMPTY_ROW.test(firstHtml)) {
      errors.push("RDA 목록: '총 N건'·표·빈 목록 안내가 모두 없음 — 응답 형식 변경 의심");
    }
    return { items, errors };
  }

  const perPage = items.length;
  const pages = total && perPage > 0 ? Math.min(maxPages, Math.ceil(total / perPage)) : 1;

  const seenUrl = new Set(items.map((item) => item.url).filter(Boolean));
  for (let page = 2; page <= pages; page++) {
    let html: string;
    try {
      html = await fetchRdaListingPage({ ...params, cp: String(page) }, false);
    } catch (err) {
      errors.push(`RDA 목록 ${page}페이지 요청 실패${describeFailure(err, false)} (앞 페이지 ${items.length}건은 적재)`);
      break;
    }
    const pageItems = parseRdaListingHtml(html);
    if (pageItems.length === 0) {
      errors.push(`RDA 목록 ${page}페이지 해석 0건 (총 ${total}건) — 표 구조 변경 의심`);
      break;
    }
    for (const item of pageItems) {
      if (item.url && seenUrl.has(item.url)) continue;
      if (item.url) seenUrl.add(item.url);
      items.push(item);
    }
  }

  if (total !== null && total > items.length) {
    // 상한(maxPages)에 걸린 것은 설정이지 실패가 아니다 — 로그로만 남긴다
    console.log(`[crawl] RDA 목록: 총 ${total}건 중 ${items.length}건 수집 (최대 ${maxPages}페이지)`);
  }
  return { items, errors };
}

// ─── 상세 페이지 ───

export interface RdaDetail {
  /** 상세 제목 (h4) — 목록 제목과 같아 적재에는 쓰지 않는다. 진단용 */
  title: string;
  /** 주관기관(PC 표) · 담당기관(모바일 표) */
  organization: string;
  dateStart?: string;
  dateEnd?: string;
  /** 교육기간 — 교육·행사의 실제 운영 기간 */
  operationStart?: string;
  operationEnd?: string;
  /** 지원금액(총사업량) — 실측 전건 빈칸이지만 값이 생기면 쓴다 */
  amount: string;
  /** 지원대상 · 교육대상 */
  target: string;
  /** 교육인원(명) */
  capacityCount: number | null;
  /** 요약내용에서 뽑은 지원 내용 (없으면 "") */
  summary: string;
  /** 요약란에 공공누리 변경금지·상업적이용금지 표시가 있어 발췌하지 않았는가 */
  licenseRestricted: boolean;
}

export type RdaDetailParse =
  | { kind: "ok"; detail: RdaDetail }
  | { kind: "deleted" }
  | { kind: "unparsable" };

/** html 에서 start 표지 뒤 ~ 가장 가까운 끝 표지 앞까지 */
function sliceBetween(html: string, start: string, ends: string[]): string | null {
  const from = html.indexOf(start);
  if (from < 0) return null;
  const body = html.slice(from + start.length);
  const cut = ends
    .map((end) => body.indexOf(end))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b)[0];
  return cut === undefined ? body : body.slice(0, cut);
}

/**
 * 상세 페이지 HTML → 구조화 값.
 * 요약내용 칸은 원문 공고 HTML 이 그대로 들어 있어(중첩 <table>·<th> 포함) 라벨 표는 요약 칸
 * **앞까지만** 읽고, 요약은 그 뒤 전부를 별도로 처리한다 — 같은 정규식으로 읽으면 중첩 표의
 * 첫 </td> 에서 잘린다 (sId 46824 실측).
 */
export function parseRdaDetailHtml(html: string): RdaDetailParse {
  const block =
    sliceBetween(html, '<div class="table type02 tdLeft pc">', [
      "<!-- //table pc -->",
      '<div class="table type02 tdLeft mobile">',
    ]) ??
    sliceBetween(html, '<div class="table type02 tdLeft mobile">', [
      "<!-- //table mobile",
      "<!-- //tableArea -->",
    ]);

  if (!block) {
    // 삭제·오류 게시글: HTTP 200 + alert(resultMsg) 뒤 목록으로 되돌리는 2KB 짜리 페이지
    if (/resultMsg\s*=\s*"[^"]*삭제/.test(html)) return { kind: "deleted" };
    return { kind: "unparsable" };
  }

  const summaryAt = block.search(/<th[^>]*>\s*(?:사업)?요약내용\s*<\/th>/);
  const head = summaryAt >= 0 ? block.slice(0, summaryAt) : block;
  const summaryHtml = summaryAt >= 0
    ? block.slice(summaryAt).replace(/^<th[^>]*>[\s\S]*?<\/th>/, "")
    : "";

  const fields = new Map<string, string>();
  for (const m of head.matchAll(/<th[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/g)) {
    const label = cellText(m[1]).replace(/\s+/g, "");
    if (label && !fields.has(label)) fields.set(label, cellText(m[2]));
  }
  if (!fields.has("신청기간") && !fields.has("주관기관") && !fields.has("담당기관")) {
    return { kind: "unparsable" };
  }

  const applyWindow = parseDateRange(fields.get("신청기간"));
  const operation = parseDateRange(fields.get("교육기간"));
  const title = cellText(html.match(/<h4 class="title[^"]*">([\s\S]*?)<\/h4>/)?.[1] ?? "");
  const capacityRaw = (fields.get("교육인원(명)") ?? "").replace(/[^\d]/g, "");
  const capacityCount = capacityRaw ? Number.parseInt(capacityRaw, 10) : null;
  const { summary, licenseRestricted } = extractRdaSummary(summaryHtml, title);

  return {
    kind: "ok",
    detail: {
      title,
      organization: fields.get("주관기관") || fields.get("담당기관") || "",
      dateStart: applyWindow.start,
      dateEnd: applyWindow.end,
      operationStart: operation.start,
      operationEnd: operation.end,
      amount: fields.get("지원금액(총사업량)") || fields.get("지원금액") || "",
      target: fields.get("지원대상") || fields.get("교육대상") || "",
      capacityCount: capacityCount !== null && Number.isFinite(capacityCount) && capacityCount > 0
        ? capacityCount
        : null,
      summary,
      licenseRestricted,
    },
  };
}

// ─── 요약 추출 ───
//
// 요약내용은 지자체 공고 본문을 그대로 옮긴 것이라 형식이 제각각이다 (번호 목록·□○ 기호·문단·표).
// "앞부분 1~2문장"을 기본으로 하되, 공고문 첫 줄은 흔히 "아래와 같이 안내드립니다" 같은 인사말이라
// 원문이 **지원내용·사업내용·교육내용** 같은 라벨을 달아 둔 줄이 있으면 그 줄을 우선한다.
// 원문 문장은 고치지 않고 발췌만 한다 — 줄머리 목록 기호를 떼고 두 단위를 " · " 로 잇는 것 외 변형 없음.
// 공공누리 변경금지·상업적이용금지 고지가 있는 공고는 발췌하지 않는다 (사실 값인 기관·기간만 쓴다).

/** 원문이 "내용"을 직접 적은 라벨 — 요약 첫 자리 */
const SUMMARY_CONTENT_LABELS = new Set([
  "지원내용", "사업내용", "교육내용", "주요내용", "사업개요", "교육개요", "지원사항", "주요사업",
]);
/** 대상·자격 — 둘째 자리 1순위 */
const SUMMARY_TARGET_LABELS = new Set([
  "지원대상", "사업대상", "교육대상", "신청대상", "신청자격", "모집대상", "접수대상", "참여대상", "지원자격",
  "참가대상", "대상", "자격",
]);
/** 금액·규모 — 둘째 자리 2순위 */
const SUMMARY_MONEY_LABELS = new Set([
  "지원금액", "지원한도", "지원규모", "사업비", "지원단가", "지원금", "총사업비",
]);
/** 일정 — 위가 하나도 없을 때 */
const SUMMARY_SCHEDULE_LABELS = new Set([
  "교육일시", "교육기간", "일시", "기간", "사업기간", "추진기간", "운영기간",
]);

/** 값이 정보가 아닌 라벨 줄 ("주요내용 : 붙임참조") */
const EMPTY_VALUE =
  /^(?:붙임|별첨|첨부)\s*(?:파일|문서)?\s*(?:참조|참고)?$|^(?:공고문|세부|상세|원문|지침)\s*(?:내용)?\s*(?:참조|참고)$|^추후\s*(?:공지|안내|결정)$|^미정$|^(?:다음|아래)\s*(?:각\s*호|조건|요건|사항|와|과)/;
/** 공공누리 고지 줄 — 요약에 넣지 않는다 */
const KOGL_LINE = /공공누리|공공저작물/;
/**
 * 변경·상업적 이용을 막은 공공누리 유형(제3·4유형) 고지 — 발췌 자체를 하지 않는다.
 * 본문의 "용도 변경 금지" 같은 조건 문구와 헷갈리지 않게 고지 문형("출처표시+변경금지")으로만 본다.
 */
const KOGL_RESTRICTED =
  /출처\s*표시\s*[+＋\-·,]?\s*(?:상업(?:적\s*이용|용)\s*금지|변경\s*금지)|공공누리\s*제?\s*[34]\s*유형/;
/** 안내·첨부·마무리 줄 */
const CLOSING_LINE = /^(?:붙임|첨부|별첨|문의|문\s*의\s*처|담당자|연락처|접수\s*[·ㆍ]?\s*문의)|끝\.?\s*$/;
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;
/**
 * 연락처 줄 — 지원 내용이 아니고 담당자 이름이 붙기도 한다 ("○○○(041-…)로 언제든 연락주세요", 10/4 실측).
 * ☎ 기호, 지역번호로 시작하는 번호, "문의·전화(접수) … 830-2732" 형태. 날짜("2026-07-24")는 걸리지 않는다
 */
const PHONE = /[☎☏]|(?:^|[^\d])0\d{1,2}[-.)\s]\d{3,4}-\d{4}(?!\d)|(?:문의|전화|연락).*?\d{3,4}-\d{4}/;
/** 첨부·링크 잔재 — 파일명, 용량, "바로보기", 스크립트 주석 (10/4 실측: "…_모집.hwp (246 kb)", "/* *\/바로보기") */
const ATTACHMENT_LINE =
  /\.(?:hwpx?|pdf|docx?|xlsx?|pptx?|zip|jpe?g|png|gif)\b|\(\s*[\d.,]+\s*[kKmM]i?[bB]\s*\)|바로\s*보기|미리\s*보기|다운로드|\/\*|\*\/|>>\s*$|바로\s*가기\s*$/i;
/** 첨부 목록 한 줄 ("교육생 명단(괴산군) 1부.") · 게시 시각만 있는 줄 ("2026년 06월 18일 11시 02분") */
const LISTING_ONLY_LINE =
  /\s\d+\s*부\.?$|^\d{4}\s*년\s*\d{1,2}\s*월\s*\d{1,2}\s*일(?:\s*\d{1,2}\s*시(?:\s*\d{1,2}\s*분)?)?$/;
/**
 * 한국어 문장 끝 — 마침표류, "~다", "~세요·어요·아요·예요·에요·해요·까요·지요·죠".
 * 맨 "요"는 넣지 않는다: "사업개요"·"모집 개요" 같은 소제목이 문장으로 오인됐다 (10/4 실측).
 */
const SENTENCE_END = /(?:[.!?]|다|(?:세|어|아|예|에|해|까|지)요|죠)$/;
/** 줄머리 목록 기호 — "1." "가." "□" "○" "◈" "ㅁ " "-" "※" "①" 등. 날짜("2026.")는 건드리지 않는다 */
const LIST_MARKER =
  /^(?:[□■▣▪▫◾◽◆◇◈❖○●◎◯⊙◉❍❏❑▶▷►▸•∙·※*☞➢➤✔✓★☆\-–—－?]+\s*|[ㅁㅇ]\s+|\(\d{1,2}\)\s*|\d{1,2}[.)](?!\d)\s*|[가-하][.)]\s*|[①-⑳]\s*)+/;

interface SummaryUnit {
  text: string;
  /** squash 한 라벨 (라벨 줄이 아니면 null) */
  label: string | null;
  value: string;
  /** "※"·"*" 로 시작한 주석 줄 */
  note: boolean;
}

const squash = (text: string) => text.replace(/[\s·ㆍ「」『』()（）[\]<>"'‘’“”.,:：~\-–—!?]/g, "");

function splitLabel(text: string): { label: string; value: string } | null {
  const m = text.match(/^([^:：]{1,16}?)\s*[:：]\s*([\s\S]*)$/);
  if (!m) return null;
  const label = m[1].replace(/\([^)]*\)/g, "").replace(/[\s·ㆍ]/g, "");
  if (!label || /\d/.test(label) || label.length > 10) return null;
  // "교육대상자" → "교육대상"
  return { label: label.replace(/자$/, ""), value: m[2].trim() };
}

/** 괄호 안 마침표는 끊지 않고, 마침표는 한글 뒤 + 공백·끝일 때만 문장 끝으로 본다 ("2026. 9. 21." 보존) */
function splitKoreanSentences(line: string): string[] {
  const out: string[] = [];
  let buf = "";
  let depth = 0;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    buf += ch;
    if ("([{（［「『【〔｢".includes(ch)) depth++;
    else if (")]}）］」』】〕｣".includes(ch)) depth = Math.max(0, depth - 1);
    if (depth > 0 || (ch !== "." && ch !== "?" && ch !== "!")) continue;
    const next = line[i + 1];
    if (next !== undefined && !/\s/.test(next)) continue;
    if (ch === "." && !/[가-힣]/.test(line[i - 1] ?? "")) continue;
    out.push(buf.trim());
    buf = "";
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

/**
 * 머리말·안내 문장 — "아래와 같이 모집 공고합니다"(제목 반복) · "자세한 내용은 붙임파일을
 * 참고하시기 바랍니다"(정보 없음). sId 46753·46874 실측.
 */
const PROSE_BOILERPLATE =
  /(?:아래|다음)(?:과|와)\s*같이|붙임|첨부|별첨|자세한\s*(?:내용|사항)|(?:참고|참조|문의)(?:하시기|해\s*주시기)\s*바랍니다/;

/** 첫 자리에 쓸 서술 문장인가 — 머리말은 빼고, 그 공고는 라벨 줄(대상·금액)로 요약을 채운다 */
function isProseSentence(unit: SummaryUnit): boolean {
  return unit.label === null &&
    !unit.note &&
    unit.text.length >= 15 &&
    SENTENCE_END.test(unit.text) &&
    !PROSE_BOILERPLATE.test(unit.text);
}

function clipSummary(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,·:：(（-]+$/, "")}…`;
}

/**
 * 요약내용 HTML → 지원 내용 요약 (최대 2단위, 200자).
 *  1) 원문 줄을 평문으로 풀고 제목 반복·소제목·문의·붙임·공공누리 고지·이메일 줄을 버린다
 *  2) 우선순위 [내용 라벨 줄(없으면 첫 서술 문장), 대상, 금액, 일정(내용·문장이 없을 때만)] 중
 *     앞의 두 개를 고른다. 둘을 합쳐 200자를 넘으면 첫 단위만
 *  3) 아무것도 못 고르면 남은 첫 1~2단위
 * 요약란에 공공누리 변경금지·상업적이용금지 표시가 있으면 발췌하지 않고 "" 를 돌려준다.
 */
export function extractRdaSummary(
  summaryHtml: string,
  title: string,
  maxChars = 200,
): { summary: string; licenseRestricted: boolean } {
  const rawLines = htmlToTextLines(summaryHtml);
  const joined = rawLines.join(" ");
  if (KOGL_RESTRICTED.test(joined)) {
    return { summary: "", licenseRestricted: true };
  }

  const titleKey = squash(title);
  const lines: { text: string; note: boolean }[] = [];
  for (const raw of rawLines) {
    const note = /^[※*]/.test(raw);
    const text = raw.replace(LIST_MARKER, "").trim();
    if (!text || !/[가-힣A-Za-z0-9]/.test(text)) continue;
    const key = squash(text);
    if (!key) continue;
    if (titleKey && (key === titleKey || (key.length >= 10 && titleKey.includes(key)))) continue; // 제목 반복
    if (KOGL_LINE.test(text) || CLOSING_LINE.test(text) || EMAIL.test(text) || PHONE.test(text)) continue;
    if (ATTACHMENT_LINE.test(text) || LISTING_ONLY_LINE.test(text)) continue;
    // 대괄호로 감싼 소제목 "[신청]" "[2026년 라이브커머스 교육]"
    if (/^[[［【〔<(（「『].*[\]］】〕>)）」』]$/.test(text) && text.length <= 40) continue;
    // 아주 짧은 소제목 "추진개요" "개 요" "신청방법" 은 버린다 — 단, 내용 라벨 자체면 뒤 줄을 값으로 붙인다.
    // 더 긴 무라벨·비문장 줄은 남겨 둔다: "주요내용" 뒤 목록 항목("트랙터 운전 및 작업실습")이 값이 되고,
    // 요약 후보(라벨 줄·서술 문장)에는 어차피 들지 않는다.
    const isTierLabel = [SUMMARY_CONTENT_LABELS, SUMMARY_TARGET_LABELS].some((set) => set.has(key));
    if (!isTierLabel && key.length <= 4 && !/[:：]/.test(text) && !/[.!?]$/.test(text)) continue;
    lines.push({ text: isTierLabel ? `${text} :` : text, note });
  }

  // "…추진하니," 처럼 쉼표로 끝난 줄은 다음 서술 줄과 한 문장이다
  const merged: { text: string; note: boolean }[] = [];
  for (const line of lines) {
    const prev = merged[merged.length - 1];
    if (prev && /[,，]$/.test(prev.text) && !splitLabel(line.text)) {
      prev.text = `${prev.text} ${line.text}`;
    } else {
      merged.push({ ...line });
    }
  }

  const units: SummaryUnit[] = [];
  for (let i = 0; i < merged.length; i++) {
    const { text, note } = merged[i];
    const labeled = splitLabel(text);
    if (labeled) {
      let value = labeled.value;
      // "주요내용" 다음 줄들에 값이 있는 형식 — 라벨 없는 짧은 줄 최대 3개를 값으로 붙인다
      if (!value) {
        const tail: string[] = [];
        while (tail.length < 3 && i + 1 < merged.length && !splitLabel(merged[i + 1].text) && merged[i + 1].text.length <= 80) {
          tail.push(merged[++i].text);
        }
        value = tail.join(", ");
      }
      if (!value) continue;
      const head = text.replace(/\s*[:：]\s*$/, "");
      units.push({ text: labeled.value ? text : `${head} : ${value}`, label: labeled.label, value, note });
      continue;
    }
    for (const sentence of splitKoreanSentences(text)) {
      units.push({ text: sentence, label: null, value: sentence, note });
    }
  }

  const useful = (unit: SummaryUnit) => !EMPTY_VALUE.test(unit.value.trim());
  // "지원자격 및 요건"·"교육대상자" 처럼 라벨 뒤에 말이 붙어도 같은 라벨로 본다
  const labelIn = (label: string, set: Set<string>) =>
    set.has(label) || [...set].some((l) => l.length >= 3 && label.startsWith(l));
  const byLabels = (set: Set<string>) =>
    units.find((u) => u.label !== null && labelIn(u.label, set) && useful(u));

  // 우선순위대로 앞의 두 개: 내용(없으면 서술 문장) → 대상 → 금액 → 일정(내용·문장이 없을 때만)
  const lead = byLabels(SUMMARY_CONTENT_LABELS) ?? units.find(isProseSentence);
  const ranked = [
    lead,
    byLabels(SUMMARY_TARGET_LABELS),
    byLabels(SUMMARY_MONEY_LABELS),
    lead ? undefined : byLabels(SUMMARY_SCHEDULE_LABELS),
  ];
  let picks = ranked.filter((u): u is SummaryUnit => Boolean(u)).slice(0, 2);
  // 마지막 폴백도 라벨 줄이나 서술 문장만 — 머리말·소제목("추진개요")·제목 같은 줄은 요약이 아니다
  if (picks.length === 0) {
    picks = units.filter((u) => useful(u) && (u.label !== null || isProseSentence(u))).slice(0, 2);
  }
  if (picks.length === 0) return { summary: "", licenseRestricted: false };

  let summary = picks[0].text;
  if (picks[1]) {
    const sep = /[.!?]$/.test(summary) ? " " : " · ";
    const both = `${summary}${sep}${picks[1].text}`;
    if (both.length <= maxChars) summary = both;
  }
  return { summary: clipSummary(summary, maxChars), licenseRestricted: false };
}

// ─── 상세 보강 (목록 항목 + 상세 값) ───

/**
 * 목록 항목에 상세 값을 입힌다 (순수 함수 — 테스트 대상).
 *  · 상세 OK: 주관 기관·접수 기간·교육기간·요약·대상·금액을 원문 값으로. 빈 칸은 목록 값 유지
 *  · 상세 없음/삭제/해석 불가: 목록 값만 — 시작일 미상, 주관 기관은 지역 표기, 요약 "",
 *    `detailMissing: true` (적재 시 미검증으로 남겨 다음 실행에서 다시 받는다)
 * 상태는 확정된 접수 기간과 KST 오늘로 다시 매긴다.
 */
export function applyRdaDetail(
  item: CrawledItem,
  parsed: RdaDetailParse | null,
  today: string,
): CrawledItem {
  const listingEnd = item.dateEnd && item.dateEnd !== UNKNOWN_DATE ? item.dateEnd : undefined;

  if (!parsed || parsed.kind !== "ok") {
    const window = resolveRdaWindow(undefined, undefined, listingEnd);
    return {
      ...item,
      organization: item.organization || listingOrganization(item.region),
      dateStart: window.start,
      dateEnd: window.end,
      status: windowStatus(window.start, window.end, today),
      summary: "",
      detailMissing: true,
    };
  }

  const d = parsed.detail;
  const window = resolveRdaWindow(d.dateStart, d.dateEnd, listingEnd);
  return {
    ...item,
    organization: d.organization || item.organization || listingOrganization(item.region),
    dateStart: window.start,
    dateEnd: window.end,
    status: windowStatus(window.start, window.end, today),
    operationStart: d.operationStart ?? item.operationStart,
    operationEnd: d.operationEnd ?? item.operationEnd,
    capacity: d.target || item.capacity,
    capacityCount: d.capacityCount ?? item.capacityCount ?? null,
    amount: d.amount || item.amount,
    summary: d.summary,
    detailMissing: false,
  };
}

export interface RdaDetailFetch {
  parsed: RdaDetailParse | null;
  linkStatus: LinkStatus;
}

/**
 * 상세 페이지 1건 GET + 해석. 이 응답이 곧 원문 링크 확인이다
 * (삭제된 게시글은 HTTP 200 이라 제목 검사만 하는 checkUrlHealth 는 "active"로 본다).
 */
export async function fetchRdaDetail(url: string, timeoutMs = 10000): Promise<RdaDetailFetch> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": RDA_UA },
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return { parsed: null, linkStatus: "broken" };
    const html = await res.text();
    const parsed = parseRdaDetailHtml(html);
    if (parsed.kind === "deleted" || isSoft404(html)) return { parsed, linkStatus: "broken" };
    if (parsed.kind === "unparsable") return { parsed, linkStatus: "unverified" };
    return { parsed, linkStatus: "active" };
  } catch {
    return { parsed: null, linkStatus: "unverified" };
  }
}

export interface RdaEnrichOptions {
  /** KST 오늘 (상태 재계산) */
  today: string;
  /** 상세 요청 상한 — URL 헬스체크 예산(MAX_URL_CHECKS_PER_TARGET)과 별개 */
  maxFetches?: number;
  /** 상세 단계 시간 예산 (ms) — Edge Function 150초 wall-clock 보호 */
  timeBudgetMs?: number;
  /** 동시 요청 수 — 원천 부하를 고려해 작게 */
  concurrency?: number;
  /** 행사(farm_events)처럼 운영 날짜가 없으면 적재할 수 없는 항목인가 */
  requireOperationDate?: boolean;
  /** 테스트 주입용 */
  fetchDetail?: (url: string) => Promise<RdaDetailFetch>;
  now?: () => number;
}

export interface RdaEnrichResult {
  /** 입력과 같은 순서. null = 적재하지 않음 (운영 날짜 없는 행사) */
  items: (CrawledItem | null)[];
  /** 상세 응답으로 확인한 원문 링크 상태 (예산 밖 = "unverified") */
  linkStatus: Map<string, LinkStatus>;
  /** 실제 상세 요청 수 */
  fetched: number;
  /** 요청했지만 상세 값을 못 얻은 수 (HTTP 오류·삭제·해석 불가·네트워크) */
  failed: number;
  /** 예산(건수·시간) 밖이라 요청하지 않은 수 */
  deferred: number;
  /** 운영 날짜가 없어 뺀 행사 수 */
  dropped: number;
}

/**
 * 적재할 RDA 항목만 상세 페이지로 보강한다.
 * 기본 예산: 상세 30건 · 70초 · 동시 2 (요청 1건 ≈ 1.3~4.7초 실측, 100KB).
 * 예산을 넘긴 항목은 요청하지 않고 목록 값(미상)으로 둔다 — 다음 실행에서 다시 받는다.
 */
export async function enrichRdaItems(
  items: CrawledItem[],
  options: RdaEnrichOptions,
): Promise<RdaEnrichResult> {
  const {
    today,
    maxFetches = 30,
    timeBudgetMs = 70_000,
    concurrency = 2,
    requireOperationDate = false,
    fetchDetail = (url: string) => fetchRdaDetail(url),
    now = Date.now,
  } = options;

  const startedAt = now();
  const results: (CrawledItem | null)[] = new Array(items.length).fill(null);
  const linkStatus = new Map<string, LinkStatus>();
  const inflight = new Map<string, Promise<RdaDetailFetch>>();
  let fetched = 0;
  let failed = 0;
  let deferred = 0;
  let dropped = 0;
  let cursor = 0;

  async function detailFor(url: string): Promise<RdaDetailParse | null> {
    const pending = inflight.get(url);
    if (pending) return (await pending).parsed;
    if (fetched >= maxFetches || now() - startedAt >= timeBudgetMs) {
      deferred++;
      if (!linkStatus.has(url)) linkStatus.set(url, "unverified");
      return null;
    }
    fetched++;
    const request = fetchDetail(url);
    inflight.set(url, request);
    const result = await request;
    linkStatus.set(url, result.linkStatus);
    if (!result.parsed || result.parsed.kind !== "ok") failed++;
    return result.parsed;
  }

  async function worker(): Promise<void> {
    while (cursor < items.length) {
      const index = cursor++;
      const item = items[index];
      const parsed = item.url ? await detailFor(item.url) : null;
      const merged = applyRdaDetail(item, parsed, today);
      if (requireOperationDate && !merged.operationStart) {
        dropped++;
        continue;
      }
      results[index] = merged;
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, () => worker()));
  return { items: results, linkStatus, fetched, failed, deferred, dropped };
}

// ═══════════════════════════════════════
// 2. RDA 행사·체험 크롤러 (키워드 기반)
// ═══════════════════════════════════════

const EVENT_KEYWORDS = ["박람회", "체험", "축제", "설명회", "멘토링", "현장방문", "견학"];

const EVENT_TYPE_MAP: Record<string, string> = {
  박람회: "박람회",
  체험: "일일체험",
  축제: "축제",
  설명회: "설명회",
  멘토링: "멘토링",
  현장방문: "일일체험",
  견학: "일일체험",
};

/**
 * 제목에서 행사 유형 추론
 */
export function inferEventType(title: string): string {
  for (const [kw, type] of Object.entries(EVENT_TYPE_MAP)) {
    if (title.includes(kw)) return type;
  }
  return "설명회";
}

/** 목록 항목 중 행사성 제목만 (제목 중복 제거) */
export function filterRdaEventItems(items: CrawledItem[]): CrawledItem[] {
  const seenTitles = new Set<string>();
  const out: CrawledItem[] = [];
  for (const item of items) {
    if (!EVENT_KEYWORDS.some((kw) => item.title.includes(kw))) continue;
    if (seenTitles.has(item.title)) continue;
    seenTitles.add(item.title);
    out.push({ ...item, eventType: inferEventType(item.title) });
  }
  return out;
}

/**
 * RDA 진행중 목록(분류 전체)에서 행사성 항목만 추린다.
 *
 * 2026-09-29 이전 구현은 `search_keyword`에 행사 키워드 7종을 넣어 7회 연속 POST 했지만
 * RDA 는 키워드 검색 시 "조회된 데이터가 없습니다"만 돌려줬다(수확 항상 0).
 * 지금은 키워드 없는 진행중 목록을 받아 **제목으로 직접 거른다**. 10/3 부터 페이지 수는
 * "총 N건"으로 정한다 — 범위 밖 cp 가 마지막 페이지를 다시 주던 헛요청(3회 → 2회)을 없앴다.
 * (실측: 9/29 진행중 28건 · 10/3 15건 중 행사 키워드 매칭 0건 — 체험·행사 공급은 그린대로 담당.)
 * 운영 날짜(교육기간)가 없는 행사는 sync-crawl 이 적재하지 않는다 (날짜를 추정하지 않는다).
 */
export async function fetchRdaEvents(maxPages = 3): Promise<CollectResult> {
  const listed = await fetchRdaListing({ search_ingState: "진행중" }, maxPages);
  const events = filterRdaEventItems(listed.items);
  // 목록이 정상인데 행사 제목이 없으면 정상 0건 — 목록 자체의 실패만 errors 로 넘긴다
  console.log(`[crawl] rda-events: 진행중 ${listed.items.length}건 중 ${events.length}건 매칭`);
  return { items: events, errors: listed.errors };
}

// ═══════════════════════════════════════
// 3. uni.agrix.go.kr JSON API 파서
// ═══════════════════════════════════════

export interface AgrixResult {
  rno?: number;
  sLawseq: number;
  sLawname: string;
  lawPname?: string;
  qualifyNm?: string | null;
  fundNm?: string | null;
  chrgkwaNm?: string | null;
  deptOrgn?: string | null;
  /** 접수 시작 월 "YYYYMM" — 10/4 실측 30건 중 4건 null */
  reqstpdBeginYm?: string | null;
  /** 접수 종료 월 "YYYYMM" */
  reqstpdEndYm?: string | null;
  /** 사업 연도 "2025" — 요청한 saupYear 와 같다 (10/4 실측 30/30) */
  lawYear?: string | null;
}

interface AgrixResponse {
  totCnt?: number;
  result?: AgrixResult[] | null;
  lgvResult?: AgrixResult[] | null;
}

const AGRIX_LIST_URL = "https://uni.agrix.go.kr/docs7/customizedNew/introduce/IntroduceSaupList.do";

/**
 * 접수 월 표기 → 날짜. "202505" → 시작 2025-05-01 / 종료 2025-05-31 (그 달 말일, KST 달력).
 * "YYYYMMDD"·"YYYY-MM"·"YYYY.MM" 도 받는다. 비었거나 달력에 없는 값은 undefined.
 */
export function agrixMonthDate(value: string | null | undefined, edge: "start" | "end"): string | undefined {
  const digits = (value ?? "").replace(/[^\d]/g, "");
  if (digits.length !== 6 && digits.length !== 8) return undefined;
  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6));
  if (year < 2000 || year > 2100 || month < 1 || month > 12) return undefined;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  let day = edge === "start" ? 1 : lastDay;
  if (digits.length === 8) {
    day = Number(digits.slice(6, 8));
    if (day < 1 || day > lastDay) return undefined;
  }
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${String(day).padStart(2, "0")}`;
}

/**
 * agrix 접수 기간 → 확정 창. 규칙은 `resolveRdaWindow` 와 같다:
 * 종료 월을 모르면 9999 페어(공고 미발표), 시작 월만 모르면 시작 미상(9999) + 종료일.
 * 수집일로 채우지 않는다 (10/3 이전엔 30행 전부 "수집일 ~ 수집일 / 마감"이었다).
 */
export function agrixWindow(
  beginYm: string | null | undefined,
  endYm: string | null | undefined,
): { start: string; end: string } {
  return resolveRdaWindow(agrixMonthDate(beginYm, "start"), agrixMonthDate(endYm, "end"), undefined);
}

/**
 * agrix 주관 기관 = 같은 레코드의 소관 부처(deptOrgn) + 담당 과(chrgkwaNm).
 * 10/4 실측: deptOrgn 30/30 "농림축산식품부", chrgkwaNm 은 "농촌경제과"·"공익직불정책과" 같은 과·팀 이름이라
 * 과 이름만으로는 어느 기관인지 알 수 없었다. 부처는 원천 값을 그대로 쓴다(하드코딩하지 않는다).
 * 담당이 여럿이면 원문 "축산환경자원과,전략작물육성팀" → "축산환경자원과·전략작물육성팀".
 */
export function agrixOrganization(raw: AgrixResult): string {
  const ministry = (raw.deptOrgn ?? "").trim();
  const division = (raw.chrgkwaNm ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .join("·");
  return [ministry, division].filter(Boolean).join(" ") || "농림축산식품부";
}

/**
 * agrix 응답 1건 → CrawledItem (순수 함수 — 테스트 대상). 적재하지 않을 항목이면 null.
 *  · 접수 월이 없으면(종료 월을 모르면) null — 10/4 CoS 결정. saupYear 폴백으로 받은 작년 목록이라
 *    9999 페어("공고 발표 예정")는 사실이 아니고, 실측 4건 중 2건은 농업인 대상이 아닌 시스템 구축 사업이었다
 *  · 제목은 원문 그대로 — slug 가 제목 해시라 끝 공백 하나만 다듬어도 기존 행과 갈라진다
 *    ("노후 농업기계 미세먼지 저감대책 지원사업 " 실측)
 *  · `year` 는 실제로 받은 목록 연도 (폴백이면 작년)
 */
export function mapAgrixItem(raw: AgrixResult, today: string, listYear: number): CrawledItem | null {
  const window = agrixWindow(raw.reqstpdBeginYm, raw.reqstpdEndYm);
  if (window.end === UNKNOWN_DATE) return null;
  return {
    title: raw.sLawname,
    url: `https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=${raw.sLawseq}`,
    region: "전국",
    organization: agrixOrganization(raw),
    status: windowStatus(window.start, window.end, today),
    dateStart: window.start,
    dateEnd: window.end,
    capacity: raw.qualifyNm ?? undefined,
    year: listYear,
  };
}

/**
 * agrix 응답 → 고유 항목. `result` 와 `lgvResult` 는 같은 목록을 두 번 준다
 * (10/4 실측: 30건 완전 동일) — sLawseq 로 한 번만 남긴다.
 */
export function uniqueAgrixResults(json: AgrixResponse): AgrixResult[] {
  const seen = new Set<number>();
  const out: AgrixResult[] = [];
  for (const raw of [...(json.result ?? []), ...(json.lgvResult ?? [])]) {
    if (!raw || typeof raw.sLawname !== "string" || seen.has(raw.sLawseq)) continue;
    seen.add(raw.sLawseq);
    out.push(raw);
  }
  return out;
}

/**
 * uni.agrix.go.kr API에서 지원사업 목록 조회
 *
 * 주의:
 * - saupYear 필수 (사이트에 표시되는 연도만 유효, 보통 현재~1년 전)
 * - concern2="농림축산식품부" 기본값 (지자체: "지자체")
 * - 10/4 실측: saupYear 2026 → totCnt 0, 2025 → totCnt 371 (pageSize 30 이라 앞 30건만)
 *
 * 실패를 0건으로 삼키지 않는다 (10/4):
 *  · 요청 실패(재시도 후)·JSON 아님 → errors
 *  · totCnt > 0 인데 목록 0건 → errors
 *  · 올해·작년 모두 0건 → errors (농식품부 사업 목록이 통째로 빌 수는 없다 — 파라미터·형식 변경 의심)
 *  · 접수 월이 없는 항목은 적재하지 않고 건수만 로그 — 받은 목록이 전부 그래서 0건이면 errors
 */
export async function fetchAgrixPrograms(
  page = 1,
  pageSize = 30
): Promise<CollectResult> {
  const today = kstToday();
  const currentYear = Number(today.slice(0, 4));
  const yearsToTry = [currentYear, currentYear - 1];

  for (const year of yearsToTry) {
    const formData = new URLSearchParams({
      concern1: "",
      concern2: "농림축산식품부",
      deptOrgn: "",
      saupYear: String(year),
      reqBegYear: "",
      reqBegMonth: "",
      reqEndYear: "",
      reqEndMonth: "",
      searchKeyword: "",
      pageIndex: String(page),
      pageSize: String(pageSize),
    });

    let json: AgrixResponse;
    try {
      const res = await fetchWithRetry(
        AGRIX_LIST_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Requested-With": "XMLHttpRequest",
            "User-Agent": CRAWL_UA,
          },
          body: formData.toString(),
        },
        { timeoutMs: 15_000, retryTimeoutMs: 25_000, backoffMs: 10_000 },
      );
      json = (await res.json()) as AgrixResponse;
    } catch (err) {
      return { items: [], errors: [`agrix ${year}년 목록 요청 실패${describeFailure(err, true)}`] };
    }

    const results = uniqueAgrixResults(json);
    if (results.length > 0) {
      const items = results
        .map((raw) => mapAgrixItem(raw, today, year))
        .filter((item): item is CrawledItem => item !== null);
      const skipped = results.length - items.length;
      console.log(
        `[crawl] agrix: ${year}년 ${results.length}건 중 ${items.length}건 적재 — 접수 월 없음 ${skipped}건 제외 (totCnt ${json.totCnt ?? "?"})`,
      );
      if (items.length === 0) {
        // 전부 건너뛰어 0건 — "올해·작년 모두 0건"과 같은 취지로 실패 (원천 형식 변경 의심)
        return {
          items: [],
          errors: [`agrix ${year}년: ${results.length}건 모두 접수 월이 없어 적재 0건 — 응답 형식 변경 의심`],
        };
      }
      return { items, errors: [] };
    }
    if ((json.totCnt ?? 0) > 0) {
      return {
        items: [],
        errors: [`agrix ${year}년: totCnt ${json.totCnt}인데 목록 0건 — 응답 형식 변경 의심`],
      };
    }
    console.log(`[crawl] agrix: ${year}년 데이터 없음, 이전 연도 시도`);
  }

  return {
    items: [],
    errors: [`agrix ${yearsToTry.join("·")}년 모두 0건 — 연도 파라미터·응답 형식 변경 의심`],
  };
}

// ═══════════════════════════════════════
// 공통 유틸
// ═══════════════════════════════════════

/**
 * 제목 기반 deterministic slug 생성
 */
export function crawlSlug(source: string, title: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < title.length; i++) {
    hash ^= title.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, "0");
  return `crawl-${source}-${hex}`.slice(0, 50);
}
