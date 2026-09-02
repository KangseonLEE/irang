import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import {
  RELEASE_GROUPS,
  RELEASE_SIGNOFF,
  formatReleaseDate,
  getRelease,
  releaseTitle,
} from "@/lib/data/updates";
import { UpdateMedia } from "../update-media";
import { TAG_CLASS } from "../tag-class";
import d from "../../disclaimer/page.module.css";
import u from "../page.module.css";

interface Props {
  params: Promise<{ date: string }>;
}

export function generateStaticParams() {
  return RELEASE_GROUPS.map((r) => ({ date: r.date }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const release = getRelease(date);
  if (!release) return { title: "업데이트 소식" };
  const title = releaseTitle(release);
  return {
    title: `${title} — ${formatReleaseDate(date)} 업데이트 소식`,
    description: release.note?.intro ?? release.items.map((i) => i.title).join(" · "),
    alternates: { canonical: `/about/updates/${date}` },
  };
}

/** 날짜 단위 공지 상세 — 카카오 공지 구조(태그라인 → 인사말 → 항목·이미지 → 마무리). 목록은 ../page.tsx */
export default async function UpdateReleasePage({ params }: Props) {
  const { date } = await params;
  const release = getRelease(date);
  if (!release) return notFound();

  const index = RELEASE_GROUPS.indexOf(release);
  const newer = index > 0 ? RELEASE_GROUPS[index - 1] : undefined;
  const older = RELEASE_GROUPS[index + 1];
  const title = releaseTitle(release);

  return (
    <div className={d.page}>
      <BreadcrumbJsonLd
        items={[
          { name: "서비스 소개", href: "/about" },
          { name: "업데이트 소식", href: "/about/updates" },
          { name: title, href: `/about/updates/${date}` },
        ]}
      />
      <Link href="/about/updates" className={d.backLink}>
        <ArrowLeft size={16} />
        업데이트 소식으로
      </Link>

      <article className={u.release}>
        <header className={u.groupHead}>
          <time className={u.dateLabel} dateTime={date}>
            {formatReleaseDate(date)}
          </time>
          <h1 className={u.releaseTitle}>{title}</h1>
          {release.note && <p className={u.intro}>{release.note.intro}</p>}
        </header>

        <ul className={u.items}>
          {release.items.map((item) => (
            <li key={item.id} className={u.item}>
              <div className={u.itemHead}>
                <span className={`${u.tag} ${TAG_CLASS[item.tag]}`}>{item.tag}</span>
                <h2 className={u.itemTitle}>{item.title}</h2>
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

        <p className={u.signoff}>{RELEASE_SIGNOFF}</p>
      </article>

      <nav className={u.siblingNav} aria-label="다른 업데이트 소식">
        {older ? (
          <Link href={`/about/updates/${older.date}`} className={u.siblingLink}>
            <ChevronLeft size={16} aria-hidden="true" />
            <span className={u.siblingBody}>
              <span className={u.siblingLabel}>이전 소식</span>
              <span className={u.siblingTitle}>{releaseTitle(older)}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {newer && (
          <Link href={`/about/updates/${newer.date}`} className={`${u.siblingLink} ${u.siblingLinkNext}`}>
            <span className={u.siblingBody}>
              <span className={u.siblingLabel}>다음 소식</span>
              <span className={u.siblingTitle}>{releaseTitle(newer)}</span>
            </span>
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        )}
      </nav>
    </div>
  );
}
