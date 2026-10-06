import { Fragment } from "react";
import type React from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Compass, Cpu, House, Sprout, Tractor, Trees, type LucideIcon } from "lucide-react";
import { JOURNEY_LANES } from "@/lib/data/journey-lanes";
import { RECOMMENDED_KEYWORDS } from "@/lib/data/popular-keywords";
import { buildLaneStats, type LaneTile } from "@/lib/data/journey-lanes-stats";
import type { SupportProgram } from "@/lib/data/programs";
import { SETTLEMENT_SCENE_IMAGE } from "@/lib/data/settlement-scenes";
import { HeroSearchForm } from "./hero-search-form";
import { HeroRotator } from "./hero-rotator";
import { HeroTypeCarousel } from "./hero-type-carousel";
import { HeroKeywordTicker } from "./hero-keyword-ticker";
import { HeroMotionProvider, HeroPauseButton } from "./hero-motion";
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
 * - 10/1 회장: 문장 속 유형어 + 배경 장면이 4.5초마다 함께 넘어간다(HeroRotator).
 *   10/2 회장: 유형 카드는 그 회전과 싱크하지 않는다 — 모바일은 스냅된 카드, 데스크탑은 호버한 카드만 강조.
 *   SSR 은 첫 장면(귀농) 그대로라 첫 페인트·CLS 는 고정 배경과 같다.
 * - `data-landing-hero` 가 투명 오버레이 헤더를 켠다(header.module.css). 되돌림은 HeroSearchDock.
 * - 10/2 회장: 기후금융포털식 **등장 연출**(안개 걷힘 → 제목 줄 리빌 → 순차 fade-up, ≈2s, CSS 만)과
 *   **유리 UI**(반투명 어두운 유리 + 흰 1px 테두리). 등장 연출은 `animation-fill-mode: backwards` 라
 *   끝나면 원래 스타일로 돌아간다 — JS 가 없어도 2초 뒤 완성 상태, reduced-motion 은 즉시 완성.
 *   유리 위 흰 글씨 대비는 5개 장면 최악 픽셀 기준으로 맞췄다(불투명도 값 옆 주석).
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

/**
 * 히어로 수치·"전체 보기"의 목적지 — 숫자를 누르면 그 숫자가 나오는 목록이어야 한다(10/6 QA: "신청 가능 17건" → 기본 목록 49건).
 * `status`·`sort` 는 /programs normalize 화이트리스트 값이다(308 strip 안 됨, :3417 운영 빌드 200 실측).
 * 인코딩은 FilterBar(buildFilterUrl)와 같은 URLSearchParams — 목록 안에서 필터를 눌러 온 주소와 같은 캐시 키가 된다.
 */
export const PROGRAMS_OPEN_HREF = `/programs?${new URLSearchParams({ status: "모집중" })}`;
/** 마감 가까운 순 — "7일 안에 마감 N건"·"마감이 가까운 지원사업 전체 보기"는 맨 위 N건이 그 사업들이다 */
export const PROGRAMS_DUE_HREF = `/programs?${new URLSearchParams({ status: "모집중", sort: "deadline" })}`;

/**
 * 살아보기 수치의 목록 조건 — 숫자(page.tsx `filterEventsAsync(STAY_FILTER)`)와 링크가 **같은 객체**에서 나온다.
 * 10/6 R2-Q4: "신청 중인 살아보기 11곳" → /events 기본 목록 16건(살아보기만 골라도 12건)이었다.
 * `type` 은 /events normalize 화이트리스트(EVENT_TYPE_VALUES) 값이라 308 strip 되지 않는다.
 */
export const STAY_FILTER = { type: "살아보기" } as const;
export const STAY_OPEN_HREF = `/events?${new URLSearchParams(STAY_FILTER)}`;

/**
 * 목록 하나를 히어로 수치 한 칸으로 — 숫자는 그 목록이 보여 주는 건수 그대로(목록 화면 "검색 결과 N건"과 같은 단위),
 * 라벨은 그 목록에 실제로 든 것. 목적지 목록은 예정 건까지 보여 주므로 예정을 숫자에서 빼면 또 어긋난다 —
 * 대신 예정이 섞이면 "모집 중인"이라 부르지 않는다(10/6 R2-Q4).
 */
export function listStat({
  id,
  items,
  openStatus,
  openLabel,
  mixedLabel,
  href,
}: {
  id: string;
  items: readonly { status: string }[];
  /** 지금 신청할 수 있는 상태 값 — 교육 "모집중", 체험 "접수중" */
  openStatus: string;
  openLabel: string;
  /** 예정 건이 섞였을 때 */
  mixedLabel: string;
  href: string;
}): HeroStat {
  const allOpen = items.every((item) => item.status === openStatus);
  return { id, label: allOpen ? openLabel : mixedLabel, value: items.length, unit: "건", href };
}

