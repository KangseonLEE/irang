import Link from "next/link";
import { Info } from "lucide-react";
import s from "./reference-notice.module.css";

interface ReferenceNoticeProps {
  text?: string;
  className?: string;
}

/**
 * 참고용 정보 안내 — 데이터 의사결정 페이지 상단에 배치.
 * 면책고지 페이지 링크 포함. Server Component.
 */
export function ReferenceNotice({
  text = "이 정보는 공공데이터를 가공한 참고 자료예요. 중요한 결정은 해당 기관에 직접 확인하세요.",
  className,
}: ReferenceNoticeProps) {
  return (
    <div className={`${s.notice} ${className ?? ""}`}>
      <Info size={14} className={s.icon} aria-hidden="true" />
      <p className={s.text}>
        {text}{" "}
        <Link href="/about/disclaimer" className={s.link}>
          자세히 보기
        </Link>
      </p>
    </div>
  );
}
