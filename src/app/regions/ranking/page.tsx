import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, BarChart3, Award } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import {
  SETTLEMENT_SCORES,
  SETTLEMENT_SCORE_WEIGHTS,
} from "@/lib/data/settlement-score";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { DataSource } from "@/components/ui/data-source";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "시군구 정착 점수 랭킹 — 농가·인구·청년성·거주 적정성",
  description:
    "전국 229개 시군구의 귀농 정착 점수를 비교하세요. 농가 활성도, 인구 안정성, 청년성, 거주 적정성 4개 차원의 가중 평균이에요.",
  alternates: { canonical: "/regions/ranking" },
};

export const revalidate = 86400;

interface PageProps {
  searchParams: Promise<{ sido?: string }>;
}

const WEIGHT_PCT = {
  farm: Math.round(SETTLEMENT_SCORE_WEIGHTS.farm * 100),
  populationTrend: Math.round(SETTLEMENT_SCORE_WEIGHTS.populationTrend * 100),
  youth: Math.round(SETTLEMENT_SCORE_WEIGHTS.youth * 100),
  density: Math.round(SETTLEMENT_SCORE_WEIGHTS.density * 100),
};

/** sgisCode → 시군구 정보 (slug, sido slug) 인덱스 */
const SIGUNGU_INDEX = new Map(
  SIGUNGUS.map((sg) => [sg.sgisCode, sg]),
);

/** 통합시 sgisCode → SIGUNGUS 항목이 있으므로 그대로 사용 */
const PROVINCE_INDEX = new Map(PROVINCES.map((p) => [p.sgisCode, p]));

function buildHref(sido: string | undefined): string {
  if (!sido || sido === "전체") return "/regions/ranking";
  return `/regions/ranking?sido=${encodeURIComponent(sido)}`;
}

function getScoreClass(score: number): string {
  if (score >= 65) return s.scoreHigh;
  if (score >= 45) return s.scoreMid;
  return s.scoreLow;
}

