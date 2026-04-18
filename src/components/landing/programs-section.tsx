"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Icon as IconWrap } from "@/components/ui/icon";
import { useDragScroll } from "@/lib/hooks/use-drag-scroll";
import type { SupportProgram } from "@/lib/data/programs";
import type { ProgramStatus } from "@/lib/program-status";
import s from "./programs-section.module.css";

type Tab = "active" | "deadline";

interface Props {
  activePrograms: (SupportProgram & { programStatus: ProgramStatus })[];
  deadlinePrograms: (SupportProgram & { daysLeft: number })[];
}

const AUTO_SCROLL_INTERVAL = 4000;

export function ProgramsSection({ activePrograms, deadlinePrograms }: Props) {
  const [tab, setTab] = useState<Tab>("active");
  const [animating, setAnimating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);

  const hasDeadline = deadlinePrograms.length > 0;
  const programs = tab === "active" ? activePrograms : deadlinePrograms;
  const needsCarousel = programs.length > 3;

  useDragScroll(scrollRef);

  /* ── 자동 스크롤 (4개 이상일 때만) ── */
  const autoScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || pausedRef.current) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;

    // 끝에 도달하면 처음으로 되돌아감
    if (el.scrollLeft >= maxScroll - 2) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      const card = el.children[0] as HTMLElement | undefined;
      if (!card) return;
      const step = card.offsetWidth + 12; // gap
      el.scrollBy({ left: step, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (!needsCarousel) return;
    autoRef.current = setInterval(autoScroll, AUTO_SCROLL_INTERVAL);
    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
    };
  }, [needsCarousel, autoScroll, tab]);

  /* 유저 인터랙션 시 자동 스크롤 일시 정지 → 5초 뒤 재개 */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !needsCarousel) return;

    let resumeTimer: ReturnType<typeof setTimeout>;
    const pause = () => {
      pausedRef.current = true;
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => { pausedRef.current = false; }, 5000);
    };

    el.addEventListener("pointerdown", pause);
    el.addEventListener("scroll", pause, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("scroll", pause);
      clearTimeout(resumeTimer);
    };
  }, [needsCarousel, tab]);

  if (activePrograms.length === 0 && deadlinePrograms.length === 0) return null;

  const switchTab = (next: Tab) => {
    if (next === tab) return;
    setAnimating(true);
    requestAnimationFrame(() => {
      setTimeout(() => {
        setTab(next);
        setAnimating(false);
        // 탭 전환 후 스크롤 위치 리셋
        scrollRef.current?.scrollTo({ left: 0 });
      }, 150);
    });
  };

  const carouselCls = [
    s.carousel,
    needsCarousel ? s.carouselScroll : "",
    animating ? s.carouselFadeOut : s.carouselFadeIn,
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
        <Link href="/programs" className={s.viewAll}>
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
          진행·예정 공고
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
      </div>

      {/* 캐러셀 */}
      {programs.length > 0 ? (
        <div ref={scrollRef} className={carouselCls}>
          {programs.map((p) => {
            const isDeadline = tab === "deadline" && "daysLeft" in p;
            const dl = isDeadline ? (p as SupportProgram & { daysLeft: number }) : null;
            const isUpcoming = !isDeadline && "programStatus" in p && p.programStatus === "모집예정";

            return (
              <Link
                key={p.id}
                href={`/programs/${p.id}`}
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
                    신청 {p.applicationStart.slice(5).replace("-", ".")} ~ {p.applicationEnd.slice(5).replace("-", ".")}
                  </span>
                  <span className={s.metaItem}>
                    연령 {p.eligibilityAgeMin}~{p.eligibilityAgeMax}세
                  </span>
                </div>
                <span className={s.org}>{p.organization}</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className={s.emptyDeadline}>
          <Clock size={20} />
          <p className={s.emptyDeadlineText}>마감 임박한 사업이 아직 없어요</p>
          <span className={s.emptyDeadlineSub}>마감 14일 전부터 여기에 표시돼요</span>
        </div>
      )}
    </section>
  );
}