interface HeroSearchHubProps {
  stats: HeroStat[];
  deadlines: HeroDeadline[];
  /**
   * 유형 카드 "관련 지원사업" 건수의 모집단 — page.tsx 가 `loadPrograms()`(DB 우선 + 정적 보충)로 넘긴다.
   * 정적 배열만 쓰면 DB 에만 있는 활성 사업이 빠져 같은 화면 수치와 어긋난다(10/2 QA A🟡2). 없으면 정적 배열.
   */
  programs?: readonly SupportProgram[];
}

/**
 * 장면 = 정착 유형 하나. 단어·배경·카드가 같은 id 로 묶인다.
 * 배경은 유형에 맞는 수채화(hero-youth 는 10/1 codex 생성, 나머지는 9/28 히어로 4장 재배치).
 */
const SCENES = [
  { id: "guinong", word: "귀농", image: SETTLEMENT_SCENE_IMAGE.farming },
  { id: "guichon", word: "귀촌", image: SETTLEMENT_SCENE_IMAGE.rural },
  { id: "forest", word: "귀산촌", image: SETTLEMENT_SCENE_IMAGE.mountain },
  { id: "youth", word: "청년농", image: SETTLEMENT_SCENE_IMAGE.youth },
  { id: "smartfarm", word: "스마트팜", image: SETTLEMENT_SCENE_IMAGE.smartfarm },
] as const;

/**
 * 유형 카드 한 줄 수치 (10/2 회장 "카드에 데이터를 조금 더") — 선택 화면 타일(buildLaneStats)과 **같은 계산**을 쓴다.
 * 지원사업 건수 · 진입 난이도 · 초기 투자(또는 보완 수치) 3개만. 연도 맥락이 필요한 추세 타일은 카드 폭에서 오해를 부르니 뺀다.
 */
const FACT_SHORT_LABEL: Record<string, string> = {
  // "지원사업 32건"만 두면 바로 아래 "신청 가능한 지원사업 12건"(모집중만)과 모순처럼 읽힌다 —
  // 이 수치는 정기 접수·모집예정까지 포함한 유형 관련 건수라 "관련"을 붙인다
  "지금 볼 수 있는 지원사업": "관련 지원사업",
  "진입 난이도": "난이도",
  "초기 투자금 평균": "초기 투자",
  "비교할 시·군·구": "시·군·구",
  "진단 뒤 볼 작물": "작물",
};

function cardFacts(tiles: LaneTile[] = []): { label: string; value: string }[] {
  return tiles
    .filter((t) => FACT_SHORT_LABEL[t.label] && t.value !== "진단으로")
    .map((t) => ({ label: FACT_SHORT_LABEL[t.label], value: t.value }))
    .slice(0, 3);
}

/** 유형 카드 아이콘 (10/2 회장: 사람 일러스트 → 아이콘). 브랜드 규칙대로 lucide 만 */
const LANE_ICON: Record<string, LucideIcon> = {
  guinong: Tractor,
  guichon: House,
  forest: Trees,
  youth: Sprout,
  smartfarm: Cpu,
  undecided: Compass,
};

function LaneIcon({ id }: { id: string }) {
  const Glyph = LANE_ICON[id] ?? Compass;
  return <Glyph className={s.thumbIcon} strokeWidth={1.75} />;
}

function dLabel(daysLeft: number): string {
  return daysLeft === 0 ? "오늘 마감" : `D-${daysLeft}`;
}

