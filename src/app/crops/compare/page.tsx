import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/share-metadata";
import { Suspense } from "react";
import Link from "next/link";
import { Scale, Lightbulb, TrendingUp, Info } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { CropImage } from "@/components/ui/crop-image";
import { PageHeader } from "@/components/ui/page-header";
import {
  CROPS,
  getCropWithDetail,
  type CropInfo,
  type CropDetailInfo,
} from "@/lib/data/crops";
import { officialIncome10a, officialIncomeAgency } from "@/lib/crops/income";
import { DataSource } from "@/components/ui/data-source";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { CropSelector, type CropSelectorItem } from "./crop-selector";
import { IncomeBars } from "./income-bars";
import { ScoreCards, type ScoreCardItem, type DifficultyTone } from "./score-card";
import { DifficultyIncomeScatter } from "./difficulty-income-scatter";
import { ProsConsAccordion, type ProsConsAccordionItem } from "./pros-cons-accordion";
import { DesktopHint } from "@/components/ui/desktop-hint";
import { withJosa } from "@/lib/format";
import s from "./page.module.css";

export const metadata: Metadata = {
  // 문서 제목·설명·canonical·공유 카드를 같은 값에서 — 종전엔 공유 카드가 사이트 기본 제목·설명을
  // 물려받고 og:url 도 없었다 (10/6 QA1 Q2-W3)
  ...pageMetadata({
    title: "정착 작물 비교 — 소득·난이도·장단점 비교",
    description:
      "최대 4개 작물의 소득, 난이도, 장단점을 한 화면에서 비교하세요. 난이도 × 소득 산점도로 쉽고 돈 되는 작물이 한눈에 보여요.",
    path: "/crops/compare",
  }),
  keywords: ["작물 비교", "정착 작물 비교", "작물 소득 비교", "정착 작물 선택"],
};

const DEFAULT_CROP_IDS: string[] = [];

interface PageProps {
  searchParams: Promise<{ ids?: string }>;
}

type CropWithDetail = CropInfo & { detail: CropDetailInfo };

const DIFFICULTY_RANK: Record<string, number> = { 쉬움: 1, 보통: 2, 어려움: 3 };

const DIFFICULTY_TONE: Record<string, DifficultyTone> = {
  쉬움: "easy",
  보통: "medium",
  어려움: "hard",
};

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

/**
 * 공식 소득의 머리 숫자(만원) 범위 — "10a당 약 1,260~1,642만 원 (…)" → { 1260, 1642 }.
 * 공식 통계가 아닌 '추정' 작목·1ha/임야 기준 표기는 { 0, 0 }(자료 없음) — 10/10: 종전엔 문자열의 숫자를 아무거나 집어
 * 루꼴라 '1ha당 4,000~8,000'을 10a 값으로 그렸다.
 */
