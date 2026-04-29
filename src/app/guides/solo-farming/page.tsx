import type { Metadata } from "next";
import Link from "next/link";
import {
  Leaf,
  Wallet,
  Users,
  Wrench,
  Store,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { SubPageHero } from "@/components/ui/sub-page-hero";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import type { Article } from "schema-dts";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "1인 귀농 가이드 — 혼자서도 가능한 귀농 전략 | 이랑",
  description:
    "혼자서도 귀농할 수 있을까요? 1인 귀농에 적합한 작물, 필요 자본, 핵심 과제와 맞춤 전략을 정리했어요.",
  keywords: [
    "1인 귀농",
    "혼자 귀농",
    "1인 귀농 가능",
    "1인 귀농 작물",
    "혼자 농사",
  ],
  alternates: { canonical: "/guides/solo-farming" },
};

const REALITY_CHECK = [
  {
    icon: Leaf,
    title: "적합한 작물",
    desc: "노동 강도 낮은 밭작물(쌀, 콩, 고구마)이나 소규모 시설작물(상추, 허브, 엽채류)이 혼자 관리하기에 좋아요.",
  },
  {
    icon: Wallet,
    title: "필요 자본",
    desc: "임대 기준 3,000만~5,000만 원으로 시작할 수 있어요. 매입보다 임대로 시작하는 게 리스크를 줄이는 방법이에요.",
  },
  {
    icon: AlertTriangle,
    title: "핵심 과제",
    desc: "농번기 인력 확보, 사회적 고립 방지가 가장 중요한 과제예요. 미리 대비하면 충분히 극복할 수 있어요.",
  },
];

const STRATEGIES = [
  {
    icon: Users,
    title: "공동체 활용",
    items: [
      "지역 귀농인 모임에 적극 참여하세요. 정보 교류와 정서적 지지를 동시에 얻을 수 있어요.",
      "농업법인이나 공동작업반에 가입하면 농번기 인력 교환이 가능해요.",
      "마을 이장, 부녀회 등 기존 커뮤니티에도 참여하세요. 농촌에서는 관계가 곧 인프라예요.",
    ],
  },
  {
    icon: Wrench,
    title: "기계화 전략",
    items: [
      "소형 농기계(관리기, 자동관수 시스템 등)에 투자하면 혼자서도 넓은 면적을 관리할 수 있어요.",
      "농업기술센터의 공동 임대 서비스를 활용하세요. 초기 구매 부담을 줄일 수 있어요.",
      "스마트팜 기술(자동 환기, 양액 자동 제어)을 도입하면 노동 시간을 크게 줄일 수 있어요.",
    ],
  },
  {
    icon: Store,
    title: "6차 산업화",
    items: [
      "직판(로컬푸드 매장, 온라인 쇼핑몰)으로 유통 마진을 줄이고 수익을 높이세요.",
      "가공(잼, 건조 과일, 차 등)으로 부가가치를 만들 수 있어요. 가공식품 창업 교육도 활용하세요.",
      "농장 체험 프로그램을 운영하면 추가 수입원이 생겨요. 관광 자원이 있는 지역이 유리해요.",
    ],
  },
];

