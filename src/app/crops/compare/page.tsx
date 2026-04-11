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
import {
  CROPS,
  getCropWithDetail,
  type CropInfo,
  type CropDetailInfo,
  type ProsConsCategory,
} from "@/lib/data/crops";
import { DataSource } from "@/components/ui/data-source";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { CropSelector } from "./crop-selector";
import { DesktopHint } from "@/components/ui/desktop-hint";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "작물 비교",
  description:
    "귀농 후보 작물의 난이도, 소득, 장단점을 나란히 비교해보세요.",
};

const DEFAULT_CROP_IDS = ["rice", "apple", "strawberry"];

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
      {/* 모바일 데스크톱 권장 안내 */}
      <DesktopHint message="작물 비교는 넓은 화면에서 더 잘 보여요" />

      {/* Back Link */}
      <Link href="/crops" className={s.backLink}>
        ← 작물 목록으로
      </Link>

      {/* Page Header */}
      <header className={s.pageHeader}>
        <span className={s.headerOverline}>
          <Icon icon={Scale} size="md" />
          Crop Compare
        </span>
        <h1 className={s.headerTitle}>작물 비교</h1>
        <p className={s.headerDesc}>
          최대 3개 작물의 난이도, 소득, 장단점을 나란히 비교해보세요.
        </p>
      </header>

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

          {/* Detail Comparison Table */}
          <section aria-labelledby="detail-heading">
            <div className={s.tableCard}>
              <div className={s.tableCardHeader}>
                <h2 id="detail-heading" className={s.tableCardTitle}>
                  상세 비교
                </h2>
              </div>
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
                    />
                    <TextRow
                      label="토양"
                      values={crops.map((c) => c.detail.cultivation.soil)}
                    />
                    <TextRow
                      label="수분"
                      values={crops.map((c) => c.detail.cultivation.water)}
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
                    />
                    <TextRow
                      label="노동력"
                      values={crops.map((c) => c.detail.income.laborNote)}
                    />
                    <SectionDividerRow
                      label="주요 산지"
                      colSpan={crops.length + 1}
                    />
                    <TextRow
                      label="지역"
                      values={crops.map((c) =>
                        c.detail.majorRegions.join(", "),
                      )}
                    />
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
}: {
  label: string;
  values: (string | null)[];
  highlight?: boolean;
}) {
  return (
    <tr>
      <td className={s.tdLabel}>{label}</td>
      {values.map((v, i) => (
        <td key={i} className={highlight ? s.tdHighlight : s.tdValue}>
          {v ?? "-"}
        </td>
      ))}
    </tr>
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

function ProsConsColumn({ crop }: { crop: CropWithDetail }) {
  const pc = crop.detail.prosCons;
  if (!pc) return null;

  return (
    <div className={s.prosConsCol}>
      <h3 className={s.prosConsColTitle}>
        <span>{crop.emoji}</span> {crop.name}
      </h3>

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

      {/* 종합 */}
      {pc.verdict && (
        <div className={s.verdictCard}>
          <Icon icon={Lightbulb} size="sm" />
          <span className={s.verdictText}><AutoGlossary text={pc.verdict} /></span>
        </div>
      )}
    </div>
  );
}
