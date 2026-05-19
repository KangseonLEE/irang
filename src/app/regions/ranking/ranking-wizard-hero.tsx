"use client";

// /regions/ranking 진입 wizard hero
//   D2 2026-05-14 — 2-step (mode → detail) 도입
//   Sprint 2 2026-05-16 — 3-step (mode → detail → sido) + custom mode 통합
//
// step 흐름:
//   Step 1: 모드 선택 (페르소나 / 차원별 / 맞춤 가중치)
//   Step 2: 모드별 세부 입력
//     - persona: 5종 chip
//     - dimension: 5종 chip
//     - custom: 안내 후 즉시 다음 step (실제 슬라이더는 결과 페이지 WeightCustomizer)
//   Step 3: 시도 17개 chip + "결과 보기" CTA
//
// 선택 완료 → router.push로 deep link 이동 → page.tsx가 wizard 숨기고 결과 표시.
// dynamic SSR 회피: step state는 useState로 client만 관리. URL은 최종 진입 시점에만 갱신.
//
// PERSONAS·DIMENSION 상수는 모두 use client 없는 .ts 모듈에서 import (RSC marshalling 안전).

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  Users,
  Sprout,
  HeartPulse,
  GraduationCap,
  Compass,
  Target,
  BarChart3,
  Sliders,
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
import { PROVINCES } from "@/lib/data/regions";
import { analytics } from "@/lib/analytics";
import s from "./ranking-wizard-hero.module.css";

type Step = "mode" | "detail" | "sido";
type Mode = "persona" | "dimension" | "custom";

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
  returnFarm: "전체 인구 대비 정착 비율",
};

