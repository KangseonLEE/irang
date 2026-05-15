"use client";

// Phase B Sprint 1 (2026-05-15) B-1 옵션 1 — 검색 페이지 더보기 패턴 재사용
//
// /regions/ranking 결과 리스트를 Client Component로 추출.
// 초기 10건 노출 + "더보기 N건" 토글. 모바일·데스크탑 동일 동작.
// 검색 페이지(`src/app/search/page.tsx`)의 expandedState + expandToggle 패턴 직역.

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
  // 검색 페이지 패턴 직역 — resetToken을 state에 묶어 변경 시 자동 초기화
  // (React 공식 권장: state in render 비교로 useEffect 회피)
  const [expandedState, setExpandedState] = useState<{ token: string; expanded: boolean }>({
    token: resetToken,
    expanded: false,
  });
  const isExpanded =
    expandedState.token === resetToken ? expandedState.expanded : false;

  const overflow = Math.max(0, ranked.length - INITIAL_LIMIT_RANKING);
  const visibleItems = isExpanded ? ranked : ranked.slice(0, INITIAL_LIMIT_RANKING);

  const toggleExpanded = () => {
    setExpandedState((prev) => {
      const current = prev.token === resetToken ? prev.expanded : false;
      return { token: resetToken, expanded: !current };
    });
  };

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
      {overflow > 0 && (
        <button
          type="button"
          className={s.expandToggle}
          onClick={toggleExpanded}
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <>
              접기
              <ChevronUp size={14} aria-hidden="true" />
            </>
          ) : (
            <>
              더보기 {overflow}건
              <ChevronDown size={14} aria-hidden="true" />
            </>
          )}
        </button>
      )}
    </>
  );
}
