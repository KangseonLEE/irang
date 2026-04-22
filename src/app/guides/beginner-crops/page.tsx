import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  AlertTriangle,
  ThermometerSun,
  Wallet,
  Store,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { SubPageHero } from "@/components/ui/sub-page-hero";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import type { Article } from "schema-dts";
import { CROPS, CROP_DETAILS } from "@/lib/data/crops";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "초보 귀농 추천 작물 — 난이도 낮은 작물 TOP 5 | 이랑",
  description:
    "처음 귀농한다면 난이도 낮고 안정적인 작물부터 시작하세요. 초보자에게 추천하는 작물 5가지와 선택 기준을 정리했어요.",
  keywords: [
    "초보 귀농 추천 작물",
    "귀농 초보 작물",
    "쉬운 작물",
    "귀농 작물 추천",
    "초보 농사 작물",
  ],
};

/* -- 데이터에서 난이도 '쉬움' 작물 추출 (최대 5개) -- */
const EASY_CROPS = CROPS.filter((c) => c.difficulty === "쉬움").slice(0, 5);

/* -- 각 쉬움 작물의 상세 정보 매칭 -- */
function getCropDetail(cropId: string) {
  return CROP_DETAILS.find((d) => d.id === cropId);
}

/* -- 난이도 '어려움' 작물 중 대표 3개 -- */
const HARD_CROPS = CROPS.filter((c) => c.difficulty === "어려움").slice(0, 3);

const SELECTION_CRITERIA = [
  {
    icon: ThermometerSun,
    title: "기후에 맞는 작물인가?",
    desc: "같은 작물도 지역에 따라 수확량이 크게 달라져요. 내 지역의 기온, 강수량, 일조시간을 먼저 확인하세요.",
    linkLabel: "지역 비교하기",
    linkHref: "/regions/compare",
  },
  {
    icon: Wallet,
    title: "초기 투자는 감당 가능한가?",
    desc: "노지재배와 시설재배는 초기 비용이 10배 이상 차이나요. 예산에 맞는 재배 방식을 선택하세요.",
    linkLabel: "비용 가이드 보기",
    linkHref: "/costs",
  },
  {
    icon: Store,
    title: "판로는 확보 가능한가?",
    desc: "재배한 작물을 팔 수 있어야 수익이 돼요. 직거래, 로컬푸드 매장, 도매시장 등 지역 판로를 확인하세요.",
    linkLabel: "지원사업 확인하기",
    linkHref: "/programs",
  },
];

