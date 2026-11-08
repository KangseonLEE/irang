"use client";

import { isCropUpdateBadgeOn } from "@/lib/crops/area-update-window";
import { useKstToday } from "@/lib/hooks/use-kst-today";
import s from "./crop-page-card.module.css";

/** 주산지가 바뀐 작물 카드 배지 — 배포 뒤 일주일만 */
export function CropUpdateBadge({ label, asOf }: { label: string; asOf: string }) {
  const today = useKstToday(asOf);
  if (!isCropUpdateBadgeOn(today)) return null;
  return <span className={s.cropCardUpdate}>{label}</span>;
}
