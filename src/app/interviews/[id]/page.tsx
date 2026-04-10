import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  MapPin,
  Briefcase,
  Sprout,
  Quote,
  Lightbulb,
  AlertTriangle,
  MessageCircle,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { interviews } from "@/lib/data/landing";
import { CROPS } from "@/lib/data/crops";
import { FarmerAvatar } from "@/components/avatar/farmer-avatar";
import { CropLinkCard } from "@/components/crop/crop-link-card";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import s from "./page.module.css";

function getInterviewById(id: string) {
  return interviews.find((i) => i.id === id) ?? null;
}

function pickRandomOthers(excludeId: string, count: number) {
  const others = interviews.filter((i) => i.id !== excludeId);
  // Fisher-Yates shuffle
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  return others.slice(0, count);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const person = getInterviewById(id);
  return {
    title: person
      ? `${person.name}님의 귀농 이야기 — 이랑`
      : "귀농 인터뷰 상세",
    description: person?.story.slice(0, 160),
  };
}

export function generateStaticParams() {
  return interviews.map((i) => ({ id: i.id }));
}

interface InterviewDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InterviewDetailPage({
  params,
}: InterviewDetailPageProps) {
  const { id } = await params;
  const person = getInterviewById(id);
  if (!person) return notFound();

  // 다른 인터뷰: 셔플 후 최대 3개
  const otherInterviews = pickRandomOthers(id, 3);

  return (
    <div className={s.page}>
      {/* ═══ 뒤로가기 ═══ */}
      <Link href="/interviews" className={s.backLink}>
        <Icon icon={ArrowLeft} size="md" />
        귀농인 이야기
      </Link>

      {/* ═══ 히어로: 프로필 + 인용문 ═══ */}
      <section className={s.hero}>
        <div className={s.heroTop}>
          <div className={s.heroProfile}>
            <FarmerAvatar name={person.name} seed={person.id} size="lg" />
            <div className={s.heroInfo}>
              <h1 className={s.heroName}>{person.name}</h1>
              <p className={s.heroMeta}>{person.age} · {person.region}</p>
              <div className={s.heroTags}>
                <span className={s.heroTag}>
                  <Icon icon={Briefcase} size="xs" /> {person.prevJob}
                </span>
                <span className={s.heroTagArrow}>&rarr;</span>
                <span className={s.heroTag}>
                  <Icon icon={Sprout} size="xs" /> {person.currentJob}
                </span>
              </div>
            </div>
          </div>
          <a
            href={person.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={s.sourceLink}
          >
            <Icon icon={ExternalLink} size="sm" />
            원문 기사
          </a>
        </div>

        <blockquote className={s.heroQuote}>
          <Icon icon={Quote} size="lg" className={s.heroQuoteIcon} />
          <p className={s.heroQuoteText}><AutoGlossary text={person.quote} /></p>
        </blockquote>

        {/* 정보 뱃지 */}
        <div className={s.heroInfoBadges}>
          <Link href={person.regionUrl} className={s.heroInfoBadgeLink}>
            <Icon icon={MapPin} size="sm" /> {person.region}
          </Link>
          {person.cropLinks.map((cl) => (
            <Link key={cl.href} href={cl.href} className={s.heroInfoBadgeLink}>
              <Icon icon={Sprout} size="sm" /> {cl.name}
            </Link>
          ))}
          {person.cropLinks.length === 0 && (
            <span className={s.heroInfoBadge}>
              <Icon icon={Sprout} size="sm" /> {person.crop}
            </span>
          )}
        </div>
      </section>

      {/* ═══ 본문: 이야기 (메인 콘텐츠, 가장 넓은 공간) ═══ */}
      <section className={s.storySection}>
        <h2 className={s.storyTitle}>
          <Icon icon={MessageCircle} size="lg" className={s.sectionIcon} />
          이야기
        </h2>
        <p className={s.storyBody}><AutoGlossary text={person.story} /></p>
      </section>

      {/* ═══ 인사이트 카드 2열: 동기 + 어려움 ═══ */}
      <div className={s.insightGrid}>
        <section className={s.insightCard} data-variant="motivation">
          <h2 className={s.insightTitle}>
            <Icon icon={Lightbulb} size="md" />
            귀농을 결심한 이유
          </h2>
          <p className={s.insightBody}><AutoGlossary text={person.motivation} /></p>
        </section>

        <section className={s.insightCard} data-variant="challenge">
          <h2 className={s.insightTitle}>
            <Icon icon={AlertTriangle} size="md" />
            가장 어려웠던 점
          </h2>
          <p className={s.insightBody}><AutoGlossary text={person.challenge} /></p>
        </section>
      </div>

      {/* ═══ 조언: 강조 카드 ═══ */}
      <section className={s.adviceCard}>
        <h2 className={s.adviceTitle}>
          귀농을 고민하는 분들에게
        </h2>
        <p className={s.adviceBody}><AutoGlossary text={person.advice} /></p>
      </section>

      {/* ═══ 관련 데이터 ═══ */}
      <section className={s.dataSection}>
        <h2 className={s.dataSectionTitle}>
          {person.name}님이 정착한 지역과 작물이에요
        </h2>

        {/* 지역 */}
        <div className={s.dataGroup}>
          <h3 className={s.dataGroupLabel}>
            <Icon icon={MapPin} size="sm" /> 지역
          </h3>
          <Link href={person.regionUrl} className={s.dataCard}>
            <div className={s.dataCardInfo}>
              <span className={s.dataCardLabel}>{person.region}</span>
              <span className={s.dataCardDesc}>기후·인구·의료·교육</span>
            </div>
            <Icon icon={ArrowRight} size="sm" className={s.dataCardArrow} />
          </Link>
        </div>

        {/* 작물 */}
        {person.cropLinks.length > 0 && (
          <div className={s.dataGroup}>
            <h3 className={s.dataGroupLabel}>
              <Icon icon={Sprout} size="sm" /> 작물
            </h3>
            <div className={s.dataGrid}>
              {person.cropLinks.map((cl) => {
                const cropId = cl.href.split("/").pop() ?? "";
                const crop = CROPS.find((c) => c.id === cropId);
                return (
                  <CropLinkCard
                    key={cl.href}
                    cropId={cropId}
                    name={cl.name}
                    href={cl.href}
                    meta={
                      crop
                        ? `${crop.category} · 재배난이도: ${crop.difficulty}`
                        : "재배 정보·난이도·시세"
                    }
                  />
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ═══ 다른 인터뷰 (최대 3개) ═══ */}
      {otherInterviews.length > 0 && (
        <section className={s.relatedSection}>
          <h2 className={s.relatedTitle}>다른 귀농인의 이야기도 들어보세요</h2>
          <div className={s.relatedGrid}>
            {otherInterviews.map((p) => (
              <Link
                key={p.id}
                href={`/interviews/${p.id}`}
                className={s.relatedCard}
              >
                <FarmerAvatar name={p.name} seed={p.id} size="sm" />
                <div className={s.relatedInfo}>
                  <span className={s.relatedName}>{p.name}</span>
                  <span className={s.relatedMeta}>{p.age} · {p.region}</span>
                  <span className={s.relatedCrop}>{p.crop}</span>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/interviews" className={s.relatedAllLink}>
            전체 이야기 보기 &rarr;
          </Link>
        </section>
      )}

      {/* ═══ CTA ═══ */}
      <div className={s.ctaBanner}>
        <p className={s.ctaText}>나도 귀농을 시작해볼까?</p>
        <Link href="/match" className={s.ctaBtn}>
          내 귀농지 찾기
        </Link>
      </div>
    </div>
  );
}
