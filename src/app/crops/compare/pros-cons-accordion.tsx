import { ThumbsUp, AlertTriangle, Lightbulb, ChevronDown } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { CropImage } from "@/components/ui/crop-image";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import type { ProsConsCategory, ProsConsInfo } from "@/lib/data/crops";
import s from "./pros-cons-accordion.module.css";

/**
 * 작물별 장단점 아코디언.
 * native <details>/<summary> 사용 → JS 없는 Server Component.
 * (AutoGlossary 가 Server Component 라 클라이언트 아코디언으로는 children 전달 불가 —
 *  details 패턴이 a11y·SSR·용어 툴팁 모두 충족.)
 */

const CAT_LABEL: Record<ProsConsCategory, string> = {
  수익성: "수익성",
  재배난이도: "재배",
  시장성: "시장",
  안정성: "안정",
  생활: "생활",
  확장성: "확장",
};

export interface ProsConsAccordionItem {
  id: string;
  name: string;
  prosCons: ProsConsInfo;
}

interface Props {
  items: ProsConsAccordionItem[];
}

export function ProsConsAccordion({ items }: Props) {
  return (
    <div className={s.list}>
      {items.map((item, i) => (
        <details key={item.id} className={s.item} open={i === 0}>
          <summary className={s.summary}>
            <span className={s.summaryLabel}>
              <CropImage cropId={item.id} cropName={item.name} size="md" />
              {item.name}
            </span>
            <span className={s.summaryMeta}>
              <span className={s.summaryCount}>
                <Icon icon={ThumbsUp} size="xs" /> {item.prosCons.pros.length}
              </span>
              <span className={s.summaryCount}>
                <Icon icon={AlertTriangle} size="xs" /> {item.prosCons.cons.length}
              </span>
              <Icon icon={ChevronDown} size="sm" className={s.chevron} />
            </span>
          </summary>

          <div className={s.body}>
            {/* 종합 (결론 먼저) */}
            {item.prosCons.verdict && (
              <div className={s.verdictCard}>
                <Icon icon={Lightbulb} size="sm" />
                <span className={s.verdictText}>
                  <AutoGlossary text={item.prosCons.verdict} />
                </span>
              </div>
            )}

            {/* 장점 */}
            <div className={s.group}>
              <p className={s.prosGroupLabel}>
                <Icon icon={ThumbsUp} size="xs" /> 장점
              </p>
              {item.prosCons.pros.map((p, idx) => (
                <div key={idx} className={s.prosItem}>
                  <span className={s.prosBadge}>
                    {CAT_LABEL[p.category] ?? p.category}
                  </span>
                  <span className={s.itemText}>
                    <AutoGlossary text={p.text} />
                  </span>
                </div>
              ))}
            </div>

            {/* 단점 */}
            <div className={s.group}>
              <p className={s.consGroupLabel}>
                <Icon icon={AlertTriangle} size="xs" /> 단점
              </p>
              {item.prosCons.cons.map((c, idx) => (
                <div key={idx} className={s.consItem}>
                  <span className={s.consBadge}>
                    {CAT_LABEL[c.category] ?? c.category}
                  </span>
                  <span className={s.itemText}>
                    <AutoGlossary text={c.text} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
