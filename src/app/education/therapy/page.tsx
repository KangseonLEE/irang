import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart,
  Scale,
  ListOrdered,
  BarChart3,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Info,
  FileText,
  GraduationCap,
  Award,
  Coins,
  TrendingUp,
  Sparkles,
  Building2,
  CheckCircle2,
  HelpCircle,
  Users,
  AlertTriangle,
  Quote,
  Route,
} from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { PageHeader } from "@/components/ui/page-header";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import {
  therapyTrackMap,
  type TherapyTrack,
  type TherapyTrackId,
} from "@/lib/data/therapy";
import { interviews } from "@/lib/data/landing";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "치유·사회적 농업 — 농촌 정착의 또 다른 선택지",
  description:
    "작물 생산 말고도 선택지가 있어요. 치유농업과 사회적 농업, 두 모델의 자격·수익·사례·지원사업을 한눈에 비교해 보세요.",
  keywords: [
    "치유농업",
    "사회적 농업",
    "치유농업사",
    "농업 모델",
    "농촌 정착",
    "농촌돌봄농장",
  ],
  alternates: { canonical: "/education/therapy" },
};

type TabId = "overview" | TherapyTrackId;

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "개요·비교", icon: <Scale size={14} aria-hidden="true" /> },
  { id: "healing", label: "치유농업", icon: <Heart size={14} aria-hidden="true" /> },
  { id: "social", label: "사회적 농업", icon: <Users size={14} aria-hidden="true" /> },
];

function isTabId(v: string | undefined): v is TabId {
  return v === "overview" || v === "healing" || v === "social";
}

export default async function TherapyPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab: TabId = isTabId(sp.tab) ? sp.tab : "overview";

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "정착 교육", href: "/education" },
          { name: "치유·사회적 농업", href: "/education/therapy" },
        ]}
      />
      <div className={s.page}>
        <PageHeader
          icon={<Heart size={20} />}
          label="치유·사회적 농업"
          title="다른 농촌 모델도 있어요"
          description="작물 생산 말고도 선택지가 있어요. 치유농업과 사회적 농업, 자격·수익·사례를 비교해 보세요."
        />

        <nav className={s.tabNav} aria-label="치유·사회적 농업 탭">
          {TABS.map((t) => (
            <Link
              key={t.id}
              href={t.id === "overview" ? "/education/therapy" : `/education/therapy?tab=${t.id}`}
              className={`${s.tab} ${tab === t.id ? s.tabActive : ""}`}
              aria-current={tab === t.id ? "page" : undefined}
            >
              {t.icon}
              {t.label}
            </Link>
          ))}
        </nav>

        {tab === "overview" && <OverviewTab />}
        {tab === "healing" && (
          <TrackDetail track={therapyTrackMap.get("healing")!} />
        )}
        {tab === "social" && (
          <TrackDetail track={therapyTrackMap.get("social")!} />
        )}

        {/* 페이지 푸터 — 모든 탭 공통 */}
        <div className={s.crossLinks}>
          <Link href="/guide" className={s.crossLink}>
            <div className={s.crossLinkText}>
              <span className={s.crossLinkTitle}>
                <Route size={14} aria-hidden="true" />
                농촌 정착 5단계 로드맵
              </span>
              <span className={s.crossLinkDesc}>
                정보 탐색부터 정착까지 단계별로 안내해 드려요
              </span>
            </div>
            <ChevronRight size={18} className={s.crossLinkArrow} aria-hidden="true" />
          </Link>
          <Link href="/programs" className={s.crossLink}>
            <div className={s.crossLinkText}>
              <span className={s.crossLinkTitle}>
                <FileText size={14} aria-hidden="true" />
                농촌 정착 지원사업
              </span>
              <span className={s.crossLinkDesc}>
                지원금·정책을 한눈에 확인하세요
              </span>
            </div>
            <ChevronRight size={18} className={s.crossLinkArrow} aria-hidden="true" />
          </Link>
          <Link href="/education" className={s.crossLink}>
            <div className={s.crossLinkText}>
              <span className={s.crossLinkTitle}>
                <GraduationCap size={14} aria-hidden="true" />
                정착 교육 과정
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

/* ──────────────────────────────────────────────────────────────────────────
   개요 탭 — 비교 테이블 + 모델 선택 카드
   ────────────────────────────────────────────────────────────────────────── */

