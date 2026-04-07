"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LayoutGrid, Table2, Smartphone } from "lucide-react";
import s from "./view-toggle.module.css";

export type ViewMode = "card" | "table";

interface ViewToggleProps {
  current: ViewMode;
}

export function ViewToggle({ current }: ViewToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showToast, setShowToast] = useState(false);

  const toggle = useCallback(
    (mode: ViewMode) => {
      const params = new URLSearchParams(searchParams.toString());
      if (mode === "card") {
        params.delete("view");
      } else {
        params.set("view", mode);
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });

      // 모바일에서 테이블 뷰 전환 시 가로 모드 안내 토스트
      if (mode === "table" && window.innerWidth < 768) {
        setShowToast(true);
      }
    },
    [router, pathname, searchParams],
  );

  // 토스트 자동 닫기
  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 2500);
    return () => clearTimeout(timer);
  }, [showToast]);

  return (
    <>
      <div className={s.wrap} role="radiogroup" aria-label="보기 방식">
        <button
          type="button"
          className={`${s.btn} ${current === "card" ? s.btnActive : ""}`}
          onClick={() => toggle("card")}
          aria-checked={current === "card"}
          role="radio"
          title="카드 보기"
        >
          <LayoutGrid size={16} />
        </button>
        <button
          type="button"
          className={`${s.btn} ${current === "table" ? s.btnActive : ""}`}
          onClick={() => toggle("table")}
          aria-checked={current === "table"}
          role="radio"
          title="테이블 보기"
        >
          <Table2 size={16} />
        </button>
      </div>

      {/* 가로 모드 제안 토스트 */}
      {showToast && (
        <div className={s.toast} role="status" aria-live="polite">
          <Smartphone size={16} className={s.toastIcon} />
          <span>가로 모드로 보면 더 편해요</span>
        </div>
      )}
    </>
  );
}
