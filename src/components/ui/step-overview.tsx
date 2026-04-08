import {
  Search,
  GraduationCap,
  MapPin,
  Tractor,
  Home,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import type { GuideStepSummary } from "@/lib/data/guide-steps";
import s from "./step-overview.module.css";

const STEP_ICONS: Record<number, LucideIcon> = {
  1: Search,
  2: GraduationCap,
  3: MapPin,
  4: Tractor,
  5: Home,
};

interface StepOverviewProps {
  steps: GuideStepSummary[];
  /** 카드 클릭 시 이동할 기본 경로 (기본: /guide) */
  basePath?: string;
}

/**
 * 귀농 5단계 요약 카드 — 공용 컴포넌트
 *
 * /costs, /guide, 랜딩 등 여러 페이지에서 재사용 가능.
 * 각 카드를 탭하면 /guide#step-{N} 으로 이동하여 아코디언이 열립니다.
 *
 * <a> 태그를 사용하여 full navigation을 보장합니다.
 * (Next.js Link의 클라이언트 캐시로 인해 hash 변경 시 아코디언이 안 열리는 문제 방지)
 */
export function StepOverview({ steps, basePath = "/guide" }: StepOverviewProps) {
  return (
    <div className={s.track}>
      {steps.map((step) => {
        const Icon = STEP_ICONS[step.step] ?? Search;
        return (
          <a
            key={step.step}
            href={`${basePath}#step-${step.step}`}
            className={`${s.card} ${step.cost.highlight ? s.cardHighlight : ""}`}
          >
            {/* 아이콘 + 단계 번호 */}
            <div className={`${s.icon} ${step.cost.highlight ? s.iconHighlight : ""}`}>
              <Icon size={20} />
            </div>
            <span className={s.stepLabel}>Step {step.step}</span>

            {/* 제목 + 기간 */}
            <span className={s.title}>{step.title}</span>
            <span className={s.period}>{step.period}</span>

            {/* 비용 */}
            <div className={s.cost}>
              <span className={`${s.costAmount} ${step.cost.highlight ? s.costHighlight : ""}`}>
                {step.cost.amount}
              </span>
              <span className={s.costDesc}>{step.cost.desc}</span>
            </div>

            {/* 링크 힌트 */}
            <span className={s.link}>
              자세히 보기 <ArrowRight size={12} />
            </span>
          </a>
        );
      })}
    </div>
  );
}
