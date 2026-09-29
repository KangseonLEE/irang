"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Clock, CalendarRange } from "lucide-react";
import { Icon as IconWrap } from "@/components/ui/icon";
import { useDragScroll } from "@/lib/hooks/use-drag-scroll";
import type { SupportProgram } from "@/lib/data/programs";
import { ALWAYS_OPEN, type ProgramStatus } from "@/lib/program-status";
import { formatAgeRange } from "@/lib/format";
import { analytics } from "@/lib/analytics";
import { SnapDots } from "@/components/ui/snap-dots";
import s from "./programs-section.module.css";

type Tab = "active" | "ongoing";

/** 모집중이면서 마감이 이 일수 이내면 카드에 D-N 배지 (기존 "마감 임박" 탭 대체, 9/14) */
const URGENT_DAYS = 14;

type ActiveProgram = SupportProgram & { programStatus: ProgramStatus };

interface Props {
  activePrograms: ActiveProgram[];
  /** 상시·연중 모집 (마감 없음 또는 접수 150일 이상) — 8/30 탭 분리 */
  ongoingPrograms: ActiveProgram[];
}

/**
 * 카드 묶음 정의 (9/29 레일 개편).
 * 1024+ 에서는 탭 대신 이 묶음들이 세로로 쌓여 "단계"가 되고, 왼쪽 제목 블록이 sticky 로 붙어
 * 스크롤 진행에 따라 캡션만 바뀐다. <1024 는 종전 탭 UI 그대로(묶음 1개만 노출).
 */
interface Group {
  id: Tab;
  /** 단계 캡션 = 모바일 탭 라벨과 같은 말 (한 서비스 한 이름) */
  caption: string;
  /** 단계 짧은 설명 — 인디케이터에만 노출 */
  desc: string;
  programs: ActiveProgram[];
}

/** 카드 하단 "신청 …" 표기 — 상시 건은 날짜 대신 상시 문구 (9999-12-31이 "12.31"로 새는 것 방지) */
function periodLabel(start: string, end: string): string {
  const mmdd = (d: string) => d.slice(5).replace("-", ".");
  // 예산 소진형(공주·청도)과 연중 서비스형(귀농닥터·살아보기)이 섞여 있어 마감 사유는 붙이지 않는다 — 각 카드 summary가 설명
  if (end === ALWAYS_OPEN) return `${mmdd(start)}부터 상시 모집`;
  return `${mmdd(start)} ~ ${mmdd(end)}`;
}

