import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  Scale,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  Gauge,
  Calendar,
  MapPin,
  Wallet,
  Clock,
  Activity,
  Leaf,
  Info,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { CropImage } from "@/components/ui/crop-image";
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
import { CropSelector, type CropSelectorItem } from "./crop-selector";
import { CropRadar } from "./crop-radar";
import { IncomeBars } from "./income-bars";
import { CompareTabs, TAB_IDS, type TabId } from "./compare-tabs";
import {
  CropMetricCard,
  CropBadgeMetricCard,
  MetricGrid,
  type BadgeTone,
  type NumericRow,
  type BadgeRow,
} from "./metric-card";
import { DesktopHint } from "@/components/ui/desktop-hint";
import { SwipeHint } from "@/components/ui/swipe-hint";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "귀농 작물 비교 — 소득·난이도·장단점 비교",
  description:
    "최대 4개 작물의 소득, 난이도, 재배 환경, 장단점을 나란히 비교하세요. 초보자 추천 작물부터 고소득 작물까지 선택에 도움이 돼요.",
  keywords: ["작물 비교", "귀농 작물 비교", "작물 소득 비교", "귀농 작물 선택"],
  alternates: { canonical: "/crops/compare" },
};

const DEFAULT_CROP_IDS: string[] = [];

interface PageProps {
  searchParams: Promise<{ ids?: string; tab?: string }>;
}

type CropWithDetail = CropInfo & { detail: CropDetailInfo };

// 난이도 색상
const DIFFICULTY_CLASS: Record<string, string> = {
  쉬움: s.difficultyEasy,
  보통: s.difficultyMedium,
  어려움: s.difficultyHard,
};

// 카테고리 라벨 (약칭)
const CAT_LABEL: Record<ProsConsCategory, string> = {
  수익성: "수익성",
  재배난이도: "재배",
  시장성: "시장",
  안정성: "안정",
  생활: "생활",
  확장성: "확장",
};

const DIFFICULTY_RANK: Record<string, number> = { 쉬움: 1, 보통: 2, 어려움: 3 };

/**
 * selector 에 직렬화해서 보낼 작물 데이터 — emoji 같은 비표시 필드 제외.
 * (RSC payload 에서 이모지가 노출되지 않도록 차단)
 */
const selectorCrops: CropSelectorItem[] = CROPS.map((c) => ({
  id: c.id,
  name: c.name,
  category: c.category,
  difficulty: c.difficulty,
  description: c.description,
}));

function isTabId(value: string | undefined): value is TabId {
  return !!value && (TAB_IDS as readonly string[]).includes(value);
}

/** revenueRange 문자열에서 소득 숫자(만원) 추출 */
function parseIncome(revenueRange: string): { min: number; max: number } {
  const numbers = revenueRange.match(/[\d,]+(?:\.\d+)?/g);
  if (!numbers || numbers.length === 0) return { min: 0, max: 0 };

  const parsed = numbers.map((n) => parseFloat(n.replace(/,/g, "")));
  const values = parsed.filter((v) => v !== 10);

  if (values.length === 0) return { min: 0, max: 0 };
  if (values.length === 1) return { min: values[0], max: values[0] };

  return { min: Math.min(values[0], values[1]), max: Math.max(values[0], values[1]) };
}

/** annualWorkdays 문자열에서 일수 추출 (예: "약 60~80일 (이앙·수확기 집중)" → 70 평균) */
function parseAnnualWorkdays(text: string | undefined): number | null {
  if (!text) return null;
  const numbers = text.match(/\d+/g);
  if (!numbers || numbers.length === 0) return null;
  const parsed = numbers.map((n) => parseInt(n, 10)).filter((n) => n >= 5 && n <= 365);
  if (parsed.length === 0) return null;
  if (parsed.length === 1) return parsed[0];
  return Math.round((parsed[0] + parsed[1]) / 2);
}

/** difficulty → badge tone */
const DIFFICULTY_TONE: Record<string, BadgeTone> = {
  쉬움: "easy",
  보통: "medium",
  어려움: "hard",
};

/** laborIntensity → badge tone (낮을수록 좋음) */
const LABOR_TONE: Record<string, BadgeTone> = {
  낮음: "easy",
  보통: "medium",
  높음: "hard",
};

