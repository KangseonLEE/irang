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
 *   - URL deep link: /regions/ranking?persona=... (Phase 6 A안 완료된 시스템)
 *   - localStorage 저장 안 함 (1분 점검은 가벼운 시드 — 적합도/유형 진단처럼 결과 저장 불필요)
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
  buildRecommendations,
  getResultMessage,
  type QuickAnswers,
} from "@/lib/data/quick-check";
import { getPersona } from "@/lib/data/personas";
import { analytics } from "@/lib/analytics";
import {
  generateResultId,
  saveAssessmentResult,
} from "@/lib/assess-result";
import s from "./match-wizard.module.css";
import qs from "./quick-wizard.module.css";

// Sprint I (2026-05-20): 질문 화면은 qs.* (assessment-wizard 패턴 그린 변종) 사용.
// 결과 화면은 기존 s.progressWrap/progressBar/progressFill 유지 (match-wizard 패턴).

interface QuickWizardProps {
  onBack?: () => void;
}

export function QuickWizard({ onBack }: QuickWizardProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuickAnswers>({});
  const [showResult, setShowResult] = useState(false);

  // 빠른 연타 클릭 방어
  const transitionRef = useRef(false);

  const totalSteps = QUICK_QUESTIONS.length;
  const currentQuestion = QUICK_QUESTIONS[step];
  const progress = showResult ? 100 : ((step + 1) / totalSteps) * 100;

  // 시작 이벤트 (마운트 시 1회)
  useEffect(() => {
    analytics.quickCheckStart();
  }, []);

  // 스텝 변경 시 step_view 이벤트 전송
  useEffect(() => {
    const q = QUICK_QUESTIONS[step];
    if (q) {
      analytics.quickCheckStepView(step + 1, q.id);
    }
  }, [step]);

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

  // 결과 도달 시 분석 이벤트 + Supabase 가벼운 row 적재 (2026-05-18 A안)
  useEffect(() => {
    if (!showResult) return;
    const persona = mapToPersona(answers);
    analytics.quickCheckComplete(persona);

    // Quick wizard 적재 — source='quick'으로 정식 wizard와 구분.
    // 마이그레이션 미적용 시 route가 202 fallback 반환, 라이브 silent fail X.
    saveAssessmentResult({
      id: generateResultId(),
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
  }, [showResult, answers]);

  /* ═══ 결과 화면 ═══ */
  if (showResult) {
    const persona = mapToPersona(answers);
    const personaInfo = getPersona(persona);
    const message = getResultMessage(persona);
    const recommend = buildRecommendations(persona);

    return (
      <div className={s.page}>
        <div className={s.progressWrap}>
          <button
            type="button"
            onClick={handleBack}
            className={qs.backBtn}
            aria-label="이전 단계로"
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
              <h2 className={qs.recommendTitle}>맞춤 작물</h2>
              <p className={qs.recommendDesc}>
                나에게 어울리는 작물부터 살펴 보세요
              </p>
            </div>
            <ArrowRight size={16} className={qs.recommendArrow} aria-hidden="true" />
          </Link>

          <Link href={recommend.programsUrl} className={qs.recommendCard}>
            <div className={qs.recommendIcon}>
              <HandCoins size={22} aria-hidden="true" />
            </div>
            <div className={qs.recommendBody}>
              <h2 className={qs.recommendTitle}>맞춤 지원 사업</h2>
              <p className={qs.recommendDesc}>
                나에게 맞는 지원 사업을 우선 보여드려요
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
