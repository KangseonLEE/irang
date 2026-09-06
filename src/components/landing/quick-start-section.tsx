/**
 * 홈 "바로 시작" 섹션 — Server Component (클라이언트 훅 없음).
 * 8/30 가설 B' — 진단 CTA를 랜딩 중단으로 끌어올리고(기존엔 최하단 CTA 뿐),
 * 검색 의도 1위인 "지역" 진입점을 히어로 칩 외에 하나 더 만든다.
 * 9/6 개편 — 우측을 검색창 중심으로. 시·도 17곳만으로는 시·군·구 229곳에 못 닿아서
 * 검색을 맨 위에 두고, 조건으로 고르고 싶은 사람에게 페르소나 순위 4개를 붙였다.
 *
 * ⚠️ SSR-safe: "use client" 없음 → 진단 CTA·페르소나·시·도 링크가 SSR HTML에 항상 포함된다.
 *    검색창만 Client 래퍼(LandingRegionSearch)로 지연 로드 — 링크는 하나도 JS에 의존하지 않는다.
 * ⚠️ 구성은 전부 <Link> — 상태·이벤트 핸들러 없음(체크리스트 D).
 * ⚠️ 시·도/시·군·구 개수는 배열 length에서 산출 (수치 하드코딩 금지).
 * ⚠️ 선언순: 기본(모바일) → @media (min-width: …) 오버라이드 (체크리스트 G).
 * ⚠️ GA 계측: data-track 속성으로 진단/검색/페르소나/지역/비교 클릭 구분.
 */
import Link from "next/link";
import { ArrowRight, Compass, MapPin } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { LandingRegionSearch } from "./landing-region-search";
import { PersonaSlider, type PersonaCard } from "./persona-slider";
import s from "./quick-start-section.module.css";

/**
 * 조건별 지역 순위 카드 — persona 5종은 normalize 화이트리스트에 등록돼 있다.
 * hint 는 src/lib/data/personas.ts 가중치(가장 큰 축)를 사용자 언어로 옮긴 것: family school 35 /
 * farmYouth farmActivity 40·returnFarm 30 / commuter populationTrend 35·medical 25 / elderRural medical 40.
 * 일러스트: public/landing/personas/{id}.webp (codex 수채화, 흰 배경 — 작물 일러스트 규칙과 동일)
 */
const PERSONAS: readonly PersonaCard[] = [
  {
    id: "family",
    label: "자녀 있어요",
    hint: "학교·병원이 가까운 곳부터 보여요",
    image: "/landing/personas/family.webp",
    alt: "텃밭에서 아이와 함께 방울토마토를 따는 젊은 부부",
  },
  {
    id: "farmYouth",
    label: "청년농으로 시작",
    hint: "영농이 활발하고 정착 흐름이 좋은 곳",
    image: "/landing/personas/farm-youth.webp",
    alt: "온실 앞에서 모종 트레이를 든 청년 농부",
  },
  {
    id: "commuter",
    label: "도시 통근",
    hint: "인구 흐름과 생활 인프라가 탄탄한 곳",
    image: "/landing/personas/commuter.webp",
    alt: "시골 간이역에서 출근 준비 중인 직장인",
  },
  {
    id: "elderRural",
    label: "은퇴 후 한적하게",
    hint: "의료가 가깝고 조용한 마을 우선",
    image: "/landing/personas/elder-rural.webp",
    alt: "정원에 물을 주는 은퇴한 부부",
  },
] as const;

/** 지역 블록 하단 보조 링크 */
const SUB_LINKS = [
  { href: "/regions/compare", label: "지역 비교", track: "quickstart:compare" },
  { href: "/regions", label: "전체 지역 보기", track: "quickstart:regions" },
] as const;

export function QuickStartSection() {
  return (
    <section className={s.section} aria-label="바로 시작하기">
      {/* ── 좌: 진단 카드 ── */}
      <div className={s.assessCard}>
        <span className={s.eyebrow}>#무료 진단</span>
        <h2 className={s.assessTitle}>내 땅, 어디쯤일까요?</h2>
        <p className={s.assessDesc}>5분이면 내 귀농지 윤곽이 잡혀요</p>
        <Link href="/match" className={s.assessCta} data-track="quickstart:assess">
          <Icon icon={Compass} size="md" />
          무료 진단 시작하기
        </Link>
      </div>

      {/* ── 우: 지역 진입 ── */}
      <div className={s.regionBlock}>
        <h2 className={s.regionLabel}>
          <Icon icon={MapPin} size="md" className={s.regionLabelIcon} />
          어디부터 볼까요?
        </h2>
        <p className={s.regionDesc}>
          시·군·구 {SIGUNGUS.length}곳, 이름으로 바로 찾아요
        </p>

        <div className={s.searchSlot}>
          <LandingRegionSearch />
        </div>

        <p className={s.groupLabel}>내 조건으로 순위 보기</p>
        <PersonaSlider items={PERSONAS} />

        <p className={s.provinceRow}>
          <span className={s.provinceRowLabel}>시·도 바로가기</span>
          {PROVINCES.map((province) => (
            <Link
              key={province.id}
              href={`/regions/${province.id}`}
              className={s.provinceLink}
              data-track={`quickstart:region:${province.id}`}
              prefetch={false}
            >
              {province.shortName}
            </Link>
          ))}
        </p>

        <div className={s.subLinks}>
          {SUB_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={s.subLink}
              data-track={link.track}
              prefetch={false}
            >
              {link.label}
              <Icon icon={ArrowRight} size="sm" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
