"use client";

// Phase B Sprint 1 (2026-05-15) B-1 옵션 1 — 검색 페이지 더보기 패턴 재사용.
// 2026-05-15 보강 — 10건 단위 점진 확장(visibleCount 10 → 20 → 30 → …) + 접기.
// 회장 결재 A 1+2순위 (2026-05-15) — evidence.rawLabel chip + mainCrops chip 보강.
// 회장 결재 IA 재구성 (2026-05-15) — 순위는 카드 외부, chip·강약점은 카드 내부.
//
// 회장 결재 Sprint 1 Hybrid B+D (2026-05-16) — 카드 단순화 + 시군구 상세 modal.
//   - Q1(chip 과다) + Q2(옵션 A: 리스트 카드 + modal) 직역.
//   - 카드 chip: 1~2개로 축약 (mainCrops + D-7 마감 임박만 노출 — D-7은 있을 때만)
//   - 카드 클릭 → modal open (Link onClick preventDefault). Link href 유지로 SEO 보존.
//   - modal 내 5종 통합: rawLabel·mainCrops·밀도·활성·D-7 + 5차원 mini-bar + 강·약점 + CTA.
//   - 강·약점 explain은 modal 안에서만 (카드 IA 단순화).

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SigunguDetailModal } from "@/components/regions/sigungu-detail-modal";
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
  const [visibleState, setVisibleState] = useState<{ token: string; count: number }>({
    token: resetToken,
    count: INITIAL_LIMIT_RANKING,
  });
  const visibleCount =
    visibleState.token === resetToken ? visibleState.count : INITIAL_LIMIT_RANKING;

  // 회장 결재 Sprint 1 (2026-05-16) — 카드 클릭 → modal open state
  // 선택된 항목의 sgisCode를 보관. null이면 modal 닫힘.
  const [activeSgisCode, setActiveSgisCode] = useState<string | null>(null);

  const isFullyExpanded = visibleCount >= ranked.length;
  const isInitial = visibleCount <= INITIAL_LIMIT_RANKING;
  const visibleItems = ranked.slice(0, visibleCount);

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

  // modal 데이터 — activeSgisCode로 ranked에서 찾기 + idx 보존 (순위)
  const activeIndex = activeSgisCode
    ? ranked.findIndex((r) => r.score.sgisCode === activeSgisCode)
    : -1;
  const activeItem = activeIndex >= 0 ? ranked[activeIndex] : null;

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

          // 회장 결재 Sprint 1 (2026-05-16) — 카드 chip 1~2개로 축약.
          // 1순위: mainCrops[0] (페르소나·차원 무관 일관성)
          // 2순위: D-7 마감 임박 chip (있을 때만)
          // 나머지(rawLabel·밀도·활성 chip 5종 통합·강약점)는 modal 안에서 노출.
          const mainCrop = item.sg.mainCrops[0] ?? null;
          const { urgentDeadlineCount } = item.stats;
          const showMetaRow = Boolean(mainCrop) || urgentDeadlineCount > 0;

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
                onClick={(e) => {
                  // 회장 결재 Sprint 1 (2026-05-16) — 카드 클릭 → modal open.
                  // Link href는 SEO crawler 보존용. 중간 버튼/Ctrl 클릭은 기본 동작 허용.
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
                  e.preventDefault();
                  setActiveSgisCode(item.score.sgisCode);
                }}
                aria-label={`${idx + 1}위 ${item.sg.name} 상세 정보 열기`}
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
                    {mainCrop && (
                      <li className={`${s.metaChip} ${s.metaChipCrop}`}>
                        주요 작물 · {mainCrop}
                      </li>
                    )}
                    {urgentDeadlineCount > 0 && (
                      <li className={`${s.metaChip} ${s.metaChipUrgent}`}>
                        D-7 마감 임박 {urgentDeadlineCount}건
                      </li>
                    )}
                  </ul>
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

      {/* 회장 결재 Sprint 1 (2026-05-16) — 시군구 상세 modal */}
      {activeItem && (
        <SigunguDetailModal
          open={true}
          onClose={() => setActiveSgisCode(null)}
          score={activeItem.score}
          sg={activeItem.sg}
          province={activeItem.province}
          value={activeItem.value}
          stats={activeItem.stats}
          mode={mode}
          dim={dim}
          persona={persona}
          isCustom={isCustom}
          rank={activeIndex + 1}
        />
      )}
    </>
  );
}
