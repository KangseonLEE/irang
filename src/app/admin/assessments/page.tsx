/**
 * 어드민 — 진단 결과 분석
 *
 * 유형 분포 + 최근 진단 목록
 */

import Link from "next/link";
import { fetchTypeDistribution, fetchAssessmentList } from "@/lib/admin/queries";
import s from "./page.module.css";

/** admin은 매 요청 fresh fetch가 의도. searchParams 의존이라 revalidate 추가 시 dynamic SSR 충돌 (2026-05-11 lessons). */

// farm_type_id별 컬러 + 라벨 매핑 (src/lib/data/match-questions.ts FARM_TYPES 동기화)
const TYPE_COLORS: Record<string, string> = {
  guinong: "#1B6B5A",
  guichon: "#2563eb",
  guisanchon: "#7c3aed",
  smartfarm: "#d97706",
  cheongnyeon: "#059669",
};

const TYPE_LABEL: Record<string, string> = {
  guinong: "귀농형",
  guichon: "귀촌형",
  guisanchon: "귀산촌형",
  smartfarm: "스마트팜형",
  cheongnyeon: "청년농형",
};

function getColor(id: string | null | undefined): string {
  return id ? TYPE_COLORS[id] ?? "#6b7280" : "#6b7280";
}

function getLabel(id: string | null | undefined): string {
  if (!id) return "(미상)";
  return TYPE_LABEL[id] ?? id;
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
                  <span className={s.legendLabel}>{getLabel(d.type)}</span>
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
                      background: `color-mix(in srgb, ${getColor(a.farm_type_id)} 12%, transparent)`,
                      color: getColor(a.farm_type_id),
                    }}
                  >
                    {getLabel(a.farm_type_id)}
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
