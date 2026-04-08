"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Star,
  FileText,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Users,
  Calendar,
  Coins,
  Layers,
} from "lucide-react";
import { GOV_PROGRAMS, type GovProgramRoadmap } from "@/lib/data/gov-roadmap";
import s from "./page.module.css";

/* ==========================================================================
   RoadmapClient — 탭 전환 + 사업별 콘텐츠 렌더링
   ========================================================================== */

export function RoadmapClient() {
  const [activeId, setActiveId] = useState(GOV_PROGRAMS[0].id);
  const program = GOV_PROGRAMS.find((p) => p.id === activeId) ?? GOV_PROGRAMS[0];

  return (
    <>
      {/* ── 사업 탭 ── */}
      <div className={s.tabs} role="tablist" aria-label="정부사업 선택">
        {GOV_PROGRAMS.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              role="tab"
              aria-selected={p.id === activeId}
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
      <ProgramContent key={program.id} program={program} />
    </>
  );
}

/* ── 개별 사업 콘텐츠 ── */
function ProgramContent({ program }: { program: GovProgramRoadmap }) {
  const Icon = program.icon;

  return (
    <>
      {/* 요약 카드 */}
      <div className={s.summaryCard}>
        <div className={s.summaryHeader}>
          <div className={s.summaryIcon}>
            <Icon size={22} />
          </div>
          <div className={s.summaryTitleGroup}>
            <h2 className={s.summaryName}>{program.name}</h2>
            <p className={s.summaryAgency}>{program.agency}</p>
          </div>
        </div>
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
          <span className={s.metaBadge}>
            <Calendar size={13} />
            {program.applicationPeriod.typical}
          </span>
        </div>
      </div>

      {/* 자격 요건 */}
      <section className={s.section}>
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
              >
                {item.required ? "✓" : "★"}
              </span>
              <div className={s.eligibilityContent}>
                <p className={s.eligibilityLabel}>
                  {item.label}
                  {!item.required && (
                    <span style={{ fontWeight: 500, color: "#a16207", marginLeft: 6, fontSize: "0.6875rem" }}>
                      우대
                    </span>
                  )}
                </p>
                <p className={s.eligibilityDetail}>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 신청 절차 */}
      <section className={s.section}>
        <h3 className={s.sectionTitle}>
          <ArrowRight size={20} />
          신청 절차
        </h3>
        <div className={s.stepsTimeline}>
          {program.steps.map((step) => (
            <div key={step.order} className={s.stepItem}>
              <span className={s.stepNumber}>{step.order}</span>
              <div className={s.stepBody}>
                <div className={s.stepHeader}>
                  <h4 className={s.stepTitle}>{step.title}</h4>
                  <span className={s.stepDuration}>{step.duration}</span>
                </div>
                <p className={s.stepDesc}>{step.description}</p>
                {step.tips && step.tips.length > 0 && (
                  <div className={s.stepTips}>
                    {step.tips.map((tip, i) => (
                      <p key={i} className={s.stepTip}>{tip}</p>
                    ))}
                  </div>
                )}
                {step.documents && step.documents.length > 0 && (
                  <div className={s.stepDocs}>
                    {step.documents.map((doc, i) => (
                      <span key={i} className={s.stepDocTag}>{doc}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 필요 서류 */}
      <section className={s.section}>
        <h3 className={s.sectionTitle}>
          <FileText size={20} />
          필요 서류
        </h3>
        <div className={s.docsList}>
          {program.requiredDocuments.map((doc, i) => (
            <div key={i} className={s.docItem}>
              <FileText size={14} />
              <span>{doc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 선정 후 의무사항 */}
      <section className={s.section}>
        <h3 className={s.sectionTitle}>
          <ShieldAlert size={20} />
          선정 후 의무사항
        </h3>
        <div className={s.obligationsList}>
          {program.obligations.map((item, i) => (
            <div key={i} className={s.obligationItem}>
              <AlertTriangle size={14} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 주의사항 */}
      <div className={s.cautionCard}>
        <AlertTriangle size={18} />
        <p className={s.cautionText}>{program.caution}</p>
      </div>

      {/* 농지은행 세부사업 (해당 시) */}
      {program.subPrograms && program.subPrograms.length > 0 && (
        <section className={s.section}>
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
    </>
  );
}
