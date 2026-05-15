"use client";

// 회장 결재 Sprint 1 (2026-05-16) — Hybrid B+D 카드 단순화 + 시군구 상세 modal
// /regions/ranking 카드 chip 과다 문제 (Q1) 해소 + Q2 옵션 A 직역.
//
// 카드 내부: 시군구·시도·점수·전국상위% + chip 1~2개 (mainCrops + D-7 임박)
// modal 내부 (정보 손실 0):
//   1) 점수 + 전국 상위 % (헤더 — 큰 폰트)
//   2) 5차원 mini-bar (populationTrend·farmActivity·medical·school·returnFarm)
//   3) 강·약점 그룹 chip (RegionPersonaExplain 직역, persona 모드에서만)
//   4) chip 5종 통합 (rawLabel·mainCrops·밀도·활성·D-7) — 카드에서 제거된 항목 전부
//   5) CTA 2개 — "상세 페이지 보기" (시군구 detail) + "닫기"

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { RegionPersonaExplain } from "@/components/persona/region-persona-explain";
import {
  DIMENSION_IDS,
  DIMENSION_LABELS,
  type DimensionScores,
  type DimensionId,
} from "@/lib/data/dimension-scores";
import type { Persona } from "@/lib/data/personas";
import type { Sigungu } from "@/lib/data/sigungus";
import type { Province } from "@/lib/data/regions";
import type { RegionStats } from "@/lib/data/region-stats";
import s from "./sigungu-detail-modal.module.css";

interface SigunguDetailModalProps {
  open: boolean;
  onClose: () => void;
  score: DimensionScores;
  sg: Sigungu;
  province: Province;
  value: number;
  stats: RegionStats;
  mode: "dimension" | "persona";
  dim: DimensionId;
  persona: Persona | null;
  isCustom: boolean;
  rank: number;
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

function getToneClass(score: number): string {
  if (score >= 70) return s.scoreHigh;
  if (score >= 40) return s.scoreMid;
  return s.scoreLow;
}

export function SigunguDetailModal({
  open,
  onClose,
  score,
  sg,
  province,
  value,
  stats,
  mode,
  dim,
  persona,
  isCustom,
  rank,
}: SigunguDetailModalProps) {
  const title = `${rank}위 · ${sg.name}`;
  const summary =
    mode === "persona" ? getPersonaSummary(value) : getDimensionSummary(dim, value);

  // 5차원 mini-bar 데이터 — null 제외, 가용 차원만
  const dimensionRows = DIMENSION_IDS.map((id) => ({
    id,
    label: DIMENSION_LABELS[id],
    value: score[id],
    rawLabel: score.evidence[id]?.rawLabel ?? null,
  })).filter((row) => row.value !== null);

  // chip 5종 통합 (카드에서 제거된 항목)
  const mainCrop = sg.mainCrops[0] ?? null;
  const { populationDensity, activeProgramsCount, urgentDeadlineCount } = stats;

  // dimension 모드에서만 현재 dim의 rawLabel 강조 (persona는 mini-bar에 이미 다 노출됨)
  const dimRawLabel = mode === "dimension" ? score.evidence[dim]?.rawLabel : null;

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className={s.body}>
        {/* 1) 점수 헤더 */}
        <section className={s.scoreSection} aria-label="종합 점수">
          <div className={s.scoreRow}>
            <span className={`${s.scoreValue} ${getToneClass(value)}`}>
              {value}
              <span className={s.scoreUnit}>점</span>
            </span>
            <span className={s.scoreSummary}>{summary}</span>
          </div>
          <p className={s.scoreCaption}>
            <span className={s.scoreSido}>{province.shortName}</span>
            {" · "}
            {mode === "persona" && persona
              ? isCustom
                ? "직접 조정한 가중치 점수예요"
                : `‘${persona.label}’ 스타일 점수예요`
              : "차원별 단일 점수예요"}
          </p>
        </section>

        {/* 2) 5차원 mini-bar */}
        <section className={s.section} aria-label="5차원 점수">
          <h3 className={s.sectionTitle}>5차원 점수</h3>
          <ul className={s.miniBarList}>
            {dimensionRows.map((row) => {
              const isHighlight = mode === "dimension" && row.id === dim;
              const pct = Math.max(0, Math.min(100, row.value ?? 0));
              return (
                <li key={row.id} className={s.miniBarRow}>
                  <div className={s.miniBarLabelRow}>
                    <span
                      className={`${s.miniBarLabel} ${isHighlight ? s.miniBarLabelHighlight : ""}`}
                    >
                      {row.label}
                    </span>
                    <span className={s.miniBarValue}>{pct}</span>
                  </div>
                  <div
                    className={s.miniBarTrack}
                    role="progressbar"
                    aria-label={`${row.label} ${pct}점`}
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className={`${s.miniBarFill} ${isHighlight ? s.miniBarFillHighlight : ""}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {row.rawLabel && (
                    <p className={s.miniBarRaw}>{row.rawLabel}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* 3) 강·약점 (persona 모드만) — RegionPersonaExplain 직역 */}
        {mode === "persona" && persona && (
          <section className={s.section} aria-label="강점·약점">
            <h3 className={s.sectionTitle}>강점·약점</h3>
            <RegionPersonaExplain
              scores={score}
              evidence={score.evidence}
              persona={persona}
              total={value}
              isCustom={isCustom}
            />
          </section>
        )}

        {/* 4) chip 5종 통합 — 카드에서 제거된 항목 전부 */}
        {(dimRawLabel ||
          mainCrop ||
          populationDensity !== null ||
          activeProgramsCount > 0 ||
          urgentDeadlineCount > 0) && (
          <section className={s.section} aria-label="시군구 상세 정보">
            <h3 className={s.sectionTitle}>상세 정보</h3>
            <ul className={s.chipList}>
              {dimRawLabel && (
                <li className={s.chip}>
                  <span className={s.chipKey}>현재 차원</span>
                  <span className={s.chipValue}>{dimRawLabel}</span>
                </li>
              )}
              {mainCrop && (
                <li className={s.chip}>
                  <span className={s.chipKey}>주요 작물</span>
                  <span className={s.chipValue}>{mainCrop}</span>
                </li>
              )}
              {populationDensity !== null && (
                <li className={s.chip}>
                  <span className={s.chipKey}>인구밀도</span>
                  <span className={s.chipValue}>
                    {populationDensity.toLocaleString("ko-KR")}명/㎢
                  </span>
                </li>
              )}
              {activeProgramsCount > 0 && (
                <li className={s.chip}>
                  <span className={s.chipKey}>활성 지원사업</span>
                  <span className={s.chipValue}>{activeProgramsCount}건</span>
                </li>
              )}
              {urgentDeadlineCount > 0 && (
                <li className={`${s.chip} ${s.chipUrgent}`}>
                  <span className={s.chipKey}>D-7 마감 임박</span>
                  <span className={s.chipValue}>{urgentDeadlineCount}건</span>
                </li>
              )}
            </ul>
          </section>
        )}

        {/* 5) CTA */}
        <div className={s.ctaRow}>
          <Link
            href={`/regions/${province.id}/${sg.id}`}
            className={s.ctaPrimary}
          >
            상세 페이지 보기
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <button type="button" className={s.ctaSecondary} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </Modal>
  );
}
