/**
 * QuickLinkSection — "자주 찾는 서비스" 아이콘 8종 (2026-09-07 회장 결재: 히어로 밖 별도 섹션)
 *
 * - 좌측 제목 블록 + 우측 아이콘 행(1024+), 모바일은 제목 위·아이콘 가로 스냅 스크롤.
 * - 순서는 GNB 여정(탐색 → 비교·진단 → 준비 → 신청). 항목을 바꾸면 navigation.ts 와 맞출 것.
 * - Server Component: 전부 <Link> 라 SSR HTML 에 내부 링크 8개가 항상 남는다.
 * - 계측: data-track="quick_link:{id}" → LandingClickTracker 가 landing_cta_click 으로 수집.
 *   섹션 노출은 page.tsx 의 <ScrollReveal trackId="quick_link">.
 * - 아이콘은 lucide 전용(브랜드 규칙) — 참고 포털의 컬러 아이콘은 그린 팔레트로 번역.
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
import s from "./quick-link-section.module.css";

interface QuickItem {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
}

export const QUICK_LINK_ITEMS: readonly QuickItem[] = [
  { id: "regions", href: "/regions", label: "지역 탐색", icon: Map },
  { id: "crops", href: "/crops", label: "작물 정보", icon: IrangSprout },
  { id: "compare", href: "/regions/compare", label: "지역 비교", icon: GitCompareArrows },
  { id: "assess", href: "/match", label: "유형 진단", icon: ScanSearch },
  { id: "ranking", href: "/regions/ranking", label: "맞춤 시군구", icon: ListOrdered },
  { id: "costs", href: "/costs", label: "비용 가이드", icon: Calculator },
  { id: "programs", href: "/programs", label: "지원사업", icon: HandCoins },
  { id: "guide", href: "/guide", label: "정착 로드맵", icon: Signpost },
] as const;

export function QuickLinkSection() {
  return (
    <section className={s.section} aria-labelledby="quick-link-title">
      <div className={s.inner}>
      <div className={s.intro}>
        <p className={s.eyebrow}>QUICK LINK</p>
        <h2 id="quick-link-title" className={s.title}>
          자주 찾는 서비스
        </h2>
        <p className={s.desc}>준비하는 순서대로 모아 뒀어요</p>
      </div>

      <ul className={s.track} aria-label="자주 찾는 서비스 바로 가기">
        {QUICK_LINK_ITEMS.map(({ id, href, label, icon: Icon }) => (
          <li key={id} className={s.item}>
            <Link
              href={href}
              className={s.link}
              data-track={`quick_link:${id}`}
              prefetch={false}
            >
              <span className={s.tile} aria-hidden="true">
                <Icon size={26} strokeWidth={1.75} />
              </span>
              <span className={s.label}>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
      </div>
    </section>
  );
}
