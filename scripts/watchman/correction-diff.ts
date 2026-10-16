/**
 * watchman §9 — 데이터 파일 변경이 '표기만' 바뀐 것인가 (2026-10-16 데이터 정합성 1차 QA ⚪-7, #178 오탐).
 *
 * 정정 이력(/about/corrections)은 "표시한 정보가 틀렸거나 바뀌어 바로잡은 기록"이다(corrections.ts 머리 주석).
 * 365bae3 은 crops.ts 설명의 '인기이에요 → 인기예요' 같은 받침 표기 6곳만 고쳤는데, 커밋 제목의 '오류'·'정정' 때문에
 * 정정 후보로 잡혀 이력 미반영 🟡 가 났다. 정보가 바뀌지 않은 변경은 후보에서 뺀다.
 *
 * '표기만'의 판정 — 바뀐 줄을 순서대로 짝지어(지운 줄 수 = 넣은 줄 수), 각 짝이 아래를 걷어 낸 뒤 같으면 표기만:
 *   - 공백(띄어쓰기)
 *   - 서술 어미 '이에요·예요·이예요'(받침 표기)
 *   - 문장 부호 · … ' " ‘ ’ “ ” 「 」 ,(천 단위 쉼표 포함) 와, 숫자 사이가 아닌 .  ("3.5"↔"35"는 숫자가 바뀐 것이라 남긴다)
 * 조사(을/를·과/와 등)는 맞추지 않는다 — '사과→사와'처럼 낱말 끝 글자가 바뀐 정정을 표기로 오인할 수 있다.
 * 주석 줄(//·/*·*)은 화면 사실이 아니라 짝 맞추기 전에 양쪽에서 뺀다 — 주석만 바뀐 변경도 표기만.
 * 숫자·낱말 자체가 하나라도 바뀌면 표기만이 아니다(정정 후보로 남는다).
 */

const COMMENT_LINE = /^\s*(\/\/|\/\*|\*)/;
const COPULA = /(이에요|이예요|예요)/g;
const PUNCT = /[·…'"‘’“”「」\s,]|(?<!\d)\.|\.(?!\d)/g;

export function normalizeOrthography(line: string): string {
  return line.replace(COPULA, "").replace(PUNCT, "");
}

/**
 * 지운 줄·넣은 줄(diff 의 -·+ 줄, 접두 기호 뺀 내용)이 표기만 다른가.
 * 바뀐 줄이 없거나(전부 주석) 짝이 모두 같으면 true.
 */
export function isOrthographyOnlyChange(removed: string[], added: string[]): boolean {
  const r = removed.filter((l) => !COMMENT_LINE.test(l));
  const a = added.filter((l) => !COMMENT_LINE.test(l));
  if (r.length !== a.length) return false;
  return r.every((line, i) => normalizeOrthography(line) === normalizeOrthography(a[i]));
}

/** `git show -U0` 출력에서 바뀐 줄을 꺼낸다 (---/+++ 머리 줄 제외) */
export function changedLinesFromDiff(diff: string): { removed: string[]; added: string[] } {
  const removed: string[] = [];
  const added: string[] = [];
  for (const line of diff.split("\n")) {
    if (line.startsWith("---") || line.startsWith("+++")) continue;
    if (line.startsWith("-")) removed.push(line.slice(1));
    else if (line.startsWith("+")) added.push(line.slice(1));
  }
  return { removed, added };
}
