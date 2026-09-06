/**
 * HeroQuickMenu — 히어로 검색바 아래 아이콘 퀵메뉴 8종 (2026-09-07 회장 결재)
 *
 * - 순서는 GNB 여정(탐색 → 비교·진단 → 준비 → 신청)과 같다. 항목을 바꾸면 navigation.ts 와 맞출 것.
 * - Server Component: 전부 <Link> 라 SSR HTML 에 내부 링크 8개가 항상 남는다.
 * - 계측: data-track="hero_quick:{id}" → LandingClickTracker 가 landing_cta_click 으로 수집.
 * - 모바일은 가로 스냅 스크롤(4.5개 노출), 768+ 는 한 줄 8개. 아이콘은 lucide 전용(브랜드 규칙).
 */

import Link from "next/link";
import {
  Map,
  GitCompareArrows,
  ScanSearch,
  ListOrdered,
  Calculator,
  HandCoins,
  Signpost,
  type LucideIcon,
} from "lucide-react";
import { IrangSprout } from "@/lib/icons/irang-sprout";
import s from "./hero-quick-menu.module.css";

interface QuickItem {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
}

export const HERO_QUICK_ITEMS: readonly QuickItem[] = [
  { id: "regions", href: "/regions", label: "지역 탐색", icon: Map },
  { id: "crops", href: "/crops", label: "작물 정보", icon: IrangSprout },
  { id: "compare", href: "/regions/compare", label: "지역 비교", icon: GitCompareArrows },
  { id: "assess", href: "/match", label: "유형 진단", icon: ScanSearch },
  { id: "ranking", href: "/regions/ranking", label: "내 조건 순위", icon: ListOrdered },
  { id: "costs", href: "/costs", label: "비용 가이드", icon: Calculator },
  { id: "programs", href: "/programs", label: "지원사업", icon: HandCoins },
  { id: "guide", href: "/guide", label: "정착 로드맵", icon: Signpost },
] as const;

export function HeroQuickMenu() {
  return (
    <nav className={s.root} aria-label="바로 가기">
      <ul className={s.track}>
        {HERO_QUICK_ITEMS.map(({ id, href, label, icon: Icon }) => (
          <li key={id} className={s.item}>
            <Link
              href={href}
              className={s.link}
              data-track={`hero_quick:${id}`}
              prefetch={false}
            >
              <span className={s.tile} aria-hidden="true">
                <Icon size={24} strokeWidth={1.75} />
              </span>
              <span className={s.label}>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