export function RankingWizardHero() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("mode");
  const [mode, setMode] = useState<Mode | null>(null);
  /** Step 2 선택값: persona id / dimension id / custom 진입 시 "custom" 고정값 */
  const [selection, setSelection] = useState<string | null>(null);
  // race 가드: navigating 중 빠른 재선택 방지 (5/13 useOptimistic race 메모리)
  const [isNavigating, setIsNavigating] = useState(false);
  const navigatingRef = useRef(false);

  // GA: wizard hero 노출 시 1회 (D3 2026-05-14)
  useEffect(() => {
    analytics.rankingWizardStart();
  }, []);

  const handleModeSelect = (m: Mode) => {
    analytics.rankingWizardStep(m);
    setMode(m);
    if (m === "custom") {
      // custom은 별도 선택값 없이 바로 sido step으로
      setSelection("custom");
      setStep("sido");
    } else {
      setStep("detail");
    }
  };

  const handleBackToMode = () => {
    setStep("mode");
    setMode(null);
    setSelection(null);
  };

  const handleBackFromSido = () => {
    if (mode === "custom") {
      // custom은 detail step이 없으므로 mode로 직접 복귀
      setStep("mode");
      setMode(null);
      setSelection(null);
    } else {
      setStep("detail");
      setSelection(null);
    }
  };

  const handleSelectPersona = (personaId: PersonaId) => {
    setSelection(personaId);
    setStep("sido");
  };

  const handleSelectDimension = (dim: DimensionId) => {
    setSelection(dim);
    setStep("sido");
  };

  const buildFinalUrl = (sido: string | null): string => {
    const params = new URLSearchParams();
    if (mode === "persona") {
      params.set("persona", selection ?? "balanced");
    } else if (mode === "dimension") {
      params.set("dim", selection ?? "farmActivity");
    } else if (mode === "custom") {
      // custom 진입: balanced 기본 가중치로 시작 → 결과 페이지의 WeightCustomizer로 조정
      params.set("persona", "balanced");
    }
    if (sido && sido !== "전체") params.set("sido", sido);
    return `/regions/ranking?${params.toString()}`;
  };

  const handleFinish = (sido: string | null) => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    setIsNavigating(true);
    if (sido && sido !== "전체") analytics.rankingWizardSido(sido);
    if (mode && selection) {
      analytics.rankingWizardComplete(mode, selection);
    }
    router.push(buildFinalUrl(sido));
  };

  return (
    <section className={s.wizard} aria-label="시군구 비교 시작">
      {/* progress: 점 3개 (Sprint 2 — sido step 추가) */}
      <div className={s.progress} aria-hidden="true">
        <span className={`${s.progressDot} ${s.progressDotActive}`} />
        <span
          className={`${s.progressDot} ${step === "detail" || step === "sido" ? s.progressDotActive : ""}`}
        />
        <span
          className={`${s.progressDot} ${step === "sido" ? s.progressDotActive : ""}`}
        />
      </div>
      <p className={s.progressLabel}>
        {step === "mode"
          ? "1 / 3 · 1분이면 끝나요"
          : step === "detail"
            ? "2 / 3"
            : "3 / 3 · 거의 다 왔어요"}
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
              aria-label="정착 스타일에 맞춰 비교하기"
            >
              <span className={s.modeIcon}>
                <Icon icon={Target} size="lg" />
              </span>
              <span className={s.modeBody}>
                <span className={s.modeLabel}>정착 스타일 맞춤</span>
                <span className={s.modeDesc}>
                  5차원을 가중 평균해 한 점수로 줄 세워요.
                </span>
                <span className={s.modeTime}>1분</span>
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
                <span className={s.modeTime}>30초</span>
              </span>
              <Icon icon={ArrowRight} size="sm" className={s.modeArrow} />
            </button>

            <button
              type="button"
              onClick={() => handleModeSelect("custom")}
              className={s.modeCard}
              aria-label="가중치를 직접 조정해서 비교하기"
            >
              <span className={s.modeIcon}>
                <Icon icon={Sliders} size="lg" />
              </span>
              <span className={s.modeBody}>
                <span className={s.modeLabel}>맞춤 가중치</span>
                <span className={s.modeDesc}>
                  5차원 비중을 직접 조정해 점수를 만들어요.
                </span>
                <span className={s.modeTime}>3분</span>
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
      ) : step === "detail" && mode === "persona" ? (
        <>
          <button
            type="button"
            onClick={handleBackToMode}
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
              >
                <span className={s.optionLabel}>{p.label}</span>
                <span className={s.optionDesc}>{p.audience}</span>
                <span className={s.optionMeta}>{p.desc}</span>
              </button>
            ))}
          </div>
        </>
      ) : step === "detail" && mode === "dimension" ? (
        <>
          <button
            type="button"
            onClick={handleBackToMode}
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
      ) : (
        // step === "sido" (모든 mode 공통 — custom은 detail 건너뜀)
        <>
          <button
            type="button"
            onClick={handleBackFromSido}
            className={s.backBtn}
            aria-label="이전 단계로"
          >
            <Icon icon={ArrowLeft} size="sm" />
            <span>이전</span>
          </button>

          <h2 className={s.question}>지역을 좁힐까요?</h2>
          <p className={s.questionSub}>
            {mode === "custom"
              ? "원하는 시도가 있다면 골라 주세요. 결과 페이지에서 가중치를 직접 조정할 수 있어요."
              : "원하는 시도가 있다면 골라 주세요. 안 골라도 돼요."}
          </p>

          <div className={s.sidoGrid}>
            <button
              type="button"
              onClick={() => handleFinish(null)}
              className={s.sidoChip}
              disabled={isNavigating}
            >
              전체
            </button>
            {PROVINCES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleFinish(p.shortName)}
                className={s.sidoChip}
                disabled={isNavigating}
              >
                {p.shortName}
              </button>
            ))}
          </div>

          <p className={s.skip}>
            <button
              type="button"
              onClick={() => handleFinish(null)}
              className={s.skipBtn}
              disabled={isNavigating}
            >
              전체 보기로 결과 보기 →
            </button>
          </p>
        </>
      )}
    </section>
  );
}
