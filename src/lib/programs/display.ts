import { formatAgeRange, splitSentences } from "@/lib/format";

/**
 * 지원사업 카드·목록 표시용 값 정리.
 *
 * 수집(crawl-*) 행의 요약은 "똑똑!청년농부 지원사업에서 수집했어요." · "농림부 통합 지원사업에서 수집했어요." ·
 * 옛 표기 "…에서 수집. 상세 내용은 원문을 확인하세요." 처럼 **출처 문장뿐**이라 카드에서 정보량이 0 이었다
 * (10/3 실측 수집 행 91건 전부). 체험 카드의 `meaningfulCost` 와 같은 원칙 — 채움 문장은 걷어 내고, 남는 게 없으면
 * 요약 줄을 숨긴다. 수집기가 요약을 원문 내용으로 채우게 바뀌어도(10/3) 기존 행을 위한 안전망으로 둔다.
 */

/** 수집 출처 문장 — "○○에서 수집했어요." / 옛 표기 "○○에서 수집." / "○○에서 수집된 교육과정입니다." (문장 전체가 이것일 때만) */
const PROVENANCE_SENTENCE = /^[^.。]*에서\s*수집(?:했어요|했습니다|하였습니다|함|됨|된[^.。]*)?\s*[.。]?$/;

/** 집계 출처 안내 — "그린대로(농식품부) 집계 기준이에요." */
const SOURCE_NOTE_SENTENCE = /^[^.。]*집계\s*기준이에요\s*[.。]?$/;

/**
 * 안내 채움 문장 — "상세 내용은 원문을 확인하세요." · "상세 공고 참조" · "자세한 사항은 공고문을 참고하세요." ·
 * "접수 마감일·세부 조건은 원문 공고를 꼭 확인하세요."(10/4 — 교육 수집 행 105건)
 */
const FILLER_SENTENCE =
  /^(?:(?:상세|자세한)[^.。]*(?:확인|참조|참고)|[^.。]*원문\s*(?:공고|게시글|게시물|페이지)를?\s*(?:꼭\s*)?(?:확인|참고|참조))[^.。]*[.。]?$/;

function isBoilerplate(sentence: string): boolean {
  return PROVENANCE_SENTENCE.test(sentence) || SOURCE_NOTE_SENTENCE.test(sentence) || FILLER_SENTENCE.test(sentence);
}

/**
 * 카드에 보일 만한 요약 — 출처·안내 채움 문장을 빼고 남는 글. 남는 게 없으면 null(요약 줄을 그리지 않는다).
 * 걷어 낼 문장이 없으면 원문을 그대로 돌려준다(문장 나누기로 공백·소수점이 바뀌지 않게).
 */
export function meaningfulProgramSummary(summary: string | null | undefined): string | null {
  const text = summary?.trim();
  if (!text) return null;
  const sentences = splitSentences(text);
  const kept = sentences.filter((sentence) => !isBoilerplate(sentence));
  if (kept.length === sentences.length) return text;
  return kept.length > 0 ? kept.join(" ") : null;
}

/** 수집(crawl-*) 행인가 — DB 수집기(sync-crawl)가 만든 행만 이 접두로 시작한다 */
export function isCrawledRow(id: string | null | undefined): boolean {
  return !!id && id.startsWith("crawl-");
}

/**
 * RDA API 폴백 행인가 — Supabase 가 실패할 때 농진청 API 응답을 매핑한 행이다.
 * 지원사업 `rda-{seq}`(lib/data/programs.ts mapRdaPolicy) · 교육 `rda-edu-{seq}`(lib/data/education.ts mapRdaEdu).
 * 수집 행처럼 원문에 없는 칸(지원 유형·연령·수준·방식)을 매핑이 같은 기본값으로 채운다.
 */
function isRdaApiRow(id: string | null | undefined): boolean {
  return !!id && id.startsWith("rda-");
}

