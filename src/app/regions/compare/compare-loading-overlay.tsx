"use client";

import { Loader2 } from "lucide-react";
import { useComparePending } from "./compare-pending-store";
import s from "./compare-loading-overlay.module.css";

/**
 * 지역 변경 중 콘텐츠 영역 위에 뜨는 로딩 오버레이 (8/30).
 * - 이전 데이터를 지우지 않고(스크롤 유지) 반투명으로 덮어 "바뀌는 중"을 보여준다.
 * - 스피너 박스는 sticky라 사용자가 콘텐츠 어디를 보고 있든 뷰포트 안에 따라온다.
 * - 200ms 뒤에 나타나 0.2초 안에 끝나는 빠른 응답에서는 깜빡이지 않는다.
 * - 탭 전환은 Suspense 스켈레톤이 담당하므로 여기서는 지역 변경(useTransition)만.
 */
export function CompareLoadingOverlay() {
  const pending = useComparePending();
  if (!pending) return null;
  return (
    <div className={s.overlay} role="status" aria-live="polite">
      <div className={s.box}>
        <Loader2 size={20} className={s.spinner} aria-hidden="true" />
        <span className={s.text}>새 지역 데이터를 불러오는 중이에요</span>
      </div>
    </div>
  );
}
