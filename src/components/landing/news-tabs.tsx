"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { ExternalLink } from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import s from "./news-tabs.module.css";

/* ── 통합 뉴스 아이템 ── */

export interface UnifiedNewsItem {
  title: string;
  /** 기사 본문 요약 */
  description?: string;
  source: string;
  date: string;
  url: string;
  /** 네이버 뉴스 URL — OG 추출용 (서버 전용, 클라이언트에선 미사용) */
  naverUrl?: string;
  /** OG 이미지 썸네일 URL (선택) */
  thumbnail?: string;
  /** 탭 분류: news(전체 뉴스), education, event, program */
  category: "news" | "education" | "event" | "program";
  /** 정렬용 타임스탬프 (ms) */
  _ts?: number;
}

interface NewsTabsProps {
  items: UnifiedNewsItem[];
}

const TABS = [
  { id: "all", label: "전체" },
  { id: "education", label: "교육" },
  { id: "event", label: "행사" },
  { id: "program", label: "지원" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const ROTATE_INTERVAL = 5000; // 5초마다 자동 전환
const SLIDE_OUT_MS = 250;     // slideOut 애니메이션 시간과 일치
const SLIDE_IN_MS = 350;      // slideIn 애니메이션 시간과 일치

type SlidePhase = "idle" | "out" | "in";

type TabSlide = "idle" | "out-left" | "in-right" | "out-right" | "in-left";

const TAB_SLIDE_CLASS: Record<TabSlide, string> = {
  "idle": "",
  "out-left": "bodySlideOutLeft",
  "in-right": "bodySlideInRight",
  "out-right": "bodySlideOutRight",
  "in-left": "bodySlideInLeft",
};

export function NewsTabs({ items }: NewsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [slidePhase, setSlidePhase] = useState<SlidePhase>("idle");
  const [isPaused, setIsPaused] = useState(false);
  const [brokenImgs, setBrokenImgs] = useState<Set<string>>(new Set());
  const [tabSlide, setTabSlide] = useState<TabSlide>("idle");
  const nextIdxRef = useRef<number | null>(null);
  const touchRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (activeTab === "all") return items.slice(0, 4);
    return items
      .filter((item) => item.category === activeTab)
      .slice(0, 4);
  }, [activeTab, items]);

  // 탭 변경 시 Featured 인덱스 리셋
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setFeaturedIdx(0);
    setSlidePhase("idle");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [activeTab]);

  /** slide-out → 콘텐츠 교체 → slide-in 시퀀스 */
  const transitionTo = useCallback(
    (nextIdx: number) => {
      if (nextIdx === featuredIdx || slidePhase !== "idle") return;
      nextIdxRef.current = nextIdx;
      setSlidePhase("out");

      setTimeout(() => {
        setFeaturedIdx(nextIdxRef.current ?? nextIdx);
        setSlidePhase("in");

        setTimeout(() => {
          setSlidePhase("idle");
        }, SLIDE_IN_MS);
      }, SLIDE_OUT_MS);
    },
    [featuredIdx, slidePhase],
  );

  // 탭 복귀 시 isPaused 자동 해제 (링크 클릭 후 돌아왔을 때)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setIsPaused(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // 자동 전환
  useEffect(() => {
    if (filtered.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      const next = (featuredIdx + 1) % filtered.length;
      transitionTo(next);
    }, ROTATE_INTERVAL);

    return () => clearInterval(timer);
  }, [filtered.length, isPaused, featuredIdx, transitionTo]);

  // ── 모바일 스와이프로 탭 전환 (슬라이드 애니메이션) ──
  const switchTab = useCallback(
    (direction: 1 | -1) => {
      const tabIds = TABS.map((t) => t.id);
      const curIdx = tabIds.indexOf(activeTab);
      const nextIdx = curIdx + direction;
      if (nextIdx < 0 || nextIdx >= tabIds.length || tabSlide !== "idle") return;

      // Phase 1: 현재 콘텐츠 슬라이드 아웃
      setTabSlide(direction === 1 ? "out-left" : "out-right");

      setTimeout(() => {
        // Phase 2: 탭 데이터 교체 + 새 콘텐츠 슬라이드 인
        setActiveTab(tabIds[nextIdx]);
        setTabSlide(direction === 1 ? "in-right" : "in-left");

        setTimeout(() => {
          // Phase 3: 애니메이션 완료
          setTabSlide("idle");
        }, 250);
      }, 200);
    },
    [activeTab, tabSlide],
  );

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchRef.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchRef.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchRef.current.x;
      const dy = touch.clientY - touchRef.current.y;
      const dt = Date.now() - touchRef.current.t;
      touchRef.current = null;

      // 가로 40px 이상 + 세로보다 가로가 큰 + 500ms 이내
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) && dt < 500) {
        switchTab(dx < 0 ? 1 : -1); // 왼쪽 스와이프 → 다음 탭
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [switchTab]);

  // 리스트 아이템 호버로 Featured 전환
  const selectFeatured = useCallback(
    (idx: number) => {
      transitionTo(idx);
    },
    [transitionTo],
  );

  const slideClass =
    slidePhase === "out"
      ? s.featuredSlideOut
      : slidePhase === "in"
        ? s.featuredSlideIn
        : "";

  const featured = filtered[featuredIdx] ?? null;

  return (
    <div className={s.newsCard}>
      {/* 헤더: 타이틀 + 탭 */}
      <div className={s.header}>
        <h3 className={s.title}>농촌 소식</h3>
        <div className={s.tabs} role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={activeTab === tab.id}
              className={`${s.tab} ${activeTab === tab.id ? s.tabActive : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2단 레이아웃: Featured + List */}
      <div
        ref={bodyRef}
        className={`${s.body}${TAB_SLIDE_CLASS[tabSlide] ? ` ${s[TAB_SLIDE_CLASS[tabSlide]]}` : ""}`}
        role="tabpanel"
      >
        {filtered.length > 0 ? (
          <>
            {/* 좌측: Featured 속보 (자동 전환) */}
            {featured && (
              <a
                href={featured.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${s.featured}${slideClass ? ` ${slideClass}` : ""}`}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {/* 비주얼 영역 — OG 이미지 또는 일러스트 폴백 */}
                <div className={s.featuredVisual}>
                  {featured.thumbnail && !brokenImgs.has(featured.thumbnail) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featured.thumbnail}
                      alt=""
                      className={s.featuredImg}
                      loading="lazy"
                      onError={() => {
                        setBrokenImgs((prev) => new Set(prev).add(featured.thumbnail!));
                      }}
                    />
                  ) : (
                    <div className={s.featuredIllust}>
                      <Sprout size={32} />
                      <span>농촌 소식</span>
                    </div>
                  )}
                  <span className={s.featuredBadge}>{featured.source}</span>
                </div>

                {/* 텍스트 영역 */}
                <div className={s.featuredText}>
                  <span className={s.featuredTitle}>{featured.title}</span>
                  {featured.description && (
                    <span className={s.featuredDesc}>{featured.description}</span>
                  )}
                  <span className={s.featuredMeta}>
                    {featured.source} · {featured.date}
                    <ExternalLink size={12} />
                  </span>
                </div>
              </a>
            )}

            {/* 우측: 전체 리스트 (현재 Featured 하이라이트) */}
            <div className={s.list}>
              {filtered.map((item, i) => (
                <a
                  key={`${item.category}-${i}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${s.item} ${i === featuredIdx ? s.itemActive : ""}`}
                  onMouseEnter={() => {
                    setIsPaused(true);
                    selectFeatured(i);
                  }}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  <span className={s.itemTitle}>{item.title}</span>
                  <span className={s.itemMeta}>
                    {item.source} · {item.date}
                    <ExternalLink size={12} />
                  </span>
                </a>
              ))}
            </div>
          </>
        ) : (
          <p className={s.empty}>해당 카테고리의 소식이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
