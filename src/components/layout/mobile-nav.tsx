"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, FileText, Sprout } from "lucide-react";
import styles from "./mobile-nav.module.css";

const tabs = [
  { href: "/", label: "홈", icon: Home },
  { href: "/regions", label: "지역탐색", icon: MapPin },
  { href: "/programs", label: "지원사업", icon: FileText },
  { href: "/crops", label: "작물", icon: Sprout },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
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
              className={`${styles.tab} ${isActive ? styles.active : ""}`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
