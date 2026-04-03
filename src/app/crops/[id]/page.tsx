import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BookmarkButton } from "@/components/bookmark/bookmark-button";
import {
  ArrowLeft,
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
  Users,
  FileText,
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
import s from "./page.module.css";

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
    ? await fetchCropStats(data.detail.kosisConfig.tblId).catch(
        () => [] as CropStatItem[]
      )
    : [];

  const relatedPrograms = PROGRAMS.filter((p) =>
    p.relatedCrops.some((rc) => rc === data.name)
  ).slice(0, 3);

  const relatedCrops = data.detail.relatedCropIds
    .map((rid) => CROPS.find((c) => c.id === rid))
    .filter((c): c is NonNullable<typeof c> => c != null);

  const { detail } = data;

  return (
    <div className={s.page}>
      {/* 뒤로가기 */}
      <Link href="/crops" className={s.backLink}>
        <ArrowLeft size={18} />
        작물 목록
      </Link>

      {/* ── Hero (2단) ── */}
      <div className={s.hero}>
        <div className={s.heroImage}>
          <Image
            src={`/crops/${data.id}.jpg`}
            alt={data.name}
            fill
            sizes="(max-width: 1024px) 100vw, 480px"
            style={{ objectFit: "cover" }}
            priority
          />
        </div>

        <div className={s.heroInfo}>
          <div>
            <div className={s.badges}>
              <span className={`${s.badge} ${s.badgeCategory}`}>
                {data.category}
              </span>
              <span
                className={`${s.badge} ${DIFFICULTY_BADGE[data.difficulty] ?? s.badgeNormal}`}
              >
                난이도: {data.difficulty}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 className={s.heroTitle} style={{ flex: 1 }}>{data.name}</h1>
              <BookmarkButton
                id={data.id}
                type="crop"
                title={data.name}
                subtitle={data.category}
              />
            </div>
            <p className={s.heroDesc}>{data.description}</p>
          </div>

          {/* Quick Facts */}
          <div className={s.quickFacts}>
            <div className={s.factCard}>
              <div className={s.factLabel}>
                <Calendar size={16} />
                재배 시기
              </div>
              <div className={s.factValue}>{data.growingSeason}</div>
            </div>
            <div className={s.factCard}>
              <div className={s.factLabel}>
                <TrendingUp size={16} />
                예상 수익
              </div>
              <div className={s.factValue}>{detail.income.revenueRange}</div>
            </div>
            <div className={s.factCard}>
              <div className={s.factLabel}>
                <MapPin size={16} />
                주요 산지
              </div>
              <div className={s.factValue}>
                {detail.majorRegions.slice(0, 2).join(", ")}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className={s.ctaGroup}>
            {relatedPrograms.length > 0 && (
              <Link
                href={`/programs/${relatedPrograms[0].id}`}
                className={`${s.ctaButton} ${s.ctaPrimary}`}
              >
                <FileText size={16} />
                관련 지원사업 보기
              </Link>
            )}
            <Link
              href="/regions"
              className={`${s.ctaButton} ${s.ctaOutline}`}
            >
              <MapPin size={16} />
              지역 비교하기
            </Link>
          </div>
        </div>
      </div>

      {/* ── 본문 그리드 ── */}
      <div className={s.mainGrid}>
        {/* 좌측: 본문 */}
        <div className={s.mainContent}>
          <CultivationSection cultivation={detail.cultivation} />
          <IncomeSection income={detail.income} />
          <RegionSection
            majorRegions={detail.majorRegions}
            cropStats={cropStats}
          />
          <TipsSection tips={detail.tips} />
        </div>

        {/* 우측: 사이드바 */}
        <aside className={s.sidebar}>
          {relatedCrops.length > 0 && (
            <RelatedCropsSection relatedCrops={relatedCrops} />
          )}
          <RelatedProgramsSection relatedPrograms={relatedPrograms} />
          <RegionCtaSection />
        </aside>
      </div>

      {/* 모바일 하단 바 */}
      <div className={s.mobileBar}>
        <Link
          href="/programs"
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

function SectionWrapper({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={s.section}>
      <h2 className={s.sectionHeader}>
        <span className={s.sectionHeaderIcon}>{icon}</span>
        {title}
      </h2>
      <div className={s.sectionBody}>{children}</div>
    </section>
  );
}

function CultivationSection({
  cultivation,
}: {
  cultivation: CropDetailInfo["cultivation"];
}) {
  const items = [
    {
      icon: <Thermometer size={20} />,
      cls: s.climate,
      label: "기후",
      value: cultivation.climate,
    },
    {
      icon: <Leaf size={20} />,
      cls: s.soil,
      label: "토양",
      value: cultivation.soil,
    },
    {
      icon: <Droplets size={20} />,
      cls: s.water,
      label: "수분",
      value: cultivation.water,
    },
    {
      icon: <Ruler size={20} />,
      cls: s.spacing,
      label: "간격",
      value: cultivation.spacing,
    },
    {
      icon: <FlaskConical size={20} />,
      cls: s.fertilizer,
      label: "비료",
      value: cultivation.fertilizerNote,
    },
  ];

  return (
    <SectionWrapper icon={<Sprout size={18} />} title="재배 환경">
      <div className={s.cultivationGrid}>
        {items.map((item) => (
          <div key={item.label} className={s.cultivationItem}>
            <div className={`${s.cultivationIcon} ${item.cls}`}>
              {item.icon}
            </div>
            <div>
              <p className={s.cultivationLabel}>{item.label}</p>
              <p className={s.cultivationValue}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

function IncomeSection({
  income,
}: {
  income: CropDetailInfo["income"];
}) {
  return (
    <SectionWrapper icon={<TrendingUp size={18} />} title="수익 정보">
      {/* 수익 강조 */}
      <div className={s.revenueHighlight}>
        <p className={s.revenueLabel}>예상 수익 (10a 기준)</p>
        <p className={s.revenueValue}>{income.revenueRange}</p>
      </div>

      <div className={s.incomeGrid}>
        <div className={s.incomeItem}>
          <div className={`${s.incomeIcon} ${s.cost}`}>
            <DollarSign size={20} />
          </div>
          <div>
            <p className={s.incomeLabel}>비용</p>
            <p className={s.incomeValue}>{income.costNote}</p>
          </div>
        </div>
        <div className={s.incomeItem}>
          <div className={`${s.incomeIcon} ${s.labor}`}>
            <Users size={20} />
          </div>
          <div>
            <p className={s.incomeLabel}>노동력</p>
            <p className={s.incomeValue}>{income.laborNote}</p>
          </div>
        </div>
      </div>
    </SectionWrapper>
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
    <SectionWrapper icon={<MapPin size={18} />} title="인기 재배지역">
      <div className={s.regionBadges}>
        {majorRegions.map((r) => {
          const station = getStationByProvince(r);
          return station ? (
            <Link
              key={r}
              href={`/regions?stations=${station.stnId}`}
              className={s.regionBadgeLink}
            >
              <MapPin size={12} />
              {r}
            </Link>
          ) : (
            <span key={r} className={s.regionBadge}>
              {r}
            </span>
          );
        })}
      </div>

      {top5.length > 0 && (
        <>
          <p className={s.regionStatsLabel}>
            KOSIS 통계 ({top5[0].year}년 기준, 재배면적 상위 5개 지역)
          </p>
          <div className={s.regionList}>
            {top5.map((stat, idx) => {
              const pct = Math.round(
                (stat.cultivationArea / maxArea) * 100
              );
              return (
                <div key={stat.regionName} className={s.regionRow}>
                  <div className={s.regionMeta}>
                    <span className={s.regionRank}>
                      <span className={s.regionRankNum}>{idx + 1}</span>
                      {stat.regionName}
                    </span>
                    <span className={s.regionArea}>
                      {stat.cultivationArea.toLocaleString()} ha
                    </span>
                  </div>
                  <div className={s.regionBar}>
                    <div
                      className={s.regionBarFill}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className={s.regionSource}>
            출처: KOSIS 국가통계포털 (kosis.kr)
          </p>
        </>
      )}
    </SectionWrapper>
  );
}

function TipsSection({ tips }: { tips: string[] }) {
  return (
    <SectionWrapper icon={<Lightbulb size={18} />} title="귀농 팁">
      <div className={s.tipsList}>
        {tips.map((tip, idx) => (
          <div key={idx} className={s.tipItem}>
            <span className={s.tipNum}>{idx + 1}</span>
            <p className={s.tipText}>{tip}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

function RelatedCropsSection({
  relatedCrops,
}: {
  relatedCrops: Array<{ id: string; name: string }>;
}) {
  return (
    <div className={s.sideSection}>
      <h3 className={s.sideSectionHeader}>
        <Leaf size={18} />
        연관 작물
      </h3>
      <div className={s.sideSectionBody}>
        <div className={s.relatedCropList}>
          {relatedCrops.map((crop) => (
            <Link
              key={crop.id}
              href={`/crops/${crop.id}`}
              className={s.relatedCropLink}
            >
              {crop.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function RelatedProgramsSection({
  relatedPrograms,
}: {
  relatedPrograms: Array<{
    id: string;
    title: string;
    supportType: string;
    region: string;
  }>;
}) {
  return (
    <div className={s.sideSection}>
      <h3 className={s.sideSectionHeader}>
        <DollarSign size={18} />
        관련 지원사업
      </h3>
      <div className={s.sideSectionBody}>
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
            <Link href="/programs" className={s.programMore}>
              더보기
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <p className={s.emptyState}>
            현재 등록된 관련 지원사업이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}

function RegionCtaSection() {
  return (
    <div className={s.sideSection}>
      <h3 className={s.sideSectionHeader}>
        <MapPin size={18} />
        지역 비교
      </h3>
      <div className={`${s.sideSectionBody} ${s.ctaCard}`}>
        <p className={s.ctaCardDesc}>
          귀농 후보 지역의 기후, 인구, 생활 인프라를 비교해보세요.
        </p>
        <Link
          href="/regions"
          className={`${s.ctaButton} ${s.ctaOutline}`}
        >
          지역 비교하기
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
