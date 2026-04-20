import type { Metadata } from "next";
import Link from "next/link";
import {
  Home,
  Warehouse,
  ShoppingCart,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  Banknote,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { SubPageHero } from "@/components/ui/sub-page-hero";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import type { Article } from "schema-dts";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "50대 귀농 자본 — 현실적인 비용 가이드 | 이랑",
  description:
    "50대 귀농, 자본은 얼마나 필요할까요? 농지·주택, 시설·장비, 생활비까지 항목별 현실 비용과 50대 맞춤 전략을 정리했어요.",
  keywords: [
    "50대 귀농 자본",
    "50대 귀농 비용",
    "50대 귀농 준비",
    "귀농 비용",
    "은퇴 후 귀농",
  ],
};

const COST_CARDS = [
  {
    icon: Home,
    title: "농지·주택",
    items: [
      { label: "매매", value: "1.5~3억 원", note: "지역·면적에 따라 편차 큼" },
      { label: "임대", value: "월 30~80만 원", note: "보증금 별도" },
    ],
    tip: "초기에는 임대로 시작하는 게 리스크를 줄이는 방법이에요. 농지은행을 활용하면 합리적인 가격에 임차할 수 있어요.",
  },
  {
    icon: Warehouse,
    title: "시설·장비",
    items: [
      { label: "비닐하우스", value: "3,000만~1억 원", note: "규모·자재에 따라" },
      { label: "소형 농기계", value: "1,000~3,000만 원", note: "관리기, 경운기 등" },
    ],
    tip: "농업기술센터의 공동 임대 서비스를 활용하면 초기 투자비를 크게 줄일 수 있어요. 구매는 2~3년 경험 후 결정해도 늦지 않아요.",
  },
  {
    icon: ShoppingCart,
    title: "생활비",
    items: [
      { label: "2인 가구 기준", value: "월 150~250만 원", note: "식비, 교통, 공과금 포함" },
      { label: "초기 안정 자금", value: "3,600~6,000만 원", note: "2년치 생활비 별도 확보 권장" },
    ],
    tip: "귀농 후 첫 수확까지 소득 공백이 발생해요. 채소류 3~6개월, 과수류는 3~5년이 걸리므로 생활비를 미리 확보하세요.",
  },
];

const TIPS_50S = [
  {
    title: "퇴직금 전액 투자 금지",
    desc: "퇴직금의 50% 이하만 영농에 투자하고, 나머지는 생활비와 예비비로 확보하세요. 첫 2~3년은 적자가 일반적이에요.",
  },
  {
    title: "소규모·임대로 시작",
    desc: "3,000m2 이하 소규모로 시작해서 재배 기술을 익힌 후 확대하세요. 3년 후 확장 전략이 실패 확률을 낮춰요.",
  },
  {
    title: "체력 관리가 핵심",
    desc: "노동 강도가 낮은 작물(엽채류, 약용작물, 특용작물)부터 시작하세요. 무리한 노동은 부상으로 이어질 수 있어요.",
  },
  {
    title: "지원사업 적극 활용",
    desc: "귀농 정착금(최대 3억 원 융자), 영농 자금 대출, 주택 수리비 지원(최대 2,000만 원) 등을 놓치지 마세요.",
  },
];

