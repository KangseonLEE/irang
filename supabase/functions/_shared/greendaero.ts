/**
 * 그린대로(greendaero.go.kr) 수집기 — 지자체 귀농귀촌 프로그램
 *
 * 배경 (2026-09-29 회장 결재 C안):
 *  기존 수집 경로 3종(RDA 똑똑!청년농부 · agrix · RDA 행사)에는
 *  **지자체 귀농귀촌지원센터가 직접 운영하는 교육·체험 프로그램이 한 건도 없다.**
 *  농식품부 그린대로는 그 프로그램을 전국 단위로 이미 집계하고 있고
 *  공개 JSON 엔드포인트를 제공한다.
 *
 * ── 사전 검증 4종 (data-engineer 가드) ────────────────────────────
 * API: 그린대로 통합교육신청 목록
 *   GET https://www.greendaero.go.kr/svc/rfph/edc/offline/getEdcList.do
 *   갱신 주기: 상시 (지자체·교육기관이 수시 등록)
 *   만료일: 없음 (키 불필요, 공개 GET)
 *   Rate limit: 명시 없음. itemsPerPage=200 1회 ≈ 550KB / 7초 →
 *               일 1회 sync-data cron에서 최대 3페이지만 호출
 *   역사 가용성: 2023-03 ~ (2026-09-29 실측 totalItems 2,627)
 *
 * API: 그린대로 농촌에서 살아보기 운영마을
 *   GET https://www.greendaero.go.kr/svc/rfph/edc/live/apply/list.do?search_mode=1
 *   갱신 주기: 상시 (연 단위 마을 공모 + 수시 모집)
 *   만료일: 없음
 *   Rate limit: 명시 없음. items_per_page=400 1회 ≈ 186KB / 1.3초
 *   역사 가용성: 2022-02 ~ (2026-09-29 실측 cnt 302)
 *
 * ── 분류 규칙 ────────────────────────────────────────────────────
 *  · getEdcList 결과 중 체험형(디딤돌·마실·짝꿍·팸투어·한달살기·체험학교·견학)
 *    → farm_events. "체험교육"처럼 실습이 붙은 강의형은 제외한다.
 *  · 나머지 강의형 → education_courses
 *  · live/apply 결과 전체(농촌에서 살아보기) → farm_events
 *  한 항목은 반드시 한 테이블에만 들어간다 (G-1: 교육 ∩ 행사 = ∅).
 *
 * ── 알려진 함정 ──────────────────────────────────────────────────
 *  · 지역이 `eduspntdBaddr`(도로명 주소)에만 있고 약칭·정식·신표기가 뒤섞인다.
 *    → `normalizeRegion()`(region.ts)으로 SSOT 귀결.
 *  · `eduCrseId`는 회차 간 공유된다. 슬러그는 반드시 `eduDetailCrseId` 기준.
 *  · 그린대로 접수 종료일이 지자체 원문 공고와 어긋나는 사례가 있다
 *    (2026-09-29 실측: 연천 마실짝꿍 그린대로 ~10/09 vs 원문 ~09/28).
 *    → 본문에 "접수 마감일은 원문 공고 확인" 문구를 항상 덧붙인다.
 *  · 살아보기 상세는 POST form submit 전용이라 딥링크가 없다 → 목록 URL + 안내 문구.
 */

import type { CrawledItem } from "./crawl-utils.ts";

const BASE = "https://www.greendaero.go.kr";

const EDU_LIST_URL = `${BASE}/svc/rfph/edc/offline/getEdcList.do`;
const EDU_DETAIL_URL = `${BASE}/svc/rfph/edc/offline/front/applicationDetail.do`;
const EDU_REFERER = `${BASE}/svc/rfph/edc/offline/front/applicationList.do`;

const LIVE_LIST_URL = `${BASE}/svc/rfph/edc/live/apply/list.do`;
const LIVE_PAGE_URL = `${BASE}/svc/rfph/edc/live/front/apply/list.do`;
/** 마을 대표 사진 — 목록 JSON 의 thumb_file_id 로 조립 (9/30 실측: 원본 5472px JPEG, Referer 무관 200) */
const LIVE_IMG_URL = (fileId: string) => `${BASE}/svc/common/board/img/${encodeURIComponent(fileId)}.do`;

