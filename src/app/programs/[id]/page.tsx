import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookmarkButton } from "@/components/bookmark/bookmark-button";
import { ShareButton } from "@/components/ui/share-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ExternalLinkBlock } from "@/components/ui/external-link-block";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Building2,
  Calendar,
  Coins,
  Users,
  Leaf,
} from "lucide-react";
import { getProgramById, getProgramByIdAsync, PROGRAMS } from "@/lib/data/programs";
import type { SupportProgram } from "@/lib/data/programs";
import { getCropByName } from "@/lib/data/crops";
import { getStationByProvince } from "@/lib/data/stations";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import s from "./page.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const program = await getProgramByIdAsync(id);
  return {
    title: program ? program.title : "지원사업 상세",
    description: program?.summary,
  };
}

/** 정적 생성을 위한 params (샘플 데이터 기반) */
export function generateStaticParams() {
  return PROGRAMS.map((p) => ({ id: p.id }));
}

interface ProgramDetailPageProps {
  params: Promise<{ id: string }>;
}

const TYPE_CLASS: Record<SupportProgram["supportType"], string> = {
  보조금: s.typeGrant,
  융자: s.typeLoan,
  교육: s.typeEducation,
  현물: s.typeInKind,
  컨설팅: s.typeConsulting,
};

export default async function ProgramDetailPage({
  params,
}: ProgramDetailPageProps) {
  const { id } = await params;
  const program = await getProgramByIdAsync(id);

  if (!program) {
    notFound();
  }

  return (
    <div className={s.page}>
      {/* Breadcrumb / Back */}
      <Link href="/programs" className={s.backLink}>
        <ArrowLeft size={16} />
        지원사업 목록
      </Link>

      {/* Title + Status */}
      <div className={s.titleSection}>
        <div className={s.badgeRow}>
          <StatusBadge status={program.status} />
          <span className={`${s.typeLabel} ${TYPE_CLASS[program.supportType]}`}>
            {program.supportType}
          </span>
        </div>
        <div className={s.titleRow}>
          <h1 className={s.pageTitle}>{program.title}</h1>
          <div className={s.titleActions}>
            <ShareButton
              title={`${program.title} | 이랑`}
              text={`${program.title}: ${program.summary.slice(0, 80)}`}
              contentType="program"
              variant="ghost"
              size="sm"
              showLabel={false}
            />
            <BookmarkButton
              id={program.id}
              type="program"
              title={program.title}
              subtitle={program.region}
            />
          </div>
        </div>
        <p className={s.pageSummary}><AutoGlossary text={program.summary} /></p>
      </div>

      <div className={s.contentGrid}>
        {/* Main Info */}
        <div className={s.mainContent}>
          {/* Basic Information Table */}
          <div className={s.card}>
            <div className={s.cardHeader}>
              <h2 className={s.cardTitle}>기본 정보</h2>
            </div>
            <div className={s.cardContent}>
              <table className={s.table}>
                <tbody>
                  <tr className={s.tableRow}>
                    <td className={s.tableLabelCell}>
                      <span className={s.iconLabel}>
                        <span className={s.iconMuted}>
                          <MapPin size={16} />
                        </span>
                        지역
                      </span>
                    </td>
                    <td className={s.tableValueCell}>
                      {(() => {
                        const station = getStationByProvince(program.region);
                        const href = station
                          ? `/regions?stations=${station.stnId}`
                          : "/regions";
                        return (
                          <Link href={href} className={s.regionLink}>
                            {program.region}
                          </Link>
                        );
                      })()}
                    </td>
                  </tr>
                  <InfoRow
                    icon={<Building2 size={16} />}
                    label="담당 기관"
                    value={program.organization}
                  />
                  <InfoRow
                    icon={<Coins size={16} />}
                    label="지원 유형"
                    value={program.supportType}
                  />
                  <InfoRow
                    icon={<Coins size={16} />}
                    label="지원 금액"
                    value={program.supportAmount}
                  />
                  <InfoRow
                    icon={<Calendar size={16} />}
                    label="신청 기간"
                    value={`${program.applicationStart} ~ ${program.applicationEnd}`}
                  />
                  <InfoRow
                    icon={<Users size={16} />}
                    label="대상 연령"
                    value={`만 ${program.eligibilityAgeMin}세 ~ ${program.eligibilityAgeMax}세`}
                  />
                </tbody>
              </table>
            </div>
          </div>

          {/* Eligibility */}
          <div className={s.card}>
            <div className={s.cardHeader}>
              <h2 className={s.cardTitle}>자격 조건</h2>
            </div>
            <div className={s.cardContent}>
              <p className={s.eligibilityText}>
                <AutoGlossary text={program.eligibilityDetail} />
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={s.sidebar}>
          {/* Related Crops */}
          {program.relatedCrops.length > 0 && (
            <div className={s.card}>
              <div className={s.cardHeader}>
                <h2 className={s.cardTitle}>
                  <Leaf size={16} />
                  관련 작물
                </h2>
              </div>
              <div className={s.cardContent}>
                <div className={s.cropList}>
                  {program.relatedCrops.map((cropName) => {
                    const cropInfo = getCropByName(cropName);
                    if (cropInfo) {
                      return (
                        <Link
                          key={cropName}
                          href={`/crops/${cropInfo.id}`}
                          className={s.cropItem}
                        >
                          <span className={s.cropEmoji}>{cropInfo.emoji}</span>
                          <span className={s.cropItemText}>
                            <span className={s.cropItemName}>{cropName}</span>
                            <span className={s.cropItemSub}>{cropInfo.category} · {cropInfo.difficulty}</span>
                          </span>
                          <ArrowRight size={14} className={s.cropArrow} />
                        </Link>
                      );
                    }
                    return (
                      <span key={cropName} className={s.cropItemStatic}>
                        <span className={s.cropEmojiMuted}>🌱</span>
                        <span className={s.cropItemText}>
                          <span className={s.cropItemName}>{cropName}</span>
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Source Link */}
          <div className={s.card}>
            <div className={s.cardHeader}>
              <h2 className={s.cardTitle}>원문 확인</h2>
            </div>
            <div className={s.cardContent}>
              <ExternalLinkBlock
                href={program.sourceUrl}
                label="원문 페이지 방문"
                linkStatus={program.linkStatus}
                title={program.title}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 서브 컴포넌트 ---

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <tr className={s.tableRow}>
      <td className={s.tableLabelCell}>
        <span className={s.iconLabel}>
          <span className={s.iconMuted}>{icon}</span>
          {label}
        </span>
      </td>
      <td className={s.tableValueCell}>{value}</td>
    </tr>
  );
}
