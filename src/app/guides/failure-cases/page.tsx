import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  BookX,
  Banknote,
  Sprout,
  Users,
  ShoppingCart,
  CheckCircle,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { SubPageHero } from "@/components/ui/sub-page-hero";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import type { Article } from "schema-dts";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "귀농 실패 사례 — 실패에서 배우는 준비 핵심 | 이랑",
  description:
    "귀농 실패 사례 5가지와 대처법을 정리했어요. 준비 없는 귀농, 과도한 투자, 작물 선택 실패, 사회적 고립, 판로 미확보까지 — 같은 실수를 피하세요.",
  keywords: [
    "귀농 실패 사례",
    "귀농 실패 이유",
    "귀농 후회",
    "귀농 실패",
    "귀농 주의사항",
  ],
};

interface FailureCase {
  icon: LucideIcon;
  title: string;
  problem: string;
  detail: string;
  solution: string;
}

const FAILURE_CASES: FailureCase[] = [
  {
    icon: BookX,
    title: "준비 없는 귀농",
    problem: "교육이나 체험 없이 바로 이주해요.",
    detail:
      "영농 기술이 부족한 상태에서 시작하면 1~2년 안에 포기하는 경우가 많아요. 작물 재배는 물론 농기계 사용, 병해충 관리까지 배워야 할 것이 많거든요.",
    solution:
      "최소 6개월 이상 교육을 이수하고, 체험 프로그램에 참여해서 실제 농촌 생활을 경험해 보세요.",
  },
  {
    icon: Banknote,
    title: "과도한 초기 투자",
    problem: "퇴직금 전액을 농지와 시설에 투자해요.",
    detail:
      "첫 수확까지 소득 공백이 길어요. 채소류는 3~6개월, 과수류는 3~5년이 걸리는데, 생활비가 바닥나면 영농을 지속할 수 없어요.",
    solution:
      "생활비 2년치를 별도로 확보하고, 농지와 주거는 임대로 시작하세요. 퇴직금의 50% 이하만 영농에 투자하는 게 안전해요.",
  },
  {
    icon: Sprout,
    title: "작물 선택 실패",
    problem: "유행 작물에 편승하거나 지역 기후를 무시해요.",
    detail:
      "주변에서 잘 된다는 작물을 따라 심었는데, 우리 지역의 기후나 토양에 맞지 않아 수확량이 저조한 경우가 빈번해요. 작물마다 적합한 환경이 달라요.",
    solution:
      "지역 기후와 토양에 맞는 작물을 데이터로 확인하고, 선배 농가의 조언을 들어보세요.",
  },
  {
    icon: Users,
    title: "사회적 고립",
    problem: "도시 생활과의 격차에 적응하지 못해요.",
    detail:
      "문화 시설, 편의 시설 부족에 지역 커뮤니티 적응까지 — 가족 간 갈등으로 이어지는 경우도 많아요. 특히 배우자와 자녀의 적응이 중요해요.",
    solution:
      "귀농인 모임에 참여하고, 지역 행사에 적극적으로 나가보세요. 정착 전 가족과 충분히 대화하는 것도 필수예요.",
  },
  {
    icon: ShoppingCart,
    title: "판로 확보 실패",
    problem: "재배는 성공했지만 팔 곳이 없어요.",
    detail:
      "열심히 키워서 수확했는데 팔 곳이 없으면 소득으로 이어지지 않아요. 도매시장에만 의존하면 가격 변동에 취약해요.",
    solution:
      "직거래, 로컬푸드 매장, 체험농장 등 다양한 판로를 사전에 계획하세요. 6차 산업화(가공+체험+판매)도 좋은 전략이에요.",
  },
];

const CHECKLIST = [
  { text: "귀농 교육 100시간 이상 이수했나요?", href: "/education" },
  { text: "생활비 2년치를 별도로 확보했나요?", href: "/costs" },
  { text: "지역 기후에 맞는 작물을 확인했나요?", href: "/crops/compare" },
  { text: "가족과 충분히 대화하고 합의했나요?", href: null },
  { text: "판로를 미리 조사하고 계획했나요?", href: null },
];

