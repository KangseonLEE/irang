"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
} from "recharts";
import type { ProsConsCategory } from "@/lib/data/crops";
import cs from "@/components/charts/chart-styles.module.css";

const COLORS = ["#1b6b5a", "#e67e22", "#3498db"] as const;
const FILL_OPACITY = 0.15;

const AXES: { key: ProsConsCategory; label: string }[] = [
  { key: "수익성", label: "수익성" },
  { key: "재배난이도", label: "재배 용이" },
  { key: "시장성", label: "시장성" },
  { key: "안정성", label: "안정성" },
  { key: "생활", label: "생활편의" },
  { key: "확장성", label: "확장성" },
];

export interface CropRadarProps {
  crops: Array<{
    name: string;
    emoji: string;
    pros: Array<{ category: string }>;
    cons: Array<{ category: string }>;
  }>;
}

function calcScore(
  pros: Array<{ category: string }>,
  cons: Array<{ category: string }>,
  category: ProsConsCategory,
): number {
  const prosCount = pros.filter((p) => p.category === category).length;
  const consCount = cons.filter((c) => c.category === category).length;
  const raw = 50 + prosCount * 20 - consCount * 15;
  return Math.max(0, Math.min(100, raw));
}

/** Recharts Tooltip content props */
interface ChartTooltipProps {
  active?: boolean;
  label?: string;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

function CustomTooltip({ active, label, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className={cs.tooltip}>
      <p className={cs.tooltipLabel}>{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className={cs.tooltipRow}>
          <span
            className={cs.tooltipDot}
            style={{ background: entry.color }}
          />
          <span>{entry.name}</span>
          <span className={cs.tooltipValue}>{entry.value}점</span>
        </div>
      ))}
    </div>
  );
}

export function CropRadar({ crops }: CropRadarProps) {
  const data = useMemo(() => {
    return AXES.map(({ key, label }) => {
      const row: Record<string, string | number> = { axis: label };
      crops.forEach((crop) => {
        row[crop.name] = calcScore(crop.pros, crop.cons, key);
      });
      return row;
    });
  }, [crops]);

  return (
    <div>
      <div className={cs.chartWrapper}>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
            <PolarGrid stroke="var(--border, #e5e7eb)" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fontSize: 12, fill: "var(--muted-foreground, #6b7280)" }}
            />
            <Tooltip content={<CustomTooltip />} />
            {crops.map((crop, i) => (
              <Radar
                key={crop.name}
                name={`${crop.emoji} ${crop.name}`}
                dataKey={crop.name}
                stroke={COLORS[i]}
                fill={COLORS[i]}
                fillOpacity={FILL_OPACITY}
                strokeWidth={2}
                dot={{ r: 3, fill: COLORS[i] }}
                animationDuration={600}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* 범례 */}
      <div className={cs.legend}>
        {crops.map((crop, i) => (
          <span key={crop.name} className={cs.legendItem}>
            <span
              className={cs.legendDot}
              style={{ background: COLORS[i], borderRadius: "50%" }}
            />
            {crop.emoji} {crop.name}
          </span>
        ))}
      </div>
    </div>
  );
}
