"use client";

import { useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import type { CauseAnalysis } from "@/lib/data/stats";
import s from "./cause-analysis.module.css";

interface Props {
  title: string;
  causes: CauseAnalysis[];
}

export default function CauseAnalysisSection({ title, causes }: Props) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setExpandedIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className={s.section}>
      <h3 className={s.sectionTitle}>
        <Lightbulb size={18} aria-hidden="true" />
        {title}
      </h3>

      <div className={s.causeList}>
        {causes.map((cause, i) => {
          const isOpen = expandedIdx === i;
          return (
            <div
              key={cause.label}
              className={`${s.causeItem} ${isOpen ? s.causeItemOpen : ""}`}
            >
              <button
                className={s.causeHeader}
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
              >
                <span className={s.causeNumber}>{i + 1}</span>
                <span className={s.causeLabel}>{cause.label}</span>
                {isOpen ? (
                  <ChevronUp size={16} className={s.causeChevron} />
                ) : (
                  <ChevronDown size={16} className={s.causeChevron} />
                )}
              </button>

              {isOpen && (
                <div className={s.causeBody}>
                  <p className={s.causeDesc}>{cause.description}</p>
                  <a
                    href={cause.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={s.causeSource}
                  >
                    <ExternalLink size={12} aria-hidden="true" />
                    {cause.source}
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
