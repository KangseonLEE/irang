import type { ReactNode } from "react";
import { splitSentences } from "@/lib/format";
import { AutoGlossary, glossaryHitSlugs } from "./auto-glossary";
import s from "./sentence-text.module.css";

interface SentenceTextProps {
  /** 긴 안내문 원문 */
  text: string;
  /** 용어집 툴팁 적용 (본문 텍스트면 켠다 — 체크리스트 A-2) */
  glossary?: boolean;
  /** 문단 전체 하이라이트 총량 (기본 3) — 문장 수와 무관하게 이 값을 넘지 않는다 */
  maxHighlights?: number;
  className?: string;
}

/**
 * 긴 안내문을 문장 단위로 줄을 나눠 읽히게 하는 Server Component (2026-09-28 회장).
 *
 * 지원사업 설명·자격 조건은 한 문단에 3~8문장이 이어 붙어 모바일에서 벽처럼 보였다.
 * 문장마다 블록(`<span>`)으로 떨어뜨리고 줄 사이 여백만 준다 — 불릿·번호를 새로 만들지 않는다.
 *
 * - 1문장이면 분리하지 않고 종전과 같은 출력(불필요한 래퍼 없음)
 * - `glossary` 를 켜면 문장마다 `AutoGlossary` 를 두되 **총량은 maxHighlights 그대로** 유지하고,
 *   앞 문장에서 쓴 용어는 뒤 문장에서 다시 툴팁으로 만들지 않는다(한 덩어리였을 때와 같은 결과).
 */
export function SentenceText({
  text,
  glossary = false,
  maxHighlights = 3,
  className,
}: SentenceTextProps) {
  if (!text) return null;

  const sentences = splitSentences(text);

  if (sentences.length <= 1) {
    return glossary ? <AutoGlossary text={text} maxHighlights={maxHighlights} /> : <>{text}</>;
  }

  /* 문장별 하이라이트 예산·제외 목록을 **렌더 전에** 한 번 계산한다.
     map 콜백 안에서 외부 변수를 갱신하면 React Compiler 규칙(immutability)에 걸린다. */
  const plan: Array<{ sentence: string; quota: number; exclude: string[] }> = [];
  if (glossary) {
    const used: string[] = [];
    let budget = maxHighlights;
    for (const sentence of sentences) {
      const quota = Math.max(0, budget);
      const exclude = [...used];
      // AutoGlossary 와 같은 순서·규칙으로 소모량을 계산해 다음 문장 예산에서 뺀다
      const spent = glossaryHitSlugs(sentence, used).slice(0, quota);
      used.push(...spent);
      budget -= spent.length;
      plan.push({ sentence, quota, exclude });
    }
  }

  const lines: ReactNode[] = sentences.map((sentence, i) => (
    <span key={i} className={s.line}>
      {glossary ? (
        <AutoGlossary
          text={sentence}
          maxHighlights={plan[i].quota}
          excludeSlugs={plan[i].exclude}
        />
      ) : (
        sentence
      )}
    </span>
  ));

  return <span className={`${s.block} ${className ?? ""}`}>{lines}</span>;
}