export default function Budget50sGuidePage() {
  return (
    <article className={s.page}>
      <BreadcrumbJsonLd
        items={[
          { name: "귀농 가이드", href: "/guides" },
          { name: "50대 귀농 자본", href: "/guides/budget-50s" },
        ]}
      />
      <JsonLd<Article>
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "50대 귀농, 자본은 얼마나 필요할까?",
          description:
            "은퇴 후 귀농을 고민 중이라면, 현실적인 비용부터 확인하세요.",
          author: {
            "@type": "Organization",
            name: "이랑",
            url: "https://irang-wheat.vercel.app",
          },
        }}
      />

      {/* ── 히어로 ── */}
      <SubPageHero
        overline="BUDGET GUIDE · 50s"
        title="50대 귀농, 자본은 얼마나 필요할까?"
        description="은퇴 후 귀농을 고민 중이라면, 현실적인 비용부터 확인하세요."
      />

      {/* ── 비용 카드 ── */}
      <section className={s.costSection}>
        <h2 className={s.sectionTitle}>항목별 예상 비용</h2>
        <div className={s.costCards}>
          {COST_CARDS.map((card) => {
            const CardIcon = card.icon;
            return (
              <div key={card.title} className={s.costCard}>
                <div className={s.costCardHeader}>
                  <div className={s.costCardIcon}>
                    <CardIcon size={18} strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <h3 className={s.costCardTitle}>{card.title}</h3>
                </div>
                <div className={s.costItems}>
                  {card.items.map((item) => (
                    <div key={item.label} className={s.costItem}>
                      <span className={s.costLabel}>{item.label}</span>
                      <span className={s.costValue}>{item.value}</span>
                      <span className={s.costNote}>{item.note}</span>
                    </div>
                  ))}
                </div>
                <p className={s.costTip}>
                  <AutoGlossary text={card.tip} maxHighlights={2} />
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 50대 특화 팁 ── */}
      <section className={s.tipsSection}>
        <h2 className={s.sectionTitle}>50대 맞춤 전략</h2>

        <div className={s.cautionBox}>
          <Icon icon={AlertTriangle} size="md" color="warning" variant="soft" />
          <p className={s.cautionText}>
            <AutoGlossary
              text="귀농 투자 평균 약 5,260만 원. 안정된 기반을 마련하는 데 4~5년이 걸리므로, 그 기간의 여유자금을 반드시 별도 확보하세요."
              maxHighlights={2}
            />
          </p>
        </div>

        <div className={s.tipCards}>
          {TIPS_50S.map((tip) => (
            <div key={tip.title} className={s.tipCard}>
              <h3 className={s.tipCardTitle}>
                <Icon icon={Lightbulb} size="sm" />
                {tip.title}
              </h3>
              <p className={s.tipCardDesc}>
                <AutoGlossary text={tip.desc} maxHighlights={2} />
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 지원사업 안내 ── */}
      <section className={s.supportSection}>
        <h2 className={s.sectionTitle}>활용 가능한 지원사업</h2>
        <div className={s.supportItems}>
          <div className={s.supportItem}>
            <Icon icon={Banknote} size="md" variant="soft" />
            <div className={s.supportBody}>
              <strong>귀농 창업 정착금</strong>
              <span>최대 3억 원 융자 (이자 2%대)</span>
            </div>
          </div>
          <div className={s.supportItem}>
            <Icon icon={Banknote} size="md" variant="soft" />
            <div className={s.supportBody}>
              <strong>영농 자금 대출</strong>
              <span>운영·시설 자금 저금리 대출</span>
            </div>
          </div>
          <div className={s.supportItem}>
            <Icon icon={Banknote} size="md" variant="soft" />
            <div className={s.supportBody}>
              <strong>주택 수리비 지원</strong>
              <span>최대 2,000만 원 (빈집 수리 포함)</span>
            </div>
          </div>
        </div>
        <Link href="/programs" className={s.supportLink}>
          지원사업 전체 보기
          <Icon icon={ArrowRight} size="sm" />
        </Link>
      </section>

      {/* ── CTA ── */}
      <section className={s.cta}>
        <h2 className={s.ctaTitle}>비용 시뮬레이션 해보세요</h2>
        <p className={s.ctaDesc}>
          비용 가이드에서 내 상황에 맞는 예상 비용을 계산할 수 있어요.
        </p>
        <div className={s.ctaButtons}>
          <Link href="/costs" className={s.ctaPrimary}>
            비용 가이드 보기
            <Icon icon={ArrowRight} size="md" />
          </Link>
          <Link href="/crops" className={s.ctaSecondary}>
            작물별 수익 비교
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
          <Link href="/guides/solo-farming" className={s.relatedLink}>
            1인 귀농 가이드 보기
            <Icon icon={ArrowRight} size="sm" />
          </Link>
        </div>
      </nav>
    </article>
  );
}
