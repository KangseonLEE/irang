import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  TrendingDown,
  Calendar,
  Users,
  Search,
  PiggyBank,
  Home,
  Calculator,
} from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { JsonLd } from "@/components/seo/json-ld";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import type { FAQPage } from "schema-dts";
import { SupportTypeBadge } from "@/components/ui/support-type-badge";
import { SubPageHero } from "@/components/ui/sub-page-hero";
import {
  costByAge,
  cityVsRural,
  COST_TYPES,
  COST_TYPE_PROFILES,
  type CostTypeId,
} from "@/lib/data/landing";
import { GUIDE_STEP_SUMMARIES } from "@/lib/data/guide-steps";
import { StepOverview } from "@/components/ui/step-overview";
import { DataSource } from "@/components/ui/data-source";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import { CROPS } from "@/lib/data/crops";
import {
  CROP_COSTS_BY_TYPE,
  STRATEGIES_BY_TYPE,
  COMPARE_LABELS_BY_TYPE,
  type CropCost,
} from "@/lib/data/cost-by-type";
import { getProgramById } from "@/lib/data/programs";
import CostSimulator from "./cost-simulator";
import CostStrategiesTabs, {
  type StrategyWithStatus,
} from "./cost-strategies-tabs";
import s from "./page.module.css";

/* ── SEO ── */
export const metadata: Metadata = {
  title: "귀농 비용 가이드 — 초기 투자·운영비·생활비",
  description:
    "귀농에 필요한 초기 투자금, 연간 운영비, 생활비를 항목별로 정리했어요. 30대·40대·50대·1인 귀농 자본 계획에 참고하세요.",
  keywords: ["귀농 비용", "귀농 비용 얼마", "귀농 초기 투자", "귀농 자본", "50대 귀농 비용", "귀농 생활비"],
  alternates: { canonical: "/costs" },
};

/* ── 지원금 시뮬레이션 데이터 ── */
const SUPPORT_ITEMS: {
  label: string;
  amount: string;
  type: string;
  note: string;
}[] = [
  {
    label: "농업창업자금",
    amount: "최대 3억 원",
    type: "융자",
    note: "연 2% 저금리 · 5년 거치 10년 상환",
  },
  {
    label: "청년창업농 영농정착지원",
    amount: "최대 3,600만 원",
    type: "보조금",
    note: "만 18~39세 · 월 110·100·90만 원 × 3년 (매년 감액)",
  },
  {
    label: "주택구입 지원",
    amount: "최대 7,500만 원",
    type: "융자",
    note: "연 2% · 세대당 1회",
  },
  {
    label: "귀농교육 100시간",
    amount: "신청 필수",
    type: "교육",
    note: "농업창업자금 융자의 핵심 자격 요건이에요",
  },
];

/* ── 유형 검증 ── */
function isValidCostType(v: string | undefined): v is CostTypeId {
  return !!v && COST_TYPES.some((t) => t.id === v);
}

