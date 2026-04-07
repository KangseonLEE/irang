import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BookmarkButton } from "@/components/bookmark/bookmark-button";
import { ShareButton } from "@/components/ui/share-button";
import {
  Sprout,
  MapPin,
  Thermometer,
  DollarSign,
  Lightbulb,
  Leaf,
  ArrowRight,
  Droplets,
  Ruler,
  FlaskConical,
  Calendar,
  TrendingUp,
  FileText,
  ExternalLink,
  ChevronRight,
  Gauge,
} from "lucide-react";
import {
  getCropWithDetail,
  getAllCropIds,
  CROPS,
  type CropDetailInfo,
} from "@/lib/data/crops";
import { getStationByProvince } from "@/lib/data/stations";
import { fetchCropStats, type CropStatItem } from "@/lib/api/kosis";
import { PROGRAMS } from "@/lib/data/programs";
import { GlossaryTerm } from "@/components/ui/term-tooltip";
import { AnchorTabNav } from "./anchor-tab-nav";
import s from "./page.module.css";

// ── 수익 정보 파싱 유틸 ──

/** "ha당 약 500~800만 원 (쌀값 변동에 따라 차이)" → { main, note } */
function parseRevenueRange(raw: string): { main: string; note: string | null } {
  const match = raw.match(/^(.+?)\s*\((.+)\)\s*$/);
  if (match) {
    return { main: match[1].trim(), note: match[2].trim() };
  }
  return { main: raw, note: null };
}

