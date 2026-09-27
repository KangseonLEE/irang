import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookmarkButton } from "@/components/bookmark/bookmark-button";
import { CommunityNotes } from "@/components/community/community-notes";
import { CommunityJumpLink } from "@/components/community/community-jump-link";
import { PersonaCta } from "@/components/persona/persona-cta";
import { ShareButton } from "@/components/ui/share-button";
import { KakaoShareButton } from "@/components/ui/kakao-share-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ExternalLinkBlock } from "@/components/ui/external-link-block";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import type { GovernmentService } from "schema-dts";
import {
  ArrowLeft,
  MapPin,
  Building2,
  Calendar,
  Coins,
  Users,
  Lightbulb,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { formatApplicationPeriod, formatAgeRange } from "@/lib/format";
import { ALWAYS_OPEN, programStatusLabel } from "@/lib/program-status";
import { getProgramByIdAsync, PROGRAMS } from "@/lib/data/programs";
import { getProgramGuide } from "@/lib/data/program-guides";
import { getCropByName } from "@/lib/data/crops";
import { getStationByProvince } from "@/lib/data/stations";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { SupportTypeBadge } from "@/components/ui/support-type-badge";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import { EligibilityCheck } from "@/components/programs/eligibility-check";
import { ApplicationTimeline } from "@/components/programs/application-timeline";
import { SourceLinkButton } from "@/components/programs/source-link-button";
import {
  RelatedCropsCard,
  type RelatedCrop,
} from "@/components/programs/related-crops-card";
import s from "./page.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const program = await getProgramByIdAsync(id);
  if (!program) notFound();

  const regionLabel = program.region ?? "";
  return {
    title: `${program.title} — ${regionLabel} 농촌 정착 지원사업`,
    description: `${regionLabel} ${program.title}의 자격 조건, 지원 금액, 신청 방법을 확인하세요. ${program.summary?.slice(0, 100) ?? ""}`,
    keywords: [`${regionLabel} 농촌 정착 지원사업`, "농촌 정착 지원금", "농촌 정착금", program.title],
    alternates: { canonical: `/programs/${id}` },
  };
}

/** 정적 생성을 위한 params (샘플 데이터 기반) */
export function generateStaticParams() {
  return PROGRAMS.map((p) => ({ id: p.id }));
}

