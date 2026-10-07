"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import type { SatisfactionSegment } from "@/lib/data/stats";

/** Recharts가 content element에 주입하는 Tooltip props */
interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: SatisfactionSegment }>;
}
import { donutLabelLineEnd, donutLabelRadius } from "./donut-label";
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
function CustomTooltip({ active, payload }: ChartTooltipProps) {
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
      <div className={`${s.chartWrapper} ${s.chartWrapperDonut}`}>
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
              /* 연결선 — 라벨을 상자 안으로 당긴 만큼 선도 글자 앞에서 멈춘다(기본 선은 링 + 20px 고정이라 글자를 뚫었다) */
              labelLine={(props: PieLabelRenderProps & { pct: number; stroke?: string }) => {
                const { cx, cy, midAngle, outerRadius: or } = props;
                const angle = -(midAngle ?? 0) * (Math.PI / 180);
                const text = `${props.pct}%`;
                const labelRadius = donutLabelRadius({ cx: cx as number, cy: cy as number, outerRadius: or as number, angle, text });
                const end = donutLabelLineEnd({ outerRadius: or as number, angle, text, labelRadius });
                if (!end) return <g />;
                const x1 = (cx as number) + (or as number) * Math.cos(angle);
                const y1 = (cy as number) + (or as number) * Math.sin(angle);
                const x2 = (cx as number) + end * Math.cos(angle);
                const y2 = (cy as number) + end * Math.sin(angle);
                return <path d={`M${x1},${y1}L${x2},${y2}`} stroke={props.stroke} fill="none" className="recharts-pie-label-line" />;
              }}
              label={(props: PieLabelRenderProps) => {
                const { cx, cy, midAngle, outerRadius: or } = props;
                const pct = (props as PieLabelRenderProps & { pct: number }).pct;
                const RADIAN = Math.PI / 180;
                const angle = -(midAngle ?? 0) * RADIAN;
                const radius = donutLabelRadius({
                  cx: cx as number,
                  cy: cy as number,
                  outerRadius: or as number,
                  angle,
                  text: `${pct}%`,
                });
                const x = (cx as number) + radius * Math.cos(angle);
                const y = (cy as number) + radius * Math.sin(angle);
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
            /* 범례는 읽는 정보다 — 예전 role=button·tabIndex 는 누를 동작이 없는 버튼(Tab 정지점만 4개)이었다(10/6 QA).
               마우스를 올리면 조각이 강조되는 건 그대로 둔다(값은 범례 글자로 이미 다 보인다) */
            <div
              key={entry.label}
              className={hoveredIdx === i ? s.donutLegendItemActive : s.donutLegendItem}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <span
                className={isSig ? s.donutLegendDot : `${s.donutLegendDot} ${s.donutLegendDotMuted}`}
                style={{ background: SEGMENT_COLORS[entry.label] }}
              />
              <span className={s.donutLegendLabel}>{entry.label}</span>
              <span className={isSig ? s.donutLegendPctSig : s.donutLegendPctMuted}>{entry.pct}%</span>
            </div>
          );
        })}
      </div>

      {/* 인사이트 배지 */}
      <div className={s.insightBadgeRow}>
        <span className={s.insightBadge}>
          만족 + 매우 만족 합산 {totalSatisfied}%
        </span>
      </div>
    </div>
  );
}
