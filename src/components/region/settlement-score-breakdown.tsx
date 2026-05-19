/**
 * 정착 점수 산식 breakdown — 시도/시군구 공용 섹션.
 *
 * sticky 칩의 "정착 점수 NN" 점수가 어떻게 계산됐는지를 같은 페이지 안에서
 * 곧바로 확인할 수 있도록 5차원 점수를 카드로 노출한다.
 *
 * - 기본 페르소나(balanced) 균등 가중 (각 차원 20%) 가정.
 * - 시군구 모드: 단일 시군구의 5차원 점수.
 * - 시도 모드: 산하 시군구들의 차원별 평균 + 산하 시군구 수 표시.
 *
 * Server Component. 모든 계산은 호출 측에서 끝낸 값을 props로 받는다.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import type { DimensionEvidenceMap } from "@/lib/data/dimension-scores";
import type { SidoDimensionEvidenceMap } from "@/lib/data/sido-evidence";
import s from "./settlement-score-breakdown.module.css";

export interface DimensionBreakdownInput {
  populationTrend: number | null;
  farmActivity: number | null;
  medical: number | null;
  school: number | null;
  returnFarm: number | null;
}

interface BaseProps {
  /** 종합 정착 점수 (이미 계산된 값) */
  score: number;
  /** 5차원 점수 (시군구는 raw, 시도는 산하 시군구 평균) */
  dimensions: DimensionBreakdownInput;
  /** anchor id — sticky 칩이 이 섹션으로 스크롤 */
  anchorId?: string;
}

interface SigunguProps extends BaseProps {
  mode: "sigungu";
  /** 시군구명 — 카피용 */
  regionName: string;
  /** 차원별 raw 수치 + 해석 카피 (시군구만) */
  evidence?: DimensionEvidenceMap | null;
}

interface SidoProps extends BaseProps {
  mode: "sido";
  /** 시도 짧은 이름 — 카피용 */
  regionName: string;
  /** 시도 라우팅 id — Top 시군구 link href에 사용 */
  provinceId: string;
  /** 점수 산정에 포함된 산하 시군구 수 */
  includedSigunguCount: number;
  /** 산하 시군구 raw 수치 평균 + 해석 + Top 시군구 (시도만) */
  evidence?: SidoDimensionEvidenceMap | null;
}

type Props = SigunguProps | SidoProps;

interface DimensionDef {
  key: keyof DimensionBreakdownInput;
  label: string;
  helper: string;
}

const DIMENSIONS: DimensionDef[] = [
  {
    key: "populationTrend",
    label: "인구 추세",
    helper: "최근 5년 변화율",
  },
  {
    key: "farmActivity",
    label: "농가 활성도",
    helper: "1만 명당 농가 수",
  },
  {
    key: "medical",
    label: "의료 인프라",
    helper: "1만 명당 의료기관",
  },
  {
    key: "school",
    label: "학교 인프라",
    helper: "1만 명당 학교 수",
  },
  {
    key: "returnFarm",
    label: "농촌 정착 활성도",
    helper: "전체 인구 대비 정착 비율",
  },
];

/** 0~100 점수 → 정성 라벨 */
function scoreTone(value: number): "high" | "mid" | "low" {
  if (value >= 67) return "high";
  if (value >= 34) return "mid";
  return "low";
}

