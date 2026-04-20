import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  GraduationCap,
  MapPin,
  FileText,
  Sprout,
  ArrowRight,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { SubPageHero } from "@/components/ui/sub-page-hero";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import type { HowTo } from "schema-dts";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "귀농 준비 순서 — 5단계 체크리스트 | 이랑",
  description:
    "귀농 준비, 어떤 순서로 하면 좋을까요? 정보 수집부터 영농 시작까지 5단계로 정리했어요. 각 단계별 핵심 과업과 이랑 기능을 연결해 드려요.",
  keywords: [
    "귀농 준비 순서",
    "귀농 절차",
    "귀농 준비 체크리스트",
    "귀농 단계",
    "귀농 방법",
  ],
};

interface Step {
  step: number;
  icon: LucideIcon;
  title: string;
  period: string;
  items: string[];
  links: { label: string; href: string }[];
}

const STEPS: Step[] = [
  {
    step: 1,
    icon: Search,
    title: "정보 수집",
    period: "3~6개월 전",
    items: [
      "귀농귀촌종합센터에서 무료 상담을 받아보세요. 온·오프라인 모두 가능해요.",
      "관심 있는 지역 3곳 이상을 후보로 정하고, 기후·인프라·지원사업을 비교해 보세요.",
      "온라인 귀농 교육을 수강하며 기초 지식을 쌓으세요. 농림축산식품부 인증 교육이 이수 시간으로 인정돼요.",
      "가족과 충분히 대화하세요. 자녀 전학, 배우자 취업 등 현실적인 부분을 함께 정리해야 해요.",
    ],
    links: [
      { label: "지역 비교하기", href: "/regions" },
      { label: "작물 정보 보기", href: "/crops" },
    ],
  },
  {
    step: 2,
    icon: GraduationCap,
    title: "교육 이수",
    period: "2~4개월 전",
    items: [
      "시·도 농업기술센터에서 귀농 창업 교육(100시간 이상)을 이수하세요. 대부분의 지원사업 신청에 필요해요.",
      "관심 작물 관련 전문 교육(과수 재배, 스마트팜 등)도 병행하면 좋아요.",
      "교육 과정에서 만난 동기생이 정착 후 가장 든든한 네트워크가 돼요.",
      "체류형 귀농 교육은 숙박 + 현장 실습이 포함되어 현지 생활을 미리 경험할 수 있어요.",
    ],
    links: [
      { label: "교육 프로그램 찾기", href: "/education" },
      { label: "지원사업 확인하기", href: "/programs" },
    ],
  },
  {
    step: 3,
    icon: MapPin,
    title: "지역 선정",
    period: "1~3개월 전",
    items: [
      "후보지 2~3곳을 직접 방문하세요. 1~2주 체류하며 기후, 마을 분위기, 생활 인프라를 확인해요.",
      "의료기관, 학교, 마트까지의 거리를 실측하세요. 특히 응급 의료 접근성이 중요해요.",
      "체험 프로그램을 활용하면 숙소·농가 체험이 지원돼요.",
      "계절별 차이가 크기 때문에, 여름과 겨울 모두 방문해 보는 게 좋아요.",
    ],
    links: [
      { label: "지역 상세 보기", href: "/regions" },
      { label: "체험·행사 일정", href: "/events" },
    ],
  },
  {
    step: 4,
    icon: FileText,
    title: "정착 준비",
    period: "1개월 전",
    items: [
      "주거를 확보하세요. 초기에는 매입보다 임대로 시작하는 게 리스크를 줄이는 방법이에요.",
      "농지를 확보하세요. 한국농어촌공사의 농지은행을 활용하면 임차 농지를 찾을 수 있어요.",
      "영농 계획서를 작성하세요. 지역 농업기술센터에서 검토와 지도를 받을 수 있어요.",
      "전입 신고를 완료하세요. 각종 지원사업 신청의 기본 요건이에요.",
    ],
    links: [
      { label: "비용 가이드 보기", href: "/costs" },
      { label: "지원사업 검색", href: "/programs" },
    ],
  },
  {
    step: 5,
    icon: Sprout,
    title: "영농 시작",
    period: "정착 후",
    items: [
      "농업경영체 등록을 하세요. 보조금, 면세유 등 각종 혜택의 필수 조건이에요.",
      "지자체 귀농 창업 지원금, 시설 보조, 농기계 임대 등 지원사업을 신청하세요.",
      "멘토링 프로그램에 참여하면 선배 귀농인의 노하우를 직접 배울 수 있어요.",
      "첫 해는 소규모(3,000m2 이하)로 시작해서 재배 기술을 익힌 후 확대하세요.",
    ],
    links: [
      { label: "작물 비교하기", href: "/crops" },
      { label: "귀농인 이야기", href: "/interviews" },
    ],
  },
];

