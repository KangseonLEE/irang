import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  FileText,
  Sprout,
  CloudSun,
  BarChart3,
  TrendingUp,
  Hospital,
  GraduationCap,
  RefreshCw,
  Database,
} from "lucide-react";
import SearchGroup from "@/components/search/search-group";
import {
  dataSources,
  type ColorKey,
} from "@/lib/data/landing";
import s from "./page.module.css";

/* ────────────────────────────────────────────
   Icon & Color 매핑 (데이터 출처 섹션)
   ──────────────────────────────────────────── */

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  cloudSun: CloudSun,
  barChart: BarChart3,
  trendingUp: TrendingUp,
  hospital: Hospital,
  graduationCap: GraduationCap,
};

const SOURCE_ICON_CLS: Record<ColorKey, string> = {
  amber: s.sourceIconAmber,
  blue: s.sourceIconBlue,
  green: s.sourceIconGreen,
  red: s.sourceIconRed,
  brand: s.sourceIconBrand,
};

const SOURCE_TAG_CLS: Record<ColorKey, string> = {
  amber: s.sourceTagAmber,
  blue: s.sourceTagBlue,
  green: s.sourceTagGreen,
  red: s.sourceTagRed,
  brand: s.sourceTagBrand,
};

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
            <SearchGroup size="large" placeholder="지역, 작물, 지원사업을 검색하세요" />
          </Suspense>
        </div>
      </section>

      {/* ═══ 벤토 서비스 카드 그리드 — 3D 아이콘 ═══ */}
      <section className={s.bentoGrid} aria-label="주요 서비스">
        {/* 지역 비교 */}
        <Link href="/regions" className={s.bentoCard}>
          <div className={s.icon3dRegion} aria-hidden="true">
            <MapPin size={28} />
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
            <Sprout size={28} />
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
            <FileText size={28} />
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

      {/* ═══ 통계 스트립 ═══ */}
      <ul className={s.statsRow} aria-label="주요 통계">
        <li className={s.statItem}>
          <span className={s.statEmoji} aria-hidden="true">🌡️</span>
          <span className={s.statValue}>19</span>개 관측소
        </li>
        <li className={s.statDot} aria-hidden="true" />
        <li className={s.statItem}>
          <span className={s.statEmoji} aria-hidden="true">📡</span>
          <span className={s.statValue}>5</span>개 공공 API
        </li>
        <li className={s.statDot} aria-hidden="true" />
        <li className={s.statItem}>
          <span className={s.statEmoji} aria-hidden="true">🔄</span>
          매일 자동 업데이트
        </li>
      </ul>

      {/* ═══ 데이터 출처 카드 ═══ */}
      <section className={s.sourcesSection} aria-label="데이터 출처">
        <div>
          <h2 className={s.sourcesTitle}>
            <Database size={18} className={s.sourcesTitleIcon} />
            공공 데이터 출처
          </h2>
          <p className={s.sourcesSub}>
            5개 공공 기관의 신뢰할 수 있는 데이터를 사용합니다.
          </p>
        </div>

        <div className={s.sourcesGrid}>
          {dataSources.map((src) => {
            const Icon = ICON_MAP[src.iconKey];
            return (
              <div key={src.code} className={s.sourceItem}>
                <div
                  className={`${s.sourceIcon} ${SOURCE_ICON_CLS[src.colorKey]}`}
                >
                  <Icon size={20} />
                </div>
                <span
                  className={`${s.sourceTag} ${SOURCE_TAG_CLS[src.colorKey]}`}
                >
                  {src.tagLabel}
                </span>
                <span className={s.sourceName}>{src.name}</span>
                <p className={s.sourceDesc}>{src.description}</p>
              </div>
            );
          })}
        </div>

        <div className={s.updateBanner}>
          <RefreshCw size={15} className={s.updateIcon} />
          <span>
            모든 데이터는{" "}
            <span className={s.updateStrong}>매일 자동 업데이트</span>
            됩니다.
          </span>
        </div>
      </section>

      {/* ═══ CTA 카드 ═══ */}
      <section className={s.ctaCard} aria-label="시작하기">
        <Sprout size={44} className={s.ctaIcon} />
        <h2 className={s.ctaTitle}>
          귀농의 첫걸음, 지금 시작할 수 있어요.
        </h2>
        <p className={s.ctaDesc}>
          회원가입 없이, 지금 바로 나에게 맞는 지역과 지원사업을
          찾아보세요.
        </p>
        <div className={s.ctaButtons}>
          <Link href="/programs" className={s.ctaBtnWhite}>
            지원사업 찾기
            <ArrowRight size={16} />
          </Link>
          <Link href="/regions" className={s.ctaBtnGhost}>
            지역 비교하기
          </Link>
        </div>
        <p className={s.ctaFootnote}>
          회원가입 불필요 · 광고 없음 · 공공 데이터 기반
        </p>
      </section>
    </div>
  );
}