/** Supabase 지원사업 데이터를 24h마다 재검증 (봇 트래픽 절감, 갱신 시 manual revalidate) */
export const revalidate = 86400;

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
  const statusLabel = programStatusLabel(program);

  // 관련 작물은 클라이언트 카드(페이지네이션)가 받으므로 여기서 직렬화 가능한 값으로 펼친다
  const relatedCrops: RelatedCrop[] = program.relatedCrops.map((name) => {
    const info = getCropByName(name);
    return info
      ? {
          name,
          id: info.id,
          emoji: info.emoji,
          category: info.category,
          difficulty: info.difficulty,
        }
      : { name };
  });

  // ── GovernmentService schema ──
  // 9999-12-31 (미정 페어) 또는 잘못된 값은 schema에서 제외 (Google parser 오류 방지)
  const isValidDate = (d: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(d) && !d.startsWith("9999");
  const validStart = isValidDate(program.applicationStart)
    ? program.applicationStart
    : undefined;
  const validEnd = isValidDate(program.applicationEnd)
    ? program.applicationEnd
    : undefined;

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[
        { name: "지원사업 검색", href: "/programs" },
        { name: program.title, href: `/programs/${id}` },
      ]} />
      <JsonLd<GovernmentService>
        data={{
          "@context": "https://schema.org",
          "@type": "GovernmentService",
          name: program.title,
          description: program.summary,
          serviceType: program.supportType,
          areaServed: { "@type": "AdministrativeArea", name: program.region },
          provider: {
            "@type": "GovernmentOrganization",
            name: program.organization,
          },
          audience: {
            "@type": "Audience",
            audienceType: program.eligibilityDetail,
            ...(program.eligibilityAgeMin
              ? { suggestedMinAge: program.eligibilityAgeMin }
              : {}),
            ...(program.eligibilityAgeMax && program.eligibilityAgeMax < 99
              ? { suggestedMaxAge: program.eligibilityAgeMax }
              : {}),
          },
          ...(program.relatedCrops.length > 0
            ? { keywords: program.relatedCrops.join(", ") }
            : {}),
          ...(program.sourceUrl ? { url: program.sourceUrl } : {}),
          mainEntityOfPage: `https://irangfarm.com/programs/${program.id}`,
          ...(validStart || validEnd
            ? {
                availableChannel: {
                  "@type": "ServiceChannel",
                  serviceUrl: program.sourceUrl,
                  ...(validStart || validEnd
                    ? {
                        availableLanguage: "ko",
                      }
                    : {}),
                },
              }
            : {}),
          // 신청 기간을 별도 필드로 (Google ParseError 방지 위해 string)
          ...(validStart ? { validFrom: validStart } : {}),
          ...(validEnd ? { validThrough: validEnd } : {}),
        }}
      />
      {/* Breadcrumb / Back — 의견 바로가기를 같은 줄 끝에 둔다 (9/17: 단독 배치는 흐름을 끊었다) */}
      <div className={s.topBar}>
        <Link href="/programs" className={s.backLink}>
          <ArrowLeft size={16} />
          지원사업 목록
        </Link>
        <CommunityJumpLink from="program_detail" />
      </div>

      {/* Title + Status */}
      <div className={s.titleSection}>
        <div className={s.badgeRow}>
          <StatusBadge status={statusLabel} />
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
        {/* 원문 바로가기 — 사이드바 맨 아래(데스크탑 y≈4,051px)에만 있어 "링크가 없다"는
            리포트가 나왔다. 상세에서 가장 자주 하는 행동이라 첫 화면에 둔다 (9/27) */}
        <div className={s.sourceCtaRow}>
          <SourceLinkButton
            href={program.sourceUrl}
            linkStatus={program.linkStatus}
            title={program.title}
          />
        </div>
      </div>

      <ReferenceNotice text="지원사업 정보는 지자체 공고를 참고한 자료예요. 신청 전 해당 기관에서 최신 조건을 꼭 확인하세요." />

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
                  /* 사이드바 신청 기간 위젯과 같은 문구 — 표는 시기만, 안내는 위젯이 든다 (9/27).
                     "공고 발표 예정 — 원문 페이지에서 확인"처럼 한 칸에 시기·안내를 겹쳐 쓰지 않는다 */
                  value={
                    program.applicationStart === ALWAYS_OPEN &&
                    program.applicationEnd === ALWAYS_OPEN
                      ? program.applicationCycle?.trim() || "공고 발표 전이에요"
                      : program.applicationEnd === ALWAYS_OPEN
                        ? "상시 모집"
                        : formatApplicationPeriod(program.applicationStart, program.applicationEnd, program.applicationCycle)
                  }
                />
                <InfoRow
                  icon={<Users size={16} />}
                  label="대상 연령"
                  value={formatAgeRange(program.eligibilityAgeMin, program.eligibilityAgeMax)}
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
                상세 안내는 아직 준비 중이에요. 원문 페이지에서 자세한 내용을 확인해 보세요.
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

        {/* Sidebar — 원문 확인을 맨 위로 (9/27). 관련 작물 55개가 위에 있어
            데스크탑 y≈4,051px·모바일 5,268px 로 밀려 있던 카드다 */}
        <div className={s.sidebar}>
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

          {/* Application Timeline */}
          <ApplicationTimeline
            applicationStart={program.applicationStart}
            applicationEnd={program.applicationEnd}
            status={program.status}
            statusLabel={statusLabel}
            applicationCycle={program.applicationCycle}
            organization={program.organization}
          />

          {/* Eligibility Self Check */}
          <EligibilityCheck
            programTitle={program.title}
            ageMin={program.eligibilityAgeMin}
            ageMax={program.eligibilityAgeMax}
            eligibilityDetail={program.eligibilityDetail}
            organization={program.organization}
            sourceUrl={program.sourceUrl}
            linkStatus={program.linkStatus}
          />

          {/* Related Crops — 5개씩 (작물 범용 사업은 55개) */}
          {relatedCrops.length > 0 && <RelatedCropsCard crops={relatedCrops} />}

          {/* 커뮤니티 1단계 — 한 줄 의견 (사전 승인제, 2026-09-02) */}
          <PersonaCta from="program_detail" copy="내가 받을 수 있는 지원은 뭘까요?" />
          <CommunityNotes targetType="program" targetId={program.id} targetLabel={program.title} />
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
