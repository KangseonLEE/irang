/**
 * 활성 지역 섹션 — /regions 페이지 지도 직후 마운트.
 *
 * 7종 카테고리(귀농 / 귀촌 / 청년농 / 귀산촌 / 스마트팜 / 치유농업 / 사회적 농업)별
 * Top 5 시군구를 큐레이션해서 보여준다. Server Component + Link 기반 탭으로
 * 자바스크립트 없이 동작한다.
 *
 * URL state:
 *   - ?active=jeonin | gwichon | youthFarm | gwisanchon | smartFarm | healing | socialFarm
 *   - 미지정 시 기본값 jeonin (귀농).
 *
 * 모바일 우선 — 탭은 가로 스크롤(scroll-snap), 카드는 1열(모바일) → 2열(640px+).
 */

import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";
import {
  ACTIVE_CATEGORIES,
  DEFAULT_ACTIVE_CATEGORY,
  getActiveCategory,
  type ActiveCategoryId,
} from "@/lib/data/active-regions";
import { Icon } from "@/components/ui/icon";
import s from "./active-regions-section.module.css";

interface ActiveRegionsSectionProps {
  /** ?active=... — 미지정 시 jeonin */
  activeId: string | undefined;
}

export function ActiveRegionsSection({ activeId }: ActiveRegionsSectionProps) {
  const current =
    getActiveCategory(activeId) ?? getActiveCategory(DEFAULT_ACTIVE_CATEGORY)!;

  return (
    <section className={s.section} aria-label="활동이 활발한 지역">
      <header className={s.header}>
        <h2 className={s.title}>지금 활발한 지역</h2>
        <p className={s.desc}>
          분야별로 귀농·귀촌이 가장 활발하게 일어나고 있는 곳이에요.
        </p>
      </header>

      {/* ── 카테고리 탭 (가로 스크롤) ── */}
      <div
        className={s.tabRow}
        role="tablist"
        aria-label="활성 지역 분류"
      >
        {ACTIVE_CATEGORIES.map((cat) => {
          const isActive = cat.id === current.id;
          // 기본 jeonin은 쿼리 없이 깔끔하게.
          const href =
            cat.id === DEFAULT_ACTIVE_CATEGORY
              ? "/regions#active-regions"
              : `/regions?active=${cat.id}#active-regions`;
          return (
            <Link
              key={cat.id}
              href={href}
              role="tab"
              aria-selected={isActive}
              scroll={false}
              className={`${s.tab} ${isActive ? s.tabActive : ""}`}
              prefetch={false}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>

      {/* anchor target — 탭 클릭 시 자기 자신으로 부드럽게 */}
      <span id="active-regions" className={s.anchorTarget} aria-hidden="true" />

      {/* ── 현재 카테고리 설명 ── */}
      <p className={s.currentDesc}>
        <span className={s.currentDescLead}>{current.label}</span>
        {" — "}
        {current.desc}
      </p>

      {/* ── Top 5 카드 그리드 ── */}
      <ol className={s.grid}>
        {current.regions.map((entry, idx) => (
          <li key={entry.sigunguId} className={s.cardItem}>
            <Link
              href={`/regions/${entry.sidoId}/${entry.sigunguId}`}
              className={s.card}
              prefetch={false}
            >
              <span className={s.rank}>{idx + 1}</span>
              <div className={s.cardBody}>
                <div className={s.cardTitleRow}>
                  <span className={s.cardSido}>{entry.sidoShort}</span>
                  <span className={s.cardName}>{entry.name}</span>
                </div>
                <span className={s.cardMetric}>{entry.metric}</span>
                <span className={s.cardNote}>{entry.note}</span>
              </div>
              <Icon icon={ChevronRight} size="sm" className={s.cardChevron} />
            </Link>
          </li>
        ))}
      </ol>

      {/* ── 출처 ── */}
      <p className={s.source}>
        <span className={s.sourceLabel}>출처</span>
        <a
          href={current.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className={s.sourceLink}
        >
          {current.sourceLabel}
          <Icon icon={ExternalLink} size="sm" className={s.sourceIcon} />
        </a>
        <span className={s.sourceMeta}>· {current.basisYear} 기준</span>
      </p>
    </section>
  );
}

// 외부에서 활성 카테고리 ID 타입 재export
export type { ActiveCategoryId };
