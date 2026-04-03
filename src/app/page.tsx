import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  FileText,
  Sprout,
  ExternalLink,
  TrendingUp,
  Database,
  Search,
} from "lucide-react";
import SearchGroup from "@/components/search/search-group";
import {
  dataSources,
  trendStats,
  trendReasons,
  trendNews,
  popularRegions,
  popularCrops,
  hotPrograms,
} from "@/lib/data/landing";
import s from "./page.module.css";

/* ── 히어로 인기 지역 칩 데이터 ── */
const HERO_QUICK_REGIONS = [
  { label: "전남", href: "/regions/jeonnam" },
  { label: "강원", href: "/regions/gangwon" },
  { label: "경북", href: "/regions/gyeongbuk" },
  { label: "충남", href: "/regions/chungnam" },
  { label: "제주", href: "/regions/jeju" },
];

/* ────────────────────────────────────────────
   Page
   ──────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className={s.page}>
      {/* ═══ 히어로 — 검색 중심 ═══ */}
      <section className={s.heroSection} aria-label="검색">
        <span className={s.heroEyebrow}>나의 귀농 첫걸음</span>

        <h1 className={s.heroTitle}>
          막연했던 귀농,
          <br />
          <span className={s.heroAccent}>이랑</span>에서 구체적인 계획이 됩니다
        </h1>

        <p className={s.heroSubtitle}>
          5개 공공기관 데이터 기반, 내 조건에 맞는 귀농 정보를 찾아보세요.
        </p>

        <div className={s.heroSearchWrap}>
          <Suspense fallback={<div className={s.searchFallback} />}>
            <SearchGroup size="large" placeholder="관심 지역이나 작물을 검색해 보세요" />
          </Suspense>
        </div>

        {/* 인기 지역 바로가기 */}
        <div className={s.heroQuickLinks}>
          <span className={s.heroQuickLabel}>인기 지역</span>
          {HERO_QUICK_REGIONS.map((r) => (
            <Link key={r.label} href={r.href} className={s.heroQuickChip}>
              {r.label}
            </Link>
          ))}
        </div>

        {/* 데이터 신뢰 지표 */}
        <p className={s.heroTrust}>
          <Database size={12} aria-hidden="true" />
          기상청 · 통계청 · 심평원 · 교육부 · 농진청 공공데이터 기반
        </p>
      </section>

      {/* ═══ 벤토 카드 — 실제 데이터 미리보기 ═══ */}
      <h2 className={s.sectionTitle}>이랑이 정리한 귀농 데이터</h2>
      <section className={s.bentoGrid} aria-label="주요 서비스">
        {/* 지역 탐색 */}
        <div className={s.bentoCard}>
          <div className={s.bentoHeader}>
            <MapPin size={16} className={s.bentoHeaderIcon} />
            <span className={s.bentoName}>인기 지역</span>
          </div>
          <div className={s.bentoPreviewList}>
            {popularRegions.map((r) => (
              <Link
                key={r.provinceId}
                href={`/regions/${r.provinceId}`}
                className={s.bentoPreviewItem}
              >
                <div className={s.previewMain}>
                  <span className={s.previewName}>{r.name}</span>
                  <span className={s.previewSub}>{r.climate}</span>
                </div>
                <span className={s.previewDetail}>{r.highlight}</span>
              </Link>
            ))}
          </div>
          <Link href="/regions" className={s.bentoMore}>
            13개 지역 모두 보기
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* 작물 정보 */}
        <div className={s.bentoCard}>
          <div className={s.bentoHeader}>
            <Sprout size={16} className={s.bentoHeaderIcon} />
            <span className={s.bentoName}>인기 작물</span>
          </div>
          <div className={s.bentoPreviewList}>
            {popularCrops.map((c) => (
              <Link
                key={c.id}
                href={`/crops/${c.id}`}
                className={s.bentoPreviewItem}
              >
                <span className={s.previewEmoji}>{c.emoji}</span>
                <div className={s.previewMain}>
                  <span className={s.previewName}>{c.name}</span>
                  <span className={s.previewSub}>
                    재배 난이도 {c.difficulty} · 수확기 {c.season}
                  </span>
                </div>
                <span className={s.previewBadge}>{c.badge}</span>
              </Link>
            ))}
          </div>
          <Link href="/crops" className={s.bentoMore}>
            17종 작물 모두 보기
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* 지원사업 */}
        <div className={s.bentoCard}>
          <div className={s.bentoHeader}>
            <FileText size={16} className={s.bentoHeaderIcon} />
            <span className={s.bentoName}>모집중 지원사업</span>
          </div>
          <div className={s.bentoProgramList}>
            {hotPrograms.map((p) => (
              <Link
                key={p.id}
                href={`/programs/${p.id}`}
                className={s.bentoProgramItem}
              >
                <span className={s.programTitle}>{p.title}</span>
                <span className={s.programMeta}>
                  {p.region} · {p.type} · {p.amount}
                </span>
                <span className={s.programTag}>{p.tag}</span>
              </Link>
            ))}
          </div>
          <Link href="/programs" className={s.bentoMore}>
            전체 지원사업 보기
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ═══ 귀농 트렌드 섹션 ═══ */}
      <section className={s.trendSection} aria-label="귀농 트렌드">
        <h2 className={s.trendTitle}>
          <TrendingUp size={18} className={s.trendTitleIcon} />
          숫자로 보는 귀농 트렌드
        </h2>
        <p className={s.trendSub}>
          2024년 귀농귀촌인통계 기준, 농촌으로 향하는 사람들이 늘고 있습니다.
        </p>

        {/* 핵심 숫자 3개 */}
        <div className={s.trendStatsGrid}>
          {trendStats.map((stat) => (
            <div key={stat.label} className={s.trendStatCard}>
              <span className={s.trendEmoji} aria-hidden="true">
                {stat.emoji}
              </span>
              <span className={s.trendValue}>{stat.value}</span>
              <span className={s.trendLabel}>{stat.label}</span>
              <span className={s.trendStatSub}>{stat.sub}</span>
            </div>
          ))}
        </div>

        {/* 귀농 이유 */}
        <div className={s.reasonsCard}>
          <h3 className={s.reasonsTitle}>귀농을 선택한 이유</h3>
          <div className={s.reasonsList}>
            {trendReasons.map((r) => (
              <div key={r.label} className={s.reasonRow}>
                <span className={s.reasonLabel}>{r.label}</span>
                <div className={s.reasonBarWrap}>
                  <div
                    className={s.reasonBar}
                    style={{ width: `${r.pct * 3}%` }}
                  />
                </div>
                <span className={s.reasonPct}>{r.pct}%</span>
              </div>
            ))}
          </div>
          <p className={s.reasonSource}>
            출처: 농림축산식품부 귀농귀촌 실태조사
          </p>
        </div>

        {/* 관련 뉴스 */}
        <div className={s.newsCard}>
          <h3 className={s.newsTitle}>관련 뉴스</h3>
          <div className={s.newsList}>
            {trendNews.map((news) => (
              <a
                key={news.url}
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className={s.newsItem}
              >
                <span className={s.newsItemTitle}>{news.title}</span>
                <span className={s.newsItemMeta}>
                  {news.source} · {news.date}
                  <ExternalLink size={12} />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 데이터 출처 스트립 (컴팩트) ═══ */}
      <h2 className={s.sectionTitle}>공공데이터로 만들었습니다</h2>
      <section className={s.sourcesStrip} aria-label="데이터 출처">
        <div className={s.sourcesStripHeader}>
          <Database size={14} />
          <span>
            5개 공공 기관 데이터 · 매일 자동 업데이트
          </span>
        </div>
        <div className={s.sourcesStripList}>
          {dataSources.map((src) => (
            <Link
              key={src.code}
              href={src.link}
              className={s.sourcesStripTag}
              title={src.description}
            >
              {src.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ CTA 배너 ═══ */}
      <section className={s.ctaBanner} aria-label="시작하기">
        <div className={s.ctaBannerText}>
          <h2 className={s.ctaBannerTitle}>
            나에게 맞는 귀농지, 찾아볼까요?
          </h2>
          <p className={s.ctaBannerSub}>
            5개 질문에 답하면 조건에 맞는 지역과 작물을 추천해 드립니다.
          </p>
        </div>
        <Link href="/match" className={s.ctaBannerBtn}>
          추천 시작하기
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
