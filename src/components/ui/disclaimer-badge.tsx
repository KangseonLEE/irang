import Link from "next/link";
import { Info } from "lucide-react";
import s from "./disclaimer-badge.module.css";

/**
 * 참고용 면책고지 배지 — 데이터가 많은 페이지 하단이나 푸터에 배치.
 * Server Component. 링크로 /about/disclaimer 페이지로 이동.
 */
export function DisclaimerBadge() {
  return (
    <Link href="/about/disclaimer" className={s.badge}>
      <Info size={12} aria-hidden="true" />
      참고용 · 면책고지
    </Link>
  );
}
