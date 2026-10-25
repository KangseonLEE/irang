/**
 * 원문 공고의 '모집 끝남' 표시 판정 (2026-10-26).
 *
 * 배경: SP-044 괴산 희망둥지는 접수 기간이 "모집완료 시까지"라 마감일을 9999 로 두었는데, 원문 제목이
 * `<모집완료>` 로 바뀐 뒤에도 화면은 계속 '모집중'이었다(회장 발견). 링크 점검(200·제목)·대조일 점검(90일)
 * 어느 쪽도 원문의 상태 표시를 보지 않았다. watchman §20 `check-program-closure.ts` 가 이 함수로 판정한다.
 *
 * 공고 본문에는 "~ 모집완료 시까지"·"예산 소진 시 조기 마감"처럼 **조건문**으로 같은 낱말이 늘 들어 있다.
 * 그래서 낱말 하나가 아니라 ① 괄호로 붙인 상태 머리표(`<모집완료>`·`[마감]`·`(접수마감)`)와
 * ② 이미 끝났다는 완료형 문장(`모집이 완료되었습니다`·`예산이 소진되어`)만 잡는다.
 */

const BRACKET_TAG = /[<\[(【〈]\s*(모집\s?완료|모집\s?마감|접수\s?마감|조기\s?마감|마감|선정\s?완료|접수\s?종료|모집\s?종료)\s*[>\])】〉]/;

const DONE_SENTENCE =
  /(모집|접수|신청)(이|가)?\s?(완료|마감|종료)\s?(되었|됐|되어|하였|했)|조기\s?마감\s?(되었|됐|하였|했)|예산(이)?\s?(모두\s?)?소진\s?(되어|됐|되었|으로)/;

/** HTML(엔티티 포함) → 태그 걷은 평문 */
export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
}

/**
 * 평문에서 '모집 끝남' 표시를 찾으면 그 앞뒤 문맥(근거)을, 없으면 null.
 * 게시판 상세 아래의 이전글·다음글 목록은 다른 공고 제목이라(괴산 게시판: 옆 글이 `<모집완료>`) 그 앞까지만 본다.
 */
export function findClosureMarker(text: string): string | null {
  const cut = text.search(/이전\s?글|다음\s?글/);
  const body = cut > 0 ? text.slice(0, cut) : text;
  for (const re of [BRACKET_TAG, DONE_SENTENCE]) {
    const m = re.exec(body);
    if (m) return body.slice(Math.max(0, m.index - 20), m.index + m[0].length + 30).trim();
  }
  return null;
}
