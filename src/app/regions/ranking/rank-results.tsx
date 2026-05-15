"use client";

// Phase B Sprint 1 (2026-05-15) B-1 옵션 1 — 검색 페이지 더보기 패턴 재사용
// 2026-05-15 보강 — 10건 단위 점진 확장(visibleCount 10 → 20 → 30 → …) + 접기.
//
// /regions/ranking 결과 리스트를 Client Component로 추출.
// 초기 10건 노출 + "10건 더 보기" / 마지막 페이지 "N건 더 보기" / "접기" 토글.
// 모바일·데스크탑 동일 동작.

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { RegionPersonaExplain } from "@/components/persona/region-persona-explain";
import type { DimensionScores, DimensionId } from "@/lib/data/dimension-scores";
import type { Persona } from "@/lib/data/personas";
import type { Sigungu } from "@/lib/data/sigungus";
import type { Province } from "@/lib/data/regions";
import s from "./page.module.css";

/** 결과 1건 — page.tsx에서 prep된 형태와 동일 */
export interface RankItem {
  score: DimensionScores;
  sg: Sigungu;
  province: Province;
  value: number;
}

interface RankResultsProps {
  ranked: RankItem[];
  mode: "dimension" | "persona";
  dim: DimensionId;
  persona: Persona | null;
  isCustom: boolean;
  /** dim/persona 등이 바뀐 직후 isExpanded를 reset 하기 위한 token */
  resetToken: string;
}

const INITIAL_LIMIT_RANKING = 10;
const PAGE_STEP = 10;

function getToneClass(score: number): string {
  if (score >= 70) return s.scoreHigh;
  if (score >= 40) return s.scoreMid;
  return s.scoreLow;
}

function getDimensionSummary(dim: DimensionId, score: number): string {
  if (dim === "populationTrend") {
    if (score >= 80) return "회복 중";
    if (score >= 50) return "안정";
    return "감소 중";
  }
  if (score >= 50) {
    const topPct = Math.max(1, 100 - score);
    return `전국 상위 ${topPct}%`;
  }
  const bottomPct = Math.max(1, score);
  return `전국 하위 ${bottomPct}%`;
}

function getPersonaSummary(score: number): string {
  if (score >= 70) return "잘 맞아요";
  if (score >= 50) return "괜찮아요";
  if (score >= 30) return "조금 약해요";
  return "잘 안 맞아요";
}

export function RankResults({
  ranked,
  mode,
  dim,
  persona,
  isCustom,
  resetToken,
}: RankResultsProps) {
  // 2026-05-15 보강 — visibleCount 패턴 (10 → 20 → 30 → …)
  // resetToken을 state에 묶어 변경 시 자동으로 INITIAL_LIMIT_RANKING로 복원
  // (React 공식 권장: state in render 비교로 useEffect 회피)
  const [visibleState, setVisibleState] = useState<{ token: string; count: number }>({
    token: resetToken,
    count: INITIAL_LIMIT_RANKING,
  });
  const visibleCount =
    visibleState.token === resetToken ? visibleState.count : INITIAL_LIMIT_RANKING;

  // 마지막 페이지 도달 = 전체 항목이 visibleCount 이하
  const isFullyExpanded = visibleCount >= ranked.length;
  const isInitial = visibleCount <= INITIAL_LIMIT_RANKING;
  const visibleItems = ranked.slice(0, visibleCount);

  // 다음 페이지 노출 건수 (남은 게 10건 미만이면 그 수만 노출)
  const remaining = Math.max(0, ranked.length - visibleCount);
  const nextStep = Math.min(PAGE_STEP, remaining);

  const expandMore = () => {
    setVisibleState((prev) => {
      const current = prev.token === resetToken ? prev.count : INITIAL_LIMIT_RANKING;
      return { token: resetToken, count: Math.min(ranked.length, current + PAGE_STEP) };
    });
  };

  const collapse = () => {
    setVisibleState({ token: resetToken, count: INITIAL_LIMIT_RANKING });
  };

  const showToggle = ranked.length > INITIAL_LIMIT_RANKING;

  if (ranked.length === 0) {
    return (
      <div className={s.empty}>
        <p>해당 조건에 맞는 시군구가 없어요.</p>
      </div>
    );
  }

  return (
    <>
      <ol className={s.rankList}>
        {visibleItems.map((item, idx) => {
          const medalLinkClass =
            idx === 0
              ? s.rankLinkGold
              : idx === 1
                ? s.rankLinkSilver
                : idx === 2
                  ? s.rankLinkBronze
                  : "";
          const medalNumberClass =
            idx === 0
              ? s.rankNumberGold
              : idx === 1
                ? s.rankNumberSilver
                : idx === 2
                  ? s.rankNumberBronze
                  : "";
          return (
            <li key={item.score.sgisCode} className={s.rankItem}>
              <Link
                href={`/regions/${item.province.id}/${item.sg.id}`}
                className={`${s.rankLink} ${medalLinkClass}`}
              >
                <span className={`${s.rankNumber} ${medalNumberClass}`}>
                  {idx + 1}
                </span>
                <div className={s.rankBody}>
                  <span className={s.rankName}>{item.sg.name}</span>
                  <span className={s.rankSido}>{item.province.shortName}</span>
                </div>
                <div className={s.rankScoreBox}>
                  <span className={`${s.rankScore} ${getToneClass(item.value)}`}>
                    {item.value}
                    <span className={s.rankScoreUnit}>점</span>
                  </span>
                  <span className={s.rankSummary}>
                    {mode === "persona"
                      ? getPersonaSummary(item.value)
                      : getDimensionSummary(dim, item.value)}
                  </span>
                </div>
              </Link>
              {mode === "persona" && persona && (
                <RegionPersonaExplain
                  scores={item.score}
                  persona={persona}
                  total={item.value}
                  isCustom={isCustom}
                />
              )}
            </li>
          );
        })}
      </ol>
      {showToggle && (
        <div className={s.expandToggleRow}>
          {!isFullyExpanded && (
            <button
              type="button"
              className={s.expandToggle}
              onClick={expandMore}
              aria-label={`${nextStep}건 더 보기`}
            >
              {nextStep}건 더 보기
              <ChevronDown size={14} aria-hidden="true" />
            </button>
          )}
          {!isInitial && (
            <button
              type="button"
              className={s.expandToggle}
              onClick={collapse}
              aria-label="처음 10건만 보기"
            >
              접기
              <ChevronUp size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
