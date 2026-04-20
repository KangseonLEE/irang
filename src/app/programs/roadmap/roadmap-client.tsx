"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  FileText,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Users,
  Calendar,
  Coins,
  Layers,
  Lightbulb,
  Banknote,
} from "lucide-react";
import { GOV_PROGRAMS, type GovProgramRoadmap } from "@/lib/data/gov-roadmap";
import { SupportTypeBadge } from "@/components/ui/support-type-badge";
import { YouthCaseCards } from "@/components/youth-cases/youth-case-cards";
import type { YouthCaseCard } from "@/lib/api/rda-youth";
import s from "./page.module.css";

/* ── 섹션 점프 내비 정의 ── */
const BASE_SECTIONS = [
  { id: "summary", label: "요약" },
  { id: "eligibility", label: "자격 요건" },
  { id: "steps", label: "신청 절차" },
  { id: "obligations", label: "유의사항" },
];

/** 세부사업·청년사례 탭을 동적 추가 */
function getSectionNav(program: GovProgramRoadmap, hasYouthCases = false) {
  const nav = [...BASE_SECTIONS];
  if (program.subPrograms && program.subPrograms.length > 0) {
    // "유의사항" 앞에 "세부사업" 삽입
    nav.splice(3, 0, { id: "subprograms", label: "세부사업" });
  }
  if (hasYouthCases) {
    nav.push({ id: "youth-cases", label: "청년농 사례" });
  }
  return nav;
}

/* ==========================================================================
   RoadmapClient — 탭 전환 + 사업별 콘텐츠 렌더링
   ========================================================================== */

interface RoadmapClientProps {
  youthCases?: YouthCaseCard[];
}

export function RoadmapClient({ youthCases = [] }: RoadmapClientProps) {
  const [activeId, setActiveId] = useState(GOV_PROGRAMS[0].id);
  const program = GOV_PROGRAMS.find((p) => p.id === activeId) ?? GOV_PROGRAMS[0];

  /* URL 해시로 탭 초기 선택 (랜딩 카드 → #forest-village 등) */
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const match = GOV_PROGRAMS.find((p) => p.id === hash);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (match) setActiveId(match.id);
    }
  }, []);

  return (
    <>
      {/* ── 사업 탭 ── */}
      <div className={s.tabs} role="tablist" aria-label="정부사업 선택">
        {GOV_PROGRAMS.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              id={`tab-${p.id}`}
              role="tab"
              aria-selected={p.id === activeId}
              aria-controls={`panel-${p.id}`}
              className={`${s.tab} ${p.id === activeId ? s.tabActive : ""}`}
              onClick={() => setActiveId(p.id)}
            >
              <Icon size={16} />
              {p.shortName}
            </button>
          );
        })}
      </div>

      {/* ── 사업 콘텐츠 ── */}
      <ProgramContent
        key={program.id}
        program={program}
        youthCases={program.id === "youth-startup" ? youthCases : []}
      />
    </>
  );
}

