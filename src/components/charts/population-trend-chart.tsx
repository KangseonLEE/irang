"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import {
  changePct,
  formatKoreanCount,
  signedPct,
  toCount,
  type YearlyPopulation,
} from "@/lib/data/stats";
import { niceAxis } from "./nice-axis";
import s from "./chart-styles.module.css";

/** Recharts가 content element에 주입하는 Tooltip props */
interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ color?: string; name?: string; value?: number; dataKey?: string | number }>;
  label?: number;
  significant?: ReadonlySet<number>;
}

/** Dot 컴포넌트에 Recharts가 전달하는 props */
interface ChartDotProps {
  cx?: number;
  cy?: number;
  payload?: YearlyPopulation;
  significant?: ReadonlySet<number>;
}

/* ── 브랜드 색상 ── */
const COLOR_PRIMARY = "#1B6B5A";
const COLOR_SECONDARY = "#A8D9CC";

/** 코로나19 참조선 연도 */
const COVID_YEAR = 2020;

interface Props {
  data: YearlyPopulation[];
  /**
   * 표시 모드.
   * - "all" (기본): 귀농 + 귀촌 동시 표시 (이중 Y축)
   * - "farming": 귀농만 표시 (단일 Y축, 라인)
   * - "rural": 귀촌만 표시 (단일 Y축, 영역)
   */
  mode?: "all" | "farming" | "rural";
}

/** 만 단위 값 → "9,134명" · "41만 3,464명" */
const persons = (man: number) => `${formatKoreanCount(toCount(man))}명`;

