import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { FarmerAvatar } from "@/components/avatar/farmer-avatar";
import { getTypeInterviews, type InterviewSummary } from "@/lib/data/interview-summary";
import { INTERVIEW_CATEGORY_LABEL, TREND_BENTO_PROFILES, type TrendTypeId } from "@/lib/data/landing";
import {
  SETTLEMENT_SCENE_IMAGE,
  SETTLEMENT_SCENE_QUALITY,
  SETTLEMENT_SCENE_SIZES,
} from "@/lib/data/settlement-scenes";
import { withJosa } from "@/lib/format";
import s from "./type-interview-band.module.css";

/* ==========================================================================
   TypeInterviewBand — 트렌드·비용 섹션 가운데 "○○으로 정착한 사람" 띠 (2026-10-05 회장)

   회장: "유형 탭을 고르면 데이터가 바뀌는데, 트렌드와 비용 사이에 그 유형 인터뷰만 걸러서 — 지역처럼 배경에 그림을"
   → 랜딩 '내 지역 찾기' 띠(app/page.module.css .mapSection)와 같은 문법: 전폭 수채화 + 어두운 스크림 + 흰 글씨.
     배경은 유형 그림(lib/data/settlement-scenes) — 히어로와 같은 그림·같은 크기 규칙이라 캐시를 같이 쓴다.
   같은 날 앞서 만든 랜딩 하단 한 줄 띠(전체 19명 진입점)는 이 띠로 대체했다 — 유형과 무관한 진입점보다
   지금 보고 있는 유형의 사람이 숫자(트렌드)와 돈(비용) 사이에 있는 게 맥락이 맞다.

   - 사람 선택: lib `getTypeInterviews`(대표 분류만 · 최근 기사 순 3명). 링크 규칙: `toInterviewSummary`
     (본문 동의자 → /interviews/{id}, 나머지 → 원문 기사 새 창).
   - 서버가 유형 5개를 다 그려 TrendCostSection(클라이언트)에 넘기고, 섹션은 고른 탭 것 하나만 마운트한다
     → HTML·배경 그림 요청은 늘 한 장.
   - 계측: 노출은 섹션 쪽 ScrollReveal trackId="interviews"(탭을 바꿔도 다시 찍히지 않음), 클릭은 data-track
     interviews:view_all · interviews:story(LandingClickTracker), 원문 기사 이동은 전역 external_click.
   - 인용구는 짧은 본인 발언이라 AutoGlossary 미적용(상세 "정착한 사람" 카드와 같은 기준).
   ========================================================================== */

export function TypeInterviewBand({ type }: { type: TrendTypeId }) {
  const { items } = getTypeInterviews(type);
  if (items.length === 0) return null;

  const label = INTERVIEW_CATEGORY_LABEL[type];
  /** "귀농" → "으로", "시골" → "로" — 유형 이름만 강조하고 조사는 em 밖에 둔다 */
  const josa = withJosa(label, "으로").slice(label.length);
  const featured = items[0];
  const headingId = `type-interviews-${type}`;
  const newTabHintId = `type-interviews-new-tab-${type}`;

  return (
    <section className={s.band} aria-labelledby={headingId} data-type-interviews={type}>
      {/* 배경 그림은 장식 — 글자는 스크림 위 흰색이라 그림이 늦게 와도 읽힌다 */}
      <Image
        src={SETTLEMENT_SCENE_IMAGE[type]}
        alt=""
        fill
        sizes={SETTLEMENT_SCENE_SIZES}
        quality={SETTLEMENT_SCENE_QUALITY}
        loading="lazy"
        className={s.bg}
      />
      <span className={s.scrim} aria-hidden="true" />

      <div className={s.inner}>
        <div className={s.text}>
          <span className={s.eyebrow}>#먼저 떠난 사람</span>
          <h3 id={headingId} className={s.title}>
            <em>{label}</em>
            {josa} 정착한 사람
          </h3>
          {/* 가장 최근 기사의 한마디 — 출처(언론사·시점)를 같이 단다 */}
          <figure className={s.quote}>
            <blockquote className={s.quoteText}>
              <p>&ldquo;{featured.quote}&rdquo;</p>
            </blockquote>
            <figcaption className={s.quoteCite}>
              {featured.name} 님 · {featured.sourceName} {featured.sourceDate}
            </figcaption>
          </figure>
        </div>

        <div className={s.people}>
          <ul className={s.list}>
            {items.map((person) => (
              <li key={person.id}>
                <PersonLink person={person} newTabHintId={newTabHintId} />
              </li>
            ))}
          </ul>
          {/* 원문 기사 링크의 보조 설명 — hidden 이어도 aria-describedby 로 직접 참조하면 읽힌다 */}
          {items.some((p) => p.external) && (
            <span id={newTabHintId} hidden>
              원문 기사가 새 창에서 열려요
            </span>
          )}
          {/* 목록(/interviews?type=)은 보조 태그까지 넣어 사람이 더 많다 — 그래서 띠엔 인원 수를 적지 않는다 */}
          <Link href={`/interviews?type=${type}`} className={s.more} data-track="interviews:view_all">
            {label} 이야기 모두 보기
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function PersonLink({ person: p, newTabHintId }: { person: InterviewSummary; newTabHintId: string }) {
  const meta = [p.age, p.region].filter(Boolean).join(" · ");

  const content = (
    <>
      {/* 일러스트는 장식 — 이름·지역·하는 일이 옆 글자에 다 있다 */}
      <span className={s.avatar} aria-hidden="true">
        {p.image ? (
          <Image src={p.image} alt="" width={44} height={44} className={s.avatarImage} />
        ) : (
          <FarmerAvatar name={p.name} seed={p.id} size="sm" />
        )}
      </span>
      <span className={s.personText}>
        <span className={s.personHead}>
          <span className={s.personName}>{p.name}</span>
          {meta && <span className={s.personMeta}>{meta}</span>}
        </span>
        <span className={s.personJob}>{p.currentJob}</span>
      </span>
      <span className={s.cue} aria-hidden="true">
        {p.external ? <ExternalLink size={16} /> : <ArrowRight size={16} />}
      </span>
    </>
  );

  return p.external ? (
    <a
      href={p.href}
      target="_blank"
      rel="noopener" referrerPolicy="origin"
      className={s.person}
      aria-describedby={newTabHintId}
      data-track="interviews:story"
    >
      {content}
    </a>
  ) : (
    <Link href={p.href} className={s.person} data-track="interviews:story">
      {content}
    </Link>
  );
}

/**
 * TrendCostSection 에 넘길 유형별 띠 — 유형 목록은 트렌드 탭(TREND_BENTO_PROFILES)과 같은 5종.
 * 서버에서 그린 요소를 넘기므로 인터뷰 데이터가 클라이언트 번들에 실리지 않는다.
 */
export function buildTypeInterviewBands(): Partial<Record<TrendTypeId, React.ReactNode>> {
  return Object.fromEntries(
    (Object.keys(TREND_BENTO_PROFILES) as TrendTypeId[]).map((type) => [
      type,
      <TypeInterviewBand key={type} type={type} />,
    ]),
  );
}
