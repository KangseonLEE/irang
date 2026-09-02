import type { Metadata } from "next";
import Link from "next/link";
import { UpdateMedia } from "./update-media";
import { ArrowLeft, ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { PageHeader } from "@/components/ui/page-header";
import { LEGACY_UPDATES } from "@/lib/data/corrections";
import { RELEASES, RELEASE_SIGNOFF, UPDATES, type UpdateItem, type UpdateTag } from "@/lib/data/updates";
import d from "../disclaimer/page.module.css";
import c from "../corrections/page.module.css";
import u from "./page.module.css";

export const metadata: Metadata = {
  title: "이렇게 개선됐어요 — 업데이트 소식 | 이랑",
  description:
    "이랑이 최근에 무엇을 고치고 무엇을 더했는지 확인하세요. 새 기능과 개선 내역을 날짜순으로 정리했어요.",
  alternates: { canonical: "/about/updates" },
};

/** 태그별 pill 색 변형 — 정의는 page.module.css 한 곳 */
const TAG_CLASS: Record<UpdateTag, string> = {
  기능: u.tagFeature,
  개선: u.tagImprove,
  수정: u.tagFix,
  데이터: u.tagData,
};

interface UpdateGroup {
  date: string;
  items: UpdateItem[];
}

/** 이미 최신순으로 정렬된 UPDATES를 날짜별로 묶는다 (순서 유지) */
function groupByDate(items: UpdateItem[]): UpdateGroup[] {
  const groups: UpdateGroup[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.date === item.date) {
      last.items.push(item);
    } else {
      groups.push({ date: item.date, items: [item] });
    }
  }
  return groups;
}

/** "2026-09-02" → "2026년 9월 2일" (Date 파싱 없이 문자열만 — 시간대 함정 회피) */
function formatDateLabel(date: string): string {
  const [y, m, day] = date.split("-");
  return `${y}년 ${Number(m)}월 ${Number(day)}일`;
}

export default function UpdatesPage() {
  const groups = groupByDate(UPDATES);

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
        count={UPDATES.length}
      />


      <ol className={u.timeline}>
        {groups.map((group) => (
          <li key={group.date} className={u.group}>
            <div className={u.groupHead}>
              <h2 className={u.dateLabel}>
                <time dateTime={group.date}>{formatDateLabel(group.date)}</time>
                {RELEASES[group.date] && (
                  <span className={u.tagline}>{RELEASES[group.date].tagline}</span>
                )}
              </h2>
              {RELEASES[group.date] && <p className={u.intro}>{RELEASES[group.date].intro}</p>}
            </div>
            <ul className={u.items}>
              {group.items.map((item) => (
                <li key={item.id} className={u.item}>
                  <div className={u.itemHead}>
                    <span className={`${u.tag} ${TAG_CLASS[item.tag]}`}>
                      {item.tag}
                    </span>
                    <h3 className={u.itemTitle}>{item.title}</h3>
                  </div>
                  <p className={u.itemSummary}>{item.summary}</p>
                  {item.media && <UpdateMedia title={item.title} media={item.media} />}
                  {item.href && (
                    <Link href={item.href} className={u.itemLink}>
                      바로 보기
                      <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <p className={u.signoff}>{RELEASE_SIGNOFF}</p>

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
