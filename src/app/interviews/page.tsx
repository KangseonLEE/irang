import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Sprout,
  Briefcase,
  Quote,
  MapPin,
} from "lucide-react";
import { interviews } from "@/lib/data/landing";
import { FarmerAvatar } from "@/components/avatar/farmer-avatar";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "귀농인 인터뷰 — 이랑",
  description:
    "도시를 떠나 농촌에서 새 삶을 시작한 사람들의 생생한 이야기를 만나보세요.",
};

export default function InterviewsPage() {
  return (
    <div className={s.page}>
      {/* ═══ 히어로 헤더 ═══ */}
      <header className={s.hero}>
        <p className={s.heroOverline}>귀농인 이야기</p>
        <h1 className={s.heroTitle}>
          <span className={s.heroTitleAccent}>귀농</span>으로 다시 시작한 사람들
        </h1>
        <p className={s.heroDesc}>
          나이, 지역, 작물 모두 다르지만 한 가지 공통점이 있습니다.
          <br />
          &ldquo;후회하지 않는다&rdquo;는 것.
        </p>
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
      </header>

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
                  <MapPin size={12} /> {person.region} · {person.age}
                </span>
              </div>
            </div>

            {/* 직업 변화 */}
            <div className={s.cardTags}>
              <span className={s.cardTag}>
                <Briefcase size={11} />
                {person.prevJob}
              </span>
              <span className={s.cardTagArrow}>&rarr;</span>
              <span className={s.cardTag}>
                <Sprout size={11} />
                {person.currentJob}
              </span>
            </div>

            {/* 인용문 */}
            <div className={s.cardQuoteWrap}>
              <Quote size={16} className={s.cardQuoteIcon} />
              <p className={s.cardQuote}><AutoGlossary text={person.quote} /></p>
            </div>

            {/* 푸터 */}
            <div className={s.cardFooter}>
              <div className={s.cardFooterBadges}>
                <span className={s.cardRegionBadge}>
                  <MapPin size={11} /> {person.region}
                </span>
                <span className={s.cardCrop}>
                  <Sprout size={11} /> {person.crop}
                </span>
              </div>
              <span className={s.cardCta}>
                이야기 읽기 <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* ═══ 하단 CTA ═══ */}
      <div className={s.bottomCta}>
        <p className={s.bottomCtaText}>나도 이런 삶을 시작해볼까?</p>
        <Link href="/match" className={s.bottomCtaBtn}>
          맞춤 귀농지 찾기 <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
