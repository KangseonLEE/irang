/**
 * 홈 "작물 한눈에" 섹션 — Server Component (클라이언트 훅 없음).
 * 정적 작물 데이터에서 10a당 연소득 TOP N을 산출해 칩으로 노출하고,
 * /crops 정렬·필터 딥링크 2종으로 연결한다.
 *
 * ⚠️ SSR-safe: "use client" 없음 → SSR HTML에 작물명·h2가 항상 포함된다.
 *    홈 히어로의 useSearchParams bailout과 무관(검색창만 Suspense 격리).
 */
import Link from "next/link";
import { ArrowRight, TrendingUp, Sprout } from "lucide-react";
import { CROPS, CROP_DETAILS } from "@/lib/data/crops";
import { parseIncome10a } from "@/app/crops/crop-aggregate";
import s from "./crop-glance-section.module.css";

const TOP_N = 6;

/** 빌드 타임 1회 산출 — 10a당 연소득 내림차순 TOP N. */
const detailById = new Map(CROP_DETAILS.map((d) => [d.id, d]));

const TOP_CROPS = CROPS.map((crop) => {
  const detail = detailById.get(crop.id);
  const income = detail ? parseIncome10a(detail.income.revenueRange) : null;
  return { id: crop.id, name: crop.name, emoji: crop.emoji, income };
})
  .filter((c): c is { id: string; name: string; emoji: string; income: number } =>
    c.income !== null,
  )
  .sort((a, b) => b.income - a.income)
  .slice(0, TOP_N);

export function CropGlanceSection() {
  return (
    <section className={s.section} aria-label="작물 한눈에">
      <div className={s.header}>
        <div className={s.heading}>
          <span className={s.eyebrow}>#작물 비교</span>
          <h2 className={s.title}>
            돈 되는 작물, <em>한눈에</em>
          </h2>
          <p className={s.sub}>10a당 연소득이 높은 작물부터 정리했어요</p>
        </div>
        <Link href="/crops" className={s.headerLink}>
          전체 작물 <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <ul className={s.chips}>
        {TOP_CROPS.map((crop, i) => (
          <li key={crop.id}>
            <Link href={`/crops/${crop.id}`} className={s.chip}>
              <span className={s.rank} aria-hidden="true">
                {i + 1}
              </span>
              <span className={s.chipEmoji} aria-hidden="true">
                {crop.emoji}
              </span>
              <span className={s.chipName}>{crop.name}</span>
              <span className={s.chipIncome}>
                {crop.income.toLocaleString("ko-KR")}만원
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className={s.ctas}>
        <Link href="/crops?sort=income" className={s.cta}>
          <span className={s.ctaIcon} aria-hidden="true">
            <TrendingUp size={18} />
          </span>
          <span className={s.ctaText}>
            <span className={s.ctaLabel}>수익순으로 보기</span>
            <span className={s.ctaDesc}>연소득 높은 순서대로</span>
          </span>
          <ArrowRight size={16} className={s.ctaArrow} aria-hidden="true" />
        </Link>
        <Link href="/crops?difficulty=쉬움" className={s.cta}>
          <span className={s.ctaIcon} aria-hidden="true">
            <Sprout size={18} />
          </span>
          <span className={s.ctaText}>
            <span className={s.ctaLabel}>초보에게 쉬운 작물</span>
            <span className={s.ctaDesc}>난이도 낮은 것부터</span>
          </span>
          <ArrowRight size={16} className={s.ctaArrow} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
