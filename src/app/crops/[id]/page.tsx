import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BookmarkButton } from "@/components/bookmark/bookmark-button";
import { ShareButton } from "@/components/ui/share-button";
import { KakaoShareButton } from "@/components/ui/kakao-share-button";
import {
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
  ChevronRight,
  Gauge,
  Scale,
  ThumbsUp,
  AlertTriangle,
  ClipboardList,
  Maximize2,
  Clock,
  Zap,
  Play,
} from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import {
  getCropWithDetail,
  getAllCropIds,
  CROPS,
  type CropDetailInfo,
  type ProsConsInfo,
  type CultivationStep,
  type ExternalResource,
} from "@/lib/data/crops";
import { PROVINCES } from "@/lib/data/regions";
import {
  fetchCropStats,
  fetchRiceIncome,
  fetchCropIncome,
  CROP_INCOME_TABLE,
  type CropStatItem,
} from "@/lib/api/kosis";
import { PROGRAMS } from "@/lib/data/programs";
import { GlossaryTerm } from "@/components/ui/term-tooltip";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { DataSource } from "@/components/ui/data-source";
import { Icon } from "@/components/ui/icon";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { YouthCaseCards } from "@/components/youth-cases/youth-case-cards";
import { fetchYouthCasesForCrop } from "@/lib/api/rda-youth";
import { AnchorTabNav } from "./anchor-tab-nav";
import s from "./page.module.css";

// ── 소득 정보 파싱 유틸 ──

/** "10a당 약 511만 원 (3,000평 재배 시 연 약 5,114만 원)" → { main, note } */
function parseRevenueRange(raw: string): { main: string; note: string | null } {
  const match = raw.match(/^(.+?)\s*\((.+)\)\s*$/);
  if (match) {
    return { main: match[1].trim(), note: match[2].trim() };
  }
  return { main: raw, note: null };
}

