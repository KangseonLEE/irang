import Link from "next/link";
import { ArrowRight } from "lucide-react";
import s from "./region-profile-card.module.css";

interface ProfileRow {
  label: string;
  value: string;
}
interface ProfileCta {
  href: string;
  label: string;
  primary?: boolean;
}

interface Props {
  overline?: string;
  title: string;
  rows: ProfileRow[];
  chips?: string[];
  ctas: ProfileCta[];
}

/**
 * 지역 개요 카드 — 시·도·시·군·구 상세 사이드바 최상단 (2026-09-17).
 * 작물 상세의 프로필 카드와 같은 역할: 스크롤해도 따라오는 요약 + 다음 행동.
 * 비동기 데이터(인구·기후)는 넣지 않는다 — 사이드바는 정적으로 먼저 그려져야 한다.
 */
export function RegionProfileCard({ overline, title, rows, chips, ctas }: Props) {
  return (
    <div className={s.card}>
      <div className={s.head}>
        {overline && <span className={s.overline}>{overline}</span>}
        <h3 className={s.title}>{title}</h3>
      </div>
      <dl className={s.rows}>
        {rows.map((r) => (
          <div key={r.label} className={s.row}>
            <dt className={s.rowLabel}>{r.label}</dt>
            <dd className={s.rowValue}>{r.value}</dd>
          </div>
        ))}
      </dl>
      {chips && chips.length > 0 && (
        <ul className={s.chips} aria-label="특징">
          {chips.map((c) => (
            <li key={c} className={s.chip}>{c}</li>
          ))}
        </ul>
      )}
      <div className={s.ctas}>
        {ctas.map((c) => (
          <Link key={c.href} href={c.href} className={c.primary ? s.ctaPrimary : s.cta}>
            {c.label}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </div>
  );
}
