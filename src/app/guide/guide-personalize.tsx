"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import type { FarmTypeId } from "@/lib/data/match-questions";
import s from "./page.module.css";

interface AssessHistoryItem {
  resultId: string;
  farmTypeId: FarmTypeId;
  farmTypeLabel: string;
  topRegions: string[];
  savedAt: string;
}

const TYPE_STEP_EMPHASIS: Record<FarmTypeId, { steps: number[]; tip: string }> = {
  weekend: {
    steps: [1, 3],
    tip: "주말농부형은 도시 근교 지역 선정이 핵심이에요. 1단계와 3단계를 꼼꼼히 확인하세요.",
  },
  smartfarm: {
    steps: [2, 4],
    tip: "스마트팜형은 전문 교육과 기술 영농 단계가 중요해요. 2단계와 4단계에 집중하세요.",
  },
  "rural-life": {
    steps: [3, 5],
    tip: "전원생활형은 지역 선정과 커뮤니티 정착이 핵심이에요. 3단계와 5단계를 꼼꼼히 확인하세요.",
  },
  "young-entrepreneur": {
    steps: [2, 4],
    tip: "청년창농형은 교육 이수와 지원사업 활용이 핵심이에요. 2단계와 4단계에 집중하세요.",
  },
};

export function GuidePersonalize() {
  const [data, setData] = useState<{ label: string; tip: string; steps: number[] } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("irang_assess_history");
      if (!raw) return;
      const arr: AssessHistoryItem[] = JSON.parse(raw);
      if (!Array.isArray(arr) || arr.length === 0) return;
      const latest = arr[0];
      const emphasis = TYPE_STEP_EMPHASIS[latest.farmTypeId];
      if (!emphasis) return;
      setData({ label: latest.farmTypeLabel, tip: emphasis.tip, steps: emphasis.steps });
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
      <Link href="/assess" className={s.personalizeLink}>
        다시 진단 <ArrowRight size={14} />
      </Link>
    </div>
  );
}
