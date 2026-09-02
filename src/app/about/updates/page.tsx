import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles, ChevronDown, ChevronRight, Bell } from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { PageHeader } from "@/components/ui/page-header";
import { LEGACY_UPDATES } from "@/lib/data/corrections";
import { RELEASE_GROUPS, formatReleaseDate, releaseTitle } from "@/lib/data/updates";
import d from "../disclaimer/page.module.css";
import c from "../corrections/page.module.css";
import u from "./page.module.css";
import { TAG_CLASS } from "./tag-class";

export const metadata: Metadata = {
  title: "업데이트 소식 — 이렇게 개선됐어요",
  description:
    "이랑이 최근에 무엇을 고치고 무엇을 더했는지 확인하세요. 새 기능과 개선 내역을 날짜순으로 정리했어요.",
  alternates: { canonical: "/about/updates" },
};

/** 행 하단 태그 요약 — 같은 태그는 한 번만, UPDATES 순서 유지 */
function uniqueTags(tags: string[]): string[] {
  return tags.filter((t, i) => tags.indexOf(t) === i);
}

export default function UpdatesPage() {
  return (
    <div className={d.page}>
      <BreadcrumbJsonLd
        items={[
          { name: "서비스 소개", href: "/about" },
          { name: "업데이트 소식", href: "/about/updates" },
        ]}
      />
      <Link href="/about" className={d.backLink}>
        <ArrowLeft size={16} />
        소개 페이지로
      </Link>

      <nav className={c.filterRow} aria-label="기록 종류">
        <Link
          href="/about/updates"
          className={`${c.filterChip} ${c.filterChipActive}`}
          aria-current="page"
        >
          업데이트 소식
        </Link>
        <Link href="/about/corrections" className={c.filterChip}>
          정정 이력
        </Link>
      </nav>

      <PageHeader
        icon={<Sparkles size={14} aria-hidden="true" />}
        label="업데이트 소식"
        title="이렇게 개선됐어요"
        description="새로 생기고 좋아진 것들을 모았어요. 잘못 안내한 정보를 바로잡은 기록은 정정 이력에서 따로 볼 수 있어요."
        count={RELEASE_GROUPS.length}
      />

      <section className={d.section}>
        <div className={d.sectionHeader}>
          <Bell size={18} />
          <h2 className={d.sectionTitle}>업데이트 목록</h2>
        </div>

        <ol className={u.list}>
          {RELEASE_GROUPS.map((release) => (
            <li key={release.date} className={u.row}>
              <Link href={`/about/updates/${release.date}`} className={u.rowLink}>
                <span className={u.rowMain}>
                  <time className={u.rowDate} dateTime={release.date}>
                    {formatReleaseDate(release.date)}
                  </time>
                  <span className={u.rowTitle}>{releaseTitle(release)}</span>
                  <span className={u.rowMeta}>
                    <span className={u.rowCount}>{release.items.length}건</span>
                    {uniqueTags(release.items.map((i) => i.tag)).map((tag) => (
                      <span key={tag} className={`${u.tag} ${u.tagSm} ${TAG_CLASS[tag as keyof typeof TAG_CLASS]}`}>
                        {tag}
                      </span>
                    ))}
                  </span>
                </span>
                <ChevronRight size={18} className={u.rowChevron} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {LEGACY_UPDATES.length > 0 && (
        <details className={u.legacy}>
          <summary className={u.legacySummary}>
            이전 변경 기록 ({LEGACY_UPDATES.length}건 · 2026년 4~6월)
            <ChevronDown size={16} className={u.legacyChevron} aria-hidden="true" />
          </summary>
          <p className={u.legacyNote}>업데이트 소식을 따로 적기 전의 기능·개선 기록이에요. 당시 작업 메모라 표현이 딱딱할 수 있어요.</p>
          <ul className={u.legacyList}>
            {LEGACY_UPDATES.map((e) => (
              <li key={`${e.date}-${e.field}`} className={u.legacyItem}>
                <details className={u.legacyEntry}>
                  <summary className={u.legacyEntrySummary}>
                    <time className={u.legacyDate} dateTime={e.date}>{e.date}</time>
                    <span className={u.legacyTitle}>{e.field}</span>
                  </summary>
                  <p className={u.legacyBody}>{e.description}</p>
                </details>
              </li>
            ))}
          </ul>
        </details>
      )}

      <p className={u.footNote}>
        데이터를 잘못 안내했던 기록은{" "}
        <Link href="/about/corrections" className={u.footNoteLink}>
          정정 이력
        </Link>
        에서 따로 확인하실 수 있어요.
      </p>
    </div>
  );
}
