import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이랑 전체 메뉴 — 농촌 정착 정보 모아보기",
  description:
    "이랑의 모든 서비스를 한눈에 확인하세요. 지역탐색, 작물정보, 정착 로드맵, 비용 가이드, 교육, 체험행사, 통계를 모았어요.",
  alternates: { canonical: "/more" },
};

import {
  MapPin,
  Building2,
  GitCompareArrows,
  Wallet,
  Users,
  FileText,
  FileCheck,
  Route,
  Home,
  GraduationCap,
  CalendarDays,
  BarChart3,
  BookOpen,
  Compass,
  ChevronRight,
  Info,
  Trophy,
  Heart,
  type LucideIcon,
} from "lucide-react";
import { IrangSprout as Sprout } from "@/lib/icons/irang-sprout";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { NAV_GROUPS } from "@/lib/data/navigation";
import s from "./page.module.css";

/**
 * 메뉴 SSOT(`@/lib/data/navigation`)의 iconName 문자열 → 실제 아이콘 컴포넌트.
 * 매핑을 이 파일에 두는 이유: lib 은 UI 를 참조할 수 없고(레이어 경계),
 * 헤더 번들에 아이콘 20여 개가 딸려 들어가는 것도 막아야 하기 때문.
 */
const ICONS: Record<string, LucideIcon> = {
  MapPin,
  Building2,
  GitCompareArrows,
  Wallet,
  Users,
  FileText,
  FileCheck,
  Route,
  Home,
  GraduationCap,
  CalendarDays,
  BarChart3,
  BookOpen,
  Compass,
  Info,
  Trophy,
  Heart,
  Sprout,
};

/* ── 상단 퀵 메뉴 (여정 순 5가지) ── */

interface QuickItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const quickItems: QuickItem[] = [
  { href: "/regions", label: "지역탐색", icon: MapPin },
  { href: "/match", label: "유형진단", icon: Compass },
  { href: "/guide", label: "정착로드맵", icon: Route },
  { href: "/costs", label: "비용가이드", icon: Wallet },
  { href: "/programs", label: "지원사업", icon: FileText },
];

/* ── 하단 리스트 메뉴 — 헤더 GNB 와 같은 SSOT ── */

const menuGroups = NAV_GROUPS;

export default function MorePage() {
  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[{ name: "전체 메뉴", href: "/more" }]} />
      <h1 className={s.title}>전체 서비스</h1>

      {/* 퀵 메뉴 — 개별 카드 4개 그리드 */}
      <div className={s.quickGrid}>
        {quickItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={s.quickItem}>
              <Icon size={20} strokeWidth={1.75} className={s.quickIcon} />
              <span className={s.quickLabel}>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* 리스트 메뉴 */}
      <nav aria-label="전체 메뉴" className={s.nav}>
        {menuGroups.map((group) => (
          <section key={group.id} className={s.group}>
            <h2 className={s.groupLabel}>{group.label}</h2>
            <div className={s.listItems}>
              {group.items.map((item) => {
                const Icon = ICONS[item.iconName] ?? Info;
                return (
                  <Link key={item.href} href={item.href} className={s.listItem}>
                    <div className={s.listIcon}>
                      <Icon size={20} strokeWidth={1.75} />
                    </div>
                    <div className={s.listText}>
                      <span className={s.listLabel}>{item.label}</span>
                      <span className={s.listDesc}>{item.desc}</span>
                    </div>
                    <ChevronRight size={16} className={s.listArrow} />
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>

    </div>
  );
}
