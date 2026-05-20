/**
 * 어드민 — 진단 결과 분석
 *
 * 유형 분포 + 최근 진단 목록 + 기간 필터 (7/30/90일)
 */

import Link from "next/link";
import { fetchTypeDistribution, fetchAssessmentList } from "@/lib/admin/queries";
import { migrateFarmTypeId } from "@/lib/data/match-questions";
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

/** 구 ID(weekend 등)도 신 ID로 변환 후 컬러·라벨 매핑. */
function getColor(id: string | null | undefined): string {
  if (!id) return "#6b7280";
  return TYPE_COLORS[migrateFarmTypeId(id)] ?? "#6b7280";
}

function getLabel(id: string | null | undefined): string {
  if (!id) return "(미상)";
  return TYPE_LABEL[migrateFarmTypeId(id)] ?? id;
}

const PERIOD_OPTIONS: Array<{ value: string; days: number; label: string }> = [
  { value: "7", days: 7, label: "7일" },
  { value: "30", days: 30, label: "30일" },
  { value: "90", days: 90, label: "3개월" },
];

const DEFAULT_PERIOD = "30";

interface Props {
  searchParams: Promise<{ page?: string; days?: string }>;
}

export default async function AdminAssessmentsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const perPage = 20;

  const selectedPeriod =
    PERIOD_OPTIONS.find((p) => p.value === params.days) ??
    PERIOD_OPTIONS.find((p) => p.value === DEFAULT_PERIOD)!;
  const days = selectedPeriod.days;

  const [distribution, { data: assessments, total }] = await Promise.all([
    fetchTypeDistribution(days),
    fetchAssessmentList(page, perPage, days),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const distTotal = distribution.reduce((sum, d) => sum + d.count, 0);

  function urlWithParams(overrides: { page?: number; days?: string }): string {
    const sp = new URLSearchParams();
    const nextDays = overrides.days ?? selectedPeriod.value;
    if (nextDays !== DEFAULT_PERIOD) sp.set("days", nextDays);
    const nextPage = overrides.page ?? page;
    if (nextPage > 1) sp.set("page", String(nextPage));
    const qs = sp.toString();
    return qs ? `/admin/assessments?${qs}` : "/admin/assessments";
  }

  return (
    <div className={s.page}>
      <h1 className={s.heading}>진단 결과</h1>

      {/* ── 기간 필터 ── */}
      <div className={s.filters}>
        {PERIOD_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={urlWithParams({ days: opt.value, page: 1 })}
            className={`${s.filterPill} ${
              selectedPeriod.value === opt.value ? s.filterActive : ""
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* ── 유형 분포 ── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>유형 분포 ({selectedPeriod.label})</h2>
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
                  title={`${getLabel(d.type)}: ${d.count}건`}
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
              <span className={s.colDate}>일시</span>
              <span className={s.colType}>결과 유형</span>
              <span className={s.colAnswers}>응답 수</span>
            </div>
            {assessments.map((a) => (
              <div key={a.id} className={s.tableRow}>
                <span className={s.colDate}>
                  {new Date(a.created_at).toLocaleString("ko-KR", {
                    timeZone: "Asia/Seoul",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
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
            <Link href={urlWithParams({ page: page - 1 })} className={s.pageLink}>
              이전
            </Link>
          )}
          <span className={s.pageInfo}>
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link href={urlWithParams({ page: page + 1 })} className={s.pageLink}>
              다음
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