export function HeroSearchHub({ stats, deadlines, programs }: HeroSearchHubProps) {
  const visibleStats = stats.filter((st) => st.value > 0);
  // 추천 검색어 단일 출처(10/2) — 헤더 검색 패널·/search 빈 화면과 같은 목록
  const tickerKeywords = RECOMMENDED_KEYWORDS;
  // programs 가 없으면 buildLaneStats 의 기본값(정적 PROGRAMS)
  const laneStats = buildLaneStats(
    JOURNEY_LANES.map((lane) => lane.id),
    programs,
  );

  return (
    <section className={s.hero} aria-labelledby="hero-title" data-landing-hero>
      <HeroMotionProvider>
        <div className={s.bg} aria-hidden="true">
          <HeroRotator scenes={SCENES.map(({ id, image }) => ({ id, image }))} />
          <span className={s.scrim} />
          {/* 등장 연출: 밝은 안개가 걷히며 배경이 드러난다(끝나면 투명, 상호작용 없음) */}
          <span className={s.fog} />
        </div>

        <div className={s.inner}>
          {/* ── 좌: 문장 + 검색 + 인기 검색어 ── */}
          <div className={s.intro}>
            <h1 id="hero-title" className={s.title}>
              {/* 스크린리더·검색엔진은 이 한 문장을 읽는다. 아래 회전 줄은 시각 전용 */}
              {/* 뒤 공백들: textContent(검색엔진·복사)가 "볼까요?귀농 준비,귀촌 준비,…"로 붙지 않게(10/2 QA B⚪-5).
                  블록·그리드 안 공백이라 화면 배치는 그대로다 */}
              <span className={s.srOnly}>{SCENES.map((sc) => sc.word).join("·")} 준비, 어디서부터 볼까요?</span>{" "}
              {/* 줄 단위 마스크 리빌 — 줄(overflow hidden) 안의 lineInner 가 아래에서 올라온다 */}
              <span className={s.wordLine} aria-hidden="true">
                <span className={s.lineInner}>
                  <span className={s.wordSlot}>
                    {SCENES.map((sc, i) => (
                      <Fragment key={sc.id}>
                        {i > 0 && " "}
                        <span className={s.word} data-hero-word={sc.id} data-state={i === 0 ? "in" : "wait"}>
                          {/* "준비,"까지 한 덩어리로 넘긴다 — 칸 폭이 가장 긴 단어 기준이라 밖에 두면 짧은 단어 뒤가 벌어진다 */}
                          <span className={s.wordAccent}>{sc.word}</span> 준비,
                        </span>
                      </Fragment>
                    ))}
                  </span>
                </span>
              </span>{" "}
              <span className={s.titleRest} aria-hidden="true">
                <span className={s.lineInner}>어디서부터 볼까요?</span>
              </span>
            </h1>
            <p className={s.sub}>궁금한 지역·작물·지원사업을 검색하거나 내 정착 유형부터 골라 보세요</p>

            {/* 10/2 회장: 추천 검색어를 검색창 위로 — 무엇을 칠지 먼저 보고 검색창으로 내려간다 */}
            <HeroKeywordTicker keywords={tickerKeywords} />

            <div className={s.searchWrap}>
              <HeroSearchForm variant="hero" />
            </div>
          </div>

          {/* ── 우: 정착 유형 카드 6 ── */}
          <div className={s.types}>
            <div className={s.typesHead}>
              <h2 className={s.typesTitle}>정착 유형으로 시작하기</h2>
              {/* 장면·추천 검색어 자동 전환 정지(WCAG 2.2.2) */}
              <HeroPauseButton />
            </div>
            <HeroTypeCarousel labels={JOURNEY_LANES.map((lane) => lane.label)}>
              {JOURNEY_LANES.map((lane, i) => (
                /* --i = 등장 스태거 순서(CSS 가 지연을 계산) */
                <li key={lane.id} className={s.typeItem} style={{ "--i": i } as React.CSSProperties}>
                  <Link
                    href={lane.href}
                    className={s.typeCard}
                    data-track={`hero_type:${lane.id}`}
                    data-hero-card={lane.id}
                  >
                    <span className={s.thumb} aria-hidden="true">
                      <LaneIcon id={lane.id} />
                    </span>
                    <span className={s.typeText}>
                      <span className={s.typeLabel}>{lane.label}</span>
                      <span className={s.typeDesc}>{lane.desc}</span>
                    </span>
                    {cardFacts(laneStats[lane.id]).length > 0 && (
                      <span className={s.typeFacts}>
                        {cardFacts(laneStats[lane.id]).map((f) => (
                          <span key={f.label} className={s.typeFact}>
                            <span className={s.typeFactLabel}>{f.label}</span>
                            <span className={s.typeFactValue}>{f.value}</span>
                          </span>
                        ))}
                      </span>
                    )}
                    <span className={s.typeArrow} aria-hidden="true">
                      <ArrowRight size={16} />
                    </span>
                  </Link>
                </li>
              ))}
            </HeroTypeCarousel>
          </div>

          {/* ── 하단: 지금 열린 기회 수치 + 마감이 가까운 지원사업 ── */}
          {(visibleStats.length > 0 || deadlines.length > 0) && (
            <div className={s.data}>
              {visibleStats.length > 0 && (
                <div className={s.statsBlock} style={{ "--n": visibleStats.length } as React.CSSProperties}>
                  <h2 className={s.dataTitle}>지금 열려 있어요</h2>
                  <ul className={s.stats}>
                    {visibleStats.map((st) => (
                      <li key={st.id}>
                        <Link href={st.href} className={s.stat} data-track={`hero_data:${st.id}`}>
                          <span className={s.statLabel}>{st.label}</span>
                          <span className={s.statValue}>
                            {st.value.toLocaleString("ko-KR")}
                            <span className={s.statUnit}>{st.unit}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {deadlines.length > 0 && (
                <div className={s.deadlineBlock} style={{ "--n": deadlines.length } as React.CSSProperties}>
                  <div className={s.deadlineHead}>
                    <h2 className={s.dataTitle}>마감이 가까운 지원사업</h2>
                    <Link href={PROGRAMS_DUE_HREF} className={s.dataMore} data-track="hero_data:programs_all">
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
      </HeroMotionProvider>
    </section>
  );
}
