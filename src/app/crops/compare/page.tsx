import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Scale,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  Gauge,
  Calendar,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import {
  CROPS,
  getCropWithDetail,
  type CropInfo,
  type CropDetailInfo,
  type ProsConsCategory,
} from "@/lib/data/crops";
import { PROVINCES } from "@/lib/data/regions";
import { DataSource } from "@/components/ui/data-source";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { CropSelector } from "./crop-selector";
import { CropRadar } from "./crop-radar";
import { IncomeBars } from "./income-bars";
import { DesktopHint } from "@/components/ui/desktop-hint";
import { SwipeHint } from "@/components/ui/swipe-hint";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "귀농 작물 비교 — 소득·난이도·장단점 비교",
  description:
    "최대 3개 작물의 소득, 난이도, 재배 환경, 장단점을 나란히 비교하세요. 초보자 추천 작물부터 고소득 작물까지 선택에 도움이 돼요.",
  keywords: ["작물 비교", "귀농 작물 비교", "작물 소득 비교", "귀농 작물 선택"],
};

const DEFAULT_CROP_IDS: string[] = [];

interface PageProps {
  searchParams: Promise<{ ids?: string }>;
}

type CropWithDetail = CropInfo & { detail: CropDetailInfo };

// 난이도 색상
const DIFFICULTY_CLASS: Record<string, string> = {
  쉬움: s.difficultyEasy,
  보통: s.difficultyMedium,
  어려움: s.difficultyHard,
};

// 카테고리 라벨 (약���)
const CAT_LABEL: Record<ProsConsCategory, string> = {
  수익성: "수익성",
  재배난이도: "재배",
  시장성: "시장",
  안정성: "안정",
  생활: "생활",
  확장성: "확장",
};

const DIFFICULTY_RANK: Record<string, number> = { 쉬움: 1, 보통: 2, 어려움: 3 };

/** revenueRange 문자열에서 소득 숫자(만원) 추출 */
function parseIncome(revenueRange: string): { min: number; max: number } {
  // "10a당 약 57만 원" → 57
  // "10a당 약 95~125만 원" → { min: 95, max: 125 }
  // "10a당 약 548~705만 원 (노지~시설재배 기준)" → { min: 548, max: 705 }
  const numbers = revenueRange.match(/[\d,]+(?:\.\d+)?/g);
  if (!numbers || numbers.length === 0) return { min: 0, max: 0 };

  const parsed = numbers.map((n) => parseFloat(n.replace(/,/g, "")));
  // 10a당 앞의 "10"은 무시 — 보통 첫 숫자가 10이면 다음 숫자가 실제 소득
  const values = parsed.filter((v) => v !== 10);

  if (values.length === 0) return { min: 0, max: 0 };
  if (values.length === 1) return { min: values[0], max: values[0] };

  // 범위 표현: "95~125" → 두 수 추출. 큰 숫자(3000평 기준 등)는 제외
  // 보통 첫 두 숫자가 범위
  return { min: Math.min(values[0], values[1]), max: Math.max(values[0], values[1]) };
}

function buildComparisonSummary(crops: CropWithDetail[]): string {
  if (crops.length < 2) return "";

  const sorted = [...crops].sort(
    (a, b) => (DIFFICULTY_RANK[a.difficulty] ?? 2) - (DIFFICULTY_RANK[b.difficulty] ?? 2),
  );
  const easiest = sorted[0];
  const hardest = sorted[sorted.length - 1];

  const parts: string[] = [];

  if (easiest.difficulty !== hardest.difficulty) {
    parts.push(
      `안정적인 입문을 원한다면 ${easiest.emoji} ${easiest.name}(${easiest.difficulty})이 적합하고, 높은 수익을 목표로 기술 투자가 가능하다면 ${hardest.emoji} ${hardest.name}(${hardest.difficulty})을 고려해 보세요.`,
    );
  } else {
    parts.push(
      `${crops.map((c) => `${c.emoji} ${c.name}`).join(", ")} 모두 ${easiest.difficulty} 난이도예요.`,
    );
  }

  if (crops.length === 3) {
    const mid = sorted[1];
    if (mid.difficulty !== easiest.difficulty && mid.difficulty !== hardest.difficulty) {
      parts.push(
        `${mid.emoji} ${mid.name}은 난이도와 수익의 균형을 원하는 분에게 좋은 선택이에요.`,
      );
    }
  }

  return parts.join(" ");
}

