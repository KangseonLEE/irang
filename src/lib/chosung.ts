/**
 * 한글 초성 검색 유틸리티
 *
 * - getChosung(str): 문자열에서 한글 초성만 추출 ("서울" → "ㅅㅇ")
 * - isChosungQuery(query): 쿼리가 초성으로만 구성되어 있는지 판별
 * - matchChosung(text, chosungQuery): 텍스트의 초성이 쿼리를 포함하는지 확인
 */

/** 한글 초성 19자 (유니코드 순서) */
const CHOSUNG_LIST = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ",
  "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
] as const;

/** 초성 문자 집합 — O(1) 판별용 */
const CHOSUNG_SET = new Set<string>(CHOSUNG_LIST);

/** 한글 음절 시작 코드포인트 (가 = 0xAC00) */
const HANGUL_START = 0xac00;

/** 한글 음절 끝 코드포인트 (힣 = 0xD7A3) */
const HANGUL_END = 0xd7a3;

/**
 * 문자열에서 한글 초성만 추출한다.
 * 한글 음절이 아닌 문자(영문, 숫자, 공백 등)는 그대로 유지한다.
 *
 * @example
 * getChosung("서울") // "ㅅㅇ"
 * getChosung("고추") // "ㄱㅊ"
 * getChosung("ABC 서울") // "ABC ㅅㅇ"
 */
export function getChosung(str: string): string {
  let result = "";

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);

    if (code >= HANGUL_START && code <= HANGUL_END) {
      // 한글 음절 → 초성 인덱스 계산
      const chosungIndex = Math.floor((code - HANGUL_START) / 588);
      result += CHOSUNG_LIST[chosungIndex];
    } else {
      // 한글이 아닌 문자는 그대로 유지
      result += str[i];
    }
  }

  return result;
}

/**
 * 쿼리가 한글 초성으로만 구성되어 있는지 판별한다.
 * 공백은 무시하며, 최소 1글자 이상의 초성이 있어야 true를 반환한다.
 *
 * @example
 * isChosungQuery("ㅅㅇ") // true
 * isChosungQuery("ㄱㅊ") // true
 * isChosungQuery("서울") // false
 * isChosungQuery("ㅅ울") // false
 * isChosungQuery("")     // false
 */
export function isChosungQuery(query: string): boolean {
  const trimmed = query.replace(/\s/g, "");
  if (trimmed.length === 0) return false;

  for (let i = 0; i < trimmed.length; i++) {
    if (!CHOSUNG_SET.has(trimmed[i])) {
      return false;
    }
  }

  return true;
}

/**
 * 텍스트의 초성 변환 결과가 초성 쿼리를 포함하는지 확인한다.
 *
 * @example
 * matchChosung("서울특별시", "ㅅㅇ") // true
 * matchChosung("고추", "ㄱㅊ")       // true
 * matchChosung("귀농", "ㄱㄴ")       // true
 */
export function matchChosung(text: string, chosungQuery: string): boolean {
  return getChosung(text).includes(chosungQuery);
}
