/**
 * 오타 보정 유틸리티
 *
 * 한국어 자모 단위 레벤슈타인 거리 + 작물·지역 사전 기반 후보 추출.
 * "사고" → "사과" / "강원" → "강원" / "체리" ↔ "체리" 같이 자모 1개 차이 보정.
 *
 * 네이버 한/영 키 오타(errata API)는 별도 — /api/search-errata 프록시 참조.
 */

import { CROPS } from "./data/crops";
import { PROVINCES } from "./data/regions";
import { SIGUNGUS } from "./data/sigungus";

const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;

const CHO = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
const JUNG = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"];
const JONG = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

/**
 * 한글 문자열을 자모 단위로 분해한다.
 * 한글이 아닌 문자는 그대로 유지.
 *
 * @example
 * decomposeJamo("사과") // "ㅅㅏㄱㅗㅏ" → 실제로는 종성 없으니 "ㅅㅏㄱㅘ"? 아니, 중성 인덱스 단위
 * decomposeJamo("사과") // ["ㅅ","ㅏ","ㄱ","ㅗ","ㅏ"] 아님 — 한 글자씩 cho+jung+(jong) 순
 * decomposeJamo("강원") // "ㄱㅏㅇㅇㅝㄴ"
 */
export function decomposeJamo(str: string): string {
  let out = "";
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code >= HANGUL_START && code <= HANGUL_END) {
      const offset = code - HANGUL_START;
      const c = Math.floor(offset / 588);
      const j = Math.floor((offset % 588) / 28);
      const t = offset % 28;
      out += CHO[c] + JUNG[j];
      if (t > 0) out += JONG[t];
    } else {
      out += str[i];
    }
  }
  return out;
}

/**
 * 일반 레벤슈타인 거리 (삽입·삭제·치환 비용 1).
 * 작은 문자열 비교용 (length ≤ 30 가정).
 */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const m = a.length;
  const n = b.length;
  // 메모리 절약 — 2-row DP
  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/** 자모 단위 레벤슈타인 거리 — 한글 1글자 안에서 자모 1개 차이도 1로 카운트 */
export function jamoDistance(a: string, b: string): number {
  return levenshtein(decomposeJamo(a), decomposeJamo(b));
}

/**
 * 오타 보정 후보 사전 — 작물·시도·시군구.
 * 모듈 로드 시 1회 생성, 이후 캐싱.
 */
const TYPO_DICT: ReadonlyArray<string> = (() => {
  const set = new Set<string>();
  for (const c of CROPS) set.add(c.name);
  for (const p of PROVINCES) {
    set.add(p.name);
    set.add(p.shortName);
  }
  for (const sg of SIGUNGUS) set.add(sg.name);
  return Array.from(set);
})();

/**
 * 쿼리와 자모 거리 ≤ maxDistance 인 사전 후보를 반환.
 * 길이 차가 너무 크면(2자 이상) 제외 (오타라기보단 다른 단어).
 *
 * @param query 사용자 검색어 (trim·lowercase 처리 권장)
 * @param maxDistance 자모 단위 최대 거리 (기본 1)
 * @param maxResults 최대 후보 수 (기본 3)
 * @returns 거리 오름차순 정렬된 후보 단어 배열
 */
export function findTypoCandidates(
  query: string,
  maxDistance = 1,
  maxResults = 3,
): string[] {
  const q = query.trim();
  if (q.length < 2 || q.length > 20) return [];

  // 한글이 아예 없으면 자모 보정 의미 없음 (한영 오타는 errata가 처리)
  if (!/[가-힣]/.test(q)) return [];

  const qJamo = decomposeJamo(q);

  const scored: Array<{ term: string; dist: number }> = [];
  for (const term of TYPO_DICT) {
    // 동일어 제외
    if (term === q) continue;
    // 길이 차 큰 후보 빠른 거름
    if (Math.abs(term.length - q.length) > 1) continue;
    const dist = levenshtein(qJamo, decomposeJamo(term));
    if (dist > 0 && dist <= maxDistance) {
      scored.push({ term, dist });
    }
  }

  scored.sort((a, b) => a.dist - b.dist || a.term.length - b.term.length);

  // 중복 제거 + maxResults 컷
  const seen = new Set<string>();
  const out: string[] = [];
  for (const { term } of scored) {
    if (seen.has(term)) continue;
    seen.add(term);
    out.push(term);
    if (out.length >= maxResults) break;
  }
  return out;
}
