/**
 * 홈 "작물" 섹션 — Server Component (클라이언트 훅 없음).
 * 컬리 "카테고리 랭킹" 패턴 — 10a당 연소득 TOP N을 균등 가로 카드 그리드로 노출하고,
 * /crops 정렬·필터 딥링크 2종으로 연결한다.
 *
 * ⚠️ SSR-safe: "use client" 없음 → SSR HTML에 작물명·수익·h2·<img>가 항상 포함된다.
 *    홈 히어로의 useSearchParams bailout과 무관(검색창만 Suspense 격리, 6/1 박제).
 * ⚠️ 작물 이미지는 반드시 일러스트 webp (getCropImageSrc → /crops/illustrations/{id}.webp).
 *    사진 톤 금지 (메모리 박제 feedback_crop_image_illustration_rule_2026-05-21).
 * ⚠️ 균등 그리드 — 데스크탑 3열×2행 / 태블릿 2열 / 모바일 1열(가로 카드). 히어로 크기 강조 폐기.
 */
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CROPS, CROP_DETAILS } from "@/lib/data/crops";
import { parseIncome10a } from "@/app/crops/crop-aggregate";
import { getCropImageSrc } from "@/lib/crop-image";
import s from "./crop-glance-section.module.css";

const TOP_N = 6;
/** 카드 이미지는 96px 고정 박스 — 1x/2x만 필요해 sizes를 96px로 고정. */
const IMG_SIZES = "96px";

/** 빌드 타임 1회 산출 — 10a당 연소득 내림차순 TOP N. */
const detailById = new Map(CROP_DETAILS.map((d) => [d.id, d]));

type TopCrop = {
  id: string;
  name: string;
  income: number;
  difficulty: (typeof CROPS)[number]["difficulty"];
  category: (typeof CROPS)[number]["category"];
};

const TOP_CROPS: TopCrop[] = CROPS.map((crop) => {
  const detail = detailById.get(crop.id);
  const income = detail ? parseIncome10a(detail.income.revenueRange) : null;
  return {
    id: crop.id,
    name: crop.name,
    income,
    difficulty: crop.difficulty,
    category: crop.category,
  };
})
  .filter((c): c is TopCrop => c.income !== null)
  .sort((a, b) => b.income - a.income)
  .slice(0, TOP_N);

function formatIncome(income: number) {
  return income.toLocaleString("ko-KR");
}

/** 난이도별 chip 색 클래스 — 쉬움(초록)·보통(앰버)·어려움(중립). /crops 컨벤션과 동일 톤. */
function difficultyChipClass(difficulty: TopCrop["difficulty"]): string {
  switch (difficulty) {
    case "쉬움":
      return s.chipEasy;
    case "보통":
      return s.chipMedium;
    case "어려움":
      return s.chipHard;
    default:
      return s.chipMedium;
  }
}

export function CropGlanceSection() {
  return (
    <section className={s.section} aria-label="작물">
      <div className={s.header}>
        <div className={s.heading}>
          <span className={s.eyebrow}>#수익 TOP 작물</span>
          <h2 className={s.title}>
            돈 되는 작물, <em>한눈에</em>
          </h2>
          <p className={s.sub}>연소득이 높은 작물부터 정리했어요</p>
        </div>
        <Link href="/crops" className={s.headerLink}>
          전체 작물 <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <div className={s.grid}>
        {TOP_CROPS.map((crop, i) => (
          <Link
            key={crop.id}
            href={`/crops/${crop.id}`}
            className={s.rankCard}
            data-rank={i + 1}
          >
            <span className={s.rankCardImage}>
              <span className={s.rankNumber} aria-hidden="true">
                {i + 1}
              </span>
              <Image
                src={getCropImageSrc(crop.id)}
                alt={crop.name}
                width={96}
                height={96}
                quality={70}
                sizes={IMG_SIZES}
                priority={i === 0}
                className={s.rankImg}
              />
            </span>
            <div className={s.rankCardBody}>
              <span className={s.cropName}>{crop.name}</span>
              <span className={s.cropIncome}>{formatIncome(crop.income)}만 원</span>
              {/* 10a = 1,000㎡ ≈ 302.5평 → 직관성 위해 "약 300평"으로 표기 (이 섹션 한정). */}
              <span className={s.cropIncomeLabel}>약 300평당 연소득</span>
              <span className={s.chipRow}>
                <span className={`${s.chip} ${difficultyChipClass(crop.difficulty)}`}>
                  {crop.difficulty}
                </span>
                <span className={`${s.chip} ${s.chipCategory}`}>{crop.category}</span>
              </span>
            </div>
          </Link>
        ))}

        {/* 딥링크 2종 — 그리드 하단 풀폭, 항상 가로 2열, 1줄 텍스트 */}
        <div className={s.links}>
          <Link href="/crops?sort=income" className={s.deepLink}>
            <span className={s.deepLinkTitle}>수익 높은 작물</span>
            <ArrowRight size={15} className={s.deepArrow} aria-hidden="true" />
          </Link>
          <Link href="/crops?difficulty=쉬움" className={s.deepLink}>
            <span className={s.deepLinkTitle}>초보 추천 작물</span>
            <ArrowRight size={15} className={s.deepArrow} aria-hidden="true" />
          </Link>
          <p className={s.linksHint}>연소득순·난이도순으로 전체 작물을 둘러봐요</p>
        </div>
      </div>
    </section>
  );
}
