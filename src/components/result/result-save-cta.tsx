"use client";

import { useState, useCallback } from "react";
import { Printer, Share2, Check } from "lucide-react";
import { analytics } from "@/lib/analytics";
import s from "./result-save-cta.module.css";

interface ResultSaveCtaProps {
  /** PDF 출력 시 포함될 제목 */
  printTitle?: string;
  /** 공유 텍스트 (클립보드 복사) */
  shareText?: string;
}

/**
 * 결과 화면 상단 — "인쇄" + "공유" 아이콘 버튼
 */
export function ResultSaveCta({ printTitle, shareText }: ResultSaveCtaProps) {
  const [copied, setCopied] = useState(false);

  const handlePrint = useCallback(() => {
    if (printTitle) {
      document.title = printTitle;
    }
    window.print();
  }, [printTitle]);

  const handleShare = useCallback(async () => {
    const text = shareText || window.location.href;
    try {
      await navigator.clipboard.writeText(text);
      analytics.share("assessment", "clipboard");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareText]);

  return (
    <div className={s.ctaGroup}>
      <button
        type="button"
        className={s.iconBtn}
        onClick={handlePrint}
        aria-label="결과 출력하기"
        title="결과 출력하기"
      >
        <Printer size={18} />
      </button>
      <button
        type="button"
        className={`${s.iconBtn} ${copied ? s.iconBtnActive : ""}`}
        onClick={handleShare}
        aria-label={copied ? "링크 복사됨" : "결과 공유하기"}
        title={copied ? "링크 복사됨!" : "결과 공유하기"}
      >
        {copied ? <Check size={18} /> : <Share2 size={18} />}
      </button>
    </div>
  );
}