/* ── Page ── */
interface PageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function CostsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeType: CostTypeId = isValidCostType(params.type) ? params.type : "farming";
  const profile = COST_TYPE_PROFILES[activeType];

  const maxAge = Math.max(...costByAge.map((d) => d.raw));
  const showSection = (key: string) => profile.visibleSections.includes(key as typeof profile.visibleSections[number]);

  /* ── 카테고리별 데이터 분기 (cost-by-type.ts) ── */
  const cropCosts = CROP_COSTS_BY_TYPE[activeType];
  const strategies = STRATEGIES_BY_TYPE[activeType];
  const compareLabels = COMPARE_LABELS_BY_TYPE[activeType];
  const costCompareRows = cityVsRural.filter((r) =>
    compareLabels.includes(r.label),
  );

  /* ── 마감/진행 분리 (탭 UI) ──
     모든 카드에 현재 모집 status를 매핑한 뒤, "마감" 여부로 두 그룹 분리.
     - active: 외부 링크·조언·모집중·모집예정·status 없음 (지금 활용 가능)
     - closed: status="마감" (다음 회차 참고용) */
  const strategiesWithStatus: StrategyWithStatus[] = strategies.map((strategy) => ({
    strategy,
    status: strategy.programId
      ? (getProgramById(strategy.programId)?.status ?? null)
      : null,
  }));
  const activeStrategies = strategiesWithStatus.filter(
    ({ status }) => status !== "마감",
  );
  const closedStrategies = strategiesWithStatus.filter(
    ({ status }) => status === "마감",
  );

  /* ── 카테고리별 작물 섹션 설명 문구 ── */
  const cropSectionDesc: Record<CostTypeId, string> = {
    farming:
      "평균 투자금이라는 숫자는 작물에 따라 크게 달라요. 콩은 300만 원대로도 시작할 수 있지만, 사과는 6,000만 원 이상 투자가 필요해요.",
    youth:
      "청년농에 인기 있는 시설 작물이에요. 딸기·토마토 시설은 초기 투자가 크지만, 영농정착지원금과 청년 우대 융자로 부담을 줄일 수 있어요.",
    village: "",
    forestry:
      "임산물은 손익분기까지 오래 걸리는 품목이 많아요. 표고·도라지는 3~4년이면 회수되지만, 산양삼·호두는 7년 이상이 필요해요.",
    smartfarm:
      "ICT 시설 단가는 작물과 시설 형태(비닐/유리/식물공장)에 따라 크게 달라요. 모두 1,000㎡(약 300평) 기준 참고값이에요.",
  };

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[{ name: "귀농 비용 가이드", href: "/costs" }]} />
      <JsonLd<FAQPage>
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "귀농 초기 투자금은 얼마나 필요한가요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "농촌진흥청 자료 기준, 귀농 초기 투자금은 평균 약 2억~3억 원이에요. 농지 구입비, 주택 비용, 농기계·시설비가 주요 항목이에요.",
              },
            },
            {
              "@type": "Question",
              name: "1인 귀농 최소 자본은 얼마인가요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "임대 농지 + 소규모 시설 기준 약 3,000만~5,000만 원으로 시작할 수 있어요. 지자체 정착금과 영농 자금 지원을 활용하면 초기 부담을 줄일 수 있어요.",
              },
            },
            {
              "@type": "Question",
              name: "귀농 후 연간 운영비는 얼마나 드나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "작물과 규모에 따라 다르지만, 소규모 밭작물 기준 연 1,000만~2,000만 원 수준이에요. 인건비, 자재비, 농약·비료비가 주요 항목이에요.",
              },
            },
          ],
        }}
      />
      {/* ═══ 히어로 ═══ */}
      <SubPageHero
        overline="Cost Guide"
        title={`${profile.label}, 실제로 얼마가 필요할까?`}
        titleAccent="실제로 얼마"
        description={profile.desc}
      />

      {/* 신뢰도 안내 */}
      {profile.confidenceNote && (
        <p className={s.confidenceNote}>* {profile.confidenceNote}</p>
      )}

      {/* ═══ 비용 요약 스냅샷 ═══ */}
      <section className={s.snapshot} aria-label="비용 요약">
        <div className={s.snapshotMain}>
          <p className={s.snapshotLabel}>{profile.snapshot.totalLabel}</p>
          <p className={s.snapshotValue}>
            {profile.snapshot.totalValue}
            <span className={s.snapshotUnit}>{profile.snapshot.totalUnit}</span>
          </p>
          <p className={s.snapshotSub}>
            <SnapshotSub text={profile.snapshot.totalSub} />
          </p>
        </div>
        <div className={s.snapshotGrid}>
          {profile.snapshot.items.map((item) => (
            <SnapshotCard
              key={item.label}
              label={item.label}
              value={item.value}
              sub={item.sub}
            />
          ))}
        </div>
        <DataSource source={profile.source} />
      </section>

      {/* ═══ 연령별 초기 투자 비용 ═══ */}
      {showSection("age") && (
        <section className={s.section} aria-label="연령별 비용">
          <h2 className={s.sectionTitle}>
            <Users size={20} />
            연령별 초기 투자 비용
          </h2>
          <p className={s.sectionDesc}>
            <AutoGlossary text="40대의 투자금이 가장 높은 이유는 시설 투자(하우스, 스마트팜)에 적극적이기 때문이에요. 60대는 소규모 노지 재배를 선택하는 경우가 많아 투자금이 낮아요." />
          </p>
          <div
            className={s.barChart}
            role="img"
            aria-label="연령별 초기 투자 비용 막대 그래프"
          >
            {costByAge.map((item) => (
              <div key={item.age} className={s.barRow}>
                <span className={s.barLabel}>{item.age}</span>
                <div className={s.barTrack}>
                  <div
                    className={s.barFill}
                    style={{ width: `${(item.raw / maxAge) * 100}%` }}
                  />
                </div>
                <span className={s.barValue}>{item.amount}</span>
              </div>
            ))}
          </div>
          <Link href="/programs" className={s.inlineLink}>
            내 나이에 맞는 지원사업 확인하기 <ArrowRight size={14} />
          </Link>
        </section>
      )}

      {/* ═══ 작물별 초기 투자 비교 ═══ */}
      {showSection("crop") && (
        <section className={s.section} aria-label="작물별 투자 비교">
          <h2 className={s.sectionTitle}>
            <Sprout size={20} />
            작물별 초기 투자, 이렇게 다릅니다
          </h2>
          <p className={s.sectionDesc}>
            <AutoGlossary text={cropSectionDesc[activeType]} />
          </p>

          {/* ── 모바일: 가로 스크롤 카드 ── */}
          <div className={s.cropCarousel} aria-label="작물별 투자 비용 카드">
            {cropCosts.map((crop) => (
              <CropCard key={crop.id} crop={crop} />
            ))}
          </div>

          {/* ── 데스크탑: 테이블 ── */}
          <div className={s.cropTable} role="table" aria-label="작물별 투자 비용 비교표">
            {/* 테이블 헤더 */}
            <div className={`${s.cropRow} ${s.cropRowHeader}`} role="row">
              <span className={s.cropCellHeader} role="columnheader">작물</span>
              <span className={s.cropCellHeader} role="columnheader">초기 투자</span>
              <span className={s.cropCellHeader} role="columnheader">연 운영비</span>
              <span className={s.cropCellHeader} role="columnheader">손익분기</span>
              <span className={s.cropCellHeader} role="columnheader">노동일</span>
              <span className={s.cropCellHeader} role="columnheader">난이도</span>
            </div>
            {cropCosts.map((crop) => (
              <CropRow key={crop.id} crop={crop} />
            ))}
          </div>

          {/* 출처 표시 — 카테고리별 작물 데이터 */}
          {cropCosts[0]?.source && (
            <p className={s.cropSourceNote}>
              출처 · {Array.from(new Set(cropCosts.map((c) => c.source))).join(" / ")}
              {cropCosts.some((c) => c.isReference) && " · 일부 작물은 단가 기반 참고값이에요"}
            </p>
          )}

          <Link href="/crops" className={s.inlineLink}>
            {CROPS.length}종 작물 전체 비교하기 <ArrowRight size={14} />
          </Link>
        </section>
      )}

      {/* ═══ 단계별 비용 — 5단계 가이드 공용 컴포넌트 ═══ */}
      {showSection("phase") && (
        <section className={s.section} aria-label="단계별 비용">
          <h2 className={s.sectionTitle}>
            <Calendar size={20} />
            단계별 비용, 한눈에 보기
          </h2>
          <p className={s.sectionDesc}>
            <AutoGlossary
              text="비용의 대부분은 4단계(영농 시작)에 집중돼요. 각 카드를 탭하면 해당 단계의 상세 가이드를 확인할 수 있어요."
            />
          </p>
          <StepOverview steps={GUIDE_STEP_SUMMARIES} />
        </section>
      )}

      {/* ═══ 도시 vs 귀농 생활비 ═══ */}
      {showSection("compare") && (
        <section className={s.section} aria-label="도시 농촌 생활비 비교">
          <h2 className={s.sectionTitle}>
            <Home size={20} />
            초기 투자 이후, 생활비는 줄어듭니다
          </h2>
          <p className={s.sectionDesc}>
            <AutoGlossary text="귀농 후 월 생활비는 평균 25% 감소하고, 주거비는 80% 절감돼요. 초기 투자가 부담되더라도 장기적으로 생활비 절감 효과가 있어요." />
          </p>

          <div className={s.compareCard}>
            {costCompareRows.map((row, i) => {
              const sentimentClass =
                row.sentiment === "caution"
                  ? s.compareCaution
                  : row.sentiment === "neutral"
                    ? s.compareNeutral
                    : s.comparePositive;
              return (
                <div
                  key={row.label}
                  className={`${s.compareRow} ${i === 0 ? s.compareRowFirst : ""}`}
                >
                  <span className={s.compareLabel}>{row.label}</span>
                  <div className={s.compareValues}>
                    <div className={s.compareCol}>
                      <span className={s.compareColLabel}>도시</span>
                      <span className={s.compareColValue}>{row.city}</span>
                    </div>
                    <span className={s.compareArrow}>→</span>
                    <div className={s.compareCol}>
                      <span className={s.compareColLabel}>농촌</span>
                      <span className={`${s.compareColValue} ${s.compareColRural}`}>
                        {row.rural}
                      </span>
                    </div>
                    <span className={`${s.compareChange} ${sentimentClass}`}>
                      {row.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className={s.compareSummary}>
            <PiggyBank size={16} />
            월 생활비만 따져도 <strong>연간 약 792만 원</strong> 절감 효과
          </p>
        </section>
      )}

      {/* ═══ 비용 절감 전략 ═══ */}
      {showSection("strategy") && (
        <section className={s.section} aria-label="비용 절감 전략">
          <h2 className={s.sectionTitle}>
            <TrendingDown size={20} />
            비용, 이렇게 줄일 수 있어요
          </h2>
          <p className={s.sectionDesc}>
            <AutoGlossary text="정부 융자와 지원사업을 활용하면 초기 부담을 크게 줄일 수 있어요." />
          </p>

          <CostStrategiesTabs
            active={activeStrategies}
            closed={closedStrategies}
          />

          <div className={s.strategyLinks}>
            <Link href="/programs/roadmap" className={s.inlineLink}>
              정부사업 신청 가이드 보기 <ArrowRight size={14} />
            </Link>
            <Link href="/programs" className={s.inlineLink}>
              지원사업 검색하기 <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {/* ═══ 지원금 적용 시뮬레이션 ═══ */}
      {showSection("support") && (
        <section className={s.section} aria-label="지원금 시뮬레이션">
          <h2 className={s.sectionTitle}>
            <PiggyBank size={20} />
            정부 지원을 적용하면?
          </h2>
          <p className={s.sectionDesc}>
            <AutoGlossary text="평균 초기 비용, 정부 지원사업을 활용하면 실질 자기자본 부담을 크게 줄일 수 있어요." />
          </p>

          <div className={s.simCard}>
            {/* Before */}
            <div className={s.simBefore}>
              <span className={s.simLabel}>평균 초기 투자금</span>
              <span className={s.simBeforeValue}>
                {profile.snapshot.totalValue}
                <span className={s.simBeforeUnit}>{profile.snapshot.totalUnit}</span>
              </span>
            </div>

            {/* 지원 항목 */}
            <div className={s.simItems}>
              {SUPPORT_ITEMS.map((item, i) => (
                <div key={i} className={s.simItem}>
                  <div className={s.simItemLeft}>
                    <span className={s.simItemLabel}>{item.label}</span>
                    <span className={s.simItemNote}>{item.note}</span>
                  </div>
                  <div className={s.simItemRight}>
                    <SupportTypeBadge type={item.type} />
                    <span className={s.simItemAmount}>{item.amount}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* After */}
            <div className={s.simAfter}>
              <div className={s.simAfterContent}>
                <span className={s.simAfterLabel}>
                  지원금 활용 시 실질 부담
                </span>
                <span className={s.simAfterValue}>
                  자기자본 2,000만 원대로 시작 가능
                </span>
                <span className={s.simAfterSub}>
                  * 청년창업농(만 18~39세)의 경우 보조금 + 융자 조합으로 더 낮출 수
                  있어요
                </span>
              </div>
            </div>
          </div>

          <Link href="/programs" className={s.inlineLink}>
            내 조건에 맞는 지원사업 찾기 <ArrowRight size={14} />
          </Link>
        </section>
      )}

      {/* ═══ 인터랙티브 시뮬레이터 ═══ */}
      {showSection("simulator") && (
        <section id="simulator" className={s.section} aria-label="비용 시뮬레이터">
          <h2 className={s.sectionTitle}>
            <Calculator size={20} />
            내 상황으로 계산해 보기
          </h2>
          <p className={s.sectionDesc}>
            연령, 작물, 규모를 선택하면 예상 비용과 지원금 절감 효과를 바로 확인할 수 있어요.
          </p>
          <Suspense fallback={null}>
            <CostSimulator type={activeType} />
          </Suspense>
        </section>
      )}

      <ReferenceNotice text="비용 데이터는 농림축산식품부 실태조사·농촌진흥청 자료를 가공한 참고 자료예요." />

      {/* ═══ 하단 CTA ═══ */}
      <section className={s.ctaSection}>
        <h2 className={s.ctaTitle}>이제 내 상황에 맞게 찾아볼까요?</h2>
        <p className={s.ctaDesc}>
          <AutoGlossary text="지원사업 검색과 맞춤 추천으로 나에게 딱 맞는 사업을 빠르게 찾을 수 있어요." />
        </p>
        <div className={s.ctaButtons}>
          <Link href="/programs" className={s.ctaPrimary}>
            <Search size={18} />
            지원사업 찾아보기
          </Link>
          <Link href="/match?mode=assess" className={s.ctaSecondary}>
            귀농 적합도 진단 받기
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ── 서브 컴포넌트 ── */

/** <strong> 태그가 포함된 totalSub 텍스트를 React 요소로 변환 */
function SnapshotSub({ text }: { text: string }) {
  const parts = text.split(/(<strong>.*?<\/strong>)/);
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^<strong>(.*)<\/strong>$/);
        if (match) return <strong key={i}>{match[1]}</strong>;
        return part;
      })}
    </>
  );
}

function SnapshotCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className={s.snapshotCard}>
      <span className={s.snapshotCardLabel}>{label}</span>
      <span className={s.snapshotCardValue}>{value}</span>
      <span className={s.snapshotCardSub}>{sub}</span>
    </div>
  );
}

/* ── 작물 카드 (모바일) — 작물 페이지 있으면 Link, 없으면 div ── */
function CropCard({ crop }: { crop: CropCost }) {
  const difficultyClass =
    crop.difficulty === "쉬움"
      ? s.difficultyEasy
      : crop.difficulty === "보통"
        ? s.difficultyMedium
        : s.difficultyHard;

  const inner = (
    <>
      <div className={s.cropCardTop}>
        {crop.cropPageId ? (
          <Image
            src={`/crops/${crop.cropPageId}.jpg`}
            alt={crop.name}
            width={44}
            height={44}
            className={s.cropCardImg}
          />
        ) : (
          <div className={s.cropCardImgFallback} aria-hidden="true">
            {crop.name.slice(0, 1)}
          </div>
        )}
        <span className={`${s.difficultyBadge} ${difficultyClass}`}>
          {crop.difficulty}
        </span>
      </div>
      <span className={s.cropCardName}>{crop.name}</span>
      <span className={s.cropCardCost}>{crop.initialCost}</span>
      <div className={s.cropCardMeta}>
        <span>손익분기 {crop.breakEven}</span>
        <span>{crop.labor}</span>
        {crop.facilityType && (
          <span className={s.cropCardFacility}>{crop.facilityType}</span>
        )}
      </div>
    </>
  );

  if (crop.cropPageId) {
    return (
      <Link href={`/crops/${crop.cropPageId}`} className={s.cropCard}>
        {inner}
      </Link>
    );
  }
  return <div className={s.cropCard}>{inner}</div>;
}

/* ── 작물 행 (데스크탑 테이블) ── */
function CropRow({ crop }: { crop: CropCost }) {
  const difficultyClass =
    crop.difficulty === "쉬움"
      ? s.difficultyEasy
      : crop.difficulty === "보통"
        ? s.difficultyMedium
        : s.difficultyHard;

  const inner = (
    <>
      <span className={s.cropName} role="cell">
        {crop.cropPageId ? (
          <Image
            src={`/crops/${crop.cropPageId}.jpg`}
            alt={crop.name}
            width={32}
            height={32}
            className={s.cropImg}
          />
        ) : (
          <div className={s.cropImgFallback} aria-hidden="true">
            {crop.name.slice(0, 1)}
          </div>
        )}
        {crop.name}
      </span>
      <span className={s.cropCell} role="cell" data-label="초기 투자">
        {crop.initialCost}
      </span>
      <span className={s.cropCell} role="cell" data-label="연 운영비">
        {crop.annual}
      </span>
      <span className={s.cropCell} role="cell" data-label="손익분기">
        {crop.breakEven}
      </span>
      <span className={s.cropCell} role="cell" data-label="노동일">
        {crop.labor}
      </span>
      <span className={s.cropCell} role="cell" data-label="난이도">
        <span className={`${s.difficultyBadge} ${difficultyClass}`}>
          {crop.difficulty}
        </span>
      </span>
    </>
  );

  if (crop.cropPageId) {
    return (
      <Link
        href={`/crops/${crop.cropPageId}`}
        className={`${s.cropRow} ${s.cropRowData}`}
        role="row"
      >
        {inner}
      </Link>
    );
  }
  return (
    <div className={`${s.cropRow} ${s.cropRowData}`} role="row">
      {inner}
    </div>
  );
}
