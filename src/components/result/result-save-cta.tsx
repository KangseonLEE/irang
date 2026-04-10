"use client";

import { useState, useCallback } from "react";
import { Download, Save, UserPlus, ArrowRight } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import s from "./result-save-cta.module.css";

interface ResultSaveCtaProps {
  /** PDF 출력 시 포함될 제목 */
  printTitle?: string;
}

/**
 * 결과 화면 하단 — "PDF 출력" + "결과 저장" CTA
 * - PDF 출력: window.print()
 * - 결과 저장: 회원가입 유도 모달
 */
export function ResultSaveCta({ printTitle }: ResultSaveCtaProps) {
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handlePrint = useCallback(() => {
    if (printTitle) {
      document.title = printTitle;
    }
    window.print();
  }, [printTitle]);

  const handleSave = useCallback(() => {
    setShowSignupModal(true);
  }, []);

  return (
    <>
      <div className={s.ctaGroup}>
        <button
          type="button"
          className={s.printBtn}
          onClick={handlePrint}
        >
          <Download size={16} />
          결과 출력하기
        </button>
        <button
          type="button"
          className={s.saveBtn}
          onClick={handleSave}
        >
          <Save size={16} />
          결과 저장하기
        </button>
      </div>

      {/* 회원가입 유도 모달 */}
      <Modal
        open={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        title="결과를 저장하시겠어요?"
      >
        <div className={s.signupModal}>
          <div className={s.signupIcon}>
            <UserPlus size={32} />
          </div>
          <p className={s.signupDesc}>
            진단 결과와 추천 내역을 저장하고,
            나중에 다시 확인하려면 회원가입이 필요합니다.
          </p>
          <ul className={s.signupBenefits}>
            <li>추천 결과 영구 저장 및 비교</li>
            <li>관심 지역 북마크 및 알림</li>
            <li>맞춤 지원사업 업데이트 수신</li>
          </ul>
          <button
            type="button"
            className={s.signupBtn}
          >
            무료 회원가입
            <ArrowRight size={16} />
          </button>
          <p className={s.signupHint}>
            아직 준비 중인 기능입니다. 곧 오픈할 예정이니 기대해 주세요!
          </p>
        </div>
      </Modal>
    </>
  );
}
