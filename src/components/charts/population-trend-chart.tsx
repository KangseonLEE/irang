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

/* ── 브랜드 색상 ── */
const COLOR_PRIMARY = "#1B6B5A";
const COLOR_SECONDARY = "#A8D9CC";

/* ── 유의미 연도 ── */
const SIGNIFICANT_YEARS = new Set([2020, 2024]);

interface Props {
  data: YearlyPopulation[];
}

/* ── 커스텀 툴팁 ── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const isSignificant = SIGNIFICANT_YEARS.has(label);

  return (
    <div className={s.tooltip}>
      <p className={s.tooltipLabel}>
        {label}년 {isSignificant ? "★" : ""}
      </p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((entry: any, i: number) => (
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RuralDot(props: any) {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FarmingDot(props: any) {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;
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

export default function PopulationTrendChart({ data }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMouseMove = useCallback((state: any) => {
    if (state?.activePayload?.[0]) {
      setHoveredYear(state.activePayload[0].payload.year);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredYear(null);
  }, []);

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

            {/* 좌축: 귀촌 (큰 스케일) */}
            <YAxis
              yAxisId="rural"
              orientation="left"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}만`}
              domain={[28, 48]}
            />

            {/* 우축: 귀농 (작은 스케일) */}
            <YAxis
              yAxisId="farming"
              orientation="right"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}만`}
              domain={[1.0, 1.45]}
            />

            {/* 2020년 참조선 (COVID) */}
            <ReferenceLine
              x={2020}
              yAxisId="rural"
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

            {/* 귀농 — 라인 차트 (뚜렷하게) */}
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
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 범례 */}
      <div className={s.legend}>
        <span className={s.legendItem}>
          <span className={s.legendDot} style={{ background: COLOR_PRIMARY, borderRadius: "50%" }} />
          귀농 인구 (우축)
        </span>
        <span className={s.legendItem}>
          <span className={s.legendDot} style={{ background: COLOR_SECONDARY }} />
          귀촌 인구 (좌축)
        </span>
      </div>

      {/* 인사이트 배지 */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <span className={s.insightBadge}>
          2020 코로나 이후 귀촌 급증 (+7.6%)
        </span>
        <span className={s.insightBadge}>
          2024 역대 최대 42.2만 명
        </span>
      </div>
    </div>
  );
}
