/**
 * 어드민 — 피드백 목록 + 추천 평가 (B4 단계 E, 2026-05-16 · 표기 정리 2026-10-20)
 *
 * 상단: 진단 결과 추천 카드의 "이 추천 어땠어요?" 응답(quick_feedback.thumbs) — 기간별 · 추천 기준별 · 추천별
 * 하단: 의견 남기기 위젯(rating good/neutral/bad) 목록. 추천 평가·요청(/admin/requests)은 섞지 않는다.
 */

import Link from "@/components/ui/app-link";
import {
  fetchFeedbackList,
  fetchThumbsStats,
  fetchThumbsByPersona,
  fetchTopThumbsRecommendations,
} from "@/lib/admin/queries";
import { PERSONA_INDEX, type PersonaId } from "@/lib/data/personas";
import { describeRecommendation } from "@/lib/admin/recommendation-label";
import s from "./page.module.css";
import { requireAdminPage } from "@/lib/admin/session";

/** admin은 매 요청 fresh fetch가 의도. searchParams 의존이라 revalidate 추가 시 dynamic SSR 충돌 (2026-05-11 lessons). */

/** 평가 표기 — 이모지 대신 한글 라벨 + 색 배지 (9/3 회장 지시: 어드민에서 불필요한 이모지 제거) */
const RATING_LABEL: Record<string, string> = {
  good: "좋아요",
  neutral: "보통",
  bad: "아쉬워요",
};

const FILTER_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "good", label: "좋아요" },
  { value: "neutral", label: "보통" },
  { value: "bad", label: "아쉬워요" },
];

/** 사용자 화면 버튼 문구와 같은 말 (recommendation-thumbs.tsx) */
const UP_LABEL = "도움이 됐어요";
const DOWN_LABEL = "다른 결과 원해요";

/** 추천 기준(페르소나) 이름 — personas.ts SSOT. 기록 없는 행은 "(기록 없음)" */
function personaLabel(persona: string | null | undefined): string {
  if (!persona || persona === "(기타)") return "(기록 없음)";
  return PERSONA_INDEX.get(persona as PersonaId)?.label ?? persona;
}

interface Props {
  searchParams: Promise<{ rating?: string; page?: string }>;
}

export default async function AdminFeedbackPage({ searchParams }: Props) {
  await requireAdminPage(); // 미들웨어와 별개의 2차 인가 — 데이터 조회보다 먼저 (보안 QA 🟡5)
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

      {/* ── B4: 추천 평가 ── */}
      <section className={s.thumbsSection}>
        <div className={s.sectionHeader}>
          <h2 className={s.sectionTitle}>추천 평가</h2>
          {overallRatio !== null && (
            <span className={s.overallRatio}>
              {UP_LABEL} {(overallRatio * 100).toFixed(0)}% · {DOWN_LABEL} {(100 - overallRatio * 100).toFixed(0)}%
            </span>
          )}
        </div>

        <p className={s.sectionDesc}>
          진단 결과 아래 추천 작물·지원사업 카드의 ‘이 추천 어땠어요?’ 버튼 응답이에요.
        </p>
        {thumbsTotalSum === 0 ? (
          <p className={s.empty}>아직 추천 평가가 없어요</p>
        ) : (
          <>
            <div className={s.thumbsGrid}>
              <ThumbsCard label="전체" up={thumbsStats.total.up} down={thumbsStats.total.down} />
              <ThumbsCard label="30일" up={thumbsStats.month.up} down={thumbsStats.month.down} />
              <ThumbsCard label="7일" up={thumbsStats.week.up} down={thumbsStats.week.down} />
            </div>

            {/* 추천 기준별 */}
            {thumbsByPersona.length > 0 && (
              <div className={s.personaBlock}>
                <h3 className={s.subTitle}>추천 기준별 도움 비율</h3>
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
                <h3 className={s.subTitle}>평가가 많은 추천 ({topThumbs.length}개)</h3>
                <ul className={s.topList}>
                  {topThumbs.map((row) => {
                    const rec = describeRecommendation(row.recommendation_id);
                    return (
                      <li key={`${row.recommendation_id}-${row.persona ?? "_"}`} className={s.topItem}>
                        <span className={s.topId}>
                          <span className={s.topKind}>{rec.kind}</span>
                          {rec.href ? (
                            <Link href={rec.href} className={s.topLink}>
                              {rec.name}
                            </Link>
                          ) : (
                            rec.name
                          )}
                        </span>
                        <span className={s.topPersona}>{personaLabel(row.persona)}</span>
                        <span className={s.topThumbsUp}>
                          {UP_LABEL} {row.up}
                        </span>
                        <span className={s.topThumbsDown}>
                          {DOWN_LABEL} {row.down}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── 의견 남기기 (rating) ── */}
      <section className={s.ratingSection}>
        <div className={s.sectionHeader}>
          <h2 className={s.sectionTitle}>의견 ({total}건)</h2>
        </div>

        <p className={s.sectionDesc}>
          화면 구석 ‘의견 남기기’로 받은 평가와 글이에요. 추천 평가와 요청(요청 관리 메뉴)은 여기 없어요.
        </p>
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
          <p className={s.empty}>의견이 없어요</p>
        ) : (
          <div className={s.list}>
            {feedbacks.map((fb) => (
              <div key={fb.id} className={s.card}>
                <div className={s.cardTop}>
                  <span className={`${s.ratingBadge} ${s[`rating_${fb.rating}`] ?? ""}`}>
                    {RATING_LABEL[fb.rating] ?? "평가 없음"}
                  </span>
                  <span className={s.date}>
                    {new Date(fb.created_at).toLocaleString("ko-KR", {
                      timeZone: "Asia/Seoul",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {fb.message ? (
                  <p className={s.message}>{fb.message}</p>
                ) : (
                  <p className={s.messageEmpty}>평가만 남기고 글은 쓰지 않았어요</p>
                )}
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
        <span className={s.thumbsCardUp}>
          {UP_LABEL} {up}
        </span>
        <span className={s.thumbsCardDown}>
          {DOWN_LABEL} {down}
        </span>
      </div>
      <p className={s.thumbsCardRatio}>
        {ratio === null ? "응답 없음" : `도움 비율 ${(ratio * 100).toFixed(0)}% · ${sum}건`}
      </p>
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
      <span className={s.personaName}>{personaLabel(persona)}</span>
      <div
        className={s.personaBar}
        role="img"
        aria-label={`${personaLabel(persona)} 도움 비율 ${upPct.toFixed(0)}%`}
      >
        <span
          className={s.personaBarFill}
          style={{ width: `${upPct}%` }}
        />
      </div>
      <span className={s.personaCounts}>
        {UP_LABEL} {up} · {DOWN_LABEL} {down} <span className={s.personaPct}>({upPct.toFixed(0)}%)</span>
      </span>
      <span className={s.personaSum}>{sum}건</span>
    </li>
  );
}
