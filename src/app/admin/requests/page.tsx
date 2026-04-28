/**
 * 어드민 — 요청 관리
 *
 * 사용자가 RequestModal로 보낸 정보 추가 요청을 관리.
 * 상태 필터 + 카테고리 필터 + 키워드 빈도 + 상태 변경
 */

import Link from "next/link";
import { fetchRequestList, fetchRequestKeywords } from "@/lib/admin/queries";
import { StatusToggle } from "./status-toggle";
import s from "./page.module.css";

export const revalidate = 60;

const STATUS_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "pending", label: "⏳ 대기" },
  { value: "done", label: "✅ 완료" },
  { value: "rejected", label: "❌ 반려" },
];

const CATEGORY_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "정보", label: "정보" },
  { value: "작물", label: "작물" },
  { value: "지원사업", label: "지원사업" },
  { value: "의견", label: "의견" },
];

interface Props {
  searchParams: Promise<{
    status?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function AdminRequestsPage({ searchParams }: Props) {
  const params = await searchParams;
  const statusFilter = params.status ?? "all";
  const categoryFilter = params.category ?? "all";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const perPage = 20;

  const [{ data: requests, total }, keywords] = await Promise.all([
    fetchRequestList(page, perPage, statusFilter, categoryFilter),
    fetchRequestKeywords(10),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams({
      status: statusFilter,
      category: categoryFilter,
      page: "1",
      ...overrides,
    });
    return `/admin/requests?${p.toString()}`;
  }

  return (
    <div className={s.page}>
      <h1 className={s.heading}>요청 관리</h1>

      {/* ── 키워드 빈도 ── */}
      {keywords.length > 0 && (
        <div className={s.keywordsSection}>
          <h2 className={s.subheading}>많이 요청된 키워드</h2>
          <div className={s.keywordTags}>
            {keywords.map((kw) => (
              <span key={kw.keyword} className={s.keywordTag}>
                {kw.keyword}
                <span className={s.keywordCount}>{kw.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── 상태 필터 ── */}
      <div className={s.filters}>
        <div className={s.filterGroup}>
          {STATUS_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={buildUrl({ status: opt.value })}
              className={`${s.filterPill} ${statusFilter === opt.value ? s.filterActive : ""}`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
        <div className={s.filterGroup}>
          {CATEGORY_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={buildUrl({ category: opt.value })}
              className={`${s.filterPill} ${s.filterPillCategory} ${categoryFilter === opt.value ? s.filterActiveCategory : ""}`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
        <span className={s.totalCount}>총 {total}건</span>
      </div>

      {/* ── 리스트 ── */}
      {requests.length === 0 ? (
        <p className={s.empty}>요청이 없어요</p>
      ) : (
        <div className={s.list}>
          {requests.map((req) => {
            // 메시지에서 접두사 제거하여 본문만 표시
            const bodyMessage = req.message
              .replace(/^\[.+?\]\s*/, "")
              .trim();

            return (
              <div key={req.id} className={s.card}>
                <div className={s.cardTop}>
                  <span className={s.categoryBadge}>{req.category}</span>
                  {req.keyword && (
                    <span className={s.keywordBadge}>{req.keyword}</span>
                  )}
                  <span className={s.date}>
                    {new Date(req.created_at).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {bodyMessage && (
                  <p className={s.message}>{bodyMessage}</p>
                )}

                <div className={s.cardBottom}>
                  <span className={s.pagePath}>{req.page}</span>
                  <StatusToggle id={req.id} currentStatus={req.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 페이지네이션 ── */}
      {totalPages > 1 && (
        <div className={s.pagination}>
          {page > 1 && (
            <Link
              href={buildUrl({ page: String(page - 1) })}
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
              href={buildUrl({ page: String(page + 1) })}
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
