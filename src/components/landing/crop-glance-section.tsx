/**
 * 홈 "작물 한눈에" 섹션 — Server Component (클라이언트 훅 없음).
 * 정적 작물 데이터에서 10a당 연소득 TOP N을 산출해 컬리식 이미지 카드로 노출하고,
 * /crops 정렬·필터 딥링크 2종으로 연결한다.
 *
 * ⚠️ SSR-safe: "use client" 없음 → SSR HTML에 작물명·수익·h2·<img>가 항상 포함된다.
 *    홈 히어로의 useSearchParams bailout과 무관(검색창만 Suspense 격리).
 * ⚠️ 작물 이미지는 반드시 일러스트 webp (getCropImageSrc → /crops/illustrations/{id}.webp).
 *    사진 톤 금지 (메모리 박제 feedback_crop_image_illustration_rule_2026-05-21).
 */
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, TrendingUp, Sprout } from "lucide-react";
import { CROPS, CROP_DETAILS } from "@/lib/data/crops";
import { parseIncome10a } from "@/app/crops/crop-aggregate";
import { getCropImageSrc } from "@/lib/crop-image";
import s from "./crop-glance-section.module.css";

const TOP_N = 6;
const IMG_SIZES = "(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw";

/** 빌드 타임 1회 산출 — 10a당 연소득 내림차순 TOP N. */
const detailById = new Map(CROP_DETAILS.map((d) => [d.id, d]));

const TOP_CROPS = CROPS.map((crop) => {
  const detail = detailById.get(crop.id);
  const income = detail ? parseIncome10a(detail.income.revenueRange) : null;
  return { id: crop.id, name: crop.name, income };
})
  .filter((c): c is { id: string; name: string; income: number } => c.income !== null)
  .sort((a, b) => b.income - a.income)
  .slice(0, TOP_N);

function formatIncome(income: number) {
  return income.toLocaleString("ko-KR");
}

export function CropGlanceSection() {
  const [first, second, third, ...rest] = TOP_CROPS;

  return (
    <section className={s.section} aria-label="작물 한눈에">
      <div className={s.header}>
        <div className={s.heading}>
          <span className={s.eyebrow}>#수익 TOP 작물</span>
          <h2 className={s.title}>
            돈 되는 작물, <em>한눈에</em>
          </h2>
          <p className={s.sub}>10a당 연소득이 높은 작물부터 정리했어요</p>
        </div>
        <Link href="/crops" className={s.headerLink}>
          전체 작물 <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <div className={s.grid}>
        {/* 1위 — 히어로 카드 (이미지 + 텍스트 분리) */}
        <Link href={`/crops/${first.id}`} className={s.heroCard}>
          <div className={s.heroMedia}>
            <Image
              src={getCropImageSrc(first.id)}
              alt={first.name}
              fill
              priority
              quality={70}
              sizes={IMG_SIZES}
              className={s.heroImg}
              style={{ objectFit: "contain" }}
            />
            <span className={s.heroBadge}>수익 1위</span>
            <span className={s.heroScrim} aria-hidden="true" />
          </div>
          <div className={s.heroBody}>
            <h3 className={s.heroName}>{first.name}</h3>
            <span className={s.heroValue}>
              {formatIncome(first.income)}
              <span className={s.heroUnit}>만원</span>
            </span>
            <span className={s.heroNote}>10a당 연소득</span>
          </div>
        </Link>

        {/* 2·3위 — 이미지 카드 */}
        {[second, third].map((crop, i) => (
          <Link key={crop.id} href={`/crops/${crop.id}`} className={s.statCard}>
            <div className={s.statMedia}>
              <Image
                src={getCropImageSrc(crop.id)}
                alt={crop.name}
                fill
                quality={70}
                sizes={IMG_SIZES}
                className={s.statImg}
                style={{ objectFit: "contain" }}
              />
              <span className={s.statBadge} aria-hidden="true">
                {i + 2}
              </span>
            </div>
            <div className={s.statBody}>
              <h3 className={s.statName}>{crop.name}</h3>
              <span className={s.statValue}>
                {formatIncome(crop.income)}
                <span className={s.statUnit}>만원</span>
              </span>
            </div>
          </Link>
        ))}

        {/* 4~6위 — 섬네일 목록 */}
        <div className={s.listCard}>
          <span className={s.listCaption}>이어지는 순위</span>
          <ul className={s.list}>
            {rest.map((crop, i) => (
              <li key={crop.id}>
                <Link href={`/crops/${crop.id}`} className={s.listItem}>
                  <span className={s.listThumb}>
                    <Image
                      src={getCropImageSrc(crop.id)}
                      alt={crop.name}
                      fill
                      quality={70}
                      sizes="48px"
                      className={s.listImg}
                      style={{ objectFit: "contain" }}
                    />
                  </span>
                  <span className={s.listRank} aria-hidden="true">
                    {i + 4}
                  </span>
                  <span className={s.listName}>{crop.name}</span>
                  <span className={s.listValue}>{formatIncome(crop.income)}만원</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 딥링크 2종 */}
      <div className={s.links}>
        <Link href="/crops?sort=income" className={s.deepLink}>
          <TrendingUp size={16} aria-hidden="true" />
          수익순으로 보기
          <ArrowRight size={15} className={s.deepArrow} aria-hidden="true" />
        </Link>
        <Link href="/crops?difficulty=쉬움" className={s.deepLink}>
          <Sprout size={16} aria-hidden="true" />
          처음 해도 괜찮은 작물
          <ArrowRight size={15} className={s.deepArrow} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
