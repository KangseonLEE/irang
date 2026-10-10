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
import { IrangSprout as Sprout } from "@/lib/icons/irang-sprout";
import { getCropImageSrc } from "@/lib/crop-image";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { JsonLd } from "@/components/seo/json-ld";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import type { FAQPage } from "schema-dts";
import { SupportTypeBadge } from "@/components/ui/support-type-badge";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { SubPageHero } from "@/components/ui/sub-page-hero";
import {
  costByAge,
  cityVsRural,
  youthSettlementTotalManwon,
  COST_TYPES,
  COST_TYPE_PROFILES,
  type CostTypeId,
} from "@/lib/data/landing";
import { GUIDE_STEP_SUMMARIES } from "@/lib/data/guide-steps";
import { StepOverview } from "@/components/ui/step-overview";
import { DataSource } from "@/components/ui/data-source";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import { shareMetadata } from "@/lib/seo/share-metadata";
import { CROPS } from "@/lib/data/crops";
import { settlementSurvey, settlementSurveyUrl } from "@/lib/data/stats";
import {
  RETURN_FARM_LOAN,
  YOUTH_SETTLEMENT,
  POLICY_TEXT,
  formatManwon,
} from "@/lib/data/policy-facts";
import {
  CROP_COSTS_BY_TYPE,
  STRATEGIES_BY_TYPE,
  COMPARE_LABELS_BY_TYPE,
  type CropCost,
} from "@/lib/data/cost-by-type";
import { getProgramById } from "@/lib/data/programs";
import { programStatusLabel } from "@/lib/program-status";
import CostSimulator from "./cost-simulator";
import CostStrategiesTabs, {
  type StrategyWithStatus,
} from "./cost-strategies-tabs";
import s from "./page.module.css";

/* ── SEO ── */
/* 공유 카드 문구 — metadata.title 은 리터럴로 둔다(seo-titles.test 가 소스에서 정규식으로 읽는다) */
const SHARE_TITLE = "귀농 비용 가이드 — 투자액·생활비·지원금 | 이랑";
const DESCRIPTION =
  "귀농 가구 평균 투자액과 연령대별 투자액, 준비 기간, 생활비 변화를 실태조사 기준으로 정리했어요. 작물별 소득과 정부 융자·보조금도 함께 볼 수 있어요.";

export const metadata: Metadata = {
  title: "귀농 비용 가이드 — 투자액·생활비·지원금",
  description: DESCRIPTION,
  keywords: ["귀농 비용", "귀농 비용 얼마", "정착 비용", "정착 비용 얼마", "귀농 초기 투자", "정착 자본", "50대 정착 비용", "귀농 생활비"],
  alternates: { canonical: "/costs" },
  // 공유 카드 — 페이지 openGraph 가 없으면 레이아웃의 사이트 기본 제목·설명이 그대로 나갔다(10/6 QA Q2-W3)
  ...shareMetadata({ title: SHARE_TITLE, description: DESCRIPTION, path: "/costs" }),
};

/* ── 지원금 시뮬레이션 데이터 — 한도·금리·지원금은 policy-facts.ts 한 곳에서 (10/10) ── */
const SUPPORT_ITEMS: {
  label: string;
  amount: string;
  type: string;
  note: string;
}[] = [
  {
    label: "농업창업자금",
    amount: `최대 ${formatManwon(RETURN_FARM_LOAN.startupMaxManwon.value)}`,
    type: "융자",
    note: `${RETURN_FARM_LOAN.interestRate.value} · ${RETURN_FARM_LOAN.repayment.value}`,
  },
  {
    label: "청년창업농 영농정착지원",
    amount: `최대 ${formatManwon(youthSettlementTotalManwon)}`,
    type: "보조금",
    note: `만 ${YOUTH_SETTLEMENT.ageRange.value[0]}~${YOUTH_SETTLEMENT.ageRange.value[1]}세 · ${POLICY_TEXT.youthMonthly} (매년 감액)`,
  },
  {
    label: "주택구입 지원",
    amount: `최대 ${formatManwon(RETURN_FARM_LOAN.housingMaxManwon.value)}`,
    type: "융자",
    note: `${RETURN_FARM_LOAN.interestRate.value} · 귀농인 대상`,
  },
  {
    // 10/4 QA: "100시간 = 핵심 자격 요건"은 틀린 표기 — 자격은 8시간 이상, 100시간 미만이면 심사 최저 등급(D)
    label: `귀농 교육 ${RETURN_FARM_LOAN.minEducationHours.value}시간 이상`,
    amount: "신청 자격",
    type: "교육",
    note: `${RETURN_FARM_LOAN.lowestGradeBelowHours.value}시간 미만이면 심사 최저 등급이라 사실상 ${RETURN_FARM_LOAN.lowestGradeBelowHours.value}시간이 기준이에요`,
  },
];

