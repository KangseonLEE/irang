// /regions/ranking — 시군구 차원별 / 페르소나 맞춤 점수 랭킹 (Phase 4·5)
//
// 두 가지 모드:
//   - 차원별 (기본): 5차원 중 1개 선택 → 그 차원 점수 정렬
//   - 페르소나 맞춤: 5개 페르소나 중 1개 선택 → 가중 합산 점수 정렬
// 데이터: src/lib/data/dimension-scores.ts (정적 분위 점수)
// 페르소나 가중치: src/lib/data/personas.ts

import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, Users, Sprout, HeartPulse, GraduationCap, Compass, ArrowRight } from "lucide-react";
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
import {
  resolvePersonaFromParams,
  serializeWeights,
  WEIGHT_PARAM_KEY,
} from "@/lib/persona-weights-custom";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { getRegionStats } from "@/lib/data/region-stats";
import { WeightCustomizer } from "@/components/persona/weight-customizer";
import { RankingWizardHero } from "./ranking-wizard-hero";
import { ModeToggleChips } from "./mode-toggle-chips";
import { RankResults } from "./rank-results";
import s from "./page.module.css";

/** Sprint 2 (2026-05-16) — 결과 상단 ModeToggleChips용 현재 mode·라벨 산출 */
function deriveCurrentMode(
  mode: "dimension" | "persona",
  isCustom: boolean,
): "persona" | "dimension" | "custom" {
  if (mode === "persona" && isCustom) return "custom";
  return mode;
}

export const metadata: Metadata = {
  title: "시군구 점수 비교 — 차원별 / 귀농 스타일 맞춤",
  description:
    "전국 시군구를 5가지 차원으로 비교하거나, 내 귀농 스타일에 맞춘 종합 점수로 줄 세워 보세요.",
  alternates: { canonical: "/regions/ranking" },
};

/** 봇 트래픽 절감은 next.config.ts headers의 s-maxage로 처리.
 *  searchParams(persona·w 등) 의존 페이지에 revalidate 추가 시 dynamic SSR 충돌 (2026-05-11 lessons). */

interface PageProps {
  searchParams: Promise<{
    dim?: string;
    sido?: string;
    persona?: string;
    /** Phase 6 B1: 가중치 커스터마이징 — `?w=20-15-15-35-15` */
    w?: string;
  }>;
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

const DIMENSION_ICONS: Record<DimensionId, typeof Users> = {
  populationTrend: Users,
  farmActivity: Sprout,
  medical: HeartPulse,
  school: GraduationCap,
  returnFarm: Compass,
};

function buildHref(opts: {
  mode: "dimension" | "persona";
  dim?: DimensionId;
  persona?: PersonaId;
  sido?: string;
  /** Phase 6 B1: 가중치 커스터마이징 유지 — `?w=20-15-15-35-15` 형식 */
  w?: string;
}): string {
  const params = new URLSearchParams();
  if (opts.mode === "persona" && opts.persona) {
    params.set("persona", opts.persona);
  } else if (opts.dim) {
    params.set("dim", opts.dim);
  }
  if (opts.sido && opts.sido !== "전체") params.set("sido", opts.sido);
  if (opts.mode === "persona" && opts.w) {
    params.set(WEIGHT_PARAM_KEY, opts.w);
  }
  const qs = params.toString();
  return qs ? `/regions/ranking?${qs}` : "/regions/ranking";
}

// getToneClass / getDimensionSummary / getPersonaSummary 함수는
// Phase B Sprint 1 (2026-05-15)에 RankResults Client Component로 이동.
// 결과 영역의 상호작용(더보기/접기)을 위해 client 분리.

export default async function RankingPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  // empty state 판정 (D2): persona/dim/w/sido 모두 없으면 wizard hero 노출
  // — 결과 UI는 숨기고 사용자가 모드·옵션을 wizard로 고르도록 유도
  const hasAnyParam = Boolean(sp.persona || sp.dim || sp.w || sp.sido);
  const showWizard = !hasAnyParam;