export default async function CropComparePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedIds = params.ids
    ? params.ids.split(",").slice(0, 3)
    : DEFAULT_CROP_IDS;

  const crops: CropWithDetail[] = selectedIds
    .map((id) => getCropWithDetail(id))
    .filter((c): c is NonNullable<typeof c> => c != null);

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[
        { name: "작물 정보", href: "/crops" },
        { name: "작물 비교", href: "/crops/compare" },
      ]} />
      {/* 모바일 데스크톱 권장 안내 */}
      <DesktopHint message="작물 비교는 넓은 화면에서 더 잘 보여요" />

      {/* Back Link */}
      <Link href="/crops" className={s.backLink}>
        ← 작물 목록으로
      </Link>

      {/* Page Header */}
      <PageHeader
        icon={<Icon icon={Scale} size="md" />}
        label="Crop Compare"
        title="작물 비교"
        description="최대 3개 작물의 난이도, 소득, 장단점을 나란히 비교해보세요."
      />

      {/* Crop Selector */}
      <Suspense
        fallback={
          <div
            className={s.selectorSkeleton}
            aria-busy="true"
            aria-label="작물 선택 로딩 중"
          />
        }
      >
        <CropSelector crops={CROPS} selectedIds={selectedIds} />
      </Suspense>

      {crops.length > 0 && (
        <>
          {/* Summary Cards */}
          <section aria-labelledby="summary-heading">
            <h2 id="summary-heading" className={s.srOnly}>
              작물 요약
            </h2>
            <div className={s.summaryGrid}>
              {crops.map((crop) => (
                <SummaryCard key={crop.id} crop={crop} />
              ))}
            </div>
          </section>

          {/* 한줄 요약 */}
          {crops.length >= 2 && (
            <section aria-labelledby="onesummary-heading" className={s.oneSummaryCard}>
              <h2 id="onesummary-heading" className={s.oneSummaryTitle}>
                <Icon icon={Lightbulb} size="md" />
                한줄 요약
              </h2>
              <p className={s.oneSummaryText}>
                {buildComparisonSummary(crops)}
              </p>
            </section>
          )}

          {/* 차트 — 2개 이상 선택 시 표시 */}
          {crops.length >= 2 && crops.some((c) => c.detail.prosCons) && (
            <section className={s.chartSection}>
              <h3 className={s.chartSectionTitle}>종합 비교</h3>
              <CropRadar
                crops={crops
                  .filter((c) => c.detail.prosCons)
                  .map((c) => ({
                    name: c.name,
                    emoji: c.emoji,
                    pros: c.detail.prosCons!.pros,
                    cons: c.detail.prosCons!.cons,
                  }))}
              />
            </section>
          )}

          {crops.length >= 2 && (
            <section className={s.chartSection}>
              <h3 className={s.chartSectionTitle}>예상 소득 비교</h3>
              <IncomeBars
                crops={crops.map((c) => {
                  const { min, max } = parseIncome(c.detail.income.revenueRange);
                  return {
                    name: c.name,
                    emoji: c.emoji,
                    incomeMin: min,
                    incomeMax: max,
                  };
                })}
              />
            </section>
          )}

          {/* Detail Comparison Table */}
          <section aria-labelledby="detail-heading">
            <div className={s.tableCard}>
              <div className={s.tableCardHeader}>
                <h2 id="detail-heading" className={s.tableCardTitle}>
                  상세 비교
                </h2>
              </div>
              <SwipeHint />
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <caption className={s.srOnly}>
                    작물별 재배환경·소득 상세 비교
                  </caption>
                  <thead>
                    <tr>
                      <th className={s.th} scope="col">항목</th>
                      {crops.map((c) => (
                        <th key={c.id} className={s.th} scope="col">
                          {c.emoji} {c.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <TextRow
                      label="카테고리"
                      values={crops.map((c) => c.category)}
                    />
                    <TextRow
                      label="난이도"
                      values={crops.map((c) => c.difficulty)}
                    />
                    <TextRow
                      label="재배 시기"
                      values={crops.map((c) => c.growingSeason)}
                    />
                    <TextRow
                      label="예상 소득"
                      values={crops.map((c) => c.detail.income.revenueRange)}
                      highlight
                    />
                    <TextRow
                      label="출처"
                      values={crops.map(
                        (c) =>
                          c.detail.income.source ?? "농촌진흥청 농업소득자료집",
                      )}
                    />
                    <SectionDividerRow
                      label="재배환경"
                      colSpan={crops.length + 1}
                    />
                    <TextRow
                      label="기후"
                      values={crops.map((c) => c.detail.cultivation.climate)}
                      glossary
                    />
                    <TextRow
                      label="토양"
                      values={crops.map((c) => c.detail.cultivation.soil)}
                      glossary
                    />
                    <TextRow
                      label="수분"
                      values={crops.map((c) => c.detail.cultivation.water)}
                      glossary
                    />
                    <TextRow
                      label="재식거리"
                      values={crops.map((c) => c.detail.cultivation.spacing)}
                    />
                    <SectionDividerRow
                      label="비용·노동"
                      colSpan={crops.length + 1}
                    />
                    <TextRow
                      label="주요 비용"
                      values={crops.map((c) => c.detail.income.costNote)}
                      glossary
                    />
                    <TextRow
                      label="노동력"
                      values={crops.map((c) => c.detail.income.laborNote)}
                      glossary
                    />
                    <SectionDividerRow
                      label="주요 산지"
                      colSpan={crops.length + 1}
                    />
                    <RegionLinksRow crops={crops} />
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Pros & Cons Comparison */}
          {crops.some((c) => c.detail.prosCons) && (
            <section aria-labelledby="proscons-heading">
              <div className={s.tableCard}>
                <div className={s.tableCardHeader}>
                  <h2 id="proscons-heading" className={s.tableCardTitle}>
                    <Icon icon={Scale} size="lg" /> 장단점 비교
                  </h2>
                </div>
                <div className={s.prosConsGrid}>
                  {crops.map((crop) => (
                    <ProsConsColumn key={crop.id} crop={crop} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 데이터 출처 */}
          <DataSource
            source="농촌진흥청 「2024 농산물소득자료집」 (국가승인통계 제143002호)"
            note="소득 = 판매 수입 − 생산 경비 (인건비·자재비 등). 재배 환경, 기술 수준에 따라 달라질 수 있습니다."
          />
        </>
      )}
    </div>
  );
}

// ─── Sub Components ───

function SummaryCard({ crop }: { crop: CropWithDetail }) {
  return (
    <Link href={`/crops/${crop.id}`} className={s.summaryCard}>
      <div className={s.summaryImageWrap}>
        <Image
          src={`/crops/${crop.id}.jpg`}
          alt={crop.name}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          style={{ objectFit: "cover" }}
        />
        <div className={s.summaryOverlay} />
        <span className={s.summaryCategory}>{crop.category}</span>
      </div>
      <div className={s.summaryContent}>
        <h3 className={s.summaryName}>
          <span className={s.summaryEmoji}>{crop.emoji}</span>
          {crop.name}
        </h3>
        <div className={s.summaryMeta}>
          <span
            className={`${s.summaryBadge} ${DIFFICULTY_CLASS[crop.difficulty] ?? s.difficultyMedium}`}
          >
            <Icon icon={Gauge} size="xs" /> {crop.difficulty}
          </span>
          <span className={s.summaryInfo}>
            <Icon icon={Calendar} size="xs" /> {crop.growingSeason}
          </span>
        </div>
        <p className={s.summaryStat}>
          <Icon icon={TrendingUp} size="xs" />
          {crop.detail.income.revenueRange.split("(")[0].trim()}
        </p>
        <p className={s.summaryRegion}>
          <Icon icon={MapPin} size="xs" />
          {crop.detail.majorRegions.slice(0, 2).join(", ")}
        </p>
      </div>
    </Link>
  );
}

function TextRow({
  label,
  values,
  highlight = false,
  glossary = false,
}: {
  label: string;
  values: (string | null)[];
  highlight?: boolean;
  glossary?: boolean;
}) {
  return (
    <tr>
      <td className={s.tdLabel}>{label}</td>
      {values.map((v, i) => (
        <td key={i} className={highlight ? s.tdHighlight : s.tdValue}>
          {v
            ? glossary
              ? <AutoGlossary text={v} />
              : formatCellValue(v)
            : "-"}
        </td>
      ))}
    </tr>
  );
}

function formatCellValue(text: string) {
  const parenIdx = text.indexOf(" (");
  if (parenIdx === -1) return text;
  return (
    <>
      {text.slice(0, parenIdx)}
      <br />
      <span className={s.tdSub}>{text.slice(parenIdx + 1)}</span>
    </>
  );
}

function SectionDividerRow({
  label,
  colSpan,
}: {
  label: string;
  colSpan: number;
}) {
  return (
    <tr className={s.dividerRow}>
      <td colSpan={colSpan} className={s.dividerCell}>
        {label}
      </td>
    </tr>
  );
}

/** 지역명 → Province ID 룩업 맵 */
const PROVINCE_ID_BY_NAME = new Map(
  PROVINCES.map((p) => [p.name, p.id]),
);

function RegionLinksRow({ crops }: { crops: CropWithDetail[] }) {
  return (
    <tr>
      <td className={s.tdLabel}>지역</td>
      {crops.map((c, i) => (
        <td key={i} className={s.tdValue}>
          {c.detail.majorRegions.map((region, ri) => {
            const provinceId = PROVINCE_ID_BY_NAME.get(region);
            return (
              <span key={ri}>
                {ri > 0 && ", "}
                {provinceId ? (
                  <Link
                    href={`/regions/${provinceId}`}
                    className={s.regionLink}
                  >
                    {region}
                  </Link>
                ) : (
                  region
                )}
              </span>
            );
          })}
        </td>
      ))}
    </tr>
  );
}

function ProsConsColumn({ crop }: { crop: CropWithDetail }) {
  const pc = crop.detail.prosCons;
  if (!pc) return null;

  return (
    <div className={s.prosConsCol}>
      <h3 className={s.prosConsColTitle}>
        <span>{crop.emoji}</span> {crop.name}
      </h3>

      {/* 종합 (결론 먼저) */}
      {pc.verdict && (
        <div className={s.verdictCard}>
          <Icon icon={Lightbulb} size="sm" />
          <span className={s.verdictText}><AutoGlossary text={pc.verdict} /></span>
        </div>
      )}

      {/* 장점 */}
      <div className={s.prosGroup}>
        <p className={s.prosGroupLabel}>
          <Icon icon={ThumbsUp} size="xs" /> 장점
        </p>
        {pc.pros.map((item, idx) => (
          <div key={idx} className={s.prosItem}>
            <span className={s.prosBadge}>
              {CAT_LABEL[item.category] ?? item.category}
            </span>
            <span className={s.prosConsText}><AutoGlossary text={item.text} /></span>
          </div>
        ))}
      </div>

      {/* 단점 */}
      <div className={s.consGroup}>
        <p className={s.consGroupLabel}>
          <Icon icon={AlertTriangle} size="xs" /> 단점
        </p>
        {pc.cons.map((item, idx) => (
          <div key={idx} className={s.consItem}>
            <span className={s.consBadge}>
              {CAT_LABEL[item.category] ?? item.category}
            </span>
            <span className={s.prosConsText}><AutoGlossary text={item.text} /></span>
          </div>
        ))}
      </div>
    </div>
  );
}
