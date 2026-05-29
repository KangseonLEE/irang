import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  FileText,
  ArrowRight,
  Database,
  CloudSun,
  BarChart3,
  TrendingUp,
  Hospital,
  GraduationCap,
  Search,
  MousePointerClick,
  Target,
  Mail,
  Users,
  UserSquare2,
  Home,
  Bus,
  Scale,
  HeartHandshake,
  BookOpenText,
} from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import { Icon as IconWrap } from "@/components/ui/icon";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { IrangSymbol } from "@/components/brand/irang-symbol";
import { CROPS } from "@/lib/data/crops";
import { interviews } from "@/lib/data/landing";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import type { Organization } from "schema-dts";
import { CountersSection } from "./counters-section";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "이랑 서비스 소개 — 농촌 정착 정보 큐레이션",
  description:
    "공공데이터 5개 기관으로 농촌 정착을 한곳에서. 지역·작물·지원사업·인터뷰·치유까지.",
  alternates: { canonical: "/about" },
};

/** N1 — 페르소나 5종 (이런 분께). href 는 /match?persona={id} deep link */
const PERSONA_CARDS = [
  {
    id: "family",
    icon: Users,
    label: "자녀 양육 가구",
    tagline: "아이와 함께 뿌리내릴 곳을 찾고 있어요.",
    cta: "내 지역 알아보기",
  },
  {
    id: "farmYouth",
    icon: Sprout,
    label: "청년 영농",
    tagline: "농업을 제 본업으로 시작하고 싶어요.",
    cta: "청년 지원사업 보기",
  },
  {
    id: "elderRural",
    icon: Home,
    label: "노년 귀촌",
    tagline: "은퇴 후 한적한 곳에서 쉬고 싶어요.",
    cta: "의료 인프라 확인",
  },
  {
    id: "commuter",
    icon: Bus,
    label: "귀촌 직장인",
    tagline: "도시 출퇴근하면서 시골에서 살고 싶어요.",
    cta: "교통 좋은 지역 보기",
  },
  {
    id: "balanced",
    icon: Scale,
    label: "아직 모르겠어요",
    tagline: "유형 정하지 않고 둘러보고 싶어요.",
    cta: "균등 추천 시작",
  },
] as const;

/** Features 5 카드 (핵심 영역) */
const FEATURES = [
  {
    icon: MapPin,
    title: "지역 탐색",
    description:
      "17개 광역 지역의 기후·인프라를 비교하고 내 후보지를 찾아보세요.",
    href: "/regions",
    color: "green" as const,
  },
  {
    icon: Sprout,
    title: "작물 목록",
    description: `${CROPS.length}종 작물의 수익·난이도·재배 환경을 내 지역과 맞춰 확인하세요.`,
    href: "/crops",
    color: "amber" as const,
  },
  {
    icon: FileText,
    title: "지원사업",
    description:
      "30건 넘는 지원사업을 조건별로 검색하고 내 상황에 맞는 것만 골라보세요.",
    href: "/programs",
    color: "blue" as const,
  },
  {
    icon: BookOpenText,
    title: "정착 이야기",
    description: `${interviews.length}명이 먼저 정착하며 겪은 현실을 솔직하게 들어보세요.`,
    href: "/interviews",
    color: "violet" as const,
  },
  {
    icon: HeartHandshake,
    title: "치유·사회 농업",
    description:
      "수익을 넘어 사람과 마을을 잇는 농업의 새로운 방향을 탐색하세요.",
    href: "/education/therapy",
    color: "rose" as const,
  },
];

const STEPS = [
  {
    icon: Search,
    step: "01",
    title: "관심 영역 탐색",
    description:
      "지역, 작물, 지원사업 정보를 비교하고 관심 가는 곳을 골라보세요.",
  },
  {
    icon: MousePointerClick,
    step: "02",
    title: "농촌 정착 유형 진단",
    description: "5가지 질문으로 나에게 맞는 지역과 작물을 추천받으세요.",
  },
  {
    icon: Target,
    step: "03",
    title: "내 계획 세우기",
    description:
      "비교 데이터로 정착 계획을 구체화하고 지원사업을 연결하세요.",
  },
];

const DATA_SOURCES = [
  {
    icon: CloudSun,
    name: "기상청",
    code: "KMA",
    description: "ASOS 종관기상 관측 데이터",
  },
  {
    icon: BarChart3,
    name: "통계청 SGIS",
    code: "SGIS",
    description: "지역별 인구·고령화 데이터",
  },
  {
    icon: TrendingUp,
    name: "통계청 KOSIS",
    code: "KOSIS",
    description: "농업 생산량·재배면적 통계",
  },
  {
    icon: Hospital,
    name: "심평원",
    code: "HIRA",
    description: "지역별 의료기관 분포",
  },
  {
    icon: GraduationCap,
    name: "교육부",
    code: "NEIS",
    description: "지역별 학교 수 데이터",
  },
];

/** N3 — 인터뷰 미리보기 3인 (mountain·healing·youth 분산) */
const INTERVIEW_PREVIEW_IDS = ["lee-chunbok", "oh-geumok", "jo-sungsu"];