  // 모드 판정: persona param 있으면 페르소나 모드, 없으면 차원 모드
  // Phase 6 B1: w=20-15-15-35-15 가중치 커스터마이징도 페르소나 모드로 진입
  const personaParam = sp.persona ?? null;
  const resolved = resolvePersonaFromParams(personaParam, sp.w ?? null);
  const persona = resolved?.persona ?? null;
  const isCustom = resolved?.isCustom ?? false;
  const mode: "dimension" | "persona" = persona ? "persona" : "dimension";

  // 커스텀 가중치 직렬화 — buildHref에 전달해 시도 필터·페르소나 전환 시 유지
  const customWeightsParam =
    isCustom && persona ? serializeWeights(persona.weights) : undefined;

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

    // 회장 결재 2026-05-15 — 시군구 카드 chip 3종 (밀도·활성 사업·D-7 임박)
    const stats = getRegionStats(sg, province);

    return { score, sg, province, value, stats };
  })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.value - a.value);

  const description = showWizard
    ? "당신에게 맞는 시군구를 찾아드릴게요."
    : mode === "persona" && persona
      ? isCustom
        ? `‘${persona.label}’ 스타일을 직접 조정한 가중치로 시군구를 줄 세웠어요.`
        : `‘${persona.label}’ 스타일로 시군구를 줄 세웠어요.`
      : "5차원 정착 점수로 시군구를 줄 세워요.";

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
        count={showWizard ? undefined : ranked.length}
      />

      {showWizard ? (
        <>
          <RankingWizardHero />
          <p className={s.methodologyLink}>
            <Link href="/regions/ranking/methodology">
              점수는 어떻게 만들었나요? →
            </Link>
          </p>
          <DataSource
            source={`기상청 ASOS · SGIS 인구 · 농림어업총조사 2020 · 심평원 의료기관 · NEIS 학교 · KOSIS 귀농통계 (총 ${DIMENSION_SCORES.length}개 시군구 기준)`}
          />
        </>
      ) : (
        <>
      {/* Sprint 2 (2026-05-16) — 상단 mode 전환 chip
          기존 .modeToggle(2분기) + 하단 restartCard 제거 → 본 chip이 통합
          현재 mode 표시 + persona/dimension/custom 즉시 전환 + "다시 선택" */}
      <ModeToggleChips
        current={deriveCurrentMode(mode, isCustom)}
        sido={sidoFilter}
        selectionLabel={
          mode === "persona" && persona
            ? isCustom
              ? `맞춤 가중치 (${persona.label} 기반)`
              : `${persona.label}`
            : `차원별 — ${DIMENSION_LABELS[dim]}`
        }
      />

      {/* 차원 모드: dimGrid 카드 5종이 곧 selector (중복 chip 제거) */}
      {mode === "dimension" ? (
        <>
          <section className={s.dimGrid} role="tablist" aria-label="차원 선택">
            {DIMENSION_IDS.map((id) => {
              const DimIcon = DIMENSION_ICONS[id];
              const isActive = id === dim;
              return (
                <Link
                  key={id}
                  href={buildHref({ mode: "dimension", dim: id, sido: sidoFilter ?? undefined })}
                  role="tab"
                  aria-selected={isActive}
                  aria-current={isActive ? "page" : undefined}
                  className={`${s.dimCard} ${isActive ? s.dimCardActive : ""}`}
                >
                  <span className={s.dimCardIcon}>
                    <Icon icon={DimIcon} size="md" />
                  </span>
                  <span className={s.dimCardBody}>
                    <span className={s.dimCardLabel}>{DIMENSION_LABELS[id]}</span>
                    <span className={s.dimCardDesc}>{DIMENSION_DESCRIPTIONS[id]}</span>
                  </span>
                  <Icon icon={ArrowRight} size="sm" className={s.dimCardArrow} />
                </Link>
              );
            })}
          </section>
          {DIMENSION_NOTES[dim] && (
            <p className={s.dimensionNote}>{DIMENSION_NOTES[dim]}</p>
          )}
        </>
      ) : (
        <>
          <div
            className={s.dimensionToggle}
            role="tablist"
            aria-label="귀농 스타일 선택"
          >
            {PERSONAS.map((p) => (
              <Link
                key={p.id}
                href={buildHref({
                  mode: "persona",
                  persona: p.id,
                  sido: sidoFilter ?? undefined,
                  // 페르소나 전환 시 커스텀 가중치는 해제 (각 페르소나의 기본 가중치로)
                  w: undefined,
                })}
                role="tab"
                aria-selected={persona?.id === p.id && !isCustom}
                className={`${s.dimensionToggleBtn} ${persona?.id === p.id && !isCustom ? s.dimensionToggleActive : ""}`}
                title={`${p.audience} · ${p.desc}\n인구 ${p.weights.populationTrend}% · 농가 ${p.weights.farmActivity}% · 의료 ${p.weights.medical}% · 학교 ${p.weights.school}% · 귀농 ${p.weights.returnFarm}%`}
              >
                {p.label}
              </Link>
            ))}
          </div>
          {persona && (
            <p className={s.dimensionDesc}>
              {isCustom
                ? `직접 조정한 가중치예요. 인구 ${persona.weights.populationTrend}% · 농가 ${persona.weights.farmActivity}% · 의료 ${persona.weights.medical}% · 학교 ${persona.weights.school}% · 귀농 ${persona.weights.returnFarm}%`
                : `${persona.audience}을(를) 위한 스타일이에요. 5차원을 가중 평균해 하나의 점수로 만들어요.`}
            </p>
          )}
          {persona && (() => {
            // base persona (기본 가중치)는 원본에서 다시 찾아 reset 버튼이 커스텀 값으로
            // 복원되는 버그 방지. persona.id는 buildCustomPersona가 보존한 base id.
            const basePersonaOriginal = getPersona(persona.id) ?? persona;
            return (
              <WeightCustomizer
                basePersona={basePersonaOriginal}
                currentWeights={persona.weights}
                isCustom={isCustom}
              />
            );
          })()}
        </>
      )}

      {/* 시도 필터 */}
      <div className={s.sidoFilter} role="group" aria-label="시도 필터">
        <Link
          href={buildHref({
            mode,
            dim: mode === "dimension" ? dim : undefined,
            persona: mode === "persona" ? (persona?.id as PersonaId) : undefined,
            w: customWeightsParam,
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
              w: customWeightsParam,
            })}
            className={`${s.sidoFilterBtn} ${sidoFilter === p.shortName ? s.sidoFilterActive : ""}`}
          >
            {p.shortName}
          </Link>
        ))}
      </div>

      {/* 결과 — Phase B Sprint 1: RankResults Client Component (B-1 더보기 패턴)
          2026-05-15 보강 — 10건 단위 점진 확장 + 접기 */}
      <RankResults
        ranked={ranked}
        mode={mode}
        dim={dim}
        persona={persona}
        isCustom={isCustom}
        resetToken={`${mode}|${dim}|${persona?.id ?? ""}|${isCustom ? "c" : ""}|${sidoFilter ?? ""}|${customWeightsParam ?? ""}`}
      />

      {/* methodology 안내 — 점수 의문 즉시 해소용으로 결과 직후 inline link
          Sprint 2 (2026-05-16) — 하단 restartCard 제거: 상단 ModeToggleChips가 "다시 선택" 흡수 */}
      <p className={s.methodologyLink}>
        <Link href="/regions/ranking/methodology">
          점수는 어떻게 만들었나요? →
        </Link>
      </p>

      <DataSource
        source={`기상청 ASOS · SGIS 인구 · 농림어업총조사 2020 · 심평원 의료기관 · NEIS 학교 · KOSIS 귀농통계 (총 ${DIMENSION_SCORES.length}개 시군구 기준)`}
      />
        </>
      )}
    </div>
  );
}
