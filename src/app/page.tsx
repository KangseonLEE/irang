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
} from "lucide-react";
import SearchGroup from "@/components/search/search-group";
import {
  dataSources,
  trendStats,
  trendReasons,
  trendNews,
} from "@/lib/data/landing";
import s from "./page.module.css";

/* ────────────────────────────────────────────
   Page
   ──────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className={s.page}>
      {/* ═══ 히어로 — 검색 중심 ═══ */}
      <section className={s.heroSection} aria-label="검색">
        <span className={s.heroLabel}>
          <span className={s.heroLabelDot} />
          귀농 정보 큐레이션
        </span>

        <h1 className={s.heroTitle}>
          귀농, 어디서 무엇을 시작할지
          <br />
          <span className={s.heroTitleAccent}>검색하세요</span>
        </h1>

        <p className={s.heroSubtitle}>
          19개 지역, 17종 작물, 18건 지원사업을 한 곳에서 비교하세요.
        </p>

        <div className={s.heroSearchWrap}>
          <Suspense fallback={<div className={s.searchFallback} />}>
            <SearchGroup size="large" placeholder="지역, 작물, 지원사업 검색" />
          </Suspense>
        </div>
      </section>

      {/* ═══ 벤토 서비스 카드 그리드 — 3D 아이콘 ═══ */}
      <section className={s.bentoGrid} aria-label="주요 서비스">
        {/* 지역 비교 */}
        <Link href="/regions" className={s.bentoCard}>
          <div className={s.icon3dRegion} aria-hidden="true">
            <MapPin className={s.bentoIcon} />
          </div>
          <span className={s.bentoBig}>
            19
            <span className={s.bentoSuffix}>개 지역</span>
          </span>
          <span className={s.bentoName}>지역 비교</span>
          <p className={s.bentoDesc}>
            기후, 인프라, 인구 데이터로 나에게 맞는 귀농 지역을 비교하세요.
          </p>
          <span className={s.bentoLink}>
            더 보기
            <ArrowRight size={14} />
          </span>
        </Link>

        {/* 작물 정보 */}
        <Link href="/crops" className={s.bentoCard}>
          <div className={s.icon3dCrop} aria-hidden="true">
            <Sprout className={s.bentoIcon} />
          </div>
          <span className={s.bentoBig}>
            17
            <span className={s.bentoSuffix}>종</span>
          </span>
          <span className={s.bentoName}>작물 정보</span>
          <p className={s.bentoDesc}>
            주요 작물의 재배 환경, 수익성, 난이도를 한눈에 확인하세요.
          </p>
          <span className={s.bentoLink}>
            더 보기
            <ArrowRight size={14} />
          </span>
        </Link>

        {/* 지원사업 */}
        <Link href="/programs" className={s.bentoCard}>
          <div className={s.icon3dProgram} aria-hidden="true">
            <FileText className={s.bentoIcon} />
          </div>
          <span className={s.bentoBig}>
            18
            <span className={s.bentoSuffix}>건</span>
          </span>
          <span className={s.bentoName}>지원사업</span>
          <p className={s.bentoDesc}>
            나이, 지역, 희망 작물 조건으로 받을 수 있는 지원사업을 찾아보세요.
          </p>
          <span className={s.bentoLink}>
            더 보기
            <ArrowRight size={14} />
          </span>
        </Link>
      </section>

      {/* ═══ 귀농 트렌드 섹션 ═══ */}
      <section className={s.trendSection} aria-label="귀농 트렌드">
        <h2 className={s.trendTitle}>
          <TrendingUp size={18} className={s.trendTitleIcon} />
          왜 귀농인가?
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
      <section className={s.sourcesStrip} aria-label="데이터 출처">
        <div className={s.sourcesStripHeader}>
          <Database size={14} />
          <span>
            5개 공공 기관 데이터 · 매일 자동 업데이트
          </span>
        </div>
        <div className={s.sourcesStripList}>
          {dataSources.map((src) => (
            <span key={src.code} className={s.sourcesStripTag}>
              {src.name}
            </span>
          ))}
        </div>
      </section>

      {/* ═══ CTA 배너 ═══ */}
      <section className={s.ctaBanner} aria-label="시작하기">
        <div className={s.ctaBannerText}>
          <h2 className={s.ctaBannerTitle}>
            귀농의 첫걸음, 지금 시작하세요.
          </h2>
          <p className={s.ctaBannerSub}>
            회원가입 불필요 · 광고 없음 · 공공 데이터 기반
          </p>
        </div>
        <Link href="/programs" className={s.ctaBannerBtn}>
          지원사업 찾기
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
