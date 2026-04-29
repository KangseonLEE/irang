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
import type { YearlySmartfarm } from "@/lib/data/stats";
import s from "./chart-styles.module.css";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ color?: string; name?: string; value?: number }>;
  label?: number;
}

interface ChartDotProps {
  cx?: number;
  cy?: number;
  payload?: YearlySmartfarm;
}

const COLOR_PRIMARY = "#1B6B5A";
const COLOR_SECONDARY = "#A8D9CC";
const SIGNIFICANT_YEARS = new Set([2020, 2024]);

interface Props {
  data: YearlySmartfarm[];
}

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
          <span className={s.tooltipValue}>
            {entry.name === "시설면적"
              ? `${entry.value?.toLocaleString()}ha`
              : `${entry.value?.toLocaleString()}곳`}
          </span>
        </div>
      ))}
    </div>
  );
}

function FarmsDot(props: ChartDotProps) {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;
  const isSig = SIGNIFICANT_YEARS.has(payload.year);

  return (
    <circle
      cx={cx}
      cy={cy}
      r={isSig ? 6 : 3}
      fill={COLOR_PRIMARY}
      stroke="#fff"
      strokeWidth={isSig ? 2.5 : 1.5}
      style={
        isSig
          ? { filter: "drop-shadow(0 0 6px rgba(27, 107, 90, 0.5))" }
          : undefined
      }
    />
  );
}

function AreaDot(props: ChartDotProps) {
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
      style={
        isSig
          ? { filter: "drop-shadow(0 0 6px rgba(168, 217, 204, 0.6))" }
          : undefined
      }
    />
  );
}

export default function SmartfarmTrendChart({ data }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const handleMouseMove = useCallback(
    (state: { activeLabel?: string | number }) => {
      if (typeof state?.activeLabel === "number") {
        setHoveredYear(state.activeLabel);
      }
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredYear(null);
  }, []);

  return (
    <div>
      <div className={s.chartWrapper}>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart
            data={data}
            margin={{ top: 28, right: 12, left: 4, bottom: 0 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient
                id="areaGradientSf"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={COLOR_SECONDARY}
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor={COLOR_SECONDARY}
                  stopOpacity={0.02}
                />
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

            {/* 좌축: 시설면적 */}
            <YAxis
              yAxisId="area"
              orientation="left"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}천ha`}
              domain={[3000, 7500]}
            />

            {/* 우축: 농가 수 */}
            <YAxis
              yAxisId="farms"
              orientation="right"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}천`}
              domain={[3000, 10000]}
            />

            <ReferenceLine
              x={2020}
              yAxisId="area"
              stroke={COLOR_PRIMARY}
              strokeDasharray="4 4"
              strokeOpacity={0.3}
              label={{
                value: "스마트팜 확산 가속",
                position: "top",
                fontSize: 10,
                fill: "#9ca3af",
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* 시설면적 — 영역 차트 */}
            <Area
              yAxisId="area"
              type="monotone"
              dataKey="area"
              name="시설면적"
              fill="url(#areaGradientSf)"
              stroke={COLOR_SECONDARY}
              strokeWidth={2.5}
              dot={<AreaDot />}
              activeDot={{
                r: 7,
                stroke: COLOR_SECONDARY,
                strokeWidth: 2.5,
                fill: "#fff",
              }}
              animationDuration={1200}
              animationEasing="ease-out"
            />

            {/* 농가 수 — 라인 차트 */}
            <Line
              yAxisId="farms"
              type="monotone"
              dataKey="farms"
              name="도입 농가"
              stroke={COLOR_PRIMARY}
              strokeWidth={3}
              dot={<FarmsDot />}
              activeDot={{
                r: 7,
                stroke: COLOR_PRIMARY,
                strokeWidth: 2.5,
                fill: "#fff",
              }}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className={s.legend}>
        <span className={s.legendItem}>
          <span
            className={s.legendDot}
            style={{ background: COLOR_PRIMARY, borderRadius: "50%" }}
          />
          도입 농가 (우축)
        </span>
        <span className={s.legendItem}>
          <span className={s.legendDot} style={{ background: COLOR_SECONDARY }} />
          시설면적 (좌축)
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <span className={s.insightBadge}>
          7년간 농가 수 113% 증가
        </span>
        <span className={s.insightBadge}>
          2024 8,534곳 · 6,370ha
        </span>
      </div>
    </div>
  );
}
