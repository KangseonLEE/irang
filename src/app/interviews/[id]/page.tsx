import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Briefcase,
  Sprout,
  Quote,
  Lightbulb,
  AlertTriangle,
  MessageCircle,
} from "lucide-react";
import { interviews } from "@/lib/data/landing";
import { FarmerAvatar } from "@/components/avatar/farmer-avatar";
import s from "./page.module.css";

function getInterviewById(id: string) {
  return interviews.find((i) => i.id === id) ?? null;
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

  const otherInterviews = interviews.filter((i) => i.id !== id);

  return (
    <div className={s.page}>
      {/* 뒤로가기 */}
      <Link href="/" className={s.backLink}>
        <ArrowLeft size={16} />
        랜딩으로 돌아가기
      </Link>

      {/* 프로필 헤더 */}
      <header className={s.header}>
        <FarmerAvatar name={person.name} seed={person.id} size="lg" />
        <div className={s.headerInfo}>
          <h1 className={s.name}>{person.name}</h1>
          <p className={s.meta}>{person.age} · {person.region}</p>
          <div className={s.tags}>
            <span className={s.tag}>
              <Briefcase size={12} /> {person.prevJob}
            </span>
            <span className={s.tagArrow}>&rarr;</span>
            <span className={s.tag}>
              <Sprout size={12} /> {person.currentJob}
            </span>
          </div>
        </div>
      </header>

      {/* 핵심 인용문 */}
      <blockquote className={s.quoteBlock}>
        <Quote size={20} className={s.quoteIcon} />
        <p className={s.quoteText}>{person.quote}</p>
      </blockquote>

      {/* 상세 스토리 */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>
          <MessageCircle size={16} className={s.sectionIcon} />
          이야기
        </h2>
        <p className={s.sectionBody}>{person.story}</p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionTitle}>
          <Lightbulb size={16} className={s.sectionIcon} />
          귀농을 결심한 이유
        </h2>
        <p className={s.sectionBody}>{person.motivation}</p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionTitle}>
          <AlertTriangle size={16} className={s.sectionIcon} />
          가장 어려웠던 점
        </h2>
        <p className={s.sectionBody}>{person.challenge}</p>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionTitle}>
          <MapPin size={16} className={s.sectionIcon} />
          귀농을 고민하는 분들에게
        </h2>
        <p className={s.sectionBody}>{person.advice}</p>
      </section>

      {/* 정보 카드 */}
      <div className={s.infoGrid}>
        <div className={s.infoCard}>
          <span className={s.infoLabel}>지역</span>
          <span className={s.infoValue}>{person.region}</span>
        </div>
        <div className={s.infoCard}>
          <span className={s.infoLabel}>작물</span>
          <span className={s.infoValue}>{person.crop}</span>
        </div>
        <div className={s.infoCard}>
          <span className={s.infoLabel}>이전 직업</span>
          <span className={s.infoValue}>{person.prevJob}</span>
        </div>
      </div>

      {/* 원문 기사 링크 */}
      <a
        href={person.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={s.sourceLink}
      >
        <ExternalLink size={14} />
        원문 기사 보기 — {person.sourceName} ({person.sourceDate})
      </a>

      {/* 다른 인터뷰 */}
      {otherInterviews.length > 0 && (
        <section className={s.relatedSection}>
          <h2 className={s.relatedTitle}>다른 귀농인 이야기</h2>
          <div className={s.relatedGrid}>
            {otherInterviews.map((p) => (
              <Link
                key={p.id}
                href={`/interviews/${p.id}`}
                className={s.relatedCard}
              >
                <FarmerAvatar name={p.name} seed={p.id} size="sm" />
                <span className={s.relatedName}>
                  {p.name} · {p.age}
                </span>
                <span className={s.relatedMeta}>{p.region} · {p.crop}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <div className={s.ctaBanner}>
        <p className={s.ctaText}>나도 귀농을 시작해볼까?</p>
        <Link href="/match" className={s.ctaBtn}>
          내 귀농지 찾기
        </Link>
      </div>
    </div>
  );
}
