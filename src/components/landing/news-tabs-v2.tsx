"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { ExternalLink } from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import type { UnifiedNewsItem } from "./news-tabs";
import s from "./news-tabs-v2.module.css";

interface NewsTabsV2Props {
  items: UnifiedNewsItem[];
}

const TABS = [
  { id: "all", label: "전체" },
  { id: "policy", label: "정책" },
  { id: "education", label: "교육" },
  { id: "event", label: "행사" },
  { id: "program", label: "지원" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const ROTATE_INTERVAL = 5000;
const FADE_OUT_MS = 150;
const FADE_IN_MS = 200;

type FadePhase = "idle" | "out" | "in";
type ContentSlide = "idle" | "out-left" | "in-right" | "out-right" | "in-left";

const CONTENT_SLIDE_CLASS: Record<ContentSlide, string> = {
  idle: "",
  "out-left": "contentSlideOutLeft",
  "in-right": "contentSlideInRight",
  "out-right": "contentSlideOutRight",
  "in-left": "contentSlideInLeft",
};

export function NewsTabsV2({ items }: NewsTabsV2Props) {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [fadePhase, setFadePhase] = useState<FadePhase>("idle");
  const [isPaused, setIsPaused] = useState(false);
  const [brokenImgs, setBrokenImgs] = useState<Set<string>>(new Set());
  const [contentSlide, setContentSlide] = useState<ContentSlide>("idle");
  const nextIdxRef = useRef<number | null>(null);
  const touchRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (activeTab === "all") return items.slice(0, 5);
    return items
      .filter((item) => item.category === activeTab)
      .slice(0, 5);
  }, [activeTab, items]);

  useEffect(() => {
    setFeaturedIdx(0);
    setFadePhase("idle");
  }, [activeTab]);

  const transitionTo = useCallback(
    (nextIdx: number) => {
      if (nextIdx === featuredIdx || fadePhase !== "idle") return;
      nextIdxRef.current = nextIdx;
      setFadePhase("out");

      setTimeout(() => {
        setFeaturedIdx(nextIdxRef.current ?? nextIdx);
        setFadePhase("in");
        setTimeout(() => setFadePhase("idle"), FADE_IN_MS);
      }, FADE_OUT_MS);
    },
    [featuredIdx, fadePhase],
  );

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") setIsPaused(false);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const advanceTab = useCallback(() => {
    const tabIds = TABS.map((t) => t.id);
    const curIdx = tabIds.indexOf(activeTab);
    const nextIdx = (curIdx + 1) % tabIds.length;

    setContentSlide("out-left");
    setTimeout(() => {
      setActiveTab(tabIds[nextIdx]);
      setContentSlide("in-right");
      setTimeout(() => setContentSlide("idle"), 250);
    }, 200);
  }, [activeTab]);

  useEffect(() => {
    if (isPaused || filtered.length === 0) return;

    const timer = setInterval(() => {
      const nextIdx = featuredIdx + 1;
      if (nextIdx < filtered.length) {
        transitionTo(nextIdx);
      } else {
        advanceTab();
      }
    }, ROTATE_INTERVAL);

    return () => clearInterval(timer);
  }, [filtered.length, isPaused, featuredIdx, transitionTo, advanceTab]);

  const switchTab = useCallback(
    (direction: 1 | -1) => {
      const tabIds = TABS.map((t) => t.id);
      const curIdx = tabIds.indexOf(activeTab);
      const nextIdx = curIdx + direction;
      if (nextIdx < 0 || nextIdx >= tabIds.length || contentSlide !== "idle") return;

      setContentSlide(direction === 1 ? "out-left" : "out-right");
      setTimeout(() => {
        setActiveTab(tabIds[nextIdx]);
        setContentSlide(direction === 1 ? "in-right" : "in-left");
        setTimeout(() => setContentSlide("idle"), 250);
      }, 200);
    },
    [activeTab, contentSlide],
  );

  useEffect(() => {
    const el = sliderRef.current;
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

      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) && dt < 500) {
        switchTab(dx < 0 ? 1 : -1);
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [switchTab]);

  const slideClass =
    fadePhase === "out"
      ? s.slideFadeOut
      : fadePhase === "in"
        ? s.slideFadeIn
        : "";

  const featured = filtered[featuredIdx] ?? null;

  return (
    <div className={s.wrap}>
      {/* 탭 필 바 */}
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

      {/* 메인 컨텐츠 */}
      <div
        className={CONTENT_SLIDE_CLASS[contentSlide] ? s[CONTENT_SLIDE_CLASS[contentSlide]] : undefined}
      >
        {filtered.length > 0 ? (
          <>
            {/* 시네마틱 슬라이더 */}
            <div
              ref={sliderRef}
              className={s.slider}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {featured && (
                <a
                  href={featured.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${s.slide}${slideClass ? ` ${slideClass}` : ""}`}
                >
                  <div className={s.slideVisual}>
                    {featured.thumbnail && !brokenImgs.has(featured.thumbnail) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={featured.thumbnail}
                        alt=""
                        className={s.slideImg}
                        loading="lazy"
                        onError={() => {
                          setBrokenImgs((prev) => new Set(prev).add(featured.thumbnail!));
                        }}
                      />
                    ) : (
                      <div className={s.slideIllust}>
                        <Sprout size={40} />
                        <span>농촌 소식</span>
                      </div>
                    )}
                  </div>
                  <div className={s.slideBody}>
                    <span className={s.slideBadge}>{featured.source}</span>
                    <span className={s.slideTitle}>{featured.title}</span>
                    {featured.description && (
                      <span className={s.slideDesc}>{featured.description}</span>
                    )}
                    <span className={s.slideMeta}>
                      {featured.source} · {featured.date}
                      <ExternalLink size={12} />
                    </span>
                  </div>
                </a>
              )}
            </div>

            {/* 하단 썸네일 내비게이션 */}
            <div className={s.nav}>
              {filtered.map((item, i) => (
                <button
                  key={`${item.category}-${i}`}
                  type="button"
                  className={`${s.navItem} ${i === featuredIdx ? s.navItemActive : ""}`}
                  onClick={() => transitionTo(i)}
                  onMouseEnter={() => {
                    setIsPaused(true);
                    transitionTo(i);
                  }}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  <div className={s.navThumb}>
                    {item.thumbnail && !brokenImgs.has(item.thumbnail) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnail}
                        alt=""
                        className={s.navThumbImg}
                        loading="lazy"
                        onError={() => {
                          setBrokenImgs((prev) => new Set(prev).add(item.thumbnail!));
                        }}
                      />
                    ) : (
                      <div className={s.navThumbFallback}>
                        <Sprout size={16} />
                      </div>
                    )}
                  </div>
                  <div className={s.navText}>
                    <span className={s.navTitle}>{item.title}</span>
                    <span className={s.navMeta}>{item.source} · {item.date}</span>
                  </div>
                </button>
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
