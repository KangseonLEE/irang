"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/regions", label: "지역비교" },
  { href: "/programs", label: "지원사업" },
  { href: "/crops", label: "작물정보" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">이랑</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            귀농 정보 큐레이션
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors duration-150",
                  "hover:bg-secondary hover:text-primary rounded-md",
                  isActive
                    ? "text-primary after:absolute after:bottom-[-13px] after:left-0 after:h-0.5 after:w-full after:bg-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
            aria-label="검색"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
            aria-label="즐겨찾기"
          >
            <Heart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
