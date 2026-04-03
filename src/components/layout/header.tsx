"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Heart } from "lucide-react";
import { IrangSymbol } from "@/components/brand/irang-symbol";
import { BookmarkList } from "@/components/bookmark/bookmark-list";
import { useBookmarks } from "@/lib/hooks/use-bookmarks";
import s from "./header.module.css";

const navItems = [
  { href: "/regions", label: "지역탐색" },
  { href: "/programs", label: "지원사업" },
  { href: "/education", label: "교육" },
  { href: "/events", label: "체험·행사" },
  { href: "/crops", label: "작물정보" },
];

export function Header() {
  const pathname = usePathname();
  const [bookmarkOpen, setBookmarkOpen] = useState(false);
  const { count, mounted } = useBookmarks();

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
            <IrangSymbol size={26} />
            <span className={s.logoText}>
              이랑
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className={s.nav}
            aria-label="주요 메뉴"
          >
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`${s.navLink} ${isActive ? s.active : ""}`}
                >
                  {item.label}
                </Link>
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
              맞춤 추천
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>
      <BookmarkList open={bookmarkOpen} onClose={() => setBookmarkOpen(false)} />
    </>
  );
}