export default async function RegionRankingPage({ searchParams }: PageProps) {
  const { sido } = await searchParams;

  // 시도 필터 적용
  const filteredScores = sido
    ? SETTLEMENT_SCORES.filter((s) => {
        const prov = PROVINCE_INDEX.get(s.sidoSgisCode);
        return prov?.shortName === sido;
      })
    : SETTLEMENT_SCORES;

  const top10 = filteredScores.slice(0, 10);
  const rest = filteredScores.slice(10);

  // 17개 시도의 shortName을 점수 합계 순서로 (랭킹 컨텍스트와 어울리게)
  const sidoOptions = PROVINCES.map((p) => p.shortName);

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd
        items={[
          { name: "지역 탐색", href: "/regions" },
          { name: "정착 점수 랭킹", href: "/regions/ranking" },
        ]}
      />

      <PageHeader
        icon={<Trophy size={20} strokeWidth={1.75} />}
        label="Ranking"
        title="시군구 정착 점수"
        description="공공 데이터로 본 귀농 정착 가능성이에요. 4개 차원의 가중 평균(0~100)을 비교하세요."
        count={filteredScores.length}
      />

      {/* ── 모델 설명 카드 ── */}
      <section className={s.modelCard} aria-label="점수 모델 설명">
        <h2 className={s.modelTitle}>어떻게 계산했나요?</h2>
        <p className={s.modelDesc}>
          귀농 정착 가능성은 단일 지표로 정해지지 않아요. 농가 활성도·인구
          안정성·청년성·거주 적정성 4개 차원을 가중 평균했고, 모두 공공
          데이터에서 가져왔어요.
        </p>
        <div className={s.modelWeights}>
          <span className={s.modelWeightChip}>
            농가 활성도 <span className={s.modelWeightPct}>{WEIGHT_PCT.farm}%</span>
          </span>
          <span className={s.modelWeightChip}>
            인구 안정성 <span className={s.modelWeightPct}>{WEIGHT_PCT.populationTrend}%</span>
          </span>
          <span className={s.modelWeightChip}>
            청년성 <span className={s.modelWeightPct}>{WEIGHT_PCT.youth}%</span>
          </span>
          <span className={s.modelWeightChip}>
            거주 적정성 <span className={s.modelWeightPct}>{WEIGHT_PCT.density}%</span>
          </span>
        </div>
      </section>

      {/* ── 시도 필터 ── */}
      <section className={s.filterSection} aria-label="시도 필터">
        <span className={s.filterLabel}>시도</span>
        <div className={s.filterPills}>
          <Link
            href={buildHref(undefined)}
            className={!sido ? s.pillActive : s.pill}
          >
            전국
          </Link>
          {sidoOptions.map((opt) => (
            <Link
              key={opt}
              href={buildHref(opt)}
              className={sido === opt ? s.pillActive : s.pill}
            >
              {opt}
            </Link>
          ))}
        </div>
      </section>

      {/* ── 결과 헤더 ── */}
      <div className={s.resultsHeader}>
        <h2 className={s.resultsTitle}>
          {sido ? `${sido} 랭킹` : "전국 랭킹"}
        </h2>
        <span className={s.resultsCount}>총 {filteredScores.length}개</span>
      </div>

      {filteredScores.length === 0 ? (
        <p className={s.empty}>해당 시도의 점수 데이터가 아직 없어요.</p>
      ) : (
        <>
          {/* ── 상위 10 강조 ── */}
          {top10.length > 0 && (
            <section className={s.topSection} aria-label="상위 10개 시군구">
              <div className={s.topGrid}>
                {top10.map((score, idx) => {
                  const sg = SIGUNGU_INDEX.get(score.sgisCode);
                  const prov = PROVINCE_INDEX.get(score.sidoSgisCode);
                  if (!sg || !prov) return null;
                  return (
                    <Link
                      key={score.sgisCode}
                      href={`/regions/${prov.id}/${sg.id}`}
                      className={s.topCard}
                    >
                      <span className={s.topRank}>
                        {idx < 3 ? (
                          <Award
                            size={14}
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        ) : (
                          <Trophy
                            size={12}
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        )}
                        {idx + 1}위
                      </span>
                      <span className={s.topName}>{sg.name}</span>
                      <span className={s.topMeta}>{prov.shortName}</span>
                      <span className={s.topScore}>
                        {score.totalScore.toFixed(1)}
                        <span className={s.topScoreUnit}>점</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── 전체 리스트 (11위 이하) ── */}
          {rest.length > 0 && (
            <section className={s.listSection} aria-label="전체 랭킹">
              {rest.map((score, idx) => {
                const sg = SIGUNGU_INDEX.get(score.sgisCode);
                const prov = PROVINCE_INDEX.get(score.sidoSgisCode);
                if (!sg || !prov) return null;
                const rank = idx + 11;
                const scoreClass = getScoreClass(score.totalScore);
                return (
                  <Link
                    key={score.sgisCode}
                    href={`/regions/${prov.id}/${sg.id}`}
                    className={s.listRow}
                  >
                    <span className={s.listRank}>{rank}</span>
                    <div className={s.listMain}>
                      <span className={s.listName}>
                        {sg.name}
                        <span className={s.listSido}>· {prov.shortName}</span>
                      </span>
                      <span className={s.listMeta}>
                        {score.raw.farmCount !== null
                          ? `농가 ${score.raw.farmCount.toLocaleString()}가구`
                          : "농가 데이터 없음"}
                        {score.raw.populationChangePct !== null && (
                          <>
                            {" · "}5년 인구{" "}
                            {score.raw.populationChangePct >= 0 ? "+" : ""}
                            {score.raw.populationChangePct}%
                          </>
                        )}
                      </span>
                    </div>
                    <div className={s.dimBars} aria-hidden="true">
                      <div className={s.dimBar}>
                        <span className={s.dimBarLabel}>농가</span>
                        <div className={s.dimBarTrack}>
                          <div
                            className={s.dimBarFill}
                            style={{ width: `${score.dimensions.farm}%` }}
                          />
                        </div>
                      </div>
                      <div className={s.dimBar}>
                        <span className={s.dimBarLabel}>인구</span>
                        <div className={s.dimBarTrack}>
                          <div
                            className={s.dimBarFill}
                            style={{
                              width: `${score.dimensions.populationTrend}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className={s.dimBar}>
                        <span className={s.dimBarLabel}>청년</span>
                        <div className={s.dimBarTrack}>
                          <div
                            className={s.dimBarFill}
                            style={{ width: `${score.dimensions.youth}%` }}
                          />
                        </div>
                      </div>
                      <div className={s.dimBar}>
                        <span className={s.dimBarLabel}>밀도</span>
                        <div className={s.dimBarTrack}>
                          <div
                            className={s.dimBarFill}
                            style={{ width: `${score.dimensions.density}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <span className={`${s.scoreBadge} ${scoreClass}`}>
                      <span className={s.scoreValue}>
                        {score.totalScore.toFixed(1)}
                      </span>
                      <span className={s.scoreUnit}>점</span>
                    </span>
                  </Link>
                );
              })}
            </section>
          )}
        </>
      )}

      <p className={s.disclaimer}>
        <BarChart3
          size={14}
          strokeWidth={1.75}
          aria-hidden="true"
          style={{ verticalAlign: "middle", marginRight: 4 }}
        />
        점수는 통계청 SGIS 농림어업총조사(2020), 인구통계(2018~2022), 행정안전부
        주민등록인구(2025) 데이터를 가공한 결과예요. 정책·시장 환경에 따라 실제
        체감과 차이가 있을 수 있어요.
      </p>

      <DataSource source="통계청 SGIS · 행정안전부 주민등록 · 자체 가공 모델 v2" />
    </div>
  );
}