const CTA_LINKS = [
  { label: "교육 프로그램 찾기", href: "/education" },
  { label: "체험 행사 일정", href: "/events" },
  { label: "작물 비교하기", href: "/crops/compare" },
  { label: "비용 가이드 보기", href: "/costs" },
  { label: "귀농인 이야기 읽기", href: "/interviews" },
];

export default function FailureCasesGuidePage() {
  return (
    <article className={s.page}>
      <BreadcrumbJsonLd
        items={[
          { name: "귀농 가이드", href: "/guides" },
          { name: "귀농 실패 사례", href: "/guides/failure-cases" },
        ]}
      />
      <JsonLd<Article>
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "귀농, 왜 실패할까?",
          description:
            "실패 사례에서 배우는 귀농 준비의 핵심이에요.",
          author: {
            "@type": "Organization",
            name: "이랑",
            url: "https://irangfarm.com",
          },
        }}
      />

      {/* -- 히어로 -- */}
      <SubPageHero
        overline="FAILURE CASES"
        title="귀농, 왜 실패할까?"
        description="실패 사례에서 배우는 귀농 준비의 핵심이에요."
      />

      {/* -- 실패 유형 카드 -- */}
      <section className={s.casesSection}>
        <h2 className={s.sectionTitle}>흔한 실패 유형 5가지</h2>
        <div className={s.cases}>
          {FAILURE_CASES.map((fc, idx) => {
            const CaseIcon = fc.icon;
            return (
              <div key={idx} className={s.caseCard}>
                <div className={s.caseCardHeader}>
                  <div className={s.caseCardIcon}>
                    <CaseIcon
                      size={18}
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className={s.caseCardTitle}>{fc.title}</h3>
                </div>
                <div className={s.caseCardBody}>
                  <div className={s.problemBox}>
                    <Icon icon={AlertTriangle} size="sm" />
                    <span className={s.problemText}>{fc.problem}</span>
                  </div>
                  <p className={s.caseDetail}>
                    <AutoGlossary text={fc.detail} maxHighlights={2} />
                  </p>
                  <div className={s.solutionBox}>
                    <span className={s.solutionLabel}>대처법</span>
                    <p className={s.solutionText}>
                      <AutoGlossary text={fc.solution} maxHighlights={2} />
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* -- 체크리스트 -- */}
      <section className={s.checklistSection}>
        <h2 className={s.sectionTitle}>성공 체크리스트</h2>
        <p className={s.checklistDesc}>
          위 5가지를 뒤집으면, 성공 확률이 높아져요.
        </p>
        <ul className={s.checklist}>
          {CHECKLIST.map((item, idx) => (
            <li key={idx} className={s.checkItem}>
              <Icon icon={CheckCircle} size="md" color="success" />
              <span className={s.checkText}>
                {item.href ? (
                  <Link href={item.href} className={s.checkLink}>
                    {item.text}
                  </Link>
                ) : (
                  item.text
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* -- CTA -- */}
      <section className={s.cta}>
        <h2 className={s.ctaTitle}>실패를 피하는 첫걸음</h2>
        <p className={s.ctaDesc}>
          준비가 충분하면 귀농은 새로운 시작이 돼요.
        </p>
        <div className={s.ctaLinks}>
          {CTA_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={s.ctaLink}>
              {link.label}
              <Icon icon={ArrowRight} size="sm" />
            </Link>
          ))}
        </div>
      </section>

      {/* -- 관련 가이드 -- */}
      <nav className={s.related}>
        <h3 className={s.relatedTitle}>관련 가이드</h3>
        <div className={s.relatedLinks}>
          <Link href="/guides/preparation" className={s.relatedLink}>
            귀농 준비 순서 보기
            <Icon icon={ArrowRight} size="sm" />
          </Link>
          <Link href="/guides/beginner-crops" className={s.relatedLink}>
            초보 추천 작물 보기
            <Icon icon={ArrowRight} size="sm" />
          </Link>
          <Link href="/guides/budget-50s" className={s.relatedLink}>
            50대 귀농 자본 알아보기
            <Icon icon={ArrowRight} size="sm" />
          </Link>
        </div>
      </nav>
    </article>
  );
}