const UA =
  "Mozilla/5.0 (compatible; irang-datasync/1.0; +https://irangfarm.com)";

/** 접수 마감일 불일치 대비 상시 안내 (연천 마실짝꿍 사례) */
export const SOURCE_NOTE =
  "그린대로(농식품부) 집계 기준이에요. 접수 마감일·세부 조건은 원문 공고를 꼭 확인하세요.";

/**
 * 체험형 판별 키워드 — 강의형(education)과 가르는 유일한 기준.
 *
 * ⚠ 맨 "체험"·"투어"는 쓰지 않는다. "농업일자리 **체험교육**"처럼
 *   실습이 붙은 강의형이 통째로 행사로 새어 나간다(2026-09-29 실측 25건).
 *   숙박·현장 체류를 뜻하는 구체 표현만 남긴다.
 */
const EXPERIENCE_KEYWORDS = [
  "디딤돌",
  "마실",
  "짝꿍",
  "팸투어",
  "팜투어",
  "살아보기",
  "한달살기",
  "한달살이",
  "한 달 살기",
  "농촌 한 달",
  "한 달 체험",
  "한달 체험",
  "귀농귀촌체험",
  "귀농귀촌 체험",
  "농촌체험",
  "농촌 체험",
  "체험학교",
  "견학",
  "현장방문",
  "축제",
  "박람회",
];

/** 체험형 중 유형 세분 — farm_events.type 허용값으로만 매핑 */
const EVENT_TYPE_RULES: readonly (readonly [string, string])[] = [
  ["박람회", "박람회"],
  ["축제", "축제"],
  ["설명회", "설명회"],
  ["멘토링", "멘토링"],
  // 숙박·장기 체류형
  ["살아보기", "팜스테이"],
  ["디딤돌", "팜스테이"],
  ["마실", "팜스테이"],
  ["짝꿍", "팜스테이"],
  ["한달", "팜스테이"],
  ["한 달", "팜스테이"],
  ["체험학교", "팜스테이"],
  // 당일형
  ["팸투어", "일일체험"],
  ["팜투어", "일일체험"],
  ["견학", "일일체험"],
  ["현장방문", "일일체험"],
];

// ─── 그린대로 응답 타입 (실측 필드만) ───

interface GdEduItem {
  ednstNm?: string | null;
  eduCrseId?: string | null;
  eduDetailCrseId?: string | null;
  eduDetailCrseNm?: string | null;
  atpnCn?: string | null;
  eduspntdBaddr?: string | null;
  eduRcrtBgngDt?: string | null;
  eduRcrtEndDt?: string | null;
  eduBgngYmd?: string | null;
  eduEndYmd?: string | null;
  eduOperSeNm?: string | null;
  eduSeNm?: string | null;
  eduTypeNm?: string | null;
  planNope?: string | null;
  eduHrsmnNo?: number | null;
}

interface GdEduResponse {
  page: number;
  itemsPerPage: number;
  totalItems: number;
  list: GdEduItem[];
}

interface GdLiveItem {
  vlg_oper_mngno?: string | null;
  vlg_mngno?: string | null;
  vlg_nm?: string | null;
  sgg_nm?: string | null;
  vlg_type_cd?: string | null;
  vlg_type_dtl_cd?: string | null;
  vlg_state?: number | null;
  aply_bgng_ymd?: string | null;
  aply_end_ymd?: string | null;
  oper_bgng_ymd?: string | null;
  oper_end_ymd?: string | null;
  mvn_psblty_ymd?: string | null;
  rcrt_nope?: string | null;
  vlg_rcrt_hshld_cnt?: string | null;
  thumb_file_id?: string | null;
}

interface GdLiveResponse {
  cnt: number;
  list: GdLiveItem[] | null;
}

/** 마을유형 코드 → 라벨 (WVX064, 2026-09-29 실측) */
const VILLAGE_TYPE: Record<string, string> = {
  TOTY01: "귀농형",
  TOTY02: "귀촌형",
  TOTY03: "프로젝트형",
};