/* ── 커스텀 툴팁 ── */
function CustomTooltip({ active, payload, label, significant }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const isSignificant = significant?.has(label ?? 0) ?? false;

  return (
    <div className={s.tooltip}>
      <p className={s.tooltipLabel}>
        {label}년 {isSignificant ? "★" : ""}
      </p>
      {payload.map((entry, i: number) => (
        <div className={s.tooltipRow} key={i}>
          <span
            className={s.tooltipDot}
            style={{ background: entry.color }}
          />
          <span>{entry.name}</span>
          <span className={s.tooltipValue}>
            {typeof entry.value === "number" ? persons(entry.value) : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── 귀촌 라인 커스텀 Dot (유의미 연도 강조) ── */
function RuralDot(props: ChartDotProps) {
  const { cx, cy, payload, significant } = props;
  if (!cx || !cy || !payload) return null;
  const isSig = significant?.has(payload.year) ?? false;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={isSig ? 6 : 3}
      fill={isSig ? COLOR_SECONDARY.replace("CC", "FF") : COLOR_SECONDARY}
      stroke="#fff"
      strokeWidth={isSig ? 2.5 : 1.5}
      style={isSig ? { filter: "drop-shadow(0 0 6px rgba(168, 217, 204, 0.6))" } : undefined}
    />
  );
}

/* ── 귀농 라인 커스텀 Dot ── */
function FarmingDot(props: ChartDotProps) {
  const { cx, cy, payload, significant } = props;
  if (!cx || !cy || !payload) return null;
  const isSig = significant?.has(payload.year) ?? false;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={isSig ? 6 : 3}
      fill={COLOR_PRIMARY}
      stroke="#fff"
      strokeWidth={isSig ? 2.5 : 1.5}
      style={isSig ? { filter: "drop-shadow(0 0 6px rgba(27, 107, 90, 0.5))" } : undefined}
    />
  );
}

export default function PopulationTrendChart({ data, mode = "all" }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const handleMouseMove = useCallback((state: { activeLabel?: string | number }) => {
    if (typeof state?.activeLabel === "number") {
      setHoveredYear(state.activeLabel);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredYear(null);
  }, []);

  const showFarming = mode === "all" || mode === "farming";
  const showRural = mode === "all" || mode === "rural";

  /* 축·강조 연도·배지 — 전부 data 에서 계산한다(연도·수치 하드코딩 금지) */
  const view = useMemo(() => {
    const latest = data[data.length - 1];
    const prev = data[data.length - 2];
    const covid = data.find((d) => d.year === COVID_YEAR);
    const beforeCovid = data.find((d) => d.year === COVID_YEAR - 1);
    return {
      latest,
      significant: new Set([COVID_YEAR, latest.year]) as ReadonlySet<number>,
      ruralAxis: niceAxis(data.map((d) => d.rural)),
      farmingAxis: niceAxis(data.map((d) => d.farming)),
      farmingChange: prev ? changePct(latest.farming, prev.farming) : null,
      ruralChange: prev ? changePct(latest.rural, prev.rural) : null,
      covidRuralChange: covid && beforeCovid ? changePct(covid.rural, beforeCovid.rural) : null,
    };
  }, [data]);

  const ruralBadges = [
    view.covidRuralChange !== null
      ? `${COVID_YEAR} 귀촌 ${signedPct(view.covidRuralChange)} (코로나19 시기)`
      : null,
    `${view.latest.year} 귀촌인 ${persons(view.latest.rural)}${
      view.ruralChange !== null ? ` · ${signedPct(view.ruralChange)}` : ""
    }`,
  ].filter((b): b is string => b !== null);

  const farmingBadges = [
    `${view.latest.year} 귀농인 ${persons(view.latest.farming)}`,
    view.farmingChange !== null ? `전년 대비 ${signedPct(view.farmingChange)}` : null,
  ].filter((b): b is string => b !== null);

  const badges = mode === "farming" ? farmingBadges : ruralBadges;

  return (
    <div>
      <div className={s.chartWrapper}>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart
            data={data}
            margin={{ top: 28, right: 12, left: -8, bottom: 0 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id="ruralGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR_SECONDARY} stopOpacity={0.35} />
                <stop offset="100%" stopColor={COLOR_SECONDARY} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0,0,0,0.06)"
              vertical={false}
            />

            <XAxis
              dataKey="year"
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
            />

            {/* 좌축: 귀촌 (큰 스케일) — 단일 모드면 좌축만 사용 */}
            {showRural && (
              <YAxis
                yAxisId="rural"
                orientation="left"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${v}만`}
                domain={view.ruralAxis.domain}
                ticks={view.ruralAxis.ticks}
              />
            )}

            {/* 우축: 귀농 (작은 스케일) — 단일 모드면 좌축으로 변경 */}
            {showFarming && (
              <YAxis
                yAxisId="farming"
                orientation={mode === "farming" ? "left" : "right"}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${v.toFixed(1)}만`}
                domain={view.farmingAxis.domain}
                ticks={view.farmingAxis.ticks}
              />
            )}

            {/* 2020년 참조선 (COVID) — 표시되는 첫 축에 부착 */}
            <ReferenceLine
              x={COVID_YEAR}
              yAxisId={showRural ? "rural" : "farming"}
              stroke={COLOR_PRIMARY}
              strokeDasharray="4 4"
              strokeOpacity={0.3}
              label={{
                value: "COVID-19",
                position: "top",
                fontSize: 10,
                fill: "#9ca3af",
              }}
            />

            <Tooltip content={<CustomTooltip significant={view.significant} />} />

            {/* 귀촌 — 영역 차트 (배경감) */}
            {showRural && (
              <Area
                yAxisId="rural"
                type="monotone"
                dataKey="rural"
                name="귀촌인"
                fill="url(#ruralGradient)"
                stroke={COLOR_SECONDARY}
                strokeWidth={2.5}
                dot={<RuralDot significant={view.significant} />}
                activeDot={{ r: 7, stroke: COLOR_SECONDARY, strokeWidth: 2.5, fill: "#fff" }}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            )}

            {/* 귀농 — 라인 차트 (뚜렷하게) */}
            {showFarming && (
              <Line
                yAxisId="farming"
                type="monotone"
                dataKey="farming"
                name="귀농인"
                stroke={COLOR_PRIMARY}
                strokeWidth={3}
                dot={<FarmingDot significant={view.significant} />}
                activeDot={{ r: 7, stroke: COLOR_PRIMARY, strokeWidth: 2.5, fill: "#fff" }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 범례 */}
      <div className={s.legend}>
        {showFarming && (
          <span className={s.legendItem}>
            <span className={s.legendDot} style={{ background: COLOR_PRIMARY, borderRadius: "50%" }} />
            귀농인{mode === "all" ? " (우축)" : ""}
          </span>
        )}
        {showRural && (
          <span className={s.legendItem}>
            <span className={s.legendDot} style={{ background: COLOR_SECONDARY }} />
            귀촌인{mode === "all" ? " (좌축)" : ""}
          </span>
        )}
      </div>

      {/* 인사이트 배지 — data 에서 계산 */}
      <div className={s.insightBadgeRow}>
        {badges.map((badge) => (
          <span key={badge} className={s.insightBadge}>
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}