/* ── 유형 검증 ── */
function isValidCostType(v: string | undefined): v is CostTypeId {
  return !!v && COST_TYPES.some((t) => t.id === v);
}

/** 봇 트래픽 절감은 next.config.ts headers의 s-maxage로 처리.
 *  searchParams 의존 페이지에 export const revalidate 추가 시 dynamic SSR과 충돌 →
 *  prerender NOT FOUND + site-wide 308 무한 redirect 사고 (2026-05-11 lessons). */

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
    // 배지 라벨 SSOT(9/28): 9999 페어는 "정기 접수"/"공고 발표 예정" — 마감 분리는 아래 필터가 "마감" 문자열로 하므로 유지
    status: (() => {
      if (!strategy.programId) return null;
      const program = getProgramById(strategy.programId);
      return program ? programStatusLabel(program) : null;
    })(),
  }));
  const activeStrategies = strategiesWithStatus.filter(
    ({ status }) => status !== "마감",
  );
  const closedStrategies = strategiesWithStatus.filter(
    ({ status }) => status === "마감",
  );

  /* ── 카테고리별 작물 섹션 설명 문구 ──
     10/10: '콩 300만 원대·사과 6,000만 원 이상'·'산양삼·호두 7년 이상'·'ICT 1,000㎡ 단가' 같은 근거 없는 투자 문구를 지우고,
     작물 상세의 공식 소득 통계로 바꿨다 */
  const cropSectionDesc: Record<CostTypeId, string> = {
    farming:
      "같은 면적이라도 작물에 따라 소득과 일하는 날이 크게 달라요. 경영비를 뺀 10a(약 300평)당 소득이에요.",
    youth:
      "청년농에 인기 있는 시설 작물은 소득이 높은 만큼 일하는 날도 많아요. 경영비를 뺀 10a(약 300평)당 소득이에요.",
    village: "",
    forestry: "",
    smartfarm:
      "스마트온실에서 많이 키우는 작물이에요. 소득은 시설 형태를 나누지 않은 작물별 10a(약 300평)당 값이에요.",
  };

  const investmentAnswer = `농림축산식품부 ${settlementSurvey.year} 귀농귀촌 실태조사에서 귀농 가구가 농지·가축·시설에 투자한 금액은 평균 ${settlementSurvey.investment.toLocaleString("ko-KR")}만 원이었고, 그중 ${settlementSurvey.initialInvestmentShare}%를 정착 초기에 썼어요. 연령별로는 ${costByAge.map((d) => `${d.age} ${d.amount}`).join(", ")}이에요.`;

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[{ name: "정착 비용 가이드", href: "/costs" }]} />
      <JsonLd<FAQPage>
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          /* 10/10 정정: '농촌진흥청 자료 기준 평균 2억~3억 원'은 같은 화면 본문(실태조사 6,219만 원)과 어긋나고 출처도 확인되지 않았다.
             '1인 최소 자본 3,000만~5,000만 원'·'연 운영비 1,000만~2,000만 원'도 근거가 없어 실태조사 값이 있는 질문으로 바꿨다 */
          mainEntity: [
            {
              "@type": "Question",
              name: "귀농 초기 투자금은 얼마나 드나요?",
              acceptedAnswer: { "@type": "Answer", text: investmentAnswer },
            },
            {
              "@type": "Question",
              name: "귀농 준비 기간은 얼마나 걸리나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: `같은 실태조사에서 귀농 준비 기간은 평균 ${settlementSurvey.prepMonths}개월, 귀촌은 ${settlementSurvey.ruralPrepMonths}개월이었어요.`,
              },
            },
            {
              "@type": "Question",
              name: "귀농하면 생활비가 줄어드나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: `귀농 가구의 월평균 생활비는 귀농 전 ${settlementSurvey.livingCostBefore}만 원에서 ${settlementSurvey.livingCostAfter}만 원으로 ${Math.abs(settlementSurvey.livingCostChange)}% 줄었어요(${settlementSurvey.year} 귀농귀촌 실태조사).`,
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
            연령별 투자액
          </h2>
          <p className={s.sectionDesc}>
            {/* 10/10: '40대는 시설 투자에 적극적이라' 같은 원인 설명은 원문에 없어 지웠다 — 원문은 "30~40대 젊은층의 투자액이 높은 수준" */}
            <AutoGlossary text={`농지·가축·시설에 투자한 금액이에요. 30~40대 귀농 가구의 투자액이 다른 연령대보다 많아요(${settlementSurvey.year} 귀농귀촌 실태조사).`} />
          </p>
          <div
            className={s.barChart}
            role="img"
            aria-label="연령별 투자액 막대 그래프"
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
          <DataSource source={`농림축산식품부 ${settlementSurvey.year} 귀농귀촌 실태조사`} href={settlementSurveyUrl} />
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
            작물별 소득, 이렇게 달라요
          </h2>
          <p className={s.sectionDesc}>
            <AutoGlossary text={cropSectionDesc[activeType]} />
          </p>

          {/* ── 모바일: 가로 스크롤 카드 ── */}
          <div className={s.cropCarousel} aria-label="작물별 소득 카드">
            {cropCosts.map((crop) => (
              <CropCard key={crop.id} crop={crop} />
            ))}
          </div>

          {/* ── 데스크탑: 테이블 ── */}
          <div className={s.cropTable} role="table" aria-label="작물별 소득 비교표">
            {/* 테이블 헤더 — 10/10: 원문 없던 초기 투자·연 운영비·손익분기 칸을 빼고 작물 상세의 공식 소득·노동일로 */}
            <div className={s.cropRowHeader} role="row">
              <span className={s.cropCellHeader} role="columnheader">작물</span>
              <span className={s.cropCellHeader} role="columnheader">10a당 소득</span>
              <span className={s.cropCellHeader} role="columnheader">소득 기준</span>
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
              출처 · {Array.from(new Set(cropCosts.map((c) => c.source))).join(" / ")} · 노동일은 작물 상세 기준
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
              text={`귀농 가구 투자의 ${settlementSurvey.initialInvestmentShare}%는 정착 초기에 들어가요(${settlementSurvey.year} 실태조사). 각 카드를 탭하면 해당 단계의 상세 가이드를 확인할 수 있어요.`}
            />
          </p>
          <StepOverview steps={GUIDE_STEP_SUMMARIES} />
        </section>
      )}

      {/* ═══ 도시 vs 농촌 생활비 ═══ */}
      {showSection("compare") && (
        <section className={s.section} aria-label="도시 농촌 생활비 비교">
          <h2 className={s.sectionTitle}>
            <Home size={20} />
            초기 투자 이후, 생활비는 줄어요
          </h2>
          <p className={s.sectionDesc}>
            {/* 10/3 정정: "25% 감소·주거비 80% 절감"은 근거 없던 문구 — 실태조사 생활비 감소율만 데이터에서 */}
            <AutoGlossary
              text={`정착 후 월 생활비는 평균 ${Math.abs(settlementSurvey.livingCostChange)}% 줄어요(${settlementSurvey.year} 귀농·귀촌 실태조사). 초기 투자가 부담되더라도 장기적으로 생활비 절감 효과가 있어요.`}
            />
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
            월 생활비만 따져도{" "}
            <strong>
              연간 약{" "}
              {(
                (settlementSurvey.livingCostBefore - settlementSurvey.livingCostAfter) *
                12
              ).toLocaleString("ko-KR")}
              만 원
            </strong>{" "}
            절감 효과
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
            <AutoGlossary text="정부 융자와 보조금을 함께 보면 처음에 마련해야 할 돈을 가늠할 수 있어요." />
          </p>

          <div className={s.simCard}>
            {/* Before */}
            <div className={s.simBefore}>
              <span className={s.simLabel}>{profile.snapshot.totalLabel}</span>
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
                {/* 10/10: '자기자본 2,000만 원대로 시작 가능'은 근거가 없어 지웠다 — 융자·보조금의 성격만 안내 */}
                <span className={s.simAfterLabel}>알아 두세요</span>
                <span className={s.simAfterValue}>
                  융자는 갚는 돈, 보조금은 조건이 있어요
                </span>
                <span className={s.simAfterSub}>
                  * 영농정착지원금은 만 {YOUTH_SETTLEMENT.ageRange.value[0]}~{YOUTH_SETTLEMENT.ageRange.value[1]}세 청년 창업농이 선발돼야 받아요
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
            연령대, 작물, 재배 면적을 고르면 평균 투자액과 예상 소득을 함께 볼 수 있어요.
          </p>
          <Suspense fallback={null}>
            <CostSimulator type={activeType} />
          </Suspense>
        </section>
      )}

      <ReferenceNotice text="비용 데이터는 농림축산식품부 실태조사·농촌진흥청 자료를 가공한 참고 자료예요." />

      {/* ═══ 하단 CTA ═══ */}
      <section className={s.ctaSection}>
        <h2 className={s.ctaTitle}>내 상황으로 찾아볼까요?</h2>
        <p className={s.ctaDesc}>
          <AutoGlossary text="지원사업 검색과 맞춤 추천으로 나에게 딱 맞는 사업을 빠르게 찾을 수 있어요." />
        </p>
        <div className={s.ctaButtons}>
          <Link href="/programs" className={s.ctaPrimary}>
            <Search size={18} />
            지원사업 찾아보기
          </Link>
          <Link href="/match?mode=assess" className={s.ctaSecondary}>
            농촌 정착 적합도 진단 받기
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

