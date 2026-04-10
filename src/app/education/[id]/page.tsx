import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookmarkButton } from "@/components/bookmark/bookmark-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ExternalLinkBlock } from "@/components/ui/external-link-block";
import {
  ArrowLeft,
  MapPin,
  Building2,
  Calendar,
  Coins,
  Users,
  Clock,
  GraduationCap,
  Monitor,
  BookOpen,
} from "lucide-react";
import {
  getEducationByIdAsync,
  EDUCATION_COURSES,
} from "@/lib/data/education";
import type { EducationCourse } from "@/lib/data/education";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import s from "./page.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const course = await getEducationByIdAsync(id);
  return {
    title: course ? course.title : "교육 과정 상세",
    description: course?.description.slice(0, 160),
  };
}

export function generateStaticParams() {
  return EDUCATION_COURSES.map((c) => ({ id: c.id }));
}

interface EducationDetailPageProps {
  params: Promise<{ id: string }>;
}

const LEVEL_CLASS: Record<EducationCourse["level"], string> = {
  입문: s.levelBeginner,
  초급: s.levelBasic,
  중급: s.levelIntermediate,
  심화: s.levelAdvanced,
};

function getRelatedCourses(
  current: EducationCourse,
  limit: number = 3
): EducationCourse[] {
  return EDUCATION_COURSES.filter(
    (c) =>
      c.id !== current.id &&
      (c.region === current.region || c.level === current.level)
  ).slice(0, limit);
}

export default async function EducationDetailPage({
  params,
}: EducationDetailPageProps) {
  const { id } = await params;
  const course = await getEducationByIdAsync(id);

  if (!course) {
    notFound();
  }

  const related = getRelatedCourses(course);

  return (
    <div className={s.page}>
      {/* Back link */}
      <Link href="/education" className={s.backLink}>
        <ArrowLeft size={16} />
        교육 목록으로
      </Link>

      {/* Title + Badges */}
      <div className={s.titleSection}>
        <div className={s.badgeRow}>
          <StatusBadge status={course.status} />
          <span className={`${s.levelBadge} ${LEVEL_CLASS[course.level]}`}>
            {course.level}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "4px" }}>
          <h1 className={s.pageTitle} style={{ flex: 1 }}>{course.title}</h1>
          <BookmarkButton
            id={course.id}
            type="education"
            title={course.title}
            subtitle={course.organization}
          />
        </div>
      </div>

      <div className={s.contentGrid}>
        {/* Main content */}
        <div className={s.mainContent}>
          {/* Basic Info */}
          <div className={s.card}>
            <div className={s.cardHeader}>
              <h2 className={s.cardTitle}>기본 정보</h2>
            </div>
            <div className={s.cardContent}>
              <table className={s.table}>
                <tbody>
                  <InfoRow
                    icon={<Building2 size={16} />}
                    label="교육 기관"
                    value={course.organization}
                  />
                  <InfoRow
                    icon={<MapPin size={16} />}
                    label="지역"
                    value={course.region}
                  />
                  <InfoRow
                    icon={<Monitor size={16} />}
                    label="교육 유형"
                    value={course.type}
                  />
                  <InfoRow
                    icon={<Clock size={16} />}
                    label="교육 기간"
                    value={course.duration}
                  />
                  <InfoRow
                    icon={<Calendar size={16} />}
                    label="일정"
                    value={course.schedule}
                  />
                  <InfoRow
                    icon={<Coins size={16} />}
                    label="비용"
                    value={course.cost}
                  />
                  <InfoRow
                    icon={<Users size={16} />}
                    label="정원"
                    value={
                      course.capacity !== null
                        ? `${course.capacity}명`
                        : "제한 없음"
                    }
                  />
                  <InfoRow
                    icon={<GraduationCap size={16} />}
                    label="교육 대상"
                    value={course.target}
                  />
                </tbody>
              </table>
            </div>
          </div>

          {/* Description */}
          <div className={s.card}>
            <div className={s.cardHeader}>
              <h2 className={s.cardTitle}>교육 내용</h2>
            </div>
            <div className={s.cardContent}>
              <p className={s.descriptionText}><AutoGlossary text={course.description} /></p>
            </div>
          </div>

          {/* Application Period */}
          <div className={s.card}>
            <div className={s.cardHeader}>
              <h2 className={s.cardTitle}>
                <Calendar size={16} />
                신청 기간
              </h2>
            </div>
            <div className={s.cardContent}>
              <p className={s.periodText}>
                {course.applicationStart} ~ {course.applicationEnd}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={s.sidebar}>
          {/* CTA */}
          <div className={s.card}>
            <div className={s.cardHeader}>
              <h2 className={s.cardTitle}>신청 안내</h2>
            </div>
            <div className={s.cardContent}>
              <ExternalLinkBlock
                href={course.url}
                label="교육 신청 페이지"
                linkStatus={course.linkStatus}
                title={course.title}
              />
            </div>
          </div>

          {/* Related Courses */}
          {related.length > 0 && (
            <div className={s.card}>
              <div className={s.cardHeader}>
                <h2 className={s.cardTitle}>
                  <BookOpen size={16} />
                  관련 교육 과정
                </h2>
              </div>
              <div className={s.cardContent}>
                <ul className={s.relatedList}>
                  {related.map((r) => (
                    <li key={r.id} className={s.relatedItem}>
                      <Link href={`/education/${r.id}`} className={s.relatedLink}>
                        <span className={s.relatedTitle}>{r.title}</span>
                        <span className={s.relatedMeta}>
                          {r.region} · {r.level}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

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