// ─── 공통 유틸 ───

/** "20260930" → "2026-09-30". 이미 하이픈이면 그대로. 빈 값이면 undefined */
export function toIsoDate(value: string | null | undefined): string | undefined {
  const v = (value ?? "").trim();
  if (!v) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  if (/^\d{8}$/.test(v)) return `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;
  return undefined;
}

/** 접수 기간 → 상태. 기간이 비면 "모집중"으로 두지 않고 "모집예정" */
export function statusFromWindow(
  start: string | undefined,
  end: string | undefined,
  today: string,
): "모집중" | "모집예정" | "마감" {
  if (start && today < start) return "모집예정";
  if (end && today > end) return "마감";
  if (!start && !end) return "모집예정";
  return "모집중";
}

/** 체험형인지 — 제목·부제·과정 구분 전체를 훑는다 */
export function isExperienceProgram(...parts: (string | null | undefined)[]): boolean {
  const haystack = parts.filter(Boolean).join(" ");
  return EXPERIENCE_KEYWORDS.some((kw) => haystack.includes(kw));
}

/** 체험형 세부 유형 → farm_events.type */
export function resolveEventType(...parts: (string | null | undefined)[]): string {
  const haystack = parts.filter(Boolean).join(" ");
  for (const [kw, type] of EVENT_TYPE_RULES) {
    if (haystack.includes(kw)) return type;
  }
  return "일일체험";
}

/** 운영 형태 문자열 → education_courses.type */
export function resolveEducationType(
  operSeNm: string | null | undefined,
): "온라인" | "오프라인" | "혼합" {
  const v = operSeNm ?? "";
  const hasOnline = v.includes("비대면");
  // ⚠ "비대면교육".includes("대면교육") === true — 부분 문자열로 보면
  //   순수 비대면 과정이 전부 "혼합"으로 잘못 분류된다. 앞 글자가 "비"가 아닐 때만 대면.
  const hasOffline =
    v.includes("오프라인") || v.includes("현장실습") || /(^|[^비])대면/.test(v);
  if (hasOnline && hasOffline) return "혼합";
  if (hasOnline) return "온라인";
  return "오프라인";
}

/**
 * 제목 조립 — "사업명 · 프로그램명".
 * `atpnCn`(회차 안내)이 사업명과 사실상 같으면 중복을 만들지 않는다.
 */
export function buildEduTitle(
  courseName: string | null | undefined,
  detailNote: string | null | undefined,
): string {
  const base = (courseName ?? "").replace(/\s+/g, " ").trim();
  const extra = (detailNote ?? "").replace(/\s+/g, " ").trim();
  if (!base) return extra.slice(0, 160);
  if (!extra) return base.slice(0, 160);

  const squash = (s: string) => s.replace(/[\s·_\-()[\]]/g, "");
  if (squash(extra).includes(squash(base)) || squash(base).includes(squash(extra))) {
    // 한쪽이 다른 쪽을 포함하면 더 구체적인(긴) 쪽만 쓴다
    return (extra.length >= base.length ? extra : base).slice(0, 160);
  }
  return `${base} · ${extra}`.slice(0, 160);
}

/** 제목+주관+접수기간 기준 중복 키 (check-program-dup과 같은 기준) */
export function dedupKey(item: CrawledItem): string {
  const title = item.title.replace(/[\s·_\-()[\]]/g, "");
  const org = (item.organization ?? "").replace(/\s+/g, "");
  return `${title}|${org}|${item.dateStart ?? ""}|${item.dateEnd ?? ""}`;
}

async function getJson<T>(url: string, referer: string, timeoutMs: number): Promise<T | null> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json, text/plain, */*",
      "X-Requested-With": "XMLHttpRequest",
      Referer: referer,
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    console.error(`[greendaero] ${url} → HTTP ${res.status}`);
    return null;
  }
  const text = await res.text();
  if (!text.trimStart().startsWith("{")) {
    // 경로가 바뀌면 200 + 랜딩 HTML이 돌아온다 (소프트 404). 조용히 실패하지 않게 로그.
    console.error(`[greendaero] ${url} → JSON이 아님 (HTML 응답, ${text.length}바이트)`);
    return null;
  }
  return JSON.parse(text) as T;
}

// ═══════════════════════════════════════
// 1. 통합교육신청 (강의형 + 체험형 혼재)
// ═══════════════════════════════════════

/** GdEduItem → CrawledItem. 분류(category)까지 항목 단위로 결정한다. */
export function mapEduItem(raw: GdEduItem, today: string): CrawledItem | null {
  const detailId = (raw.eduDetailCrseId ?? "").trim();
  const courseId = (raw.eduCrseId ?? "").trim();
  if (!detailId || !courseId) return null;

  const title = buildEduTitle(raw.eduDetailCrseNm, raw.atpnCn);
  if (title.length < 3) return null;

  const applyStart = toIsoDate(raw.eduRcrtBgngDt);
  const applyEnd = toIsoDate(raw.eduRcrtEndDt);
  const status = statusFromWindow(applyStart, applyEnd, today);

  const experience = isExperienceProgram(
    raw.eduDetailCrseNm,
    raw.atpnCn,
    raw.eduTypeNm,
    raw.eduSeNm,
  );

  const planNope = Number.parseInt(raw.planNope ?? "", 10);
  const educationType = experience ? undefined : resolveEducationType(raw.eduOperSeNm);

  // 순수 비대면 과정의 주소는 교육기관 본사(대개 서울)라 수강 지역이 아니다.
  // 지역 필터에서 "서울 과정"으로 오인되지 않도록 전국 버킷에 둔다.
  const region = educationType === "온라인" ? "전국" : (raw.eduspntdBaddr ?? "전국");

  return {
    title,
    url: `${EDU_DETAIL_URL}?seq1=${encodeURIComponent(courseId)}&seq2=${encodeURIComponent(detailId)}`,
    region,
    organization: (raw.ednstNm ?? "").trim() || "그린대로 등록 교육기관",
    status,
    dateStart: applyStart,
    dateEnd: applyEnd,
    capacity: raw.eduSeNm ?? undefined,
    sourceKey: detailId,
    category: experience ? "events" : "education",
    eventType: experience
      ? resolveEventType(raw.eduDetailCrseNm, raw.atpnCn, raw.eduTypeNm, raw.eduSeNm)
      : undefined,
    operationStart: toIsoDate(raw.eduBgngYmd),
    operationEnd: toIsoDate(raw.eduEndYmd),
    capacityCount: Number.isFinite(planNope) ? planNope : null,
    educationType,
    note: SOURCE_NOTE,
  };
}

/**
 * 그린대로 통합교육신청 목록 수집.
 * 접수가 열려 있거나 예정인 건만 남긴다 (마감은 버린다).
 *
 * @param maxPages 페이지 수 (1페이지 = 200건, 기본 3페이지 = 600건)
 */
export async function fetchGreendaeroEducation(
  maxPages = 3,
  itemsPerPage = 200,
): Promise<CrawledItem[]> {
  const today = new Date().toISOString().slice(0, 10);
  const collected: CrawledItem[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= maxPages; page++) {
    let json: GdEduResponse | null = null;
    try {
      json = await getJson<GdEduResponse>(
        `${EDU_LIST_URL}?page=${page}&itemsPerPage=${itemsPerPage}`,
        EDU_REFERER,
        20000,
      );
    } catch (err) {
      console.error(`[greendaero] 교육 ${page}페이지 실패:`, err);
      break;
    }
    if (!json || !Array.isArray(json.list) || json.list.length === 0) break;

    const before = collected.length;
    for (const raw of json.list) {
      const item = mapEduItem(raw, today);
      if (!item) continue;
      if (item.status === "마감") continue;
      const key = dedupKey(item);
      if (seen.has(key)) continue;
      seen.add(key);
      collected.push(item);
    }

    console.log(
      `[greendaero] 교육 ${page}/${maxPages}페이지: 원본 ${json.list.length}건 → 누적 활성 ${collected.length}건 (totalItems ${json.totalItems})`,
    );

    if (json.list.length < itemsPerPage) break;
    // 목록은 교육 시작일 오름차순이라 접수 중인 건은 앞쪽에 몰린다.
    // 한 페이지가 아무것도 보태지 못하면 뒤 페이지도 마찬가지다 (실측: 2·3페이지 0건 / 16초).
    if (collected.length === before) break;
  }

  return collected;
}

// ═══════════════════════════════════════
// 2. 농촌에서 살아보기 (전건 체험형)
// ═══════════════════════════════════════

/** GdLiveItem → CrawledItem */
export function mapLiveItem(raw: GdLiveItem, today: string): CrawledItem | null {
  const villageName = (raw.vlg_nm ?? "").trim();
  const operNo = (raw.vlg_oper_mngno ?? "").trim();
  if (!villageName || !operNo) return null;

  const typeLabel = VILLAGE_TYPE[raw.vlg_type_cd ?? ""] ?? "";
  const applyStart = toIsoDate(raw.aply_bgng_ymd);
  const applyEnd = toIsoDate(raw.aply_end_ymd);
  const rcrt = Number.parseInt(raw.rcrt_nope ?? "", 10);
  const households = Number.parseInt(raw.vlg_rcrt_hshld_cnt ?? "", 10);
  const thumb = (raw.thumb_file_id ?? "").trim();

  return {
    title: typeLabel
      ? `${villageName} 농촌에서 살아보기 (${typeLabel})`
      : `${villageName} 농촌에서 살아보기`,
    // 살아보기 상세는 POST form submit 전용이라 딥링크가 없다 → 목록 페이지로 보낸다
    url: LIVE_PAGE_URL,
    region: raw.sgg_nm ?? "전국",
    // 주최는 시·군만 — 원문 sgg_nm 은 "전남광주통합특별시 강진군"처럼 SSOT 밖 시·도 표기가 섞인다(9/30 QA)
    organization: (raw.sgg_nm ?? "").trim().split(/\s+/).pop() || "농림축산식품부",
    status: statusFromWindow(applyStart, applyEnd, today),
    dateStart: applyStart,
    dateEnd: applyEnd,
    capacity: typeLabel ? `농촌에서 살아보기 ${typeLabel}` : "농촌에서 살아보기",
    sourceKey: operNo,
    category: "events",
    eventType: "팜스테이",
    operationStart: toIsoDate(raw.oper_bgng_ymd),
    operationEnd: toIsoDate(raw.oper_end_ymd),
    capacityCount: Number.isFinite(rcrt) ? rcrt : null,
    imageUrl: /^att-[0-9a-f]{32}$/i.test(thumb) ? LIVE_IMG_URL(thumb) : undefined,
    moveInDate: toIsoDate(raw.mvn_psblty_ymd),
    households: Number.isFinite(households) ? households : null,
    villageType: typeLabel || undefined,
    note: `${SOURCE_NOTE} 마을별 상세는 그린대로 '농촌에서 살아보기' 목록에서 확인하세요.`,
  };
}

/**
 * 농촌에서 살아보기 운영마을 수집.
 * `vlg_state` 3(모집완료)은 접수 기간으로도 마감이라 status 필터에서 함께 걸러진다.
 */
export async function fetchGreendaeroLive(itemsPerPage = 400): Promise<CrawledItem[]> {
  const today = new Date().toISOString().slice(0, 10);
  let json: GdLiveResponse | null = null;
  try {
    json = await getJson<GdLiveResponse>(
      `${LIVE_LIST_URL}?search_mode=1&page=1&items_per_page=${itemsPerPage}&searchText=`,
      LIVE_PAGE_URL,
      20000,
    );
  } catch (err) {
    console.error("[greendaero] 살아보기 목록 실패:", err);
    return [];
  }
  if (!json || !Array.isArray(json.list)) return [];

  const collected: CrawledItem[] = [];
  const seen = new Set<string>();
  for (const raw of json.list) {
    const item = mapLiveItem(raw, today);
    if (!item) continue;
    if (item.status === "마감") continue;
    const key = dedupKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    collected.push(item);
  }

  console.log(
    `[greendaero] 살아보기: 원본 ${json.list.length}건 → 활성 ${collected.length}건 (cnt ${json.cnt})`,
  );
  return collected;
}
