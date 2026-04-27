"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { RequestModal } from "@/components/feedback/request-modal";
import s from "./page.module.css";

export function ProgramRequestCta() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className={s.feedbackCta} aria-label="의견 보내기">
        <div className={s.feedbackCtaIcon} aria-hidden="true">
          <MessageCircle size={22} />
        </div>
        <div className={s.feedbackCtaBody}>
          <h2 className={s.feedbackCtaTitle}>
            찾는 지원사업이 없으신가요?
          </h2>
          <p className={s.feedbackCtaDesc}>
            원하는 지원사업 정보를 알려주시면 우선적으로 추가할게요.
          </p>
        </div>
        <button
          type="button"
          className={s.feedbackCtaBtn}
          onClick={() => setOpen(true)}
        >
          의견 보내기
          <MessageCircle size={14} />
        </button>
      </section>
      <RequestModal
        open={open}
        onClose={() => setOpen(false)}
        category="지원사업"
        pageName="지원사업"
      />
    </>
  );
}
