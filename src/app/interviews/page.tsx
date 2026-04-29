import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Quote,
  MapPin,
} from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import { Icon } from "@/components/ui/icon";
import { SubPageHero } from "@/components/ui/sub-page-hero";
import { interviews } from "@/lib/data/landing";
import { FarmerAvatar } from "@/components/avatar/farmer-avatar";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "귀농 성공 사례 — 실제 귀농인 인터뷰",
  description:
    "30대·40대·50대 귀농에 성공한 분들의 이야기. 준비 과정, 초기 비용, 실패와 극복, 정착 후 생활을 생생하게 들어보세요.",
  keywords: ["귀농 성공 사례", "귀농 인터뷰", "귀농 경험담", "귀농 후기", "귀농 실패 극복"],
  alternates: { canonical: "/interviews" },
};

export default function InterviewsPage() {
  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[{ name: "귀농인 이야기", href: "/interviews" }]} />
      {/* ═══ 히어로 헤더 ═══ */}
      <SubPageHero
        overline="귀농인 이야기"
        title="귀농으로 다시 시작한 사람들"
        titleAccent="귀농"
        description={
          <p>
            나이, 지역, 작물 모두 다르지만 한 가지 공통점이 있어요.
            <br />
            &ldquo;후회하지 않는다&rdquo;는 것.
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

      {/* ═══ 인터뷰 카드 그리드 ═══ */}
      <section className={s.grid}>
        {interviews.map((person) => (
          <Link
            key={person.id}
            href={`/interviews/${person.id}`}
            className={s.card}
          >
            {/* 프로필 */}
            <div className={s.cardHeader}>
              <FarmerAvatar
                name={person.name}
                seed={person.id}
                size="md"
              />
              <div className={s.cardProfile}>
                <span className={s.cardName}>{person.name}</span>
                <span className={s.cardMeta}>
                  <Icon icon={MapPin} size="xs" /> {person.region} · {person.age}
                </span>
              </div>
            </div>

            {/* 직업 변화 */}
            <div className={s.cardTags}>
              <span className={s.cardTag}>
                <Icon icon={Briefcase} size="xs" />
                {person.prevJob}
              </span>
              <span className={s.cardTagArrow}>&rarr;</span>
              <span className={s.cardTag}>
                <Icon icon={Sprout} size="xs" />
                {person.currentJob}
              </span>
            </div>

            {/* 인용문 */}
            <div className={s.cardQuoteWrap}>
              <Icon icon={Quote} size="md" className={s.cardQuoteIcon} />
              <p className={s.cardQuote}><AutoGlossary text={person.quote} /></p>
            </div>

            {/* 푸터 */}
            <div className={s.cardFooter}>
              <div className={s.cardFooterBadges}>
                <span className={s.cardRegionBadge}>
                  <Icon icon={MapPin} size="xs" /> {person.region}
                </span>
                <span className={s.cardCrop}>
                  <Icon icon={Sprout} size="xs" /> {person.crop}
                </span>
              </div>
              <span className={s.cardCta}>
                이야기 읽기 <Icon icon={ArrowRight} size="sm" />
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* ═══ 하단 CTA ═══ */}
      <div className={s.bottomCta}>
        <p className={s.bottomCtaText}>나도 이런 삶을 시작해볼까?</p>
        <Link href="/match" className={s.bottomCtaBtn}>
          맞춤 귀농지 찾기 <Icon icon={ArrowRight} size="md" />
        </Link>
      </div>
    </div>
  );
}
