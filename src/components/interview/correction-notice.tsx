import Link from "next/link";
import { Mail, ShieldCheck } from "lucide-react";
import s from "./correction-notice.module.css";

const CONTACT_EMAIL = "loyal3270@gmail.com";

/**
 * 인터뷰 페이지 하단에 노출되는 정정·삭제 요청 컨택 박스.
 * 본인이 게재 사실을 발견했을 때 빠르게 연락할 수 있도록 명확한 채널을 제공.
 * Server Component.
 */
export function InterviewCorrectionNotice() {
  const subject = encodeURIComponent("[이랑] 인터뷰 정정·삭제 요청");
  return (
    <aside className={s.notice} aria-label="인터뷰 정정·삭제 요청 안내">
      <div className={s.iconWrap} aria-hidden="true">
        <ShieldCheck size={18} />
      </div>
      <div className={s.body}>
        <p className={s.title}>본인 정보가 잘못 표시됐다면 알려주세요</p>
        <p className={s.desc}>
          이 페이지에 게재된 인용·정보가 본인의 것이 아니거나, 정정·삭제를 원하시면 영업일 3일 안에 처리해 드릴게요.
        </p>
        <div className={s.actions}>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${subject}`}
            className={s.mailLink}
          >
            <Mail size={14} aria-hidden="true" />
            {CONTACT_EMAIL}
          </a>
          <Link href="/about/corrections" className={s.formLink}>
            정정 요청 폼 &rarr;
          </Link>
        </div>
      </div>
    </aside>
  );
}
