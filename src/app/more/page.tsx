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
  Sprout,
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
  ArrowRight,
  Info,
  type LucideIcon,
} from "lucide-react";
import { Icon as IconWrap } from "@/components/ui/icon";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import s from "./page.module.css";

/* ── 그룹 데이터 (header.tsx navGroups와 동기) ── */

interface NavChild {
  href: string;
  label: string;
  desc: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  children: NavChild[];
}

const navGroups: NavGroup[] = [
  {
    label: "지역",
    children: [
      {
        href: "/regions",
        label: "지역 탐색",
        desc: "시·도별 기후·인구·작물 정보",
        icon: MapPin,
      },
      {
        href: "/regions/compare",
        label: "지역 비교",
        desc: "최대 3개 지역 비교 분석",
        icon: GitCompareArrows,
      },
    ],
  },
  {
    label: "작물",
    children: [
      {
        href: "/crops",
        label: "작물 정보",
        desc: "재배 난이도·수익성·적합 기후",
        icon: Sprout,
      },
      {
        href: "/crops/compare",
        label: "작물 비교",
        desc: "최대 3종 작물 비교",
        icon: GitCompareArrows,
      },
    ],
  },
  {
    label: "준비하기",
    children: [
      {
        href: "/guide",
        label: "귀농 로드맵",
        desc: "5단계 귀농 준비 가이드",
        icon: Map,
      },
      {
        href: "/costs",
        label: "비용 가이드",
        desc: "연령·작물별 비용 분석 & 지원금",
        icon: Wallet,
      },
      {
        href: "/interviews",
        label: "귀농인 이야기",
        desc: "실제 귀농인 인터뷰",
        icon: Users,
      },
    ],
  },
  {
    label: "지원·교육",
    children: [
      {
        href: "/programs",
        label: "지원사업",
        desc: "귀농·귀촌 지원금 & 정책",
        icon: FileText,
      },
      {
        href: "/programs/roadmap",
        label: "정부사업 가이드",
        desc: "4대 사업 신청 절차 안내",
        icon: Route,
      },
      {
        href: "/education",
        label: "교육 프로그램",
        desc: "온·오프라인 귀농 교육",
        icon: GraduationCap,
      },
      {
        href: "/events",
        label: "체험·행사",
        desc: "현장 체험 & 박람회 일정",
        icon: CalendarDays,
      },
    ],
  },
  {
    label: "자료",
    children: [
      {
        href: "/stats/population",
        label: "통계",
        desc: "귀농 인구·청년·만족도 추이",
        icon: BarChart3,
      },
      {
        href: "/glossary",
        label: "농업 용어집",
        desc: "처음 만나는 농업 용어 해설",
        icon: BookOpen,
      },
    ],
  },
];

export default function MorePage() {
  return (
    <div className={s.page}>
      <h1 className={s.title}>더보기</h1>

      {/* 유형 진단 CTA */}
      <Link href="/match" className={s.ctaBanner}>
        <div className={s.ctaLeft}>
          <IconWrap icon={Compass} size="xl" />
          <div className={s.ctaText}>
            <span className={s.ctaLabel}>귀농 유형 진단</span>
            <span className={s.ctaDesc}>
              3분이면 나에게 맞는 귀농 유형을 알 수 있어요
            </span>
          </div>
        </div>
        <IconWrap icon={ArrowRight} size="lg" className={s.ctaArrow} />
      </Link>

      {/* 5그룹 네비게이션 */}
      <nav aria-label="전체 메뉴">
        {navGroups.map((group) => (
          <section key={group.label} className={s.group}>
            <h2 className={s.groupLabel}>{group.label}</h2>
            <div className={s.groupItems}>
              {group.children.map((child) => {
                const Icon = child.icon;
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={s.menuItem}
                  >
                    <div className={s.menuIcon}>
                      <Icon size={20} strokeWidth={1.75} />
                    </div>
                    <div className={s.menuText}>
                      <span className={s.menuLabel}>{child.label}</span>
                      <span className={s.menuDesc}>
                        <AutoGlossary text={child.desc} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>

      {/* 서비스 소개 — 하단 분리 */}
      <Link href="/about" className={s.aboutLink}>
        <IconWrap icon={Info} size="md" />
        <span>서비스 소개</span>
      </Link>
    </div>
  );
}
