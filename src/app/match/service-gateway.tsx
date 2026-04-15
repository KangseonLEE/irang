"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  ClipboardCheck,
  ArrowRight,
  ChevronRight,
  Clock,
  ListChecks,
  Info,
  History,
  Trash2,
} from "lucide-react";
import { MatchWizard } from "./match-wizard";
import { AssessmentWizard } from "../assess/assessment-wizard";
import { useAssessmentHistory } from "@/hooks/use-assessment-history";
import { FARM_TYPES } from "@/lib/data/match-questions";
import s from "./service-gateway.module.css";

type Mode = "select" | "match" | "assess";

/** 날짜를 "4월 15일" 형태로 포맷 */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function ServiceGateway() {
  const searchParams = useSearchParams();
  const { history, hasHistory, clearHistory } = useAssessmentHistory();

  // URL 파라미터로 직접 진입 시 바로 해당 모드 진행
  const initialMode: Mode = searchParams.get("mode") === "assess"
    ? "assess"
    : searchParams.has("experience") || searchParams.has("lifestyle")
      ? "match"
      : "select";

  const [mode, setMode] = useState<Mode>(initialMode);

  // 모드 전환 시 스크롤을 최상단으로 이동
  // (pathname이 /match로 동일하므로 ScrollToTop이 감지하지 못함)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [mode]);

  if (mode === "match") return <MatchWizard onBack={() => setMode("select")} />;
  if (mode === "assess") return <AssessmentWizard onBack={() => setMode("select")} />;

  /* ═══ 서비스 선택 화면 ═══ */
  return (
    <div className={s.page}>
      <div className={s.hero}>
        <span className={s.eyebrow}>나에게 맞는 귀농</span>
        <h1 className={s.title}>나에게 맞는 귀농을 찾아보세요</h1>
        <p className={s.desc}>
          목적에 맞는 서비스를 선택하세요.
        </p>
      </div>

      {/* ── 안내 배너 ── */}
      <aside className={s.infoBanner} aria-label="서비스 안내">
        <div className={s.infoBannerIcon}>
          <Info size={20} aria-hidden="true" />
        </div>
        <div className={s.infoBannerBody}>
          <ul className={s.infoBannerList}>
            <li>나의 귀농 적합도와 부족한 부분을 분석해 드리는 준비도 진단이에요.</li>
            <li>진단 결과를 바탕으로 맞춤 지역·작물 추천까지 이어져요.</li>
          </ul>
        </div>
      </aside>

      {/* ── 이전 진단 결과 ── */}
      {hasHistory && (
        <section className={s.historySection}>
          <div className={s.historyHeader}>
            <h2 className={s.historyTitle}>
              <History size={16} />
              이전 진단 결과
            </h2>
            <button
              type="button"
              onClick={clearHistory}
              className={s.historyClear}
            >
              <Trash2 size={13} />
              전체 삭제
            </button>
          </div>
          <div className={s.historyList}>
            {history.map((item) => {
              const ft = FARM_TYPES.find((t) => t.id === item.farmTypeId);
              return (
                <Link
                  key={item.resultId}
                  href={`/assess/result/${item.resultId}`}
                  className={s.historyItem}
                >
                  <span className={s.historyEmoji}>{ft?.emoji ?? "🌾"}</span>
                  <div className={s.historyBody}>
                    <div className={s.historyTopRow}>
                      <span className={s.historyLabel}>{item.farmTypeLabel}</span>
                      <span className={s.historyDate}>{formatDate(item.savedAt)}</span>
                    </div>
                    <span className={s.historyRegions}>
                      {item.topRegions.join(" · ")}
                    </span>
                  </div>
                  <ChevronRight size={16} className={s.historyArrow} />
                </Link>
              );
            })}
          </div>
          <p className={s.historyHint}>
            결과는 현재 브라우저에만 저장됩니다. 상단의 전체 삭제로 기록을 지울 수 있어요.
          </p>
        </section>
      )}

      <div className={s.cards}>
        {/* 귀농 준비도 진단 */}
        <button
          type="button"
          className={`${s.card} ${s.cardRecommended}`}
          onClick={() => setMode("assess")}
        >
          <div className={`${s.cardIcon} ${s.cardIconAssess}`}>
            <ClipboardCheck size={28} />
          </div>
          <div className={s.cardBody}>
            <div className={s.cardTitleRow}>
              <h2 className={s.cardTitle}>귀농 준비도 진단</h2>
              <span className={s.badge}>추천</span>
            </div>
            <p className={s.cardDesc}>
              동기, 재정, 가족, 경험, 적응력 — 5가지 차원으로
              나의 귀농 준비 상태를 객관적으로 점검해요.
            </p>
            <p className={s.cardHint}>
              어디서부터 시작할지 모르겠다면 이 진단을 먼저 해보세요.
            </p>
            <div className={s.cardMeta}>
              <span className={s.cardMetaItem}>
                <ListChecks size={14} />
                10문항
              </span>
              <span className={s.cardMetaItem}>
                <Clock size={14} />
                약 3분
              </span>
            </div>
          </div>
          <div className={s.cardArrow}>
            <ArrowRight size={20} />
          </div>
        </button>

        {/* 맞춤 지역·작물 추천 */}
        <button
          type="button"
          className={s.card}
          onClick={() => setMode("match")}
        >
          <div className={s.cardIcon}>
            <MapPin size={28} />
          </div>
          <div className={s.cardBody}>
            <h2 className={s.cardTitle}>맞춤 지역·작물 추천</h2>
            <p className={s.cardDesc}>
              기후, 생활환경, 관심 작물 등 5가지 질문에 답하면
              나에게 딱 맞는 귀농 지역과 작물을 추천해 드립니다.
            </p>
            <div className={s.cardMeta}>
              <span className={s.cardMetaItem}>
                <ListChecks size={14} />
                5문항
              </span>
              <span className={s.cardMetaItem}>
                <Clock size={14} />
                약 2분
              </span>
            </div>
          </div>
          <div className={s.cardArrow}>
            <ArrowRight size={20} />
          </div>
        </button>
      </div>
    </div>
  );
}
