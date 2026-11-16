import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/share-metadata";
import Image from "next/image";
import Link from "@/components/ui/app-link";
import { ArrowRight, ArrowUpRight, Mail, FileText, UserSquare2 } from "lucide-react";
import { Icon as IconWrap } from "@/components/ui/icon";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { CountUp } from "@/components/ui/count-up";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { CROPS } from "@/lib/data/crops";
import { interviews } from "@/lib/data/landing";
import { PROVINCES } from "@/lib/data/regions";
import { PROGRAMS } from "@/lib/data/programs";
import { START_LANES } from "@/lib/data/journey-lanes";
import { QUESTIONS } from "@/lib/data/match-questions";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import type { Organization } from "schema-dts";
import { preload } from "react-dom";
import {
  ABOUT_CTA_TITLE,
  ABOUT_JOURNEY_TITLE,
  ABOUT_QUOTE_LINES,
} from "@/lib/data/about-display-copy";
import s from "./page.module.css";

/*
 * /about — 서비스 소개 (2026-10-01 efusioni 문법 → 2026-11-16 회장 결재 B안 "홈 문법으로 맞추기").
 *
 * 흐름: ① 수채화 띠(타이틀 "이랑" + 인용 2줄 + 본문 + 버튼) → ② 원칙 3(연초록 띠, 목록/카드) →
 *       ③ 숫자 카드 → ④ 여정 카드 5(정적 사진 카드 → /start/<유형>, <768 가로 스냅 캐러셀) →
 *       ⑤ 이런 분께 · 핵심 영역 · 데이터 출처 · 진단 · 운영 정보 (홈과 같은 칩 + 왼쪽 제목 머리).
 * 등장 연출은 홈과 같은 ScrollReveal(fade + stagger). 첫 화면 띠(LCP)에는 걸지 않는다.
 * 인용 제목·여정 제목·진단 제목만 IrangAboutDisplay(원본 마루부리 Bold, /about 전용 서브셋) — 문구는 lib/data/about-display-copy.
 */

/**
 * 실제로 연동하는 공공기관 (10/1 정정 — 통계청을 KOSIS·SGIS 두 줄로 세고 농촌진흥청을 빠뜨려
 * '5개 기관'이 우연히 맞던 목록). 기관 단위로 센다. 용도는 src/lib/api/* 실제 호출 기준.
 */
const DATA_SOURCES = [
  { name: "기상청", code: "KMA", description: "지역별 기온·강수·일조 관측(ASOS)" },
  { name: "통계청", code: "KOSIS·SGIS", description: "귀농·귀촌 통계, 지역 인구·농가 수" },
  { name: "농촌진흥청", code: "RDA", description: "작물 소득 조사, 청년농 지원사업·교육" },
  { name: "건강보험심사평가원", code: "HIRA", description: "지역별 의료기관 현황" },
  { name: "교육부", code: "NEIS", description: "지역별 학교 현황" },
];

/** 기관 수·이름 나열은 위 목록에서 센다 — 문구마다 "5곳"을 손으로 쓰지 않는다 (10/3) */
const SOURCE_COUNT = DATA_SOURCES.length;
const SOURCE_NAMES = DATA_SOURCES.map((src) => src.name).join("·");

export const metadata: Metadata = {
  ...pageMetadata({
    title: "이랑 서비스 소개 — 귀농·귀촌 정보 큐레이션",
    description:
      `공공데이터 ${SOURCE_COUNT}개 기관으로 농촌 정착을 한곳에서. 지역·작물·지원사업·인터뷰·치유까지.`,
    path: "/about",
  }),
};

/**
 * N1 — 페르소나 5종 (이런 분께). 버튼 문구가 약속한 화면으로 바로 보낸다 (10/6 QA Q2-X6).
 * 예전 링크(/match?persona=…)는 /match 가 persona 를 읽지 않아 그냥 진단 선택 화면이 열렸다.
 * 지역 순위·지원사업 목록은 persona 를 읽어 그 유형 기준으로 줄 세운다(normalize 화이트리스트 등록 값).
 */
