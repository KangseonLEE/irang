"use client";

/* eslint-disable react-hooks/set-state-in-effect */
// SSR-safe mounted 패턴은 React Hydration 에러 회피용 표준 — CLAUDE.md 컨벤션.

import { useEffect, useState } from "react";
import {
  PERSONAS,
  type PersonaId,
  computePersonaScoreDetailed,
} from "@/lib/data/personas";
import s from "./persona-score-picker.module.css";

const STORAGE_KEY = "irang-persona";

/** 시군구 차원 점수 (sgisCode/name 없이 5차원만) */
interface DimensionInput {
  populationTrend: number | null;
  farmActivity: number | null;
  medical: number | null;
  school: number | null;
  returnFarm: number | null;
}

interface Props {
  dimensionScores: DimensionInput | null;
  sigunguName: string;
}

export function PersonaScorePicker({ dimensionScores, sigunguName }: Props) {
  const [selected, setSelected] = useState<PersonaId | null>(null);
  const [mounted, setMounted] = useState(false);

  // SSR 안전: mounted 후에만 localStorage 사용 (CLAUDE.md 컨벤션)
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as PersonaId | null;
      if (saved) setSelected(saved);
    } catch {
      // localStorage 접근 불가 (Safari Private 등) — 무시
    }
  }, []);

  function handleSelect(id: PersonaId) {
    setSelected(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // 무시
    }
  }

  if (!dimensionScores) return null;

  const persona = mounted && selected
    ? PERSONAS.find((p) => p.id === selected) ?? null
    : null;
  const detail = persona
    ? computePersonaScoreDetailed(dimensionScores, persona)
    : null;

  return (
    <section className={s.section} aria-label="정착 스타일별 점수">
      <div className={s.header}>
        <h3 className={s.title}>어떤 귀농을 그리고 계세요?</h3>
        <p className={s.desc}>
          스타일을 고르시면 {sigunguName}이 나에게 얼마나 맞는지 한 점수로 보여드려요.
        </p>
      </div>

      <div className={s.pillRow} role="radiogroup" aria-label="정착 스타일 선택">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={selected === p.id}
            className={`${s.pill} ${selected === p.id ? s.pillActive : ""}`}
            onClick={() => handleSelect(p.id)}
            title={`${p.audience} · ${p.desc}\n인구 ${p.weights.populationTrend}% · 농가 ${p.weights.farmActivity}% · 의료 ${p.weights.medical}% · 학교 ${p.weights.school}% · 귀농 ${p.weights.returnFarm}%`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {persona && detail && (
        <div className={s.result}>
          {detail.score === null ? (
            <p className={s.unavailable}>
              ‘{persona.label}’ 스타일은 이 지역에서 점수를 만들 수 없어요.
              {detail.missingLabels.length > 0 && (
                <>
                  {" "}
                  <span className={s.unavailableNote}>
                    ({detail.missingLabels.join("·")} 데이터 부재)
                  </span>
                </>
              )}
            </p>
          ) : (
            <>
              <div className={s.scoreBox}>
                <span className={s.scoreValue}>{detail.score}</span>
                <span className={s.scoreUnit}>점</span>
              </div>
              <div className={s.scoreMeta}>
                <p className={s.scoreLabel}>
                  ‘{persona.label}’ 기준 종합 점수
                </p>
                <p className={s.scoreSub}>
                  {detail.usedDimensions === 5
                    ? "5가지 차원을 모두 사용했어요."
                    : `${detail.usedDimensions}가지 차원으로 계산했어요. (${detail.missingLabels.join(
                        "·",
                      )} 빠짐)`}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {!persona && mounted && (
        <p className={s.guide}>
          위에서 스타일을 골라 보세요. 선택은 다른 시군구에서도 기억돼요.
        </p>
      )}
    </section>
  );
}
