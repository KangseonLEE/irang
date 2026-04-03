import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Building2,
  Calendar,
  Coins,
  Users,
  Leaf,
} from "lucide-react";
import { getProgramById, PROGRAMS } from "@/lib/data/programs";
import type { SupportProgram } from "@/lib/data/programs";
import s from "./page.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const program = getProgramById(id);
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
  const program = getProgramById(id);

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
          <span
            className={`${s.statusBadge} ${s[`status_${program.status}`]}`}
          >
            {program.status}
          </span>
          <span className={`${s.typeLabel} ${TYPE_CLASS[program.supportType]}`}>
            {program.supportType}
          </span>
        </div>
        <h1 className={s.pageTitle}>{program.title}</h1>
        <p className={s.pageSummary}>{program.summary}</p>
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
                      <Link href="/regions" className={s.regionLink}>
                        {program.region}
                      </Link>
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
                {program.eligibilityDetail}
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
                <div className={s.cropBadges}>
                  {program.relatedCrops.map((crop) => (
                    <Link key={crop} href="/crops" className={s.cropBadge}>
                      {crop}
                    </Link>
                  ))}
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
              <a
                href={program.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={s.sourceButton}
              >
                <ExternalLink size={16} />
                원문 페이지 방문
              </a>
              <p className={s.sourceNote}>
                상세 내용과 신청 방법은 원문 페이지에서 확인하세요.
              </p>
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
