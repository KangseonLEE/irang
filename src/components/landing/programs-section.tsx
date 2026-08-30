"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Clock, CalendarRange } from "lucide-react";
import { Icon as IconWrap } from "@/components/ui/icon";
import { useDragScroll } from "@/lib/hooks/use-drag-scroll";
import type { SupportProgram } from "@/lib/data/programs";
import { ALWAYS_OPEN, type ProgramStatus } from "@/lib/program-status";
import { formatAgeRange } from "@/lib/format";
import { analytics } from "@/lib/analytics";
import s from "./programs-section.module.css";

type Tab = "active" | "deadline" | "ongoing";

type ActiveProgram = SupportProgram & { programStatus: ProgramStatus };

interface Props {
  activePrograms: ActiveProgram[];
  deadlinePrograms: (SupportProgram & { daysLeft: number })[];
  /** 상시·연중 모집 (마감 없음 또는 접수 150일 이상) — 8/30 탭 분리 */
  ongoingPrograms: ActiveProgram[];
}

/** 카드 하단 "신청 …" 표기 — 상시 건은 날짜 대신 상시 문구 (9999-12-31이 "12.31"로 새는 것 방지) */
function periodLabel(start: string, end: string): string {
  const mmdd = (d: string) => d.slice(5).replace("-", ".");
  // 예산 소진형(공주·청도)과 연중 서비스형(귀농닥터·살아보기)이 섞여 있어 마감 사유는 붙이지 않는다 — 각 카드 summary가 설명
  if (end === ALWAYS_OPEN) return `${mmdd(start)}부터 상시 모집`;
  return `${mmdd(start)} ~ ${mmdd(end)}`;
}

