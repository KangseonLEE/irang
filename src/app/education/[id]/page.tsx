import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookmarkButton } from "@/components/bookmark/bookmark-button";
import { ShareButton } from "@/components/ui/share-button";
import { KakaoShareButton } from "@/components/ui/kakao-share-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ExternalLinkBlock } from "@/components/ui/external-link-block";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { formatDate } from "@/lib/format";
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
  if (!course) return { title: "교육 과정 상세" };

  return {
    title: `${course.title} — ${course.type}·${course.level} 귀농 교육`,
    description: `${course.region}에서 진행하는 ${course.level} ${course.type} 교육 "${course.title}". ${course.description.slice(0, 120)}`,
    keywords: [`${course.region} 귀농 교육`, `귀농 ${course.type}`, "귀농 교육 과정", course.title],
    alternates: { canonical: `/education/${id}` },
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
      <BreadcrumbJsonLd items={[
        { name: "귀농 교육", href: "/education" },
        { name: course.title, href: `/education/${id}` },
      ]} />
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
        <div className={s.titleRow}>
          <h1 className={s.pageTitle}>{course.title}</h1>
          <div className={s.titleActions}>
            <KakaoShareButton
              title={`${course.title} | 이랑`}
              description={`${course.description.slice(0, 100)}`}
              contentType="education"
            />
            <ShareButton
              title={`${course.title} | 이랑`}
              text={`${course.title}: ${course.description.slice(0, 80)}`}
              contentType="education"
              variant="ghost"
              size="sm"
              showLabel={false}
            />
            <BookmarkButton
              id={course.id}
              type="education"
              title={course.title}
              subtitle={course.organization}
            />
          </div>
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
                {formatDate(course.applicationStart)} ~ {formatDate(course.applicationEnd)}
              </p>
            </div>
          </div>

          {/* 안내 */}
          <div className={s.card}>
            <div className={s.cardContent} style={{ paddingTop: "24px" }}>
              <p className={s.missingInfoNotice}>
                교육 과정에 대한 커리큘럼 등 상세 정보는 원문 페이지에서 확인해 주세요.
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
