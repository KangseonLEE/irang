import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { SubPageHero } from "@/components/ui/sub-page-hero";
import {
  interviews,
  INTERVIEW_CATEGORIES,
  INTERVIEW_CATEGORY_LABEL,
  type InterviewCategoryId,
} from "@/lib/data/landing";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { InterviewCorrectionNotice } from "@/components/interview/correction-notice";
import { InterviewRichCard } from "@/components/interview/interview-rich-card";
import { FilterBar, FilterRow, FilterGroup } from "@/components/filter/filter-bar";
import { EmptyState } from "@/components/ui/empty-state";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "먼저 떠난 사람들 — 정착 인터뷰 큐레이션",
  description:
    "귀농·귀촌·스마트팜·청년농 등 여러 정착 이야기를 한 곳에 모았어요. 카드를 누르면 원문 기사로 이동해 직접 읽을 수 있어요.",
  keywords: ["정착 인터뷰", "정착 이야기", "정착 경험담", "농민신문 귀농", "귀농 사례 모음"],
  alternates: { canonical: "/interviews" },
};

const CATEGORY_IDS: readonly InterviewCategoryId[] = INTERVIEW_CATEGORIES.map((c) => c.id);
const CATEGORY_ID_STRINGS: readonly string[] = CATEGORY_IDS;

function isCategoryId(value: string | undefined): value is InterviewCategoryId {
  return Boolean(value && CATEGORY_ID_STRINGS.includes(value));
}

interface PageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function InterviewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeCategory: InterviewCategoryId | undefined = isCategoryId(params.type)
    ? params.type
    : undefined;

  // 카테고리 필터링 — category 또는 tags에 매칭
  const visibleInterviews = activeCategory
    ? interviews.filter(
        (p) =>
          p.category === activeCategory || (p.tags?.includes(activeCategory) ?? false),
      )
    : interviews;

  const currentFilters = { type: activeCategory };

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[{ name: "정착 이야기", href: "/interviews" }]} />
      {/* ═══ 히어로 헤더 ═══ */}
      <SubPageHero
        overline="언론에 소개된 이야기"
        title="먼저 떠난 사람들"
        titleAccent="떠난"
        description={
          <p>
            귀농·귀촌·스마트팜·청년농 등 여러 정착 이야기예요.
            <br />
            카드를 누르면 원문 기사로 이동해요.
          </p>
        }
      >
        <div className={s.heroStats}>
          <div className={s.heroStat}>
            <span className={s.heroStatValue}>{interviews.length}</span>
            <span className={s.heroStatLabel}>인터뷰</span>
          </div>
          <span className={s.heroStatDivider} />
          <div className={s.heroStat}>
            <span className={s.heroStatValue}>
              {[...new Set(interviews.map((i) => i.region.split(" ")[0]))].length}
            </span>
            <span className={s.heroStatLabel}>지역</span>
          </div>
          <span className={s.heroStatDivider} />
          <div className={s.heroStat}>
            <span className={s.heroStatValue}>28~62</span>
            <span className={s.heroStatLabel}>연령대</span>
          </div>
        </div>
      </SubPageHero>

      {/* ═══ 카테고리 필터 (2026-05-14 D1) ═══ */}
      <FilterBar>
        <FilterRow>
          <FilterGroup
            label="카테고리"
            paramKey="type"
            options={CATEGORY_ID_STRINGS}
            optionLabels={INTERVIEW_CATEGORY_LABEL}
            currentValue={activeCategory}
            currentFilters={currentFilters}
            basePath="/interviews"
          />
        </FilterRow>
      </FilterBar>

      {/* ═══ 인터뷰 카드 그리드 ═══ */}
      <section className={s.grid}>
        {visibleInterviews.length === 0 ? (
          <div className={s.emptyWrap}>
            <EmptyState
              icon={<Icon icon={Quote} size="lg" />}
              message="이 카테고리의 인터뷰는 준비 중이에요"
              linkHref="/interviews"
              linkText="전체 인터뷰 보기"
            />
          </div>
        ) : (
          visibleInterviews.map((person) => (
            <InterviewRichCard key={person.id} person={person} />
          ))
        )}
      </section>

      {/* ═══ 하단 CTA ═══ */}
      <div className={s.bottomCta}>
        <p className={s.bottomCtaText}>나도 이런 삶을 시작해볼까?</p>
        <Link href="/match" className={s.bottomCtaBtn}>
          맞춤 정착지 찾기 <Icon icon={ArrowRight} size="md" />
        </Link>
      </div>

      {/* ═══ 정정·삭제 요청 안내 ═══ */}
      <InterviewCorrectionNotice />
    </div>
  );
}