/** 소득 텍스트 내 ha/10a를 GlossaryTerm으로 변환 */
function RevenueText({ text }: { text: string }) {
  // "ha당" 또는 "10a당"을 찾�� GlossaryTerm으로 치환
  const parts = text.split(/((?:10a|1ha)당)/);
  return (
    <>
      {parts.map((part, i) => {
        if (part === "1ha당") {
          return <span key={i}>1<GlossaryTerm term="ha" />당</span>;
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
  if (!data) return { title: "작물 상세" };
  const regions = data.detail.majorRegions.slice(0, 3).join("·");
  return {
    title: `${data.name} 재배 — 소득·난이도·재배환경 | ${regions}`,
    description: `${data.name} 재배 소득, 난이도, 기후·토양 조건을 확인하세요. 주요 산지: ${data.detail.majorRegions.join(", ")}. 귀농 작물 선택에 필요한 정보를 비교해 드려요.`,
  };
}

export function generateStaticParams() {
  return getAllCropIds().map((id) => ({ id }));
}

/** KOSIS 작물 통계 API 데이터를 1시간마다 재검증 */
export const revalidate = 3600;

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

  // KOSIS 생산비조사에서 최신 소득 데이터 자동 갱신 (쌀·마늘·양파·콩)
  let incomeData = data.detail.income;
  if (id === "rice") {
    const riceIncome = await fetchRiceIncome().catch(() => null);
    if (riceIncome && riceIncome.income > 0) {
      const per10a = Math.round(riceIncome.income / 10000);
      const per1ha = Math.round((riceIncome.income * 10) / 10000);
      incomeData = {
        ...incomeData,
        revenueRange: `10a당 약 ${per10a}만 원 (3,000평 재배 시 연 약 ${per1ha.toLocaleString()}만 원)`,
        source: `통계청 농축산물생산비조사 ${riceIncome.year}년산 (소득 = 총수입 − 경영비)`,
      };
    }
  } else if (id in CROP_INCOME_TABLE) {
    const tblId = CROP_INCOME_TABLE[id];
    const cropIncome = await fetchCropIncome(tblId).catch(() => null);
    if (cropIncome && cropIncome.income > 0) {
      const per10a = Math.round(cropIncome.income / 10000);
      const per3000 = Math.round((cropIncome.income * 10) / 10000);
      incomeData = {
        ...incomeData,
        revenueRange: `10a당 약 ${per10a}만 원 (3,000평 재배 시 연 약 ${per3000.toLocaleString()}만 원)`,
        source: `통계청 농축산물생산비조사 ${cropIncome.year}년산 (소득 = 총수입 − 경영비)`,
      };
    }
  }

  const relatedPrograms = PROGRAMS.filter((p) =>
    p.relatedCrops.some((rc) => rc === data.name)
  ).slice(0, 3);

  const relatedCrops = data.detail.relatedCropIds
    .map((rid) => CROPS.find((c) => c.id === rid))
    .filter((c): c is NonNullable<typeof c> => c != null);

  // RDA 청년농 사례 (API 실패 시 빈 배열)
  const youthCases = await fetchYouthCasesForCrop(id).catch(() => []);

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
    ...(detail.prosCons ? [{ id: "pros-cons", label: "장단점" }] : []),
    { id: "cultivation", label: "재배환경" },
    ...(detail.cultivationSteps?.length ? [{ id: "grow-steps", label: "재배방법" }] : []),
    { id: "income", label: "수익정보" },
    { id: "region", label: "재배지역" },
    ...(youthCases.length > 0 ? [{ id: "youth-cases", label: "청년농 사례" }] : []),
    { id: "tips", label: "귀농팁" },
    ...(detail.externalResources?.length ? [{ id: "videos", label: "관련 영상" }] : []),
  ];

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[
        { name: "작물 정보", href: "/crops" },
        { name: data.name, href: `/crops/${id}` },
      ]} />
      {/* ── 브레드크럼 + 출처 ── */}
      <div className={s.topBar}>
        <nav className={s.breadcrumb} aria-label="현재 위치">
          <Link href="/crops" className={s.breadcrumbLink}>작물</Link>
          <Icon icon={ChevronRight} size="sm" />
          <span className={s.breadcrumbLink}>{data.category}</span>
          <Icon icon={ChevronRight} size="sm" />
          <span className={s.breadcrumbCurrent}>{data.name}</span>
        </nav>
        <DataSource source="농촌진흥청 · KOSIS" variant="badge" />
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
                  <Icon icon={Gauge} size="xs" />
                  난이도 · {data.difficulty}
                </span>
              </div>
              <h1 className={s.heroTitle}>{data.name}</h1>
            </div>
            <div className={s.heroActions}>
              <KakaoShareButton
                title={`${data.name} — 작물 정보 | 이랑`}
                description={`${data.name}: ${data.description?.slice(0, 80) ?? data.category}`}
                imageUrl={`https://irang-wheat.vercel.app/crops/${data.id}.jpg`}
                contentType="crop"
              />
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
          </div>
          <p className={s.heroDesc}><AutoGlossary text={data.description} /></p>

          {/* Quick Stats — 요약 프로필 카드 */}
          <div className={s.quickStats}>
            <div className={s.statCard}>
              <Icon icon={Gauge} size="lg" color="success" />
              <div>
                <p className={s.statLabel}>난이도</p>
                <p className={s.statValue}>{data.difficulty}</p>
              </div>
            </div>
            <div className={s.statCard}>
              <Icon icon={Calendar} size="lg" color="info" />
              <div>
                <p className={s.statLabel}>재배 시기</p>
                <p className={s.statValue}>{data.growingSeason}</p>
              </div>
            </div>
            <div className={s.statCard}>
              <Icon icon={TrendingUp} size="lg" color="warning" />
              <div>
                <p className={s.statLabel}>예상 수익</p>
                <p className={s.statValue}><RevenueText text={parseRevenueRange(detail.income.revenueRange).main} /></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ReferenceNotice text="작물 정보는 농촌진흥청·통계청 데이터를 가공한 참고 자료예요. 실제 재배 조건은 지역·품종에 따라 달라요." />

      {/* ── Sticky Anchor Tab ── */}
      <AnchorTabNav sections={anchorSections} />

      {/* ── 본문 ── */}
      <div className={s.mainGrid}>
        <div className={s.mainContent}>
          {/* 개요 */}
          <section id="overview" className={s.section}>
            <SectionHeader icon={<Icon icon={Sprout} size="lg" />} title="개요" />
            <div className={s.sectionBody}>
              <p className={s.overviewText}><AutoGlossary text={data.description} /></p>
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
                      ? "대규모 고수익을 단기간에 기대하기는 어려울 수 있어요"
                      : data.difficulty === "보통"
                        ? "품종에 따라 재배 난이도 편차가 있으므로 사전 조사가 필요해요"
                        : "초기 투자비용과 기술 습득 기간을 충분히 고려해야 해요"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 장점과 단점 */}
          {detail.prosCons && (
            <ProsConsSection prosCons={detail.prosCons} />
          )}

          {/* 재배환경 */}
          <CultivationSection cultivation={detail.cultivation} />

          {/* 재배 방법 (단계별) */}
          {detail.cultivationSteps && detail.cultivationSteps.length > 0 && (
            <GrowStepsSection steps={detail.cultivationSteps} />
          )}

          {/* 수익정보 */}
          <IncomeSection income={incomeData} />

          {/* 인기 재배지역 */}
          <RegionSection
            majorRegions={detail.majorRegions}
            cropStats={cropStats}
          />

          {/* 청년농 재배 사례 */}
          {youthCases.length > 0 && (
            <div id="youth-cases">
              <YouthCaseCards
                cases={youthCases}
                title={`${data.name}를 재배하는 청년농`}
                description="농촌진흥청 청년농부 사례에서 가져왔어요"
              />
            </div>
          )}

          {/* 귀농 팁 */}
          <TipsSection tips={detail.tips} />

          {/* 관련 영상 */}
          {detail.externalResources && detail.externalResources.length > 0 && (
            <ExternalResourcesSection resources={detail.externalResources} />
          )}
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
                href={`/crops/compare?ids=${data.id}${detail.relatedCropIds.length > 0 ? `,${detail.relatedCropIds[0]}` : ""}`}
                className={`${s.ctaButton} ${s.ctaPrimary}`}
              >
                <Icon icon={Scale} size="md" />
                작물 비교하기
              </Link>
              <Link
                href={programsHref}
                className={`${s.ctaButton} ${s.ctaOutline}`}
              >
                <Icon icon={FileText} size="md" />
                관련 지원사업 보기
              </Link>
              <Link
                href="/regions"
                className={`${s.ctaButton} ${s.ctaOutline}`}
              >
                <Icon icon={MapPin} size="md" />
                지역 비교하기
              </Link>
            </div>
          </div>

          {/* 관련 작물 */}
          {relatedCrops.length > 0 && (
            <div className={s.sideSection}>
              <h3 className={s.sideSectionHeader}>
                <Icon icon={Leaf} size="md" />
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
          <Icon icon={FileText} size="md" />
          지원사업 보기
        </Link>
        <Link
          href="/regions"
          className={`${s.ctaButton} ${s.ctaOutline}`}
        >
          <Icon icon={MapPin} size="md" />
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
      {icon}
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
    { icon: <Thermometer size={20} strokeWidth={1.75} />, cls: s.fIconClimate, label: "기후", value: cultivation.climate },
    { icon: <Leaf size={20} strokeWidth={1.75} />, cls: s.fIconSoil, label: "토양", value: cultivation.soil },
    { icon: <Droplets size={20} strokeWidth={1.75} />, cls: s.fIconWater, label: "수분", value: cultivation.water },
    { icon: <Ruler size={20} strokeWidth={1.75} />, cls: s.fIconSpacing, label: "간격", value: cultivation.spacing },
  ];

  return (
    <section id="cultivation" className={s.section}>
      <SectionHeader icon={<Icon icon={Sprout} size="lg" />} title="재배 환경" />
      <div className={s.sectionBody}>
        <div className={s.featureGrid}>
          {items.map((item) => (
            <div key={item.label} className={s.featureCard}>
              <span className={`${s.featureIcon} ${item.cls}`}>{item.icon}</span>
              <p className={s.featureLabel}>{item.label}</p>
              <p className={s.featureValue}><AutoGlossary text={item.value} /></p>
            </div>
          ))}
        </div>

        {/* 비료 정보 — 별도 카드 */}
        <div className={s.fertilizerCard}>
          <div className={s.fertilizerHeader}>
            <Icon icon={FlaskConical} size="md" />
            <span>비료 · 시비 정보</span>
          </div>
          <p className={s.fertilizerText}><AutoGlossary text={cultivation.fertilizerNote} /></p>
        </div>
      </div>
    </section>
  );
}

const INTENSITY_STYLE: Record<string, string> = {
  낮음: s.intensityLow,
  보통: s.intensityMedium,
  높음: s.intensityHigh,
};

function IncomeSection({
  income,
}: {
  income: CropDetailInfo["income"];
}) {
  const { main, note } = parseRevenueRange(income.revenueRange);
  const hasIndicators = income.minScale || income.annualWorkdays || income.laborIntensity;
  const isEstimated = income.source?.includes("추정");

  return (
    <section id="income" className={s.section}>
      <SectionHeader icon={<Icon icon={TrendingUp} size="lg" />} title="소득 정보" />
      <div className={s.sectionBody}>
        {/* 소득 카드 — 토스 패턴: 숫자 우선 */}
        <div className={s.revenueCard}>
          <div className={s.revenueTop}>
            <p className={s.revenueLabel}>예상 연 소득</p>
            {isEstimated && (
              <span className={s.estimateBadge}>
                <Icon icon={AlertTriangle} size="xs" /> 참고용 추정치
              </span>
            )}
          </div>
          <p className={s.revenueAmount}><RevenueText text={main} /></p>
          {note && (
            <p className={s.revenueSubNote}>{note}</p>
          )}
          <p className={s.revenueNote}>
            소득 = 판매 수입 − 생산 경비 (인건비·자재비 등). 재배 환경, 기술 수준에 따라 달라질 수 있습니다.
          </p>
        </div>

        {/* 재배방식·품종별 수익 비교 */}
        {income.varieties && income.varieties.length > 0 && (
          <div className={s.varietyTable}>
            <p className={s.varietyTitle}>
              {income.varieties.some((v) => v.revenueRange)
                ? "재배방식별 소득 비교"
                : "주요 품종 특성"}
            </p>
            {income.varieties.map((v) => (
              <div key={v.name} className={s.varietyRow}>
                <div className={s.varietyNameWrap}>
                  <span className={s.varietyDot} />
                  <span className={s.varietyName}>{v.name}</span>
                </div>
                <div className={s.varietyRight}>
                  {v.revenueRange && (
                    <p className={s.varietyRevenue}><RevenueText text={v.revenueRange} /></p>
                  )}
                  {v.note && <p className={s.varietyNote}>{v.note}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 수익 지표 카드 */}
        {hasIndicators && (
          <div className={s.incomeIndicators}>
            {income.minScale && (
              <div className={s.indicatorCard}>
                <span className={`${s.indicatorIcon} ${s.indicatorIconScale}`}>
                  <Icon icon={Maximize2} size="md" />
                </span>
                <p className={s.indicatorLabel}>최소 권장 규모</p>
                <p className={s.indicatorValue}>{income.minScale}</p>
              </div>
            )}
            {income.annualWorkdays && (
              <div className={s.indicatorCard}>
                <span className={`${s.indicatorIcon} ${s.indicatorIconWork}`}>
                  <Icon icon={Clock} size="md" />
                </span>
                <p className={s.indicatorLabel}>연간 노동일수</p>
                <p className={s.indicatorValue}>{income.annualWorkdays}</p>
              </div>
            )}
            {income.laborIntensity && (
              <div className={s.indicatorCard}>
                <span className={`${s.indicatorIcon} ${s.indicatorIconIntensity}`}>
                  <Icon icon={Zap} size="md" />
                </span>
                <p className={s.indicatorLabel}>노동 강도</p>
                <span className={`${s.intensityBadge} ${INTENSITY_STYLE[income.laborIntensity] ?? s.intensityMedium}`}>
                  {income.laborIntensity}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 비용 구조 테이블 */}
        <div className={s.costTable}>
          <div className={s.costRow}>
            <div className={s.costLabelWrap}>
              <span className={`${s.costDot} ${s.costDotExpense}`} />
              <span className={s.costLabel}>비용</span>
            </div>
            <p className={s.costValue}><AutoGlossary text={income.costNote} /></p>
          </div>
          <div className={s.costDivider} />
          <div className={s.costRow}>
            <div className={s.costLabelWrap}>
              <span className={`${s.costDot} ${s.costDotLabor}`} />
              <span className={s.costLabel}>노동력</span>
            </div>
            <p className={s.costValue}><AutoGlossary text={income.laborNote} /></p>
          </div>
        </div>
        <DataSource
          source={income.source ?? "농촌진흥청 농업소득자료집 · KOSIS 국가통계포털"}
          href="https://kosis.kr"
        />
      </div>
    </section>
  );
}

/** 카테고리 → 한글 라벨 */
const CATEGORY_LABEL: Record<string, string> = {
  수익성: "수익성",
  재배난이도: "재배",
  시장성: "시장",
  안정성: "안정",
  생활: "생활",
  확장성: "확장",
};

function ProsConsSection({ prosCons }: { prosCons: ProsConsInfo }) {
  return (
    <section id="pros-cons" className={s.section}>
      <SectionHeader icon={<Icon icon={Scale} size="lg" />} title="장점과 단점" />
      <div className={s.sectionBody}>
        {/* 장점 */}
        <div className={s.prosGroup}>
          <div className={s.prosGroupHeader}>
            <Icon icon={ThumbsUp} size="sm" />
            <span>장점</span>
          </div>
          <div className={s.prosConsList}>
            {prosCons.pros.map((item, idx) => (
              <div key={idx} className={s.prosItem}>
                <span className={s.prosCategoryBadge}>
                  {CATEGORY_LABEL[item.category] ?? item.category}
                </span>
                <p className={s.prosConsText}><AutoGlossary text={item.text} /></p>
              </div>
            ))}
          </div>
        </div>

        {/* 단점 */}
        <div className={s.consGroup}>
          <div className={s.consGroupHeader}>
            <Icon icon={AlertTriangle} size="sm" />
            <span>단점</span>
          </div>
          <div className={s.prosConsList}>
            {prosCons.cons.map((item, idx) => (
              <div key={idx} className={s.consItem}>
                <span className={s.consCategoryBadge}>
                  {CATEGORY_LABEL[item.category] ?? item.category}
                </span>
                <p className={s.prosConsText}><AutoGlossary text={item.text} /></p>
              </div>
            ))}
          </div>
        </div>

        {/* 종합 평가 */}
        {prosCons.verdict && (
          <div className={s.verdictCard}>
            <Icon icon={Lightbulb} size="md" />
            <p className={s.verdictText}><AutoGlossary text={prosCons.verdict} maxHighlights={5} /></p>
          </div>
        )}
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
    .filter((st) => st.regionName !== "전국" && st.regionName !== "계" && st.cultivationArea > 0)
    .sort((a, b) => b.cultivationArea - a.cultivationArea)
    .slice(0, 5);

  const maxArea = top5.length > 0 ? top5[0].cultivationArea : 1;
  const kosisYear = top5.length > 0 ? top5[0].year : null;

  return (
    <section id="region" className={s.section}>
      <div className={s.sectionHeader}>
        <Icon icon={MapPin} size="lg" />
        <span>인기 재배지역</span>
        {kosisYear && (
          <span className={s.kosisBadge}>{kosisYear}년 KOSIS</span>
        )}
      </div>
      <div className={s.sectionBody}>
        {top5.length > 0 ? (
          <div className={s.regionRanking}>
            <p className={s.regionRankingTitle}>재배면적 상위</p>
            <div
              className={s.chartContainer}
              role="img"
              aria-label={`재배면적: ${top5.map((st) => `${st.regionName} ${st.cultivationArea.toLocaleString()}ha`).join(", ")}`}
            >
              {top5.map((stat, idx) => {
                const pct = Math.round((stat.cultivationArea / maxArea) * 100);
                const province = PROVINCES.find((p) => p.name === stat.regionName);
                const inner = (
                  <>
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
                      {stat.cultivationArea.toLocaleString()}ha
                    </span>
                  </>
                );
                return province ? (
                  <Link
                    key={stat.regionName}
                    href={`/regions/${province.id}`}
                    className={s.chartRow}
                  >
                    {inner}
                  </Link>
                ) : (
                  <div key={stat.regionName} className={s.chartRow}>
                    {inner}
                  </div>
                );
              })}
            </div>
            <DataSource source="KOSIS 국가통계포털" href="https://kosis.kr" />
          </div>
        ) : (
          <div className={s.regionPills}>
            {majorRegions.map((r) => {
              const province = PROVINCES.find((p) => p.name === r);
              return province ? (
                <Link
                  key={r}
                  href={`/regions/${province.id}`}
                  className={s.regionPillLink}
                >
                  <Icon icon={MapPin} size="xs" />
                  {r}
                </Link>
              ) : (
                <span key={r} className={s.regionPill}>{r}</span>
              );
            })}
          </div>
        )}

        <Link href="/regions" className={s.regionCta}>
          지역별 상세 비교하기
          <Icon icon={ArrowRight} size="sm" />
        </Link>
      </div>
    </section>
  );
}

function GrowStepsSection({ steps }: { steps: CultivationStep[] }) {
  return (
    <section id="grow-steps" className={s.section}>
      <SectionHeader icon={<Icon icon={ClipboardList} size="lg" />} title="재배 방법" />
      <div className={s.sectionBody}>
        <div className={s.stepsList}>
          {steps.map((step) => (
            <div key={step.step} className={s.stepItem}>
              <span className={s.stepBadge}>{step.step}</span>
              <div className={s.stepBody}>
                <div className={s.stepHeader}>
                  <p className={s.stepTitle}>{step.title}</p>
                  <span className={s.stepPeriod}>{step.period}</span>
                </div>
                <p className={s.stepDesc}>
                  <AutoGlossary text={step.description} maxHighlights={3} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TipsSection({ tips }: { tips: string[] }) {
  return (
    <section id="tips" className={s.section}>
      <SectionHeader icon={<Icon icon={Lightbulb} size="lg" />} title="귀농 팁" />
      <div className={s.sectionBody}>
        <div className={s.tipsList}>
          {tips.map((tip, idx) => (
            <div key={idx} className={s.tipItem}>
              <span className={s.tipNum}>{String(idx + 1).padStart(2, "0")}</span>
              <p className={s.tipText}><AutoGlossary text={tip} maxHighlights={5} /></p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExternalResourcesSection({ resources }: { resources: ExternalResource[] }) {
  return (
    <section id="videos" className={s.section}>
      <SectionHeader icon={<Icon icon={Play} size="lg" />} title="관련 영상" />
      <div className={s.sectionBody}>
        <div className={s.videoGrid}>
          {resources.map((res, i) => (
            <a
              key={i}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className={s.videoCard}
            >
              {res.thumbnail && (
                <div className={s.videoThumb}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={res.thumbnail}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className={s.videoThumbImg}
                  />
                  <span className={s.videoPlayIcon} aria-hidden="true">
                    <Play size={24} fill="white" stroke="white" />
                  </span>
                </div>
              )}
              <p className={s.videoTitle}>{res.title}</p>
              {res.source && <span className={s.videoSource}>{res.source}</span>}
            </a>
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
        <Icon icon={DollarSign} size="md" />
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
            <Icon icon={ArrowRight} size="sm" />
          </Link>
        </div>
      ) : (
        <p className={s.emptyNote}>현재 등록된 관련 지원사업이 없습니다.</p>
      )}
    </div>
  );
}
