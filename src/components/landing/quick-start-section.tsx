/**
 * 홈 "바로 시작" 섹션 — Server Component (클라이언트 훅 없음).
 * 8/30 가설 B' — 진단 CTA를 랜딩 중단으로 끌어올리고(기존엔 최하단 CTA 뿐),
 * 검색 의도 1위인 "지역" 진입점을 히어로 칩 외에 하나 더 만든다.
 *
 * ⚠️ SSR-safe: "use client" 없음 → 진단 CTA·시·도 링크가 SSR HTML에 항상 포함된다.
 * ⚠️ 구성은 전부 <Link> — 상태·이벤트 핸들러 없음(체크리스트 D).
 * ⚠️ 시·도 개수는 PROVINCES.length에서 산출 (수치 하드코딩 금지).
 * ⚠️ 선언순: 기본(모바일) → @media (min-width: …) 오버라이드 (체크리스트 G).
 * ⚠️ GA 계측: data-track 속성으로 진단/지역/비교/순위 클릭 구분.
 */
import Link from "next/link";
import { ArrowRight, Compass, MapPin } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { PROVINCES } from "@/lib/data/regions";
import s from "./quick-start-section.module.css";

/** 지역 칩 하단 보조 링크 — 비교·순위 딥링크 */
const SUB_LINKS = [
  { href: "/regions/compare", label: "지역 비교", track: "quickstart:compare" },
  { href: "/regions/ranking", label: "나에게 맞는 지역 순위", track: "quickstart:ranking" },
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
          지역부터 볼래요
        </h2>
        <p className={s.regionDesc}>시·도 {PROVINCES.length}곳 중에 골라보세요</p>
        <div className={s.chips}>
          {PROVINCES.map((province) => (
            <Link
              key={province.id}
              href={`/regions/${province.id}`}
              className={s.chip}
              data-track={`quickstart:region:${province.id}`}
              prefetch={false}
            >
              {province.shortName}
            </Link>
          ))}
        </div>
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
