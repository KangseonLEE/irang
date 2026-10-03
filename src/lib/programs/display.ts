import { splitSentences } from "@/lib/format";

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
 * 화면에 보일 요약·설명 — **수집 행만** 상투 문장을 걷어 낸다. 손으로 쓴 큐레이션 문장은 그대로 둔다
 * (10/4 QA: SP-044 설명 끝의 "자세한 조건과 집 상태는 공고에 붙은 설명 자료에서 확인할 수 있어요."가
 * 안내 채움 문장 규칙에 걸려 상세에서 사라졌다). 값이 비면 null — 호출부는 줄째 그리지 않는다.
 */
export function displayText(id: string | null | undefined, text: string | null | undefined): string | null {
  if (isCrawledRow(id)) return meaningfulProgramSummary(text);
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
 * 지원사업·교육의 비용·금액 칸 — **수집 행만** 채움값을 비운다. 큐레이션 값은 그대로
 * (10/4: ED-008 "입교비 소정 (확인 필요)"가 채움값 규칙에 걸려 교육 카드에서 사라졌다 — displayText 와 같은 원칙).
 */
export function displayAmount(id: string | null | undefined, value: string | null | undefined): string | null {
  if (isCrawledRow(id)) return meaningfulValue(value);
  const v = value?.trim();
  return v ? v : null;
}

