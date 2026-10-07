"use client";

/**
 * 빠른 점검 (Quick Check) — 4문항 1분 자기 점검 위저드
 *
 * Phase 2c (2026-05-15) 자기 점검 페이지 sprint
 *
 * 흐름
 *   1. 4문항 단일 선택 (자동 진행, 400ms 전환)
 *   2. 결과 화면: 페르소나 카드 1개 + 추천 3장 (지역·작물·지원)
 *   3. "더 자세히" CTA → /match?mode=assess (14문항)
 *
 * 디자인 결정
 *   - match-wizard.tsx 의 CSS 패턴 재사용 (progress bar + 옵션 그리드)
 *   - 결과 화면은 페르소나 라벨·메시지 + 3개 deep link 카드로 단순화
 *   - URL deep link: /regions/ranking?persona=... (Phase 6 A안 완료된 시스템) — '기본 균등'은 quick-links.ts
 *   - 결과는 "이전 진단 결과"(localStorage)에 남긴다 (2026-10-06 — 재방문 지표. 예전엔 저장 안 함)
 *   - 브라우저 뒤로가기 = 한 문항 뒤로 (lib/diagnosis/use-wizard-back-guard.ts)
 *
 * 분석 이벤트 (analytics.ts 신규)
 *   - quickCheckStart: 마운트 시 1회
 *   - quickCheckStepView: 각 step 진입 시
 *   - quickCheckComplete: 결과 도달 시 (label = 페르소나 ID)
 */

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  MapPin,
  Wheat,
  HandCoins,
  ClipboardCheck,
} from "lucide-react";
import {
  QUICK_QUESTIONS,
  mapToPersona,
  getResultMessage,
  type QuickAnswers,
} from "@/lib/data/quick-check";
import { getPersona } from "@/lib/data/personas";
import { analytics } from "@/lib/analytics";
import {
  generateResultId,
  saveAssessmentResult,
} from "@/lib/assess-result";
import { quickRecommendationLinks } from "./quick-links";
import { useDiagnosisHistory } from "@/lib/diagnosis/use-diagnosis-history";
import { useWizardBackGuard } from "@/lib/diagnosis/use-wizard-back-guard";
import s from "./match-wizard.module.css";
import qs from "./quick-wizard.module.css";

// Sprint I (2026-05-20): 질문 화면은 qs.* (assessment-wizard 패턴 그린 변종) 사용.
// 결과 화면은 기존 s.progressWrap/progressBar/progressFill 유지 (match-wizard 패턴).

interface QuickWizardProps {
  onBack?: () => void;
  /**
   * 이전 결과 다시 보기 — 저장해 둔 답으로 결과 화면부터 연다.
   * 다시 보기는 새 점검이 아니라 분석 이벤트·저장을 하지 않는다(M7 완료 지표가 부풀지 않게).
   */
  review?: QuickAnswers;
  /** 다시 보기에서 "다시 점검하기" — 새 점검으로 (게이트웨이가 주소를 바꾼다) */
  onRestart?: () => void;
}

