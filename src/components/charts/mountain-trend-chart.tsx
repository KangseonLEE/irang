"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";
import type { YearlyMountain } from "@/lib/data/stats";
import s from "./chart-styles.module.css";

interface TooltipEntry {
  dataKey?: string;
  value?: number;
  color?: string;
  name?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: number;
}

const COLOR_PRIMARY = "#1B6B5A";
const COLOR_PRIMARY_MUTED = "rgba(27, 107, 90, 0.22)";
const COLOR_TREND_LINE = "#E8913A";

interface Props {
  data: YearlyMountain[];
}

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const households = payload.find((p) => p.dataKey === "households");

  return (
    <div className={s.tooltip}>
      <p className={s.tooltipLabel}>{label}년</p>
      {households && (
        <div className={s.tooltipRow}>
          <span
            className={s.tooltipDot}
            style={{ background: COLOR_PRIMARY }}
          />
          <span>귀산촌 가구</span>
          <span className={s.tooltipValue}>
            {households.value?.toLocaleString()}가구
          </span>
        </div>
      )}
      {payload.find((p) => p.dataKey === "trendline") && (
        <div className={s.tooltipRow}>
          <span
            className={s.tooltipDot}
            style={{ background: COLOR_TREND_LINE }}
          />
          <span>추세선</span>
          <span className={s.tooltipValue}>
            {payload
              .find((p) => p.dataKey === "trendline")
              ?.value?.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}

function calcTrendline(data: YearlyMountain[]) {
  const n = data.length;
  const sumX = data.reduce((acc, _, i) => acc + i, 0);
  const sumY = data.reduce((acc, d) => acc + d.households, 0);
  const sumXY = data.reduce((acc, d, i) => acc + i * d.households, 0);
  const sumX2 = data.reduce((acc, _, i) => acc + i * i, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return data.map((d, i) => ({
    ...d,
    trendline: Math.round(intercept + slope * i),
  }));
}

export default function MountainTrendChart({ data }: Props) {
  const avg = useMemo(
    () => data.reduce((sum, d) => sum + d.households, 0) / data.length,
    [data],
  );

  const enrichedData = useMemo(() => calcTrendline(data), [data]);

  return (
    <div>
      <div className={s.chartWrapper}>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart
            data={enrichedData}
            margin={{ top: 10, right: 12, left: 4, bottom: 0 }}
          >
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

            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}천`}
              domain={[1000, 3200]}
            />

            <ReferenceLine
              y={avg}
              stroke="#9ca3af"
              strokeDasharray="6 3"
              strokeWidth={1}
              label={{
                value: `평균 ${Math.round(avg).toLocaleString()}`,
                position: "right",
                fontSize: 10,
                fill: "#9ca3af",
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Bar
              dataKey="households"
              name="귀산촌 가구"
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {enrichedData.map((entry) => (
                <Cell
                  key={entry.year}
                  fill={
                    entry.households >= avg
                      ? COLOR_PRIMARY
                      : COLOR_PRIMARY_MUTED
                  }
                />
              ))}
            </Bar>

            <Line
              dataKey="trendline"
              name="추세선"
              stroke={COLOR_TREND_LINE}
              strokeWidth={2.5}
              strokeDasharray="6 3"
              dot={false}
              activeDot={false}
              animationDuration={1800}
              animationEasing="ease-out"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className={s.legend}>
        <span className={s.legendItem}>
          <span className={s.legendDot} style={{ background: COLOR_PRIMARY }} />
          평균 이상
        </span>
        <span className={s.legendItem}>
          <span
            className={s.legendDot}
            style={{ background: COLOR_PRIMARY_MUTED }}
          />
          평균 미만
        </span>
        <span className={s.legendItem}>
          <span
            className={s.legendDot}
            style={{ background: COLOR_TREND_LINE, borderRadius: "50%" }}
          />
          추세선
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <span className={s.insightBadge}>
          7년간 +74% 꾸준한 상승 추세
        </span>
        <span className={s.insightBadge}>
          2024 최고 2,685가구
        </span>
      </div>
    </div>
  );
}
