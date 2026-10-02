/**
 * QuickLinkSection — "자주 찾는 서비스" 아이콘 8종 (2026-09-07 회장 결재: 히어로 밖 별도 섹션)
 *
 * - 아이콘 행만 가운데 정렬(10/2 회장: 제목·설명 멘트 제거, h2 는 sr-only 로 유지).
 *   모바일 4×2 그리드, 768+ 한 줄 8개.
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
      {/* 10/2 회장: 제목·설명 멘트는 화면에서 걷고 아이콘 행만 가운데 — 섹션 이름은 스크린리더에만 남긴다 */}
      <h2 id="quick-link-title" className={s.srOnly}>
        자주 찾는 서비스
      </h2>

      <ul className={s.track} aria-label="자주 찾는 서비스 바로 가기">
        {QUICK_LINK_ITEMS.map(({ id, href, label, icon: Icon }) => (
          <li key={id} className={s.item} data-reveal-item>
            <Link
              href={href}
              className={s.link}
              data-track={`quick_link:${id}`}
              prefetch={false}
            >
              {/* 아이템 내부 3단 등장 (9/29) — 아이콘(1) → 라벨(2). 본문이 없어 2단까지만 */}
              <span className={s.tile} aria-hidden="true" data-reveal-part="1">
                <Icon size={26} strokeWidth={1.75} />
              </span>
              <span className={s.label} data-reveal-part="2">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
      </div>
    </section>
  );
}
