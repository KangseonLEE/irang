import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { getRoadmap } from "@/lib/data/roadmap-steps";
import type { FarmTypeId } from "@/lib/data/match-questions";
import s from "./personalized-roadmap.module.css";

interface PersonalizedRoadmapProps {
  farmTypeId: FarmTypeId;
  farmTypeLabel: string;
}

export function PersonalizedRoadmap({
  farmTypeId,
  farmTypeLabel,
}: PersonalizedRoadmapProps) {
  const roadmap = getRoadmap(farmTypeId);
  if (!roadmap) return null;

  return (
    <section className={s.section}>
      <div className={s.header}>
        <span className={s.eyebrow}>맞춤 로드맵</span>
        <h2 className={s.title}>
          {farmTypeLabel}을 위한 <em>단계별 가이드</em>
        </h2>
        <p className={s.sub}>
          전체 예상 기간 약 {roadmap.totalDuration}이에요
        </p>
      </div>

      <div className={s.timeline}>
        {roadmap.steps.map((step, idx) => (
          <div key={step.step} className={s.step}>
            <div className={s.stepIndicator}>
              <span className={s.stepNumber}>{step.step}</span>
              {idx < roadmap.steps.length - 1 && (
                <span className={s.stepLine} aria-hidden="true" />
              )}
            </div>

            <div className={s.stepContent}>
              <div className={s.stepTop}>
                <h3 className={s.stepTitle}>{step.title}</h3>
                <span className={s.stepDuration}>{step.duration}</span>
              </div>
              <p className={s.stepDesc}>{step.description}</p>

              <ul className={s.checklist}>
                {step.checklist.map((item, i) => (
                  <li key={i} className={s.checkItem}>
                    <Icon icon={Check} size="xs" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {step.link && (
                <Link href={step.link.href} className={s.stepLink}>
                  {step.link.label}
                  <Icon icon={ArrowRight} size="xs" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
