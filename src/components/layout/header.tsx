"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { IrangSymbol } from "@/components/brand/irang-symbol";
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

  return (
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

        {/* Right Actions — 데스크탑 CTA */}
        <div className={s.actions}>
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
  );
}
