"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, FileText, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "홈", icon: Home },
  { href: "/regions", label: "지역비교", icon: MapPin },
  { href: "/programs", label: "지원사업", icon: FileText },
  { href: "/crops", label: "작물", icon: Sprout },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden">
      <div className="flex h-14 items-center justify-around pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname === tab.href || pathname.startsWith(tab.href + "/");
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex min-w-[64px] flex-col items-center justify-center gap-0.5 py-1 text-[11px]",
                "transition-colors duration-150",
                isActive
                  ? "font-medium text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-6 w-6" strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
