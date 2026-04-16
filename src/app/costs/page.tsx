import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  TrendingDown,
  Calendar,
  Users,
  Search,
  Banknote,
  PiggyBank,
  Home,
} from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { SupportTypeBadge } from "@/components/ui/support-type-badge";
import {
  costSummary,
  costByAge,
  cityVsRural,
} from "@/lib/data/landing";
import { GUIDE_STEP_SUMMARIES } from "@/lib/data/guide-steps";
import { StepOverview } from "@/components/ui/step-overview";
import { DataSource } from "@/components/ui/data-source";
import { CROPS } from "@/lib/data/crops";
import s from "./page.module.css";

/* ── SEO ── */
export const metadata: Metadata = {
  title: "귀농 비용 가이드 — 초기 투자·운영비·생활비",
  description:
    "귀농에 필요한 초기 투자금, 연간 운영비, 생활비를 항목별로 정리했어요. 50대·1인 귀농 자본 계획에 참고하세요.",
};

/* ── 작물별 투자 비교 데이터 (초기투자 기준 정렬) ── */
const CROP_COSTS: {
  id: string;
  name: string;
  initialCost: string;
  annual: string;
  breakEven: string;
  labor: string;
  difficulty: string;
}[] = [
  {
    id: "soybean",
    name: "콩",
    initialCost: "500만 원 미만",
    annual: "200~300만 원",
    breakEven: "1~2년",
    labor: "연 30~50일",
    difficulty: "쉬움",
  },
  {
    id: "corn",
    name: "옥수수",
    initialCost: "500~1,000만 원",
    annual: "200~400만 원",
    breakEven: "1~2년",
    labor: "연 30~50일",
    difficulty: "쉬움",
  },
  {
    id: "sweet-potato",
    name: "고구마",
    initialCost: "1,000~2,000만 원",
    annual: "300~500만 원",
    breakEven: "1~2년",
    labor: "연 60~90일",
    difficulty: "쉬움",
  },
  {
    id: "chili-pepper",
    name: "고추",
    initialCost: "2,000~4,000만 원",
    annual: "600~1,000만 원",
    breakEven: "2~3년",
    labor: "연 80~120일",
    difficulty: "어려움",
  },
  {
    id: "apple",
    name: "사과",
    initialCost: "3,000~6,000만 원",
    annual: "1,000~1,500만 원",
    breakEven: "5~7년",
    labor: "연 150~200일",
    difficulty: "어려움",
  },
  {
    id: "strawberry",
    name: "딸기",
    initialCost: "5,000만~1억 원",
    annual: "1,500~2,500만 원",
    breakEven: "3~5년",
    labor: "연 250일+",
    difficulty: "어려움",
  },
];

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
    amount: "최대 3,960만 원",
    type: "보조금",
    note: "만 18~39세 · 월 최대 110만 원 × 최대 3년 (매년 감액)",
  },
  {
    label: "주택구입 지원",
    amount: "최대 7,500만 원",
    type: "융자",
    note: "연 2% · 세대당 1회",
  },
  {
    label: "귀농교육 수료 시 가산점",
    amount: "우대 적용",
    type: "교육",
    note: "100시간 이상 교육 수료 시 융자 심사 가점",
  },
];

/* ── 도시 vs 귀농 생활비 (비용 관련 항목만 필터) ── */
const COST_COMPARE_LABELS = [
  "월 생활비",
  "주거비 (3.3㎡당)",
  "5년차 소득",
  "생활 만족도",
];
const costCompareRows = cityVsRural.filter((r) =>
  COST_COMPARE_LABELS.includes(r.label),
);

/* ── 비용 절감 전략 데이터 ── */
const STRATEGIES: {
  title: string;
  desc: string;
  saving: string;
  href: string;
  type?: string;
}[] = [
  {
    title: "정부 융자 활용",
    desc: "농업창업자금 최대 3억 원을 연 2% 저금리로 융자받을 수 있습니다.",
    saving: "최대 3억 원",
    href: "/programs/roadmap",
    type: "융자",
  },
  {
    title: "체류형 귀농 프로그램",
    desc: "주거+농지+시설을 무상 제공받으며 수개월간 귀농을 체험할 수 있습니다.",
    saving: "체류 기간 무상",
    href: "/programs?supportType=현물",
    type: "현물",
  },
  {
    title: "청년창업농 영농정착 지원",
    desc: "만 18~39세 청년 창업농에게 월 최대 110만 원을 최대 3년간 지원합니다.",
    saving: "최대 3,960만 원",
    href: "/programs/roadmap",
    type: "보조금",
  },
  {
    title: "소규모로 시작하기",
    desc: "임대 농지 + 노지 재배로 시작하면 초기 투자를 크게 줄일 수 있습니다.",
    saving: "투자금 50%↓",
    href: "/crops",
  },
];

