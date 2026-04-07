"use client";

import { useState, useCallback } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
  Tooltip,
} from "recharts";
import type { SatisfactionSegment } from "@/lib/data/stats";
import s from "./chart-styles.module.css";

/* ── 색상 매핑: 만족 계열은 진하게, 불만족 계열은 연하게 ── */
const SEGMENT_COLORS: Record<string, string> = {
  "매우 만족": "#1B6B5A",
  "만족": "#3EA088",
  "보통": "#D4A843",
  "불만족": "#D4D4D4",
};

/** 유의미(만족+매우만족) 여부 */
const SIGNIFICANT_LABELS = new Set(["매우 만족", "만족"]);

interface Props {
  data: SatisfactionSegment[];
}

/* ── 커스텀 툴팁 ── */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { label, pct } = payload[0].payload;
  const isSig = SIGNIFICANT_LABELS.has(label);
  return (
    <div className={s.tooltip}>
      <p className={s.tooltipLabel}>{isSig ? "★ " : ""}{label}</p>
      <div className={s.tooltipRow}>
        <span
          className={s.tooltipDot}
          style={{ background: SEGMENT_COLORS[label] || "#d4d4d4" }}
        />
        <span>응답 비율</span>
        <span className={s.tooltipValue}>{pct}%</span>
      </div>
    </div>
  );
}

export default function SatisfactionDonutChart({ data }: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // 만족 전체 비율
  const totalSatisfied = data
    .filter((d) => SIGNIFICANT_LABELS.has(d.label))
    .reduce((sum, d) => sum + d.pct, 0);

  return (
    <div>
      <div className={s.chartWrapper} style={{ minHeight: 280 }}>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              dataKey="pct"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius="52%"
              outerRadius="78%"
              paddingAngle={3}
              onMouseEnter={(_, index) => setHoveredIdx(index)}
              onMouseLeave={() => setHoveredIdx(null)}
              animationDuration={1000}
              animationEasing="ease-out"
              label={({ cx, cy, midAngle, outerRadius: or, pct }: any) => {
                const RADIAN = Math.PI / 180;
                const radius = or + 38;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                return (
                  <text
                    x={x}
                    y={y}
                    fill="#6b7280"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={14}
                    fontWeight={700}
                  >
                    {pct}%
                  </text>
                );
              }}
            >
              {data.map((entry, i) => {
                const isSig = SIGNIFICANT_LABELS.has(entry.label);
                const isHovered = hoveredIdx === i;
                return (
                  <Cell
                    key={entry.label}
                    fill={SEGMENT_COLORS[entry.label] || "#d4d4d4"}
                    opacity={isHovered ? 1 : isSig ? 0.9 : 0.45}
                    stroke="#fff"
                    strokeWidth={isHovered ? 3 : 2}
                    style={{
                      transform: isHovered ? "scale(1.04)" : "scale(1)",
                      transformOrigin: "center",
                      transition: "opacity 0.2s, transform 0.2s, stroke-width 0.2s",
                      cursor: "pointer",
                      filter: isHovered ? "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" : "none",
                    }}
                  />
                );
              })}
            </Pie>

            {/* 중앙 텍스트 */}
            <text
              x="50%"
              y="47%"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={34}
              fontWeight={800}
              fill="#1B6B5A"
            >
              {totalSatisfied}%
            </text>
            <text
              x="50%"
              y="57%"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={12}
              fontWeight={600}
              fill="#6b7280"
            >
              만족 비율
            </text>

            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 인터랙티브 범례 */}
      <div className={s.donutLegend}>
        {data.map((entry, i) => {
          const isSig = SIGNIFICANT_LABELS.has(entry.label);
          return (
            <div
              key={entry.label}
              className={hoveredIdx === i ? s.donutLegendItemActive : s.donutLegendItem}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              role="button"
              tabIndex={0}
            >
              <span
                className={s.donutLegendDot}
                style={{
                  background: SEGMENT_COLORS[entry.label],
                  opacity: isSig ? 1 : 0.45,
                }}
              />
              <span className={s.donutLegendLabel}>{entry.label}</span>
              <span
                className={s.donutLegendPct}
                style={{ color: isSig ? "#1B6B5A" : "#9ca3af" }}
              >
                {entry.pct}%
              </span>
            </div>
          );
        })}
      </div>

      {/* 인사이트 배지 */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <span className={s.insightBadge}>
          만족 + 매우 만족 합산 {totalSatisfied}%
        </span>
      </div>
    </div>
  );
}
