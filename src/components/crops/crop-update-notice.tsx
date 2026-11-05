"use client";

import { Sparkles } from "lucide-react";
import Link from "@/components/ui/app-link";
import type { CropAreaUpdate } from "@/lib/crops/area-update";
import { isCropUpdateNoticeOn } from "@/lib/crops/area-update-window";
import { useKstToday } from "@/lib/hooks/use-kst-today";
import s from "./crop-update-notice.module.css";

/** 재배면적 통계가 바뀐 작물 — 차트 바로 위 안내. 상세가 하루 캐시라 기간 판정은 브라우저 날짜로 한다 */
export function CropUpdateNotice({ update, asOf }: { update: CropAreaUpdate; asOf: string }) {
  const today = useKstToday(asOf);
  if (!isCropUpdateNoticeOn(today)) return null;
  return (
    <aside className={s.notice} aria-label={update.eyebrow}>
      <span className={s.eyebrow}>
        <Sparkles size={14} aria-hidden="true" />
        {update.eyebrow}
      </span>
      <p className={s.title}>{update.title}</p>
      <p className={s.body}>{update.body}</p>
      <Link href="/about/corrections" className={s.link}>
        바뀐 내용 보기
      </Link>
    </aside>
  );
}
