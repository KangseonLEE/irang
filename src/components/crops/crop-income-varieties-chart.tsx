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
import type { VarietyIncome } from "@/lib/data/crops";
import { parseVarietyRevenueMan } from "./variety-income-utils";
import s from "@/components/charts/chart-styles.module.css";

const COLOR_TOP = "#1B6B5A";
const COLOR_BASE = "#3EA088";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: { name: string; man: number; note?: string };
    color?: string;
  }>;
}

function CustomTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const { name, man, note } = payload[0].payload;
  return (
    <div className={s.tooltip}>
      <p className={s.tooltipLabel}>{name}</p>
      <div className={s.tooltipRow}>
        <span
          className={s.tooltipDot}
          style={{ background: payload[0].color }}
        />
        <span>10a당 소득</span>
        <span className={s.tooltipValue}>{man.toLocaleString()}만 원</span>
      </div>
      {note && (
        <div className={s.tooltipRow}>
          <span className={s.tooltipDot} style={{ background: "transparent" }} />
          <span>{note}</span>
        </div>
      )}
    </div>
  );
}

interface Props {
  varieties: VarietyIncome[];
}

/**
 * 품종·재배방식별 10a당 소득 수평 Bar 차트.
 * 최고소득 = 진한 primary, 나머지 = 30% opacity (David 철학 #2).
 * 호출부는 canRenderVarietiesChart()로 사전 판정 후 사용 — 파싱 실패 작물은 텍스트 fallback.
 */
interface VarietyDatum {
  name: string;
  man: number;
  note?: string;
}

export default function CropIncomeVarietiesChart({ varieties }: Props) {
  const data = useMemo<VarietyDatum[]>(() => {
    const rows: VarietyDatum[] = [];
    for (const v of varieties) {
      const man = parseVarietyRevenueMan(v.revenueRange);
      if (man !== null) rows.push({ name: v.name, man, note: v.note });
    }
    rows.sort((a, b) => b.man - a.man);
    return rows;
  }, [varieties]);

  if (data.length < 2) return null;

  const maxMan = data[0].man;

  return (
    <div className={s.chartWrapper} style={{ minHeight: 160 }}>
      <ResponsiveContainer width="100%" height={data.length * 46 + 20}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 64, left: 0, bottom: 0 }}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${Number(v).toLocaleString()}만`}
            domain={[0, "auto"]}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 13, fill: "#374151", fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            width={96}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(0,0,0,0.03)" }}
          />
          <Bar
            dataKey="man"
            radius={[0, 6, 6, 0]}
            animationDuration={800}
            animationEasing="ease-out"
            barSize={26}
            label={{
              position: "right",
              fontSize: 12,
              fontWeight: 700,
              fill: "#4b5563",
              formatter: (v: unknown) => `${Number(v).toLocaleString()}만 원`,
            }}
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.man === maxMan ? COLOR_TOP : COLOR_BASE}
                fillOpacity={entry.man === maxMan ? 1 : 0.3}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
