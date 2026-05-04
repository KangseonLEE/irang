// /regions/ranking — 시군구 차원별 / 페르소나 맞춤 점수 랭킹 (Phase 4·5)
//
// 두 가지 모드:
//   - 차원별 (기본): 5차원 중 1개 선택 → 그 차원 점수 정렬
//   - 페르소나 맞춤: 5개 페르소나 중 1개 선택 → 가중 합산 점수 정렬
// 데이터: src/lib/data/dimension-scores.ts (정적 분위 점수)
// 페르소나 가중치: src/lib/data/personas.ts

import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { DataSource } from "@/components/ui/data-source";
import {
  DIMENSION_SCORES,
  DIMENSION_LABELS,
  DIMENSION_IDS,
  type DimensionId,
} from "@/lib/data/dimension-scores";
import {
  PERSONAS,
  type PersonaId,
  computePersonaScore,
  getPersona,
} from "@/lib/data/personas";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "시군구 점수 비교 — 차원별 / 페르소나 맞춤",
  description:
    "전국 시군구를 5가지 차원으로 비교하거나, 페르소나에 맞춘 종합 점수로 줄 세워 보세요.",
  alternates: { canonical: "/regions/ranking" },
};

export const revalidate = 86400;

interface PageProps {
  searchParams: Promise<{ dim?: string; sido?: string; persona?: string }>;
}

const SIGUNGU_INDEX = new Map(SIGUNGUS.map((sg) => [sg.sgisCode, sg]));

const DIMENSION_DESCRIPTIONS: Record<DimensionId, string> = {
  populationTrend: "최근 5년 동안 인구가 늘었는지 줄었는지를 보여드려요.",
  farmActivity: "인구 1만 명당 농가 수를 전국에서 비교해요. 도시 자치구는 빠져요.",
  medical: "인구 1만 명당 의료기관 수를 전국에서 비교해요.",
  school: "인구 1만 명당 학교 수를 전국에서 비교해요.",
  returnFarm: "전체 인구 대비 귀농 인구 비율이 얼마나 높은지를 비교해요. 도시 자치구는 빠져요.",
};

const DIMENSION_NOTES: Record<DimensionId, string | null> = {
  populationTrend: null,
  farmActivity: "도시 자치구는 농가 통계가 따로 잡히지 않아 빠져 있어요.",
  medical: null,
  school: "군위군은 학교 정보가 등록되어 있지 않아 빠져 있어요.",
  returnFarm: "도시 자치구는 귀농 통계가 따로 잡히지 않아 빠져 있어요.",
};

function buildHref(opts: {
  mode: "dimension" | "persona";
  dim?: DimensionId;
  persona?: PersonaId;
  sido?: string;
}): string {
  const params = new URLSearchParams();
  if (opts.mode === "persona" && opts.persona) {
    params.set("persona", opts.persona);
  } else if (opts.dim) {
    params.set("dim", opts.dim);
  }
  if (opts.sido && opts.sido !== "전체") params.set("sido", opts.sido);
  const qs = params.toString();
  return qs ? `/regions/ranking?${qs}` : "/regions/ranking";
}

function getToneClass(score: number): string {
  if (score >= 70) return s.scoreHigh;
  if (score >= 40) return s.scoreMid;
  return s.scoreLow;
}

function getDimensionSummary(dim: DimensionId, score: number): string {
  if (dim === "populationTrend") {
    if (score >= 80) return "회복 중";
    if (score >= 50) return "안정";
    return "감소 중";
  }
  const topPct = Math.max(1, 100 - score);
  return `전국 상위 ${topPct}%`;
}

function getPersonaSummary(score: number): string {
  if (score >= 70) return "잘 맞아요";
  if (score >= 50) return "괜찮아요";
  if (score >= 30) return "조금 약해요";
  return "잘 안 맞아요";
}

