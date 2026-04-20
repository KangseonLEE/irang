"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDashed, Sparkles } from "lucide-react";
import s from "./my-progress.module.css";

const STEP_NAMES = ["정보 탐색", "교육 이수", "지역 선정", "영농 시작", "정착 안정"];
const STEP_CHECKLIST_LENGTHS = [8, 6, 8, 7, 6];

interface StepProgress {
  step: number;
  title: string;
  ratio: number;
}

interface AssessHistoryItem {
  farmTypeLabel: string;
  topRegions: string[];
  savedAt: string;
}

export function MyProgress() {
  const [steps, setSteps] = useState<StepProgress[] | null>(null);
  const [assessResult, setAssessResult] = useState<AssessHistoryItem | null>(null);

  useEffect(() => {
    const stepProgress: StepProgress[] = [];
    let hasAny = false;

    for (let i = 0; i < 5; i++) {
      const key = `guide-checklist-step-${i + 1}`;
      let ratio = 0;
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) {
            const done = arr.filter(Boolean).length;
            ratio = STEP_CHECKLIST_LENGTHS[i] > 0 ? done / STEP_CHECKLIST_LENGTHS[i] : 0;
            if (done > 0) hasAny = true;
          }
        }
      } catch { /* ignore */ }
      stepProgress.push({ step: i + 1, title: STEP_NAMES[i], ratio });
    }

    try {
      const raw = localStorage.getItem("irang_assess_history");
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length > 0) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setAssessResult(arr[0]);
          hasAny = true;
        }
      }
    } catch { /* ignore */ }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (hasAny) setSteps(stepProgress);
  }, []);

  if (!steps) return null;

  const totalDone = steps.reduce((sum, st) => {
    const idx = st.step - 1;
    return sum + Math.round(st.ratio * STEP_CHECKLIST_LENGTHS[idx]);
  }, 0);
  const totalItems = STEP_CHECKLIST_LENGTHS.reduce((a, b) => a + b, 0);
  const overallPercent = Math.round((totalDone / totalItems) * 100);

  return (
    <section className={s.section} aria-label="나의 귀농 준비 현황">
      <div className={s.header}>
        <div className={s.headerLeft}>
          <Sparkles size={18} className={s.headerIcon} />
          <h2 className={s.title}>나의 준비 현황</h2>
        </div>
        <Link href="/guide" className={s.viewAll}>
          가이드 보기 <ArrowRight size={14} />
        </Link>
      </div>

      <div className={s.card}>
        <div className={s.overallRow}>
          <span className={s.overallLabel}>전체 진행률</span>
          <span className={s.overallPercent}>{overallPercent}%</span>
        </div>
        <div className={s.progressBar}>
          <div
            className={s.progressFill}
            style={{ width: `${overallPercent}%` }}
          />
        </div>

        <div className={s.stepsRow}>
          {steps.map((st) => {
            const isComplete = st.ratio >= 1;
            const hasProgress = st.ratio > 0;
            return (
              <div key={st.step} className={s.stepItem}>
                <div className={`${s.stepIcon} ${isComplete ? s.stepComplete : hasProgress ? s.stepInProgress : ""}`}>
                  {isComplete ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <CircleDashed size={16} />
                  )}
                </div>
                <span className={s.stepLabel}>{st.title}</span>
                {hasProgress && (
                  <span className={s.stepPercent}>{Math.round(st.ratio * 100)}%</span>
                )}
              </div>
            );
          })}
        </div>

        {assessResult && (
          <div className={s.assessRow}>
            <span className={s.assessLabel}>진단 결과</span>
            <Link href="/assess" className={s.assessValue}>
              {assessResult.farmTypeLabel}
              {assessResult.topRegions.length > 0 && (
                <span className={s.assessRegion}>
                  · {assessResult.topRegions.slice(0, 2).join(", ")}
                </span>
              )}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
