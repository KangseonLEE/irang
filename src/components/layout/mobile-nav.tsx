"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MapPin,
  FileText,
  Compass,
  MoreHorizontal,
  Sprout,
  GraduationCap,
  CalendarDays,
  Users,
  BarChart3,
  ClipboardCheck,
  Info,
  X,
} from "lucide-react";
import s from "./mobile-nav.module.css";

// ─── 하단 탭 (4개 + 더보기) ───

const tabs = [
  { href: "/", label: "홈", icon: Home },
  { href: "/regions", label: "지역", icon: MapPin },
  { href: "/match", label: "맞춤추천", icon: Compass },
  { href: "/programs", label: "지원사업", icon: FileText },
];

// ─── 더보기 바텀시트 메뉴 ───

const moreMenuItems = [
  {
    href: "/assess",
    label: "귀농 적합성 진단",
    icon: ClipboardCheck,
    desc: "10문항으로 나의 귀농 준비 상태 점검",
  },
  {
    href: "/crops",
    label: "작물정보",
    icon: Sprout,
    desc: "17종 작물의 난이도·수익성 비교",
  },
  {
    href: "/education",
    label: "교육",
    icon: GraduationCap,
    desc: "귀농·귀촌 교육 프로그램",
  },
  {
    href: "/events",
    label: "체험·행사",
    icon: CalendarDays,
    desc: "농촌 체험·박람회 일정",
  },
  {
    href: "/interviews",
    label: "귀농인 이야기",
    icon: Users,
    desc: "실제 귀농인 인터뷰",
  },
  {
    href: "/stats/population",
    label: "통계",
    icon: BarChart3,
    desc: "귀농·귀촌 인구 통계",
  },
  {
    href: "/about",
    label: "서비스 소개",
    icon: Info,
    desc: "이랑 서비스 안내",
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "";
  }, []);

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  // 라우트 변경 시 닫기
  useEffect(() => {
    close();
  }, [pathname, close]);

  // 더보기 메뉴 중 현재 활성 항목이 있는지
  const isMoreActive = moreMenuItems.some(
    (item) =>
      pathname === item.href || pathname.startsWith(item.href + "/"),
  );

  return (
    <>
      {/* 오버레이 — 탭바 뒤쪽(z-49)에서 배경을 덮음 */}
      {isOpen && (
        <div
          className={s.overlay}
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* 바텀시트 — 탭바 바로 위에 위치 */}
      <div
        id="more-sheet"
        className={`${s.sheet} ${isOpen ? s.sheetOpen : ""}`}
        role="dialog"
        aria-modal={isOpen}
        aria-label="더보기 메뉴"
      >
        <div className={s.sheetHandle} aria-hidden="true" />
        <div className={s.sheetHeader}>
          <span className={s.sheetTitle}>더보기</span>
          <button
            className={s.sheetClose}
            onClick={close}
            aria-label="메뉴 닫기"
          >
            <X size={20} />
          </button>
        </div>
        <div className={s.sheetBody}>
          {moreMenuItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${s.menuItem} ${active ? s.menuItemActive : ""}`}
                onClick={close}
              >
                <div className={s.menuIcon}>
                  <Icon size={20} />
                </div>
                <div className={s.menuText}>
                  <span className={s.menuLabel}>{item.label}</span>
                  <span className={s.menuDesc}>{item.desc}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 하단 탭바 */}
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
              >
                <Icon size={24} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{tab.label}</span>
              </Link>
            );
          })}

          {/* 더보기 탭 */}
          <button
            className={`${s.tab} ${isMoreActive || isOpen ? s.active : ""}`}
            onClick={isOpen ? close : open}
            aria-expanded={isOpen}
            aria-controls="more-sheet"
          >
            <MoreHorizontal size={24} strokeWidth={1.8} />
            <span>더보기</span>
          </button>
        </div>
      </nav>
    </>
  );
}
