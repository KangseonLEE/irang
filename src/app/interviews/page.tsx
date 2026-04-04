import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Users, Sprout, Briefcase } from "lucide-react";
import { interviews } from "@/lib/data/landing";
import { FarmerAvatar } from "@/components/avatar/farmer-avatar";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "귀농인 인터뷰 — 이랑",
  description:
    "도시를 떠나 농촌에서 새 삶을 시작한 사람들의 생생한 이야기를 만나보세요.",
};

export default function InterviewsPage() {
  return (
    <div className={s.page}>
      {/* Page Header */}
      <header className={s.pageHeader}>
        <span className={s.headerOverline}>
          <Users size={16} aria-hidden="true" />
          Interviews
        </span>
        <h1 className={s.headerTitle}>귀농인 이야기</h1>
        <p className={s.headerDesc}>
          도시를 떠나 농촌에서 새 삶을 시작한 사람들의 생생한 경험담입니다.
          <br />
          나이, 지역, 작물 모두 다르지만 한 가지 공통점 — 후회하지 않는다는 것.
        </p>
        <p className={s.headerCount}>
          총 <strong>{interviews.length}</strong>명의 이야기
        </p>
      </header>

      {/* Interview Grid */}
      <section className={s.grid}>
        {interviews.map((person) => (
          <Link
            key={person.id}
            href={`/interviews/${person.id}`}
            className={s.card}
          >
            {/* 프로필 영역 */}
            <div className={s.cardHeader}>
              <FarmerAvatar
                name={person.name}
                seed={person.id}
                size="md"
              />
              <div className={s.cardProfile}>
                <span className={s.cardName}>{person.name}</span>
                <span className={s.cardAge}>{person.age} · {person.region}</span>
              </div>
            </div>

            {/* 직업 변화 태그 */}
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
            <p className={s.cardQuote}>
              &ldquo;{person.quote}&rdquo;
            </p>

            {/* 작물 + CTA */}
            <div className={s.cardFooter}>
              <span className={s.cardCrop}>{person.crop}</span>
              <span className={s.cardCta}>
                이야기 읽기 <ArrowRight size={13} />
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* 하단 CTA */}
      <div className={s.bottomCta}>
        <p className={s.bottomCtaText}>
          나도 이런 삶을 시작해볼까?
        </p>
        <Link href="/match" className={s.bottomCtaBtn}>
          맞춤 귀농지 찾기 <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