/** 수익 텍스트 내 ha/10a를 GlossaryTerm으로 변환 */
function RevenueText({ text }: { text: string }) {
  // "ha당" 또는 "10a당"을 찾�� GlossaryTerm으로 치환
  const parts = text.split(/((?:10a|ha)당)/);
  return (
    <>
      {parts.map((part, i) => {
        if (part === "ha당") {
          return <span key={i}><GlossaryTerm term="ha" />당</span>;
        }
        if (part === "10a당") {
          return <span key={i}><GlossaryTerm term="10a" />당</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ── Metadata & Static Params ──

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = getCropWithDetail(id);
  return {
    title: data ? `${data.name} - 작물 상세` : "작물 상세",
    description: data?.description,
  };
}

export function generateStaticParams() {
  return getAllCropIds().map((id) => ({ id }));
}

// ── 난이도 뱃지 매핑 ──

const DIFFICULTY_BADGE: Record<string, string> = {
  쉬움: s.badgeEasy,
  보통: s.badgeNormal,
  어려움: s.badgeHard,
};

// ── 페이지 컴포넌트 ──

interface CropDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CropDetailPage({
  params,
}: CropDetailPageProps) {
  const { id } = await params;
  const data = getCropWithDetail(id);

  if (!data) {
    notFound();
  }

  const cropStats = data.detail.kosisConfig
    ? await fetchCropStats(
        data.detail.kosisConfig.tblId,
        data.detail.kosisConfig.objL1Code
      ).catch(() => [] as CropStatItem[])
    : [];

  const relatedPrograms = PROGRAMS.filter((p) =>
    p.relatedCrops.some((rc) => rc === data.name)
  ).slice(0, 3);

  const relatedCrops = data.detail.relatedCropIds
    .map((rid) => CROPS.find((c) => c.id === rid))
    .filter((c): c is NonNullable<typeof c> => c != null);

  const { detail } = data;

  // 지원사업 목록으로 이동 시 작물명 + 주요 지역 자동 필터
  const programsParams = new URLSearchParams();
  programsParams.set("q", data.name);
  if (detail.majorRegions.length > 0) {
    programsParams.set("region", detail.majorRegions[0]);
  }
  const programsHref = `/programs?${programsParams.toString()}`;

  const anchorSections = [
    { id: "overview", label: "개요" },
    { id: "cultivation", label: "재배환경" },
    { id: "income", label: "수익정보" },
    { id: "region", label: "재배지역" },
    { id: "tips", label: "귀농팁" },
  ];

  return (
    <div className={s.page}>
      {/* ── 브레드크럼 + 출처 ── */}
      <div className={s.topBar}>
        <nav className={s.breadcrumb} aria-label="현재 위치">
          <Link href="/crops" className={s.breadcrumbLink}>작물</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span className={s.breadcrumbLink}>{data.category}</span>
          <ChevronRight size={14} aria-hidden="true" />
          <span className={s.breadcrumbCurrent}>{data.name}</span>
        </nav>
        <span className={s.sourceTag}>출처: 농촌진흥청 · KOSIS</span>
      </div>

      {/* ── Hero ── */}
      <section className={s.hero}>
        <div className={s.heroImageWrap}>
          <Image
            src={`/crops/${data.id}.jpg`}
            alt={data.name}
            fill
            sizes="(max-width: 1024px) 100vw, 1280px"
            style={{ objectFit: "cover" }}
            priority
          />
          <div className={s.heroOverlay} />
          <div className={s.heroPills}>
            <span className={s.heroPill}>{data.category}</span>
            <span className={s.heroPill}>{data.growingSeason}</span>
            {detail.majorRegions.slice(0, 2).map((r) => (
              <span key={r} className={s.heroPill}>{r}</span>
            ))}
          </div>
        </div>

        <div className={s.heroContent}>
          <div className={s.heroTitleRow}>
            <div>
              <div className={s.heroBadges}>
                <span className={`${s.badge} ${s.badgeCategory}`}>
                  {data.category}
                </span>
                <span
                  className={`${s.badge} ${DIFFICULTY_BADGE[data.difficulty] ?? s.badgeNormal}`}
                >
                  <Gauge size={12} />
                  난이도 · {data.difficulty}
                </span>
              </div>
              <h1 className={s.heroTitle}>{data.name}</h1>
            </div>
            <ShareButton
              title={`${data.name} — 작물 정보 | 이랑`}
              text={`${data.name}: ${data.description?.slice(0, 80) ?? data.category}`}
              contentType="crop"
              variant="ghost"
              size="sm"
              showLabel={false}
            />
            <BookmarkButton
              id={data.id}
              type="crop"
              title={data.name}
              subtitle={data.category}
            />
          </div>
          <p className={s.heroDesc}>{data.description}</p>

          {/* Quick Stats — 요약 프로필 카드 */}
          <div className={s.quickStats}>
            <div className={s.statCard}>
              <span className={`${s.statIcon} ${s.statIconDifficulty}`}>
                <Gauge size={18} />
              </span>
              <div>
                <p className={s.statLabel}>난이도</p>
                <p className={s.statValue}>{data.difficulty}</p>
              </div>
            </div>
            <div className={s.statCard}>
              <span className={`${s.statIcon} ${s.statIconSeason}`}>
                <Calendar size={18} />
              </span>
              <div>
                <p className={s.statLabel}>재배 시기</p>
                <p className={s.statValue}>{data.growingSeason}</p>
              </div>
            </div>
            <div className={s.statCard}>
              <span className={`${s.statIcon} ${s.statIconRevenue}`}>
                <TrendingUp size={18} />
              </span>
              <div>
                <p className={s.statLabel}>예상 수익</p>
                <p className={s.statValue}><RevenueText text={parseRevenueRange(detail.income.revenueRange).main} /></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sticky Anchor Tab ── */}
      <AnchorTabNav sections={anchorSections} />

      {/* ── 본문 ── */}
      <div className={s.mainGrid}>
        <div className={s.mainContent}>
          {/* 개요 */}
          <section id="overview" className={s.section}>
            <SectionHeader icon={<Sprout size={18} />} title="개요" />
            <div className={s.sectionBody}>
              <p className={s.overviewText}>{data.description}</p>
              <div className={s.matchBox}>
                <div className={s.matchItem}>
                  <span className={s.matchGood}>추천</span>
                  <p className={s.matchText}>
                    {data.difficulty === "쉬움"
                      ? "귀농 초보자, 안정적 수확을 원하는 분"
                      : data.difficulty === "보통"
                        ? "기초 재배 경험이 있는 분, 중기 수익을 목표로 하는 분"
                        : "전문 농업인, 장기 투자형 귀농을 계획하는 분"}
                  </p>
                </div>
                <div className={s.matchItem}>
                  <span className={s.matchCaution}>참고</span>
                  <p className={s.matchText}>
                    {data.difficulty === "쉬움"
                      ? "대규모 고수익을 단기간에 기대하기는 어려울 수 있습니다"
                      : data.difficulty === "보통"
                        ? "품종에 따라 재배 난이도 편차가 있으므로 사전 조사가 필요합니다"
                        : "초기 투자비용과 기술 습득 기간을 충분히 고려해야 합니다"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 재배환경 */}
          <CultivationSection cultivation={detail.cultivation} />

          {/* 수익정보 */}
          <IncomeSection income={detail.income} />

          {/* 인기 재배지역 */}
          <RegionSection
            majorRegions={detail.majorRegions}
            cropStats={cropStats}
          />

          {/* 귀농 팁 */}
          <TipsSection tips={detail.tips} />
        </div>

        {/* 사이드바 */}
        <aside className={s.sidebar}>
          {/* 사이드 프로필 카드 */}
          <div className={s.sideProfile}>
            <h3 className={s.sideProfileTitle}>{data.name}</h3>
            <dl className={s.sideProfileList}>
              <div className={s.sideProfileRow}>
                <dt>카테고리</dt>
                <dd>{data.category}</dd>
              </div>
              <div className={s.sideProfileRow}>
                <dt>난이도</dt>
                <dd>
                  <span className={`${s.badgeSm} ${DIFFICULTY_BADGE[data.difficulty] ?? s.badgeNormal}`}>
                    {data.difficulty}
                  </span>
                </dd>
              </div>
              <div className={s.sideProfileRow}>
                <dt>재배 시기</dt>
                <dd>{data.growingSeason}</dd>
              </div>
              <div className={s.sideProfileRow}>
                <dt>예상 수익</dt>
                <dd className={s.sideProfileHighlight}>
                  <RevenueText text={parseRevenueRange(detail.income.revenueRange).main} />
                </dd>
              </div>
              {parseRevenueRange(detail.income.revenueRange).note && (
                <div className={s.sideProfileRow}>
                  <dt />
                  <dd className={s.sideProfileNote}>
                    {parseRevenueRange(detail.income.revenueRange).note}
                  </dd>
                </div>
              )}
              <div className={s.sideProfileRow}>
                <dt>주요 산지</dt>
                <dd>{detail.majorRegions.slice(0, 3).join(", ")}</dd>
              </div>
            </dl>
            <div className={s.sideCtas}>
              <Link
                href={programsHref}
                className={`${s.ctaButton} ${s.ctaPrimary}`}
              >
                <FileText size={16} />
                관련 지원사업 보기
              </Link>
              <Link
                href="/regions"
                className={`${s.ctaButton} ${s.ctaOutline}`}
              >
                <MapPin size={16} />
                지역 비교하기
              </Link>
            </div>
          </div>

          {/* 관련 작물 */}
          {relatedCrops.length > 0 && (
            <div className={s.sideSection}>
              <h3 className={s.sideSectionHeader}>
                <Leaf size={16} />
                관련 작물
              </h3>
              <div className={s.relatedCropList}>
                {relatedCrops.map((crop) => (
                  <Link
                    key={crop.id}
                    href={`/crops/${crop.id}`}
                    className={s.relatedCropCard}
                  >
                    <div className={s.relatedCropImageWrap}>
                      <Image
                        src={`/crops/${crop.id}.jpg`}
                        alt={crop.name}
                        fill
                        sizes="60px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div>
                      <p className={s.relatedCropName}>{crop.name}</p>
                      <p className={s.relatedCropMeta}>{crop.category} · {crop.difficulty}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 관련 지원사업 */}
          <RelatedProgramsSection relatedPrograms={relatedPrograms} moreHref={programsHref} />
        </aside>
      </div>

      {/* 모바일 하단 바 */}
      <div className={s.mobileBar}>
        <Link
          href={programsHref}
          className={`${s.ctaButton} ${s.ctaPrimary}`}
        >
          <FileText size={16} />
          지원사업 보기
        </Link>
        <Link
          href="/regions"
          className={`${s.ctaButton} ${s.ctaOutline}`}
        >
          <MapPin size={16} />
          지역 비교
        </Link>
      </div>
    </div>
  );
}

// ── 서브 컴포넌트 ──

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <h2 className={s.sectionHeader}>
      <span className={s.sectionHeaderIcon}>{icon}</span>
      {title}
    </h2>
  );
}

function CultivationSection({
  cultivation,
}: {
  cultivation: CropDetailInfo["cultivation"];
}) {
  const items = [
    { icon: <Thermometer size={20} />, cls: s.fIconClimate, label: "기후", value: cultivation.climate },
    { icon: <Leaf size={20} />, cls: s.fIconSoil, label: "토양", value: cultivation.soil },
    { icon: <Droplets size={20} />, cls: s.fIconWater, label: "수분", value: cultivation.water },
    { icon: <Ruler size={20} />, cls: s.fIconSpacing, label: "간격", value: cultivation.spacing },
  ];

  return (
    <section id="cultivation" className={s.section}>
      <SectionHeader icon={<Sprout size={18} />} title="재배 환경" />
      <div className={s.sectionBody}>
        <div className={s.featureGrid}>
          {items.map((item) => (
            <div key={item.label} className={s.featureCard}>
              <span className={`${s.featureIcon} ${item.cls}`}>{item.icon}</span>
              <p className={s.featureLabel}>{item.label}</p>
              <p className={s.featureValue}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* 비료 정보 — 별도 카드 */}
        <div className={s.fertilizerCard}>
          <div className={s.fertilizerHeader}>
            <FlaskConical size={16} />
            <span>비료 · 시비 정보</span>
          </div>
          <p className={s.fertilizerText}>{cultivation.fertilizerNote}</p>
        </div>
      </div>
    </section>
  );
}

function IncomeSection({
  income,
}: {
  income: CropDetailInfo["income"];
}) {
  const { main, note } = parseRevenueRange(income.revenueRange);
  return (
    <section id="income" className={s.section}>
      <SectionHeader icon={<TrendingUp size={18} />} title="수익 정보" />
      <div className={s.sectionBody}>
        {/* 수익 카드 — 토스 패턴: 숫자 우선 */}
        <div className={s.revenueCard}>
          <div className={s.revenueTop}>
            <p className={s.revenueLabel}>예상 연 수익</p>
          </div>
          <p className={s.revenueAmount}><RevenueText text={main} /></p>
          {note && (
            <p className={s.revenueSubNote}>{note}</p>
          )}
          <p className={s.revenueNote}>
            품종 · 기후 · 기술 수준에 따라 실제 수익은 달라질 수 있습니다
          </p>
        </div>

        {/* 비용 구조 테이블 */}
        <div className={s.costTable}>
          <div className={s.costRow}>
            <div className={s.costLabelWrap}>
              <span className={`${s.costDot} ${s.costDotExpense}`} />
              <span className={s.costLabel}>비용</span>
            </div>
            <p className={s.costValue}>{income.costNote}</p>
          </div>
          <div className={s.costDivider} />
          <div className={s.costRow}>
            <div className={s.costLabelWrap}>
              <span className={`${s.costDot} ${s.costDotLabor}`} />
              <span className={s.costLabel}>노동력</span>
            </div>
            <p className={s.costValue}>{income.laborNote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function RegionSection({
  majorRegions,
  cropStats,
}: {
  majorRegions: string[];
  cropStats: CropStatItem[];
}) {
  const top5 = cropStats
    .filter((st) => st.regionName !== "전국" && st.cultivationArea > 0)
    .sort((a, b) => b.cultivationArea - a.cultivationArea)
    .slice(0, 5);

  const maxArea = top5.length > 0 ? top5[0].cultivationArea : 1;

  return (
    <section id="region" className={s.section}>
      <SectionHeader icon={<MapPin size={18} />} title="인기 재배지역" />
      <div className={s.sectionBody}>
        <div className={s.regionPills}>
          {majorRegions.map((r) => {
            const station = getStationByProvince(r);
            return station ? (
              <Link
                key={r}
                href={`/regions?stations=${station.stnId}`}
                className={s.regionPillLink}
              >
                <MapPin size={12} />
                {r}
              </Link>
            ) : (
              <span key={r} className={s.regionPill}>{r}</span>
            );
          })}
        </div>

        {top5.length > 0 && (
          <div className={s.chartSection}>
            <p className={s.chartTitle}>
              재배면적 상위 지역 ({top5[0].year}년 KOSIS 기준)
            </p>
            <div
              className={s.chartContainer}
              role="img"
              aria-label={`재배면적: ${top5.map((st) => `${st.regionName} ${st.cultivationArea.toLocaleString()}ha`).join(", ")}`}
            >
              {top5.map((stat, idx) => {
                const pct = Math.round((stat.cultivationArea / maxArea) * 100);
                return (
                  <div key={stat.regionName} className={s.chartRow}>
                    <div className={s.chartMeta}>
                      <span className={s.chartRank}>{idx + 1}</span>
                      <span className={s.chartLabel}>{stat.regionName}</span>
                    </div>
                    <div className={s.chartBarWrap}>
                      <div
                        className={s.chartBar}
                        style={{ width: `${pct}%` }}
                        aria-hidden="true"
                      />
                    </div>
                    <span className={s.chartValue}>
                      {stat.cultivationArea.toLocaleString()} <GlossaryTerm term="ha" />
                    </span>
                  </div>
                );
              })}
            </div>
            <p className={s.chartSource}>
              출처: KOSIS 국가통계포털
              <a
                href="https://kosis.kr"
                target="_blank"
                rel="noopener noreferrer"
                className={s.chartSourceLink}
              >
                kosis.kr <ExternalLink size={10} />
              </a>
            </p>
          </div>
        )}

        <Link href="/regions" className={s.regionCta}>
          지역별 상세 비교하기
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}

function TipsSection({ tips }: { tips: string[] }) {
  return (
    <section id="tips" className={s.section}>
      <SectionHeader icon={<Lightbulb size={18} />} title="귀농 팁" />
      <div className={s.sectionBody}>
        <div className={s.tipsList}>
          {tips.map((tip, idx) => (
            <div key={idx} className={s.tipItem}>
              <span className={s.tipNum}>{String(idx + 1).padStart(2, "0")}</span>
              <p className={s.tipText}>{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RelatedProgramsSection({
  relatedPrograms,
  moreHref,
}: {
  relatedPrograms: Array<{
    id: string;
    title: string;
    supportType: string;
    region: string;
  }>;
  moreHref: string;
}) {
  return (
    <div className={s.sideSection}>
      <h3 className={s.sideSectionHeader}>
        <DollarSign size={16} />
        관련 지원사업
      </h3>
      {relatedPrograms.length > 0 ? (
        <div className={s.programList}>
          {relatedPrograms.map((program) => (
            <Link
              key={program.id}
              href={`/programs/${program.id}`}
              className={s.programCard}
            >
              <p className={s.programTitle}>{program.title}</p>
              <div className={s.programMeta}>
                <span>{program.region}</span>
                <span aria-hidden="true">·</span>
                <span>{program.supportType}</span>
              </div>
            </Link>
          ))}
          <Link href={moreHref} className={s.programMore}>
            전체 지원사업 보기
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <p className={s.emptyNote}>현재 등록된 관련 지원사업이 없습니다.</p>
      )}
    </div>
  );
}
