/**
 * 어드민 — 피드백 목록
 *
 * 이모지별 필터 + 페이지네이션 + 카드 리스트
 */

import Link from "next/link";
import { fetchFeedbackList } from "@/lib/admin/queries";
import s from "./page.module.css";

export const revalidate = 120;

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

interface Props {
  searchParams: Promise<{ rating?: string; page?: string }>;
}

export default async function AdminFeedbackPage({ searchParams }: Props) {
  const params = await searchParams;
  const rating = params.rating ?? "all";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const perPage = 20;

  const { data: feedbacks, total } = await fetchFeedbackList(
    page,
    perPage,
    rating,
  );
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className={s.page}>
      <h1 className={s.heading}>피드백</h1>

      {/* ── 필터 ── */}
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
        <span className={s.totalCount}>총 {total}건</span>
      </div>

      {/* ── 리스트 ── */}
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

      {/* ── 페이지네이션 ── */}
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
    </div>
  );
}