const PERSONA_CARDS = [
  {
    id: "family",
    href: "/regions/ranking?persona=family",
    image: "/landing/personas/family.webp",
    alt: "텃밭에서 아이와 채소를 가꾸는 가족",
    label: "자녀 양육 가구",
    tagline: "아이와 함께 뿌리내릴 곳을 찾고 있어요.",
    cta: "내 지역 알아보기",
  },
  {
    id: "farmYouth",
    image: "/landing/personas/farm-youth.webp",
    alt: "온실 앞에서 모종 상자를 든 청년 농부",
    label: "청년 영농",
    tagline: "농업을 제 본업으로 시작하고 싶어요.",
    cta: "청년 지원사업 보기",
    href: "/programs?persona=farmYouth",
  },
  {
    id: "elderRural",
    image: "/landing/personas/elder-rural.webp",
    alt: "마당 화단에 물을 주는 노부부",
    label: "노년 귀촌",
    tagline: "은퇴 후 한적한 곳에서 쉬고 싶어요.",
    cta: "의료 인프라 확인",
    href: "/regions/ranking?persona=elderRural",
  },
  {
    id: "commuter",
    image: "/landing/personas/commuter.webp",
    alt: "시골 간이역에서 출근길에 나선 직장인",
    label: "귀촌 직장인",
    tagline: "도시 출퇴근하면서 시골에서 살고 싶어요.",
    // 순위에 교통 지표는 없다 — 인구 추세·의료·학교 비중이 큰 '귀촌 직장인' 가중치라 "교통"을 약속하지 않는다
    cta: "생활 여건 좋은 지역 보기",
    href: "/regions/ranking?persona=commuter",
  },
  {
    id: "balanced",
    image: "/landing/lanes/char-undecided.webp",
    alt: "지도를 펼쳐 들고 길을 고르는 사람",
    /** 투명 배경 세로 캐릭터라 원 안에 통째로 담는다 */
    contain: true,
    label: "아직 모르겠어요",
    tagline: "유형 정하지 않고 둘러보고 싶어요.",
    cta: "균등 추천 시작",
    href: "/regions/ranking?persona=balanced",
  },
] as const;

/** 지원사업 큐레이션 건수 — 10 단위 내림 + "+" (정적 배열 기준, DB 전용 행은 더 있을 수 있다) */
const PROGRAMS_FLOOR = Math.floor(PROGRAMS.length / 10) * 10;

/** Features 5 (핵심 영역) */
const FEATURES = [
  {
    title: "지역 탐색",
    description: `${PROVINCES.length}개 광역 지역의 기후·인프라를 비교하고 내 후보지를 찾아보세요.`,
    href: "/regions",
  },
  {
    title: "작물 목록",
    description: `${CROPS.length}종 작물의 수익·난이도·재배 환경을 내 지역과 맞춰 확인하세요.`,
    href: "/crops",
  },
  {
    title: "지원사업",
    description: "정부·지자체 지원사업을 조건별로 검색하고, 지금 신청할 수 있는 것만 골라 보세요.",
    href: "/programs",
  },
  {
    title: "정착 이야기",
    description: `${interviews.length}명이 먼저 정착하며 겪은 현실을 솔직하게 들어보세요.`,
    href: "/interviews",
  },
  {
    title: "치유·사회 농업",
    description:
      "수익을 넘어 사람과 마을을 잇는 농업의 새로운 방향을 탐색하세요.",
    href: "/education/therapy",
  },
];

/** ② 원칙 — 실제로 지키고 있는 원칙만 (출처 표기 · 같은 기준 비교 · 정정 이력 공개). 줄은 화면에서 공백으로 잇는다 */
const PRINCIPLES = [
  {
    title: "공공기관 자료로",
    lines: ["기후·인구·소득 같은 숫자는", "공공기관 자료에서 가져와요"],
  },
  {
    title: "같은 기준으로 비교",
    lines: ["지역과 작물을 같은 잣대로", "나란히 놓고 볼 수 있어요"],
  },
  {
    title: "고친 내용도 공개",
    lines: ["데이터를 바로잡으면", "정정 이력에 그대로 남겨요"],
  },
];

/**
 * ③ 숫자 카드 — 홈 히어로 '지금 열려 있어요' 숫자 칸 문법(라벨 위 → 큰 숫자 + 작은 단위)을 흰 바탕으로 옮긴 것 (11/16 회장).
 * 옛 CountersSection 수치를 그대로 흡수. 숫자는 전부 데이터에서 센다.
 */
const STATS: { id: string; label: string; value: string; unit: string; caption: string }[] = [
  { id: "provinces", label: "시·도", value: String(PROVINCES.length), unit: "개", caption: "전국 광역시·도" },
  { id: "crops", label: "작물", value: String(CROPS.length), unit: "종", caption: "재배·소득 정보" },
  { id: "programs", label: "지원사업", value: `${PROGRAMS_FLOOR}+`, unit: "건", caption: "마감된 공고 포함 정리" },
  { id: "interviews", label: "이야기", value: String(interviews.length), unit: "명", caption: "언론에 소개된 정착인" },
  { id: "sources", label: "공공기관", value: String(SOURCE_COUNT), unit: "곳", caption: "연동하는 공공기관" },
];