function OverviewTab() {
  return (
    <div className={s.overview}>
      <section className={s.section}>
        <div className={s.sectionHead}>
          <Scale size={18} aria-hidden="true" />
          <h2 className={s.sectionTitle}>한눈 비교</h2>
        </div>
        <p className={s.sectionDesc}>
          핵심 차이를 표로 정리했어요. 더 자세한 내용은 각 탭에서 확인하세요.
        </p>

        <div className={s.compareTable}>
          <div className={s.compareHead}>
            <div>항목</div>
            <div>치유농업</div>
            <div>사회적 농업</div>
          </div>

          <CompareRow label="목적" healing="국민 건강 회복·유지·증진" social="취약계층 돌봄·교육·고용" />
          <CompareRow
            label="법적 근거"
            healing={<strong>치유농업법 (2021.03 시행)</strong>}
            social="농식품부 연례 시행지침 (별도 법률 없음)"
          />
          <CompareRow
            label="자격증"
            healing={<strong>치유농업사 2급 필수</strong>}
            social="별도 자격 없음 (농업법인 형태 필수)"
          />
          <CompareRow
            label="진입 형태"
            healing="개인·법인 모두 가능"
            social="농업법인·사회적경제·비영리법인"
          />
          <CompareRow
            label="주 대상"
            healing="아동·청소년·직장인·고령자·재활"
            social="장애·고령농·다문화·저소득·범죄피해자"
          />
          <CompareRow
            label="주 수익"
            healing="개인 체험 + 복지기관 정기 계약"
            social="국비 70 + 지방비 30 + 자체 부담"
          />
          <CompareRow
            label="지원 규모"
            healing="협업형 500만원 + 창업 3억원(융자)"
            social="연 2,000~15,500만원 (사업 5종)"
          />
          <CompareRow
            label="주관 부처"
            healing="농촌진흥청 (한국농업기술진흥원)"
            social="농림축산식품부"
          />
          <CompareRow
            label="시장 규모"
            healing="우수 시설 13→17개소 (2027 목표)"
            social="105 주체 / 14 시·도 (2023)"
          />
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHead}>
          <Sparkles size={18} aria-hidden="true" />
          <h2 className={s.sectionTitle}>어떤 모델이 나에게 맞을까요?</h2>
        </div>

        <div className={s.modelChoice}>
          <Link href="/education/therapy?tab=healing" className={s.modelCard}>
            <div className={s.modelCardHead}>
              <h3 className={s.modelCardTitle}>치유농업이 맞아요</h3>
              <ChevronRight size={20} className={s.modelCardArrow} aria-hidden="true" />
            </div>
            <p className={s.modelCardBody}>
              자격증을 취득해서 전문성을 기반으로 농장을 운영하고 싶다면, 또는 농업과 사람의
              회복을 결합하는 일에 끌린다면 치유농업이에요.
            </p>
            <div className={s.modelCardTags}>
              <span className={s.modelCardTag}>자격증 필수</span>
              <span className={s.modelCardTag}>개인 운영 가능</span>
              <span className={s.modelCardTag}>건강 회복</span>
            </div>
          </Link>

          <Link href="/education/therapy?tab=social" className={s.modelCard}>
            <div className={s.modelCardHead}>
              <h3 className={s.modelCardTitle}>사회적 농업이 맞아요</h3>
              <ChevronRight size={20} className={s.modelCardArrow} aria-hidden="true" />
            </div>
            <p className={s.modelCardBody}>
              복지·돌봄 영역에 관심이 있고 법인·조합 형태로 농장을 운영할 수 있다면, 또는 마을
              공동체 사업과 결합하고 싶다면 사회적 농업이에요.
            </p>
            <div className={s.modelCardTags}>
              <span className={s.modelCardTag}>법인 형태</span>
              <span className={s.modelCardTag}>국비 70%</span>
              <span className={s.modelCardTag}>돌봄·고용</span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

function CompareRow({
  label,
  healing,
  social,
}: {
  label: string;
  healing: React.ReactNode;
  social: React.ReactNode;
}) {
  return (
    <div className={s.compareRow}>
      <div className={s.compareLabel}>{label}</div>
      <div className={s.compareCell}>{healing}</div>
      <div className={s.compareCell}>{social}</div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   트랙 상세 (치유 / 사회적) — 12 섹션
   ────────────────────────────────────────────────────────────────────────── */

function TrackDetail({ track }: { track: TherapyTrack }) {
  // 인터뷰 cross-link — healing 카테고리만 자동 매칭 (사회적 농업은 미수집)
  // Sprint N P2-g: sourceDate 내림차순 정렬 + 최대 4건 노출
  //   사유: 사용자 가치 = 최신성 (최근 보도가 trend·신뢰도 신호).
  //   2025.11 소향미 → 2025.07 오금옥 → 2025.05 김성택 → 2024.07 김영숙 순.
  //   .slice(0, 4)로 향후 확장 시 grid 깨짐 방지 (page CSS는 4건 기준 검증됨).
  const relatedInterviews =
    track.id === "healing"
      ? interviews
          .filter((i) => i.category === "healing")
          .slice()
          .sort((a, b) => b.sourceDate.localeCompare(a.sourceDate))
          .slice(0, 4)
      : [];

  return (
    <article className={s.track} id={track.id}>
      {/* 1. Hero — 정의 */}
      <header className={s.trackHero}>
        <h2 className={s.trackTitle}>{track.title}</h2>
        <p className={s.trackSubtitle}>{track.subtitle}</p>
        <p className={s.trackDefinition}>
          <AutoGlossary text={track.definition} />
        </p>
      </header>

      {/* 2. 법적 근거 */}
      <section className={s.section}>
        <div className={s.sectionHead}>
          <Scale size={18} aria-hidden="true" />
          <h3 className={s.sectionTitle}>법적 근거</h3>
        </div>
        <p className={s.sectionDesc}>
          <AutoGlossary text={track.legalBasis} />
        </p>
      </section>

      {/* 3. 인증·자격 */}
      <section className={s.section}>
        <div className={s.sectionHead}>
          <Award size={18} aria-hidden="true" />
          <h3 className={s.sectionTitle}>
            {track.certification.hasCertification ? "인증·자격" : "신청 자격"}
          </h3>
        </div>
        <p className={s.sectionDesc}>
          <AutoGlossary text={track.certification.summary} />
        </p>
        {track.certification.details.length > 0 && (
          <div className={s.detailGrid}>
            {track.certification.details.map((d) => (
              <div key={d.label} className={s.detailItem}>
                <span className={s.detailLabel}>{d.label}</span>
                <span className={s.detailValue}>{d.value}</span>
              </div>
            ))}
          </div>
        )}
        {track.certification.eligibility && (
          <ul className={s.checklist}>
            {track.certification.eligibility.map((e, i) => (
              <li key={i} className={s.checklistItem}>
                <CheckCircle2 size={14} className={s.checklistIcon} aria-hidden="true" />
                <span>{e}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 4. 진입 경로 */}
      <section className={s.section}>
        <div className={s.sectionHead}>
          <ListOrdered size={18} aria-hidden="true" />
          <h3 className={s.sectionTitle}>진입 경로</h3>
        </div>
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

      {/* 5. 수익 모델 */}
      <section className={s.section}>
        <div className={s.sectionHead}>
          <Coins size={18} aria-hidden="true" />
          <h3 className={s.sectionTitle}>수익 모델</h3>
        </div>
        <p className={s.sectionDesc}>
          <AutoGlossary text={track.revenue.summary} />
        </p>
        <div className={s.fundingList}>
          {track.revenue.funding.map((f) => (
            <div key={f.label} className={s.fundingItem}>
              <span className={s.fundingLabel}>{f.label}</span>
              <span className={s.fundingValue}>{f.value}</span>
              <span className={s.fundingSource}>{f.source}</span>
            </div>
          ))}
        </div>
        {track.revenue.notice && (
          <p className={`${s.notice} ${s.noticeWarn}`}>
            <AlertTriangle size={14} aria-hidden="true" />
            {track.revenue.notice}
          </p>
        )}
      </section>

      {/* 6. 시장 현황 */}
      <section className={s.section}>
        <div className={s.sectionHead}>
          <TrendingUp size={18} aria-hidden="true" />
          <h3 className={s.sectionTitle}>시장 현황</h3>
        </div>
        <p className={s.sectionDesc}>
          <AutoGlossary text={track.market.trend} />
        </p>
        <div className={s.stats}>
          {track.market.indicators.map((stat, idx) => (
            <div key={idx} className={s.stat}>
              <span className={s.statValue}>{stat.value}</span>
              <span className={s.statLabel}>{stat.label}</span>
              <span className={s.statSource}>
                {stat.year} · {stat.source}
              </span>
            </div>
          ))}
        </div>
        {track.market.notice && (
          <p className={`${s.notice} ${s.noticeWarn}`}>
            <AlertTriangle size={14} aria-hidden="true" />
            {track.market.notice}
          </p>
        )}
      </section>

      {/* 7. 우수 사례 */}
      <section className={s.section}>
        <div className={s.sectionHead}>
          <Building2 size={18} aria-hidden="true" />
          <h3 className={s.sectionTitle}>우수 사례</h3>
        </div>
        <p className={s.sectionDesc}>
          농진청·KREI 인증·실증 사업장 중 대표 3건이에요.
        </p>
        <div className={s.caseList}>
          {track.cases.map((c) => (
            <div key={c.name} className={s.caseCard}>
              <div className={s.caseHead}>
                <span className={s.caseName}>{c.name}</span>
                <span className={s.caseLocation}>{c.location}</span>
              </div>
              <p className={s.caseOneLiner}>
                <AutoGlossary text={c.oneLiner} />
              </p>
              <ul className={s.caseHighlights}>
                {c.highlights.map((h, i) => (
                  <li key={i} className={s.caseHighlight}>
                    {h}
                  </li>
                ))}
              </ul>
              {c.recognition && (
                <span className={s.caseRecognition}>{c.recognition}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. 지원사업 */}
      <section className={s.section}>
        <div className={s.sectionHead}>
          <FileText size={18} aria-hidden="true" />
          <h3 className={s.sectionTitle}>핵심 지원사업</h3>
        </div>
        <div className={s.programList}>
          {track.supportPrograms.map((p) => (
            <div key={p.title} className={s.programItem}>
              <span className={s.programTitle}>{p.title}</span>
              <span className={s.programDetail}>{p.detail}</span>
              <span className={s.programSource}>{p.source}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 9. 관련 인터뷰 (cross-link 자동) */}
      <section className={s.section}>
        <div className={s.sectionHead}>
          <Quote size={18} aria-hidden="true" />
          <h3 className={s.sectionTitle}>관련 인터뷰</h3>
        </div>
        {relatedInterviews.length > 0 ? (
          <>
            <p className={s.sectionDesc}>
              치유농업 카테고리로 등재된 정착자 이야기예요.
            </p>
            <div className={s.interviewListGrid}>
              {relatedInterviews.map((p) => (
                <Link
                  key={p.id}
                  href={`/interviews/${p.id}`}
                  className={s.interviewLink}
                >
                  <div className={s.interviewLinkText}>
                    <span className={s.interviewLinkName}>
                      {p.name} · {p.region}
                    </span>
                    <span className={s.interviewLinkMeta}>
                      {p.currentJob}
                    </span>
                  </div>
                  <ChevronRight
                    size={16}
                    className={s.interviewLinkArrow}
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className={s.sectionDesc}>
              사회적 농업 정착자 이야기를 모집하고 있어요. 먼저 등재된 분들의 정착기를 살펴보세요.
            </p>
            <Link href="/interviews" className={s.interviewLink}>
              <div className={s.interviewLinkText}>
                <span className={s.interviewLinkName}>정착자 인터뷰 모음</span>
                <span className={s.interviewLinkMeta}>
                  본인 동의로 풀텍스트가 공개된 7명의 이야기예요
                </span>
              </div>
              <ChevronRight
                size={16}
                className={s.interviewLinkArrow}
                aria-hidden="true"
              />
            </Link>
          </>
        )}
      </section>

      {/* 10. 체크리스트 (accordion) */}
      <details className={`${s.section} ${s.collapsibleSection}`}>
        <summary className={s.collapsibleHead}>
          <div className={s.sectionHead}>
            <CheckCircle2 size={18} aria-hidden="true" />
            <h3 className={s.sectionTitle}>진입 전 체크리스트</h3>
          </div>
          <span className={s.collapsibleMeta}>
            {track.checklist.length}개 항목
          </span>
          <ChevronDown
            size={16}
            className={s.collapsibleChevron}
            aria-hidden="true"
          />
        </summary>
        <div className={s.collapsibleBody}>
          <p className={s.sectionDesc}>
            시작하기 전에 한 번 점검해 보세요.
          </p>
          <ul className={s.checklist}>
            {track.checklist.map((item, idx) => (
              <li key={idx} className={s.checklistItem}>
                <CheckCircle2 size={14} className={s.checklistIcon} aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </details>

      {/* 11. FAQ */}
      <section className={s.section}>
        <div className={s.sectionHead}>
          <HelpCircle size={18} aria-hidden="true" />
          <h3 className={s.sectionTitle}>자주 묻는 질문</h3>
        </div>
        <div className={s.faqList}>
          {track.faq.map((item, idx) => (
            <details
              key={idx}
              className={s.faqItem}
              open={idx === 0}
            >
              <summary className={s.faqQ}>
                <span className={s.faqQText}>{item.q}</span>
                <ChevronDown
                  size={16}
                  className={s.faqChevron}
                  aria-hidden="true"
                />
              </summary>
              <p className={s.faqA}>
                <AutoGlossary text={item.a} />
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 12. 한눈 숫자 (간단 요약) + 공식 링크 */}
      <section className={s.section}>
        <div className={s.sectionHead}>
          <BarChart3 size={18} aria-hidden="true" />
          <h3 className={s.sectionTitle}>한눈 숫자 · 공식 링크</h3>
        </div>
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
        <div className={s.officialLinks}>
          <a
            href={track.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={s.officialLink}
          >
            {track.officialUrlName}
            <ExternalLink size={14} aria-hidden="true" />
          </a>
          {track.extraLinks?.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={s.officialLink}
            >
              {link.name}
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>
    </article>
  );
}