export default function AboutPage() {
  const previewInterviews = INTERVIEW_PREVIEW_IDS.map((id) =>
    interviews.find((p) => p.id === id),
  ).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[{ name: "서비스 소개", href: "/about" }]} />
      {/* ── E-E-A-T: Organization 구조화 데이터 (운영 정보·연락·데이터 출처) ── */}
      <JsonLd<Organization>
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "이랑",
          alternateName: "이랑 — 농촌 정착 정보 큐레이션 포탈",
          url: "https://irangfarm.com/about",
          logo: "https://irangfarm.com/icon.svg",
          description:
            "이랑은 농촌 정착을 준비하는 분들을 위한 비영리 정보 큐레이션 서비스예요. 기상청·통계청(KOSIS·SGIS)·농촌진흥청·심평원·교육부 등 5개 공공기관 데이터로 지역, 작물, 지원사업 정보를 한곳에서 비교할 수 있게 정리해요.",
          email: "loyal3270@gmail.com",
          contactPoint: {
            "@type": "ContactPoint",
            email: "loyal3270@gmail.com",
            contactType: "customer service",
            availableLanguage: ["Korean"],
          },
          areaServed: { "@type": "Country", name: "Republic of Korea" },
          knowsAbout: [
            "농촌 정착",
            "귀농",
            "귀촌",
            "귀산촌",
            "청년 영농",
            "스마트팜",
            "치유농업",
            "사회적 농업",
            "농업 지원사업",
          ],
        }}
      />

      {/* ═══ 1. Hero ═══ */}
      <section className={s.hero}>
        <div className={s.heroSymbol}>
          <IrangSymbol size={48} />
        </div>
        <span className={s.heroOverline}>About IRANG</span>
        <h1 className={s.heroTitle}>
          내 삶의 다음 챕터,
          <br />
          <span className={s.heroAccent}>농촌</span>에서 찾아요
        </h1>
        <p className={s.heroDesc}>
          <AutoGlossary text="공공데이터 5개 기관으로 농촌 정착을 한곳에서. 지역·작물·지원사업·인터뷰·치유까지." />
        </p>
        <div className={s.heroCtas}>
          <Link href="/assess" className={s.heroPrimaryBtn}>
            지금 바로 시작하기
            <IconWrap icon={ArrowRight} size="md" />
          </Link>
          <Link href="/regions" className={s.heroSecondaryBtn}>
            지역 탐색하기
          </Link>
        </div>
      </section>

      {/* ═══ 2. N1 페르소나 5종 ═══ */}
      <section className={s.personasSection}>
        <h2 className={s.sectionTitle}>이런 분께</h2>
        <p className={s.sectionDesc}>
          5가지 유형 중 가까운 곳에서 시작해 보세요.
        </p>
        <ul className={s.personasGrid}>
          {PERSONA_CARDS.map((p) => {
            const Icon = p.icon;
            return (
              <li key={p.id} className={s.personaItem}>
                <Link
                  href={`/match?persona=${p.id}`}
                  className={s.personaCard}
                >
                  <div className={s.personaIcon}>
                    <Icon size={22} strokeWidth={1.75} />
                  </div>
                  <h3 className={s.personaLabel}>{p.label}</h3>
                  <p className={s.personaTagline}>{p.tagline}</p>
                  <span className={s.personaCta}>
                    {p.cta}
                    <IconWrap icon={ArrowRight} size="sm" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ═══ 3. 핵심 영역 (Features 5) ═══ */}
      <section className={s.featuresSection}>
        <h2 className={s.sectionTitle}>핵심 영역</h2>
        <p className={s.sectionDesc}>
          정착 결정에 필요한 5가지 정보를 한곳에서 비교하세요.
        </p>
        <div className={s.featuresGrid}>
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Link key={f.title} href={f.href} className={s.featureCard}>
                <div className={`${s.featureIcon} ${s[f.color]}`}>
                  <Icon size={24} strokeWidth={1.75} />
                </div>
                <h3 className={s.featureTitle}>{f.title}</h3>
                <p className={s.featureDesc}>
                  <AutoGlossary text={f.description} />
                </p>
                <span className={s.featureLink}>
                  자세히 보기 <IconWrap icon={ArrowRight} size="sm" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══ 4. N2 숫자 카운터 ═══ */}
      <CountersSection
        cropsCount={CROPS.length}
        interviewsCount={interviews.length}
      />

      {/* ═══ 5. Steps 3 (이용 흐름) ═══ */}
      <section className={s.stepsSection}>
        <h2 className={s.sectionTitle}>이렇게 활용하세요</h2>
        <p className={s.sectionDesc}>
          3단계로 농촌 정착 계획을 구체화할 수 있어요.
        </p>
        <div className={s.stepsGrid}>
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className={s.stepCard}>
                <span className={s.stepNumber}>{step.step}</span>
                <div className={s.stepIcon}>
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <h3 className={s.stepTitle}>{step.title}</h3>
                <p className={s.stepDesc}>
                  <AutoGlossary text={step.description} />
                </p>
                {i < STEPS.length - 1 && (
                  <div className={s.stepArrow}>
                    <IconWrap icon={ArrowRight} size="md" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ 6. N3 인터뷰 미리보기 ═══ */}
      <section className={s.interviewsSection}>
        <div className={s.interviewsHeader}>
          <h2 className={s.sectionTitle}>먼저 정착한 사람들의 이야기</h2>
          <p className={s.sectionDesc}>
            카테고리별로 정착 경험을 솔직하게 담았어요.
          </p>
        </div>
        <div className={s.interviewsGrid}>
          {previewInterviews.map((p) => (
            <Link
              key={p.id}
              href={`/interviews/${p.id}`}
              className={s.interviewCard}
            >
              <div className={s.interviewMeta}>
                <span className={s.interviewName}>{p.name}</span>
                <span className={s.interviewSub}>
                  {p.age} · {p.region}
                </span>
              </div>
              <p className={s.interviewQuote}>&ldquo;{p.quote}&rdquo;</p>
              <span className={s.interviewLink}>
                이야기 읽기 <IconWrap icon={ArrowRight} size="sm" />
              </span>
            </Link>
          ))}
        </div>
        <Link href="/interviews" className={s.interviewsAllLink}>
          인터뷰 전체 보기 <IconWrap icon={ArrowRight} size="sm" />
        </Link>
      </section>

      {/* ═══ 7. N4 데이터 출처 ═══ */}
      <section className={s.dataSection}>
        <div className={s.dataHeader}>
          <IconWrap icon={Database} size="lg" className={s.dataIcon} />
          <h2 className={s.sectionTitle}>신뢰할 수 있는 공공 데이터</h2>
        </div>
        <p className={s.sectionDesc}>
          기상청·통계청·농촌진흥청 등 5개 공공기관의 공식 데이터만 사용해요.
        </p>
        <div className={s.dataGrid}>
          {DATA_SOURCES.map((src) => {
            const Icon = src.icon;
            return (
              <div key={src.code} className={s.dataCard}>
                <div className={s.dataCardIcon}>
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <div className={s.dataCardBody}>
                  <span className={s.dataCardName}>{src.name}</span>
                  <span className={s.dataCardDesc}>
                    <AutoGlossary text={src.description} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ 8. matchCta + operatorInfo + disclaimer ═══ */}
      <section className={s.matchCta}>
        <div className={s.matchCtaContent}>
          <h2 className={s.matchCtaTitle}>
            아직 어디서 시작할지 모르겠다면?
          </h2>
          <p className={s.matchCtaDesc}>
            <AutoGlossary text="간단한 질문 5개에 답하면, 내 상황과 선호에 맞는 농촌 정착 지역과 작물을 추천해 드려요." />
          </p>
          <Link href="/match" className={s.matchCtaButton}>
            농촌 정착 유형 진단 시작하기
            <IconWrap icon={ArrowRight} size="md" />
          </Link>
        </div>
      </section>

      <section className={s.operatorSection}>
        <h2 className={s.sectionTitle}>운영 정보</h2>
        <p className={s.sectionDesc}>
          이랑은 개인이 운영하는 비영리 농촌 정착 정보 큐레이션 서비스예요.
          데이터 정정·삭제 요청, 출처 검증 결과는 모두 공개로 관리해요.
        </p>
        <div className={s.operatorGrid}>
          <a href="mailto:loyal3270@gmail.com" className={s.operatorItem}>
            <div className={s.operatorIcon}>
              <Mail size={18} strokeWidth={1.75} />
            </div>
            <div className={s.operatorBody}>
              <span className={s.operatorLabel}>이메일</span>
              <span className={s.operatorValue}>loyal3270@gmail.com</span>
            </div>
          </a>
          <Link href="/about/corrections" className={s.operatorItem}>
            <div className={s.operatorIcon}>
              <FileText size={18} strokeWidth={1.75} />
            </div>
            <div className={s.operatorBody}>
              <span className={s.operatorLabel}>정정 이력</span>
              <span className={s.operatorValue}>최근 데이터 수정 내역 공개</span>
            </div>
          </Link>
          <Link href="/about/disclaimer" className={s.operatorItem}>
            <div className={s.operatorIcon}>
              <UserSquare2 size={18} strokeWidth={1.75} />
            </div>
            <div className={s.operatorBody}>
              <span className={s.operatorLabel}>면책 고지·데이터 출처</span>
              <span className={s.operatorValue}>7개 공공데이터 기관 명시</span>
            </div>
          </Link>
        </div>
      </section>

      <p className={s.disclaimer}>
        본 서비스의 정보는 참고용이에요. 실제 지원사업 신청 시 해당 기관의
        원문을 반드시 확인하세요.
      </p>
      <nav className={s.legalNav} aria-label="법적 고지">
        <Link href="/about/disclaimer" className={s.legalNavLink}>
          면책고지
        </Link>
        <Link href="/about/corrections" className={s.legalNavLink}>
          정정 이력
        </Link>
        <Link href="/terms" className={s.legalNavLink}>
          이용약관
        </Link>
      </nav>
    </div>
  );
}
