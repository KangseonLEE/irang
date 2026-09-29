import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { AnchorTabNav } from "@/components/ui/anchor-tab-nav";
import { CropLinkCard } from "@/components/crops/crop-link-card";
import { PersonaCta } from "@/components/persona/persona-cta";
import { StatusBadge } from "@/components/ui/status-badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { START_LANES, JOURNEY_LANES } from "@/lib/data/journey-lanes";
import { resolveJourneyLanes } from "@/lib/data/journey-lanes-images";
import { programStatusLabel, deriveStatus } from "@/lib/program-status";
import { buildLaneHub, isHubLaneId, type InterviewSummary } from "@/lib/data/journey-lanes-hub";
import { CROP_COSTS_BY_TYPE } from "@/lib/data/cost-by-type";
import { TREND_BENTO_PROFILES } from "@/lib/data/landing";
import s from "./page.module.css";

export const dynamicParams = false;

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
  const lane = JOURNEY_LANES.find((l) => l.id === id);
  if (!isHubLaneId(id) || !lane) notFound();
  return {
    title: `${lane.label}으로 시작하기 — 현황·지원사업·작물·사람 이야기`,
    description: lane.intro,
    alternates: { canonical: `/start/${id}` },
  };
}

const SECTIONS = [
  { id: "hub-status", label: "현황" },
  { id: "hub-programs", label: "지원사업" },
  { id: "hub-crops", label: "작물" },
  { id: "hub-interviews", label: "사람 이야기" },
  { id: "hub-next", label: "다음 단계" },
];