export function SettlementScoreBreakdown(props: Props) {
  const { score, dimensions, anchorId = "settlement-score" } = props;

  const usedCount = DIMENSIONS.filter(
    (d) => dimensions[d.key] !== null,
  ).length;
  const missingLabels = DIMENSIONS.filter(
    (d) => dimensions[d.key] === null,
  ).map((d) => d.label);

  // 종합 점수 톤 (배경 강도용)
  const overallTone = scoreTone(score);

  // 한 줄 해석 — 점수 구간 + 모드별 카피
  const overallInterpretation =
    score >= 67
      ? props.mode === "sigungu"
        ? `${props.regionName}은 정착 환경이 안정적인 편이에요`
        : `${props.regionName} 산하는 평균적으로 안정적인 편이에요`
      : score >= 34
        ? props.mode === "sigungu"
          ? `${props.regionName}은 차원별로 강·약이 갈려요`
          : `${props.regionName} 산하는 시군구별 편차가 커요`
        : props.mode === "sigungu"
          ? `${props.regionName}은 정착 인프라가 부족한 편이에요`
          : `${props.regionName} 산하는 정착 인프라가 약한 편이에요`;

  return (
    <section
      className={s.section}
      aria-labelledby={`${anchorId}-title`}
      id={anchorId}
    >
      {/* 종합 점수 카드 — 5차원 그리드 위에 큰 숫자로 강조 */}
      <div
        className={s.overallCard}
        data-tone={overallTone}
        aria-label={`정착 점수 ${score}점, ${overallInterpretation}`}
      >
        <span className={s.overallLabel}>정착 점수</span>
        <div className={s.overallScoreRow}>
          <span className={s.overallScore}>{score}</span>
          <span className={s.overallScoreUnit}>점</span>
          <span className={s.overallPersona}>· 균등 가중</span>
        </div>
        <p className={s.overallInterp}>{overallInterpretation}</p>
      </div>

      <header className={s.header}>
        <h2 className={s.title} id={`${anchorId}-title`}>
          {score}점은 어떻게 나왔나요?
        </h2>
        <p className={s.desc}>
          {props.mode === "sigungu" ? (
            <>
              5가지 차원을 각각 20%씩 균등하게 보고 평균 낸 점수예요.
              {missingLabels.length > 0 && (
                <>
                  {" "}
                  {missingLabels.join("·")}는 데이터가 없어 빠졌어요.
                </>
              )}
            </>
          ) : (
            <>
              {props.regionName} 산하 시군구 {props.includedSigunguCount}곳의
              평균이에요. 시군구마다 차이가 크니, 자세한 점수와 근거는 시군구
              페이지에서 확인해 보세요.
            </>
          )}
        </p>
      </header>

      <ol className={s.dimGrid}>
        {DIMENSIONS.map((d) => {
          const value = dimensions[d.key];
          if (value === null) {
            return (
              <li
                key={d.key}
                className={`${s.dimCard} ${s.dimCardEmpty}`}
                aria-label={`${d.label} 데이터 없음`}
              >
                <span className={s.dimLabel}>{d.label}</span>
                <span className={s.dimEmpty}>데이터 없음</span>
                <span className={s.dimHelper}>{d.helper}</span>
              </li>
            );
          }
          const tone = scoreTone(value);
          const sigunguEv =
            props.mode === "sigungu" && props.evidence
              ? props.evidence[d.key]
              : null;
          const sidoEv =
            props.mode === "sido" && props.evidence
              ? props.evidence[d.key]
              : null;
          const ev = sigunguEv ?? sidoEv;
          const ariaLabel = ev
            ? `${d.label} ${value}점, ${ev.interpretation}`
            : `${d.label} ${value}점`;
          return (
            <li
              key={d.key}
              className={s.dimCard}
              data-tone={tone}
              aria-label={ariaLabel}
            >
              <span className={s.dimLabel}>{d.label}</span>
              <div className={s.dimScoreRow}>
                <span className={s.dimScore}>{value}</span>
                <span className={s.dimScoreUnit}>점</span>
              </div>
              <div
                className={s.dimBar}
                role="presentation"
                style={{ ["--dim-fill" as string]: `${value}%` }}
              >
                <span className={s.dimBarFill} />
              </div>
              {ev ? (
                <div className={s.dimEvidence}>
                  <span className={s.dimRaw}>{ev.rawLabel}</span>
                  <span className={s.dimInterp}>{ev.interpretation}</span>
                  {sidoEv && sidoEv.topSigungus.length > 0 && (
                    <ul className={s.dimTopList}>
                      {sidoEv.topSigungus.map((sg) => (
                        <li key={sg.id} className={s.dimTopItem}>
                          <Link
                            href={`/regions/${(props as SidoProps).provinceId}/${sg.id}`}
                            className={s.dimTopChip}
                            prefetch={false}
                          >
                            {sg.name}
                            <span className={s.dimTopScore}>{sg.score}점</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <span className={s.dimHelper}>{d.helper}</span>
              )}
            </li>
          );
        })}
      </ol>

      <div className={s.footer}>
        <p className={s.summary}>
          <span className={s.summaryStrong}>5가지 차원 중 {usedCount}가지</span>로
          계산했어요. 사람마다 중요한 차원이 다를 수 있어요.
        </p>
        <Link
          href="/regions/ranking/methodology"
          className={s.methodologyLink}
          prefetch={false}
        >
          어떻게 점수로 바꾸는지 자세히
          <Icon icon={ArrowRight} size="sm" className={s.methodologyIcon} />
        </Link>
      </div>
    </section>
  );
}
