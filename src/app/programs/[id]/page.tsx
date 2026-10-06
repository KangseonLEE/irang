import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CommunityNotes } from "@/components/community/community-notes";
import { CommunityJumpLink } from "@/components/community/community-jump-link";
import { PersonaCta } from "@/components/persona/persona-cta";
import { ShareButton } from "@/components/ui/share-button";
import { KakaoShareButton } from "@/components/ui/kakao-share-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ExternalLinkBlock } from "@/components/ui/external-link-block";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import type { GovernmentService } from "schema-dts";
import {
  MapPin,
  Building2,
  Calendar,
  Coins,
  Users,
  Lightbulb,
  HelpCircle,
  ChevronDown, ArrowRight } from "lucide-react";
import { formatApplicationPeriod, formatAgeRange } from "@/lib/format";
import { ALWAYS_OPEN, kstToday, programStatusLabel } from "@/lib/program-status";
import { getProgramByIdAsync, PROGRAMS } from "@/lib/data/programs";
import { getProgramGuide } from "@/lib/data/program-guides";
import { getCropByName } from "@/lib/data/crops";
import { getStationByProvince } from "@/lib/data/stations";
import { SentenceText } from "@/components/ui/sentence-text";
import { SupportTypeBadge } from "@/components/ui/support-type-badge";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import { EligibilityCheck } from "@/components/programs/eligibility-check";
import { ApplicationTimeline } from "@/components/programs/application-timeline";
import { sourceBlockLabel } from "@/lib/source-label";
import { displayText } from "@/lib/programs/display";
import { programSeoDescription, programSeoTitle } from "@/lib/programs/seo";
import { shareMetadata } from "@/lib/seo/share-metadata";
import { SidebarTabs } from "@/components/ui/sidebar-tabs";
import st from "@/components/ui/sidebar-tabs.module.css";
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
  // 수집 행의 출처 문장("…에서 수집했어요")은 설명에 싣지 않는다 (10/3) — 큐레이션 문장은 그대로(10/4)
  const summary = displayText(program.id, program.summary);
  // 검색 결과 제목·설명 — "조건·신청 방법" + "귀농 지원사업", 노출 큰 사업은 실제 검색어로 (10/6 GSC 9월, lib/programs/seo)
  const description = programSeoDescription(program, summary);
  return {
    title: programSeoTitle(program),
    description,
    keywords: [`${regionLabel} 귀농 지원사업`.trim(), "귀농 지원금", "귀농 정착 지원금", "농촌 정착 지원금", program.title],
    alternates: { canonical: `/programs/${id}` },
    // 공유 카드 — 없으면 레이아웃의 사이트 기본 제목이 나갔다 (10/4 QA)
    ...shareMetadata({ title: `${program.title} | 이랑`, description, path: `/programs/${id}` }),
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
  // 수집 행 요약·설명이 출처 문장뿐이면 숨긴다 — 카드(program-card)와 같은 규칙 (10/3).
  // 수집기가 요약과 설명을 같은 원문 발췌로 채우므로 같으면 "사업 설명"을 한 번 더 보여 주지 않는다.
  const summary = displayText(program.id, program.summary);
  const descriptionText = displayText(program.id, program.description);
  const shareText = summary ?? `${program.region} ${program.title}`;

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
          description: shareText,
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
              description={shareText.slice(0, 100)}
              contentType="program"
            />
            <ShareButton
              title={`${program.title} | 이랑`}
              text={`${program.title}: ${shareText.slice(0, 80)}`}
              contentType="program"
              variant="ghost"
              size="sm"
              showLabel={false}
            />
          </div>
        </div>
        {/* 문장 단위 줄 나눔 (9/28 회장) — 목록·랜딩 카드는 2줄 clamp 라 제외 */}
        {summary && <p className={s.pageSummary}><SentenceText text={summary} glossary /></p>}
        {/* 원문 링크는 사이드 "원문 확인" 카드(사이드바 최상단) 한 곳만 — 제목 아래 버튼과 이중 노출이라
            회장 9/28 "위젯 것만 남기자". 셀프 체크 결과 모달의 링크는 별도 맥락이라 유지 */}
      </div>

      {/* 브레드크럼 — 히어로(제목 블록) 아래 공통 위치 (2026-10-02 회장). 의견 바로가기는 같은 줄 끝 (9/17) */}
      <div className={s.topBar}>
        <Breadcrumb
          items={[
            { name: "지원사업 검색", href: "/programs" },
            { name: program.title },
          ]}
        />
        <CommunityJumpLink from="program_detail" />
      </div>

      <ReferenceNotice text="지원사업 정보는 지자체 공고를 참고한 자료예요. 신청 전 해당 기관에서 최신 조건을 꼭 확인하세요." />

      <div className={s.contentGrid}>
        {/* Main Info */}
        {/* 사이드 탭 — 모바일에선 본문 위, 1024+ 에선 오른쪽 컬럼 첫 요소(grid-template-areas). 회장 9/28 */}
        <div className={s.tabsSlot}>
            {/* 모바일(<1024)은 탭이 아니라 섹션 스택 — 호갱노노 모바일 문법 (회장 9/28).
                CSS-only 전환이라 DOM·SSR 링크는 한 벌 그대로다. */}
            <SidebarTabs
              stackBelow
              tabs={[
                {
                  id: "eligibility",
                  label: "자격 체크",
                  stackMeta: "공고 기준 · 참고용",
                  content: (
                    <EligibilityCheck
                      key="eligibility"
                      bare
                      programTitle={program.title}
                      ageMin={program.eligibilityAgeMin}
                      ageMax={program.eligibilityAgeMax}
                      eligibilityDetail={program.eligibilityDetail}
                      organization={program.organization}
                      sourceUrl={program.sourceUrl}
                      linkStatus={program.linkStatus}
                    />
                  ),
                },
                ...(relatedCrops.length > 0
                  ? [
                      {
                        id: "crops",
                        label: "관련 작물",
                        stackMeta: `${relatedCrops.length}종`,
                        content: <RelatedCropsCard key="crops" crops={relatedCrops} bare />,
                      },
                    ]
                  : []),
                {
                  id: "notes",
                  label: "현장 이야기",
                  /* 모바일은 본문 하단에 현장 이야기 섹션이 그대로 있어 티저가 중복이다 */
                  hideWhenStacked: true,
                  content: (
                    <div key="notes" className={st.sideTabNotes}>
                      <p className={st.sideTabNotesText}>
                        이 사업을 신청해 봤거나 알아보는 중이라면 한 줄 남겨 주세요. 검토 후 이 페이지에 게시돼요.
                      </p>
                      <a href="#community-notes" className={st.sideTabMore} data-community-jump="program_side">
                        한마디 남기기
                        <ArrowRight size={14} aria-hidden="true" />
                      </a>
                    </div>
                  ),
                },
              ]}
            />
        </div>

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
              <SentenceText text={program.eligibilityDetail} glossary />
            </p>
          </section>

          {/* 상세 설명 (DB에 description이 있는 경우에만 표시) */}
          {descriptionText && descriptionText !== summary && (
            <section className={s.section}>
              <h2 className={s.sectionTitle}>사업 설명</h2>
              <p className={s.descriptionText}>
                <SentenceText text={descriptionText} glossary />
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
                <p className={s.guideIntro}><SentenceText text={guide.intro} /></p>
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

          {/* 커뮤니티 1단계 — 현장 이야기 (사전 승인제, 2026-09-02). 사이드 탭 "현장 이야기"가 여기로 점프 */}
          <div className={s.communitySlot}>
            <CommunityNotes targetType="program" targetId={program.id} targetLabel={program.title} />
          </div>
        </div>

        {/* Sidebar — 원문 확인을 맨 위로 (9/27). 관련 작물 55개가 위에 있어
            데스크탑 y≈4,051px·모바일 5,268px 로 밀려 있던 카드다 */}
        <div className={s.sidebar}>
          {/* 자격 셀프 체크 · 관련 작물 · 현장 이야기 — 작물·지역 상세와 같은 사이드 탭 (회장 9/28).
              숨은 패널도 hidden 으로만 감춰 SSR 링크는 유지된다(9/17 규칙). */}

          {/* Source Link */}
          <div className={s.card}>
            <div className={s.cardHeader}>
              <h2 className={s.cardTitle}>원문 확인</h2>
            </div>
            <div className={s.cardContent}>
              <ExternalLinkBlock
                href={program.sourceUrl}
                label={sourceBlockLabel(program.sourceUrl)}
                linkStatus={program.linkStatus}
                title={program.title}
              />
            </div>
          </div>

          {/* Application Timeline — asOf: 이 스냅샷을 만든 날(KST). 하이드레이션은 이 날 기준으로 서버와 같게 (10/3) */}
          <ApplicationTimeline
            applicationStart={program.applicationStart}
            applicationEnd={program.applicationEnd}
            status={program.status}
            statusLabel={statusLabel}
            applicationCycle={program.applicationCycle}
            organization={program.organization}
            asOf={kstToday()}
          />

          {/* 진단 CTA 는 sticky 탭 카드 **앞**에 — 뒤에 두면 sticky 밑으로 파고들어 안 보인다(9/17 작물 상세 동일) */}
          <PersonaCta from="program_detail" copy="내가 받을 수 있는 지원은 뭘까요?" />


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
