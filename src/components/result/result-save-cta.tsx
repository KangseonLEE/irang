"use client";

import { useCallback } from "react";
import { Printer, Share2, Check } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";
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
  const { copied, copy } = useCopyToClipboard({
    onCopy: () => analytics.share("assessment", "clipboard"),
  });

  const handlePrint = useCallback(() => {
    if (printTitle) {
      document.title = printTitle;
    }
    window.print();
  }, [printTitle]);

  const handleShare = useCallback(() => {
    void copy(shareText || window.location.href);
  }, [shareText, copy]);

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
