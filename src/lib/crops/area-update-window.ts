import { CROP_AREA_UPDATE } from "@/lib/data/crop-area-updates";

/**
 * 재배면적 통계 안내의 표시 기간. 클라이언트에서도 쓰므로 작물 데이터를 끌어오지 않게 area-update.ts 와 나눴다.
 * 문자열 비교라 시간대가 끼지 않는다 — today 는 KST(useKstToday).
 */
function endOf(days: number): string {
  const d = new Date(`${CROP_AREA_UPDATE.releasedAt}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isCropUpdateNoticeOn(today: string): boolean {
  return today >= CROP_AREA_UPDATE.releasedAt && today < endOf(CROP_AREA_UPDATE.noticeDays);
}

export function isCropUpdateBadgeOn(today: string): boolean {
  return today >= CROP_AREA_UPDATE.releasedAt && today < endOf(CROP_AREA_UPDATE.badgeDays);
}