/* ── Sticky 섹션 점프 내비 ── */
function SectionJumpNav({
  program,
  hasYouthCases = false,
}: {
  program: GovProgramRoadmap;
  hasYouthCases?: boolean;
}) {
  const [activeSection, setActiveSection] = useState("summary");
  const sectionNav = getSectionNav(program, hasYouthCases);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const sectionIds = sectionNav.map((n) => `${n.id}-${program.id}`);

    sectionIds.forEach((id, idx) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(sectionNav[idx].id);
          }
        },
        { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [program.id, sectionNav]);

  const handleClick = useCallback(
    (sectionId: string) => {
      const el = document.getElementById(`${sectionId}-${program.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [program.id],
  );

  return (
    <nav className={s.sectionNav} aria-label="섹션 바로가기">
      {sectionNav.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`${s.sectionNavItem} ${activeSection === item.id ? s.sectionNavActive : ""}`}
          onClick={() => handleClick(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

/* ── 개별 사업 콘텐츠 ── */
function ProgramContent({
  program,
  youthCases = [],
}: {
  program: GovProgramRoadmap;
  youthCases?: YouthCaseCard[];
}) {
  return (
    <div
      role="tabpanel"
      id={`panel-${program.id}`}
      aria-labelledby={`tab-${program.id}`}
      className={s.tabPanel}
    >
      {/* 섹션 점프 내비 */}
      <SectionJumpNav program={program} hasYouthCases={youthCases.length > 0} />

      {/* 요약 */}
      <div id={`summary-${program.id}`} className={s.summaryCard}>
        <div className={s.summaryTitleGroup}>
          <h2 className={s.summaryName}>{program.name}</h2>
          <p className={s.summaryAgency}>{program.agency}</p>
        </div>
        <hr className={s.summarySeparator} />
        <p className={s.summaryDesc}>{program.summary}</p>
        <div className={s.summaryMeta}>
          <span className={s.metaBadge}>
            <Users size={13} />
            {program.targetAudience}
          </span>
          <span className={s.metaBadge}>
            <Coins size={13} />
            {program.supportAmount}
          </span>
          <SupportTypeBadge
            type={program.supportType}
            variant="meta"
            icon={<Banknote size={13} />}
          />
          <span className={s.metaBadge}>
            <Calendar size={13} />
            {program.applicationPeriod.typical}
          </span>
        </div>
      </div>

      {/* 자격 요건 */}
      <section id={`eligibility-${program.id}`} className={s.section}>
        <h3 className={s.sectionTitle}>
          <CheckCircle2 size={20} />
          자격 요건
        </h3>
        <div className={s.eligibilityList}>
          {program.eligibility.map((item, i) => (
            <div key={i} className={s.eligibilityItem}>
              <span
                className={`${s.eligibilityBadge} ${
                  item.required ? s.eligibilityRequired : s.eligibilityOptional
                }`}
                aria-label={item.required ? "필수 조건" : "우대 조건"}
              >
                {item.required ? "✓" : "★"}
              </span>
              <div className={s.eligibilityContent}>
                <p className={s.eligibilityLabel}>
                  {item.label}
                  {!item.required && (
                    <span className={s.eligibilityUdae}>우대</span>
                  )}
                </p>
                <p className={s.eligibilityDetail}>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 핵심 의무사항 미리보기 — 자격 요건 직후, 신청 절차 전 */}
      {program.obligations.length > 0 && (
        <div className={s.obligationsPreview}>
          <p className={s.obligationsPreviewTitle}>
            <ShieldAlert size={15} />
            이것만은 꼭 확인하세요
          </p>
          <ul className={s.obligationsPreviewList}>
            {program.obligations.slice(0, 2).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 신청 절차 */}
      <section id={`steps-${program.id}`} className={s.section}>
        <h3 className={s.sectionTitle}>
          <ArrowRight size={20} />
          신청 절차
        </h3>
        <div className={s.stepsTimeline}>
          {program.steps.map((step, stepIdx) => (
            <div key={step.order} className={s.stepItem}>
              <span className={s.stepNumber}>{step.order}</span>
              <div className={s.stepBody}>
                <div className={s.stepHeader}>
                  <h4 className={s.stepTitle}>{step.title}</h4>
                  <span className={s.stepDuration}>{step.duration}</span>
                </div>
                <p className={s.stepDesc}>{step.description}</p>
                {step.tips && step.tips.length > 0 && (
                  <details className={s.stepTipsDetails} open={stepIdx === 0 || undefined}>
                    <summary className={s.stepTipsSummary}>
                      <Lightbulb size={13} />
                      팁 {step.tips.length}건
                    </summary>
                    <ul className={s.stepTips}>
                      {step.tips.map((tip, i) => (
                        <li key={i} className={s.stepTip}>{tip}</li>
                      ))}
                    </ul>
                  </details>
                )}
                {step.documents && step.documents.length > 0 && (
                  <details className={s.stepDocsDetails}>
                    <summary className={s.stepDocsSummary}>
                      <FileText size={13} />
                      필요 서류 {step.documents.length}건
                    </summary>
                    <div className={s.stepDocs}>
                      {step.documents.map((doc, i) => (
                        <span key={i} className={s.stepDocTag}>{doc}</span>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 외부 신청 포털 바로가기 — 신청 절차 직후 */}
        {program.relatedLinks.filter((l) => l.external).length > 0 && (
          <div className={s.stepsPortalLinks}>
            {program.relatedLinks
              .filter((l) => l.external)
              .map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.stepsPortalLink}
                >
                  <ExternalLink size={14} />
                  {link.label} 바로가기
                </a>
              ))}
          </div>
        )}
      </section>

      {/* 유의사항 (의무사항 + 주의사항 통합) */}
      <section id={`obligations-${program.id}`} className={s.section}>
        <h3 className={s.sectionTitle}>
          <ShieldAlert size={20} />
          유의사항
        </h3>
        <div className={s.obligationsList}>
          {program.obligations.map((item, i) => (
            <div key={i} className={s.obligationItem}>
              <AlertTriangle size={14} />
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div className={s.cautionCard}>
          <AlertTriangle size={18} />
          <p className={s.cautionText}>{program.caution}</p>
        </div>
      </section>

      {/* 농지은행 세부사업 (해당 시) */}
      {program.subPrograms && program.subPrograms.length > 0 && (
        <section id={`subprograms-${program.id}`} className={s.section}>
          <h3 className={s.sectionTitle}>
            <Layers size={20} />
            세부사업 분류
          </h3>
          <div className={s.subProgramsGrid}>
            {program.subPrograms.map((sub, i) => (
              <div key={i} className={s.subProgramCard}>
                <h4 className={s.subProgramName}>{sub.name}</h4>
                <p className={s.subProgramTarget}>{sub.target}</p>
                <p className={s.subProgramSupport}>{sub.support}</p>
                <div className={s.subProgramConditions}>
                  {sub.conditions.map((cond, j) => (
                    <span key={j} className={s.conditionTag}>{cond}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 청년농 성공 사례 (청년창업농 탭 전용) */}
      {youthCases.length > 0 && (
        <section id={`youth-cases-${program.id}`} className={s.section}>
          <YouthCaseCards
            cases={youthCases}
            title="청년농 성공 사례"
            description="실제로 영농에 정착한 청년들의 이야기예요"
            inline
          />
        </section>
      )}

      {/* 관련 링크 */}
      <section className={s.section}>
        <div className={s.relatedLinks}>
          {program.relatedLinks.map((link, i) =>
            link.external ? (
              <a
                key={i}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${s.relatedLink} ${s.externalLink}`}
              >
                {link.label}
                <ExternalLink size={12} />
              </a>
            ) : (
              <Link key={i} href={link.href} className={s.relatedLink}>
                {link.label}
                <ArrowRight size={12} />
              </Link>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
