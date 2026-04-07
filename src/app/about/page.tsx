import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  Sprout,
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
} from "lucide-react";
import { IrangSymbol } from "@/components/brand/irang-symbol";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "서비스 소개",
  description:
    "이랑은 귀농을 꿈꾸는 모든 분을 위한 정보 큐레이션 서비스입니다. 지역, 작물, 지원사업 정보를 한곳에서 비교하세요.",
};

const features = [
  {
    icon: MapPin,
    title: "지역 탐색",
    description:
      "13개 광역시·도의 기후, 인구, 의료·교육 인프라를 한눈에 비교하고, 나에게 맞는 귀농 후보지를 탐색하세요.",
    href: "/regions",
    color: "green" as const,
  },
  {
    icon: Sprout,
    title: "작물 정보",
    description:
      "17종 주요 작물의 재배 환경, 예상 수익, 난이도를 확인하고 내 지역에 적합한 작물을 찾아보세요.",
    href: "/crops",
    color: "amber" as const,
  },
  {
    icon: FileText,
    title: "지원사업 검색",
    description:
      "귀농 정착금, 교육 지원, 주택 보조 등 전국·지역별 귀농 지원사업을 검색하고 조건을 비교하세요.",
    href: "/programs",
    color: "blue" as const,
  },
];

const steps = [
  {
    icon: Search,
    step: "01",
    title: "정보 탐색",
    description: "지역, 작물, 지원사업 정보를 검색하고 비교합니다.",
  },
  {
    icon: MousePointerClick,
    step: "02",
    title: "귀농 가이드",
    description: "적합성 진단과 맞춤 질문으로 나에게 맞는 지역과 작물을 추천받습니다.",
  },
  {
    icon: Target,
    step: "03",
    title: "의사결정",
    description: "비교 데이터를 기반으로 귀농 계획을 구체화합니다.",
  },
];

const dataSources = [
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

export default function AboutPage() {
  return (
    <div className={s.page}>
      {/* ═══ 히어로 ═══ */}
      <section className={s.hero}>
        <div className={s.heroSymbol}>
          <IrangSymbol size={48} />
        </div>
        <span className={s.heroOverline}>About IRANG</span>
        <h1 className={s.heroTitle}>
          귀농, 어디서 무엇을 시작할지
          <br />
          <span className={s.heroAccent}>이랑</span>이 알려드립니다
        </h1>
        <p className={s.heroDesc}>
          이랑은 귀농을 꿈꾸는 모든 분을 위한 정보 큐레이션 서비스입니다.
          <br />
          공공 데이터를 기반으로 지역, 작물, 지원사업 정보를 한곳에서 비교하고
          의사결정을 도와드립니다.
        </p>
        <div className={s.heroCtas}>
          <Link href="/match" className={s.heroPrimaryBtn}>
            나에게 맞는 지역 찾기
            <ArrowRight size={16} />
          </Link>
          <Link href="/regions" className={s.heroSecondaryBtn}>
            지역 탐색하기
          </Link>
        </div>
      </section>

      {/* ═══ 핵심 기능 ═══ */}
      <section className={s.featuresSection}>
        <h2 className={s.sectionTitle}>핵심 기능</h2>
        <p className={s.sectionDesc}>
          귀농 의사결정에 필요한 세 가지 핵심 정보를 제공합니다.
        </p>
        <div className={s.featuresGrid}>
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Link key={f.title} href={f.href} className={s.featureCard}>
                <div className={`${s.featureIcon} ${s[f.color]}`}>
                  <Icon size={24} />
                </div>
                <h3 className={s.featureTitle}>{f.title}</h3>
                <p className={s.featureDesc}>{f.description}</p>
                <span className={s.featureLink}>
                  자세히 보기 <ArrowRight size={14} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══ 이용 흐름 ═══ */}
      <section className={s.stepsSection}>
        <h2 className={s.sectionTitle}>이렇게 활용하세요</h2>
        <p className={s.sectionDesc}>
          3단계로 귀농 계획을 구체화할 수 있습니다.
        </p>
        <div className={s.stepsGrid}>
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className={s.stepCard}>
                <span className={s.stepNumber}>{step.step}</span>
                <div className={s.stepIcon}>
                  <Icon size={20} />
                </div>
                <h3 className={s.stepTitle}>{step.title}</h3>
                <p className={s.stepDesc}>{step.description}</p>
                {i < steps.length - 1 && (
                  <div className={s.stepArrow}>
                    <ArrowRight size={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ 데이터 출처 ═══ */}
      <section className={s.dataSection}>
        <div className={s.dataHeader}>
          <Database size={18} className={s.dataIcon} />
          <h2 className={s.sectionTitle}>신뢰할 수 있는 공공 데이터</h2>
        </div>
        <p className={s.sectionDesc}>
          5개 공공기관의 데이터를 활용하여 객관적인 정보를 제공합니다.
        </p>
        <div className={s.dataGrid}>
          {dataSources.map((src) => {
            const Icon = src.icon;
            return (
              <div key={src.code} className={s.dataCard}>
                <div className={s.dataCardIcon}>
                  <Icon size={20} />
                </div>
                <div className={s.dataCardBody}>
                  <span className={s.dataCardName}>{src.name}</span>
                  <span className={s.dataCardDesc}>{src.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ 맞춤 추천 CTA ═══ */}
      <section className={s.matchCta}>
        <div className={s.matchCtaContent}>
          <h2 className={s.matchCtaTitle}>
            아직 어디서 시작할지 모르겠다면?
          </h2>
          <p className={s.matchCtaDesc}>
            간단한 질문 5개에 답하면, 나의 상황과 선호에 맞는 귀농 지역과 작물을
            추천해 드립니다.
          </p>
          <Link href="/match" className={s.matchCtaButton}>
            귀농 가이드 시작하기
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ═══ 면책 조항 ═══ */}
      <p className={s.disclaimer}>
        본 서비스의 정보는 참고용이며, 실제 지원사업 신청 시 해당 기관의 원문을
        반드시 확인하세요.
      </p>
    </div>
  );
}
