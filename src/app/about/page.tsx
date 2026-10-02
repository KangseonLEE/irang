import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Mail, FileText, UserSquare2 } from "lucide-react";
import { Icon as IconWrap } from "@/components/ui/icon";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { CountUp } from "@/components/ui/count-up";
import { CROPS } from "@/lib/data/crops";
import { interviews } from "@/lib/data/landing";
import { PROVINCES } from "@/lib/data/regions";
import { PROGRAMS } from "@/lib/data/programs";
import { START_LANES } from "@/lib/data/journey-lanes";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import type { Organization } from "schema-dts";
import { WordStage } from "./word-stage";
import s from "./page.module.css";

/*
 * /about — 서비스 소개 (2026-10-01 회장 결재: efusioni maintenance 문법으로 재구성).
 *
 * 흐름: ① 회색 띠에 걸친 큰 세리프 "이랑" → ② 인용 2줄 + 본문 → ③ 가는 세로선 →
 *       ④ 겹친 타원 3개(원칙) → ⑤ 풀폭 이미지·숫자 타일 → ⑥ 고정 문장 + 지나가는 일러스트 →
 *       ⑦ 이런 분께 · 핵심 영역 · 이용 흐름 · 이야기 · 데이터 출처 · 진단 · 운영 정보.
 * 스크롤 연출은 네이티브 스크롤 위의 sticky + IntersectionObserver 뿐(휠 가로채기 없음).
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
  title: "이랑 서비스 소개 — 농촌 정착 정보 큐레이션",
  description:
    `공공데이터 ${SOURCE_COUNT}개 기관으로 농촌 정착을 한곳에서. 지역·작물·지원사업·인터뷰·치유까지.`,
  alternates: { canonical: "/about" },
};

/** N1 — 페르소나 5종 (이런 분께). href 는 /match?persona={id} deep link */
const PERSONA_CARDS = [
  {
    id: "family",
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
  },
  {
    id: "elderRural",
    image: "/landing/personas/elder-rural.webp",
    alt: "마당 화단에 물을 주는 노부부",
    label: "노년 귀촌",
    tagline: "은퇴 후 한적한 곳에서 쉬고 싶어요.",
    cta: "의료 인프라 확인",
  },
  {
    id: "commuter",
    image: "/landing/personas/commuter.webp",
    alt: "시골 간이역에서 출근길에 나선 직장인",
    label: "귀촌 직장인",
    tagline: "도시 출퇴근하면서 시골에서 살고 싶어요.",
    cta: "교통 좋은 지역 보기",
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

/** ④ 겹친 타원 — 실제로 지키고 있는 원칙만 (출처 표기 · 같은 기준 비교 · 정정 이력 공개) */
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

/** ⑤ 타일 — 일러스트 7 + 숫자 5 (옛 CountersSection 수치를 그대로 흡수). 6열 × 2행 순서 */
type Tile =
  | { kind: "image"; src: string; alt: string; contain?: boolean }
  | { kind: "number"; value: string; label: string; caption: string; tone: "green" | "deep" };

const TILES: Tile[] = [
  { kind: "image", src: "/landing/hero/hero-1.webp", alt: "새벽 안개가 깔린 계단식 논" },
  {
    kind: "number",
    value: String(PROVINCES.length),
    label: "개 시·도",
    caption: "전국 광역시·도",
    tone: "green",
  },
  {
    kind: "number",
    value: String(CROPS.length),
    label: "종 작물",
    caption: "재배·소득 정보",
    tone: "deep",
  },
  {
    kind: "number",
    value: `${PROGRAMS_FLOOR}+`,
    label: "건 지원사업",
    caption: "마감된 공고 포함 정리",
    tone: "green",
  },
  {
    kind: "number",
    value: String(interviews.length),
    label: "명 이야기",
    caption: "언론에 소개된 정착인",
    tone: "deep",
  },
  {
    kind: "number",
    value: String(DATA_SOURCES.length),
    label: "개 기관",
    caption: "연동하는 공공기관",
    tone: "green",
  },
];

export default function AboutPage() {
  const stageItems = START_LANES.map(({ id, label, image, alt }) => ({
    id,
    label,
    image,
    alt,
  }));

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

      {/* ═══ ① 타이틀 띠 — 회색 띠 하단 경계에 걸친 큰 세리프 ═══ */}
      <header className={s.titleBand}>
        <h1 className={s.title}>
          <span className={s.titleOverline}>서비스 소개</span>{" "}
          <span className={s.titleWord}>이랑</span>
        </h1>
      </header>

      {/* ═══ ② 인용 + 본문 → ③ 세로선 → ④ 겹친 타원 ═══ */}
      <section className={s.intro} aria-labelledby="about-intro-title">
        <div className={s.narrow}>
          <span className={s.quoteMark} aria-hidden="true">
            &ldquo;
          </span>
          <h2 id="about-intro-title" className={s.introTitle}>
            출처가 분명한 숫자로
            <br />
            정착할 곳을 비교해요
          </h2>
          <p className={s.introBody}>
            <AutoGlossary text={`지역·작물·지원사업·인터뷰·치유까지, 농촌 정착에 필요한 정보를 한곳에 모았어요. 기후·인구·의료·학교·소득처럼 흩어진 숫자는 공공기관 ${SOURCE_COUNT}곳의 자료를 같은 기준으로 맞춰, 후보지와 작물을 나란히 놓고 고를 수 있어요.`} />
          </p>
          <div className={s.introCtas}>
            <Link href="/assess" className={s.btnPrimary}>
              지금 바로 시작하기
              <IconWrap icon={ArrowRight} size="sm" />
            </Link>
            <Link href="/regions" className={s.btnGhost}>
              지역 탐색하기
            </Link>
          </div>
        </div>

        <span className={s.vline} aria-hidden="true" />

        <ul className={s.ovals} aria-label="지키는 원칙">
          {PRINCIPLES.map((p) => (
            <li key={p.title} className={s.oval}>
              <strong className={s.ovalTitle}>{p.title}</strong>
              <span className={s.ovalDesc}>
                {p.lines[0]}
                <br />
                {p.lines[1]}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ═══ ⑤ 풀폭 타일 — 일러스트 + 숫자 ═══ */}
      <section className={s.gallery} aria-labelledby="about-gallery-title">
        <div className={s.sectionHead}>
          <h2 id="about-gallery-title" className={s.sectionTitle}>
            지금 둘러볼 정보
          </h2>
          <p className={s.sectionDesc}>
            지역·작물·지원사업·사람 이야기를 한곳에 모았어요.
          </p>
        </div>
        <ul className={s.tiles}>
          {TILES.map((t, i) =>
            t.kind === "image" ? (
              <li
                key={t.src}
                className={`${s.tile} ${t.contain ? s.tileCrop : ""}`}
              >
                <Image
                  src={t.src}
                  alt={t.alt}
                  fill
                  sizes="(min-width: 1024px) 17vw, (min-width: 768px) 34vw, 50vw"
                  className={t.contain ? s.tileImgContain : s.tileImg}
                />
              </li>
            ) : (
              <li
                key={`n-${i}`}
                className={`${s.tile} ${s.tileNumber} ${t.tone === "deep" ? s.tileDeep : s.tileGreen}`}
              >
                <CountUp value={t.value} className={s.tileValue} />
                <span className={s.tileLabel}>{t.label}</span>
                <span className={s.tileCaption}>{t.caption}</span>
              </li>
            ),
          )}
        </ul>
        <p className={s.tilesNote}>
          숫자는 {SOURCE_NAMES} 자료 기준이에요. 지원사업은 지금 신청할 수 없는 마감 공고까지 센 숫자예요.
        </p>
      </section>

      {/* ═══ ⑥ 고정 문장 + 지나가는 일러스트 ═══ */}
      <WordStage items={stageItems} />

      {/* ═══ ⑦-1 이런 분께 ═══ */}
      <section className={s.block} aria-labelledby="about-personas-title">
        <div className={s.sectionHead}>
          <h2 id="about-personas-title" className={s.sectionTitle}>
            이런 분께
          </h2>
          <p className={s.sectionDesc}>
            {PERSONA_CARDS.length}가지 유형 중 가까운 곳에서 시작해 보세요.
          </p>
        </div>
        <ul className={s.personas}>
          {PERSONA_CARDS.map((p) => (
            <li key={p.id}>
              <Link href={`/match?persona=${p.id}`} className={s.persona}>
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

      {/* ═══ ⑦-2 핵심 영역 ═══ */}
      <section
        className={`${s.block} ${s.blockGray}`}
        aria-labelledby="about-features-title"
      >
        <div className={s.sectionHead}>
          <h2 id="about-features-title" className={s.sectionTitle}>
            핵심 영역
          </h2>
          <p className={s.sectionDesc}>
            정착 결정에 필요한 {FEATURES.length}가지 정보를 한곳에서 비교하세요.
          </p>
        </div>
        <ol className={s.features}>
          {FEATURES.map((f, i) => (
            <li key={f.title}>
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

      {/* ═══ ⑦-5 데이터 출처 ═══ */}
      <section className={s.block} aria-labelledby="about-data-title">
        <div className={s.sectionHead}>
          <h2 id="about-data-title" className={s.sectionTitle}>
            출처가 분명한 데이터
          </h2>
          <p className={s.sectionDesc}>
            지역·작물 숫자는 아래 {SOURCE_COUNT}개 공공기관 자료를 연동해요. 지원사업·교육·행사는 정부·지자체 원문 공고를 확인해 정리해요.
          </p>
        </div>
        <ul className={s.sources}>
          {DATA_SOURCES.map((src) => (
            <li key={src.code} className={s.source}>
              <span className={s.sourceCode}>{src.code}</span>
              <span className={s.sourceName}>{src.name}</span>
              <span className={s.sourceDesc}>
                <AutoGlossary text={src.description} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ═══ ⑦-6 진단 CTA ═══ */}
      <section className={s.cta} aria-labelledby="about-cta-title">
        <div className={s.narrow}>
          <h2 id="about-cta-title" className={s.ctaTitle}>
            어디서 시작할지 모르겠다면
          </h2>
          <p className={s.ctaDesc}>
            <AutoGlossary text="간단한 질문 5개에 답하면, 내 상황과 선호에 맞는 농촌 정착 지역과 작물을 추천해 드려요." />
          </p>
          <Link href="/match" className={s.ctaButton}>
            농촌 정착 유형 진단 시작하기
            <IconWrap icon={ArrowRight} size="sm" />
          </Link>
        </div>
      </section>

      {/* ═══ ⑦-7 운영 정보 + 고지 ═══ */}
      <section className={s.block} aria-labelledby="about-operator-title">
        <div className={s.sectionHead}>
          <h2 id="about-operator-title" className={s.sectionTitle}>
            운영 정보
          </h2>
          <p className={s.sectionDesc}>
            이랑은 개인이 운영하는 비영리 농촌 정착 정보 큐레이션 서비스예요.
            데이터 정정·삭제 요청, 출처 검증 결과는 모두 공개로 관리해요.
          </p>
        </div>
        <ul className={s.operator}>
          <li>
            <a href="mailto:loyal3270@gmail.com" className={s.operatorItem}>
              <Mail size={18} strokeWidth={1.75} aria-hidden="true" />
              <span className={s.operatorLabel}>이메일</span>
              <span className={s.operatorValue}>loyal3270@gmail.com</span>
            </a>
          </li>
          <li>
            <Link href="/about/corrections" className={s.operatorItem}>
              <FileText size={18} strokeWidth={1.75} aria-hidden="true" />
              <span className={s.operatorLabel}>정정 이력</span>
              <span className={s.operatorValue}>최근 데이터 수정 내역 공개</span>
            </Link>
          </li>
          <li>
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
      </section>
    </div>
  );
}
