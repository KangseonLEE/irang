"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Lightbulb,
  BarChart3,
  MessageSquareText,
  Check,
  TrendingUp,
  ChevronRight,
  ExternalLink,
  MapPin,
} from "lucide-react";
import {
  QUESTIONS,
  DIMENSIONS,
  DEMOGRAPHIC_QUESTIONS,
  calculateResult,
  getDemographicHints,
  getDimensionGuide,
  type Answers,
  type DemographicAnswers,
  type AssessmentResult,
} from "@/lib/data/assessment";
import {
  TRACK_QUESTIONS,
  FARM_TYPES,
  type Answers as MatchAnswers,
} from "@/lib/data/match-questions";
import { classifyFarmType } from "@/lib/match-scoring";
import { analytics } from "@/lib/analytics";
import { ResultSaveCta } from "@/components/result/result-save-cta";
import s from "./assessment-wizard.module.css";

/* ── 화면 상태 ── */
type Phase = "demographic" | "quiz" | "track" | "result";

interface AssessmentWizardProps {
  onBack?: () => void;
}

export function AssessmentWizard({ onBack }: AssessmentWizardProps) {
  const [phase, setPhase] = useState<Phase>("demographic");
  const [demoStep, setDemoStep] = useState(0);
  const [demoAnswers, setDemoAnswers] = useState<DemographicAnswers>({});
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [trackStep, setTrackStep] = useState(0);
  const [trackAnswers, setTrackAnswers] = useState<MatchAnswers>({});

  // 빠른 연타 클릭 방어 — setTimeout 전환 중 추가 클릭 차단
  const transitionRef = useRef(false);

  const totalDemoSteps = DEMOGRAPHIC_QUESTIONS.length;
  const totalSteps = QUESTIONS.length;
  const totalTrackSteps = TRACK_QUESTIONS.length;
  const currentQuestion = QUESTIONS[step];

  // 진행률: 인구통계 + 진단 + 트랙 질문
  const totalAllSteps = totalDemoSteps + totalSteps + totalTrackSteps;
  const currentAllStep =
    phase === "demographic"
      ? demoStep + 1
      : phase === "quiz"
        ? totalDemoSteps + step + 1
        : phase === "track"
          ? totalDemoSteps + totalSteps + trackStep + 1
          : totalAllSteps;
  const progress = (currentAllStep / totalAllSteps) * 100;

  // 진입 시 분석 이벤트 전송
  useEffect(() => {
    analytics.assessStart();
  }, []);

  // 스텝 변경 시 step_view 이벤트 전송
  useEffect(() => {
    if (phase === "demographic") {
      const q = DEMOGRAPHIC_QUESTIONS[demoStep];
      if (q) analytics.assessStepView(demoStep + 1, q.id);
    } else if (phase === "quiz") {
      const q = QUESTIONS[step];
      if (q) analytics.assessStepView(totalDemoSteps + step + 1, q.id);
    }
  }, [phase, demoStep, step, totalDemoSteps]);

  /* ── 인구통계 선택 핸들러 ── */
  const handleDemoSelect = useCallback(
    (value: string) => {
      if (transitionRef.current) return;

      const qId = DEMOGRAPHIC_QUESTIONS[demoStep].id;
      setDemoAnswers((prev) => ({ ...prev, [qId]: value }));

      transitionRef.current = true;
      setTimeout(() => {
        transitionRef.current = false;
        if (demoStep < totalDemoSteps - 1) {
          setDemoStep((s) => s + 1);
        } else {
          setPhase("quiz");
        }
      }, 400);
    },
    [demoStep, totalDemoSteps]
  );

  /* ── 진단 선택 핸들러 ── */
  const handleSelect = useCallback(
    (score: number) => {
      if (transitionRef.current) return;

      const qId = currentQuestion.id;
      setAnswers((prev) => ({ ...prev, [qId]: score }));

      transitionRef.current = true;
      setTimeout(() => {
        transitionRef.current = false;
        if (step < totalSteps - 1) {
          setStep((s) => s + 1);
        } else {
          setPhase("track");
        }
      }, 400);
    },
    [currentQuestion, step, totalSteps]
  );

  /* ── 트랙 질문 선택 핸들러 ── */
  const handleTrackSelect = useCallback(
    (optionId: string) => {
      if (transitionRef.current) return;

      const qId = TRACK_QUESTIONS[trackStep].id;
      setTrackAnswers((prev) => ({ ...prev, [qId]: [optionId] }));

      transitionRef.current = true;
      setTimeout(() => {
        transitionRef.current = false;
        if (trackStep < totalTrackSteps - 1) {
          setTrackStep((s) => s + 1);
        } else {
          setPhase("result");
        }
      }, 400);
    },
    [trackStep, totalTrackSteps],
  );

  const handleBack = useCallback(() => {
    if (phase === "demographic") {
      if (demoStep > 0) {
        setDemoStep((s) => s - 1);
      } else if (onBack) {
        onBack();
      }
    } else if (phase === "quiz") {
      if (step > 0) {
        setStep((s) => s - 1);
      } else {
        // 진단 첫 문항에서 뒤로 가면 인구통계 마지막 문항으로
        setPhase("demographic");
        setDemoStep(totalDemoSteps - 1);
      }
    } else if (phase === "track") {
      if (trackStep > 0) {
        setTrackStep((s) => s - 1);
      } else {
        // 트랙 첫 문항에서 뒤로 가면 진단 마지막 문항으로
        setPhase("quiz");
        setStep(totalSteps - 1);
      }
    }
  }, [phase, step, demoStep, trackStep, totalDemoSteps, totalSteps, onBack]);

  const handleReset = useCallback(() => {
    transitionRef.current = false;
    setPhase("demographic");
    setDemoStep(0);
    setDemoAnswers({});
    setStep(0);
    setAnswers({});
    setTrackStep(0);
    setTrackAnswers({});
    window.scrollTo(0, 0);
  }, []);

  // 결과 계산 (결과 화면일 때만)
  const result = useMemo<AssessmentResult | null>(
    () => (phase === "result" ? calculateResult(answers) : null),
    [phase, answers]
  );

  // 결과 화면 진입 시 완료 이벤트 전송
  useEffect(() => {
    if (result) {
      analytics.assessComplete(result.tier.id, result.totalScore);
    }
  }, [result]);

  // 추천 국가지원 트랙 계산
  const farmType = useMemo(
    () => (phase === "result" ? classifyFarmType(trackAnswers, demoAnswers.ageGroup) : null),
    [phase, trackAnswers, demoAnswers.ageGroup],
  );

  /* ═══ 결과 화면 ═══ */
  if (phase === "result" && result) {
    const { totalScore, tier, dimensions } = result;

    // 가장 약한 차원 찾기
    const weakest = [...dimensions].sort((a, b) => a.percent - b.percent)[0];
    const weakDim = DIMENSIONS.find((d) => d.id === weakest.id);

    // 인구통계 기반 맞춤 지원 힌트
    const demoHints = getDemographicHints(demoAnswers);

    // matchParams → URL (인구통계 + 차원 점수 전달)
    const demoParams = demoAnswers.ageGroup ? `&ageGroup=${demoAnswers.ageGroup}` : "";
    const genderParam = demoAnswers.gender === "female" ? "&gender=female" : "";
    const dimParams = dimensions.map((d) => `${d.id}=${d.percent}`).join("&");
    const matchUrl = `/match?experience=${tier.matchParams.experience}&lifestyle=${tier.matchParams.lifestyle}${demoParams}${genderParam}&${dimParams}`;

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

        {/* 출력/공유 아이콘 */}
        <ResultSaveCta
          printTitle={`이랑 - 귀농 적합도 진단 결과 (${tier.title})`}
          shareText={`나의 귀농 준비 단계는 "${tier.title}" ${tier.emoji}\n${typeof window !== "undefined" ? `${window.location.origin}/assess` : ""}`}
        />

        {/* 상세 분석 */}
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

        {/* 추천 국가지원 트랙 */}
        {farmType && (
          <div className={s.trackCard}>
            <div className={s.trackCardHeader}>
              <span className={s.trackCardEmoji}>{farmType.emoji}</span>
              <div>
                <span className={s.trackCardOverline}>나에게 맞는 국가지원 트랙</span>
                <h2 className={s.trackCardLabel}>{farmType.label}</h2>
              </div>
            </div>
            <p className={s.trackCardTagline}>{farmType.tagline}</p>
            <p className={s.trackCardDesc}>{farmType.description}</p>
            <div className={s.trackCardTraits}>
              {farmType.traits.map((t) => (
                <span key={t} className={s.trackCardTrait}>#{t}</span>
              ))}
            </div>
            <Link href="/programs" className={s.trackCardLink}>
              관련 지원사업 확인하기
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* 보강 가이드 — 약한 차원(≤50%)에 대해 구체적 행동 안내 */}
        {(() => {
          const weakDims = [...dimensions]
            .filter((d) => d.percent <= 50)
            .sort((a, b) => a.percent - b.percent)
            .slice(0, 3);

          if (weakDims.length === 0) return null;

          return (
            <section className={s.reinforceSection}>
              <h2 className={s.reinforceTitle}>
                <TrendingUp size={18} />
                이렇게 보강해보세요
              </h2>
              <div className={s.reinforceCards}>
                {weakDims.map((dim) => {
                  const meta = DIMENSIONS.find((d) => d.id === dim.id);
                  const guide = getDimensionGuide(dim.id, dim.percent);
                  if (!meta || !guide) return null;

                  return (
                    <div key={dim.id} className={s.reinforceCard}>
                      <div className={s.reinforceCardTop}>
                        <span className={s.reinforceCardIcon}>{meta.icon}</span>
                        <strong className={s.reinforceCardLabel}>{meta.label}</strong>
                        <span className={s.reinforceCardScore}>{dim.percent}%</span>
                      </div>
                      <div className={s.reinforceBarWrap}>
                        <div
                          className={s.reinforceBarFill}
                          style={{ width: `${dim.percent}%` }}
                        />
                      </div>
                      <p className={s.reinforceCardMessage}>{guide.message}</p>
                      <ul className={s.reinforceActionList}>
                        {guide.actions.map((action, i) => (
                          <li key={i} className={s.reinforceAction}>
                            <span className={s.reinforceActionDot} />
                            <div className={s.reinforceActionContent}>
                              <Link
                                href={action.link}
                                className={s.reinforceActionLink}
                                {...(action.isExternal
                                  ? { target: "_blank", rel: "noopener noreferrer" }
                                  : {})}
                              >
                                {action.title}
                                {action.isExternal ? (
                                  <ExternalLink size={11} />
                                ) : (
                                  <ChevronRight size={13} />
                                )}
                              </Link>
                              <p className={s.reinforceActionDesc}>{action.description}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })()}

        {/* 맞춤 지원 안내 (인구통계 기반) */}
        {demoHints.length > 0 && (
          <section className={s.demoHintsSection}>
            <h2 className={s.demoHintsTitle}>나에게 맞는 지원사업</h2>
            <div className={s.demoHintsCards}>
              {demoHints.map((hint, i) => (
                <div key={i} className={s.demoHintCard}>
                  <span className={s.demoHintIcon}>
                    <Check size={14} />
                  </span>
                  <p className={s.demoHintText}>{hint}</p>
                </div>
              ))}
            </div>
            <Link href="/programs" className={s.demoHintsLink}>
              전체 지원사업 보기
              <ArrowRight size={14} />
            </Link>
          </section>
        )}

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

        {/* CTA 버튼 — 2단 */}
        <div className={s.resultActions}>
          <Link href={matchUrl} className={s.matchCta}>
            <MapPin size={16} />
            맞춤 지역 찾기
          </Link>
          <button
            onClick={handleReset}
            className={s.retryBtn}
            type="button"
          >
            <RotateCcw size={16} />
            다시 진단하기
          </button>
        </div>
      </div>
    );
  }

  // 방어: step/demoStep이 범위를 넘은 경우 graceful 처리
  if (phase === "quiz" && !currentQuestion) {
    setPhase("track");
  }
  if (phase === "demographic" && !DEMOGRAPHIC_QUESTIONS[demoStep]) {
    setPhase("quiz");
  }
  if (phase === "track" && !TRACK_QUESTIONS[trackStep]) {
    setPhase("result");
  }

  /* ═══ 트랙 질문 화면 (국가지원사업 분류) ═══ */
  if (phase === "track") {
    const currentTrack = TRACK_QUESTIONS[trackStep];
    const selectedTrackId = trackAnswers[currentTrack?.id]?.[0];

    return (
      <div className={s.page}>
        <div className={s.progressWrap}>
          <div
            className={s.progressBar}
            role="progressbar"
            aria-valuenow={currentAllStep}
            aria-valuemin={1}
            aria-valuemax={totalAllSteps}
            aria-label="진행률"
          >
            <div className={s.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <span className={s.progressLabel}>
            {currentAllStep} / {totalAllSteps}
          </span>
        </div>

        <button onClick={handleBack} className={s.navBtnBack} type="button">
          <ArrowLeft size={16} />
          이전
        </button>

        <div className={s.questionWrap}>
          <span className={s.dimensionTag}>국가지원 트랙</span>
          <h1 className={s.questionTitle}>{currentTrack.title}</h1>
          <p className={s.demoSubtitle}>{currentTrack.subtitle}</p>

          <div className={s.trackOptionsGrid}>
            {currentTrack.options.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedTrackId === opt.id;
              return (
                <button
                  key={opt.id}
                  className={`${s.trackOptionCard} ${isSelected ? s.trackOptionSelected : ""}`}
                  onClick={() => handleTrackSelect(opt.id)}
                  type="button"
                >
                  <div className={s.trackOptionIcon}>
                    <Icon size={24} />
                  </div>
                  <span className={s.trackOptionLabel}>{opt.label}</span>
                  {opt.description && (
                    <span className={s.trackOptionDesc}>{opt.description}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ═══ 인구통계 질문 화면 ═══ */
  if (phase === "demographic") {
    const currentDemo = DEMOGRAPHIC_QUESTIONS[demoStep];
    const selectedDemoValue = demoAnswers[currentDemo?.id];

    return (
      <div className={s.page}>
        <div className={s.progressWrap}>
          <div
            className={s.progressBar}
            role="progressbar"
            aria-valuenow={currentAllStep}
            aria-valuemin={1}
            aria-valuemax={totalAllSteps}
            aria-valuetext={`${totalAllSteps}단계 중 ${currentAllStep}단계`}
            aria-label="진행률"
          >
            <div className={s.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <span className={s.progressLabel}>
            {currentAllStep} / {totalAllSteps}
          </span>
        </div>

        <button onClick={handleBack} className={s.navBtnBack} type="button">
          <ArrowLeft size={16} />
          {demoStep === 0 ? "처음으로" : "이전"}
        </button>

        <div className={s.questionWrap}>
          <span className={s.dimensionTag}>기본 정보</span>
          <h1 className={s.questionTitle}>{currentDemo.question}</h1>
          <p className={s.demoSubtitle}>
            맞춤 지원사업 추천을 위해 사용되며, 진단 점수에는 반영되지 않습니다.
          </p>

          <div className={s.optionsList}>
            {currentDemo.options.map((opt, i) => {
              const isSelected = selectedDemoValue === opt.value;
              return (
                <button
                  key={i}
                  className={`${s.optionCard} ${isSelected ? s.optionSelected : ""}`}
                  onClick={() => handleDemoSelect(opt.value)}
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
      </div>
    );
  }

  /* ═══ 진단 질문 화면 ═══ */
  const selectedScore = answers[currentQuestion?.id];

  return (
    <div className={s.page}>
      {/* 진행 바 */}
      <div className={s.progressWrap}>
        <div
          className={s.progressBar}
          role="progressbar"
          aria-valuenow={currentAllStep}
          aria-valuemin={1}
          aria-valuemax={totalAllSteps}
          aria-label="진행률"
        >
          <div
            className={s.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={s.progressLabel}>
          {currentAllStep} / {totalAllSteps}
        </span>
      </div>

      {/* 이전 버튼 — 진행바 바로 아래 */}
      <button
        onClick={handleBack}
        className={s.navBtnBack}
        type="button"
      >
        <ArrowLeft size={16} />
        이전
      </button>

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
    </div>
  );
}
