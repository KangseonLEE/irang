"use client";

// Phase B Sprint 1 (2026-05-15) B-1 옵션 1 — 검색 페이지 더보기 패턴 재사용
// 2026-05-15 보강 — 10건 단위 점진 확장(visibleCount 10 → 20 → 30 → …) + 접기.
// 회장 결재 A 1+2순위 (2026-05-15) — evidence.rawLabel chip + mainCrops chip 보강.
//   - dimension 모드: 현재 dim의 rawLabel chip 1개 (구체 수치)
//   - persona 모드: evidence를 RegionPersonaExplain으로 위임 (강·약점 chip 옆 병기)
//   - mode 무관: sg.mainCrops[0] chip ("주요 작물 · 사과")
//
// 회장 결재 IA 재구성 (2026-05-15) — 순위는 카드 외부, chip·강약점은 카드 내부.
//   - 현재: rankNumber + Link(rankName/sido/score) | metaRow | RegionPersonaExplain 3블록 분리
//   - 변경: rankBadge(외부) + Link(cardHeader + metaRow + RegionPersonaExplain 통합)
//   - 1~3위 medal 색상은 rankBadge에 강조 (c935da5 패턴 직역)
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
import type { RegionStats } from "@/lib/data/region-stats";
import s from "./page.module.css";

/** 결과 1건 — page.tsx에서 prep된 형태와 동일 */
export interface RankItem {
  score: DimensionScores;
  sg: Sigungu;
  province: Province;
  value: number;
  /** 회장 결재 2026-05-15 — 카드 chip 3종 보조 통계 */
  stats: RegionStats;
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
          const medalBadgeClass =
            idx === 0
              ? s.rankBadgeGold
              : idx === 1
                ? s.rankBadgeSilver
                : idx === 2
                  ? s.rankBadgeBronze
                  : "";
          // 회장 결재 A 1+2순위 — 보조 정보 chip 2종 (rawLabel + mainCrops)
          // 1) dimension 모드: 현재 dim의 evidence.rawLabel (구체 수치)
          //    persona 모드는 evidence를 RegionPersonaExplain에 위임하므로 여기선 생략
          // 2) mode 무관: mainCrops[0] ("주요 작물 · 사과")
          const dimRawLabel =
            mode === "dimension" ? item.score.evidence[dim]?.rawLabel : undefined;
          const mainCrop = item.sg.mainCrops[0] ?? null;
          // 회장 결재 2026-05-15 — 보강 chip 3종 (밀도·활성 사업·D-7 임박)
          const { populationDensity, activeProgramsCount, urgentDeadlineCount } =
            item.stats;
          const showMetaRow =
            Boolean(dimRawLabel) ||
            Boolean(mainCrop) ||
            populationDensity !== null ||
            activeProgramsCount > 0;
          // D-7 chip은 활성 사업 chip의 부속이라 활성 사업 chip 있을 때만 함께 노출
          return (
            <li key={item.score.sgisCode} className={s.rankItem}>
              <div
                className={`${s.rankBadge} ${medalBadgeClass}`}
                aria-label={`순위 ${idx + 1}`}
              >
                {idx + 1}
              </div>
              <Link
                href={`/regions/${item.province.id}/${item.sg.id}`}
                className={`${s.rankLink} ${medalLinkClass}`}
              >
                <div className={s.cardHeader}>
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
                </div>
                {showMetaRow && (
                  <ul className={s.metaRow} aria-label="시군구 보조 정보">
                    {dimRawLabel && (
                      <li className={s.metaChip}>{dimRawLabel}</li>
                    )}
                    {mainCrop && (
                      <li className={`${s.metaChip} ${s.metaChipCrop}`}>
                        주요 작물 · {mainCrop}
                      </li>
                    )}
                    {populationDensity !== null && (
                      <li
                        className={`${s.metaChip} ${s.metaChipDensity}`}
                        title="최신 연도 인구 ÷ 면적 (정적 데이터 기반)"
                      >
                        밀도 {populationDensity.toLocaleString("ko-KR")}명/㎢
                      </li>
                    )}
                    {activeProgramsCount > 0 && (
                      <li className={`${s.metaChip} ${s.metaChipPrograms}`}>
                        활성 지원사업 {activeProgramsCount}건
                      </li>
                    )}
                    {urgentDeadlineCount > 0 && (
                      <li className={`${s.metaChip} ${s.metaChipUrgent}`}>
                        D-7 마감 임박 {urgentDeadlineCount}건
                      </li>
                    )}
                  </ul>
                )}
                {mode === "persona" && persona && (
                  <RegionPersonaExplain
                    scores={item.score}
                    evidence={item.score.evidence}
                    persona={persona}
                    total={item.value}
                    isCustom={isCustom}
                  />
                )}
              </Link>
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