export default function BeginnerCropsGuidePage() {
  return (
    <article className={s.page}>
      <BreadcrumbJsonLd
        items={[
          { name: "귀농 가이드", href: "/guides" },
          { name: "초보 추천 작물", href: "/guides/beginner-crops" },
        ]}
      />
      <JsonLd<Article>
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "처음 귀농한다면, 이 작물부터",
          description:
            "난이도 낮고 안정적인 작물로 시작하세요.",
          author: {
            "@type": "Organization",
            name: "이랑",
            url: "https://irangfarm.com",
          },
        }}
      />

      {/* -- 히어로 -- */}
      <SubPageHero
        overline="BEGINNER CROPS"
        title="처음 귀농한다면, 이 작물부터"
        description="난이도 낮고 안정적인 작물로 시작하세요."
      />

      {/* -- 추천 작물 TOP 5 -- */}
      <section className={s.cropsSection}>
        <h2 className={s.sectionTitle}>추천 작물 TOP {EASY_CROPS.length}</h2>
        <div className={s.cropCards}>
          {EASY_CROPS.map((crop, idx) => {
            const detail = getCropDetail(crop.id);
            return (
              <Link
                key={crop.id}
                href={`/crops/${crop.id}`}
                className={s.cropCard}
              >
                <div className={s.cropCardTop}>
                  <span className={s.cropRank}>{idx + 1}</span>
                  <span className={s.cropEmoji} aria-hidden="true">
                    {crop.emoji}
                  </span>
                  <div className={s.cropMeta}>
                    <h3 className={s.cropName}>{crop.name}</h3>
                    <span className={s.cropBadge}>난이도 쉬움</span>
                  </div>
                  <Icon icon={ArrowRight} size="md" className={s.cropArrow} />
                </div>
                <div className={s.cropInfo}>
                  {detail?.income?.revenueRange && (
                    <div className={s.cropInfoItem}>
                      <span className={s.cropInfoLabel}>예상 소득</span>
                      <span className={s.cropInfoValue}>
                        {detail.income.revenueRange}
                      </span>
                    </div>
                  )}
                  <div className={s.cropInfoItem}>
                    <span className={s.cropInfoLabel}>재배 시기</span>
                    <span className={s.cropInfoValue}>
                      {crop.growingSeason}
                    </span>
                  </div>
                </div>
                <p className={s.cropDesc}>
                  <AutoGlossary text={crop.description} maxHighlights={2} />
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* -- 피해야 할 작물 -- */}
      <section className={s.avoidSection}>
        <h2 className={s.sectionTitle}>초보자가 피해야 할 작물</h2>
        <div className={s.cautionBox}>
          <Icon icon={AlertTriangle} size="md" color="warning" variant="soft" />
          <p className={s.cautionText}>
            아래 작물은 수익성이 높지만 재배 난이도가 높아서,
            경험 없이 시작하면 실패 확률이 높아요.
          </p>
        </div>
        <div className={s.avoidCards}>
          {HARD_CROPS.map((crop) => (
            <div key={crop.id} className={s.avoidCard}>
              <span className={s.avoidEmoji} aria-hidden="true">
                {crop.emoji}
              </span>
              <div className={s.avoidBody}>
                <strong className={s.avoidName}>{crop.name}</strong>
                <span className={s.avoidReason}>
                  {crop.id === "chili-pepper" &&
                    "탄저병 등 병해충 관리가 까다로워요"}
                  {crop.id === "apple" &&
                    "수확까지 3~5년, 초기 투자비가 커요"}
                  {crop.id === "pear" &&
                    "전정 기술이 필수, 수확까지 3~4년 걸려요"}
                  {crop.id === "strawberry" &&
                    "온도 관리가 까다롭고 노동 집약적이에요"}
                  {crop.id === "ginseng" &&
                    "연작 불가, 4~6년 장기 투자가 필요해요"}
                  {crop.id === "mango" &&
                    "100% 시설재배, 높은 난방비가 필요해요"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* -- 작물 선택 기준 -- */}
      <section className={s.criteriaSection}>
        <h2 className={s.sectionTitle}>작물 선택 기준 3가지</h2>
        <div className={s.criteriaCards}>
          {SELECTION_CRITERIA.map((item) => {
            const CriteriaIcon = item.icon;
            return (
              <div key={item.title} className={s.criteriaCard}>
                <div className={s.criteriaCardHeader}>
                  <div className={s.criteriaCardIcon}>
                    <CriteriaIcon
                      size={18}
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className={s.criteriaCardTitle}>{item.title}</h3>
                </div>
                <p className={s.criteriaCardDesc}>
                  <AutoGlossary text={item.desc} maxHighlights={2} />
                </p>
                <Link href={item.linkHref} className={s.criteriaLink}>
                  {item.linkLabel}
                  <Icon icon={ArrowRight} size="sm" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* -- CTA -- */}
      <section className={s.cta}>
        <h2 className={s.ctaTitle}>작물을 비교해 보세요</h2>
        <p className={s.ctaDesc}>
          소득, 난이도, 재배 시기를 한눈에 비교할 수 있어요.
        </p>
        <Link href="/crops/compare" className={s.ctaButton}>
          작물 상세 비교하기
          <Icon icon={ArrowRight} size="md" />
        </Link>
      </section>

      {/* -- 관련 가이드 -- */}
      <nav className={s.related}>
        <h3 className={s.relatedTitle}>관련 가이드</h3>
        <div className={s.relatedLinks}>
          <Link href="/guides/failure-cases" className={s.relatedLink}>
            귀농 실패 사례 보기
            <Icon icon={ArrowRight} size="sm" />
          </Link>
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
