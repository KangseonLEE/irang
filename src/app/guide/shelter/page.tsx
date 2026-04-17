import type { Metadata } from "next";
import Link from "next/link";
import {
  Home,
  Ruler,
  MapPin,
  Plus,
  Square,
  Clock,
  FileCheck,
  AlertTriangle,
  ArrowRightLeft,
  ExternalLink,
} from "lucide-react";
import { SubPageHero } from "@/components/ui/sub-page-hero";
import {
  SHELTER_SUMMARY,
  SHELTER_EFFECTIVE_DATE,
  SHELTER_RULES,
  SHELTER_SOURCES,
  SHELTER_VS_FARMSHED,
  SHELTER_CONVERSION,
  SHELTER_UNVERIFIED,
} from "@/lib/data/shelter";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "농촌체류형 쉼터 가이드 | 이랑",
  description:
    "농지에 33㎡ 이하 임시 주거를 설치할 수 있는 농촌체류형 쉼터 제도(2024-12-24 시행)를 공식 출처 기반으로 정리했어요.",
};

export const revalidate = 86400;

const RULE_ICONS: Record<string, typeof Home> = {
  size: Ruler,
  location: MapPin,
  attached: Plus,
  area: Square,
  duration: Clock,
  registration: FileCheck,
};

export default function ShelterGuidePage() {
  return (
    <div className={s.page}>
      <SubPageHero
        variant="flat"
        overline="농촌체류형 쉼터"
        icon={Home}
        title="농지에 집 대신 쉼터, 어떻게 설치할까요?"
        description={SHELTER_SUMMARY}
      >
        <span className={s.effectiveBadge}>
          시행 {SHELTER_EFFECTIVE_DATE}
        </span>
      </SubPageHero>

      {/* ── 미확정 안내 (최상단에 배치 — 사용자 인지 최우선) ── */}
      <aside className={s.unverified} aria-label="확인 필요 사항">
        <div className={s.unverifiedHead}>
          <AlertTriangle
            size={16}
            className={s.unverifiedIcon}
            strokeWidth={2}
          />
          <h2 className={s.unverifiedTitle}>먼저 읽어주세요 — 확인 필요 항목</h2>
        </div>
        <p className={s.unverifiedLead}>
          아래 내용은 농식품부·정책브리핑·국가법령정보센터 공식 자료로 확인한
          범위예요. 다만 공식 원문에서 직접 확인하지 못한 항목이 있어요. 실제
          설치 전에 관할 시·군 허가부서에서 최종 확인하세요.
        </p>
        <ul className={s.unverifiedList}>
          {SHELTER_UNVERIFIED.map((item) => (
            <li key={item.id} className={s.unverifiedItem}>
              <span className={s.unverifiedLabel}>{item.label}</span>
              <span className={s.unverifiedNote}>{item.note}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* ── 핵심 규정 ── */}
      <section className={s.section} aria-labelledby="rules-title">
        <div className={s.sectionHead}>
          <FileCheck
            size={18}
            className={s.sectionIcon}
            strokeWidth={2}
          />
          <h2 id="rules-title" className={s.sectionTitle}>
            핵심 규정 6가지
          </h2>
        </div>
        <div className={s.ruleList}>
          {SHELTER_RULES.map((rule) => {
            const Icon = RULE_ICONS[rule.id] ?? FileCheck;
            return (
              <article key={rule.id} className={s.ruleCard}>
                <h3 className={s.ruleTitle}>
                  <Icon
                    size={14}
                    strokeWidth={2}
                    style={{
                      display: "inline",
                      verticalAlign: "-2px",
                      marginRight: 6,
                      color: "var(--primary, #1b6b5a)",
                    }}
                  />
                  {rule.title}
                </h3>
                <p className={s.ruleDesc}>{rule.description}</p>
                {rule.quote && (
                  <p className={s.ruleQuote}>“{rule.quote}”</p>
                )}
                <div className={s.ruleSources}>
                  {rule.sourceIds.map((sid) => {
                    const src = SHELTER_SOURCES[sid];
                    if (!src) return null;
                    return (
                      <a
                        key={sid}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={s.sourcePill}
                        title={src.label}
                      >
                        <ExternalLink size={10} strokeWidth={2} />
                        {src.label.split(" — ")[0]}
                      </a>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── 쉼터 vs 농막 비교 ── */}
      <section className={s.section} aria-labelledby="compare-title">
        <div className={s.sectionHead}>
          <ArrowRightLeft
            size={18}
            className={s.sectionIcon}
            strokeWidth={2}
          />
          <h2 id="compare-title" className={s.sectionTitle}>
            쉼터 vs 농막, 뭐가 다를까요?
          </h2>
        </div>
        <div className={s.compareWrap}>
          <table className={s.compareTable}>
            <thead>
              <tr>
                <th scope="col">구분</th>
                <th scope="col">농촌체류형 쉼터</th>
                <th scope="col">농막 (기존)</th>
              </tr>
            </thead>
            <tbody>
              {SHELTER_VS_FARMSHED.map((row) => (
                <tr key={row.field}>
                  <th scope="row">{row.field}</th>
                  <td>{row.shelter}</td>
                  <td>{row.farmShed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 농막 → 쉼터 전환 ── */}
      <section className={s.section} aria-labelledby="convert-title">
        <div className={s.sectionHead}>
          <ArrowRightLeft
            size={18}
            className={s.sectionIcon}
            strokeWidth={2}
          />
          <h2 id="convert-title" className={s.sectionTitle}>
            기존 농막을 쉼터로 전환하려면?
          </h2>
        </div>
        <div className={s.conversionCard}>
          <FileCheck
            size={20}
            className={s.conversionIcon}
            strokeWidth={2}
          />
          <div className={s.conversionText}>
            <span className={s.conversionWindow}>
              신고 가능 기간: {SHELTER_CONVERSION.window}
            </span>
            <p className={s.conversionDesc}>{SHELTER_CONVERSION.condition}</p>
          </div>
        </div>
      </section>

      {/* ── 공식 출처 목록 ── */}
      <section className={s.sourceList} aria-label="공식 출처">
        <h2 className={s.sourceListTitle}>공식 출처 (확인일 2026-04-15)</h2>
        {Object.values(SHELTER_SOURCES).map((src) => (
          <a
            key={src.url}
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className={s.sourceListLink}
          >
            <ExternalLink size={11} strokeWidth={2} />
            {src.label}
            <span className={s.sourceMeta}>· {src.verified}</span>
          </a>
        ))}
      </section>

      <nav aria-label="관련 가이드" className={s.crossLinks}>
        <Link href="/guide" className={s.crossLink}>
          귀농 5단계 로드맵
        </Link>
        <Link href="/guide/track-compare" className={s.crossLink}>
          귀농·귀산촌 비교
        </Link>
        <Link href="/programs" className={s.crossLink}>
          전체 지원사업
        </Link>
      </nav>
    </div>
  );
}
