import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ShareButton } from "@/components/ui/share-button";
import { KakaoShareButton } from "@/components/ui/kakao-share-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ExternalLinkBlock } from "@/components/ui/external-link-block";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import type { Course } from "schema-dts";
import { formatDate } from "@/lib/format";
import {
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
import { displayText } from "@/lib/programs/display";
import { shareMetadata } from "@/lib/seo/share-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const course = await getEducationByIdAsync(id);
  if (!course) notFound();

  // 수집 행 상투 설명("…에서 수집했어요")은 메타·공유 문구에 싣지 않는다 (10/4 QA)
  const summary = displayText(course.id, course.description);
  const description = `${course.region}에서 진행하는 ${course.level} ${course.type} 교육 "${course.title}".${summary ? ` ${summary.slice(0, 120)}` : ""}`;
  return {
    title: `${course.title} — ${course.type}·${course.level} 정착 교육`,
    description,
    keywords: [`${course.region} 정착 교육`, `귀농 ${course.type}`, "정착 교육 과정", course.title],
    alternates: { canonical: `/education/${id}` },
    // 공유 카드 — 없으면 레이아웃의 사이트 기본 제목이 나갔다 (10/4 QA)
    ...shareMetadata({ title: `${course.title} | 이랑`, description, path: `/education/${id}` }),
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
  const summary = displayText(course.id, course.description);
  const shareText = summary ?? `${course.region} ${course.type} 교육`;

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[
        { name: "정착 교육", href: "/education" },
        { name: course.title, href: `/education/${id}` },
      ]} />
      <JsonLd<Course>
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: course.title,
          description: shareText,
          // 과정을 여는 곳은 주관 기관이다 — "이랑"으로 적으면 구조화 데이터가 사실과 달라진다 (10/4 QA)
          provider: { "@type": "Organization", name: course.organization || course.region },
          inLanguage: "ko",
          about: `${course.region} ${course.type} ${course.level} 귀농 정착 교육`,
          mainEntityOfPage: `https://irangfarm.com/education/${id}`,
        }}
      />
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
              description={shareText.slice(0, 100)}
              contentType="education"
            />
            <ShareButton
              title={`${course.title} | 이랑`}
              text={`${course.title}: ${shareText.slice(0, 80)}`}
              contentType="education"
              variant="ghost"
              size="sm"
              showLabel={false}
            />
          </div>
        </div>
      </div>

      {/* 브레드크럼 — 히어로(사진·제목) 아래 공통 위치 (2026-10-02 회장) */}
      <Breadcrumb
        className={s.breadcrumbBar}
        items={[
          { name: "정착 교육", href: "/education" },
          { name: course.title },
        ]}
      />

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

          {/* Description — 수집 행처럼 상투 문장뿐이면 카드째 숨긴다(원문 링크 카드가 그 역할) */}
          {summary && (
            <div className={s.card}>
              <div className={s.cardHeader}>
                <h2 className={s.cardTitle}>교육 내용</h2>
              </div>
              <div className={s.cardContent}>
                <p className={s.descriptionText}><AutoGlossary text={summary} /></p>
              </div>
            </div>
          )}

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
            <div className={`${s.cardContent} ${s.cardContentSpacedTop}`}>
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
                label="신청 페이지 보러가기"
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
