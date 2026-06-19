import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { SearchAnswer } from "@/lib/data/search-index";
import { PROVINCES } from "@/lib/data/regions";

import s from "./search-answer-card.module.css";

/** 시도 정식명 → 짧은 표기 (칩 노출용). 매칭 없으면 원문 유지. */
function shortenRegion(name: string): string {
  const p = PROVINCES.find((pv) => pv.name === name);
  return p?.shortName ?? name;
}

interface SearchAnswerCardProps {
  answer: SearchAnswer;
}

/**
 * 검색 답변 카드 (Featured Snippet) — intent 감지 시 결과 최상단에 구조화된 답을 직접 노출.
 * 단일 link가 아니라 2개 CTA를 가지므로 카드 전체를 Link로 감싸지 않는다.
 */
export function SearchAnswerCard({ answer }: SearchAnswerCardProps) {
  return (
    <section
      className={s.card}
      aria-label={`${answer.cropName} 빠른 답변`}
    >
      <div className={s.head}>
        <span className={s.emoji} aria-hidden="true">
          {answer.emoji}
        </span>
        <h2 className={s.headline}>{answer.headline}</h2>
        <span className={s.typeBadge}>
          {answer.category} · 난이도 {answer.difficulty}
        </span>
      </div>

      {answer.lead && <p className={s.lead}>{answer.lead}</p>}

      {answer.facts.length > 0 && (
        <dl className={s.facts}>
          {answer.facts.map((f) => (
            <div key={f.label} className={s.fact}>
              <dt className={s.factLabel}>{f.label}</dt>
              <dd className={s.factValue}>{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {answer.regions && answer.regions.length > 0 && (
        <div className={s.regions}>
          <span className={s.regionsLabel}>주산지</span>
          <div className={s.regionChips}>
            {answer.regions.map((r) => (
              <span key={r} className={s.regionChip}>
                {shortenRegion(r)}
              </span>
            ))}
          </div>
        </div>
      )}

      {answer.source && <p className={s.source}>{answer.source}</p>}

      <div className={s.actions}>
        <Link href={answer.primaryHref} className={s.primaryCta}>
          {answer.primaryLabel}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
        {answer.secondaryHref && answer.secondaryLabel && (
          <Link href={answer.secondaryHref} className={s.secondaryCta}>
            {answer.secondaryLabel}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        )}
      </div>
    </section>
  );
}
