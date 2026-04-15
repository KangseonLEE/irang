"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import {
  QUESTIONS,
  isValidOptionId,
  type Answers,
} from "@/lib/data/match-questions";
import {
  classifyFarmType,
  scoreProvinces,
  recommendCrops,
  getRecommendedPrograms,
} from "@/lib/match-scoring";
import { analytics } from "@/lib/analytics";
import {
  generateResultId,
  saveAssessmentResult,
} from "@/lib/assess-result";
import { useAssessmentHistory } from "@/hooks/use-assessment-history";
import { MatchResult } from "./match-result";
import s from "./match-wizard.module.css";

/* ── 컴포넌트 ── */

interface MatchWizardProps {
  onBack?: () => void;
}

export function MatchWizard({ onBack }: MatchWizardProps) {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResult, setShowResult] = useState(false);
  const [prefilled, setPrefilled] = useState<Set<string>>(new Set());
  const [resultId, setResultId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const { addResult } = useAssessmentHistory();

  // 빠른 연타 클릭 방어 — setTimeout 전환 중 추가 클릭 차단
  const transitionRef = useRef(false);

  // 매칭 시작 이벤트 (마운트 시 1회)
  useEffect(() => {
    analytics.matchStart();
  }, []);

  // 스텝 변경 시 step_view 이벤트 전송
  useEffect(() => {
    const q = QUESTIONS[step];
    if (q) {
      analytics.matchStepView(step + 1, q.id);
    }
  }, [step]);

  // URL 쿼리 파라미터로 pre-fill (진단 결과 → 맞춤추천 연결용)
  useEffect(() => {
    const experience = searchParams.get("experience");
    const lifestyle = searchParams.get("lifestyle");
    const newAnswers: Answers = {};
    const newPrefilled = new Set<string>();

    if (experience && isValidOptionId("experience", experience)) {
      newAnswers.experience = [experience];
      newPrefilled.add("experience");
    }
    if (lifestyle && isValidOptionId("lifestyle", lifestyle)) {
      newAnswers.lifestyle = [lifestyle];
      newPrefilled.add("lifestyle");
    }

    if (Object.keys(newAnswers).length > 0) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setAnswers((prev) => ({ ...prev, ...newAnswers }));
      setPrefilled(newPrefilled);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [searchParams]);

  const currentQuestion = QUESTIONS[step];
  const totalSteps = QUESTIONS.length;
  const progress = showResult
    ? 100
    : ((step + 1) / totalSteps) * 100;

  const handleSelect = useCallback(
    (optionId: string) => {
      // 단일 선택 전환 중 연타 방어
      if (!currentQuestion.multiple && transitionRef.current) return;

      const qId = currentQuestion.id;
      setAnswers((prev) => {
        const current = prev[qId] || [];
        if (currentQuestion.multiple) {
          // 토글
          const next = current.includes(optionId)
            ? current.filter((id) => id !== optionId)
            : [...current, optionId];
          return { ...prev, [qId]: next };
        }
        // 단일 선택 → 자동 다음
        return { ...prev, [qId]: [optionId] };
      });

      // 단일 선택: 자동으로 다음 단계
      if (!currentQuestion.multiple) {
        transitionRef.current = true;
        setTimeout(() => {
          transitionRef.current = false;
          if (step < totalSteps - 1) {
            setStep((s) => s + 1);
          } else {
            setShowResult(true);
          }
        }, 400);
      }
    },
    [currentQuestion, step, totalSteps]
  );

  const handleNext = useCallback(() => {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    } else {
      setShowResult(true);
    }
  }, [step, totalSteps]);

  const handleBack = useCallback(() => {
    if (showResult) {
      setShowResult(false);
    } else if (step > 0) {
      setStep((s) => s - 1);
    } else if (onBack) {
      onBack();
    }
  }, [step, showResult, onBack]);

  const handleReset = useCallback(() => {
    transitionRef.current = false;
    setStep(0);
    setAnswers({});
    setShowResult(false);
    window.scrollTo(0, 0);
  }, []);

  // 결과 화면 진입 시 완료 이벤트 + Supabase 저장 + localStorage 저장
  useEffect(() => {
    if (!showResult) return;

    analytics.matchComplete();

    // 결과 저장 (1회만 실행)
    if (saveStatus !== "idle") return;
    setSaveStatus("saving");

    const id = generateResultId();
    setResultId(id);

    const ft = classifyFarmType(answers);
    const provinces = scoreProvinces(answers);
    const crops = recommendCrops(answers, provinces);

    // localStorage 히스토리 저장
    addResult({
      resultId: id,
      farmTypeId: ft.id,
      farmTypeLabel: ft.label,
      topRegions: provinces.slice(0, 3).map((p) => p.province.shortName),
    });

    // Supabase 저장 (fire-and-forget, 실패해도 결과는 표시)
    saveAssessmentResult({
      id,
      answers,
      farm_type_id: ft.id,
      top_regions: provinces.slice(0, 3).map((p) => p.province.id),
      top_crops: crops.slice(0, 4).map((c) => c.crop.id),
      recommended_programs: ft.programIds.slice(0, 5),
      referrer: searchParams.get("utm_source"),
    })
      .then((res) => setSaveStatus(res.success ? "saved" : "error"))
      .catch(() => setSaveStatus("error"));
  }, [showResult]); // eslint-disable-line react-hooks/exhaustive-deps

  // 결과 계산
  const topProvinces = useMemo(
    () => (showResult ? scoreProvinces(answers) : []),
    [showResult, answers]
  );

  const recommendedCrops = useMemo(
    () => (showResult ? recommendCrops(answers, topProvinces) : []),
    [showResult, answers, topProvinces]
  );

  // 유형 분류
  const farmType = useMemo(
    () => (showResult ? classifyFarmType(answers) : null),
    [showResult, answers]
  );

  const recommendedPrograms = useMemo(
    () => (farmType ? getRecommendedPrograms(farmType) : []),
    [farmType]
  );

  const selectedForCurrent = answers[currentQuestion?.id] || [];

  // 방어: step이 범위를 넘은 경우 결과 화면으로 전환
  if (!showResult && !currentQuestion) {
    setShowResult(true);
  }

  /* ── 결과 화면 ── */
  if (showResult && farmType) {
    return (
      <MatchResult
        farmType={farmType}
        topProvinces={topProvinces}
        recommendedCrops={recommendedCrops}
        recommendedPrograms={recommendedPrograms}
        resultId={resultId}
        saveStatus={saveStatus}
        onReset={handleReset}
      />
    );
  }

  /* ── 질문 화면 ── */
  return (
    <div className={s.page}>
      {/* 진행 바 */}
      <div className={s.progressWrap}>
        <div
          className={s.progressBar}
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-valuetext={`${totalSteps}단계 중 ${step + 1}단계`}
          aria-label="진행률"
        >
          <div
            className={s.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={s.progressLabel}>
          {step + 1} / {totalSteps}
        </span>
      </div>

      {/* 질문 */}
      <div className={s.questionWrap}>
        <h1 className={s.questionTitle}>{currentQuestion.title}</h1>
        <p className={s.questionSubtitle}>{currentQuestion.subtitle}</p>

        {/* pre-fill 안내 */}
        {prefilled.has(currentQuestion.id) && selectedForCurrent.length > 0 && (
          <p className={s.prefillHint}>
            적합성 진단 결과를 바탕으로 미리 선택되었어요. 변경할 수도 있습니다.
          </p>
        )}

        <div className={s.optionsGrid}>
          {currentQuestion.options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedForCurrent.includes(opt.id);
            return (
              <button
                key={opt.id}
                className={`${s.optionCard} ${isSelected ? s.optionSelected : ""}`}
                onClick={() => handleSelect(opt.id)}
                type="button"
              >
                <div className={s.optionIcon}>
                  <Icon size={24} />
                </div>
                <span className={s.optionLabel}>{opt.label}</span>
                {opt.description && (
                  <span className={s.optionDesc}>{opt.description}</span>
                )}
                {currentQuestion.multiple && (
                  <div
                    className={`${s.optionCheck} ${isSelected ? s.optionCheckActive : ""}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 네비게이션 */}
      <div className={s.navBar}>
        <button
          onClick={handleBack}
          className={s.navBtnBack}
          type="button"
        >
          <ArrowLeft size={16} />
          {step === 0 ? "처음으로" : "이전"}
        </button>

        {/* pre-fill된 단일 선택 질문: 건너뛰기 버튼 표시 */}
        {!currentQuestion.multiple &&
          prefilled.has(currentQuestion.id) &&
          selectedForCurrent.length > 0 && (
            <button
              onClick={handleNext}
              className={s.navBtnNext}
              type="button"
            >
              이대로 넘어가기
              <ArrowRight size={16} />
            </button>
          )}

        {currentQuestion.multiple && (
          <button
            onClick={handleNext}
            disabled={selectedForCurrent.length === 0}
            className={s.navBtnNext}
            type="button"
          >
            {step < totalSteps - 1 ? "다음" : "결과 보기"}
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