export function ProgramsSection({ activePrograms, deadlinePrograms, ongoingPrograms }: Props) {
  const [tab, setTab] = useState<Tab>("active");
  const [animating, setAnimating] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasDeadline = deadlinePrograms.length > 0;
  const hasOngoing = ongoingPrograms.length > 0;
  const programs = tab === "active" ? activePrograms : tab === "deadline" ? deadlinePrograms : ongoingPrograms;
  const needsCarousel = programs.length > 3;

  useDragScroll(scrollRef);

  /* ── 좌/우 스크롤 가능 여부 추적 (화살표·gradient 표시용) ── */
  const updateEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 2);
    setCanNext(maxScroll > 2 && el.scrollLeft < maxScroll - 2);
  }, []);

  useEffect(() => {
    if (!needsCarousel) return;
    const el = scrollRef.current;
    if (!el) return;
    updateEdges();
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [needsCarousel, updateEdges, tab]);

  const scrollByCard = useCallback((dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[0] as HTMLElement | undefined;
    if (!card) return;
    const step = card.offsetWidth + 12; // gap
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  if (activePrograms.length === 0 && deadlinePrograms.length === 0 && ongoingPrograms.length === 0) return null;

  const switchTab = (next: Tab) => {
    if (next === tab) return;
    analytics.programsTabSwitch(next);
    setAnimating(true);
    requestAnimationFrame(() => {
      setTimeout(() => {
        setTab(next);
        setAnimating(false);
        scrollRef.current?.scrollTo({ left: 0 });
      }, 150);
    });
  };

  const carouselCls = [
    s.carousel,
    needsCarousel ? s.carouselScroll : "",
    animating ? s.carouselFadeOut : s.carouselFadeIn,
  ].filter(Boolean).join(" ");

  const wrapperCls = [
    s.carouselWrapper,
    canPrev ? s.fadeLeft : "",
    canNext ? s.fadeRight : "",
  ].filter(Boolean).join(" ");

  return (
    <section className={s.section} aria-label="지원사업">
      <div className={s.header}>
        <div className={s.heading}>
          <span className={s.eyebrow}>#지원사업</span>
          <h2 className={s.title}>
            지금 신청할 수 있는 <em>지원사업</em>
          </h2>
        </div>
        <Link href="/programs" className={s.viewAll} data-track="programs:view_all">
          전체 보기 <IconWrap icon={ArrowRight} size="sm" />
        </Link>
      </div>

      {/* 탭 */}
      <div className={s.tabs} role="tablist">
        <button
          role="tab"
          aria-selected={tab === "active"}
          className={`${s.tab} ${tab === "active" ? s.tabActive : ""}`}
          onClick={() => switchTab("active")}
        >
          진행·예정
        </button>
        <button
          role="tab"
          aria-selected={tab === "deadline"}
          className={`${s.tab} ${tab === "deadline" ? s.tabActive : ""}`}
          onClick={() => switchTab("deadline")}
        >
          <Clock size={13} className={s.tabIcon} />
          마감 임박
          {hasDeadline && <span className={s.tabCount}>{deadlinePrograms.length}</span>}
        </button>
        <button
          role="tab"
          aria-selected={tab === "ongoing"}
          className={`${s.tab} ${tab === "ongoing" ? s.tabActive : ""}`}
          onClick={() => switchTab("ongoing")}
        >
          <CalendarRange size={13} className={s.tabIcon} />
          상시·연중
          {hasOngoing && <span className={s.tabCount}>{ongoingPrograms.length}</span>}
        </button>
      </div>

      {/* 캐러셀 */}
      {programs.length > 0 ? (
        <div className={wrapperCls}>
          <div ref={scrollRef} className={carouselCls}>
            {programs.map((p) => {
              const isDeadline = tab === "deadline" && "daysLeft" in p;
              const dl = isDeadline ? (p as SupportProgram & { daysLeft: number }) : null;
              const isUpcoming = !isDeadline && "programStatus" in p && p.programStatus === "모집예정";
              const isOngoing = tab === "ongoing";

              return (
                <Link
                  key={p.id}
                  href={`/programs/${p.id}`}
                  data-track={`programs:card:${tab}`}
                  className={`${s.card} ${isDeadline ? s.cardDeadline : ""}`}
                >
                  <div className={s.cardTopRow}>
                    <div className={s.cardTopLeft}>
                      {isDeadline && dl ? (
                        <span className={s.dday}>
                          {dl.daysLeft === 0 ? "오늘 마감" : `D-${dl.daysLeft}`}
                        </span>
                      ) : isUpcoming ? (
                        <span className={s.tagUpcoming}>모집예정</span>
                      ) : isOngoing ? (
                        <span className={s.tag}>{p.applicationEnd === ALWAYS_OPEN ? "상시 모집" : "연중 모집"}</span>
                      ) : (
                        <span className={s.tag}>모집중</span>
                      )}
                      <span className={s.region}>{p.region}</span>
                    </div>
                    <span className={s.typeBadge}>{p.supportType}</span>
                  </div>
                  <h3 className={s.cardTitle}>{p.title}</h3>
                  {isDeadline ? (
                    <p className={s.cardDesc}>{p.summary}</p>
                  ) : (
                    <span className={s.amount}>{p.supportAmount}</span>
                  )}
                  <div className={s.cardMeta}>
                    <span className={s.metaItem}>
                      신청 {periodLabel(p.applicationStart, p.applicationEnd)}
                    </span>
                    <span className={s.metaItem}>
                      {formatAgeRange(p.eligibilityAgeMin, p.eligibilityAgeMax)}
                    </span>
                  </div>
                  <span className={s.org}>{p.organization}</span>
                </Link>
              );
            })}
          </div>

          {needsCarousel && (
            <>
              <button
                type="button"
                aria-label="이전 사업 보기"
                className={`${s.navBtn} ${s.navPrev}`}
                onClick={() => scrollByCard(-1)}
                disabled={!canPrev}
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="다음 사업 보기"
                className={`${s.navBtn} ${s.navNext}`}
                onClick={() => scrollByCard(1)}
                disabled={!canNext}
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      ) : (
        <div className={s.emptyDeadline}>
          {tab === "ongoing" ? <CalendarRange size={20} /> : <Clock size={20} />}
          <p className={s.emptyDeadlineText}>
            {tab === "ongoing" ? "상시 모집 중인 사업이 아직 없어요" : "마감 임박한 사업이 아직 없어요"}
          </p>
          <span className={s.emptyDeadlineSub}>
            {tab === "ongoing" ? "마감 없이 연중 받는 공고가 여기에 모여요" : "마감 14일 전부터 여기에 표시돼요"}
          </span>
        </div>
      )}
    </section>
  );
}
