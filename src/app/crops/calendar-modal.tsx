"use client";

/**
 * CalendarModal — /crops 검색창 row 안 trigger 버튼 + 재배 캘린더 모달.
 *
 * 5/22 회장 라이브 결재 — 기존 CalendarToggle(inline 펼침) 폐기.
 * - 검색창 row 안 작은 버튼 노출 (FilterActions extraAction 슬롯)
 * - 클릭 시 Modal 열림 (Modal 공통 컴포넌트 재사용)
 * - 모바일 mobileHeight=tall (재배 캘린더 12개월 가독성)
 */

import { useState, type ReactNode } from "react";
import { Calendar } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";
import s from "./calendar-modal.module.css";

interface CalendarModalProps {
  children: ReactNode;
}

export function CalendarModal({ children }: CalendarModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={s.trigger}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Icon icon={Calendar} size="sm" />
        <span className={s.triggerLabel}>재배 캘린더</span>
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="재배 캘린더"
        mobileHeight="tall"
        bodyVariant="flush"
      >
        <div className={s.content}>{children}</div>
      </Modal>
    </>
  );
}
