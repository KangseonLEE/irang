import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart,
  Scale,
  ListOrdered,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Info,
  FileText,
  GraduationCap,
} from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { PageHeader } from "@/components/ui/page-header";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { THERAPY_TRACKS } from "@/lib/data/therapy";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "치유·사회적 농업 — 귀농의 또 다른 선택지",
  description:
    "작물 생산 말고도 선택지가 있어요. 치유농업과 사회적 농업, 두 귀농 모델의 정의·법적 근거·진입 경로를 정리했어요.",
  keywords: ["치유농업", "사회적 농업", "귀농 모델", "치유농업사", "사회적 농업가"],
  alternates: { canonical: "/education/therapy" },
};

export default function TherapyPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "귀농 교육", href: "/education" },
          { name: "치유·사회적 농업", href: "/education/therapy" },
        ]}
      />
      <div className={s.page}>
        <PageHeader
          icon={<Heart size={20} />}
          label="치유·사회적 농업"
          title="다른 귀농 모델도 있어요"
          description="작물 생산 말고도 선택지가 있어요. 치유농업과 사회적 농업, 두 모델을 한눈에 비교해 보세요."
        />

        <div className={s.trackList}>
          {THERAPY_TRACKS.map((track) => (
            <article key={track.id} id={track.id} className={s.track}>
              <header className={s.trackHead}>
                <h2 className={s.trackTitle}>{track.title}</h2>
                <p className={s.trackSubtitle}>{track.subtitle}</p>
              </header>

              <p className={s.definition}>
                <AutoGlossary text={track.definition} />
              </p>

              <section className={s.section}>
                <h3 className={s.sectionTitle}>
                  <Scale size={14} aria-hidden="true" />
                  법적 근거
                </h3>
                <p className={s.sectionBody}>
                  <AutoGlossary text={track.legalBasis} />
                </p>
              </section>

              <section className={s.section}>
                <h3 className={s.sectionTitle}>
                  <ListOrdered size={14} aria-hidden="true" />
                  진입 경로
                </h3>
                <ol className={s.steps}>
                  {track.entryPath.map((step, idx) => (
                    <li key={idx} className={s.step}>
                      <span className={s.stepNum} aria-hidden="true">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </section>

              <section className={s.section}>
                <h3 className={s.sectionTitle}>
                  <BarChart3 size={14} aria-hidden="true" />
                  한눈에 보는 숫자
                </h3>
                <div className={s.stats}>
                  {track.stats.slice(0, 3).map((stat, idx) => (
                    <div key={idx} className={s.stat}>
                      <span className={s.statValue}>{stat.value}</span>
                      <span className={s.statLabel}>{stat.label}</span>
                      <span className={s.statSource}>
                        {stat.year} · {stat.source}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <a
                href={track.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={s.officialLink}
              >
                {track.officialUrlName}
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>

        <div className={s.crossLinks}>
          <Link href="/programs" className={s.crossLink}>
            <div className={s.crossLinkText}>
              <span className={s.crossLinkTitle}>
                <FileText size={14} aria-hidden="true" />
                귀농 지원사업 보기
              </span>
              <span className={s.crossLinkDesc}>
                지원금·정책 한눈에 확인하세요
              </span>
            </div>
            <ChevronRight size={18} className={s.crossLinkArrow} aria-hidden="true" />
          </Link>
          <Link href="/education" className={s.crossLink}>
            <div className={s.crossLinkText}>
              <span className={s.crossLinkTitle}>
                <GraduationCap size={14} aria-hidden="true" />
                귀농 교육 과정 보기
              </span>
              <span className={s.crossLinkDesc}>
                온·오프라인 교육을 지역별로 찾아보세요
              </span>
            </div>
            <ChevronRight size={18} className={s.crossLinkArrow} aria-hidden="true" />
          </Link>
        </div>

        <p className={s.notice}>
          <Info size={14} aria-hidden="true" />
          정부 지침은 매년 바뀌어요. 최신 공고는 공식 포털에서 확인하세요.
        </p>
      </div>
    </>
  );
}
