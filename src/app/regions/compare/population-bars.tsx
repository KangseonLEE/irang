"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import cs from "@/components/charts/chart-styles.module.css";

/* ── 색상 ── */
const COLORS = ["#1b6b5a", "#e67e22", "#3498db"] as const;

interface PopulationBarsEntry {
  provinceName: string;
  population: number | null;
  medicalCount: number | null;
  schoolCount: number | null;
}

interface PopulationBarsProps {
  data: PopulationBarsEntry[];
}

interface BarTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

/** 인구수 → "12.3만" 포맷 */
function formatValue(val: number, category: string): string {
  if (category === "인구수") {
    if (val >= 10000) return `${(val / 10000).toFixed(1)}만`;
    return val.toLocaleString();
  }
  return `${val.toLocaleString()}개`;
}

function CustomTooltip({ active, payload, label }: BarTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className={cs.tooltip}>
      <p className={cs.tooltipLabel}>{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className={cs.tooltipRow}>
          <span
            className={cs.tooltipDot}
            style={{ background: entry.color }}
          />
          <span>{entry.name}</span>
          <span className={cs.tooltipValue}>
            {formatValue(entry.value, label ?? "")}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function PopulationBars({ data }: PopulationBarsProps) {
  const validData = data.filter(
    (d) =>
      d.population !== null ||
      d.medicalCount !== null ||
      d.schoolCount !== null,
  );

  const chartData = useMemo(() => {
    const categories: Array<{
      category: string;
      key: keyof PopulationBarsEntry;
    }> = [
      { category: "인구수", key: "population" },
      { category: "의료기관", key: "medicalCount" },
      { category: "학교", key: "schoolCount" },
    ];

    return categories
      .filter((cat) => validData.some((d) => d[cat.key] !== null))
      .map((cat) => {
        const row: Record<string, number | string | null> = {
          category: cat.category,
        };
        validData.forEach((entry, i) => {
          row[`region_${i}`] = entry[cat.key] as number | null;
        });
        return row;
      });
  }, [validData]);

  if (validData.length < 2 || chartData.length === 0) return null;

  const barHeight = chartData.length * 60 + 40;

  return (
    <div className={cs.chartWrapper}>
      <ResponsiveContainer width="100%" height={barHeight}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 40, left: 10, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="category"
            width={65}
            tick={{ fontSize: 13, fill: "var(--muted-foreground, #6b7280)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {validData.map((entry, i) => (
            <Bar
              key={entry.provinceName}
              dataKey={`region_${i}`}
              name={entry.provinceName}
              fill={COLORS[i]}
              radius={[0, 6, 6, 0]}
              barSize={14}
            >
              {chartData.map((_, j) => (
                <Cell key={j} fill={COLORS[i]} fillOpacity={0.85} />
              ))}
            </Bar>
          ))}
          <Legend
            verticalAlign="bottom"
            content={() => (
              <div className={cs.legend}>
                {validData.map((entry, i) => (
                  <div key={entry.provinceName} className={cs.legendItem}>
                    <span
                      className={cs.legendDot}
                      style={{ background: COLORS[i], borderRadius: "50%" }}
                    />
                    <span>{entry.provinceName}</span>
                  </div>
                ))}
              </div>
            )}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