function parseIncomeRange(income: { revenueRange: string; source?: string }): { min: number; max: number } {
  if (!officialIncomeAgency(income.source)) return { min: 0, max: 0 };
  const m = income.revenueRange.match(/^10a당\s*약\s*([\d,]+)(?:\s*~\s*([\d,]+))?\s*만\s*원/);
  if (!m) return { min: 0, max: 0 };
  const lo = Number(m[1].replace(/,/g, ""));
  const hi = m[2] ? Number(m[2].replace(/,/g, "")) : lo;
  return { min: Math.min(lo, hi), max: Math.max(lo, hi) };
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

/**
 * 작물명 + thumbnail inline 조각 — 요약 배너 안에서 사용.
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

  const crops: CropWithDetail[] = selectedIds
    .map((id) => getCropWithDetail(id))
    .filter((c): c is NonNullable<typeof c> => c != null);

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[
        { name: "작물 목록", href: "/crops" },
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
        description="최대 4개 작물의 난이도, 소득, 장단점을 한 화면에서 비교해 보세요."
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
        <CompareBody crops={crops} />
      )}
    </div>
  );
}

// ─── 단일 스크롤 비교 본문 ───

function CompareBody({ crops }: { crops: CropWithDetail[] }) {
  // 스코어카드 best 강조 — 서버에서 미리 판정
  const incomeCenters = crops.map((c) => {
    const { min, max } = parseIncomeRange(c.detail.income);
    return max > 0 ? Math.round((min + max) / 2) : null;
  });
  const validIncomes = incomeCenters.filter((v): v is number => v !== null);
  const maxIncome = validIncomes.length ? Math.max(...validIncomes) : null;

  const workdays = crops.map((c) => parseAnnualWorkdays(c.detail.income.annualWorkdays));
  const validWorkdays = workdays.filter((v): v is number => v !== null);
  const minWorkday = validWorkdays.length ? Math.min(...validWorkdays) : null;

  const minDifficultyRank = Math.min(
    ...crops.map((c) => DIFFICULTY_RANK[c.difficulty] ?? 2),
  );
  // 가장 쉬운 작물이 1종일 때만 강조 (동률이면 모호하므로 강조 안 함)
  const easiestCount = crops.filter(
    (c) => (DIFFICULTY_RANK[c.difficulty] ?? 2) === minDifficultyRank,
  ).length;

  const scoreItems: ScoreCardItem[] = crops.map((c, i) => {
    const { min, max } = parseIncomeRange(c.detail.income);
    const incomeText =
      max <= 0
        ? null
        : min === max
          ? max.toLocaleString()
          : `${min.toLocaleString()}~${max.toLocaleString()}`;
    return {
      id: c.id,
      name: c.name,
      category: c.category,
      incomeText,
      incomeBest:
        incomeCenters[i] !== null &&
        maxIncome !== null &&
        incomeCenters[i] === maxIncome &&
        validIncomes.length >= 2,
      workdaysText: workdays[i] !== null ? String(workdays[i]) : null,
      workdaysBest:
        workdays[i] !== null &&
        minWorkday !== null &&
        workdays[i] === minWorkday &&
        validWorkdays.length >= 2,
      difficulty: c.difficulty,
      difficultyTone: DIFFICULTY_TONE[c.difficulty] ?? "neutral",
      difficultyBest:
        (DIFFICULTY_RANK[c.difficulty] ?? 2) === minDifficultyRank &&
        easiestCount === 1,
      laborIntensity: c.detail.income.laborIntensity ?? null,
      tag: c.growingSeason,
    };
  });

  // 소득 차트 데이터
  const incomeRows = crops.map((c) => {
    const { min, max } = parseIncomeRange(c.detail.income);
    return { id: c.id, name: c.name, incomeMin: min, incomeMax: max };
  });
  // 공식 소득이 없는 작목은 막대에서 빼고 이름만 적는다(0 막대가 평균선을 끌어내리지 않게)
  const incomeBarsData = incomeRows.filter((r) => r.incomeMax > 0);
  const incomeExcluded = incomeRows.filter((r) => r.incomeMax <= 0);

  // 산점도 데이터 — 공식 소득(officialIncome10a)만, 추정·기준 다른 작물 제외
  const scatterCrops = crops
    .map((c) => {
      const income10a = officialIncome10a(c.detail.income);
      return income10a !== null
        ? { id: c.id, name: c.name, difficulty: c.difficulty, income10a }
        : null;
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);
  const scatterExcluded = crops.filter(
    (c) => officialIncome10a(c.detail.income) === null,
  );

  // 장단점 아코디언 데이터
  const prosConsItems: ProsConsAccordionItem[] = crops
    .filter((c) => c.detail.prosCons)
    .map((c) => ({ id: c.id, name: c.name, prosCons: c.detail.prosCons! }));

  return (
    <>
      {/* 1. 스코어카드 나란히 */}
      <ScoreCards items={scoreItems} />

      {/* 2. 요약 배너 (결론 먼저) */}
      <section aria-labelledby="onesummary-heading" className={s.oneSummaryCard}>
        <h2 id="onesummary-heading" className={s.oneSummaryTitle}>
          <Icon icon={Lightbulb} size="md" />
          한줄 요약
        </h2>
        <p className={s.oneSummaryText}>{buildComparisonSummary(crops)}</p>
      </section>

      {/* 3. 소득 비교 (막대 + 평균선) */}
      <section className={s.chartSection}>
        <h3 className={s.chartSectionTitle}>예상 소득 비교</h3>
        {incomeBarsData.length > 0 && <IncomeBars crops={incomeBarsData} />}
        {incomeExcluded.length > 0 && (
          <p className={s.scatterNote}>
            {withJosa(incomeExcluded.map((c) => c.name).join("·"), "는")} 공식 소득 통계가 없어 막대에서 빠졌어요.
          </p>
        )}
      </section>

      {/* 4. 난이도 × 소득 산점도 (킬러 시각화) */}
      {scatterCrops.length >= 2 && (
        <section className={s.chartSection}>
          <h3 className={s.chartSectionTitle}>
            <Icon icon={TrendingUp} size="md" /> 난이도 × 소득
          </h3>
          <DifficultyIncomeScatter crops={scatterCrops} />
          {scatterExcluded.length > 0 && (
            <p className={s.scatterNote}>
              {withJosa(scatterExcluded.map((c) => c.name).join("·"), "는")} 공식 소득 통계가 없거나 기준이 달라
              산점도에서 빠졌어요.
            </p>
          )}
        </section>
      )}

      {/* 5. 장단점 아코디언 */}
      {prosConsItems.length > 0 ? (
        <section aria-labelledby="proscons-heading" className={s.prosConsSection}>
          <h3 id="proscons-heading" className={s.chartSectionTitle}>
            <Icon icon={Scale} size="md" /> 장단점
          </h3>
          <ProsConsAccordion items={prosConsItems} />
        </section>
      ) : (
        <section className={s.prosConsSection}>
          <p className={s.oneSummaryText}>
            선택한 작물의 장단점 자료가 아직 준비되지 않았어요.
          </p>
        </section>
      )}

      {/* 데이터 출처 */}
      <DataSource
        source="농촌진흥청 「2024 농산물소득자료집」 (국가승인통계 제143002호)"
        note="소득 = 판매 수입 − 생산 경비 (인건비·자재비 등). 재배 환경, 기술 수준에 따라 달라질 수 있어요."
      />
    </>
  );
}
