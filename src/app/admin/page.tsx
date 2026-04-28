/**
 * 어드민 대시보드 — 오버뷰
 *
 * KPI 4종 + 최근 피드백 미리보기 + 최근 검색어
 */

import { fetchAdminKpi, fetchPendingRequestCount } from "@/lib/admin/queries";
import { fetchFeedbackList, fetchTopKeywords } from "@/lib/admin/queries";
import { MessageSquareText, MessageSquarePlus, Search, ClipboardCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import s from "./page.module.css";

export const revalidate = 300; // 5분 ISR

const RATING_EMOJI: Record<string, string> = {
  good: "😊",
  neutral: "😐",
  bad: "😞",
};

export default async function AdminOverviewPage() {
  const [kpi, pendingRequests, recentFeedback, topKeywords] = await Promise.all([
    fetchAdminKpi(),
    fetchPendingRequestCount(),
    fetchFeedbackList(1, 5),
    fetchTopKeywords(7, 10),
  ]);

  const kpiCards = [
    {
      label: "대기 중 요청",
      value: pendingRequests,
      icon: MessageSquarePlus,
      href: "/admin/requests",
      accent: pendingRequests > 0,
    },
    {
      label: "오늘 피드백",
      value: kpi.todayFeedback,
      icon: MessageSquareText,
      href: "/admin/feedback",
    },
    {
      label: "주간 검색",
      value: kpi.weeklySearches,
      icon: Search,
      href: "/admin/search",
    },
    {
      label: "주간 진단",
      value: kpi.weeklyAssessments,
      icon: ClipboardCheck,
      href: "/admin/assessments",
    },
    {
      label: "검색 결과 없음",
      value: kpi.zeroResultCount,
      icon: AlertCircle,
      href: "/admin/search",
      accent: kpi.zeroResultCount > 0,
    },
  ];

  return (
    <div className={s.page}>
      <h1 className={s.heading}>대시보드</h1>

      {/* ── KPI 카드 ── */}
      <div className={s.kpiGrid}>
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className={`${s.kpiCard} ${"accent" in card && card.accent ? s.kpiAccent : ""}`}
            >
              <div className={s.kpiIcon}>
                <Icon size={20} />
              </div>
              <div>
                <p className={s.kpiValue}>{card.value.toLocaleString()}</p>
                <p className={s.kpiLabel}>{card.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className={s.twoCol}>
        {/* ── 최근 피드백 ── */}
        <section className={s.section}>
          <div className={s.sectionHeader}>
            <h2 className={s.sectionTitle}>최근 피드백</h2>
            <Link href="/admin/feedback" className={s.sectionLink}>
              전체 보기
            </Link>
          </div>
          {recentFeedback.data.length === 0 ? (
            <p className={s.empty}>아직 수집된 피드백이 없어요</p>
          ) : (
            <ul className={s.feedbackList}>
              {recentFeedback.data.map((fb) => (
                <li key={fb.id} className={s.feedbackItem}>
                  <span className={s.emoji}>
                    {RATING_EMOJI[fb.rating] ?? "❓"}
                  </span>
                  <div className={s.feedbackBody}>
                    <p className={s.feedbackMessage}>
                      {fb.message || "(메시지 없음)"}
                    </p>
                    <p className={s.feedbackMeta}>
                      {fb.page} · {new Date(fb.created_at).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── 인기 검색어 ── */}
        <section className={s.section}>
          <div className={s.sectionHeader}>
            <h2 className={s.sectionTitle}>인기 검색어 (7일)</h2>
            <Link href="/admin/search" className={s.sectionLink}>
              전체 보기
            </Link>
          </div>
          {topKeywords.length === 0 ? (
            <p className={s.empty}>아직 검색 데이터가 없어요</p>
          ) : (
            <ol className={s.keywordList}>
              {topKeywords.map((kw, i) => (
                <li key={kw.query} className={s.keywordItem}>
                  <span className={s.rank}>{i + 1}</span>
                  <span className={s.keyword}>{kw.query}</span>
                  <span className={s.count}>{kw.count}회</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
