/**
 * 어드민 — 피드백 목록 + 추천 thumbs 시각화 (B4 단계 E, 2026-05-16)
 *
 * 상단: thumbs 분포 요약 (전체/7일/30일) + 페르소나별 ratio + 상위 추천
 * 하단: 기존 rating(good/neutral/bad) 메시지 리스트 + 필터 + 페이지네이션
 */

import Link from "next/link";
import {
  fetchFeedbackList,
  fetchThumbsStats,
  fetchThumbsByPersona,
  fetchTopThumbsRecommendations,
} from "@/lib/admin/queries";
import s from "./page.module.css";

/** admin은 매 요청 fresh fetch가 의도. searchParams 의존이라 revalidate 추가 시 dynamic SSR 충돌 (2026-05-11 lessons). */

const RATING_EMOJI: Record<string, string> = {
  good: "😊",
  neutral: "😐",
  bad: "😞",
};

const FILTER_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "good", label: "😊 좋아요" },
  { value: "neutral", label: "😐 보통" },
  { value: "bad", label: "😞 아쉬워요" },
];

const PERSONA_LABEL: Record<string, string> = {
  family: "가족",
  farmYouth: "청년농",
  elderRural: "은퇴 귀촌",
  commuter: "겸업",
  balanced: "균형",
  "(기타)": "(기타)",
};

interface Props {
  searchParams: Promise<{ rating?: string; page?: string }>;
}

export default async function AdminFeedbackPage({ searchParams }: Props) {
  const params = await searchParams;
  const rating = params.rating ?? "all";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const perPage = 20;

  const [feedbackPage, thumbsStats, thumbsByPersona, topThumbs] = await Promise.all([
    fetchFeedbackList(page, perPage, rating),
    fetchThumbsStats(),
    fetchThumbsByPersona(),
    fetchTopThumbsRecommendations(15),
  ]);

  const { data: feedbacks, total } = feedbackPage;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const thumbsTotalUp = thumbsStats.total.up;
  const thumbsTotalDown = thumbsStats.total.down;
  const thumbsTotalSum = thumbsTotalUp + thumbsTotalDown;
  const overallRatio = thumbsTotalSum === 0 ? null : thumbsTotalUp / thumbsTotalSum;

  return (
    <div className={s.page}>
      <h1 className={s.heading}>피드백</h1>

      {/* ── B4: 추천 thumbs 분포 ── */}
      <section className={s.thumbsSection}>
        <div className={s.sectionHeader}>
          <h2 className={s.sectionTitle}>추천 thumbs 분포</h2>
          {overallRatio !== null && (
            <span className={s.overallRatio}>
              👍 {(overallRatio * 100).toFixed(0)}% / 👎 {(100 - overallRatio * 100).toFixed(0)}%
            </span>
          )}
        </div>

        {thumbsTotalSum === 0 ? (
          <p className={s.empty}>아직 thumbs 응답이 없어요</p>
        ) : (
          <>
            <div className={s.thumbsGrid}>
              <ThumbsCard label="전체" up={thumbsStats.total.up} down={thumbsStats.total.down} />
              <ThumbsCard label="30일" up={thumbsStats.month.up} down={thumbsStats.month.down} />
              <ThumbsCard label="7일" up={thumbsStats.week.up} down={thumbsStats.week.down} />
            </div>

            {/* 페르소나별 ratio */}
            {thumbsByPersona.length > 0 && (
              <div className={s.personaBlock}>
                <h3 className={s.subTitle}>페르소나별 ratio</h3>
                <ul className={s.personaList}>
                  {thumbsByPersona.map((p) => (
                    <PersonaRow key={p.persona} {...p} />
                  ))}
                </ul>
              </div>
            )}

            {/* 상위 추천 */}
            {topThumbs.length > 0 && (
              <div className={s.topBlock}>
                <h3 className={s.subTitle}>상위 응답 추천 (top {topThumbs.length})</h3>
                <ul className={s.topList}>
                  {topThumbs.map((row) => (
                    <li key={`${row.recommendation_id}-${row.persona ?? "_"}`} className={s.topItem}>
                      <span className={s.topId}>{row.recommendation_id}</span>
                      <span className={s.topPersona}>
                        {row.persona ? PERSONA_LABEL[row.persona] ?? row.persona : "—"}
                      </span>
                      <span className={s.topThumbsUp}>👍 {row.up}</span>
                      <span className={s.topThumbsDown}>👎 {row.down}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── 기존 rating 피드백 ── */}
      <section className={s.ratingSection}>
        <div className={s.sectionHeader}>
          <h2 className={s.sectionTitle}>메시지 피드백 ({total}건)</h2>
        </div>

        <div className={s.filters}>
          {FILTER_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={`/admin/feedback?rating=${opt.value}`}
              className={`${s.filterPill} ${rating === opt.value ? s.filterActive : ""}`}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        {feedbacks.length === 0 ? (
          <p className={s.empty}>피드백이 없어요</p>
        ) : (
          <div className={s.list}>
            {feedbacks.map((fb) => (
              <div key={fb.id} className={s.card}>
                <div className={s.cardTop}>
                  <span className={s.emoji}>
                    {RATING_EMOJI[fb.rating] ?? "❓"}
                  </span>
                  <span className={s.ratingLabel}>{fb.rating}</span>
                  <span className={s.date}>
                    {new Date(fb.created_at).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className={s.message}>{fb.message || "(메시지 없음)"}</p>
                <p className={s.pagePath}>{fb.page}</p>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className={s.pagination}>
            {page > 1 && (
              <Link
                href={`/admin/feedback?rating=${rating}&page=${page - 1}`}
                className={s.pageLink}
              >
                이전
              </Link>
            )}
            <span className={s.pageInfo}>
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/admin/feedback?rating=${rating}&page=${page + 1}`}
                className={s.pageLink}
              >
                다음
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

// ── 내부 컴포넌트 ──

function ThumbsCard({ label, up, down }: { label: string; up: number; down: number }) {
  const sum = up + down;
  const ratio = sum === 0 ? null : up / sum;
  return (
    <div className={s.thumbsCard}>
      <p className={s.thumbsCardLabel}>{label}</p>
      <div className={s.thumbsCardRow}>
        <span className={s.thumbsCardUp}>👍 {up}</span>
        <span className={s.thumbsCardDown}>👎 {down}</span>
      </div>
      {ratio !== null && (
        <p className={s.thumbsCardRatio}>긍정 {(ratio * 100).toFixed(0)}%</p>
      )}
    </div>
  );
}

function PersonaRow({
  persona,
  up,
  down,
  ratio,
}: {
  persona: string;
  up: number;
  down: number;
  ratio: number | null;
}) {
  const sum = up + down;
  const upPct = ratio === null ? 0 : ratio * 100;
  return (
    <li className={s.personaRow}>
      <span className={s.personaName}>{PERSONA_LABEL[persona] ?? persona}</span>
      <div
        className={s.personaBar}
        aria-label={`${persona} 긍정 ${upPct.toFixed(0)}%`}
      >
        <span
          className={s.personaBarFill}
          style={{ width: `${upPct}%` }}
        />
      </div>
      <span className={s.personaCounts}>
        👍 {up} / 👎 {down} <span className={s.personaPct}>({upPct.toFixed(0)}%)</span>
      </span>
      <span className={s.personaSum}>n={sum}</span>
    </li>
  );
}
