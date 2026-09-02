import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  FileEdit,
  Calendar,
  ArrowRight,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { PageHeader } from "@/components/ui/page-header";
import s from "../disclaimer/page.module.css";
import c from "./page.module.css";
import { CORRECTIONS, excerpt } from "@/lib/data/corrections";

/** 모바일 페이지네이션 단위 — 데스크탑은 모든 entry 한 번에 노출 */
const PER_PAGE_MOBILE = 10;

type PeriodFilter = "week" | "month" | "all";

const PERIOD_OPTIONS: { value: PeriodFilter; label: string; days: number | null }[] = [
  { value: "all", label: "전체", days: null },
  { value: "month", label: "최근 1달", days: 30 },
  { value: "week", label: "최근 1주", days: 7 },
];

function isWithinDays(dateStr: string, days: number, today: Date): boolean {
  const d = new Date(`${dateStr}T00:00:00+09:00`);
  const cutoff = new Date(today.getTime() - days * 86400000);
  return d.getTime() >= cutoff.getTime();
}

function buildHref(overrides: { period?: PeriodFilter; page?: number }): string {
  const params = new URLSearchParams();
  if (overrides.period && overrides.period !== "all") {
    params.set("period", overrides.period);
  }
  if (overrides.page && overrides.page > 1) {
    params.set("page", String(overrides.page));
  }
  const q = params.toString();
  return `/about/corrections${q ? `?${q}` : ""}`;
}

export const metadata: Metadata = {
  title: "데이터 정정 이력 | 이랑",
  description:
    "이랑 서비스의 데이터 정정 이력을 확인하세요. 발견된 오류와 수정 내역을 투명하게 공개해요.",
  alternates: { canonical: "/about/corrections" },
};


interface Props {
  searchParams: Promise<{ period?: string; page?: string }>;
}

export default async function CorrectionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const period: PeriodFilter =
    params.period === "week" || params.period === "month"
      ? params.period
      : "all";

  const today = new Date();
  const filtered =
    period === "all"
      ? CORRECTIONS
      : CORRECTIONS.filter((e) =>
          isWithinDays(e.date, period === "week" ? 7 : 30, today),
        );

  const totalMobilePages = Math.max(1, Math.ceil(filtered.length / PER_PAGE_MOBILE));
  const requestedPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const mobilePage = Math.min(requestedPage, totalMobilePages);

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[
        { name: "서비스 소개", href: "/about" },
        { name: "정정 이력", href: "/about/corrections" },
      ]} />
      <Link href="/about" className={s.backLink}>
        <ArrowLeft size={16} />
        소개 페이지로
      </Link>

      <PageHeader
        icon={<FileEdit size={14} aria-hidden="true" />}
        label="정정 이력"
        title="바로잡은 기록이에요"
        description="화면에 표시한 정보가 틀렸거나 원문이 바뀌어 바로잡은 기록이에요. 새 기능·개선 소식은 업데이트 소식에서 볼 수 있어요."
        count={CORRECTIONS.length}
      />

      <nav className={c.filterRow} aria-label="기록 종류">
        <Link href="/about/updates" className={c.filterChip}>
          업데이트 소식
        </Link>
        <Link
          href="/about/corrections"
          className={`${c.filterChip} ${c.filterChipActive}`}
          aria-current="page"
        >
          정정 이력
        </Link>
      </nav>
      <p className={c.kindNote}>
        <strong>업데이트 소식</strong>은 새 기능·개선·데이터 추가, <strong>정정 이력</strong>은 표시한 정보가 틀렸거나 바뀌어 바로잡은 기록이에요.
      </p>

      <section className={s.section}>
        <div className={s.sectionHeader}>
          <Calendar size={18} />
          <h2 className={s.sectionTitle}>최근 정정 내역</h2>
        </div>

        <div className={c.filterRow} role="group" aria-label="기간 필터">
          {PERIOD_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={buildHref({ period: opt.value, page: 1 })}
              className={`${c.filterChip} ${period === opt.value ? c.filterChipActive : ""}`}
              aria-current={period === opt.value ? "page" : undefined}
              scroll={false}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        <div className={s.sourceList}>
          {filtered.length === 0 && (
            <div className={c.empty}>해당 기간에 정정 내역이 없어요</div>
          )}
          {filtered.map((entry, i) => {
            const entryMobilePage = Math.ceil((i + 1) / PER_PAGE_MOBILE);
            const isCurrentMobilePage = entryMobilePage === mobilePage;
            return (
              <details
                key={`${entry.date}-${entry.field}`}
                className={c.entry}
                data-mobile-current={isCurrentMobilePage || undefined}
              >
                <summary className={c.entrySummary}>
                  <span className={c.entryMeta}>
                    <time className={c.entryDate} dateTime={entry.date}>
                      {entry.date}
                    </time>
                    <span className={c.entryTitle}>{entry.field}</span>
                  </span>
                  <span className={c.entryExcerpt}>{excerpt(entry.description)}</span>
                  <ChevronDown size={16} className={c.entryChevron} aria-hidden="true" />
                </summary>
                <p className={c.entryBody}>{entry.description}</p>
              </details>
            );
          })}
        </div>

        {totalMobilePages > 1 && (
          <nav className={c.pagination} aria-label="모바일 페이지 이동">
            <Link
              href={buildHref({ period, page: Math.max(1, mobilePage - 1) })}
              className={`${c.pageBtn} ${mobilePage === 1 ? c.pageBtnDisabled : ""}`}
              aria-disabled={mobilePage === 1}
              scroll={false}
            >
              이전
            </Link>
            <span className={c.pageInfo}>
              {mobilePage} / {totalMobilePages}
            </span>
            <Link
              href={buildHref({ period, page: Math.min(totalMobilePages, mobilePage + 1) })}
              className={`${c.pageBtn} ${mobilePage === totalMobilePages ? c.pageBtnDisabled : ""}`}
              aria-disabled={mobilePage === totalMobilePages}
              scroll={false}
            >
              다음
            </Link>
          </nav>
        )}
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader}>
          <MessageSquare size={18} />
          <h2 className={s.sectionTitle}>오류를 발견하셨나요?</h2>
        </div>
        <div className={s.sectionBody}>
          <p>
            데이터 오류, 외부 링크 문제, 본인 정보 정정·삭제 요청까지 — 어떤 종류든
            알려주시면 영업일 3일 안에 확인하고 처리해 드려요.
          </p>
          <div className={s.callout}>
            <div>
              <strong>피드백 보내기</strong>
              <a
                href={`mailto:loyal3270@gmail.com?subject=${encodeURIComponent("[이랑] 데이터 정정 요청")}`}
                className={s.calloutPhone}
              >
                loyal3270@gmail.com
              </a>
              <span style={{ display: "block", marginTop: 4 }}>
                메일 제목과 본문에 어느 페이지의 어떤 데이터인지 적어주시면 빠르게 처리돼요.
              </span>
            </div>
          </div>
        </div>
      </section>

      <Link href="/about/disclaimer" className={s.backLink}>
        면책고지 전문 보기 <ArrowRight size={14} />
      </Link>
    </div>
  );
}
