/**
 * 어드민 — 진단 결과 분석
 *
 * 유형 분포 + 최근 진단 목록
 */

import Link from "next/link";
import { fetchTypeDistribution, fetchAssessmentList } from "@/lib/admin/queries";
import s from "./page.module.css";

export const revalidate = 300;

// 유형별 컬러 매핑
const TYPE_COLORS: Record<string, string> = {
  실속형: "#1B6B5A",
  도전형: "#2563eb",
  안정형: "#d97706",
  체험형: "#7c3aed",
  귀촌형: "#059669",
};

function getColor(type: string): string {
  return TYPE_COLORS[type] ?? "#6b7280";
}

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminAssessmentsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const perPage = 20;

  const [distribution, { data: assessments, total }] = await Promise.all([
    fetchTypeDistribution(30),
    fetchAssessmentList(page, perPage),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const distTotal = distribution.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className={s.page}>
      <h1 className={s.heading}>진단 결과</h1>

      {/* ── 유형 분포 ── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>유형 분포 (30일)</h2>
        {distribution.length === 0 ? (
          <p className={s.empty}>진단 데이터가 없어요</p>
        ) : (
          <>
            {/* 수평 비율 바 */}
            <div className={s.distBar}>
              {distribution.map((d) => (
                <div
                  key={d.type}
                  className={s.distSegment}
                  style={{
                    width: `${(d.count / distTotal) * 100}%`,
                    background: getColor(d.type),
                  }}
                  title={`${d.type}: ${d.count}건`}
                />
              ))}
            </div>
            {/* 범례 */}
            <div className={s.legend}>
              {distribution.map((d) => (
                <div key={d.type} className={s.legendItem}>
                  <span
                    className={s.legendDot}
                    style={{ background: getColor(d.type) }}
                  />
                  <span className={s.legendLabel}>{d.type}</span>
                  <span className={s.legendCount}>
                    {d.count}건 ({Math.round((d.count / distTotal) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── 최근 진단 목록 ── */}
      <section className={s.section}>
        <div className={s.sectionHeader}>
          <h2 className={s.sectionTitle}>최근 진단 ({total}건)</h2>
        </div>
        {assessments.length === 0 ? (
          <p className={s.empty}>진단 데이터가 없어요</p>
        ) : (
          <div className={s.table}>
            <div className={s.tableHeader}>
              <span className={s.colDate}>날짜</span>
              <span className={s.colType}>결과 유형</span>
              <span className={s.colAnswers}>응답 수</span>
            </div>
            {assessments.map((a) => (
              <div key={a.id} className={s.tableRow}>
                <span className={s.colDate}>
                  {new Date(a.created_at).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className={s.colType}>
                  <span
                    className={s.typeBadge}
                    style={{
                      background: `color-mix(in srgb, ${getColor(a.result_type)} 12%, transparent)`,
                      color: getColor(a.result_type),
                    }}
                  >
                    {a.result_type}
                  </span>
                </span>
                <span className={s.colAnswers}>
                  {a.answers ? Object.keys(a.answers).length : 0}개
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 페이지네이션 ── */}
      {totalPages > 1 && (
        <div className={s.pagination}>
          {page > 1 && (
            <Link
              href={`/admin/assessments?page=${page - 1}`}
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
              href={`/admin/assessments?page=${page + 1}`}
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
