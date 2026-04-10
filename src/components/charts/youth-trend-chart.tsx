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
import type { YouthRatio } from "@/lib/data/stats";
import s from "./chart-styles.module.css";

/* ── 브랜드 색상 ── */
const COLOR_PRIMARY = "#1B6B5A";
const COLOR_PRIMARY_MUTED = "rgba(27, 107, 90, 0.22)";
const COLOR_TREND_LINE = "#E8913A";

interface Props {
  data: YouthRatio[];
}

/* ── 커스텀 툴팁 ── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ratio = payload.find((p: any) => p.dataKey === "ratio");

  return (
    <div className={s.tooltip}>
      <p className={s.tooltipLabel}>{label}년</p>
      {ratio && (
        <div className={s.tooltipRow}>
          <span
            className={s.tooltipDot}
            style={{ background: COLOR_PRIMARY }}
          />
          <span>청년 비율</span>
          <span className={s.tooltipValue}>{ratio.value}%</span>
        </div>
      )}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.find((p: any) => p.dataKey === "trendline") && (
        <div className={s.tooltipRow}>
          <span
            className={s.tooltipDot}
            style={{ background: COLOR_TREND_LINE }}
          />
          <span>추세선</span>
          <span className={s.tooltipValue}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {payload.find((p: any) => p.dataKey === "trendline")?.value?.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}

/** 선형 회귀로 추세선 값 계산 */
function calcTrendline(data: YouthRatio[]) {
  const n = data.length;
  const sumX = data.reduce((acc, _, i) => acc + i, 0);
  const sumY = data.reduce((acc, d) => acc + d.ratio, 0);
  const sumXY = data.reduce((acc, d, i) => acc + i * d.ratio, 0);
  const sumX2 = data.reduce((acc, _, i) => acc + i * i, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return data.map((d, i) => ({
    ...d,
    trendline: Number((intercept + slope * i).toFixed(2)),
  }));
}

export default function YouthTrendChart({ data }: Props) {
  const avgRatio = useMemo(
    () => data.reduce((sum, d) => sum + d.ratio, 0) / data.length,
    [data],
  );

  const enrichedData = useMemo(() => calcTrendline(data), [data]);

  return (
    <div>
      <div className={s.chartWrapper}>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart
            data={enrichedData}
            margin={{ top: 10, right: 12, left: -8, bottom: 0 }}
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
              tickFormatter={(v) => `${v}%`}
              domain={[6, 15]}
            />

            {/* 평균 참조선 */}
            <ReferenceLine
              y={avgRatio}
              stroke="#9ca3af"
              strokeDasharray="6 3"
              strokeWidth={1}
              label={{
                value: `평균 ${avgRatio.toFixed(1)}%`,
                position: "right",
                fontSize: 10,
                fill: "#9ca3af",
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* 막대 — 유의미(평균 이상) vs 비유의미(평균 미만) 색상 차별 */}
            <Bar
              dataKey="ratio"
              name="청년 비율"
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {enrichedData.map((entry) => (
                <Cell
                  key={entry.year}
                  fill={entry.ratio >= avgRatio ? COLOR_PRIMARY : COLOR_PRIMARY_MUTED}
                  stroke={entry.ratio >= avgRatio ? COLOR_PRIMARY : "transparent"}
                  strokeWidth={entry.ratio >= avgRatio ? 0 : 0}
                />
              ))}
            </Bar>

            {/* 추세선 — 오렌지 대시 */}
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

      {/* 범례 */}
      <div className={s.legend}>
        <span className={s.legendItem}>
          <span className={s.legendDot} style={{ background: COLOR_PRIMARY }} />
          평균 이상
        </span>
        <span className={s.legendItem}>
          <span className={s.legendDot} style={{ background: COLOR_PRIMARY_MUTED }} />
          평균 미만
        </span>
        <span className={s.legendItem}>
          <span className={s.legendDot} style={{ background: COLOR_TREND_LINE, borderRadius: "50%" }} />
          추세선
        </span>
      </div>

      {/* 인사이트 배지 */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <span className={s.insightBadge}>
          10년간 +4.9%p 꾸준한 상승 추세
        </span>
        <span className={s.insightBadge}>
          2024 역대 최고 13.1%
        </span>
      </div>
    </div>
  );
}
