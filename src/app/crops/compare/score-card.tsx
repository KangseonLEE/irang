import { Wallet, Clock, Gauge, Activity } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { CropImage } from "@/components/ui/crop-image";
import s from "./score-card.module.css";

/**
 * 작물별 한 장 요약 스코어카드 (나란히).
 * 4탭 MetricGrid 를 흡수 — 작물 단위로 핵심 4지표를 묶어 보여줘 비교 컨텍스트 유지.
 * 모바일: 가로 스크롤 (축소판 아님). 데스크탑: 동일 폭 그리드.
 *
 * best 강조 판정(소득 최고 / 노동 최소 / 가장 쉬움)은 서버에서 미리 계산해 전달.
 */

export type DifficultyTone = "easy" | "medium" | "hard" | "neutral";

export interface ScoreCardItem {
  id: string;
  name: string;
  category: string;
  /** 예상 소득 표기 텍스트 (예: "800~1,500") — null 이면 데이터 없음 */
  incomeText: string | null;
  /** best(소득 최고) 강조 여부 */
  incomeBest: boolean;
  /** 연간 노동일수 (예: "225") — null 이면 데이터 없음 */
  workdaysText: string | null;
  /** best(노동 최소) 강조 여부 */
  workdaysBest: boolean;
  difficulty: string;
  difficultyTone: DifficultyTone;
  /** 가장 쉬운 작물 강조 여부 */
  difficultyBest: boolean;
  laborIntensity: string | null;
  /** 1줄 태그 (재배 시기 등) */
  tag: string;
}

const TONE_CLASS: Record<DifficultyTone, string> = {
  easy: "toneEasy",
  medium: "toneMedium",
  hard: "toneHard",
  neutral: "toneNeutral",
};

interface Props {
  items: ScoreCardItem[];
}

export function ScoreCards({ items }: Props) {
  return (
    <div className={s.scroller}>
      <div className={s.grid} style={{ "--card-count": items.length } as React.CSSProperties}>
        {items.map((item) => (
          <article key={item.id} className={s.card}>
            <header className={s.cardHeader}>
              <CropImage cropId={item.id} cropName={item.name} size="lg" />
              <div className={s.cardHeaderText}>
                <h3 className={s.cardName}>{item.name}</h3>
                <span className={s.cardCategory}>{item.category}</span>
              </div>
            </header>

            <p className={s.cardTag}>{item.tag}</p>

            <dl className={s.metrics}>
              <div className={`${s.metric} ${item.incomeBest ? s.metricBest : ""}`}>
                <dt className={s.metricLabel}>
                  <Icon icon={Wallet} size="xs" /> 예상 소득
                </dt>
                <dd className={s.metricValue}>
                  {item.incomeText ?? "—"}
                  {item.incomeText && <span className={s.metricUnit}>만원/10a</span>}
                  {item.incomeBest && <span className={s.bestBadge}>최고</span>}
                </dd>
              </div>

              <div className={`${s.metric} ${item.workdaysBest ? s.metricBest : ""}`}>
                <dt className={s.metricLabel}>
                  <Icon icon={Clock} size="xs" /> 연간 노동
                </dt>
                <dd className={s.metricValue}>
                  {item.workdaysText ?? "—"}
                  {item.workdaysText && <span className={s.metricUnit}>일</span>}
                  {item.workdaysBest && <span className={s.bestBadge}>최소</span>}
                </dd>
              </div>

              <div className={s.metric}>
                <dt className={s.metricLabel}>
                  <Icon icon={Gauge} size="xs" /> 난이도
                </dt>
                <dd className={s.metricValue}>
                  <span className={`${s.diffBadge} ${s[TONE_CLASS[item.difficultyTone]]}`}>
                    {item.difficulty}
                  </span>
                  {item.difficultyBest && <span className={s.bestBadge}>가장 쉬움</span>}
                </dd>
              </div>

              <div className={s.metric}>
                <dt className={s.metricLabel}>
                  <Icon icon={Activity} size="xs" /> 노동 강도
                </dt>
                <dd className={s.metricValue}>
                  <span className={s.plainValue}>{item.laborIntensity ?? "—"}</span>
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
