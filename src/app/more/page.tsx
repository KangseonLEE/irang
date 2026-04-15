import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "더보기",
  description:
    "이랑의 모든 서비스를 한눈에 확인하세요. 지역탐색, 작물정보, 귀농 로드맵, 비용 가이드, 교육, 체험행사, 통계 등.",
};

import {
  MapPin,
  GitCompareArrows,
  Map,
  Wallet,
  Users,
  FileText,
  Route,
  GraduationCap,
  CalendarDays,
  BarChart3,
  BookOpen,
  Compass,
  ClipboardCheck,
  ArrowRight,
  Info,
  type LucideIcon,
} from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import s from "./page.module.css";

/* ── 그리드 아이템 데이터 ── */

interface GridItem {
  href: string;
  label: string;
  icon: LucideIcon;
  color: string; // 아이콘 배경 색상
}

interface GridGroup {
  label: string;
  items: GridItem[];
}

const gridGroups: GridGroup[] = [
  {
    label: "진단·추천",
    items: [
      { href: "/assess", label: "준비도 진단", icon: ClipboardCheck, color: "#1B6B5A" },
      { href: "/match", label: "유형 매칭", icon: Compass, color: "#0E7490" },
    ],
  },
  {
    label: "지역·작물",
    items: [
      { href: "/regions", label: "지역 탐색", icon: MapPin, color: "#DC2626" },
      { href: "/regions/compare", label: "지역 비교", icon: GitCompareArrows, color: "#7C3AED" },
      { href: "/crops", label: "작물 정보", icon: Sprout, color: "#16A34A" },
      { href: "/crops/compare", label: "작물 비교", icon: GitCompareArrows, color: "#059669" },
    ],
  },
  {
    label: "준비하기",
    items: [
      { href: "/guide", label: "귀농 로드맵", icon: Map, color: "#2563EB" },
      { href: "/costs", label: "비용 가이드", icon: Wallet, color: "#D97706" },
      { href: "/interviews", label: "귀농인 이야기", icon: Users, color: "#9333EA" },
    ],
  },
  {
    label: "지원·교육",
    items: [
      { href: "/programs", label: "지원사업", icon: FileText, color: "#0891B2" },
      { href: "/programs/roadmap", label: "사업 가이드", icon: Route, color: "#4F46E5" },
      { href: "/education", label: "교육 과정", icon: GraduationCap, color: "#EA580C" },
      { href: "/events", label: "체험·행사", icon: CalendarDays, color: "#DB2777" },
    ],
  },
  {
    label: "자료",
    items: [
      { href: "/stats/population", label: "통계", icon: BarChart3, color: "#6366F1" },
      { href: "/glossary", label: "용어집", icon: BookOpen, color: "#78716C" },
    ],
  },
];

export default function MorePage() {
  return (
    <div className={s.page}>
      <h1 className={s.title}>전체 서비스</h1>

      {/* 그리드 네비게이션 */}
      <nav aria-label="전체 메뉴" className={s.nav}>
        {gridGroups.map((group) => (
          <section key={group.label} className={s.group}>
            <h2 className={s.groupLabel}>{group.label}</h2>
            <div className={s.grid}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={s.gridItem}
                  >
                    <div
                      className={s.gridIcon}
                      style={{ background: item.color }}
                    >
                      <Icon size={22} strokeWidth={1.75} color="#fff" />
                    </div>
                    <span className={s.gridLabel}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>

      {/* 서비스 소개 */}
      <Link href="/about" className={s.aboutLink}>
        <Info size={16} strokeWidth={1.75} />
        <span>서비스 소개</span>
      </Link>
    </div>
  );
}
