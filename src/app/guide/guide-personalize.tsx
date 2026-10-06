"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { migrateFarmTypeId, FARM_TYPES, type FarmTypeId } from "@/lib/data/match-questions";
import s from "./page.module.css";

/**
 * "이전 진단 결과" 저장 항목에서 이 배너가 쓰는 부분 — 저장 모양은 src/app/match/diagnosis-history.ts.
 * 10/6 부터 빠른 점검 결과(farmTypeId 없음)도 같은 목록에 들어온다 — 정착 유형이 있는 가장 최근 결과를 쓴다.
 */
interface HistoryFarmType {
  farmTypeId?: unknown;
  farmTypeLabel?: unknown;
}

const TYPE_STEP_EMPHASIS: Record<FarmTypeId, { steps: number[]; tip: string }> = {
  guinong: {
    steps: [1, 3, 4],
    tip: "귀농형은 농지 확보와 작물 선정이 핵심이에요. 1·3·4단계를 꼼꼼히 확인하세요.",
  },
  guichon: {
    steps: [1, 3],
    tip: "귀촌형은 생활 환경과 지역 선정이 핵심이에요. 1단계와 3단계를 꼼꼼히 확인하세요.",
  },
  guisanchon: {
    steps: [3, 5],
    tip: "귀산촌형은 산촌 지역 선정과 커뮤니티 정착이 핵심이에요. 3단계와 5단계를 확인하세요.",
  },
  smartfarm: {
    steps: [2, 4],
    tip: "스마트팜형은 전문 교육과 기술 영농 단계가 중요해요. 2단계와 4단계에 집중하세요.",
  },
  cheongnyeon: {
    steps: [2, 4],
    tip: "청년농형은 교육 이수와 청년 전용 지원사업 활용이 핵심이에요. 2단계와 4단계에 집중하세요.",
  },
};

export function GuidePersonalize() {
  const [data, setData] = useState<{ label: string; tip: string; steps: number[] } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("irang_assess_history");
      if (!raw) return;
      const arr: unknown = JSON.parse(raw);
      if (!Array.isArray(arr)) return;
      const latest = (arr as HistoryFarmType[]).find(
        (item): item is { farmTypeId: string; farmTypeLabel?: unknown } =>
          typeof item === "object" && item !== null && typeof item.farmTypeId === "string",
      );
      if (!latest) return;
      const migratedId = migrateFarmTypeId(latest.farmTypeId);
      const emphasis = TYPE_STEP_EMPHASIS[migratedId];
      if (!emphasis) return;
      const farmType = FARM_TYPES.find(t => t.id === migratedId);
      const label =
        farmType?.label ?? (typeof latest.farmTypeLabel === "string" ? latest.farmTypeLabel : "");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData({ label, tip: emphasis.tip, steps: emphasis.steps });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!data) return;
    const emphasized = TYPE_STEP_EMPHASIS[
      Object.keys(TYPE_STEP_EMPHASIS).find(
        (k) => TYPE_STEP_EMPHASIS[k as FarmTypeId].tip === data.tip,
      ) as FarmTypeId
    ];
    if (!emphasized) return;

    for (const stepNum of emphasized.steps) {
      const el = document.getElementById(`step-${stepNum}`);
      if (el) el.classList.add(s.stepEmphasized);
    }

    return () => {
      for (const stepNum of emphasized.steps) {
        const el = document.getElementById(`step-${stepNum}`);
        if (el) el.classList.remove(s.stepEmphasized);
      }
    };
  }, [data]);

  if (!data) return null;

  return (
    <div className={s.personalizeBanner}>
      <div className={s.personalizeLeft}>
        <Sparkles size={16} className={s.personalizeIcon} />
        <div className={s.personalizeText}>
          <span className={s.personalizeLabel}>
            <strong>{data.label}</strong> 맞춤 가이드
          </span>
          <span className={s.personalizeTip}>{data.tip}</span>
        </div>
      </div>
      {/* /assess 는 이리로 넘기기만 하는 페이지 — 한 홉 줄인다 (10/6 QA Q2-X5) */}
      <Link href="/match?mode=assess" className={s.personalizeLink}>
        다시 진단 <ArrowRight size={14} />
      </Link>
    </div>
  );
}