export function ProgramsSection({ activePrograms, ongoingPrograms }: Props) {
  const [tab, setTab] = useState<Tab>("active");
  const [animating, setAnimating] = useState(false);
  /** 레일 활성 단계 (1024+ 인디케이터) — 묶음 top 이 뷰포트 45% 선을 지난 마지막 묶음 */
  const [activeStage, setActiveStage] = useState(0);
  /** 등장이 끝난 묶음 id — 묶음이 화면에 들어올 때 카드가 좌→우로 떠오른다 */
  const [revealed, setRevealed] = useState<readonly Tab[]>([]);
  const railRef = useRef<HTMLDivElement>(null);

  const hasOngoing = ongoingPrograms.length > 0;

  const groups = useMemo<Group[]>(
    () => [
      {
        id: "active",
        caption: "진행·예정",
        desc: "접수 기간이 정해진 공고예요",
        programs: activePrograms,
      },
      {
        id: "ongoing",
        caption: "상시·연중",
        desc: "마감 없이 연중 받는 공고예요",
        programs: ongoingPrograms,
      },
    ],
    [activePrograms, ongoingPrograms],
  );

  /** 인디케이터·단계 번호는 카드가 있는 묶음만 센다 (빈 묶음은 1024+ 에서 숨김) */
  const stages = useMemo(() => groups.filter((g) => g.programs.length > 0), [groups]);

  /* ── 묶음 등장 (1회) ──
     page.tsx 의 ScrollReveal stagger(data-reveal-item)를 쓰지 않는 이유: 그 리빌은 섹션 진입 1회라
     레일 아래쪽 묶음이 화면에 오기 전에 끝나고, 1.8s 뒤 마커까지 떼어 간다. 묶음별 트리거가 필요하다. */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const nodes = Array.from(rail.querySelectorAll<HTMLElement>("[data-group]"));
    // prefers-reduced-motion 은 CSS 에서 처리한다(카드 transition none + 숨김 해제) — 여기서 분기하지 않는다

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .map((e) => (e.target as HTMLElement).dataset.group as Tab);
        if (hit.length === 0) return;
        setRevealed((prev) => [...new Set([...prev, ...hit])]);
        entries.filter((e) => e.isIntersecting).forEach((e) => io.unobserve(e.target));
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [groups]);

  /* ── 레일 단계 활성 판정 (1024+) ──
     IntersectionObserver 는 "지났다"는 순간만 알려주는 트리거로 쓰고, 활성 단계는 매번 각 묶음의
     top 을 뷰포트 45% 선과 비교해 고른다. intersectionRatio 로 고르면 짧은 묶음이 항상 이긴다(9/17 박제). */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || stages.length < 2) return;

    const pick = () => {
      const nodes = Array.from(rail.querySelectorAll<HTMLElement>("[data-stage]"));
      const line = window.innerHeight * 0.45;
      let next = 0;
      nodes.forEach((n) => {
        const idx = Number(n.dataset.stage);
        if (Number.isFinite(idx) && n.getBoundingClientRect().top <= line) next = idx;
      });
      setActiveStage(next);
    };

    // 뷰포트 45% 에 놓인 높이 0 밴드 — 묶음 top/bottom 이 이 선을 지날 때마다 콜백(양방향)
    const io = new IntersectionObserver(pick, { threshold: 0, rootMargin: "-45% 0px -55% 0px" });
    rail.querySelectorAll<HTMLElement>("[data-stage]").forEach((n) => io.observe(n));
    pick();
    window.addEventListener("resize", pick);
    return () => {
      io.disconnect();
      window.removeEventListener("resize", pick);
    };
  }, [stages.length]);

  if (activePrograms.length === 0 && ongoingPrograms.length === 0) return null;

  const switchTab = (next: Tab) => {
    if (next === tab) return;
    analytics.programsTabSwitch(next);
    // 탭으로 처음 열리는 묶음은 IO 콜백(다음 프레임)을 기다리지 않고 바로 등장 상태로 — 빈 화면 깜빡임 방지
    setRevealed((prev) => (prev.includes(next) ? prev : [...prev, next]));
    setAnimating(true);
    requestAnimationFrame(() => {
      setTimeout(() => {
        setTab(next);
        setAnimating(false);
      }, 150);
    });
  };

  return (
    <section className={s.section} aria-label="지원사업">
      {/* 1024+ : 좌 sticky 제목·단계 블록 / 우 카드 묶음 레일. <1024 : 종전 세로 스택 + 탭 */}
      <div className={s.rail} ref={railRef}>
        <div className={s.railHead}>
          <div className={s.header} data-reveal-x="left">
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

          {/* 단계 인디케이터 — 1024+ 전용(모바일은 아래 탭이 같은 역할이라 CSS 로 숨김).
              스크롤 진행에 따라 활성 단계만 진해진다. 왼쪽 세로선은 쓰지 않는다(디자인 금지 규칙). */}
          {stages.length > 1 && (
            <ol className={s.steps}>
              {stages.map((g, i) => (
                <li
                  key={g.id}
                  className={`${s.step} ${i === activeStage ? s.stepActive : ""}`}
                  aria-current={i === activeStage ? "step" : undefined}
                >
                  <span className={s.stepNum} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={s.stepBody}>
                    <span className={s.stepCaption}>
                      {g.caption}
                      <span className={s.stepCount}>{g.programs.length}</span>
                    </span>
                    <span className={s.stepDesc}>{g.desc}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}

          {/* 탭 — <1024 전용. 1024+ 는 위 단계 인디케이터가 대신하므로 CSS 로 숨긴다 */}
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
              aria-selected={tab === "ongoing"}
              className={`${s.tab} ${tab === "ongoing" ? s.tabActive : ""}`}
              onClick={() => switchTab("ongoing")}
            >
              <CalendarRange size={13} className={s.tabIcon} />
              상시·연중
              {hasOngoing && <span className={s.tabCount}>{ongoingPrograms.length}</span>}
            </button>
          </div>
        </div>

        <div className={s.railBody}>
          {groups.map((g) => (
            <ProgramGroup
              key={g.id}
              group={g}
              stageIndex={stages.findIndex((x) => x.id === g.id)}
              selected={tab === g.id}
              animating={animating && tab === g.id}
              revealed={revealed.includes(g.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * 카드 묶음 하나 — 모바일 1장 캐러셀·화살표·위치 점은 종전 그대로(묶음마다 자기 ref 를 갖는다).
 * 1024+ 레일에서는 CSS 로 2열 그리드가 되고 화살표·점·그라데이션이 꺼진다.
 */
function ProgramGroup({
  group,
  stageIndex,
  selected,
  animating,
  revealed,
}: {
  group: Group;
  /** 레일 단계 번호 (카드 없는 묶음은 -1 → data-stage 를 붙이지 않는다) */
  stageIndex: number;
  selected: boolean;
  animating: boolean;
  revealed: boolean;
}) {
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const programs = group.programs;

  /** 데스크탑 화살표·그라데이션은 3장을 넘겨 스크롤이 생길 때만 */
  const needsCarousel = programs.length > 3;
  /** 모바일(<768)은 카드 수와 무관하게 항상 1장 노출 + 좌우 스와이프 (9/28 회장) */
  const mobileCarousel = programs.length > 1;

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
  }, [needsCarousel, updateEdges]);

  const scrollByCard = useCallback((dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[0] as HTMLElement | undefined;
    if (!card) return;
    const step = card.offsetWidth + 12; // gap
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  const carouselCls = [
    s.carousel,
    needsCarousel ? s.carouselScroll : "",
    mobileCarousel ? s.carouselMobile : "",
    animating ? s.carouselFadeOut : s.carouselFadeIn,
  ]
    .filter(Boolean)
    .join(" ");

  const wrapperCls = [s.carouselWrapper, canPrev ? s.fadeLeft : "", canNext ? s.fadeRight : ""]
    .filter(Boolean)
    .join(" ");

  const groupCls = [
    s.group,
    selected ? s.groupSelected : "",
    programs.length === 0 ? s.groupEmpty : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={groupCls}
      data-group={group.id}
      data-stage={stageIndex >= 0 ? stageIndex : undefined}
      data-revealed={revealed ? "" : undefined}
      role="group"
      aria-label={`${group.caption} 지원사업`}
    >
      {/* 묶음 캡션 — 1024+ 전용. 탭이 사라진 자리에서 이 묶음이 무엇인지 알려준다 */}
      <p className={s.groupCaption} aria-hidden="true">
        {stageIndex >= 0 && (
          <span className={s.groupNum}>{String(stageIndex + 1).padStart(2, "0")}</span>
        )}
        {group.caption}
      </p>

      {programs.length > 0 ? (
        <div className={wrapperCls}>
          <div ref={scrollRef} className={carouselCls}>
            {programs.map((p) => {
              const isUpcoming = "programStatus" in p && p.programStatus === "모집예정";
              const isOngoing = group.id === "ongoing";
              // 모집중 + 마감 임박이면 D-N 배지 (묶음 무관, 진행·예정 카드에서도 표시)
              const daysLeft = "daysLeft" in p ? (p as { daysLeft: number }).daysLeft : -1;
              const isUrgent = !isUpcoming && !isOngoing && daysLeft >= 0 && daysLeft <= URGENT_DAYS;

              return (
                <Link
                  key={p.id}
                  href={`/programs/${p.id}`}
                  data-track={`programs:card:${group.id}`}
                  className={`${s.card} ${isUrgent ? s.cardDeadline : ""}`}
                >
                  <div className={s.cardTopRow}>
                    <div className={s.cardTopLeft}>
                      {isUrgent ? (
                        <span className={s.dday}>
                          {daysLeft === 0 ? "오늘 마감" : `D-${daysLeft}`}
                        </span>
                      ) : isUpcoming ? (
                        <span className={s.tagUpcoming}>모집예정</span>
                      ) : isOngoing ? (
                        <span className={s.tag}>
                          {p.applicationEnd === ALWAYS_OPEN ? "상시 모집" : "연중 모집"}
                        </span>
                      ) : (
                        <span className={s.tag}>모집중</span>
                      )}
                      <span className={s.region}>{p.region}</span>
                    </div>
                    <span className={s.typeBadge}>{p.supportType}</span>
                  </div>
                  <h3 className={s.cardTitle}>{p.title}</h3>
                  <span className={s.amount}>{p.supportAmount}</span>
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
          {/* 모바일 위치 점 — 768+ 는 공용 CSS 로 숨김 */}
          <SnapDots
            trackRef={scrollRef}
            count={programs.length}
            label={`${group.caption} 지원사업 카드 위치`}
            itemLabel={(i) => `${programs[i].title} 카드로`}
          />
        </div>
      ) : (
        <div className={s.emptyDeadline}>
          {group.id === "ongoing" ? <CalendarRange size={20} /> : <Clock size={20} />}
          <p className={s.emptyDeadlineText}>
            {group.id === "ongoing"
              ? "상시 모집 중인 사업이 아직 없어요"
              : "진행 중인 사업이 아직 없어요"}
          </p>
          <span className={s.emptyDeadlineSub}>
            {group.id === "ongoing"
              ? "마감 없이 연중 받는 공고가 여기에 모여요"
              : "새 공고가 열리면 여기에 표시돼요"}
          </span>
        </div>
      )}
    </div>
  );
}