/** 섹션 머리 칩 — 홈 문법(초록 칩 + 왼쪽 제목). 개수는 배열에서 센다 */
const CHIPS = {
  gallery: "숫자로 보기",
  journey: `${START_LANES.length}가지 시작`,
  personas: "유형별 시작",
  features: `${FEATURES.length}가지 정보`,
  sources: `공공기관 ${SOURCE_COUNT}곳`,
  operator: "연락·정정",
};

/** 띠 배경 — 첫 화면 LCP 후보 */
const BAND_IMAGE = "/landing/hero/hero-1.webp";

/** 제목 서체 서브셋 — /about 에서만 미리 받는다(루트 레이아웃 아님). @font-face 는 page.module.css */
const DISPLAY_FONT = "/fonts/irang-about-display-700.woff2";

export default function AboutPage() {
  preload(DISPLAY_FONT, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });


  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[{ name: "서비스 소개", href: "/about" }]} />
      {/* ── E-E-A-T: Organization 구조화 데이터 (운영 정보·연락·데이터 출처) ── */}
      <JsonLd<Organization>
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "이랑",
          alternateName: "이랑 — 귀농·귀촌 정보 큐레이션 포탈",
          url: "https://irangfarm.com/about",
          logo: "https://irangfarm.com/icon.svg",
          description:
            `이랑은 농촌 정착을 준비하는 분들을 위한 비영리 정보 큐레이션 서비스예요. ${SOURCE_NAMES} ${SOURCE_COUNT}개 공공기관 데이터로 지역, 작물, 지원사업 정보를 한곳에서 비교할 수 있게 정리해요.`,
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

      {/* ═══ ① 수채화 띠 — 타이틀 + 인용 + 본문 + 버튼 (11/16 B안: 홈 히어로 문법) ═══ */}
      <header className={s.titleBand}>
        <Image
          src={BAND_IMAGE}
          alt=""
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          className={s.titleBg}
        />
        <div className={`${s.wrap} ${s.titleInner}`}>
          <h1 className={s.title}>
            <span className={s.titleOverline}>서비스 소개</span>{" "}
            <span className={s.titleWord}>이랑</span>
          </h1>
          {/* 처음 온 사람이 '무슨 서비스인지' 를 제목보다 먼저 읽게 (11/16 회장) */}
          <p className={s.titleTagline}>
            귀농·귀촌을 준비하는 사람을 위한
            <br />
            농촌 정착 정보 서비스예요
          </p>
          <h2 id="about-intro-title" className={s.introTitle}>
            {ABOUT_QUOTE_LINES[0]}
            <br />
            {ABOUT_QUOTE_LINES[1]}
          </h2>
          <p className={s.introBody}>
            <AutoGlossary text={`지역·작물·지원사업·인터뷰·치유까지, 농촌 정착에 필요한 정보를 한곳에 모았어요. 기후·인구·의료·학교·소득처럼 흩어진 숫자는 공공기관 ${SOURCE_COUNT}곳의 자료를 같은 기준으로 맞춰, 후보지와 작물을 나란히 놓고 고를 수 있어요.`} />
          </p>
          <div className={s.introCtas}>
            {/* /assess 는 이리로 넘기기만 하는 페이지 — 한 홉 줄인다 (10/6 QA Q2-X5) */}
            <Link href="/match?mode=assess" className={s.btnPrimary}>
              지금 바로 시작하기
              <IconWrap icon={ArrowRight} size="sm" />
            </Link>
            <Link href="/regions" className={s.btnGhost}>
              지역 탐색하기
            </Link>
          </div>
        </div>
      </header>

      {/* ═══ ② 원칙 — 연초록 띠. 모바일 목록, 768↑ 카드 3열 ═══ */}
      <section className={s.principles} aria-labelledby="about-principles-title">
        <h2 id="about-principles-title" className={s.srOnly}>
          지키는 원칙
        </h2>
        <ol className={`${s.wrap} ${s.principleList}`}>
          {PRINCIPLES.map((p, i) => (
            <li key={p.title} className={s.principle}>
              <span className={s.principleIndex} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <strong className={s.principleTitle}>{p.title}</strong>
              <span className={s.principleDesc}>{p.lines.join(" ")}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ═══ ③ 숫자 카드 (흰 바탕 — 앞뒤 연초록 띠와 교차) ═══ */}
      <ScrollReveal variant="fade" stagger>
        <section className={s.gallery} aria-labelledby="about-gallery-title">
          <SectionHead
            id="about-gallery-title"
            chip={CHIPS.gallery}
            title="지금 둘러볼 정보"
            desc="지역·작물·지원사업·사람 이야기를 한곳에 모았어요."
          />
          <div className={s.wrap}>
            <ul className={s.stats}>
              {STATS.map((st) => (
                <li key={st.id} className={s.stat} data-reveal-item>
                  <span className={s.statLabel}>{st.label}</span>
                  <span className={s.statValue}>
                    <CountUp value={st.value} className={s.statNumber} />
                    <span className={s.statUnit}>{st.unit}</span>
                  </span>
                  <span className={s.statCaption}>{st.caption}</span>
                </li>
              ))}
            </ul>
            <p className={s.tilesNote}>
              숫자는 {SOURCE_NAMES} 자료 기준이에요. 지원사업은 지금 신청할 수 없는 마감 공고까지 센 숫자예요.
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* ═══ ④ 여정 카드 — 사진 + 단어, 카드 전체가 그 유형 허브(/start/<id>)로 ═══ */}
      <div className={s.bandGreen}>
        <ScrollReveal variant="fade" stagger>
          <section className={s.block} aria-labelledby="about-journey-title">
            <SectionHead
              id="about-journey-title"
              chip={CHIPS.journey}
              title={ABOUT_JOURNEY_TITLE}
              titleClassName={s.journeyTitle}
              desc={`${START_LANES.map((l) => l.label).join("·")}, 어떤 시작이든 같은 숫자로 비교해 보세요.`}
              onGreen
            />
            <ul className={`${s.wrap} ${s.journeys}`} aria-label="정착 유형">
              {START_LANES.map((lane, i) => (
                <li key={lane.id} className={s.journeyItem} data-reveal-item>
                  <Link href={lane.href} className={s.journey}>
                    <span className={s.journeyArt}>
                      <Image
                        src={lane.image}
                        alt=""
                        fill
                        sizes="(min-width: 1280px) 220px, (min-width: 1024px) 18vw, (min-width: 768px) 31vw, 72vw"
                        className={s.journeyImg}
                      />
                    </span>
                    {/* B안(11/16): 사진 위 하단 스크림 + 번호 → 이름(제목 서체) → 한 줄 설명(journey-lanes desc 그대로) */}
                    <span className={s.journeyBody}>
                      <span className={s.journeyNum} aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={s.journeyLabel}>{lane.label}</span>
                      <span className={s.journeyDesc}>{lane.desc}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </ScrollReveal>
      </div>

      {/* ═══ ⑤-1 이런 분께 ═══ */}
      <ScrollReveal variant="fade" stagger>
        <section className={s.block} aria-labelledby="about-personas-title">
          <SectionHead
            id="about-personas-title"
            chip={CHIPS.personas}
            title="이런 분께"
            desc={`${PERSONA_CARDS.length}가지 유형 중 가까운 곳에서 시작해 보세요.`}
          />
          <ul className={`${s.wrap} ${s.personas}`}>
            {PERSONA_CARDS.map((p) => (
              <li key={p.id} data-reveal-item>
                <Link href={p.href} className={s.persona}>
                  <span className={s.personaArt}>
                    <Image
                      src={p.image}
                      alt={p.alt}
                      fill
                      sizes="(min-width: 1024px) 200px, 96px"
                      className={
                        "contain" in p ? s.personaImgContain : s.personaImg
                      }
                    />
                  </span>
                  <span className={s.personaText}>
                    <span className={s.personaLabel}>{p.label}</span>
                    <span className={s.personaTagline}>{p.tagline}</span>
                    <span className={s.personaCta}>
                      {p.cta}
                      <IconWrap icon={ArrowRight} size="sm" />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </ScrollReveal>

      {/* ═══ ⑤-2 핵심 영역 ═══ */}
      <div className={s.bandGreen}>
        <ScrollReveal variant="fade" stagger>
          <section className={s.block} aria-labelledby="about-features-title">
            <SectionHead
              id="about-features-title"
              chip={CHIPS.features}
              title="핵심 영역"
              desc={`정착 결정에 필요한 ${FEATURES.length}가지 정보를 한곳에서 비교하세요.`}
              onGreen
            />
            <ol className={`${s.wrap} ${s.features}`}>
              {FEATURES.map((f, i) => (
                <li key={f.title} className={s.featureItem} data-reveal-item>
                  <Link href={f.href} className={s.feature}>
                    <span className={s.featureIndex} aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={s.featureTitle}>{f.title}</span>
                    <span className={s.featureDesc}>
                      <AutoGlossary text={f.description} />
                    </span>
                    <span className={s.featureArrow} aria-hidden="true">
                      <ArrowUpRight size={20} strokeWidth={1.5} />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        </ScrollReveal>
      </div>

      {/* ═══ ⑤-3 데이터 출처 ═══ */}
      <ScrollReveal variant="fade" stagger>
        <section className={s.block} aria-labelledby="about-data-title">
          <SectionHead
            id="about-data-title"
            chip={CHIPS.sources}
            title="출처가 분명한 데이터"
            desc={`지역·작물 숫자는 아래 ${SOURCE_COUNT}개 공공기관 자료를 연동해요. 지원사업·교육·행사는 정부·지자체 원문 공고를 확인해 정리해요.`}
          />
          <ul className={`${s.wrap} ${s.sources}`}>
            {DATA_SOURCES.map((src) => (
              <li key={src.code} className={s.source} data-reveal-item>
                <span className={s.sourceCode}>{src.code}</span>
                <span className={s.sourceName}>{src.name}</span>
                <span className={s.sourceDesc}>
                  <AutoGlossary text={src.description} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      </ScrollReveal>

      {/* ═══ ⑤-4 진단 CTA ═══ */}
      <ScrollReveal variant="fade" stagger>
        <section className={s.cta} aria-labelledby="about-cta-title">
          <div className={`${s.wrap} ${s.ctaInner}`}>
            <h2 id="about-cta-title" className={s.ctaTitle} data-reveal-item>
              {ABOUT_CTA_TITLE}
            </h2>
            <p className={s.ctaDesc} data-reveal-item>
              {/* 버튼이 여는 '정착 유형 진단'(match-wizard)의 문항 수 — 예전 "5개" 하드코딩은 실제 10문항과 달랐다(11/16 QA) */}
              <AutoGlossary text={`간단한 질문 ${QUESTIONS.length}개에 답하면, 내 상황과 선호에 맞는 농촌 정착 지역과 작물을 추천해 드려요.`} />
            </p>
            <Link href="/match?mode=match" className={s.ctaButton} data-reveal-item>
              농촌 정착 유형 진단 시작하기
              <IconWrap icon={ArrowRight} size="sm" />
            </Link>
          </div>
        </section>
      </ScrollReveal>

      {/* ═══ ⑤-5 운영 정보 + 고지 ═══ */}
      <section className={s.block} aria-labelledby="about-operator-title">
        <SectionHead
          id="about-operator-title"
          chip={CHIPS.operator}
          title="운영 정보"
          desc="이랑은 개인이 운영하는 비영리 농촌 정착 정보 큐레이션 서비스예요. 데이터 정정·삭제 요청, 출처 검증 결과는 모두 공개로 관리해요."
        />
        <div className={s.wrap}>
          <ul className={s.operator}>
            <li className={s.operatorCell}>
              <a href="mailto:loyal3270@gmail.com" className={s.operatorItem}>
                <Mail size={18} strokeWidth={1.75} aria-hidden="true" />
                <span className={s.operatorLabel}>이메일</span>
                <span className={s.operatorValue}>loyal3270@gmail.com</span>
              </a>
            </li>
            <li className={s.operatorCell}>
              <Link href="/about/corrections" className={s.operatorItem}>
                <FileText size={18} strokeWidth={1.75} aria-hidden="true" />
                <span className={s.operatorLabel}>정정 이력</span>
                <span className={s.operatorValue}>최근 데이터 수정 내역 공개</span>
              </Link>
            </li>
            <li className={s.operatorCell}>
              <Link href="/about/disclaimer" className={s.operatorItem}>
                <UserSquare2 size={18} strokeWidth={1.75} aria-hidden="true" />
                <span className={s.operatorLabel}>면책 고지·데이터 출처</span>
                <span className={s.operatorValue}>데이터 출처 목록</span>
              </Link>
            </li>
          </ul>

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
      </section>
    </div>
  );
}

/** 섹션 머리 — 홈 문법: 초록 칩 → 왼쪽 제목 → 설명. onGreen 이면 연초록 띠 위 설명색(대비 4.5↑) */
function SectionHead({
  id,
  chip,
  title,
  desc,
  titleClassName = "",
  onGreen = false,
}: {
  id: string;
  chip: string;
  title: string;
  desc: string;
  /** 제목만 다른 서체(--font-about-display)로 그릴 때 */
  titleClassName?: string;
  onGreen?: boolean;
}) {
  return (
    <div className={`${s.wrap} ${s.sectionHead}`}>
      <span className={s.chip}>{chip}</span>
      <h2 id={id} className={`${s.sectionTitle} ${titleClassName}`}>
        {title}
      </h2>
      <p className={`${s.sectionDesc} ${onGreen ? s.sectionDescOnGreen : ""}`}>{desc}</p>
    </div>
  );
}
