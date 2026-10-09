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
  type Answers as MatchAnswers,
} from "@/lib/data/match-questions";
import { classifyFarmType } from "@/lib/match-scoring";
import { analytics } from "@/lib/analytics";
import { saveAssessmentResult, generateResultId } from "@/lib/assess-result";
import { ResultSaveCta } from "@/components/result/result-save-cta";
import { PersonaRecommendationSection } from "@/components/match/persona-recommendation-section";
import { assessSharePath, encodeAssessScore } from "@/lib/diagnosis/assess-share-code";
import { useDiagnosisHistory } from "@/lib/diagnosis/use-diagnosis-history";
import { useWizardBackGuard } from "@/lib/diagnosis/use-wizard-back-guard";
import s from "./assessment-wizard.module.css";

/* ── 화면 상태 ── */
type Phase = "demographic" | "quiz" | "track" | "result";

/** 이전 결과 다시 보기 — 세 단계 답을 그대로 받아 결과 화면부터 연다 */
interface AssessmentReview {
  answers: Answers;
  demo: DemographicAnswers;
  track: MatchAnswers;
}

interface AssessmentWizardProps {
  onBack?: () => void;
  /** 이전 결과 다시 보기 — 분석 이벤트·저장 없이 결과 화면만 (M7 완료 지표가 부풀지 않게) */
  review?: AssessmentReview;
  /** 다시 보기에서 "다시 진단하기" — 새 진단으로 (게이트웨이가 주소를 바꾼다) */
  onRestart?: () => void;
}

