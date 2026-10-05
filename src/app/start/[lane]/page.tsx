import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  Compass,
  GraduationCap,
  HandCoins,
  Lightbulb,
  MapPin,
  MessageSquareQuote,
  Sprout,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { AnchorTabNav } from "@/components/ui/anchor-tab-nav";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { EventPhotoCard } from "@/components/events/event-photo-card";
import { LaneTrendChart } from "@/components/start/lane-trend-chart";
import { LaneIndicators } from "@/components/start/lane-indicators";
import { OpportunityTabs, type OpportunityPanel } from "@/components/start/opportunity-tabs";
import { CropLinkCard } from "@/components/crops/crop-link-card";
import { PersonaCta } from "@/components/persona/persona-cta";
import { StatusBadge } from "@/components/ui/status-badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { Icon } from "@/components/ui/icon";
import { START_LANES } from "@/lib/data/journey-lanes";
import { programStatusLabel, deriveStatus } from "@/lib/program-status";
import { displayText } from "@/lib/programs/display";
import {
  buildLaneHub,
  isHubLaneId,
  loadHubPrograms,
  matchLaneEducation,
  matchLaneEvents,
  MAX_OPPORTUNITIES,
  type RelatedIconName,
} from "@/lib/data/journey-lanes-hub";
import type { InterviewSummary } from "@/lib/data/interview-summary";
import { filterEducationAsync, type EducationCourse } from "@/lib/data/education";
import { filterEventsAsync, type FarmEvent } from "@/lib/data/events";
import { getCropImageSrc, hasCropIllustration } from "@/lib/crop-image";
import { shareMetadata } from "@/lib/seo/share-metadata";
import s from "./page.module.css";

export const dynamicParams = false;
/* 교육·체험은 DB(그린대로 수집)라 하루 몇 번은 새로 읽는다 — 랜딩과 같은 주기. searchParams 미사용이라 ISR 안전 */
export const revalidate = 21600;

