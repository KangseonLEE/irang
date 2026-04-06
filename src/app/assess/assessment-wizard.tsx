"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  ListChecks,
  RotateCcw,
  Lightbulb,
  BarChart3,
  MessageSquareText,
  Share2,
  Check,
} from "lucide-react";
import {
  QUESTIONS,
  DIMENSIONS,
  RESULT_TIERS,
  calculateResult,
  type Answers,
  type AssessmentResult,
} from "@/lib/data/assessment";
import s from "./assessment-wizard.module.css";

/* ── 화면 상태 ── */
type Phase = "intro" | "quiz" | "result";

export function AssessmentWizard() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [copied, setCopied] = useState(false);

  const totalSteps = QUESTIONS.length;
  const currentQuestion = QUESTIONS[step];
  const progress = ((step + 1) / totalSteps) * 100;

  /* ── 핸들러 ── */

  const handleStart = useCallback(() => {
    setPhase("quiz");
    setStep(0);
    setAnswers({});
  }, []);

  const handleSelect = useCallback(
    (score: number) => {
      const qId = currentQuestion.id;
      setAnswers((prev) => ({ ...prev, [qId]: score }));

      // 자동 다음 이동 (250ms 딜레이)
      setTimeout(() => {
        if (step < totalSteps - 1) {
          setStep((s) => s + 1);
        } else {
          setPhase("result");
        }
      }, 250);
    },
    [currentQuestion, step, totalSteps]
  );

  const handleBack = useCallback(() => {
    if (step > 0) {
      setStep((s) => s - 1);
    } else {
      setPhase("intro");
    }
  }, [step]);

  const handleReset = useCallback(() => {
    setPhase("intro");
    setStep(0);
    setAnswers({});
    setCopied(false);
  }, []);

  const handleShare = useCallback(async () => {
    const url = window.location.origin + "/assess";
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback: 지원하지 않는 브라우저 */
    }
  }, []);

  // 결과 계산 (결과 화면일 때만)
  const result = useMemo<AssessmentResult | null>(
    () => (phase === "result" ? calculateResult(answers) : null),
    [phase, answers]
  );

  /* ═══ 인트로 화면 ═══ */
  if (phase === "intro") {
    return (
      <div className={s.page}>
        <div className={s.intro}>
          <span className={s.introEmoji}>🧑‍🌾</span>
          <h1 className={s.introTitle}>
            나는 귀농에<br />
            얼마나 준비되어 있을까?
          </h1>
          <p className={s.introDesc}>
            10가지 질문으로 나의 귀농 준비 상태를 객관적으로 점검하고,
            맞춤 행동 가이드를 받아보세요.
          </p>
          <div className={s.introMeta}>
            <span className={s.introMetaItem}>
              <Clock size={16} />
              약 3분
            </span>
            <span className={s.introMetaItem}>
              <ListChecks size={16} />
              10문항
            </span>
          </div>
          <button
            onClick={handleStart}
            className={s.introStartBtn}
            type="button"
          >
            진단 시작하기
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  /* ═══ 결과 화면 ═══ */
  if (phase === "result" && result) {
    const { totalScore, tier, dimensions } = result;

    // 가장 약한 차원 찾기
    const weakest = [...dimensions].sort((a, b) => a.percent - b.percent)[0];
    const weakDim = DIMENSIONS.find((d) => d.id === weakest.id);

    // matchParams → URL
    const matchUrl = `/match?experience=${tier.matchParams.experience}&lifestyle=${tier.matchParams.lifestyle}`;

    return (
      <div className={s.resultPage}>
        {/* 히어로 */}
        <div className={s.resultHero}>
          <span className={s.resultEmoji}>{tier.emoji}</span>
          <span className={s.resultTierLabel}>
            {tier.id === "starter" && "씨앗 단계"}
            {tier.id === "sprout" && "새싹 단계"}
            {tier.id === "seedling" && "모종 단계"}
            {tier.id === "ready" && "이랑 단계"}
          </span>
          <h1 className={s.resultTitle}>{tier.title}</h1>
          <span className={s.resultScore}>
            총점 {totalScore}점 / 40점
          </span>
          <p className={s.resultSummary}>{tier.summary}</p>
        </div>

        {/* 차원별 분석 */}
        <div className={s.card}>
          <div className={s.cardHeader}>
            <h2 className={s.cardTitle}>
              <BarChart3 size={18} />
              차원별 분석
            </h2>
          </div>
          <div className={s.cardContent}>
            <div className={s.dimensionList}>
              {dimensions.map((dim) => {
                const meta = DIMENSIONS.find((d) => d.id === dim.id);
                const isLow = dim.percent <= 37; // 3/8 이하
                return (
                  <div key={dim.id} className={s.dimensionRow}>
                    <div className={s.dimensionMeta}>
                      <span className={s.dimensionLabel}>
                        <span className={s.dimensionLabelIcon}>
                          {meta?.icon}
                        </span>
                        {dim.label}
                      </span>
                      <span className={s.dimensionPercent}>
                        {dim.percent}%
                      </span>
                    </div>
                    <div className={s.dimensionBarWrap}>
                      <div
                        className={`${s.dimensionBarFill} ${isLow ? s.dimensionBarLow : ""}`}
                        style={{ width: `${dim.percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 약한 차원 힌트 */}
        {weakest.percent <= 50 && weakDim && (
          <div className={s.weakDimHint}>
            <strong>{weakDim.icon} {weakDim.label}</strong> 영역이 상대적으로 부족해요. 이 부분을 보강하면 귀농 성공 확률이 크게 높아집니다!
          </div>
        )}

        {/* 상세 설명 */}
        <div className={s.card}>
          <div className={s.cardHeader}>
            <h2 className={s.cardTitle}>
              <MessageSquareText size={18} />
              상세 분석
            </h2>
          </div>
          <div className={s.cardContent}>
            <p className={s.resultDescription}>{tier.description}</p>
          </div>
        </div>

        {/* 실행 팁 */}
        <div className={s.card}>
          <div className={s.cardHeader}>
            <h2 className={s.cardTitle}>
              <Lightbulb size={18} />
              이렇게 시작해보세요
            </h2>
          </div>
          <div className={s.cardContent}>
            <ul className={s.tipsList}>
              {tier.tips.map((tip, i) => (
                <li key={i} className={s.tipItem}>
                  <span className={s.tipNumber}>{i + 1}</span>
                  <span className={s.tipText}>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA 버튼 */}
        <div className={s.resultActions}>
          <Link href={matchUrl} className={s.matchCta}>
            나에게 맞는 지역 찾기
            <ArrowRight size={18} />
          </Link>
          <div className={s.resultSubActions}>
            <button
              onClick={handleReset}
              className={s.retryBtn}
              type="button"
            >
              <RotateCcw size={16} />
              다시 진단하기
            </button>
            <button
              onClick={handleShare}
              className={s.shareBtn}
              type="button"
            >
              {copied ? <Check size={16} /> : <Share2 size={16} />}
              {copied ? "복사됨!" : "결과 공유"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ═══ 질문 화면 ═══ */
  const selectedScore = answers[currentQuestion?.id];

  return (
    <div className={s.page}>
      {/* 진행 바 */}
      <div className={s.progressWrap}>
        <div className={s.progressBar}>
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
        <span className={s.dimensionTag}>
          {currentQuestion.dimensionLabel}
        </span>
        <h1 className={s.questionTitle}>{currentQuestion.question}</h1>

        <div className={s.optionsList}>
          {currentQuestion.options.map((opt, i) => {
            const isSelected = selectedScore === opt.score;
            return (
              <button
                key={i}
                className={`${s.optionCard} ${isSelected ? s.optionSelected : ""}`}
                onClick={() => handleSelect(opt.score)}
                type="button"
              >
                <span className={s.optionNumber}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className={s.optionLabel}>{opt.label}</span>
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
          이전
        </button>
      </div>
    </div>
  );
}
