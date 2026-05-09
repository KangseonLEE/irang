import type { Metadata } from "next";
import Image from "next/image";
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
import { interviews, hasFullStory } from "@/lib/data/landing";
import { FarmerAvatar } from "@/components/avatar/farmer-avatar";
import { getInterviewImageSrc } from "@/lib/interview-image";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "먼저 떠난 사람들 — 귀농인 인터뷰 큐레이션",
  description:
    "농민신문·서울신문·KBC 등에 보도된 귀농인 이야기를 한 곳에 모았어요. 카드를 누르면 원문 기사로 이동해 직접 읽을 수 있어요.",
  keywords: ["귀농 인터뷰", "귀농인 이야기", "귀농 경험담", "농민신문 귀농", "귀농 사례 모음"],
  alternates: { canonical: "/interviews" },
};

export default function InterviewsPage() {
  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[{ name: "귀농인 이야기", href: "/interviews" }]} />
      {/* ═══ 히어로 헤더 ═══ */}
      <SubPageHero
        overline="언론에 소개된 이야기"
        title="먼저 떠난 사람들"
        titleAccent="떠난"
        description={
          <p>
            농민신문·서울신문·KBC 등에서 만난 귀농인 7명의 이야기예요.
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

      {/* ═══ 인터뷰 카드 그리드 ═══ */}
      <section className={s.grid}>
        {interviews.map((person) => {
          const illustration = getInterviewImageSrc(person.id);
          const isInternal = hasFullStory(person);
          const cardInner = (
            <>
              {illustration && (
                <div className={s.cardImageWrap}>
                  <Image
                    src={illustration}
                    alt={`${person.name}님의 농장 일러스트`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw"
                    className={s.cardImage}
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
              {/* 프로필 */}
              <div className={s.cardHeader}>
                {!illustration && (
                  <FarmerAvatar
                    name={person.name}
                    seed={person.id}
                    size="md"
                  />
                )}
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
                  {isInternal ? "이야기 읽기" : `${person.sourceName} 원문`}{" "}
                  <Icon icon={ArrowRight} size="sm" />
                </span>
              </div>
            </>
          );
          return isInternal ? (
            <Link key={person.id} href={`/interviews/${person.id}`} className={s.card}>
              {cardInner}
            </Link>
          ) : (
            <a
              key={person.id}
              href={person.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={s.card}
            >
              {cardInner}
            </a>
          );
        })}
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
