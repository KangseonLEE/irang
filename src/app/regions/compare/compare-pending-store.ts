/**
 * 지역 비교 "불러오는 중" 상태 공유 (8/30 회장: 지역 변경 시 로딩 중임을 알 수 있게).
 * RegionCardsSelector의 useTransition isPending을 여기로 흘려보내고, 콘텐츠 영역의
 * CompareLoadingOverlay가 구독한다. Context 없이 useSyncExternalStore로 최소 구현.
 */
import { useSyncExternalStore } from "react";

let pending = false;
const listeners = new Set<() => void>();

export function setComparePending(next: boolean): void {
  if (pending === next) return;
  pending = next;
  for (const l of listeners) l();
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useComparePending(): boolean {
  return useSyncExternalStore(subscribe, () => pending, () => false);
}
