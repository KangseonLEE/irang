"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Heart, Menu, X } from "lucide-react";
import { IrangSymbol } from "@/components/brand/irang-symbol";
import { BookmarkList } from "@/components/bookmark/bookmark-list";
import { useBookmarks } from "@/lib/hooks/use-bookmarks";
import s from "./header.module.css";

const GUIDE_TOOLTIP_KEY = "irang_guide_tooltip_dismissed";

/* ── 네비게이션 구조 ── */
interface NavChild {
  href: string;
  label: string;
  desc?: string;
}

interface NavGroup {
  label: string;
  basePaths: string[];
  children: NavChild[];
}

const navGroups: NavGroup[] = [
  {
    label: "지역",
    basePaths: ["/regions"],
    children: [
      { href: "/regions", label: "지역 탐색", desc: "시·도별 기후·인구·작물 정보" },
      { href: "/regions/compare", label: "지역 비교", desc: "최대 3개 지역 비교 분석" },
    ],
  },
  {
    label: "작물",
    basePaths: ["/crops"],
    children: [
      { href: "/crops", label: "작물 정보", desc: "재배 난이도·수익성·적합 기후" },
      { href: "/crops/compare", label: "작물 비교", desc: "최대 4종 작물 비교" },
    ],
  },
  {
    label: "지원·교육",
    basePaths: ["/programs", "/education", "/events"],
    children: [
      { href: "/programs", label: "지원사업", desc: "귀농·귀촌 지원금 & 정책" },
      { href: "/programs/roadmap", label: "정부사업 가이드", desc: "4대 사업 신청 절차 안내" },
      { href: "/education", label: "교육 프로그램", desc: "온·오프라인 귀농 교육" },
      { href: "/events", label: "체험·행사", desc: "현장 체험 & 박람회 일정" },
    ],
  },
  {
    label: "정보",
    basePaths: ["/guide", "/interviews", "/stats", "/glossary"],
    children: [
      { href: "/guide", label: "귀농 로드맵", desc: "5단계 귀농 준비 가이드" },
      { href: "/interviews", label: "귀농인 이야기", desc: "실제 귀농인 인터뷰" },
      { href: "/stats/population", label: "통계", desc: "귀농 인구·청년·만족도 추이" },
      { href: "/glossary", label: "농업 용어집", desc: "처음 만나는 농업 용어 해설" },
    ],
  },
];