/** category → badge tone (시각 구분만, 우열 없음) */
const CATEGORY_TONE: Record<string, BadgeTone> = {
  식량: "primary",
  채소: "easy",
  과수: "medium",
  특용: "neutral",
};

/**
 * 작물명 + thumbnail inline 조각 — 한줄 요약 안에서 사용.
 */
function CropInlineLabel({ crop }: { crop: CropWithDetail }) {
  return (
    <span className={s.cropInline}>
      <CropImage cropId={crop.id} cropName={crop.name} size="inline" />
      {crop.name}
    </span>
  );
}

function buildComparisonSummary(crops: CropWithDetail[]): React.ReactNode {
  if (crops.length < 2) return null;

  const sorted = [...crops].sort(
    (a, b) => (DIFFICULTY_RANK[a.difficulty] ?? 2) - (DIFFICULTY_RANK[b.difficulty] ?? 2),
  );
  const easiest = sorted[0];
  const hardest = sorted[sorted.length - 1];

  const nodes: React.ReactNode[] = [];

  if (easiest.difficulty !== hardest.difficulty) {
    nodes.push(
      <span key="diff">
        {"안정적인 입문을 원한다면 "}
        <CropInlineLabel crop={easiest} />
        {`(${easiest.difficulty})이 적합하고, 높은 수익을 목표로 기술 투자가 가능하다면 `}
        <CropInlineLabel crop={hardest} />
        {`(${hardest.difficulty})을 고려해 보세요.`}
      </span>,
    );
  } else {
    nodes.push(
      <span key="same">
        {crops.map((c, i) => (
          <span key={c.id}>
            {i > 0 && ", "}
            <CropInlineLabel crop={c} />
          </span>
        ))}
        {` 모두 ${easiest.difficulty} 난이도예요.`}
      </span>,
    );
  }

  if (crops.length === 3) {
    const mid = sorted[1];
    if (mid.difficulty !== easiest.difficulty && mid.difficulty !== hardest.difficulty) {
      nodes.push(
        <span key="mid">
          {" "}
          <CropInlineLabel crop={mid} />
          {"은 난이도와 수익의 균형을 원하는 분에게 좋은 선택이에요."}
        </span>,
      );
    }
  }

  return <>{nodes}</>;
}

export default async function CropComparePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedIds = params.ids
    ? params.ids.split(",").slice(0, 4)
    : DEFAULT_CROP_IDS;
  const tab: TabId = isTabId(params.tab) ? params.tab : "summary";

  const crops: CropWithDetail[] = selectedIds
    .map((id) => getCropWithDetail(id))
    .filter((c): c is NonNullable<typeof c> => c != null);

  // 탭 전환 시 보존할 query (ids만)
  const baseParams = new URLSearchParams();
  if (params.ids) baseParams.set("ids", params.ids);
  const baseQuery = baseParams.toString();

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
        description="최대 4개 작물의 난이도, 소득, 장단점을 나란히 비교해 보세요."
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
        <CropSelector crops={selectorCrops} selectedIds={selectedIds} />
      </Suspense>

      {crops.length === 1 && (
        <div className={s.minSelectionNotice} role="status" aria-live="polite">
          <Icon icon={Info} size="md" />
          <p className={s.minSelectionText}>
            2개 이상 골라야 비교가 가능해요. 위에서 작물을 더 추가해 보세요.
          </p>
        </div>
      )}

      {crops.length >= 2 && (
        <>
          <CompareTabs activeTab={tab} baseQuery={baseQuery} />

          {tab === "summary" && <SummaryView crops={crops} />}
          {tab === "economy" && <EconomyView crops={crops} />}
          {tab === "cultivation" && <CultivationView crops={crops} />}
          {tab === "prosCons" && <ProsConsView crops={crops} />}

          {/* 데이터 출처 — 모든 탭에 공통 */}
          <DataSource
            source="농촌진흥청 「2024 농산물소득자료집」 (국가승인통계 제143002호)"
            note="소득 = 판매 수입 − 생산 경비 (인건비·자재비 등). 재배 환경, 기술 수준에 따라 달라질 수 있습니다."
          />
        </>
      )}
    </div>
  );
}

