/**
 * search_logs 적재 가드 — 통계로 의미 없는 검색어를 서버에서 거른다.
 *
 * - 자연어 질문(물음표·의문사·긴 문장)은 인기 검색어 집계를 흐린다.
 * - 마크업·스킴·템플릿 문자열(`<img …>`, `javascript:…`, `{{…}}`)은 사람이 찾는 말이 아니라
 *   스캐너·보안 실측 페이로드다. 9/17 세션 XSS 실측 `javascript:alert(1)` 이 19자라 자연어
 *   필터를 통과해 admin 인기 검색어 후보에 남았다(9/23 정리). 외부 스캐너도 같은 경로로 들어온다.
 *   화면 렌더는 React 텍스트 노드라 XSS 위험은 없다 — 이 가드는 집계 위생용이다.
 */

export function isNaturalLanguageQuery(query: string): boolean {
  const t = query.trim();
  if (/[?]/.test(t)) return true;
  if (
    /(어떻|어느|왜|어디|언제|무엇|얼마|어떤|있나|있어|되나|가능|뭐가|뭐예|뭐임)/.test(t)
  )
    return true;
  if (t.length > 20) return true;
  if (t.split(/\s+/).length >= 5) return true;
  return false;
}

const MARKUP_PATTERNS: RegExp[] = [
  /[<>]/, // 태그 꺾쇠 — 정상 검색어에 꺾쇠가 들어올 일은 없다
  /^\s*(javascript|data|vbscript|file|about):/i, // URL 스킴 페이로드
  /\bon[a-z]+\s*=/i, // onerror= onload= 인라인 핸들러
  /\{\{|\}\}|\$\{/, // 템플릿 인젝션 탐침
  /(alert|prompt|confirm|eval)\s*\(/i, // 실행 탐침
  /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/, // 제어 문자
];

export function isMarkupOrSchemeQuery(query: string): boolean {
  return MARKUP_PATTERNS.some((re) => re.test(query));
}
