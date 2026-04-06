"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MapPin,
  FileText,
  Compass,
  MoreHorizontal,
} from "lucide-react";
import s from "./mobile-nav.module.css";

// ─── 하단 탭 (4개 + 더보기) ───

const tabs = [
  { href: "/", label: "홈", icon: Home },
  { href: "/regions", label: "지역", icon: MapPin },
  { href: "/match", label: "맞춤추천", icon: Compass },
  { href: "/programs", label: "지원사업", icon: FileText },
];

// 더보기 페이지에서 활성 표시할 경로 목록
const morePaths = [
  "/more",
  "/assess",
  "/crops",
  "/education",
  "/events",
  "/interviews",
  "/stats",
  "/about",
];

export function MobileNav() {
  const pathname = usePathname();

  const isMoreActive = morePaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
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
            >
              <Icon size={24} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{tab.label}</span>
            </Link>
          );
        })}

        {/* 더보기 — 별도 페이지로 이동 */}
        <Link
          href="/more"
          className={`${s.tab} ${isMoreActive ? s.active : ""}`}
        >
          <MoreHorizontal size={24} strokeWidth={isMoreActive ? 2.2 : 1.8} />
          <span>더보기</span>
        </Link>
      </div>
    </nav>
  );
}
