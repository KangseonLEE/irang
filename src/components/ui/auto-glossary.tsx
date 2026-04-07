import { GLOSSARY_ENTRIES } from "@/lib/data/glossary";
import { TermTooltip } from "./term-tooltip";
import type { ReactNode } from "react";

/* ==========================================================================
   AutoGlossary — 텍스트 내 용어집 단어를 자동 감지하여 툴팁으로 변환
   서버 컴포넌트 · 같은 용어 첫 등장만 하이라이트 · 긴 용어 우선 매칭
   contextRequired가 true인 용어는 주변 문맥 검사 후 매칭
   ========================================================================== */

const MIN_TERM_LENGTH = 2;

// ── 용어 매칭 테이블 (모듈 로드 시 1회 빌드) ──

const termLookup = new Map<string, (typeof GLOSSARY_ENTRIES)[number]>();

for (const entry of GLOSSARY_ENTRIES) {
  if (entry.term.length >= MIN_TERM_LENGTH) {
    termLookup.set(entry.term, entry);
  }
  for (const alias of entry.aliases ?? []) {
    if (alias.length >= MIN_TERM_LENGTH && !termLookup.has(alias)) {
      termLookup.set(alias, entry);
    }
  }
}

// 길이 역순 → 긴 용어 우선 매칭 ("농업진흥지역" > "농업")
const sortedKeys = [...termLookup.keys()].sort((a, b) => b.length - a.length);

function esc(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const glossaryPattern = new RegExp(
  `(${sortedKeys.map(esc).join("|")})`,
  "g",
);

// ── contextRequired 용어의 문맥 검사 ──

/**
 * contextRequired가 true인 용어(예: "정보" = 町步)는
 * 앞에 숫자, 한정사(한/두/세/네/다섯/여섯/반/수), "논/밭/약" 등이 있을 때만
 * 전문 용어로 인식합니다.
 *
 * 매칭 예시: "한 정보", "3정보", "두 정보", "논 한 정보"
 * 비매칭 예시: "정보를 수집", "기초 정보", "정보 탐색"
 */
const CONTEXT_BEFORE_PATTERN =
  /(?:\d+\.?\d*\s*|[한두세네다섯여섯일이삼사오육칠팔구십백반수몇]\s*)$/;

function hasValidContext(text: string, matchIndex: number): boolean {
  // 매칭 직전 텍스트를 확인 (최대 10자)
  const before = text.slice(Math.max(0, matchIndex - 10), matchIndex);
  return CONTEXT_BEFORE_PATTERN.test(before);
}

// ── 컴포넌트 ──

interface AutoGlossaryProps {
  /** 용어를 감지할 텍스트 */
  text: string;
  /** 한 텍스트 블록 내 최대 하이라이트 수 (기본 3) */
  maxHighlights?: number;
}

/**
 * 텍스트 내에서 용어집에 등록된 단어를 자동 감지하여
 * 첫 등장 시 툴팁(점선 밑줄 + 팝업 설명)으로 변환하는 서버 컴포넌트.
 *
 * - 같은 용어(slug 기준)는 첫 등장만 하이라이트
 * - 긴 용어를 짧은 용어보다 먼저 매칭 (greedy)
 * - aliases도 감지 대상 (예: "흙갈이" → 경운 용어 툴팁)
 * - contextRequired 용어는 주변에 숫자/한정사가 있을 때만 매칭
 *
 * @example
 * <AutoGlossary text="노지에서 적과 작업 후 출하합니다" />
 * // → "노지", "적과", "출하"에 자동 툴팁
 */
export function AutoGlossary({ text, maxHighlights = 3 }: AutoGlossaryProps) {
  if (!text) return null;

  const seen = new Set<string>();
  let highlightCount = 0;
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  // 정규식 인스턴스를 새로 생성 (lastIndex 초기화)
  const regex = new RegExp(glossaryPattern.source, "g");
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matched = match[0];
    const entry = termLookup.get(matched);
    if (!entry) continue;

    const idx = match.index;

    // contextRequired 용어는 주변 문맥 검사
    if (entry.contextRequired && !hasValidContext(text, idx)) {
      // 문맥 불일치 → 일반 텍스트로 처리 (건너뛰기)
      continue;
    }

    // 매칭 이전 텍스트 추가
    if (idx > lastIndex) {
      parts.push(text.slice(lastIndex, idx));
    }

    // 같은 slug 첫 등장 + 하이라이트 한도 이내 → 툴팁
    if (!seen.has(entry.slug) && highlightCount < maxHighlights) {
      parts.push(
        <TermTooltip
          key={`ag-${entry.slug}-${idx}`}
          term={matched}
          description={entry.shortDesc}
          glossarySlug={entry.slug}
        />,
      );
      seen.add(entry.slug);
      highlightCount++;
    } else {
      // 이미 하이라이트 했거나 한도 초과 → 일반 텍스트
      parts.push(matched);
    }

    lastIndex = idx + matched.length;
  }

  // 매칭 없으면 원본 텍스트 반환
  if (parts.length === 0) return <>{text}</>;

  // 나머지 텍스트 추가
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}
