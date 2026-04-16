import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookmarkButton } from "@/components/bookmark/bookmark-button";
import { ShareButton } from "@/components/ui/share-button";
import { KakaoShareButton } from "@/components/ui/kakao-share-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ExternalLinkBlock } from "@/components/ui/external-link-block";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Building2,
  Calendar,
  Coins,
  Users,
  Leaf,
  Lightbulb,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { formatDate } from "@/lib/format";
import { getProgramByIdAsync, PROGRAMS } from "@/lib/data/programs";
import { getProgramGuide } from "@/lib/data/program-guides";
import { getCropByName } from "@/lib/data/crops";
import { getStationByProvince } from "@/lib/data/stations";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { SupportTypeBadge } from "@/components/ui/support-type-badge";
import { EligibilityCheck } from "@/components/programs/eligibility-check";
import { ApplicationTimeline } from "@/components/programs/application-timeline";
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

/** Supabase 지원사업 데이터를 1시간마다 재검증 */
export const revalidate = 3600;

interface ProgramDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProgramDetailPage({
  params,
}: ProgramDetailPageProps) {
  const { id } = await params;
  const program = await getProgramByIdAsync(id);

  if (!program) {
    notFound();
  }

  const guide = getProgramGuide(id);

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[
        { name: "지원사업 검색", href: "/programs" },
        { name: program.title, href: `/programs/${id}` },
      ]} />
      {/* Breadcrumb / Back */}
      <Link href="/programs" className={s.backLink}>
        <ArrowLeft size={16} />
        지원사업 목록
      </Link>

      {/* Title + Status */}
      <div className={s.titleSection}>
        <div className={s.badgeRow}>
          <StatusBadge status={program.status} />
          <SupportTypeBadge type={program.supportType} prefix="지원 유형: " />
        </div>
        <div className={s.titleRow}>
          <h1 className={s.pageTitle}>{program.title}</h1>
          <div className={s.titleActions}>
            <KakaoShareButton
              title={`${program.title} | 이랑`}
              description={`${program.summary.slice(0, 100)}`}
              contentType="program"
            />
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
          {/* Basic Information */}
          <section className={s.section}>
            <h2 className={s.sectionTitle}>기본 정보</h2>
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
                <tr className={s.tableRow}>
                  <td className={s.tableLabelCell}>
                    <span className={s.iconLabel}>
                      <span className={s.iconMuted}>
                        <Coins size={16} />
                      </span>
                      지원 유형
                    </span>
                  </td>
                  <td className={s.tableValueCell}>
                    <SupportTypeBadge type={program.supportType} />
                  </td>
                </tr>
                <InfoRow
                  icon={<Coins size={16} />}
                  label="지원 금액"
                  value={program.supportAmount}
                />
                <InfoRow
                  icon={<Calendar size={16} />}
                  label="신청 기간"
                  value={`${formatDate(program.applicationStart)} ~ ${formatDate(program.applicationEnd)}`}
                />
                <InfoRow
                  icon={<Users size={16} />}
                  label="대상 연령"
                  value={`만 ${program.eligibilityAgeMin}세 ~ ${program.eligibilityAgeMax}세`}
                />
              </tbody>
            </table>
          </section>

          {/* Eligibility */}
          <section className={s.section}>
            <h2 className={s.sectionTitle}>자격 조건</h2>
            <p className={s.eligibilityText}>
              <AutoGlossary text={program.eligibilityDetail} />
            </p>
          </section>

          {/* 상세 설명 (DB에 description이 있는 경우에만 표시) */}
          {program.description && (
            <section className={s.section}>
              <h2 className={s.sectionTitle}>사업 설명</h2>
              <p className={s.descriptionText}>
                <AutoGlossary text={program.description} />
              </p>
            </section>
          )}

          {/* ── 상세 안내 미제공 안내 ── */}
          {!guide && (
            <section className={s.section}>
              <p className={s.missingInfoNotice}>
                이 사업에 대한 상세 안내 정보가 아직 준비되지 않았습니다. 원문 페이지에서 자세한 내용을 확인해 주세요.
              </p>
            </section>
          )}

          {/* ── 가이드 콘텐츠 (특정 프로그램용 상세 안내) ── */}
          {guide && (
            <>
              {/* 상세 소개 */}
              <section className={s.section}>
                <h2 className={s.sectionTitle}>상세 안내</h2>
                <p className={s.guideIntro}>{guide.intro}</p>
                <ul className={s.guideHighlights}>
                  {guide.highlights.map((h) => (
                    <li key={h} className={s.guideHighlightItem}>{h}</li>
                  ))}
                </ul>
              </section>

              {/* 신청 절차 */}
              <section className={s.section}>
                <h2 className={s.sectionTitle}>신청 절차</h2>
                <ol className={s.guideSteps}>
                  {guide.steps.map((step, i) => {
                    const Icon = step.icon;
                    return (
                      <li key={i} className={s.guideStep}>
                        <div className={s.guideStepIcon}>
                          <Icon size={18} />
                        </div>
                        <div className={s.guideStepContent}>
                          <h3 className={s.guideStepTitle}>
                            <span className={s.guideStepNum}>{i + 1}</span>
                            {step.title}
                          </h3>
                          <p className={s.guideStepDesc}>{step.description}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>

              {/* FAQ */}
              <section className={s.section}>
                <h2 className={s.sectionTitle}>
                  <HelpCircle size={18} className={s.iconMuted} />
                  자주 묻는 질문
                </h2>
                <div className={s.guideFaqList}>
                  {guide.faq.map((item, i) => (
                    <details key={i} className={s.guideFaqItem}>
                      <summary className={s.guideFaqQuestion}>
                        {item.question}
                        <ChevronDown size={16} className={s.guideFaqChevron} />
                      </summary>
                      <p className={s.guideFaqAnswer}>{item.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              {/* 팁 */}
              <section className={s.section}>
                <h2 className={s.sectionTitle}>
                  <Lightbulb size={18} className={s.iconMuted} />
                  유용한 팁
                </h2>
                <ul className={s.guideTips}>
                  {guide.tips.map((tip) => (
                    <li key={tip} className={s.guideTipItem}>{tip}</li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className={s.sidebar}>
          {/* Application Timeline */}
          <ApplicationTimeline
            applicationStart={program.applicationStart}
            applicationEnd={program.applicationEnd}
            status={program.status}
          />

          {/* Eligibility Self Check */}
          <EligibilityCheck
            programTitle={program.title}
            ageMin={program.eligibilityAgeMin}
            ageMax={program.eligibilityAgeMax}
            eligibilityDetail={program.eligibilityDetail}
          />

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