export default function SoloFarmingGuidePage() {
  return (
    <article className={s.page}>
      <BreadcrumbJsonLd
        items={[
          { name: "귀농 가이드", href: "/guides" },
          { name: "1인 귀농", href: "/guides/solo-farming" },
        ]}
      />
      <JsonLd<Article>
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "혼자서도 귀농할 수 있을까?",
          description:
            "1인 귀농, 가능하지만 준비가 다르다. 적합한 작물, 필요 자본, 맞춤 전략을 정리했어요.",
          author: {
            "@type": "Organization",
            name: "이랑",
            url: "https://irangfarm.com",
          },
        }}
      />

      {/* ── 히어로 ── */}
      <SubPageHero
        overline="SOLO FARMING GUIDE"
        title="혼자서도 귀농할 수 있을까?"
        description="1인 귀농, 가능하지만 준비가 달라요."
      />

      {/* ── 현실 체크 ── */}
      <section className={s.realitySection}>
        <h2 className={s.sectionTitle}>1인 귀농 현실 체크</h2>
        <div className={s.realityCards}>
          {REALITY_CHECK.map((card) => {
            const CardIcon = card.icon;
            return (
              <div key={card.title} className={s.realityCard}>
                <div className={s.realityIcon}>
                  <CardIcon size={18} strokeWidth={1.75} aria-hidden="true" />
                </div>
                <div className={s.realityBody}>
                  <h3 className={s.realityCardTitle}>{card.title}</h3>
                  <p className={s.realityCardDesc}>
                    <AutoGlossary text={card.desc} maxHighlights={2} />
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 1인 맞춤 전략 ── */}
      <section className={s.strategySection}>
        <h2 className={s.sectionTitle}>1인 맞춤 전략</h2>
        <div className={s.strategies}>
          {STRATEGIES.map((strategy) => {
            const StratIcon = strategy.icon;
            return (
              <div key={strategy.title} className={s.strategyCard}>
                <div className={s.strategyHeader}>
                  <div className={s.strategyIcon}>
                    <StratIcon size={18} strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <h3 className={s.strategyTitle}>{strategy.title}</h3>
                </div>
                <ul className={s.strategyItems}>
                  {strategy.items.map((item, i) => (
                    <li key={i} className={s.strategyItem}>
                      <Icon icon={CheckCircle2} size="sm" className={s.checkIcon} />
                      <span>
                        <AutoGlossary text={item} maxHighlights={2} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 요약 박스 ── */}
      <section className={s.summaryBox}>
        <h2 className={s.summaryTitle}>1인 귀농 핵심 요약</h2>
        <div className={s.summaryItems}>
          <div className={s.summaryItem}>
            <span className={s.summaryLabel}>추천 작물</span>
            <span className={s.summaryValue}>밭작물(콩, 고구마), 엽채류(상추, 허브)</span>
          </div>
          <div className={s.summaryItem}>
            <span className={s.summaryLabel}>시작 자본</span>
            <span className={s.summaryValue}>임대 기준 3,000만~5,000만 원</span>
          </div>
          <div className={s.summaryItem}>
            <span className={s.summaryLabel}>권장 면적</span>
            <span className={s.summaryValue}>3,000m2 이하에서 시작</span>
          </div>
          <div className={s.summaryItem}>
            <span className={s.summaryLabel}>필수 준비</span>
            <span className={s.summaryValue}>공동체 가입, 농기계 임대, 판로 확보</span>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={s.cta}>
        <h2 className={s.ctaTitle}>나에게 맞는 작물 찾기</h2>
        <p className={s.ctaDesc}>
          노동 강도, 수익성, 재배 난이도로 비교해 보세요.
        </p>
        <div className={s.ctaButtons}>
          <Link href="/crops" className={s.ctaPrimary}>
            작물 정보 보기
            <Icon icon={ArrowRight} size="md" />
          </Link>
          <Link href="/education" className={s.ctaSecondary}>
            교육 프로그램 찾기
          </Link>
        </div>
      </section>

      {/* ── 관련 가이드 ── */}
      <nav className={s.related}>
        <h3 className={s.relatedTitle}>관련 가이드</h3>
        <div className={s.relatedLinks}>
          <Link href="/guides/preparation" className={s.relatedLink}>
            귀농 준비 순서 보기
            <Icon icon={ArrowRight} size="sm" />
          </Link>
          <Link href="/guides/budget-50s" className={s.relatedLink}>
            50대 귀농 자본 알아보기
            <Icon icon={ArrowRight} size="sm" />
          </Link>
          <Link href="/guide" className={s.relatedLink}>
            5단계 프로세스 가이드
            <Icon icon={ArrowRight} size="sm" />
          </Link>
        </div>
      </nav>
    </article>
  );
}
