"use client";

import { useState } from "react";
import { Monitor, X } from "lucide-react";
import s from "./desktop-hint.module.css";

interface DesktopHintProps {
  /** 표시 문구 (기본: "비교 화면은 넓은 화면에서 더 잘 보여요") */
  message?: string;
}

/**
 * 모바일에서만 보이는 '데스크톱 권장' 안내 배너.
 * 768px 이상에서는 CSS로 숨김 처리.
 */
export function DesktopHint({
  message = "비교 화면은 넓은 화면에서 더 잘 보여요",
}: DesktopHintProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className={s.banner} role="status">
      <Monitor size={16} className={s.icon} />
      <span className={s.text}>{message}</span>
      <button
        type="button"
        className={s.close}
        onClick={() => setDismissed(true)}
        aria-label="안내 닫기"
      >
        <X size={14} />
      </button>
    </div>
  );
}