/* ── 작물 카드 (모바일) — 작물 상세로 이동 ── */
function CropCard({ crop }: { crop: CropCost }) {
  return (
    <Link href={`/crops/${crop.cropPageId}`} className={s.cropCard}>
      <div className={s.cropCardTop}>
        {/* 카드 안에 이름이 있다 — 그림은 장식(링크 이름에 작물명이 두 번 들어가지 않게) */}
        <Image
          src={getCropImageSrc(crop.cropPageId)}
          alt=""
          width={44}
          height={44}
          className={s.cropCardImg}
        />
        <DifficultyBadge level={crop.difficulty} size="sm" />
      </div>
      <span className={s.cropCardName}>{crop.name}</span>
      <span className={s.cropCardCost}>
        {crop.income === "자료 없음" ? "소득 자료 없음" : `10a당 ${crop.income}`}
      </span>
      <div className={s.cropCardMeta}>
        <span>{crop.labor}</span>
        {crop.basis && <span className={s.cropCardFacility}>{crop.basis}</span>}
      </div>
    </Link>
  );
}

/* ── 작물 행 (데스크탑 테이블) ──
   행 전체가 작물 페이지로 가는 건 그대로, 링크는 첫 칸 작물명에 두고 ::after 로 행을 덮는다(10/6 QA).
   예전엔 <a role="row"> 라 링크 역할이 행 역할에 덮여 스크린리더가 링크로 읽지 못했다(axe aria-allowed-role 6건). */
function CropRow({ crop }: { crop: CropCost }) {
  return (
    <div className={`${s.cropRowData} ${s.cropRowLinked}`} role="row">
      <span className={s.cropName} role="cell">
        {/* 이름이 바로 옆에 있다 — 그림은 장식(이름을 두 번 읽지 않게) */}
        <Image
          src={getCropImageSrc(crop.cropPageId)}
          alt=""
          width={32}
          height={32}
          className={s.cropImg}
        />
        <Link href={`/crops/${crop.cropPageId}`} className={s.cropRowLink}>
          {crop.name}
        </Link>
      </span>
      <span className={s.cropCell} role="cell" data-label="10a당 소득">
        {crop.income}
      </span>
      <span className={s.cropCell} role="cell" data-label="소득 기준">
        {crop.basis ?? "—"}
      </span>
      <span className={s.cropCell} role="cell" data-label="노동일">
        {crop.labor}
      </span>
      <span className={s.cropCell} role="cell" data-label="난이도">
        <DifficultyBadge level={crop.difficulty} size="sm" />
      </span>
    </div>
  );
}
