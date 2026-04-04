"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Footprints } from "lucide-react";
import s from "./roadmap-banner.module.css";

const STEP_MAP: Record<string, { emoji: string; title: string; period: string }> = {
  "1": { emoji: "🔍", title: "정보 탐색", period: "1~3개월" },
  "2": { emoji: "📚", title: "교육 이수", period: "3~6개월" },
  "3": { emoji: "📍", title: "지역 선정", period: "6~12개월" },
  "4": { emoji: "🌱", title: "영농 시작", period: "12~18개월" },
  "5": { emoji: "🏠", title: "정착", period: "18~27개월" },
};

/**
 * 로드맵 단계 컨텍스트 배너
 * URL 쿼리에 `?step=N` 이 있을 때만 렌더링됩니다.
 * 로드맵 → 서비스 페이지 전환 시 사용자에게 현재 여정 위치를 안내합니다.
 */
export function RoadmapBanner() {
  const params = useSearchParams();
  const step = params.get("step");

  if (!step || !STEP_MAP[step]) return null;

  const info = STEP_MAP[step];

  return (
    <div className={s.banner}>
      <div className={s.left}>
        <Footprints size={14} className={s.icon} />
        <span className={s.label}>
          귀농 로드맵 {step}단계
        </span>
        <span className={s.stepName}>
          {info.emoji} {info.title}
        </span>
        <span className={s.period}>{info.period}</span>
      </div>
      <Link href="/#roadmap" className={s.backLink}>
        <ArrowLeft size={12} />
        전체 로드맵
      </Link>
    </div>
  );
}