/**
 * 원문 대신 수집기·API 매핑이 칸을 채운 행인가 — **표시·목록 필터·맞춤 점수가 모두 이 함수 하나로 판정한다** (10/6 QA R2).
 * 종전엔 표시가 `isCrawledRow`(crawl-* 만), 필터가 programs.ts `hasCollectorDefaults`·education.ts `isLevelUnknown`
 * (crawl-* + rda-*)로 따로 판정해 RDA API 폴백 행에서 둘이 갈라졌다 — 화면은 "보조금"을 보여 주는데 필터는 '모름'으로 뺐다.
 * 이 행들의 기본값·채움값은 화면에 싣지 않고(아래 display*), 필터에선 '모름'으로, 맞춤 점수에선 중립으로 다룬다.
 */
export function hasCollectorDefaults(id: string | null | undefined): boolean {
  return isCrawledRow(id) || isRdaApiRow(id);
}

/**
 * 화면에 보일 요약·설명 — **수집 행(수집기·API 매핑 행)만** 상투 문장을 걷어 낸다. 손으로 쓴 큐레이션 문장은 그대로 둔다
 * (10/4 QA: SP-044 설명 끝의 "자세한 조건과 집 상태는 공고에 붙은 설명 자료에서 확인할 수 있어요."가
 * 안내 채움 문장 규칙에 걸려 상세에서 사라졌다). 값이 비면 null — 호출부는 줄째 그리지 않는다.
 */
export function displayText(id: string | null | undefined, text: string | null | undefined): string | null {
  if (hasCollectorDefaults(id)) return meaningfulProgramSummary(text);
  const value = text?.trim();
  return value ? value : null;
}

/** 원문 칸이 비어 수집기·큐레이션이 넣은 채움값 — "상세 공고 참조"·"추후 공지"·"확인 필요" 등 */
const FILLER_VALUE = /(참조|참고|미정|추후|별도\s*안내|확인\s*필요|문의)/;

/** 비용·금액 칸에 쓸 값 — 채움값이면 null. 체험 카드(event-fields.meaningfulCost)가 이 규칙을 그대로 쓴다 */
export function meaningfulValue(value: string | null | undefined): string | null {
  const v = value?.trim();
  if (!v) return null;
  return FILLER_VALUE.test(v) ? null : v;
}

/**
 * 한 칸짜리 값(자격 조건·교육 기간·일정·대상·비용 등) — **수집 행만** 채움값("상세 공고 참조"·"추후 공지")을 비운다.
 * 큐레이션 값은 그대로 둔다(10/4 ED-008 "입교비 소정 (확인 필요)" 회귀 — displayText 와 같은 원칙). 값이 비면 null.
 */
export function displayValue(id: string | null | undefined, value: string | null | undefined): string | null {
  if (hasCollectorDefaults(id)) return meaningfulValue(value);
  const v = value?.trim();
  return v ? v : null;
}

/**
 * 지원사업·교육의 비용·금액 칸 — **수집 행만** 채움값을 비운다. 큐레이션 값은 그대로
 * (10/4: ED-008 "입교비 소정 (확인 필요)"가 채움값 규칙에 걸려 교육 카드에서 사라졌다 — displayText 와 같은 원칙).
 */
export function displayAmount(id: string | null | undefined, value: string | null | undefined): string | null {
  return displayValue(id, value);
}

/* ── 수집기 기본값 (10/6 QA Q1-F2·Q1-W4·Q4-W4·R2) ──────────────────────────────
 * 수집기(supabase/functions/sync-crawl)와 RDA API 매핑은 원문에 없는 칸을 **같은 값으로 일괄** 채운다(10/6 DB 실측).
 *   - 지원사업: support_type "보조금", eligibility_age 18~65 — 수집 91행이 전부 같은 값.
 *     본문이 "만18세 이상 ~ 만45세 미만 청년농업인"인 공고가 화면·JSON-LD 에 "만 18~65세"로 나갔다.
 *   - 교육: level "초급"(수집 242행 전부), type "오프라인"(그린대로 외 원천 — RDA 95행 전부), capacity null(정원 미상).
 *     "온라인 교육"이 "오프라인·초급 정착 교육"으로, 정원을 모르는 과정이 "제한 없음"으로 읽혔다.
 * 원문에서 온 값이 아니므로 **수집 행에선 칸째 숨긴다**. 큐레이션 행은 손으로 확인한 값이라 그대로 둔다.
 * 판정은 전부 `hasCollectorDefaults` — 목록 필터(lib/data/programs.ts·education.ts)와 맞춤 점수(lib/data/persona-fit.ts)도 같은 함수다.
 */

