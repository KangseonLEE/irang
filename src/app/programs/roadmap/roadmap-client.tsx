"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
   프로그램 선택 탭 (히어로 아래, 콘텐츠 영역 내 sticky)
   ========================================================================== */

function ProgramNav({
  activeTab,
  onChange,
}: {
  activeTab: string;
  onChange: (id: string) => void;
}) {
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const active = inner.querySelector<HTMLElement>('[aria-current="page"]');
    if (active) {
      active.scrollIntoView({ inline: "center", block: "nearest", behavior: "instant" });
    }
  }, [activeTab]);

  return (
    <nav className={s.programNav} aria-label="정부사업 선택">
      <div ref={innerRef} className={s.programNavInner}>
        {GOV_PROGRAMS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={`${s.programTab} ${p.id === activeTab ? s.programTabActive : ""}`}
            aria-current={p.id === activeTab ? "page" : undefined}
          >
            {p.shortName}
          </button>
        ))}
      </div>
    </nav>
  );
}

/* ==========================================================================
   섹션 사이드바 — 모바일: 가로 sticky | 데스크탑: 세로 sidebar sticky
   IntersectionObserver로 현재 섹션 추적
   ========================================================================== */

function SectionSidebar({
  program,
  hasYouthCases = false,
}: {
  program: GovProgramRoadmap;
  hasYouthCases?: boolean;
}) {
  const [activeSection, setActiveSection] = useState("summary");
  const sectionNav = getSectionNav(program, hasYouthCases);

  useEffect(() => {
    const sectionIds = sectionNav.map((n) => `${n.id}-${program.id}`);
    const visibleSet = new Set<string>();

    /* sticky 높이(GNB + 프로그램탭) 아래부터, 뷰포트 상단 35%만 감지 영역 */
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSet.add(entry.target.id);
          } else {
            visibleSet.delete(entry.target.id);
          }
        });

        /* 현재 보이는 섹션 중 DOM 순서가 가장 빠른(= 가장 위) 것을 활성 */
        for (let i = 0; i < sectionIds.length; i++) {
          if (visibleSet.has(sectionIds[i])) {
            setActiveSection(sectionNav[i].id);
            return;
          }
        }
      },
      { rootMargin: "-112px 0px -65% 0px", threshold: 0 },
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
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
    <nav className={s.sidebar} aria-label="섹션 바로가기">
      {sectionNav.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`${s.sidebarItem} ${activeSection === item.id ? s.sidebarActive : ""}`}
          onClick={() => handleClick(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

/* ==========================================================================
   RoadmapClient — 프로그램 탭 + 사이드바 + 콘텐츠 통합
   ========================================================================== */

interface RoadmapClientProps {
  activeTab: string;
  youthCases?: YouthCaseCard[];
}

export function RoadmapClient({
  activeTab: initialTab,
  youthCases = [],
}: RoadmapClientProps) {
  /* ── client-side 탭 state ──
     이전 패턴: <Link> 클릭 → URL 변경 → page.tsx 전체 re-execute (RSC payload
     fetch + hydration) → 매 탭 전환마다 수백 ms 지연.
     변경: 탭은 client state로만 즉시 갱신, URL은 history.replaceState로
     sync. youthCases는 첫 SSR 시점에 한 번만 fetch. */
  const [activeTab, setActiveTab] = useState(initialTab);
  const program = GOV_PROGRAMS.find((p) => p.id === activeTab) ?? GOV_PROGRAMS[0];
  const programYouthCases = program.id === "youth-startup" ? youthCases : [];

  const handleTabChange = useCallback((id: string) => {
    setActiveTab(id);
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", `/programs/roadmap?tab=${id}`);
    }
  }, []);

  // 탭 변경 시 사업 타이틀(.summaryCard)이 sticky 탭 바로 아래에 보이도록
  // 자동 스크롤. 첫 마운트(URL 직접 진입)에는 스크롤 안 함.
  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    const target = document.getElementById(`summary-${activeTab}`);
    if (!target) return;
    // sticky GNB(56px) + 프로그램 탭바(약 50px) + 여유 8px
    const stickyOffset = 56 + 50 + 8;
    const top =
      target.getBoundingClientRect().top + window.scrollY - stickyOffset;
    window.scrollTo({ top, behavior: "smooth" });
  }, [activeTab]);

  return (
    <>
      <ProgramNav activeTab={activeTab} onChange={handleTabChange} />
      <div className={s.contentLayout}>
        <SectionSidebar program={program} hasYouthCases={programYouthCases.length > 0} />
        <ProgramContent
          key={program.id}
          program={program}
          youthCases={programYouthCases}
        />
      </div>
    </>
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
      className={s.contentMain}
    >
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
