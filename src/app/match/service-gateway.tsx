"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  MapPin,
  ClipboardCheck,
  ArrowRight,
  Clock,
  ListChecks,
  Info,
} from "lucide-react";
import { MatchWizard } from "./match-wizard";
import { AssessmentWizard } from "../assess/assessment-wizard";
import s from "./service-gateway.module.css";

type Mode = "select" | "match" | "assess";

export function ServiceGateway() {
  const searchParams = useSearchParams();

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
        <span className={s.eyebrow}>귀농 서비스</span>
        <h1 className={s.title}>어떤 도움이 필요하신가요?</h1>
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
            <li>나의 귀농 적합도와 부족한 부분을 분석해 드리는 자가진단이에요.</li>
            <li>진단 결과를 바탕으로 맞춤 지역·작물 추천까지 이어져요.</li>
          </ul>
        </div>
      </aside>

      <div className={s.cards}>
        {/* 귀농 적합성 진단 */}
        <button
          type="button"
          className={s.card}
          onClick={() => setMode("assess")}
        >
          <div className={`${s.cardIcon} ${s.cardIconAssess}`}>
            <ClipboardCheck size={28} />
          </div>
          <div className={s.cardBody}>
            <div className={s.cardTitleRow}>
              <h2 className={s.cardTitle}>귀농 적합성 진단</h2>
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
