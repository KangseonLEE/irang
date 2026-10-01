import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { JOURNEY_LANES } from "@/lib/data/journey-lanes";
import { POPULAR_KEYWORDS } from "@/lib/data/popular-keywords";
import { HeroSearchForm } from "./hero-search-form";
import { HeroRotator } from "./hero-rotator";
import s from "./hero-search-hub.module.css";

/**
 * 랜딩 히어로 A안 (2026-10-01 회장 결재) — 우리금융 기후금융포털 구도 번안.
 *
 *   [투명 헤더 ─────────────────────────────────────────]
 *   h1                                   ┌ 유형 카드 ┐┌ ┐┌ ┐
 *   [검색 입력 ─────────── 검색]          └──────────┘└ ┘└ ┘
 *   #인기 #검색어 #칩                      ┌ ┐┌ ┐┌ ┐
 *   ┌ 지금 열린 기회: 수치 4 │ 마감이 가까운 지원사업 3 ┐
 *
 * - 히어로에서 바로 **검색**하거나 **정착 유형**을 골라 들어간다. 두 입구 모두 SSR 링크/폼이라 JS 없이 동작.
 * - 10/1 회장: 문장 속 유형어 + 배경 장면 + 유형 카드 강조가 4.5초마다 함께 넘어간다(HeroRotator).
 *   SSR 은 첫 장면(귀농) 그대로라 첫 페인트·CLS 는 고정 배경과 같다.
 * - `data-landing-hero` 가 투명 오버레이 헤더를 켠다(header.module.css). 되돌림은 HeroSearchDock.
 * - 카드는 불투명 흰 카드(반투명 유리 금지 — 일러스트 위 가독성).
 * - 수치는 page.tsx 가 배열·DB 결과에서 계산해 넘긴다(하드코딩 금지). 0 인 항목은 그리지 않는다.
 */

export interface HeroStat {
  id: string;
  label: string;
  value: number;
  unit: string;
  href: string;
}

export interface HeroDeadline {
  id: string;
  title: string;
  amount?: string;
  daysLeft: number;
}

interface HeroSearchHubProps {
  stats: HeroStat[];
  deadlines: HeroDeadline[];
}

/**
 * 장면 = 정착 유형 하나. 단어·배경·카드가 같은 id 로 묶인다.
 * 배경은 유형에 맞는 수채화(hero-youth 는 10/1 codex 생성, 나머지는 9/28 히어로 4장 재배치).
 */
const SCENES = [
  { id: "guinong", word: "귀농", image: "/landing/hero/hero-2.webp" },
  { id: "guichon", word: "귀촌", image: "/landing/hero/hero-3.webp" },
  { id: "forest", word: "귀산촌", image: "/landing/hero/hero-1.webp" },
  { id: "youth", word: "청년농", image: "/landing/hero/hero-youth.webp" },
  { id: "smartfarm", word: "스마트팜", image: "/landing/hero/hero-4.webp" },
] as const;
const TAG_COUNT = 6;

function dLabel(daysLeft: number): string {
  return daysLeft === 0 ? "오늘 마감" : `D-${daysLeft}`;
}