export function QuickWizard({ onBack, review, onRestart }: QuickWizardProps) {
  const isReview = review !== undefined;
  const totalSteps = QUICK_QUESTIONS.length;
  const [step, setStep] = useState(isReview ? totalSteps - 1 : 0);
  const [answers, setAnswers] = useState<QuickAnswers>(review ?? {});
  const [showResult, setShowResult] = useState(isReview);
  const { addResult } = useDiagnosisHistory();

  // 빠른 연타 클릭 방어
  const transitionRef = useRef(false);
  /** 마지막으로 저장한 답 — 결과 화면을 앞뒤로 오가도 같은 결과는 한 번만 저장 */
  const savedAnswersRef = useRef<string | null>(null);

  const currentQuestion = QUICK_QUESTIONS[step];
  const progress = showResult ? 100 : ((step + 1) / totalSteps) * 100;

  // 시작 이벤트 (마운트 시 1회) — 다시 보기는 새 점검이 아니다
  useEffect(() => {
    if (!isReview) analytics.quickCheckStart();
  }, [isReview]);

  // 스텝 변경 시 step_view 이벤트 전송
  useEffect(() => {
    if (isReview) return;
    const q = QUICK_QUESTIONS[step];
    if (q) {
      analytics.quickCheckStepView(step + 1, q.id);
    }
  }, [step, isReview]);

  const handleSelect = useCallback(
    (optionId: string) => {
      if (transitionRef.current) return;

      const qId = currentQuestion.id;
      setAnswers((prev) => ({ ...prev, [qId]: optionId } as QuickAnswers));

      transitionRef.current = true;
      setTimeout(() => {
        transitionRef.current = false;
        if (step < totalSteps - 1) {
          setStep((s) => s + 1);
        } else {
          setShowResult(true);
        }
      }, 400);
    },
    [currentQuestion, step, totalSteps],
  );

  const handleBack = useCallback(() => {
    if (isReview) {
      onBack?.(); // 다시 보기의 뒤로 = 목록으로
    } else if (showResult) {
      setShowResult(false);
    } else if (step > 0) {
      setStep((s) => s - 1);
    } else if (onBack) {
      onBack();
    }
  }, [step, showResult, onBack, isReview]);

  const handleReset = useCallback(() => {
    if (isReview) {
      onRestart?.();
      return;
    }
    transitionRef.current = false;
    savedAnswersRef.current = null;
    setStep(0);
    setAnswers({});
    setShowResult(false);
    window.scrollTo(0, 0);
  }, [isReview, onRestart]);

  // 브라우저 뒤로가기 = 한 단계 뒤로 (결과 → 마지막 문항 → … → 첫 문항). 다시 보기는 게이트웨이 몫이라 끈다
  useWizardBackGuard(isReview ? 0 : showResult ? totalSteps : step, handleBack);

  // 결과 도달 시 분석 이벤트 + Supabase 가벼운 row 적재 (2026-05-18 A안) + 이전 결과 목록 저장 (10/6)
  // 같은 답의 결과는 이벤트·저장 모두 한 번 — 결과에 다시 들어올 때마다 완료 이벤트가 나가던 것 (10/6 2차 QA R2-Q4)
  useEffect(() => {
    if (!showResult || isReview) return;
    const key = JSON.stringify(answers);
    if (savedAnswersRef.current === key) return;
    savedAnswersRef.current = key;

    const persona = mapToPersona(answers);
    analytics.quickCheckComplete(persona);

    const id = generateResultId();
    addResult({ kind: "quick", resultId: id, answers });

    // Quick wizard 적재 — source='quick'으로 정식 wizard와 구분.
    // 마이그레이션 미적용 시 route가 202 fallback 반환, 라이브 silent fail X.
    saveAssessmentResult({
      id,
      answers: answers as Record<string, unknown>,
      top_regions: [],
      top_crops: [],
      recommended_programs: [],
      referrer: null,
      source: "quick",
      persona,
    }).catch(() => {
      // fire-and-forget — 학습 데이터 적재 실패해도 UX는 결과 화면 유지
    });
  }, [showResult, answers, isReview, addResult]);

  /* ═══ 결과 화면 ═══ */
  if (showResult) {
    const persona = mapToPersona(answers);
    const personaInfo = getPersona(persona);
    const message = getResultMessage(persona);
    const recommend = quickRecommendationLinks(persona);
    /** '기본 균등'은 작물·지원사업을 맞춤 정렬하지 않고 전체 목록으로 보낸다 */
    const generic = persona === "balanced";

    return (
      <div className={s.page}>
        <div className={s.progressWrap}>
          <button
            type="button"
            onClick={handleBack}
            className={qs.backBtn}
            aria-label={isReview ? "이전 진단 목록으로" : "이전 단계로"}
          >
            <ArrowLeft size={18} />
          </button>
          <div className={s.progressBar}>
            <div className={s.progressFill} style={{ width: "100%" }} />
          </div>
          <span className={s.progressLabel}>결과</span>
        </div>

        <section className={qs.resultHero} aria-labelledby="quick-result-title">
          <span className={qs.resultEyebrow}>{message.eyebrow}</span>
          <h1 id="quick-result-title" className={qs.resultTitle}>
            {message.title}
          </h1>
          {personaInfo && (
            <div className={qs.personaChip}>
              <span className={qs.personaLabel}>{personaInfo.label}</span>
              <span className={qs.personaDesc}>{personaInfo.desc}</span>
            </div>
          )}
          <p className={qs.resultDesc}>{message.description}</p>
        </section>

        <section className={qs.recommendGrid} aria-label="추천 페이지">
          <Link href={recommend.rankingUrl} className={qs.recommendCard}>
            <div className={qs.recommendIcon}>
              <MapPin size={22} aria-hidden="true" />
            </div>
            <div className={qs.recommendBody}>
              <h2 className={qs.recommendTitle}>맞춤 지역 순위</h2>
              <p className={qs.recommendDesc}>
                {personaInfo?.label ?? "맞춤"} 페르소나 기준 상위 지역을 바로 보여드려요
              </p>
            </div>
            <ArrowRight size={16} className={qs.recommendArrow} aria-hidden="true" />
          </Link>

          <Link href={recommend.cropsUrl} className={qs.recommendCard}>
            <div className={qs.recommendIcon}>
              <Wheat size={22} aria-hidden="true" />
            </div>
            <div className={qs.recommendBody}>
              <h2 className={qs.recommendTitle}>{generic ? "작물 둘러보기" : "맞춤 작물"}</h2>
              <p className={qs.recommendDesc}>
                {generic
                  ? "난이도·소득을 비교하며 골라 보세요"
                  : "나에게 어울리는 작물부터 살펴 보세요"}
              </p>
            </div>
            <ArrowRight size={16} className={qs.recommendArrow} aria-hidden="true" />
          </Link>

          <Link href={recommend.programsUrl} className={qs.recommendCard}>
            <div className={qs.recommendIcon}>
              <HandCoins size={22} aria-hidden="true" />
            </div>
            <div className={qs.recommendBody}>
              <h2 className={qs.recommendTitle}>{generic ? "지원 사업 둘러보기" : "맞춤 지원 사업"}</h2>
              <p className={qs.recommendDesc}>
                {generic
                  ? "지금 신청할 수 있는 사업부터 살펴보세요"
                  : "나에게 맞는 지원 사업을 우선 보여드려요"}
              </p>
            </div>
            <ArrowRight size={16} className={qs.recommendArrow} aria-hidden="true" />
          </Link>
        </section>

        <section className={qs.upgradeBox} aria-labelledby="quick-upgrade-title">
          <ClipboardCheck size={20} className={qs.upgradeIcon} aria-hidden="true" />
          <div className={qs.upgradeBody}>
            <h3 id="quick-upgrade-title" className={qs.upgradeTitle}>
              더 정확한 추천을 원하시나요?
            </h3>
            <p className={qs.upgradeDesc}>
              14문항 적합도 진단으로 5가지 차원을 점검하고
              나의 부족한 부분과 함께 더 정밀한 추천을 받아 보세요.
            </p>
            <div className={qs.upgradeActions}>
              <Link href="/match?mode=assess" className={qs.upgradePrimary}>
                적합도 진단 시작
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={handleReset}
                className={qs.upgradeSecondary}
              >
                <RotateCcw size={14} aria-hidden="true" />
                다시 점검하기
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  /* ═══ 질문 화면 (Sprint I — assessment-wizard 패턴 그린 변종) ═══ */
  return (
    <div className={qs.page}>
      <div className={qs.progressWrap}>
        <div
          className={qs.progressBar}
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-valuetext={`빠른 점검 ${step + 1} / ${totalSteps}`}
          aria-label="진행률"
        >
          <div className={qs.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <span className={qs.progressLabel}>
          {step + 1} / {totalSteps}
        </span>
      </div>

      <button
        type="button"
        onClick={handleBack}
        className={qs.navBtnBack}
        aria-label={step === 0 ? "이전 화면으로" : "이전 단계로"}
      >
        <ArrowLeft size={16} />
        {step === 0 ? "처음으로" : "이전"}
      </button>

      <div className={qs.questionWrap}>
        <span className={qs.dimensionTag}>빠른 점검</span>
        <h1 className={qs.questionTitle}>{currentQuestion.title}</h1>
        <p className={qs.questionSubtitle}>{currentQuestion.subtitle}</p>

        <div className={qs.optionsList}>
          {currentQuestion.options.map((option, i) => {
            const selected = answers[currentQuestion.id] === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option.id)}
                className={`${qs.optionCard} ${selected ? qs.optionSelected : ""}`}
                aria-pressed={selected}
              >
                <span className={qs.optionNumber}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className={qs.optionBody}>
                  <span className={qs.optionLabel}>{option.label}</span>
                  {option.description && (
                    <span className={qs.optionDesc}>{option.description}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
