import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, Users } from "lucide-react";
import { FarmerAvatar } from "@/components/avatar/farmer-avatar";
import {
  getContextInterviews,
  type InterviewContext,
  type InterviewSummary,
} from "@/lib/data/interview-summary";
import s from "./interview-context-section.module.css";

/* ==========================================================================
   InterviewContextSection — 작물·지역 상세의 "정착한 사람" (2026-10-05 회장 결재 B안)

   랜딩 인터뷰 띠(도달 12명·클릭 0명)를 한 줄로 줄이고, 이야기를 맥락이 맞는 화면에 붙인다.
   이 작물로·이 지역에 정착한 사람의 인용구 — 최근 기사 순 최대 3명, 더 있으면 목록(/interviews)으로.
   0명이면 아무것도 그리지 않는다.

   - 링크 규칙은 lib `toInterviewSummary` 한 곳(본문 동의자 → /interviews/{id}, 나머지 → 원문 기사 새 창).
   - 계측: 원문 기사 이동은 전역 OutboundClickTracker(external_click, page_location 으로 지면 구분),
     내부 이동은 PageViewTracker 가 이미 잡는다 — 새 GA 이벤트 없음.
   - Server Component. 인용구는 짧은 본인 발언이라 AutoGlossary 미적용.
   ========================================================================== */

/** 페이지당 섹션 1개 — 고정 id 로 충분하다(CommunityNotes 와 같은 방식) */
const NEW_TAB_HINT_ID = "interview-context-new-tab";

const TITLE: Record<InterviewContext["kind"], string> = {
  crop: "이 작물로 정착한 사람",
  sido: "이 지역에 정착한 사람",
  sigungu: "이 지역에 정착한 사람",
};

interface InterviewContextSectionProps {
  context: InterviewContext;
}

export function InterviewContextSection({ context }: InterviewContextSectionProps) {
  const { items, total } = getContextInterviews(context);
  if (items.length === 0) return null;

  const hasMore = total > items.length;
  // 시·군·구 상세에선 모두 같은 지역이라 지역명을 빼고, 작물·시·도 상세에선 어디인지가 정보다
  const showRegion = context.kind !== "sigungu";

  return (
    <section
      className={s.section}
      aria-labelledby="interview-context-heading"
      data-interview-context={context.kind}
    >
      <div className={s.header}>
        <h2 id="interview-context-heading" className={s.title}>
          <Users size={18} aria-hidden="true" className={s.titleIcon} />
          {TITLE[context.kind]}
        </h2>
        <p className={s.subtitle}>
          {hasMore
            ? `언론에 소개된 ${total}명 중 최근 ${items.length}명이에요`
            : "언론에 소개된 정착 이야기예요"}
        </p>
      </div>

      <ul className={s.list}>
        {items.map((person) => (
          <li key={person.id}>
            <InterviewContextCard person={person} showRegion={showRegion} />
          </li>
        ))}
      </ul>
      {/* 원문 기사 카드의 보조 설명 — hidden 이어도 aria-describedby 로 직접 참조하면 읽힌다(srOnly CSS 불필요) */}
      {items.some((p) => p.external) && (
        <span id={NEW_TAB_HINT_ID} hidden>
          원문 기사가 새 창에서 열려요
        </span>
      )}

      {hasMore && (
        <Link href="/interviews" className={s.more}>
          인터뷰 모두 보기
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </section>
  );
}

function InterviewContextCard({
  person: p,
  showRegion,
}: {
  person: InterviewSummary;
  showRegion: boolean;
}) {
  const meta = [p.age, showRegion ? p.region : null].filter(Boolean).join(" · ");

  const content = (
    <>
      {/* 일러스트는 장식 — 이름·인용구가 옆 텍스트에 다 있다 */}
      <div className={s.thumb} aria-hidden="true">
        {p.image ? (
          <Image src={p.image} alt="" width={56} height={56} className={s.thumbImage} />
        ) : (
          <FarmerAvatar name={p.name} seed={p.id} size="md" />
        )}
      </div>
      <span className={s.head}>
        <span className={s.nameRow}>
          <span className={s.name}>{p.name}</span>
          {meta && <span className={s.meta}>{meta}</span>}
        </span>
        <span className={s.job}>
          {p.prevJob} → {p.currentJob}
        </span>
      </span>
      <span className={s.quote}>&ldquo;{p.quote}&rdquo;</span>
      <span className={s.source}>
        <span>
          {p.sourceName} · {p.sourceDate}
        </span>
        <span className={s.cue}>
          {p.external ? "원문 기사" : "이야기 읽기"}
          {p.external ? (
            <ExternalLink size={14} aria-hidden="true" />
          ) : (
            <ArrowRight size={14} aria-hidden="true" />
          )}
        </span>
      </span>
    </>
  );

  return p.external ? (
    <a
      href={p.href}
      target="_blank"
      rel="noopener" referrerPolicy="origin"
      className={s.card}
      aria-describedby={NEW_TAB_HINT_ID}
    >
      {content}
    </a>
  ) : (
    <Link href={p.href} className={s.card}>
      {content}
    </Link>
  );
}