export function HeroSearchHub({ stats, deadlines }: HeroSearchHubProps) {
  const visibleStats = stats.filter((st) => st.value > 0);
  const tags = POPULAR_KEYWORDS.slice(0, TAG_COUNT);

  return (
    <section className={s.hero} aria-labelledby="hero-title" data-landing-hero>
      <div className={s.bg} aria-hidden="true">
        <HeroRotator scenes={SCENES.map(({ id, image }) => ({ id, image }))} />
        <span className={s.scrim} />
      </div>

      <div className={s.inner}>
        {/* ── 좌: 문장 + 검색 + 인기 검색어 ── */}
        <div className={s.intro}>
          <h1 id="hero-title" className={s.title}>
            {/* 스크린리더·검색엔진은 이 한 문장을 읽는다. 아래 회전 줄은 시각 전용 */}
            <span className={s.srOnly}>
              {SCENES.map((sc) => sc.word).join("·")} 준비, 어디서부터 볼까요?
            </span>
            <span className={s.wordLine} aria-hidden="true">
              <span className={s.wordSlot}>
                {SCENES.map((sc, i) => (
                  <span
                    key={sc.id}
                    className={s.word}
                    data-hero-word={sc.id}
                    data-state={i === 0 ? "in" : "wait"}
                  >
                    {/* "준비,"까지 한 덩어리로 넘긴다 — 칸 폭이 가장 긴 단어 기준이라 밖에 두면 짧은 단어 뒤가 벌어진다 */}
                    <span className={s.wordAccent}>{sc.word}</span> 준비,
                  </span>
                ))}
              </span>
            </span>
            <span className={s.titleRest} aria-hidden="true">
              어디서부터 볼까요?
            </span>
          </h1>
          <p className={s.sub}>
            궁금한 지역·작물·지원사업을 검색하거나 내 정착 유형부터 골라 보세요
          </p>

          <div className={s.searchWrap}>
            <HeroSearchForm variant="hero" idPrefix="hero" />
          </div>

          <div className={s.tagsRow}>
            <span className={s.tagsLabel}>인기 검색어</span>
            <ul className={s.tags}>
              {tags.map((t) => (
                <li key={t.label}>
                  <Link
                    href={`/search?q=${encodeURIComponent(t.label)}`}
                    className={s.tag}
                    data-track={`hero_tag:${t.label}`}
                  >
                    #{t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── 우: 정착 유형 카드 6 ── */}
        <div className={s.types}>
          <h2 className={s.typesTitle}>정착 유형으로 시작하기</h2>
          <ul className={s.typeGrid}>
            {JOURNEY_LANES.map((lane) => (
              <li key={lane.id} className={s.typeItem}>
                <Link
                  href={lane.href}
                  className={s.typeCard}
                  data-track={`hero_type:${lane.id}`}
                  data-hero-card={lane.id}
                  data-active={lane.id === SCENES[0].id ? "" : undefined}
                >
                  <span className={s.thumb} aria-hidden="true">
                    <Image src={lane.charImage} alt="" fill sizes="64px" className={s.thumbImage} />
                  </span>
                  <span className={s.typeText}>
                    <span className={s.typeLabel}>{lane.label}</span>
                    <span className={s.typeDesc}>{lane.desc}</span>
                  </span>
                  <span className={s.typeArrow} aria-hidden="true">
                    <ArrowRight size={16} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── 하단: 지금 열린 기회 수치 + 마감이 가까운 지원사업 ── */}
        {(visibleStats.length > 0 || deadlines.length > 0) && (
          <div className={s.data}>
            {visibleStats.length > 0 && (
              <div className={s.statsBlock}>
                <h2 className={s.dataTitle}>지금 열려 있어요</h2>
                <ul className={s.stats}>
                  {visibleStats.map((st) => (
                    <li key={st.id}>
                      <Link href={st.href} className={s.stat} data-track={`hero_data:${st.id}`}>
                        <span className={s.statLabel}>{st.label}</span>
                        <span className={s.statValue}>
                          {st.value.toLocaleString()}
                          <span className={s.statUnit}>{st.unit}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {deadlines.length > 0 && (
              <div className={s.deadlineBlock}>
                <div className={s.deadlineHead}>
                  <h2 className={s.dataTitle}>마감이 가까운 지원사업</h2>
                  <Link href="/programs" className={s.dataMore} data-track="hero_data:programs_all">
                    전체 보기 <ArrowUpRight size={14} aria-hidden="true" />
                  </Link>
                </div>
                <ul className={s.deadlines}>
                  {deadlines.map((d) => (
                    <li key={d.id}>
                      <Link href={`/programs/${d.id}`} className={s.deadline} data-track={`hero_deadline:${d.id}`}>
                        <span className={s.dBadge}>{dLabel(d.daysLeft)}</span>
                        <span className={s.deadlineTitle}>{d.title}</span>
                        {d.amount && <span className={s.deadlineAmount}>{d.amount}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
