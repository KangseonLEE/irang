import Link from "next/link";
import {
  Sprout,
  GraduationCap,
  CalendarDays,
  Users,
  BarChart3,
  Info,
  type LucideIcon,
} from "lucide-react";
import s from "./page.module.css";

interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
  desc: string;
}

const menuItems: MenuItem[] = [
  {
    href: "/crops",
    label: "작물정보",
    icon: Sprout,
    desc: "17종 작물의 난이도·수익성 비교",
  },
  {
    href: "/education",
    label: "교육",
    icon: GraduationCap,
    desc: "귀농·귀촌 교육 프로그램",
  },
  {
    href: "/events",
    label: "체험·행사",
    icon: CalendarDays,
    desc: "농촌 체험·박람회 일정",
  },
  {
    href: "/interviews",
    label: "귀농인 이야기",
    icon: Users,
    desc: "실제 귀농인 인터뷰",
  },
  {
    href: "/stats/population",
    label: "통계",
    icon: BarChart3,
    desc: "귀농·귀촌 인구 통계",
  },
  {
    href: "/about",
    label: "서비스 소개",
    icon: Info,
    desc: "이랑 서비스 안내",
  },
];

export default function MorePage() {
  return (
    <div className={s.page}>
      <h1 className={s.title}>더보기</h1>

      <nav className={s.menu} aria-label="전체 메뉴">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={s.menuItem}>
              <div className={s.menuIcon}>
                <Icon size={20} />
              </div>
              <div className={s.menuText}>
                <span className={s.menuLabel}>{item.label}</span>
                <span className={s.menuDesc}>{item.desc}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
