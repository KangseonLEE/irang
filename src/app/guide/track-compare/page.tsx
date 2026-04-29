import type { Metadata } from "next";
import Link from "next/link";
import { GitCompareArrows, Info, ExternalLink } from "lucide-react";
import { SubPageHero } from "@/components/ui/sub-page-hero";
import {
  TRACKS,
  TRACK_FIELDS,
  TRACK_LAST_VERIFIED,
} from "@/lib/data/track-compare";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "귀농·귀산촌 추진체계 비교 | 이랑",
  description:
    "귀농과 귀산촌의 나이, 교육이수, 사업기간, 지원금액, 상환조건을 한눈에 비교해보세요. 농림축산식품부·산림청 공식 기준이에요.",
  alternates: { canonical: "/guide/track-compare" },
};

export const revalidate = 86400;

export default function TrackComparePage() {
  return (
    <div className={s.page}>
      <SubPageHero
        overline="추진체계 비교"
        icon={GitCompareArrows}
        title="귀농 · 귀산촌, 어떻게 다를까요?"
        description="정착 단계의 창업자금·주택구입 지원을 기준으로 정리했어요."
      >
        <div className={s.notice}>
          <Info size={16} className={s.noticeIcon} strokeWidth={2} />
          <span>
            귀어(수산업)는 별도 준비 중이에요. 해양수산부 귀어귀촌종합센터를
            참고하세요.
          </span>
        </div>
      </SubPageHero>

      {/* 모바일: Stacked Card */}
      <div className={s.cardList}>
        {TRACKS.map((track) => (
          <article key={track.id} className={s.trackCard}>
            <header className={s.trackHeader}>
              <h2 className={s.trackName}>{track.name}</h2>
              <span className={s.trackAgency}>{track.agency}</span>
            </header>
            <div className={s.rowList}>
              {TRACK_FIELDS.map((f) => (
                <div key={f.field} className={s.row}>
                  <span className={s.rowLabel}>{f.label}</span>
                  <span className={s.rowValue}>{track.values[f.field]}</span>
                </div>
              ))}
            </div>
            <a
              href={track.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={s.sourceLink}
            >
              공식 출처 바로가기
              <ExternalLink size={12} strokeWidth={2} />
            </a>
          </article>
        ))}
      </div>

      {/* 데스크톱: 2열 테이블 */}
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th scope="col">구분</th>
              {TRACKS.map((t) => (
                <th key={t.id} scope="col">
                  {t.name}
                  <span className={s.agencyBadge}>{t.agency}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TRACK_FIELDS.map((f) => (
              <tr key={f.field}>
                <th scope="row">{f.label}</th>
                {TRACKS.map((t) => (
                  <td key={t.id}>{t.values[f.field]}</td>
                ))}
              </tr>
            ))}
            <tr className={s.sourceRow}>
              <th scope="row">공식 출처</th>
              {TRACKS.map((t) => (
                <td key={t.id}>
                  <a
                    href={t.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={s.sourceLink}
                    style={{ margin: 0 }}
                  >
                    바로가기
                    <ExternalLink size={12} strokeWidth={2} />
                  </a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <nav aria-label="관련 가이드" className={s.crossLinks}>
        <h2 className={s.crossLinkTitle}>관련 가이드</h2>
        <div className={s.crossLinkRow}>
          <Link href="/programs/roadmap" className={s.crossLink}>
            정부사업 가이드
          </Link>
          <Link href="/guide" className={s.crossLink}>
            귀농 5단계 로드맵
          </Link>
          <Link href="/programs" className={s.crossLink}>
            전체 지원사업
          </Link>
        </div>
      </nav>

      <p className={s.verifiedLabel}>
        최종 확인: {TRACK_LAST_VERIFIED}
      </p>
    </div>
  );
}