export function Header() {
  const pathname = usePathname();
  const [bookmarkOpen, setBookmarkOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showGuideTooltip, setShowGuideTooltip] = useState(false);
  /** 드롭다운 클릭 후 일시적으로 hover를 무시하기 위한 플래그 */
  const [navHidden, setNavHidden] = useState(false);
  const { count, mounted } = useBookmarks();

  // 페이지 이동 시 모바일 메뉴 닫기 (하단 바텀 네비게이션 포함)
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // 드롭다운 아이템 클릭 후 hover 무시 해제 (마우스 이탈 시)
  const hideDropdowns = useCallback(() => {
    setNavHidden(true);
    // 마우스가 nav 영역을 벗어나면 다시 hover 활성화
    const handleMouseLeave = () => setNavHidden(false);
    const navEl = document.querySelector(`nav[aria-label="주요 메뉴"]`);
    if (navEl) {
      navEl.addEventListener("mouseleave", handleMouseLeave, { once: true });
    } else {
      setTimeout(() => setNavHidden(false), 300);
    }
  }, []);

  // 첫 방문 사용자에게 귀농 가이드 툴팁 표시
  useEffect(() => {
    if (!mobileMenuOpen) return;
    try {
      const dismissed = localStorage.getItem(GUIDE_TOOLTIP_KEY);
      if (!dismissed) {
        setShowGuideTooltip(true);
      }
    } catch {
      // localStorage 접근 불가 시 무시
    }
  }, [mobileMenuOpen]);

  const dismissGuideTooltip = useCallback(() => {
    setShowGuideTooltip(false);
    try {
      localStorage.setItem(GUIDE_TOOLTIP_KEY, "1");
    } catch {
      // localStorage 접근 불가 시 무시
    }
  }, []);

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <>
      <header className={s.header}>
        <div className={s.inner}>
          {/* Logo — 심볼 + 워드마크 */}
          <Link
            href="/"
            className={s.logo}
            aria-label="이랑 홈으로 이동"
            onClick={closeMobile}
          >
            <IrangSymbol size={28} />
            <span className={s.logoTextWrap}>
              <span className={s.logoTitle}>이랑</span>
              <span className={s.logoSub}>귀농을 꿈꾸는 모든 이들의 시작점</span>
            </span>
          </Link>

          {/* Desktop Navigation — 드롭다운 GNB */}
          <nav
            className={`${s.nav}${navHidden ? ` ${s.navHidden}` : ""}`}
            aria-label="주요 메뉴"
          >
            {navGroups.map((group) => {
              const isGroupActive = group.basePaths.some(
                (bp) => pathname === bp || pathname.startsWith(bp + "/"),
              );
              return (
                <div key={group.label} className={s.navGroup}>
                  <button
                    type="button"
                    className={`${s.navLink} ${isGroupActive ? s.active : ""}`}
                    aria-expanded={false}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {group.label}
                  </button>
                  <div className={s.dropdown}>
                    {group.children.map((child) => {
                      // 더 구체적인 sibling 경로가 매칭되면 짧은 경로는 비활성
                      const hasMoreSpecificSibling = group.children.some(
                        (other) =>
                          other !== child &&
                          other.href.length > child.href.length &&
                          pathname.startsWith(other.href),
                      );
                      const isChildActive =
                        pathname === child.href ||
                        (!hasMoreSpecificSibling &&
                          pathname.startsWith(child.href + "/"));
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`${s.dropdownItem} ${isChildActive ? s.dropdownItemActive : ""}`}
                          onClick={hideDropdowns}
                        >
                          <span className={s.dropdownLabel}>{child.label}</span>
                          {child.desc && (
                            <span className={s.dropdownDesc}>{child.desc}</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className={s.actions}>
            <button
              type="button"
              className={s.bookmarkBtn}
              onClick={() => setBookmarkOpen(true)}
              aria-label="저장 목록 열기"
            >
              <Heart size={20} />
              {mounted && count > 0 && (
                <span className={s.badge}>{count > 99 ? "99+" : count}</span>
              )}
            </button>
            <Link
              href="/match"
              className={s.ctaButton}
            >
              귀농 가이드
              <ArrowRight size={14} />
            </Link>
            {/* 모바일 햄버거 */}
            <button
              type="button"
              className={s.menuBtn}
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── 모바일 풀스크린 메뉴 ── */}
      {mobileMenuOpen && (
        <div className={s.mobileOverlay} role="dialog" aria-label="메뉴">
          <nav className={s.mobileNav}>
            {/* 귀농 가이드 CTA — 최상단 배치 + 첫 방문 툴팁 */}
            <div className={s.mobileCtaWrap}>
              <Link
                href="/match"
                className={s.mobileCta}
                onClick={() => { closeMobile(); dismissGuideTooltip(); }}
              >
                귀농 가이드 시작하기
                <ArrowRight size={16} />
              </Link>
              {showGuideTooltip && (
                <div className={s.guideTooltip}>
                  <span className={s.guideTooltipArrow} />
                  <p className={s.guideTooltipText}>
                    어디서부터 준비해야 할지 고민이라면,<br />
                    3분이면 나만의 귀농 플랜을 받아볼 수 있어요.
                  </p>
                  <button
                    type="button"
                    className={s.guideTooltipClose}
                    onClick={dismissGuideTooltip}
                    aria-label="안내 닫기"
                  >
                    알겠어요
                  </button>
                </div>
              )}
            </div>

            {navGroups.map((group) => (
              <div key={group.label} className={s.mobileGroup}>
                <span className={s.mobileGroupLabel}>{group.label}</span>
                {group.children.map((child) => {
                  const hasMoreSpecificSibling = group.children.some(
                    (other) =>
                      other !== child &&
                      other.href.length > child.href.length &&
                      pathname.startsWith(other.href),
                  );
                  const isActive =
                    pathname === child.href ||
                    (!hasMoreSpecificSibling &&
                      pathname.startsWith(child.href + "/"));
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`${s.mobileLink} ${isActive ? s.mobileLinkActive : ""}`}
                      onClick={closeMobile}
                    >
                      <span className={s.mobileLinkLabel}>{child.label}</span>
                      {child.desc && (
                        <span className={s.mobileLinkDesc}>{child.desc}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>
      )}

      <BookmarkList open={bookmarkOpen} onClose={() => setBookmarkOpen(false)} />
    </>
  );
}