export default async function RankingPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  // 모드 판정: persona param 있으면 페르소나 모드, 없으면 차원 모드
  const personaParam = sp.persona ?? null;
  const persona = personaParam ? getPersona(personaParam) : null;
  const mode: "dimension" | "persona" = persona ? "persona" : "dimension";

  const dim = (DIMENSION_IDS as string[]).includes(sp.dim ?? "")
    ? (sp.dim as DimensionId)
    : "farmActivity";
  const sidoFilter = sp.sido && sp.sido !== "전체" ? sp.sido : null;

  // 시도 필터링 + null 제외 + 정렬
  const ranked = DIMENSION_SCORES.map((score) => {
    const sg = SIGUNGU_INDEX.get(score.sgisCode);
    if (!sg) return null;
    const province = PROVINCES.find((p) => p.id === sg.sidoId);
    if (!province) return null;
    if (sidoFilter && province.shortName !== sidoFilter) return null;

    const value =
      mode === "persona" && persona
        ? computePersonaScore(score, persona)
        : score[dim];
    if (value === null) return null;

    return { score, sg, province, value };
  })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.value - a.value);

  const description =
    mode === "persona" && persona
      ? `‘${persona.label}’ 페르소나로 시군구 점수를 줄 세웠어요.`
      : "5가지 차원 중 하나를 골라 전국 시군구를 비교해 보세요.";

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd
        items={[
          { name: "지역 탐색", href: "/regions" },
          { name: "시군구 점수 비교", href: "/regions/ranking" },
        ]}
      />

      <PageHeader
        icon={<Icon icon={Trophy} size="lg" />}
        label="시군구 비교"
        title="시군구 점수 비교"
        description={description}
        count={ranked.length}
      />

      {/* 모드 선택 */}
      <div className={s.modeToggle} role="tablist" aria-label="비교 방식">
        <Link
          href={buildHref({ mode: "dimension", dim, sido: sidoFilter ?? undefined })}
          role="tab"
          aria-selected={mode === "dimension"}
          className={`${s.modeBtn} ${mode === "dimension" ? s.modeBtnActive : ""}`}
        >
          차원별 보기
        </Link>
        <Link
          href={buildHref({
            mode: "persona",
            persona: (persona?.id ?? "balanced") as PersonaId,
            sido: sidoFilter ?? undefined,
          })}
          role="tab"
          aria-selected={mode === "persona"}
          className={`${s.modeBtn} ${mode === "persona" ? s.modeBtnActive : ""}`}
        >
          페르소나 맞춤
        </Link>
      </div>

      {/* 차원 또는 페르소나 토글 */}
      {mode === "dimension" ? (
        <>
          <div
            className={s.dimensionToggle}
            role="tablist"
            aria-label="차원 선택"
          >
            {DIMENSION_IDS.map((id) => (
              <Link
                key={id}
                href={buildHref({
                  mode: "dimension",
                  dim: id,
                  sido: sidoFilter ?? undefined,
                })}
                role="tab"
                aria-selected={dim === id}
                className={`${s.dimensionToggleBtn} ${dim === id ? s.dimensionToggleActive : ""}`}
              >
                {DIMENSION_LABELS[id]}
              </Link>
            ))}
          </div>
          <p className={s.dimensionDesc}>{DIMENSION_DESCRIPTIONS[dim]}</p>
          {DIMENSION_NOTES[dim] && (
            <p className={s.dimensionNote}>{DIMENSION_NOTES[dim]}</p>
          )}
        </>
      ) : (
        <>
          <div
            className={s.dimensionToggle}
            role="tablist"
            aria-label="페르소나 선택"
          >
            {PERSONAS.map((p) => (
              <Link
                key={p.id}
                href={buildHref({
                  mode: "persona",
                  persona: p.id,
                  sido: sidoFilter ?? undefined,
                })}
                role="tab"
                aria-selected={persona?.id === p.id}
                className={`${s.dimensionToggleBtn} ${persona?.id === p.id ? s.dimensionToggleActive : ""}`}
                title={`${p.audience} · ${p.desc}\n인구 ${p.weights.populationTrend}% · 농가 ${p.weights.farmActivity}% · 의료 ${p.weights.medical}% · 학교 ${p.weights.school}% · 귀농 ${p.weights.returnFarm}%`}
              >
                {p.label}
              </Link>
            ))}
          </div>
          {persona && (
            <p className={s.dimensionDesc}>
              {persona.audience}을(를) 위한 페르소나예요. 5차원을 가중 평균해
              하나의 점수로 만들어요.
            </p>
          )}
        </>
      )}

      {/* 시도 필터 */}
      <div className={s.sidoFilter} role="group" aria-label="시도 필터">
        <Link
          href={buildHref({
            mode,
            dim: mode === "dimension" ? dim : undefined,
            persona: mode === "persona" ? (persona?.id as PersonaId) : undefined,
          })}
          className={`${s.sidoFilterBtn} ${!sidoFilter ? s.sidoFilterActive : ""}`}
        >
          전체
        </Link>
        {PROVINCES.map((p) => (
          <Link
            key={p.id}
            href={buildHref({
              mode,
              dim: mode === "dimension" ? dim : undefined,
              persona: mode === "persona" ? (persona?.id as PersonaId) : undefined,
              sido: p.shortName,
            })}
            className={`${s.sidoFilterBtn} ${sidoFilter === p.shortName ? s.sidoFilterActive : ""}`}
          >
            {p.shortName}
          </Link>
        ))}
      </div>

      {/* 결과 */}
      {ranked.length === 0 ? (
        <div className={s.empty}>
          <p>해당 조건에 맞는 시군구가 없어요.</p>
        </div>
      ) : (
        <ol className={s.rankList}>
          {ranked.map((item, idx) => (
            <li key={item.score.sgisCode} className={s.rankItem}>
              <Link
                href={`/regions/${item.province.id}/${item.sg.id}`}
                className={s.rankLink}
              >
                <span className={s.rankNumber}>{idx + 1}</span>
                <div className={s.rankBody}>
                  <span className={s.rankName}>{item.sg.name}</span>
                  <span className={s.rankSido}>{item.province.shortName}</span>
                </div>
                <div className={s.rankScoreBox}>
                  <span
                    className={`${s.rankScore} ${getToneClass(item.value)}`}
                  >
                    {item.value}
                    <span className={s.rankScoreUnit}>점</span>
                  </span>
                  <span className={s.rankSummary}>
                    {mode === "persona"
                      ? getPersonaSummary(item.value)
                      : getDimensionSummary(dim, item.value)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}

      <p className={s.methodologyLink}>
        <Link href="/regions/ranking/methodology">
          점수는 어떻게 만들었나요? →
        </Link>
      </p>

      <DataSource
        source={`기상청 ASOS · SGIS 인구 · 농림어업총조사 2020 · 심평원 의료기관 · NEIS 학교 · KOSIS 귀농통계 (총 ${DIMENSION_SCORES.length}개 시군구 기준)`}
      />
    </div>
  );
}
