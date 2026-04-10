"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import type { Factor } from "@/lib/data/stats";
import s from "./chart-styles.module.css";

interface Props {
  data: Factor[];
  /** "positive" = 만족 (그린), "negative" = 불만족 (레드) */
  variant?: "positive" | "negative";
  /** 상위 N개까지만 강조 (기본: 2) */
  highlightTop?: number;
}

const COLOR_POSITIVE = "#1B6B5A";
const COLOR_POSITIVE_MUTED = "rgba(27, 107, 90, 0.18)";
const COLOR_NEGATIVE = "#DC2626";
const COLOR_NEGATIVE_MUTED = "rgba(220, 38, 38, 0.18)";

/* ── 커스텀 툴팁 ── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { label, pct, rank } = payload[0].payload;
  return (
    <div className={s.tooltip}>
      <p className={s.tooltipLabel}>{rank}위</p>
      <div className={s.tooltipRow}>
        <span
          className={s.tooltipDot}
          style={{ background: payload[0].color }}
        />
        <span>{label}</span>
        <span className={s.tooltipValue}>{pct}%</span>
      </div>
    </div>
  );
}

export default function FactorBarChart({
  data,
  variant = "positive",
  highlightTop = 2,
}: Props) {
  const enrichedData = useMemo(
    () =>
      data.map((d, i) => ({
        ...d,
        rank: i + 1,
        isSignificant: i < highlightTop,
      })),
    [data, highlightTop],
  );

  const mainColor = variant === "positive" ? COLOR_POSITIVE : COLOR_NEGATIVE;
  const mutedColor =
    variant === "positive" ? COLOR_POSITIVE_MUTED : COLOR_NEGATIVE_MUTED;

  return (
    <div className={s.chartWrapper} style={{ minHeight: 200 }}>
      <ResponsiveContainer width="100%" height={data.length * 48 + 20}>
        <BarChart
          data={enrichedData}
          layout="vertical"
          margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
            domain={[0, "auto"]}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 13, fill: "#374151", fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            width={100}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />

          <Bar
            dataKey="pct"
            radius={[0, 6, 6, 0]}
            animationDuration={800}
            animationEasing="ease-out"
            barSize={28}
            label={{
              position: "right",
              fontSize: 13,
              fontWeight: 700,
              fill: "#374151",
              formatter: (v: unknown) => `${v}%`,
            }}
          >
            {enrichedData.map((entry) => (
              <Cell
                key={entry.label}
                fill={entry.isSignificant ? mainColor : mutedColor}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
