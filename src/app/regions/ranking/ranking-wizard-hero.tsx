"use client";

// /regions/ranking 진입 wizard hero (2026-05-14 D2)
//
// 빈 쿼리(?persona·?dim 모두 없음)일 때만 노출되는 2단계 wizard:
//   Step 1: 모드 선택 (페르소나 / 차원)
//   Step 2: 모드에 따른 5종 옵션 카드
//
// 선택 완료 → router.push 로 deep link 이동 → page.tsx 가 wizard 숨기고 결과 표시.
// PERSONAS·DIMENSION 상수는 모두 use client 없는 .ts 모듈에서 import (RSC marshalling 안전).

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useRef } from "react";
import {
  Users,
  Sprout,
  HeartPulse,
  GraduationCap,
  Compass,
  Target,
  BarChart3,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { PERSONAS, type PersonaId } from "@/lib/data/personas";
import {
  DIMENSION_LABELS,
  DIMENSION_IDS,
  type DimensionId,
} from "@/lib/data/dimension-scores";
import s from "./ranking-wizard-hero.module.css";

type Step = "mode" | "detail";
type Mode = "persona" | "dimension";

const DIMENSION_ICONS: Record<DimensionId, typeof Users> = {
  populationTrend: Users,
  farmActivity: Sprout,
  medical: HeartPulse,
  school: GraduationCap,
  returnFarm: Compass,
};

const DIMENSION_DESCRIPTIONS: Record<DimensionId, string> = {
  populationTrend: "최근 5년 인구가 늘었는지 줄었는지",
  farmActivity: "인구 1만 명당 농가 수",
  medical: "인구 1만 명당 의료기관 수",
  school: "인구 1만 명당 학교 수",
  returnFarm: "전체 인구 대비 귀농 비율",
};

export function RankingWizardHero() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("mode");
  const [mode, setMode] = useState<Mode | null>(null);
  // race 가드: navigating 중 빠른 재선택 방지 (5/13 useOptimistic race 메모리)
  const [isNavigating, setIsNavigating] = useState(false);
  const navigatingRef = useRef(false);

  const handleModeSelect = (m: Mode) => {
    setMode(m);
    setStep("detail");
  };

  const handleBack = () => {
    setStep("mode");
    setMode(null);
  };

  const handleSelectPersona = (personaId: PersonaId) => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    setIsNavigating(true);
    router.push(`/regions/ranking?persona=${personaId}`);
  };

  const handleSelectDimension = (dim: DimensionId) => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    setIsNavigating(true);
    router.push(`/regions/ranking?dim=${dim}`);
  };

  return (
    <section className={s.wizard} aria-label="시군구 비교 시작">
      {/* progress: 점 2개 */}
      <div className={s.progress} aria-hidden="true">
        <span className={`${s.progressDot} ${s.progressDotActive}`} />
        <span
          className={`${s.progressDot} ${step === "detail" ? s.progressDotActive : ""}`}
        />
      </div>
      <p className={s.progressLabel}>
        {step === "mode" ? "1 / 2 · 30초면 끝나요" : "2 / 2"}
      </p>

      {step === "mode" ? (
        <>
          <h2 className={s.question}>어떻게 비교해 볼까요?</h2>
          <p className={s.questionSub}>
            방식을 고르면 시군구를 줄 세워 드려요.
          </p>

          <div className={s.modeGrid}>
            <button
              type="button"
              onClick={() => handleModeSelect("persona")}
              className={s.modeCard}
              aria-label="귀농 스타일에 맞춰 비교하기"
            >
              <span className={s.modeIcon}>
                <Icon icon={Target} size="lg" />
              </span>
              <span className={s.modeBody}>
                <span className={s.modeLabel}>귀농 스타일 맞춤</span>
                <span className={s.modeDesc}>
                  5차원을 가중 평균해 한 점수로 줄 세워요.
                </span>
              </span>
              <Icon icon={ArrowRight} size="sm" className={s.modeArrow} />
            </button>

            <button
              type="button"
              onClick={() => handleModeSelect("dimension")}
              className={s.modeCard}
              aria-label="한 차원만 깊게 비교하기"
            >
              <span className={s.modeIcon}>
                <Icon icon={BarChart3} size="lg" />
              </span>
              <span className={s.modeBody}>
                <span className={s.modeLabel}>차원별 보기</span>
                <span className={s.modeDesc}>
                  인구·농가·의료 등 한 차원으로 비교해요.
                </span>
              </span>
              <Icon icon={ArrowRight} size="sm" className={s.modeArrow} />
            </button>
          </div>

          <p className={s.skip}>
            <Link href="/regions/ranking?dim=farmActivity">
              그냥 둘러볼게요 →
            </Link>
          </p>
        </>
      ) : mode === "persona" ? (
        <>
          <button
            type="button"
            onClick={handleBack}
            className={s.backBtn}
            aria-label="이전 단계로"
          >
            <Icon icon={ArrowLeft} size="sm" />
            <span>이전</span>
          </button>

          <h2 className={s.question}>어떤 귀농을 생각하세요?</h2>
          <p className={s.questionSub}>
            가장 가까운 스타일을 골라 주세요.
          </p>

          <div className={s.optionGrid}>
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPersona(p.id)}
                className={s.optionCard}
                disabled={isNavigating}
              >
                <span className={s.optionLabel}>{p.label}</span>
                <span className={s.optionDesc}>{p.audience}</span>
                <span className={s.optionMeta}>{p.desc}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={handleBack}
            className={s.backBtn}
            aria-label="이전 단계로"
          >
            <Icon icon={ArrowLeft} size="sm" />
            <span>이전</span>
          </button>

          <h2 className={s.question}>어떤 점이 가장 중요한가요?</h2>
          <p className={s.questionSub}>
            한 차원만 골라서 줄 세워 드려요.
          </p>

          <div className={s.optionGrid}>
            {DIMENSION_IDS.map((id) => {
              const DimIcon = DIMENSION_ICONS[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectDimension(id)}
                  className={s.optionCard}
                  disabled={isNavigating}
                >
                  <span className={s.optionIcon}>
                    <Icon icon={DimIcon} size="md" />
                  </span>
                  <span className={s.optionLabel}>{DIMENSION_LABELS[id]}</span>
                  <span className={s.optionDesc}>
                    {DIMENSION_DESCRIPTIONS[id]}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
