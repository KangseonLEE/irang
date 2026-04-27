"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { RequestModal } from "@/components/feedback/request-modal";
import s from "./page.module.css";

export function SurveyCta() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={s.ctaSurvey}
        onClick={() => setOpen(true)}
      >
        <span className={s.ctaSurveyInner}>
          <span className={s.ctaSurveyText}>
            <span className={s.ctaSurveyLabel}>더 나은 이랑을 만들어 주세요</span>
            <span className={s.ctaSurveyDesc}>30초면 충분해요</span>
          </span>
          <span className={s.ctaSurveyArrow}>
            <ArrowRight size={14} />
          </span>
        </span>
      </button>
      <RequestModal
        open={open}
        onClose={() => setOpen(false)}
        category="의견"
        pageName="메인"
      />
    </>
  );
}
