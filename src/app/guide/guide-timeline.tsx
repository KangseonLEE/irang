"use client";

import { useState, useEffect } from "react";
import {
  Search,
  GraduationCap,
  MapPin,
  Tractor,
  Home,
  type LucideIcon,
} from "lucide-react";
import { TimelineLink } from "./timeline-nav";
import s from "./page.module.css";

/* ==========================================================================
   GuideTimeline — 타임라인 요약 (체크리스트 완료율 시각화)
   localStorage의 체크리스트 완료 상태를 읽어 각 단계 dot에 진행률을 표시합니다.
   ========================================================================== */

/** 단계별 아이콘 매핑 (Server→Client 간 함수 전달 불가하므로 클라이언트에서 매핑) */
const STEP_ICONS: Record<number, LucideIcon> = {
  1: Search,
  2: GraduationCap,
  3: MapPin,
  4: Tractor,
  5: Home,
};

interface TimelineStep {
  step: number;
  title: string;
  period: string;
  checklistLength: number;
}

interface GuideTimelineProps {
  steps: TimelineStep[];
}

export function GuideTimeline({ steps }: GuideTimelineProps) {
  const [progress, setProgress] = useState<Record<number, number>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const result: Record<number, number> = {};
    for (const step of steps) {
      try {
        const saved = localStorage.getItem(`guide-checklist-step-${step.step}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const done = parsed.filter(Boolean).length;
            result[step.step] = step.checklistLength > 0 ? done / step.checklistLength : 0;
          }
        }
      } catch {
        /* localStorage 접근 불가 무시 */
      }
    }
    setProgress(result);
  }, [steps]);

  // localStorage 변경 감지 (다른 탭에서의 변경)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (!e.key?.startsWith("guide-checklist-step-")) return;
      const stepNum = Number(e.key.replace("guide-checklist-step-", ""));
      const step = steps.find((s) => s.step === stepNum);
      if (!step || !e.newValue) return;

      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) {
          const done = parsed.filter(Boolean).length;
          setProgress((prev) => ({
            ...prev,
            [stepNum]: step.checklistLength > 0 ? done / step.checklistLength : 0,
          }));
        }
      } catch {
        /* 파싱 실패 무시 */
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [steps]);

  // 같은 페이지 내 체크리스트 변경 감지를 위한 커스텀 이벤트
  useEffect(() => {
    const handleChecklistUpdate = () => {
      const result: Record<number, number> = {};
      for (const step of steps) {
        try {
          const saved = localStorage.getItem(`guide-checklist-step-${step.step}`);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              const done = parsed.filter(Boolean).length;
              result[step.step] = step.checklistLength > 0 ? done / step.checklistLength : 0;
            }
          }
        } catch {
          /* 무시 */
        }
      }
      setProgress(result);
    };

    window.addEventListener("checklist-updated", handleChecklistUpdate);
    return () => window.removeEventListener("checklist-updated", handleChecklistUpdate);
  }, [steps]);

  return (
    <section className={s.timelineOverview}>
      <p className={s.timelineNote}>
        일부 단계는 병행할 수 있으며, 이전 단계로 돌아가는 것은 자연스러운 과정이에요.
      </p>
      <div className={s.timelineTrack}>
        {steps.map((step, i) => {
          const Icon = STEP_ICONS[step.step] ?? Search;
          const ratio = progress[step.step] ?? 0;
          const isComplete = ratio >= 1;
          const hasProgress = mounted && ratio > 0;

          return (
            <TimelineLink key={step.step} stepId={`step-${step.step}`} className={s.timelineDot}>
              <span className={s.timelineDotStep}>Step {step.step}</span>
              <div
                className={`${s.timelineDotIcon} ${
                  isComplete ? s.timelineDotComplete : hasProgress ? s.timelineDotInProgress : ""
                }`}
              >
                <Icon size={24} />
                {/* 진행률 링 (SVG) */}
                {hasProgress && (
                  <svg className={s.progressRing} viewBox="0 0 44 44">
                    <circle
                      className={s.progressRingBg}
                      cx="22"
                      cy="22"
                      r="20"
                      fill="none"
                      strokeWidth="3"
                    />
                    <circle
                      className={s.progressRingFill}
                      cx="22"
                      cy="22"
                      r="20"
                      fill="none"
                      strokeWidth="3"
                      strokeDasharray={`${ratio * 125.6} 125.6`}
                      strokeLinecap="round"
                      transform="rotate(-90 22 22)"
                    />
                  </svg>
                )}
              </div>
              <span className={s.timelineDotLabel}>{step.title}</span>
              <span className={s.timelineDotPeriod}>
                {mounted && hasProgress
                  ? `${Math.round(ratio * 100)}%`
                  : step.period}
              </span>
              {i < steps.length - 1 && <div className={s.timelineConnector} />}
            </TimelineLink>
          );
        })}
      </div>
    </section>
  );
}
