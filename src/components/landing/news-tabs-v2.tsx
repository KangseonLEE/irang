"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { ExternalLink } from "lucide-react";
import { IrangSprout as Sprout } from "@/lib/icons/irang-sprout";
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
  // 키보드 포커스가 슬라이더·카드 목록 안에 있는 동안은 자동 넘김을 멈춘다 — 마우스 이탈(isPaused=false)과 따로 센다 (10/4 QA)
  const [focusPaused, setFocusPaused] = useState(false);
  const [brokenImgs, setBrokenImgs] = useState<Set<string>>(new Set());
  const [contentSlide, setContentSlide] = useState<ContentSlide>("idle");
  const nextIdxRef = useRef<number | null>(null);
  const touchRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  /** 포커스된 토글로 펼친 카드 — 모바일은 펼친 카드의 토글을 숨기므로 펼친 뒤 포커스를 기사 링크로 옮긴다 */
  const pendingFocusRef = useRef<number | null>(null);

  const filtered = useMemo(() => {
    if (activeTab === "all") return items.slice(0, 5);
    return items
      .filter((item) => item.category === activeTab)
      .slice(0, 5);
  }, [activeTab, items]);

  useEffect(() => {
    setFeaturedIdx(0); // eslint-disable-line react-hooks/set-state-in-effect -- 탭 전환 시 상태 리셋 의도
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

  // 모바일(<640)은 펼친 카드의 토글을 display:none 으로 접어 포커스가 body 로 떨어졌다(10/4 QA) — 펼친 기사 링크로 옮긴다.
  // 토글이 보이는 데스크탑은 그대로 둔다(offsetParent 로 판정).
  useEffect(() => {
    const idx = pendingFocusRef.current;
    if (idx === null || idx !== featuredIdx) return;
    pendingFocusRef.current = null;
    const card = navRef.current?.children[idx] as HTMLElement | undefined;
    const toggle = card?.querySelector<HTMLElement>("button");
    if (toggle && toggle.offsetParent === null) {
      card?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
    }
  }, [featuredIdx]);

  /** 포커스가 영역 밖으로 나갈 때만 해제 — 안에서 옮겨 다닐 때는 계속 멈춤 */
  const pauseOnFocus = {
    // 마우스로 누른 뒤 이탈하면 종전처럼 다시 넘어가야 한다 — 키보드 포커스(:focus-visible)일 때만 멈춘다
    onFocus: (e: React.FocusEvent<HTMLDivElement>) => {
      let keyboard = true;
      try {
        keyboard = (e.target as HTMLElement).matches(":focus-visible");
      } catch {
        // :focus-visible 을 모르는 환경(구형 브라우저)은 포커스만으로 멈춘다
      }
      if (keyboard) setFocusPaused(true);
    },
    onBlur: (e: React.FocusEvent<HTMLDivElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusPaused(false);
    },
  };

  useEffect(() => {
    if (isPaused || focusPaused || filtered.length === 0) return;

    const timer = setInterval(() => {
      const nextIdx = featuredIdx + 1;
      if (nextIdx < filtered.length) {
        transitionTo(nextIdx);
      } else {
        advanceTab();
      }
    }, ROTATE_INTERVAL);

    return () => clearInterval(timer);
  }, [filtered.length, isPaused, focusPaused, featuredIdx, transitionTo, advanceTab]);

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
              {...pauseOnFocus}
            >
              {featured && (
                <a
                  href={featured.url}
                  target="_blank"
                  rel="noopener" referrerPolicy="origin"
                  className={`${s.slide}${slideClass ? ` ${slideClass}` : ""}`}
                >
                  <div className={s.slideVisual}>
                    {featured.thumbnail && !brokenImgs.has(featured.thumbnail) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={featured.thumbnail}
                        alt={featured.title}
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
                    {featured.description ? (
                      <span className={s.slideDesc}>{featured.description}</span>
                    ) : (
                      <span className={`${s.slideDesc} ${s.slideDescPlaceholder}`}>
                        {featured.source} 원문에서 자세한 내용을 확인해 보세요.
                      </span>
                    )}
                    <span className={s.slideMeta}>
                      {featured.source} · {featured.date}
                      <ExternalLink size={12} />
                    </span>
                  </div>
                </a>
              )}
            </div>

            {/* 하단 썸네일 내비게이션.
                카드 = 토글 버튼 + (모바일) 펼침 링크 **형제**. 예전엔 링크가 버튼 안에 있어 대화형 요소가 중첩됐다
                (10/3 QA axe nested-interactive — 스크린리더가 링크를 못 찾거나 버튼 이름에 기사 전문이 섞인다).
                테두리·배경은 바깥 카드가, 누르는 영역(여백 포함)은 버튼이 그대로 맡아 화면은 같다. */}
            <div className={s.nav} ref={navRef} {...pauseOnFocus}>
              {filtered.map((item, i) => {
                const isActive = i === featuredIdx;
                return (
                  <div
                    key={`${item.category}-${i}`}
                    className={`${s.navItem} ${isActive ? s.navItemActive : ""}`}
                    data-reveal-item
                    onMouseEnter={() => {
                      setIsPaused(true);
                      transitionTo(i);
                    }}
                    onMouseLeave={() => setIsPaused(false)}
                  >
                    <button
                      type="button"
                      className={s.navToggle}
                      aria-current={isActive ? "true" : undefined}
                      onClick={(e) => {
                        // 포커스된 토글로 펼칠 때만 포커스를 옮긴다(마우스·자동 넘김은 해당 없음)
                        const willTransition = i !== featuredIdx && fadePhase === "idle";
                        pendingFocusRef.current = willTransition && document.activeElement === e.currentTarget ? i : null;
                        transitionTo(i);
                      }}
                    >
                      <span className={s.navThumb}>
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
                          <span className={s.navThumbFallback}>
                            <Sprout size={16} aria-hidden="true" />
                          </span>
                        )}
                      </span>
                      <span className={s.navText}>
                        <span className={s.navTitle}>{item.title}</span>
                        <span className={s.navMeta}>{item.source} · {item.date}</span>
                      </span>
                    </button>

                    {/* 모바일 확장 영역 — grid-row 아코디언 (CSS로 데스크탑 숨김) */}
                    <div className={s.navExpandWrap}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener" referrerPolicy="origin"
                        className={s.navExpanded}
                      >
                        <div className={s.slideVisual}>
                          {item.thumbnail && !brokenImgs.has(item.thumbnail) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className={s.slideImg}
                              loading="lazy"
                            />
                          ) : (
                            <div className={s.slideIllust}>
                              <Sprout size={28} />
                              <span>농촌 소식</span>
                            </div>
                          )}
                        </div>
                        <div className={s.slideBody}>
                          <span className={s.slideBadge}>{item.source}</span>
                          <span className={s.slideTitle}>{item.title}</span>
                          {item.description ? (
                            <span className={s.slideDesc}>{item.description}</span>
                          ) : (
                            <span className={`${s.slideDesc} ${s.slideDescPlaceholder}`}>
                              {item.source} 원문에서 자세한 내용을 확인해 보세요.
                            </span>
                          )}
                          <span className={s.slideMeta}>
                            {item.source} · {item.date}
                            <ExternalLink size={12} />
                          </span>
                        </div>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className={s.empty}>해당 카테고리의 소식이 없어요.</p>
        )}
      </div>
    </div>
  );
}