export function AssessmentWizard({ onBack, review, onRestart }: AssessmentWizardProps) {
  const isReview = review !== undefined;
  const totalDemoSteps = DEMOGRAPHIC_QUESTIONS.length;
  const totalSteps = QUESTIONS.length;
  const totalTrackSteps = TRACK_QUESTIONS.length;

  const [phase, setPhase] = useState<Phase>(isReview ? "result" : "demographic");
  const [demoStep, setDemoStep] = useState(isReview ? totalDemoSteps - 1 : 0);
  const [demoAnswers, setDemoAnswers] = useState<DemographicAnswers>(review?.demo ?? {});
  const [step, setStep] = useState(isReview ? totalSteps - 1 : 0);
  const [answers, setAnswers] = useState<Answers>(review?.answers ?? {});
  const [trackStep, setTrackStep] = useState(isReview ? totalTrackSteps - 1 : 0);
  const [trackAnswers, setTrackAnswers] = useState<MatchAnswers>(review?.track ?? {});
  const { addResult } = useDiagnosisHistory();

  // 빠른 연타 클릭 방어 — setTimeout 전환 중 추가 클릭 차단
  const transitionRef = useRef(false);
  /** 마지막으로 저장한 결과의 답 — 같은 결과는 한 번만 저장·계측 ("다시 진단하기"는 새로 센다) */
  const savedKeyRef = useRef<string | null>(null);

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

  // 영역(phase) 별 진행 상태 — 3구간 progress bar
  const phaseLabel =
    phase === "demographic"
      ? "기본 정보"
      : phase === "quiz"
        ? "적합도 진단"
        : "지원 트랙";
  const phaseCurrent =
    phase === "demographic"
      ? demoStep + 1
      : phase === "quiz"
        ? step + 1
        : trackStep + 1;
  const phaseTotal =
    phase === "demographic"
      ? totalDemoSteps
      : phase === "quiz"
        ? totalSteps
        : totalTrackSteps;

  // 각 segment 내부 fill 비율 (0~100)
  const demoFill =
    phase === "demographic"
      ? ((demoStep + 1) / totalDemoSteps) * 100
      : 100;
  const quizFill =
    phase === "demographic"
      ? 0
      : phase === "quiz"
        ? ((step + 1) / totalSteps) * 100
        : 100;
  const trackFill =
    phase === "track"
      ? ((trackStep + 1) / totalTrackSteps) * 100
      : phase === "result"
        ? 100
        : 0;

  // 각 segment 폭 (전체 단계 대비 비율)
  const demoWidth = (totalDemoSteps / totalAllSteps) * 100;
  const quizWidth = (totalSteps / totalAllSteps) * 100;
  const trackWidth = (totalTrackSteps / totalAllSteps) * 100;

  // active 상태 캐시 — phase narrowing 회피
  const demoActive: boolean = phase === "demographic";
  const quizActive: boolean = phase === "quiz";
  const trackActive: boolean = phase === "track";

  // 진입 시 분석 이벤트 전송 — 다시 보기는 새 진단이 아니다
  useEffect(() => {
    if (!isReview) analytics.assessStart();
  }, [isReview]);

  // 스텝 변경 시 step_view 이벤트 전송
  useEffect(() => {
    if (isReview) return;
    if (phase === "demographic") {
      const q = DEMOGRAPHIC_QUESTIONS[demoStep];
      if (q) analytics.assessStepView(demoStep + 1, q.id);
    } else if (phase === "quiz") {
      const q = QUESTIONS[step];
      if (q) analytics.assessStepView(totalDemoSteps + step + 1, q.id);
    }
  }, [phase, demoStep, step, totalDemoSteps, isReview]);

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
    if (isReview) {
      onBack?.(); // 다시 보기의 뒤로 = 목록으로
      return;
    }
    if (phase === "result") {
      // 결과에서 뒤로(브라우저 뒤로가기) — 마지막 트랙 문항으로, 답은 그대로
      setPhase("track");
      setTrackStep(totalTrackSteps - 1);
    } else if (phase === "demographic") {
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
  }, [phase, step, demoStep, trackStep, totalDemoSteps, totalSteps, totalTrackSteps, onBack, isReview]);

  const handleReset = useCallback(() => {
    if (isReview) {
      onRestart?.();
      return;
    }
    transitionRef.current = false;
    savedKeyRef.current = null;
    setPhase("demographic");
    setDemoStep(0);
    setDemoAnswers({});
    setStep(0);
    setAnswers({});
    setTrackStep(0);
    setTrackAnswers({});
    window.scrollTo(0, 0);
  }, [isReview, onRestart]);

  // 브라우저 뒤로가기 = 한 문항 뒤로 — 세 단계(기본 정보·적합도·트랙)와 결과를 한 줄로 센 위치.
  // 다시 보기는 게이트웨이 몫이라 끈다
  const depth =
    phase === "demographic"
      ? demoStep
      : phase === "quiz"
        ? totalDemoSteps + step
        : phase === "track"
          ? totalDemoSteps + totalSteps + trackStep
          : totalDemoSteps + totalSteps + totalTrackSteps;
  useWizardBackGuard(isReview ? 0 : depth, handleBack);

  // 결과 계산 (결과 화면일 때만)
  const result = useMemo<AssessmentResult | null>(
    () => (phase === "result" ? calculateResult(answers) : null),
    [phase, answers]
  );

  // 추천 국가지원 트랙 계산
  const farmType = useMemo(
    () => (phase === "result" ? classifyFarmType(trackAnswers, demoAnswers.ageGroup) : null),
    [phase, trackAnswers, demoAnswers.ageGroup],
  );

  // ── Supabase 적재 (Sprint H D2 Fix-1, 2026-05-19) + 이전 결과 목록 저장 (2026-10-06) ──
  // 14문항 정밀 wizard가 25일째 0건 black hole이었던 root cause = 이 호출 누락.
  // match-wizard.tsx 패턴(source='full') 동일 적용. fire-and-forget — 실패해도 결과 화면 유지.
  // 라이브 silent fail 방지: catch에서 console.warn으로 표면화 (5/14 supabase silent fail 박제 가드)
  // 같은 답으로 결과를 다시 보면(뒤로 갔다 돌아옴) 한 번만 저장한다. 답을 바꾸거나 "다시 진단하기"로 새로 마치면
  // 새 결과로 저장한다 — 예전 savedRef(인스턴스당 한 번)는 다시 진단한 결과를 버렸다.
  useEffect(() => {
    if (!result || !farmType || isReview) return;
    const key = JSON.stringify([answers, demoAnswers, trackAnswers]);
    if (savedKeyRef.current === key) return;
    savedKeyRef.current = key;

    // 완료 이벤트도 결과 한 건에 한 번 — 브라우저 뒤로가기로 결과를 다시 봐도 M7 완료 수가 늘지 않게
    analytics.assessComplete(result.tier.id, result.totalScore);

    const id = generateResultId();
    addResult({
      kind: "assess",
      resultId: id,
      answers,
      demo: demoAnswers,
      track: trackAnswers,
      farmTypeId: farmType.id,
      farmTypeLabel: farmType.label,
    });

    saveAssessmentResult({
      id,
      answers: {
        ...answers,
        // 14문항 정밀 wizard 컨텍스트 — answers JSON에 보존
        __assess_tier: result.tier.id,
        __assess_total_score: result.totalScore,
        __track_answers: trackAnswers,
      },
      farm_type_id: farmType.id,
      top_regions: [],
      top_crops: [],
      recommended_programs: [],
      referrer:
        typeof document !== "undefined" && document.referrer
          ? document.referrer
          : null,
      age_group: demoAnswers.ageGroup ?? null,
      source: "full",
    })
      .then((res) => {
        if (!res.success) {
          console.warn("[assess] save failed:", res.error);
        }
      })
      .catch((err) => {
        console.warn("[assess] save exception:", err);
      });
  }, [result, farmType, answers, trackAnswers, demoAnswers, isReview, addResult]);

  /* ═══ 결과 화면 ═══ */
  if (phase === "result" && result) {
    const { totalScore, tier, dimensions } = result;
    // 공유 링크용 결과 코드 — /assess/r/[data] 가 같은 값으로 결과를 다시 그린다
    const shareCode = encodeAssessScore(tier.id, totalScore, dimensions, demoAnswers.ageGroup);

    // 인구통계 기반 맞춤 지원 힌트
    const demoHints = getDemographicHints(demoAnswers);

    // matchParams → URL (인구통계 + 차원 점수 전달)
    const demoParams = demoAnswers.ageGroup ? `&ageGroup=${demoAnswers.ageGroup}` : "";
    const genderParam = demoAnswers.gender === "female" ? "&gender=female" : "";
    const dimParams = dimensions.map((d) => `${d.id}=${d.percent}`).join("&");
    const matchUrl = `/match?experience=${tier.matchParams.experience}&lifestyle=${tier.matchParams.lifestyle}${demoParams}${genderParam}&${dimParams}`;

    return (
      <div className={s.resultPage}>
        {/* 이전 결과 다시 보기 — 목록으로 돌아가는 길 (결과 화면엔 원래 뒤로 버튼이 없다) */}
        {isReview && (
          <button onClick={handleBack} className={s.navBtnBack} type="button">
            <ArrowLeft size={16} aria-hidden="true" />
            이전 진단 목록
          </button>
        )}

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

        {/* 출력/공유 아이콘 — 공유는 이 결과 화면(/a/…) 주소. 예전엔 진단 첫 화면(/assess)을 복사했다 (4/18~, 10/6 QA Q4-W11) */}
        <ResultSaveCta
          printTitle={`이랑 - 농촌 정착 적합도 진단 결과 (${tier.title})`}
          shareText={
            shareCode
              ? `나의 정착 준비 단계는 "${tier.title}" ${tier.emoji}\n${typeof window !== "undefined" ? window.location.origin : ""}${assessSharePath(shareCode)}`
              : undefined
          }
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
              추천 지원사업 확인하기
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* 페르소나 추천 — 시군구 deep link + 추천 picks (작물 + 사업) */}
        <PersonaRecommendationSection ageGroup={demoAnswers.ageGroup} />

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
                                  ? { target: "_blank", rel: "noopener", referrerPolicy: "origin" as const }
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
            aria-valuetext={`${phaseLabel} ${phaseCurrent} / ${phaseTotal}`}
            aria-label="진행률"
          >
            <div
              className={`${s.progressSegment} ${demoActive ? s.progressSegmentActive : ""}`}
              style={{ width: `${demoWidth}%` }}
            >
              <div
                className={s.progressFill}
                style={{ width: `${demoFill}%` }}
              />
            </div>
            <div
              className={`${s.progressSegment} ${quizActive ? s.progressSegmentActive : ""}`}
              style={{ width: `${quizWidth}%` }}
            >
              <div
                className={s.progressFill}
                style={{ width: `${quizFill}%` }}
              />
            </div>
            <div
              className={`${s.progressSegment} ${trackActive ? s.progressSegmentActive : ""}`}
              style={{ width: `${trackWidth}%` }}
            >
              <div
                className={s.progressFill}
                style={{ width: `${trackFill}%` }}
              />
            </div>
          </div>
          <span className={s.progressLabel}>
            {phaseLabel} {phaseCurrent} / {phaseTotal}
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
            aria-valuetext={`${phaseLabel} ${phaseCurrent} / ${phaseTotal}`}
            aria-label="진행률"
          >
            <div
              className={`${s.progressSegment} ${demoActive ? s.progressSegmentActive : ""}`}
              style={{ width: `${demoWidth}%` }}
            >
              <div
                className={s.progressFill}
                style={{ width: `${demoFill}%` }}
              />
            </div>
            <div
              className={`${s.progressSegment} ${quizActive ? s.progressSegmentActive : ""}`}
              style={{ width: `${quizWidth}%` }}
            >
              <div
                className={s.progressFill}
                style={{ width: `${quizFill}%` }}
              />
            </div>
            <div
              className={`${s.progressSegment} ${trackActive ? s.progressSegmentActive : ""}`}
              style={{ width: `${trackWidth}%` }}
            >
              <div
                className={s.progressFill}
                style={{ width: `${trackFill}%` }}
              />
            </div>
          </div>
          <span className={s.progressLabel}>
            {phaseLabel} {phaseCurrent} / {phaseTotal}
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
            맞춤 지원사업 추천에만 쓰이고, 진단 점수에는 반영되지 않아요.
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
          aria-valuetext={`${phaseLabel} ${phaseCurrent} / ${phaseTotal}`}
          aria-label="진행률"
        >
          <div
            className={`${s.progressSegment} ${demoActive ? s.progressSegmentActive : ""}`}
            style={{ width: `${demoWidth}%` }}
          >
            <div
              className={s.progressFill}
              style={{ width: `${demoFill}%` }}
            />
          </div>
          <div
            className={`${s.progressSegment} ${quizActive ? s.progressSegmentActive : ""}`}
            style={{ width: `${quizWidth}%` }}
          >
            <div
              className={s.progressFill}
              style={{ width: `${quizFill}%` }}
            />
          </div>
          <div
            className={`${s.progressSegment} ${trackActive ? s.progressSegmentActive : ""}`}
            style={{ width: `${trackWidth}%` }}
          >
            <div
              className={s.progressFill}
              style={{ width: `${trackFill}%` }}
            />
          </div>
        </div>
        <span className={s.progressLabel}>
          {phaseLabel} {phaseCurrent} / {phaseTotal}
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