export default async function LaneHubPage({ params }: { params: Promise<{ lane: string }> }) {
  const { lane: id } = await params;
  if (id === "undecided") redirect("/start");
  const lane = JOURNEY_LANES.find((l) => l.id === id);
  if (!isHubLaneId(id) || !lane) notFound();

  const hub = buildLaneHub(id);
  const card = resolveJourneyLanes().find((l) => l.id === id);
  const costRows = hub.costType ? CROP_COSTS_BY_TYPE[hub.costType] : [];
  const trend = hub.trendKey ? TREND_BENTO_PROFILES[hub.trendKey] : null;

  return (
    <div className={s.page}>
      {/* ── 상단 스트립 — 포스터 배경 + 캐릭터 + 제목 + 소개글 + 타일 ── */}
      <header className={s.strip}>
        <span className={s.stripArt} aria-hidden="true">
          {card?.hasImage && (
            <Image src={card.image} alt="" fill sizes="100vw" className={s.stripImg} priority />
          )}
        </span>
        <div className={s.stripBody}>
          <div className={s.stripText}>
            <p className={s.eyebrow}>시작 유형</p>
            <h1 className={s.title}>{lane.label}으로 시작하기</h1>
            <p className={s.intro}>{lane.intro}</p>
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
          {card?.hasChar && (
            <span className={s.char} aria-hidden="true">
              <Image src={card.charImage} alt="" fill sizes="220px" className={s.charImg} />
            </span>
          )}
        </div>
      </header>

      <AnchorTabNav sections={SECTIONS} />

      {/* ── 현황 — 비용 + 추이 ── */}
      <ScrollReveal trackId={`start_hub_status`} variant="fade" stagger>
        <section id="hub-status" className={s.section} aria-labelledby="hub-status-title">
          <h2 id="hub-status-title" className={s.sectionTitle}>
            {lane.label} 현황
          </h2>

          {costRows.length > 0 && (
            <>
              <h3 className={s.subTitle}>대표 작물 비용</h3>
              <ul className={s.costGrid}>
                {costRows.map((c) => (
                  <li key={c.id} className={s.costCard} data-reveal-item>
                    <span className={s.costName}>{c.name}</span>
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
                    <span className={s.source}>{c.source}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {trend && (
            <>
              <div className={s.sectionHead}>
                <h3 className={s.subTitle}>{trend.title}</h3>
                <Link href={trend.href} className={s.more} data-track={`start_hub_more:${id}:trend`}>
                  통계 더 보기 →
                </Link>
              </div>
              <p className={s.subtitleText}>{trend.subtitle}</p>
              <ul className={s.statRow}>
                <li className={s.statCard}>
                  <span className={s.statValue}>{trend.hero.value}</span>
                  <span className={s.statLabel}>{trend.hero.label}</span>
                  <span className={s.statSub}>{trend.hero.sub}</span>
                </li>
                {trend.stats.map((st) => (
                  <li key={st.label} className={s.statCard}>
                    <span className={s.statValue}>{st.value}</span>
                    <span className={s.statLabel}>{st.label}</span>
                    <span className={s.statSub}>{st.sub}</span>
                  </li>
                ))}
              </ul>
              <h3 className={s.subTitle}>
                {trend.chart.title} <span className={s.range}>{trend.chart.surveyLabel}</span>
              </h3>
              <ul className={s.bars}>
                {trend.chart.items.map((it) => (
                  <li key={it.label} className={s.barRow}>
                    <span className={s.barLabel}>{it.label}</span>
                    <span className={s.barTrack} aria-hidden="true">
                      <span className={s.barFill} style={{ width: `${it.pct}%` }} />
                    </span>
                    <span className={s.barPct}>{it.pct}%</span>
                  </li>
                ))}
              </ul>
              <p className={s.source}>{trend.source}</p>
            </>
          )}
        </section>
      </ScrollReveal>

      {/* ── 지원사업 ── */}
      <ScrollReveal trackId={`start_hub_programs`} variant="fade" stagger>
        <section id="hub-programs" className={s.section} aria-labelledby="hub-programs-title">
          <div className={s.sectionHead}>
            <h2 id="hub-programs-title" className={s.sectionTitle}>
              지금 볼 수 있는 지원사업
            </h2>
            <Link href={hub.programsHref} className={s.more} data-track={`start_hub_more:${id}:programs`}>
              전체 보기 →
            </Link>
          </div>
          <ul className={s.cardGrid}>
            {hub.programs.map((p) => (
              <li key={p.id} data-reveal-item>
                <Link href={`/programs/${p.id}`} className={s.programCard}>
                  <StatusBadge
                    status={programStatusLabel({
                      status: deriveStatus(p.applicationStart, p.applicationEnd),
                      applicationStart: p.applicationStart,
                      applicationEnd: p.applicationEnd,
                      applicationCycle: p.applicationCycle,
                    })}
                  />
                  <span className={s.programTitle}>{p.title}</span>
                  <span className={s.programSummary}>
                    <AutoGlossary text={p.summary} maxHighlights={1} />
                  </span>
                  <span className={s.programMeta}>{p.organization}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </ScrollReveal>

      {/* ── 작물 ── */}
      <ScrollReveal trackId={`start_hub_crops`} variant="fade" stagger>
        <section id="hub-crops" className={s.section} aria-labelledby="hub-crops-title">
          <div className={s.sectionHead}>
            <h2 id="hub-crops-title" className={s.sectionTitle}>
              이 길에서 많이 짓는 작물
            </h2>
            <Link href={hub.cropsHref} className={s.more} data-track={`start_hub_more:${id}:crops`}>
              전체 보기 →
            </Link>
          </div>
          <ul className={s.cropGrid}>
            {hub.crops.map((c) => (
              <li key={c.id} data-reveal-item>
                <CropLinkCard cropId={c.id} name={c.name} href={`/crops/${c.id}`} meta={c.category} />
              </li>
            ))}
          </ul>
        </section>
      </ScrollReveal>

      {/* ── 사람 이야기 ── */}
      {hub.interviews.length > 0 && (
        <ScrollReveal trackId={`start_hub_interviews`} variant="fade" stagger>
          <section id="hub-interviews" className={s.section} aria-labelledby="hub-interviews-title">
            <div className={s.sectionHead}>
              <h2 id="hub-interviews-title" className={s.sectionTitle}>
                먼저 간 사람들
              </h2>
              <Link href={hub.interviewsHref} className={s.more} data-track={`start_hub_more:${id}:interviews`}>
                전체 보기 →
              </Link>
            </div>
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
          </section>
        </ScrollReveal>
      )}

      {/* ── 다음 단계 ── */}
      <ScrollReveal trackId={`start_hub_next`} variant="fade" stagger>
        <section id="hub-next" className={s.section} aria-labelledby="hub-next-title">
          <h2 id="hub-next-title" className={s.sectionTitle}>
            다음 단계
          </h2>
          <ul className={s.nextGrid}>
            {hub.nextSteps.map((n) => (
              <li key={n.href} data-reveal-item>
                <Link href={n.href} className={s.nextCard} data-track={`start_hub_next:${id}`}>
                  <span className={s.nextLabel}>{n.label}</span>
                  <span className={s.nextDesc}>{n.desc}</span>
                  <ArrowRight size={16} className={s.nextIcon} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <PersonaCta from="start_hub" copy="내 조건에 맞는 순서로 볼까요?" />
        </section>
      </ScrollReveal>
    </div>
  );
}