export default function PreparationGuidePage() {
  return (
    <article className={s.page}>
      <BreadcrumbJsonLd
        items={[
          { name: "귀농 가이드", href: "/guides" },
          { name: "귀농 준비 순서", href: "/guides/preparation" },
        ]}
      />
      <JsonLd<HowTo>
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "귀농 준비 순서 — 5단계 체크리스트",
          description:
            "정보 수집부터 영농 시작까지, 귀농 준비를 5단계로 정리했어요.",
          step: STEPS.map((step) => ({
            "@type": "HowToStep",
            name: step.title,
            text: step.items.join(" "),
            position: step.step,
          })),
        }}
      />

      {/* ── 히어로 ── */}
      <SubPageHero
        overline="PREPARATION GUIDE"
        title="귀농, 어떤 순서로 준비하면 좋을까?"
        description="막막한 귀농 준비, 단계별로 정리했어요."
      />

      {/* ── 타임라인 ── */}
      <section className={s.timeline}>
        {STEPS.map((step) => {
          const StepIcon = step.icon;
          return (
            <div key={step.step} className={s.step}>
              <div className={s.stepMarker}>
                <div className={s.stepIconCircle}>
                  <StepIcon size={18} strokeWidth={1.75} aria-hidden="true" />
                </div>
                {step.step < STEPS.length && (
                  <div className={s.stepLine} aria-hidden="true" />
                )}
              </div>

              <div className={s.stepContent}>
                <div className={s.stepHead}>
                  <span className={s.stepLabel}>STEP {step.step}</span>
                  <h2 className={s.stepTitle}>{step.title}</h2>
                  <span className={s.stepPeriod}>
                    <Icon icon={Clock} size="xs" />
                    {step.period}
                  </span>
                </div>

                <ul className={s.stepItems}>
                  {step.items.map((item, i) => (
                    <li key={i} className={s.stepItem}>
                      <AutoGlossary text={item} maxHighlights={2} />
                    </li>
                  ))}
                </ul>

                <div className={s.stepLinks}>
                  {step.links.map((link) => (
                    <Link key={link.href} href={link.href} className={s.stepLink}>
                      {link.label}
                      <Icon icon={ArrowRight} size="sm" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ── CTA ── */}
      <section className={s.cta}>
        <h2 className={s.ctaTitle}>내 상황에 맞는 귀농지 찾기</h2>
        <p className={s.ctaDesc}>
          간단한 질문에 답하면, 맞춤 지역과 작물을 추천해 드려요.
        </p>
        <Link href="/match" className={s.ctaButton}>
          맞춤 추천받기
          <Icon icon={ArrowRight} size="md" />
        </Link>
      </section>

      {/* ── 관련 가이드 ── */}
      <nav className={s.related}>
        <h3 className={s.relatedTitle}>관련 가이드</h3>
        <div className={s.relatedLinks}>
          <Link href="/guides/budget-50s" className={s.relatedLink}>
            50대 귀농 자본 알아보기
            <Icon icon={ArrowRight} size="sm" />
          </Link>
          <Link href="/guides/solo-farming" className={s.relatedLink}>
            1인 귀농 가이드 보기
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