/* ── Page ── */
export default function CostsPage() {
  const maxAge = Math.max(...costByAge.map((d) => d.raw));

  return (
    <div className={s.page}>
      {/* ═══ 히어로 ═══ */}
      <section className={s.hero}>
        <span className={s.heroOverline}>Cost Guide</span>
        <h1 className={s.heroTitle}>
          귀농, <span className={s.heroAccent}>실제로 얼마</span>가 필요할까?
        </h1>
        <p className={s.heroDesc}>
          평균 6,219만 원. 하지만 연령, 작물, 지역에 따라 달라집니다.
          <br />
          내 상황에 맞는 현실적 비용을 확인하세요.
        </p>
      </section>

      {/* ═══ 비용 요약 스냅샷 ═══ */}
      <section className={s.snapshot} aria-label="비용 요약">
        <div className={s.snapshotMain}>
          <p className={s.snapshotLabel}>귀농 평균 총 비용</p>
          <p className={s.snapshotValue}>
            6,219<span className={s.snapshotUnit}>만 원</span>
          </p>
          <p className={s.snapshotSub}>
            이 중 <strong>{costSummary.farmlandPct}</strong>가 영농 준비에 집중
          </p>
        </div>
        <div className={s.snapshotGrid}>
          <SnapshotCard
            label="영농 준비 비용"
            value={costSummary.farmlandAmount}
            sub="농지·시설·장비"
          />
          <SnapshotCard
            label="평균 준비 기간"
            value={costSummary.prepMonths}
            sub="탐색부터 정착까지"
          />
          <SnapshotCard
            label="정부 창업자금"
            value={costSummary.govLoanMax}
            sub="저금리 융자 지원"
          />
          <SnapshotCard
            label="주택자금 지원"
            value={costSummary.housingMax}
            sub="정부 융자 지원"
          />
        </div>
        <DataSource source="농림축산식품부 2025 귀농귀촌 실태조사" />
      </section>

      {/* ═══ 연령별 초기 투자 비용 ═══ */}
      <section className={s.section} aria-label="연령별 비용">
        <h2 className={s.sectionTitle}>
          <Users size={20} />
          연령별 초기 투자 비용
        </h2>
        <p className={s.sectionDesc}>
          <AutoGlossary text="40대의 투자금이 가장 높은 이유는 시설 투자(하우스, 스마트팜)에 적극적이기 때문입니다. 60대는 소규모 노지 재배를 선택하는 경우가 많아 투자금이 낮습니다." />
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

      {/* ═══ 작물별 초기 투자 비교 ═══ */}
      <section className={s.section} aria-label="작물별 투자 비교">
        <h2 className={s.sectionTitle}>
          <Sprout size={20} />
          작물별 초기 투자, 이렇게 다릅니다
        </h2>
        <p className={s.sectionDesc}>
          <AutoGlossary text="평균 6,219만 원이라는 숫자는 작물에 따라 크게 달라집니다. 콩은 500만 원 미만으로도 시작할 수 있지만, 딸기 하우스는 1억 원 이상 투자가 필요합니다." />
        </p>

        {/* ── 모바일: 가로 스크롤 카드 ── */}
        <div className={s.cropCarousel} aria-label="작물별 투자 비용 카드">
          {CROP_COSTS.map((crop) => (
            <Link
              key={crop.id}
              href={`/crops/${crop.id}`}
              className={s.cropCard}
            >
              <div className={s.cropCardTop}>
                <Image
                  src={`/crops/${crop.id}.jpg`}
                  alt={crop.name}
                  width={44}
                  height={44}
                  className={s.cropCardImg}
                />
                <span
                  className={`${s.difficultyBadge} ${
                    crop.difficulty === "쉬움"
                      ? s.difficultyEasy
                      : crop.difficulty === "보통"
                        ? s.difficultyMedium
                        : s.difficultyHard
                  }`}
                >
                  {crop.difficulty}
                </span>
              </div>
              <span className={s.cropCardName}>{crop.name}</span>
              <span className={s.cropCardCost}>{crop.initialCost}</span>
              <div className={s.cropCardMeta}>
                <span>손익분기 {crop.breakEven}</span>
                <span>{crop.labor}</span>
              </div>
            </Link>
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
          {CROP_COSTS.map((crop) => (
            <Link
              key={crop.id}
              href={`/crops/${crop.id}`}
              className={`${s.cropRow} ${s.cropRowData}`}
              role="row"
            >
              <span className={s.cropName} role="cell">
                <Image
                  src={`/crops/${crop.id}.jpg`}
                  alt={crop.name}
                  width={32}
                  height={32}
                  className={s.cropImg}
                />
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
                <span
                  className={`${s.difficultyBadge} ${
                    crop.difficulty === "쉬움"
                      ? s.difficultyEasy
                      : crop.difficulty === "보통"
                        ? s.difficultyMedium
                        : s.difficultyHard
                  }`}
                >
                  {crop.difficulty}
                </span>
              </span>
            </Link>
          ))}
        </div>

        <Link href="/crops" className={s.inlineLink}>
          {CROPS.length}종 작물 전체 비교하기 <ArrowRight size={14} />
        </Link>
      </section>

      {/* ═══ 단계별 비용 — 5단계 가이드 공용 컴포넌트 ═══ */}
      <section className={s.section} aria-label="단계별 비용">
        <h2 className={s.sectionTitle}>
          <Calendar size={20} />
          단계별 비용, 한눈에 보기
        </h2>
        <p className={s.sectionDesc}>
          <AutoGlossary
            text={`평균 ${costSummary.prepMonths}의 준비 기간 중, 비용의 대부분은 4단계(영농 시작)에 집중됩니다. 각 카드를 탭하면 해당 단계의 상세 가이드를 확인할 수 있어요.`}
          />
        </p>
        <StepOverview steps={GUIDE_STEP_SUMMARIES} />
      </section>

      {/* ═══ 도시 vs 귀농 생활비 ═══ */}
      <section className={s.section} aria-label="도시 농촌 생활비 비교">
        <h2 className={s.sectionTitle}>
          <Home size={20} />
          초기 투자 이후, 생활비는 줄어듭니다
        </h2>
        <p className={s.sectionDesc}>
          <AutoGlossary text="귀농 후 월 생활비는 평균 25% 감소하고, 주거비는 80% 절감됩니다. 초기 투자가 부담되더라도 장기적으로 생활비 절감 효과가 있습니다." />
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

      {/* ═══ 비용 절감 전략 ═══ */}
      <section className={s.section} aria-label="비용 절감 전략">
        <h2 className={s.sectionTitle}>
          <TrendingDown size={20} />
          비용, 이렇게 줄일 수 있어요
        </h2>
        <p className={s.sectionDesc}>
          <AutoGlossary text="정부 융자와 지원사업을 활용하면 초기 부담을 크게 줄일 수 있습니다." />
        </p>
        <div className={s.strategies}>
          {STRATEGIES.map((strategy, i) => (
            <Link key={i} href={strategy.href} className={s.strategyCard}>
              <div className={s.strategyTop}>
                <h3 className={s.strategyTitle}>{strategy.title}</h3>
                {strategy.type && (
                  <SupportTypeBadge type={strategy.type} />
                )}
              </div>
              <p className={s.strategyDesc}>{strategy.desc}</p>
              <div className={s.strategyBottom}>
                <span className={s.strategySaving}>
                  <Banknote size={14} />
                  {strategy.saving}
                </span>
                <ArrowRight size={14} className={s.strategyArrow} />
              </div>
            </Link>
          ))}
        </div>
        <div className={s.strategyLinks}>
          <Link href="/programs/roadmap" className={s.inlineLink}>
            정부사업 신청 가이드 보기 <ArrowRight size={14} />
          </Link>
          <Link href="/programs" className={s.inlineLink}>
            지원사업 검색하기 <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ═══ 지원금 적용 시뮬레이션 ═══ */}
      <section className={s.section} aria-label="지원금 시뮬레이션">
        <h2 className={s.sectionTitle}>
          <PiggyBank size={20} />
          정부 지원을 적용하면?
        </h2>
        <p className={s.sectionDesc}>
          <AutoGlossary text="평균 6,219만 원의 초기 비용, 정부 지원사업을 활용하면 실질 자기자본 부담을 크게 줄일 수 있습니다." />
        </p>

        <div className={s.simCard}>
          {/* Before */}
          <div className={s.simBefore}>
            <span className={s.simLabel}>평균 초기 투자금</span>
            <span className={s.simBeforeValue}>
              6,219<span className={s.simBeforeUnit}>만 원</span>
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
                있습니다
              </span>
            </div>
          </div>
        </div>

        <Link href="/programs" className={s.inlineLink}>
          내 조건에 맞는 지원사업 찾기 <ArrowRight size={14} />
        </Link>
      </section>

      {/* ═══ 하단 CTA ═══ */}
      <section className={s.ctaSection}>
        <h2 className={s.ctaTitle}>이제 내 상황에 맞게 찾아볼까요?</h2>
        <p className={s.ctaDesc}>
          <AutoGlossary text="이랑이 제공하는 지원사업 검색과 맞춤 추천으로 나에게 딱 맞는 사업을 빠르게 찾을 수 있습니다." />
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
