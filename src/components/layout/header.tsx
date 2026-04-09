"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Heart } from "lucide-react";
import { IrangSymbol } from "@/components/brand/irang-symbol";
import { BookmarkList } from "@/components/bookmark/bookmark-list";
import { useBookmarks } from "@/lib/hooks/use-bookmarks";
import s from "./header.module.css";

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
      { href: "/crops/compare", label: "작물 비교", desc: "최대 3종 작물 비교" },
    ],
  },
  {
    label: "준비하기",
    basePaths: ["/guide", "/costs", "/interviews"],
    children: [
      { href: "/guide", label: "귀농 로드맵", desc: "5단계 귀농 준비 가이드" },
      { href: "/costs", label: "비용 가이드", desc: "연령·작물별 비용 분석 & 지원금" },
      { href: "/interviews", label: "귀농인 이야기", desc: "실제 귀농인 인터뷰" },
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
    label: "자료",
    basePaths: ["/stats", "/glossary"],
    children: [
      { href: "/stats/population", label: "통계", desc: "귀농 인구·청년·만족도 추이" },
      { href: "/glossary", label: "농업 용어집", desc: "처음 만나는 농업 용어 해설" },
    ],
  },
];

export function Header() {
  const pathname = usePathname();
  const [bookmarkOpen, setBookmarkOpen] = useState(false);
  /** 드롭다운 클릭 후 일시적으로 hover를 무시하기 위한 플래그 */
  const [navHidden, setNavHidden] = useState(false);
  const { count, mounted } = useBookmarks();

  // 페이지 이동 시 데스크탑 드롭다운 닫기
  useEffect(() => {
    setNavHidden(true);

    // :focus-within 해제 → 드롭다운 CSS 비활성화
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // 마우스가 nav 영역을 벗어나면 hover 다시 활성화
    const navEl = document.querySelector(`nav[aria-label="주요 메뉴"]`);
    const reset = () => setNavHidden(false);

    if (navEl) {
      navEl.addEventListener("mouseleave", reset, { once: true });
    }

    // 터치 디바이스 fallback — mouseleave 미발생 시 자동 해제
    const t = setTimeout(() => {
      setNavHidden(false);
      navEl?.removeEventListener("mouseleave", reset);
    }, 400);

    return () => {
      clearTimeout(t);
      navEl?.removeEventListener("mouseleave", reset);
    };
  }, [pathname]);

  // 드롭다운 아이템 클릭 후 즉시 숨기기 (pathname 변경 전 선제 처리)
  const hideDropdowns = useCallback(() => {
    setNavHidden(true);
    // :focus-within 해제
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, []);

  return (
    <>
      <header className={s.header}>
        <div className={s.inner}>
          {/* Logo — 심볼 + 워드마크 */}
          <Link
            href="/"
            className={s.logo}
            aria-label="이랑 홈으로 이동"
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
                    aria-haspopup="true"
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
              귀농 유형 진단
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <BookmarkList open={bookmarkOpen} onClose={() => setBookmarkOpen(false)} />
    </>
  );
}
