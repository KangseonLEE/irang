"use client";

import { useState, useCallback } from "react";
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
import type { YearlyPopulation } from "@/lib/data/stats";
import s from "./chart-styles.module.css";

/** Recharts가 content element에 주입하는 Tooltip props */
interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ color?: string; name?: string; value?: number }>;
  label?: number;
}

/** Dot 컴포넌트에 Recharts가 전달하는 props */
interface ChartDotProps {
  cx?: number;
  cy?: number;
  payload?: YearlyPopulation;
}


/* ── 브랜드 색상 ── */
const COLOR_PRIMARY = "#1B6B5A";
const COLOR_SECONDARY = "#A8D9CC";

/* ── 유의미 연도 ── */
const SIGNIFICANT_YEARS = new Set([2020, 2024]);

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

/* ── 커스텀 툴팁 ── */
function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const isSignificant = SIGNIFICANT_YEARS.has(label ?? 0);

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
          <span className={s.tooltipValue}>{entry.value}만</span>
        </div>
      ))}
    </div>
  );
}

/* ── 귀촌 라인 커스텀 Dot (유의미 연도 강조) ── */
function RuralDot(props: ChartDotProps) {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;
  const isSig = SIGNIFICANT_YEARS.has(payload.year);

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
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;
  const isSig = SIGNIFICANT_YEARS.has(payload.year);

  return (
    <circle
      cx={cx}
      cy={cy}
      r={isSig ? 6 : 3}
      fill={isSig ? COLOR_PRIMARY : COLOR_PRIMARY}
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
                tickFormatter={(v) => `${v}만`}
                domain={[28, 48]}
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
                tickFormatter={(v) => `${v}만`}
                domain={[1.0, 1.45]}
              />
            )}

            {/* 2020년 참조선 (COVID) — 표시되는 첫 축에 부착 */}
            <ReferenceLine
              x={2020}
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

            <Tooltip content={<CustomTooltip />} />

            {/* 귀촌 — 영역 차트 (배경감) */}
            {showRural && (
              <Area
                yAxisId="rural"
                type="monotone"
                dataKey="rural"
                name="귀촌 인구"
                fill="url(#ruralGradient)"
                stroke={COLOR_SECONDARY}
                strokeWidth={2.5}
                dot={<RuralDot />}
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
                name="귀농 인구"
                stroke={COLOR_PRIMARY}
                strokeWidth={3}
                dot={<FarmingDot />}
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
            귀농 인구{mode === "all" ? " (우축)" : ""}
          </span>
        )}
        {showRural && (
          <span className={s.legendItem}>
            <span className={s.legendDot} style={{ background: COLOR_SECONDARY }} />
            귀촌 인구{mode === "all" ? " (좌축)" : ""}
          </span>
        )}
      </div>

      {/* 인사이트 배지 */}
      <div className={s.insightBadgeRow}>
        {mode === "rural" && (
          <>
            <span className={s.insightBadge}>2020 코로나 이후 귀촌 급증 (+7.6%)</span>
            <span className={s.insightBadge}>2024 역대 최대 42.2만 명</span>
          </>
        )}
        {mode === "farming" && (
          <>
            <span className={s.insightBadge}>2024 귀농 인구 1.45만 가구</span>
            <span className={s.insightBadge}>전년 대비 +1.4%</span>
          </>
        )}
        {mode === "all" && (
          <>
            <span className={s.insightBadge}>2020 코로나 이후 귀촌 급증 (+7.6%)</span>
            <span className={s.insightBadge}>2024 역대 최대 42.2만 명</span>
          </>
        )}
      </div>
    </div>
  );
}