export function generateStaticParams() {
  /* undecided 는 middleware 가 /start 로 307 을 낸다(라우터 밖에서 끊어야 진짜 3xx) */
  return START_LANES.map((l) => ({ lane: l.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lane: string }>;
}): Promise<Metadata> {
  const { lane: id } = await params;
  if (id === "undecided") return { title: "어떤 시작이 나에게 맞을까요? — 이랑", alternates: { canonical: "/start" } };
  const lane = START_LANES.find((l) => l.id === id);
  if (!isHubLaneId(id) || !lane) notFound();
  return {
    title: `${lane.label}으로 시작하기 — 현황·지원사업·작물·사람 이야기`,
    description: lane.intro,
    alternates: { canonical: `/start/${id}` },
    ...shareMetadata({
      title: `${lane.label}으로 시작하기 | 이랑`,
      description: lane.intro,
      path: `/start/${id}`,
    }),
  };
}

const SECTIONS = [
  { id: "hub-status", label: "현황" },
  { id: "hub-programs", label: "지원·교육·체험" },
  { id: "hub-crops", label: "작물" },
  { id: "hub-interviews", label: "사람 이야기" },
  { id: "hub-related", label: "함께 보기" },
];

const RELATED_ICONS: Record<RelatedIconName, LucideIcon> = {
  map: MapPin,
  wallet: Wallet,
  trend: TrendingUp,
  compass: Compass,
};

/** 교육·체험 로더 — 실패해도 페이지는 지원사업만으로 선다(빈 배열 = 빈 상태 안내) */
async function loadOpportunities(): Promise<{ courses: EducationCourse[]; events: FarmEvent[] }> {
  const [edu, ev] = await Promise.all([
    filterEducationAsync({}).catch(() => ({ courses: [] as EducationCourse[] })),
    filterEventsAsync({}).catch(() => ({ events: [] as FarmEvent[] })),
  ]);
  return { courses: edu.courses, events: ev.events };
}

export default async function LaneHubPage({ params }: { params: Promise<{ lane: string }> }) {
  const { lane: id } = await params;
  if (id === "undecided") redirect("/start");
  const lane = START_LANES.find((l) => l.id === id);
  if (!isHubLaneId(id) || !lane) notFound();

  /* 지원사업도 `/programs` 와 같은 로더(DB 우선 + 정적 병합) — 정적만 쓰면 DB 전용 활성 사업이 빠진다(10/3 QA) */
  const [programs, { courses, events }] = await Promise.all([loadHubPrograms(), loadOpportunities()]);
  const hub = buildLaneHub(id, programs);
  const trend = hub.trend;
  // 대표 작물 비용 출처가 모두 같으면 카드마다 반복하지 않고 목록 아래 한 줄로 (10/3 회장 배치 정리)
  const costSharedSource =
    hub.costCards.length > 0 && hub.costCards.every((c) => c.source === hub.costCards[0].source)
      ? hub.costCards[0].source
      : null;
  /* 매칭은 상한 없이 — 탭 배지는 전체 건수, 목록은 상한까지 */
  const laneCourses = matchLaneEducation(courses, id);
  const laneEvents = matchLaneEvents(events, id);

  const panels: OpportunityPanel[] = [
    {
      id: "programs",
      label: "지원사업",
      track: "programs",
      total: hub.programsTotal,
      moreHref: hub.programsHref,
      moreLabel: "지원사업 전체 보기",
      empty: (
        <EmptyState
          icon={<HandCoins size={20} aria-hidden="true" />}
          message={`지금 신청할 수 있는 ${lane.label} 지원사업이 없어요`}
          linkHref="/programs"
          linkText="지원사업 전체 보기"
        />
      ),
      items: hub.programs.map((p) => (
        <Link key={p.id} href={`/programs/${p.id}`} className={s.programCard}>
          <span className={s.programBadges}>
            <StatusBadge
              status={programStatusLabel({
                status: deriveStatus(p.applicationStart, p.applicationEnd),
                applicationStart: p.applicationStart,
                applicationEnd: p.applicationEnd,
                applicationCycle: p.applicationCycle,
              })}
            />
          </span>
          <span className={s.programTitle}>{p.title}</span>
          <ProgramSummary id={p.id} summary={p.summary} />
          <span className={s.programMeta}>{p.organization}</span>
        </Link>
      )),
    },
    {
      id: "education",
      label: "교육",
      track: "education",
      total: laneCourses.length,
      moreHref: "/education",
      moreLabel: "교육 전체 보기",
      empty: (
        <EmptyState
          icon={<GraduationCap size={20} aria-hidden="true" />}
          message={`지금 모집 중인 ${lane.label} 교육이 없어요`}
          linkHref="/education"
          linkText="교육 전체 보기"
        />
      ),
      items: laneCourses.slice(0, MAX_OPPORTUNITIES).map((c) => (
        <Link key={c.id} href={`/education/${c.id}`} className={s.programCard}>
          <span className={s.programBadges}>
            <StatusBadge status={c.status} />
            <span className={s.chip}>{c.type}</span>
          </span>
          <span className={s.programTitle}>{c.title}</span>
          <span className={s.programSummary}>
            {c.region}
            {c.crawlGroup && c.crawlGroup.others.length > 0 && ` 외 ${c.crawlGroup.others.length}개 지역`}
          </span>
          <span className={s.programMeta}>{c.organization}</span>
        </Link>
      )),
    },
    {
      id: "events",
      label: "체험",
      track: "events",
      total: laneEvents.length,
      moreHref: "/events",
      moreLabel: "체험 전체 보기",
      empty: (
        <EmptyState
          icon={<CalendarCheck size={20} aria-hidden="true" />}
          message={`지금 모집 중인 ${lane.label} 체험이 없어요`}
          linkHref="/events"
          linkText="체험 전체 보기"
        />
      ),
      items: laneEvents.slice(0, MAX_OPPORTUNITIES).map((e) => (
        <EventPhotoCard
          key={e.id}
          event={e}
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw"
        />
      )),
    },
  ];

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd
        items={[
          { name: "정착 유형", href: "/start" },
          { name: lane.label, href: `/start/${id}` },
        ]}
      />

      {/* ── 상단 스트립 — 포스터 배경 + 제목 + 소개글 + 타일 ── */}
      <header className={s.strip}>
        <span className={s.stripArt} aria-hidden="true">
          {/* 스트립은 풀블리드(100vw)지만 원본이 900px 라 그보다 큰 요청은 같은 900px 를 다시 받는다(10/3 실측:
              w=1200·1920 모두 900×1350 동일 바이트) → 원본 폭에서 상한. 포스터 실존은 CI H-2 가 보장 */}
          <Image src={lane.image} alt="" fill sizes="(min-width: 900px) 900px, 100vw" className={s.stripImg} preload />
        </span>
        <div className={s.stripBody}>
          <div className={s.stripText}>
            <p className={s.eyebrow}>시작 유형</p>
            <h1 className={s.title}>{lane.label}으로 시작하기</h1>
            <p className={s.intro}>
              <AutoGlossary text={lane.intro} />
            </p>
            <ul className={s.tiles}>
              {hub.tiles.map((t) => (
                <li key={t.label} className={s.tile}>
                  <span className={s.tileValue}>{t.value}</span>
                  <span className={s.tileLabel}>{t.label}</span>
                  <span className={s.tileSource}>{t.source}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* 사람 일러스트(charImage)는 두지 않는다 — 모바일은 원래 숨김, 768+ 는 회장 10/2 지시로 제외.
              CSS 로만 숨기면 next/image 가 이미지를 그대로 내려받으므로 요소 자체를 렌더하지 않는다. */}
        </div>
      </header>

      {/* 브레드크럼 → 섹션 탭 (10/2 회장: 상세 공통 — 히어로 아래, 탭 위) */}
      <div className={s.navBlock}>
        <Breadcrumb items={[{ name: "정착 유형", href: "/start" }, { name: lane.label }]} />
        <AnchorTabNav sections={SECTIONS} />
      </div>

      {/* ── 현황 — 대표 작물 비용 + 왜 이 길을 택할까 ── */}
      <ScrollReveal trackId={`start_hub_status`} variant="fade" stagger>
        <section id="hub-status" className={s.section} aria-labelledby="hub-status-title">
          <SectionHeader id="hub-status-title" icon={BarChart3} title={`${lane.label} 현황`} />
          <div className={s.sectionBody}>
            {hub.costCards.length > 0 && (
              <>
                <h3 className={s.subTitle}>대표 작물 비용</h3>
                <ul className={s.costGrid}>
                  {hub.costCards.map((c) => {
                    const inner = (
                      <>
                        <span className={s.costMedia}>
                          {c.cropId && hasCropIllustration(c.cropId) ? (
                            <Image
                              src={getCropImageSrc(c.cropId)}
                              alt=""
                              fill
                              sizes="(min-width: 1024px) 120px, (min-width: 640px) 112px, 80px"
                              className={s.costImg}
                            />
                          ) : (
                            <span className={s.costPlaceholder} aria-hidden="true">
                              <Sprout size={28} strokeWidth={1.75} />
                            </span>
                          )}
                        </span>
                        <span className={s.costBody}>
                          <span className={s.costHead}>
                            <span className={s.costName}>{c.name}</span>
                            <DifficultyBadge level={c.difficulty} size="sm" />
                          </span>
                          {c.facilityType && <span className={s.costFacility}>{c.facilityType}</span>}
                          <dl className={s.costRows}>
                            <div className={s.costRow}>
                              <dt>초기 투자금</dt>
                              <dd>{c.initialCost}</dd>
                            </div>
                            <div className={s.costRow}>
                              <dt>연 운영비</dt>
                              <dd>{c.annual}</dd>
                            </div>
                            <div className={s.costRow}>
                              <dt>손익분기</dt>
                              <dd>{c.breakEven}</dd>
                            </div>
                          </dl>
                          {!costSharedSource && <span className={s.costSource}>{c.source}</span>}
                        </span>
                      </>
                    );
                    return (
                      <li key={c.id} data-reveal-item>
                        {c.cropId ? (
                          <Link
                            href={`/crops/${c.cropId}`}
                            className={`${s.costCard} ${s.costCardLink}`}
                            data-track={`start_hub_cost:${id}:${c.cropId}`}
                          >
                            {inner}
                          </Link>
                        ) : (
                          <div className={s.costCard}>{inner}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {costSharedSource && <p className={s.costSourceNote}>출처 · {costSharedSource}</p>}
              </>
            )}

            <div className={s.subHead}>
              <h3 className={s.subTitle}>{trend.title}</h3>
              <Link href={trend.href} className={s.more} data-track={`start_hub_more:${id}:trend`}>
                통계 더 보기 →
              </Link>
            </div>
            <p className={s.subtitleText}>{trend.subtitle}</p>
            <div className={s.trendGrid}>
              <div className={s.trendMain}>
                <p className={s.trendHeadline}>
                  <span className={s.trendHeadlineValue}>{trend.headline.value}</span>
                  <span className={s.trendHeadlineLabel}>{trend.headline.label}</span>
                  <span className={s.trendHeadlineSub}>{trend.headline.sub}</span>
                </p>
                <LaneTrendChart
                  points={trend.points}
                  seriesLabel={trend.seriesLabel}
                  unit={trend.unit}
                  decimals={trend.decimals}
                  target={trend.target}
                />
              </div>
              <LaneIndicators items={trend.indicators} />
            </div>

            <h3 className={s.subTitle}>
              {trend.reasons.title} <span className={s.range}>{trend.reasons.surveyLabel}</span>
            </h3>
            <ul className={s.bars}>
              {trend.reasons.items.map((it, i) => (
                <li key={it.label} className={i === 0 ? `${s.barRow} ${s.barRowTop}` : s.barRow}>
                  <span className={s.barLabel}>{it.label}</span>
                  <span className={s.barTrack} aria-hidden="true">
                    <span className={s.barFill} style={{ width: `${it.pct}%` }} />
                  </span>
                  <span className={s.barPct}>{it.pct}%</span>
                </li>
              ))}
            </ul>
            <p className={s.source}>출처: {trend.source}</p>
          </div>
        </section>
      </ScrollReveal>

      {/* ── 지원사업·교육·체험 ── */}
      <ScrollReveal trackId={`start_hub_programs`} variant="fade">
        <section id="hub-programs" className={s.section} aria-labelledby="hub-programs-title">
          <SectionHeader id="hub-programs-title" icon={HandCoins} title="지금 신청할 수 있어요" />
          <div className={s.sectionBody}>
            <p className={s.subtitleText}>
              {lane.label}에 맞는 지원사업·교육·체험 중 마감되지 않은 것만 모았어요
            </p>
            <OpportunityTabs panels={panels} laneId={id} gridClassName={s.cardGrid} />
          </div>
        </section>
      </ScrollReveal>

      {/* ── 작물 ── */}
      <ScrollReveal trackId={`start_hub_crops`} variant="fade" stagger>
        <section id="hub-crops" className={s.section} aria-labelledby="hub-crops-title">
          <SectionHeader
            id="hub-crops-title"
            icon={Sprout}
            title="이 길에서 많이 짓는 작물"
            more={
              <Link href={hub.cropsHref} className={s.more} data-track={`start_hub_more:${id}:crops`}>
                전체 보기 →
              </Link>
            }
          />
          <div className={s.sectionBody}>
            <ul className={s.cropGrid}>
              {hub.crops.map((c) => (
                <li key={c.id} data-reveal-item>
                  <CropLinkCard cropId={c.id} name={c.name} href={`/crops/${c.id}`} meta={c.category} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      </ScrollReveal>

      {/* ── 사람 이야기 ── */}
      {hub.interviews.length > 0 && (
        <ScrollReveal trackId={`start_hub_interviews`} variant="fade" stagger>
          <section id="hub-interviews" className={s.section} aria-labelledby="hub-interviews-title">
            <SectionHeader
              id="hub-interviews-title"
              icon={MessageSquareQuote}
              title="먼저 간 사람들"
              more={
                <Link href={hub.interviewsHref} className={s.more} data-track={`start_hub_more:${id}:interviews`}>
                  전체 보기 →
                </Link>
              }
            />
            <div className={s.sectionBody}>
              <ul className={s.cardGrid}>
                {hub.interviews.map((p: InterviewSummary) => (
                  <li key={p.id} data-reveal-item>
                    <Link
                      href={p.href}
                      className={s.interviewCard}
                      {...(p.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      <span className={s.interviewQuote}>&ldquo;{p.quote}&rdquo;</span>
                      <span className={s.interviewMeta}>
                        {p.name} · {p.region} · {p.crop}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* ── 함께 보면 좋아요 — 순서 없는 추천 링크 묶음 ── */}
      <ScrollReveal trackId={`start_hub_next`} variant="fade" stagger>
        <section id="hub-related" className={s.section} aria-labelledby="hub-related-title">
          <SectionHeader id="hub-related-title" icon={Lightbulb} title="함께 보면 좋아요" />
          <div className={s.sectionBody}>
            <p className={s.subtitleText}>{lane.label}을 고민할 때 같이 찾아보는 곳이에요</p>
            <ul className={s.nextGrid}>
              {hub.nextSteps.map((n) => (
                <li key={n.href} data-reveal-item>
                  <Link href={n.href} className={s.nextCard} data-track={`start_hub_next:${id}`}>
                    <Icon icon={RELATED_ICONS[n.icon]} size="md" variant="soft" box="md" />
                    <span className={s.nextText}>
                      <span className={s.nextLabel}>{n.label}</span>
                      <span className={s.nextDesc}>{n.desc}</span>
                    </span>
                    <ArrowRight size={16} className={s.nextIcon} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
            <PersonaCta from="start_hub" copy="내 조건에 맞는 곳부터 볼까요?" />
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}

/** 지원사업 카드 요약 줄 — 수집 행의 "…에서 수집했어요." 같은 출처 문장뿐이면 줄째 숨긴다 (10/3) */
function ProgramSummary({ id, summary }: { id: string; summary: string }) {
  const text = displayText(id, summary);
  if (!text) return null;
  return (
    <span className={s.programSummary}>
      <AutoGlossary text={text} maxHighlights={1} />
    </span>
  );
}

/** 섹션 헤더 — 작물·지역 상세와 같은 문법(soft 아이콘 박스 + h2), 우측에 선택 링크 */
function SectionHeader({
  id,
  icon,
  title,
  more,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  more?: ReactNode;
}) {
  return (
    <div className={s.sectionHeader}>
      <h2 id={id} className={s.sectionTitle}>
        <Icon icon={icon} size="lg" variant="soft" box="md" />
        <span>{title}</span>
      </h2>
      {more}
    </div>
  );
}
