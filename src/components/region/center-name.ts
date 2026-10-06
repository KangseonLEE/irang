/**
 * 센터 이름의 줄바꿈 지점 (2026-10-06 QA2 광역 센터 카드).
 *
 * 전역 `word-break: keep-all` 은 띄어쓰기에서만 줄을 바꾼다. "경기도귀농귀촌지원센터"·"충청북도농업기술원"처럼
 * 붙여 쓴 기관명은 2단 카드(글자 폭 130~140px)에서 카드 밖으로 넘치거나, 글자 단위 비상 줄바꿈으로
 * "…종합지원센 / 터"처럼 한 글자만 남았다. 기관명이 흔히 붙이는 낱말(귀농귀촌·종합지원센터·농업기술원…) 앞을
 * 줄바꿈 가능 지점으로 돌려준다 — 호출부가 조각 사이에 `<wbr>` 를 넣는다(복사·스크린리더에 글자를 더하지 않는다).
 */
const BREAK_BEFORE = ["종합지원센터", "지원센터", "농업기술센터", "농업기술원", "귀농귀촌"] as const;

const HANGUL = /[가-힣]/;

/** 이름 → 줄바꿈 가능 지점으로 나눈 조각들. 띄어 쓴 경계는 건드리지 않는다 */
export function centerNameSegments(name: string): string[] {
  const segments: string[] = [];
  let start = 0;
  for (let i = 1; i < name.length; ) {
    const suffix = BREAK_BEFORE.find((s) => name.startsWith(s, i));
    if (!suffix) {
      i += 1;
      continue;
    }
    // 붙어 있을 때만 끊는다("경기도귀농귀촌"). 띄어 쓴 낱말("… 종합지원센터")은 그 안을 다시 끊지 않고 건너뛴다
    if (HANGUL.test(name[i - 1])) {
      segments.push(name.slice(start, i));
      start = i;
    }
    i += suffix.length;
  }
  segments.push(name.slice(start));
  return segments;
}