/** 지원 유형 — 수집 행은 기본값 "보조금"뿐이라 null (배지·표·JSON-LD serviceType 에 싣지 않는다) */
export function displaySupportType<T extends string>(id: string | null | undefined, type: T | null | undefined): T | null {
  if (hasCollectorDefaults(id)) return null;
  return type || null;
}

/** 대상 연령 라벨 — 수집 행은 기본값 18~65 라 null. 큐레이션은 `formatAgeRange` 그대로("만 18~39세") */
export function displayAgeRange(
  id: string | null | undefined,
  min: number | null | undefined,
  max: number | null | undefined,
): string | null {
  if (hasCollectorDefaults(id)) return null;
  return formatAgeRange(min, max);
}

/** 교육 난이도 — 수집 행은 기본값 "초급"뿐이라 null */
export function displayEducationLevel<T extends string>(id: string | null | undefined, level: T | null | undefined): T | null {
  if (hasCollectorDefaults(id)) return null;
  return level || null;
}

/**
 * 원문이 교육 방식을 주는 수집 원천 — 그린대로(`eduOperSeNm` 대면·비대면 → 온라인/오프라인/혼합,
 * supabase/functions/_shared/greendaero.ts resolveEducationType). 다른 원천(RDA 수집·RDA API)은 기본값 "오프라인"이다.
 */
const EDUCATION_TYPE_SOURCES = ["crawl-greendaero-"];

/** 교육 방식이 기본값인가 — 원천이 방식을 주지 않는 수집 행. 표시(displayEducationType)와 목록 필터(education.ts)가 같이 쓴다 */
export function isEducationTypeUnknown(id: string | null | undefined): boolean {
  return hasCollectorDefaults(id) && !EDUCATION_TYPE_SOURCES.some((prefix) => (id ?? "").startsWith(prefix));
}

/** 교육 방식(온라인·오프라인·혼합) — 원천이 방식을 주지 않는 수집 행은 기본값 "오프라인"이라 null */
export function displayEducationType<T extends string>(id: string | null | undefined, type: T | null | undefined): T | null {
  if (isEducationTypeUnknown(id)) return null;
  return type || null;
}

/**
 * 정원을 아는가 — 수집 행의 `capacity` null 은 "제한 없음"이 아니라 "원문에 정원 칸이 없음"이다.
 * 큐레이션 행의 null 은 손으로 "제한 없음"을 뜻하게 둔 값이라 아는 것으로 본다.
 */
export function isCapacityKnown(id: string | null | undefined, capacity: number | null | undefined): boolean {
  return !(hasCollectorDefaults(id) && (capacity === null || capacity === undefined));
}

/**
 * 대상 칸을 주지 않는 수집 원천 — 그린대로 교육 목록(getEdcList)은 대상 필드가 없어, 수집기가 교육 구분(eduSeNm:
 * "귀농귀촌아카데미"·"지자체 귀농귀촌교육")을 대상 칸에 넣었다. 10/6 수집기는 고쳤고(_shared/greendaero.ts mapEduItem),
 * 이미 적재된 행은 DB 수정 SQL(결재 대기)이 "상세 공고 참조"로 바꾼다 — 어느 쪽이든 원문 대상이 아니다.
 * 이 원천은 체험형 과정을 farm_events 로도 적재하므로 교육·체험 모두 같은 접두다.
 */
const TARGET_LESS_SOURCES = ["crawl-greendaero-education-"];

/** 교육 대상·체험 대상 — 대상 칸이 없는 원천의 행은 null, 그 밖의 수집 행은 채움값("상세 공고 참조")만 비운다 */
export function displayTarget(id: string | null | undefined, value: string | null | undefined): string | null {
  if (TARGET_LESS_SOURCES.some((prefix) => (id ?? "").startsWith(prefix))) return null;
  return displayValue(id, value);
}

