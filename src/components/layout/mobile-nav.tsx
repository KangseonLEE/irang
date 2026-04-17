"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import {
  House,
  Map,
  ScanSearch,
  HandCoins,
  LayoutGrid,
} from "lucide-react";
import s from "./mobile-nav.module.css";

// ─── 하단 탭 (4개 + 더보기) ───

const tabs = [
  { href: "/", label: "홈", icon: House },
  { href: "/regions", label: "지역", icon: Map },
  { href: "/match", label: "유형진단", icon: ScanSearch },
  { href: "/programs", label: "지원사업", icon: HandCoins },
];

// 더보기 페이지에서 활성 표시할 경로 목록
const morePaths = [
  "/more",
  "/assess",
  "/guide",
  "/costs",
  "/crops",
  "/education",
  "/events",
  "/interviews",
  "/stats",
  "/glossary",
  "/about",
];

// 재탭 시 스크롤 투 탑 → 새로고침 지원 경로 (리스트/피드형 페이지)
const scrollableRoots = ["/", "/regions", "/programs"];

function isScrollablePage(pathname: string) {
  return scrollableRoots.some(
    (root) => pathname === root || pathname.startsWith(root + "/"),
  );
}

const SCROLL_TOP_THRESHOLD = 30;

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isMoreActive = morePaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  const handleTabClick = useCallback(
    (e: React.MouseEvent, href: string) => {
      const isActive =
        href === "/"
          ? pathname === "/"
          : pathname === href || pathname.startsWith(href + "/");

      // 현재 탭이 아니면 기본 Link 동작 (페이지 이동)
      if (!isActive) return;

      // 현재 탭 재탭 — 스크롤 가능 페이지만 처리
      if (!isScrollablePage(pathname)) return;

      e.preventDefault();

      const scrollY = window.scrollY;

      if (scrollY > SCROLL_TOP_THRESHOLD) {
        // 1단계: 스크롤 투 탑
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // 2단계: 이미 상단 → 새로고침
        router.refresh();
      }
    },
    [pathname, router],
  );

  return (
    <nav className={s.nav} aria-label="주요 메뉴">
      <div className={s.inner}>
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname === tab.href ||
                pathname.startsWith(tab.href + "/");
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`${s.tab} ${isActive ? s.active : ""}`}
              onClick={(e) => handleTabClick(e, tab.href)}
            >
              <Icon size={24} strokeWidth={isActive ? 2.0 : 1.75} />
              <span>{tab.label}</span>
            </Link>
          );
        })}

        {/* 더보기 — 고정 페이지이므로 재탭 처리 없음 */}
        <Link
          href="/more"
          className={`${s.tab} ${isMoreActive ? s.active : ""}`}
        >
          <LayoutGrid size={24} strokeWidth={isMoreActive ? 2.0 : 1.75} />
          <span>전체</span>
        </Link>
      </div>
    </nav>
  );
}