// ─── 탭별 View ───

function SummaryView({ crops }: { crops: CropWithDetail[] }) {
  return (
    <>
      {/* Summary Cards (visual identity) */}
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

      {/* Metric Stat Cards — 토스 스타일 핵심 수치 비교 */}
      {crops.length >= 2 && <SummaryMetricGrid crops={crops} />}

      {/* 한줄 요약 */}
      {crops.length >= 2 && (
        <section aria-labelledby="onesummary-heading" className={s.oneSummaryCard}>
          <h2 id="onesummary-heading" className={s.oneSummaryTitle}>
            <Icon icon={Lightbulb} size="md" />
            한줄 요약
          </h2>
          <p className={s.oneSummaryText}>{buildComparisonSummary(crops)}</p>
        </section>
      )}

      {/* radar — 2개 이상 + prosCons 있을 때 */}
      {crops.length >= 2 && crops.some((c) => c.detail.prosCons) && (
        <section className={s.chartSection}>
          <h3 className={s.chartSectionTitle}>종합 비교</h3>
          <CropRadar
            crops={crops
              .filter((c) => c.detail.prosCons)
              .map((c) => ({
                id: c.id,
                name: c.name,
                pros: c.detail.prosCons!.pros,
                cons: c.detail.prosCons!.cons,
              }))}
          />
        </section>
      )}
    </>
  );
}

/**
 * SummaryView 핵심 metric 비교 그리드.
 * 4 metric: 예상 소득(높을수록 좋음) / 난이도 / 노동일수(적을수록 좋음) / 노동강도
 */
function SummaryMetricGrid({ crops }: { crops: CropWithDetail[] }) {
  const incomeRows: NumericRow[] = crops.map((c) => {
    const { min, max } = parseIncome(c.detail.income.revenueRange);
    const center = max > 0 ? Math.round((min + max) / 2) : null;
    return {
      cropId: c.id,
      cropName: c.name,
      value: center,
      displayText:
        min === max
          ? max.toLocaleString()
          : `${min.toLocaleString()}~${max.toLocaleString()}`,
    };
  });

  const workdayRows: NumericRow[] = crops.map((c) => ({
    cropId: c.id,
    cropName: c.name,
    value: parseAnnualWorkdays(c.detail.income.annualWorkdays),
  }));

  const difficultyRows: BadgeRow[] = crops.map((c) => ({
    cropId: c.id,
    cropName: c.name,
    badge: c.difficulty,
    tone: DIFFICULTY_TONE[c.difficulty] ?? "neutral",
  }));

  const laborRows: BadgeRow[] = crops.map((c) => ({
    cropId: c.id,
    cropName: c.name,
    badge: c.detail.income.laborIntensity ?? "—",
    tone: c.detail.income.laborIntensity
      ? (LABOR_TONE[c.detail.income.laborIntensity] ?? "neutral")
      : "neutral",
  }));

  const easiest = crops.find(
    (c) =>
      DIFFICULTY_RANK[c.difficulty] ===
      Math.min(...crops.map((cc) => DIFFICULTY_RANK[cc.difficulty] ?? 2)),
  );

  const lightestLaborCrop = laborRows
    .map((r) => crops.find((c) => c.id === r.cropId))
    .find((c, i) => c != null && laborRows[i].tone === "easy");

  return (
    <MetricGrid>
      <CropMetricCard
        title="예상 소득"
        unit="만원/10a"
        icon={Wallet}
        emphasis="highest"
        emphasisLabelHighest="가장 높아요"
        emphasisLabelLowest="가장 낮아요"
        rows={incomeRows}
      />
      <CropMetricCard
        title="연간 노동일수"
        unit="일"
        icon={Clock}
        emphasis="lowest"
        emphasisLabelHighest="가장 많아요"
        emphasisLabelLowest="가장 적어요"
        rows={workdayRows}
      />
      <CropBadgeMetricCard
        title="재배 난이도"
        icon={Gauge}
        rows={difficultyRows}
        footerLabel={
          easiest ? (
            <>
              {"가장 쉬운 작물 · "}
              <CropInlineLabel crop={easiest} />
            </>
          ) : undefined
        }
      />
      <CropBadgeMetricCard
        title="노동 강도"
        icon={Activity}
        rows={laborRows}
        footerLabel={
          lightestLaborCrop ? (
            <>
              {"노동 부담이 가장 적어요 · "}
              <CropInlineLabel crop={lightestLaborCrop} />
            </>
          ) : undefined
        }
      />
    </MetricGrid>
  );
}

