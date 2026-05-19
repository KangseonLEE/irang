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
  Calculator,
} from "lucide-react";
import { MatchWizard } from "./match-wizard";
import { QuickWizard } from "./quick-wizard";
import { HistoryResult } from "./history-result";
import { AssessmentWizard } from "../assess/assessment-wizard";
import { useAssessmentHistory } from "@/hooks/use-assessment-history";
import type { AssessmentHistoryItem } from "@/hooks/use-assessment-history";
import { FARM_TYPES, migrateFarmTypeId } from "@/lib/data/match-questions";
import { analytics } from "@/lib/analytics";
import { Zap } from "lucide-react";
import s from "./service-gateway.module.css";

type Mode = "select" | "quick" | "match" | "assess" | "history-result";

/** 날짜를 "4월 15일" 형태로 포맷 */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function ServiceGateway() {
  const searchParams = useSearchParams();
  const { history, hasHistory, clearHistory } = useAssessmentHistory();

  // URL 파라미터로 직접 진입 시 바로 해당 모드 진행
  // Phase 2c (2026-05-15): mode=quick 추가
  const modeParam = searchParams.get("mode");
  const initialMode: Mode =
    modeParam === "quick"
      ? "quick"
      : modeParam === "assess"
        ? "assess"
        : modeParam === "match"
          ? "match"
          : searchParams.has("experience") || searchParams.has("lifestyle")
            ? "match"
            : "select";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [viewingItem, setViewingItem] = useState<AssessmentHistoryItem | null>(null);

  // 모드 전환 시 스크롤을 최상단으로 이동
  // (pathname이 /match로 동일하므로 ScrollToTop이 감지하지 못함)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [mode]);

  /** 히스토리 항목 클릭 — localStorage 데이터로 결과 인라인 표시 */
  const handleHistoryClick = (item: AssessmentHistoryItem) => {
    setViewingItem(item);
    setMode("history-result");
  };

  if (mode === "quick") return <QuickWizard onBack={() => setMode("select")} />;
  if (mode === "match") return <MatchWizard onBack={() => setMode("select")} />;
  if (mode === "assess") return <AssessmentWizard onBack={() => setMode("select")} />;
  if (mode === "history-result" && viewingItem) {
    return (
      <HistoryResult
        farmTypeId={viewingItem.farmTypeId}
        regionIds={viewingItem.topRegionIds ?? []}
        cropIds={viewingItem.topCropIds ?? []}
        onBack={() => { setViewingItem(null); setMode("select"); }}
      />
    );
  }

  /* ═══ 서비스 선택 화면 ═══ */
  return (
    <div className={s.page}>
      <div className={s.hero}>
        <span className={s.eyebrow}>나에게 맞는 농촌 정착</span>
        <h1 className={s.title}>내 정착 유형을 찾아보세요</h1>
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
            <li>1분이면 끝나는 빠른 점검부터 14문항 정밀 진단까지 골라서 시작할 수 있어요.</li>
            <li>어디서부터 봐야 할지 막막하다면 빠른 점검으로 윤곽부터 잡아 보세요.</li>
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
              const migratedId = migrateFarmTypeId(item.farmTypeId);
              const ft = FARM_TYPES.find((t) => t.id === migratedId);
              return (
                <button
                  key={item.resultId}
                  type="button"
                  onClick={() => handleHistoryClick(item)}
                  className={s.historyItem}
                >
                  <span className={s.historyEmoji}>{ft?.emoji ?? "🌾"}</span>
                  <div className={s.historyBody}>
                    <div className={s.historyTopRow}>
                      <span className={s.historyLabel}>{ft?.label ?? item.farmTypeLabel}</span>
                      <span className={s.historyDate}>{formatDate(item.savedAt)}</span>
                    </div>
                    <span className={s.historyRegions}>
                      {item.topRegions.join(" · ")}
                    </span>
                  </div>
                  <ChevronRight size={16} className={s.historyArrow} />
                </button>
              );
            })}
          </div>
          <p className={s.historyHint}>
            결과는 현재 브라우저에만 저장돼요. 상단의 전체 삭제로 기록을 지울 수 있어요.
          </p>
        </section>
      )}

      <div className={s.cards}>
        {/* 빠른 점검 (Phase 2c 2026-05-15) */}
        <button
          type="button"
          className={`${s.card} ${s.cardQuick}`}
          onClick={() => {
            analytics.modeSelectClicked("quick");
            setMode("quick");
          }}
        >
          <span className={s.cardHintBubble}>
            어디서부터 시작할지 모르겠다면 여기부터!
          </span>
          <div className={`${s.cardIcon} ${s.cardIconQuick}`}>
            <Zap size={28} />
          </div>
          <div className={s.cardBody}>
            <div className={s.cardTitleRow}>
              <h2 className={s.cardTitle}>빠른 점검</h2>
              <span className={s.badgeQuick}>1분</span>
            </div>
            <p className={s.cardDesc}>
              4문항으로 정착 윤곽을 빠르게 잡고
              지역·작물·지원 사업을 한번에 추천 받아 보세요.
            </p>
            <div className={s.cardMeta}>
              <span className={s.cardMetaItem}>
                <ListChecks size={14} />
                4문항
              </span>
              <span className={s.cardMetaItem}>
                <Clock size={14} />
                약 1분
              </span>
            </div>
          </div>
          <div className={s.cardArrow}>
            <ArrowRight size={20} />
          </div>
        </button>

        {/* 농촌 정착 적합도 진단 */}
        <button
          type="button"
          className={`${s.card} ${s.cardRecommended}`}
          onClick={() => {
            analytics.modeSelectClicked("assess");
            setMode("assess");
          }}
        >
          <div className={`${s.cardIcon} ${s.cardIconAssess}`}>
            <ClipboardCheck size={28} />
          </div>
          <div className={s.cardBody}>
            <div className={s.cardTitleRow}>
              <h2 className={s.cardTitle}>농촌 정착 적합도 진단</h2>
              <span className={s.badge}>정밀</span>
            </div>
            <p className={s.cardDesc}>
              5가지 차원 적합도 진단 + 국가지원 트랙 추천까지,
              나의 정착 준비 상태를 객관적으로 점검해요.
            </p>
            <div className={s.cardMeta}>
              <span className={s.cardMetaItem}>
                <ListChecks size={14} />
                14문항
              </span>
              <span className={s.cardMetaItem}>
                <Clock size={14} />
                약 4분
              </span>
            </div>
          </div>
          <div className={s.cardArrow}>
            <ArrowRight size={20} />
          </div>
        </button>

        {/* 정착 유형 진단 */}
        <button
          type="button"
          className={s.card}
          onClick={() => {
            analytics.modeSelectClicked("match");
            setMode("match");
          }}
        >
          <div className={s.cardIcon}>
            <MapPin size={28} />
          </div>
          <div className={s.cardBody}>
            <h2 className={s.cardTitle}>정착 유형 진단</h2>
            <p className={s.cardDesc}>
              기후, 소득 계획, 생활 환경 등에 답하면
              나에게 맞는 정착 유형과 적합한 지역·작물을 알려드려요.
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
      </div>

      {/* ── 비용 계산 바로가기 ── */}
      <section className={s.costCta}>
        <Link href="/costs#simulator" className={s.costCtaCard}>
          <div className={s.costCtaIcon}>
            <Calculator size={20} />
          </div>
          <div className={s.costCtaBody}>
            <h3 className={s.costCtaTitle}>정착 비용, 얼마나 들까?</h3>
            <p className={s.costCtaDesc}>연령·작물·규모별 예상 비용을 바로 계산해 보세요</p>
          </div>
          <ArrowRight size={16} className={s.costCtaArrow} />
        </Link>
      </section>
    </div>
  );
}
