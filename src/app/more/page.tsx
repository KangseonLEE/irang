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
  ChevronRight,
  Info,
  type LucideIcon,
} from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import s from "./page.module.css";

/* ── 상단 퀵 메뉴 (핵심 4가지) ── */

interface QuickItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const quickItems: QuickItem[] = [
  { href: "/assess", label: "준비도 진단", icon: ClipboardCheck },
  { href: "/match", label: "유형 매칭", icon: Compass },
  { href: "/regions", label: "지역 탐색", icon: MapPin },
  { href: "/programs", label: "지원사업", icon: FileText },
];

/* ── 하단 리스트 메뉴 ── */

interface MenuItem {
  href: string;
  label: string;
  desc: string;
  icon: LucideIcon;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: "지역·작물",
    items: [
      { href: "/regions", label: "지역 탐색", desc: "시·도별 기후·인구·작물 정보", icon: MapPin },
      { href: "/regions/compare", label: "지역 비교", desc: "최대 3개 지역 비교 분석", icon: GitCompareArrows },
      { href: "/crops", label: "작물 정보", desc: "재배 난이도·수익성·적합 기후", icon: Sprout },
      { href: "/crops/compare", label: "작물 비교", desc: "최대 3종 작물 비교", icon: GitCompareArrows },
    ],
  },
  {
    label: "준비하기",
    items: [
      { href: "/guide", label: "귀농 로드맵", desc: "5단계 귀농 준비 가이드", icon: Map },
      { href: "/costs", label: "비용 가이드", desc: "연령·작물별 비용 분석 & 지원금", icon: Wallet },
      { href: "/interviews", label: "귀농인 이야기", desc: "실제 귀농인 인터뷰", icon: Users },
    ],
  },
  {
    label: "지원·교육",
    items: [
      { href: "/programs", label: "지원사업", desc: "귀농·귀촌 지원금 & 정책", icon: FileText },
      { href: "/programs/roadmap", label: "정부사업 가이드", desc: "4대 사업 신청 절차 안내", icon: Route },
      { href: "/education", label: "교육 프로그램", desc: "온·오프라인 귀농 교육", icon: GraduationCap },
      { href: "/events", label: "체험·행사", desc: "현장 체험 & 박람회 일정", icon: CalendarDays },
    ],
  },
  {
    label: "자료",
    items: [
      { href: "/stats/population", label: "통계", desc: "귀농 인구·청년·만족도 추이", icon: BarChart3 },
      { href: "/glossary", label: "농업 용어집", desc: "처음 만나는 농업 용어 해설", icon: BookOpen },
    ],
  },
];

export default function MorePage() {
  return (
    <div className={s.page}>
      <h1 className={s.title}>전체 서비스</h1>

      {/* 퀵 메뉴 — 개별 카드 4개 그리드 */}
      <section className={s.quickSection}>
        <h2 className={s.quickSectionLabel}>첫걸음</h2>
        <div className={s.quickGrid}>
          {quickItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={s.quickItem}>
                <Icon size={24} strokeWidth={1.75} className={s.quickIcon} />
                <span className={s.quickLabel}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 리스트 메뉴 */}
      <nav aria-label="전체 메뉴" className={s.nav}>
        {menuGroups.map((group) => (
          <section key={group.label} className={s.group}>
            <h2 className={s.groupLabel}>{group.label}</h2>
            <div className={s.listItems}>
              {group.items.map((item) => {
                const Icon = item.icon;
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

      {/* 서비스 소개 */}
      <Link href="/about" className={s.aboutLink}>
        <Info size={16} strokeWidth={1.75} />
        <span>서비스 소개</span>
      </Link>
    </div>
  );
}