function EconomyView({ crops }: { crops: CropWithDetail[] }) {
  return (
    <>
      {/* Metric Stat Cards — 노동·강도 핵심 비교 (소득 시각화는 IncomeBars 차트 참조) */}
      {crops.length >= 2 && <EconomyMetricGrid crops={crops} />}

      {/* 예상 소득 차트 */}
      {crops.length >= 2 && (
        <section className={s.chartSection}>
          <h3 className={s.chartSectionTitle}>예상 소득 비교</h3>
          <IncomeBars
            crops={crops.map((c) => {
              const { min, max } = parseIncome(c.detail.income.revenueRange);
              return {
                id: c.id,
                name: c.name,
                incomeMin: min,
                incomeMax: max,
              };
            })}
          />
        </section>
      )}

      <section aria-labelledby="economy-heading">
        <div className={s.tableCard}>
          <div className={s.tableCardHeader}>
            <h2 id="economy-heading" className={s.tableCardTitle}>
              수익·비용 상세
            </h2>
          </div>
          <SwipeHint />
          <div className={s.tableWrap}>
            <table className={s.table}>
              <caption className={s.srOnly}>작물별 소득·비용·노동력 비교</caption>
              <thead>
                <tr>
                  <th className={s.th} scope="col">항목</th>
                  {crops.map((c) => (
                    <th key={c.id} className={s.th} scope="col">
                      <span className={s.thLabel}>
                        <CropImage cropId={c.id} cropName={c.name} size="md" />
                        {c.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <TextRow
                  label="예상 소득"
                  values={crops.map((c) => c.detail.income.revenueRange)}
                  highlight
                />
                <TextRow
                  label="출처"
                  values={crops.map(
                    (c) => c.detail.income.source ?? "농촌진흥청 농업소득자료집",
                  )}
                />
                <SectionDividerRow label="비용·노동" colSpan={crops.length + 1} />
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
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}

/**
 * EconomyView 핵심 metric 비교 그리드.
 * 3 metric: 연간 노동일수 / 노동 강도 / 최소 권장 규모(비교 가능 시)
 */
function EconomyMetricGrid({ crops }: { crops: CropWithDetail[] }) {
  const workdayRows: NumericRow[] = crops.map((c) => ({
    cropId: c.id,
    cropName: c.name,
    value: parseAnnualWorkdays(c.detail.income.annualWorkdays),
  }));

  const laborRows: BadgeRow[] = crops.map((c) => ({
    cropId: c.id,
    cropName: c.name,
    badge: c.detail.income.laborIntensity ?? "—",
    tone: c.detail.income.laborIntensity
      ? (LABOR_TONE[c.detail.income.laborIntensity] ?? "neutral")
      : "neutral",
  }));

  const incomeRows: NumericRow[] = crops.map((c) => {
    const { min, max } = parseIncome(c.detail.income.revenueRange);
    const center = max > 0 ? Math.round((min + max) / 2) : null;
    return {
      cropId: c.id,
      cropName: c.name,
      value: center,
      displayText:
        min === max
          ? max.toLocaleString()
          : `${min.toLocaleString()}~${max.toLocaleString()}`,
    };
  });

  return (
    <MetricGrid>
      <CropMetricCard
        title="예상 소득"
        unit="만원/10a"
        icon={Wallet}
        emphasis="highest"
        emphasisLabelHighest="가장 높아요"
        emphasisLabelLowest="가장 낮아요"
        rows={incomeRows}
      />
      <CropMetricCard
        title="연간 노동일수"
        unit="일"
        icon={Clock}
        emphasis="lowest"
        emphasisLabelHighest="가장 많아요"
        emphasisLabelLowest="가장 적어요"
        rows={workdayRows}
      />
      <CropBadgeMetricCard
        title="노동 강도"
        icon={Activity}
        rows={laborRows}
      />
    </MetricGrid>
  );
}

function CultivationView({ crops }: { crops: CropWithDetail[] }) {
  return (
    <>
      {/* Metric Stat Cards — 재배 환경 핵심 비교 */}
      {crops.length >= 2 && <CultivationMetricGrid crops={crops} />}

      <section aria-labelledby="cultivation-heading">
        <div className={s.tableCard}>
        <div className={s.tableCardHeader}>
          <h2 id="cultivation-heading" className={s.tableCardTitle}>
            재배 환경 상세
          </h2>
        </div>
        <SwipeHint />
        <div className={s.tableWrap}>
          <table className={s.table}>
            <caption className={s.srOnly}>작물별 재배환경·난이도·산지 비교</caption>
            <thead>
              <tr>
                <th className={s.th} scope="col">항목</th>
                {crops.map((c) => (
                  <th key={c.id} className={s.th} scope="col">
                    <span className={s.thLabel}>
                      <CropImage cropId={c.id} cropName={c.name} size="md" />
                      {c.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <TextRow label="카테고리" values={crops.map((c) => c.category)} />
              <TextRow label="난이도" values={crops.map((c) => c.difficulty)} />
              <TextRow
                label="재배 시기"
                values={crops.map((c) => c.growingSeason)}
              />
              <SectionDividerRow label="재배환경" colSpan={crops.length + 1} />
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
              <SectionDividerRow label="주요 산지" colSpan={crops.length + 1} />
              <RegionLinksRow crops={crops} />
            </tbody>
          </table>
        </div>
      </div>
    </section>
    </>
  );
}

/**
 * CultivationView 핵심 metric 비교 그리드.
 * 3 badge metric: 카테고리 / 난이도 / 재배 시기
 */
function CultivationMetricGrid({ crops }: { crops: CropWithDetail[] }) {
  const categoryRows: BadgeRow[] = crops.map((c) => ({
    cropId: c.id,
    cropName: c.name,
    badge: c.category,
    tone: CATEGORY_TONE[c.category] ?? "neutral",
  }));

  const difficultyRows: BadgeRow[] = crops.map((c) => ({
    cropId: c.id,
    cropName: c.name,
    badge: c.difficulty,
    tone: DIFFICULTY_TONE[c.difficulty] ?? "neutral",
  }));

  const seasonRows: BadgeRow[] = crops.map((c) => ({
    cropId: c.id,
    cropName: c.name,
    badge: c.growingSeason,
    tone: "neutral",
  }));

  return (
    <MetricGrid>
      <CropBadgeMetricCard
        title="카테고리"
        icon={Leaf}
        rows={categoryRows}
      />
      <CropBadgeMetricCard
        title="재배 난이도"
        icon={Gauge}
        rows={difficultyRows}
      />
      <CropBadgeMetricCard
        title="재배 시기"
        icon={Calendar}
        rows={seasonRows}
      />
    </MetricGrid>
  );
}

function ProsConsView({ crops }: { crops: CropWithDetail[] }) {
  if (!crops.some((c) => c.detail.prosCons)) {
    return (
      <section className={s.tableCard}>
        <div className={s.tableCardHeader}>
          <p className={s.oneSummaryText}>
            선택한 작물의 장단점 자료가 아직 준비되지 않았어요.
          </p>
        </div>
      </section>
    );
  }

  return (
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
  );
}

// ─── Sub Components ───

function SummaryCard({ crop }: { crop: CropWithDetail }) {
  return (
    <Link href={`/crops/${crop.id}`} className={s.summaryCard}>
      <div className={s.summaryContent}>
        <div className={s.summaryTopRow}>
          <span className={s.summaryCategory}>{crop.category}</span>
          <span
            className={`${s.summaryBadge} ${DIFFICULTY_CLASS[crop.difficulty] ?? s.difficultyMedium}`}
          >
            <Icon icon={Gauge} size="xs" /> {crop.difficulty}
          </span>
        </div>
        <h3 className={s.summaryName}>
          <CropImage cropId={crop.id} cropName={crop.name} size="md" />
          {crop.name}
        </h3>
        <p className={s.summaryInfo}>
          <Icon icon={Calendar} size="xs" /> {crop.growingSeason}
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
        <CropImage cropId={crop.id} cropName={crop.name} size="md" />
        {crop.name}
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
