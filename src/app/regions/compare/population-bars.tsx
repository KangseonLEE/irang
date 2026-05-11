"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
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

interface MetricTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  unit: string;
  category: string;
}

/** 값 포맷: 인구는 만 단위 축약, 그 외는 단위 그대로 */
function formatValue(val: number, category: string, unit: string): string {
  if (category === "인구수") {
    if (val >= 10000) return `${(val / 10000).toFixed(1)}만${unit}`;
    return `${val.toLocaleString()}${unit}`;
  }
  return `${val.toLocaleString()}${unit}`;
}

function MetricTooltip({
  active,
  payload,
  label,
  unit,
  category,
}: MetricTooltipProps) {
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
            {formatValue(entry.value, category, unit)}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * 메트릭별 단일 horizontal bar 차트.
 *
 * 2026-05-11 분리: 단일 차트에 인구·의료·학교를 함께 그리면 인구(만 단위) 대비
 * 의료·학교(수십~수천) bar가 거의 0px이라 회장 화면에서 안 보임.
 * 메트릭별 mini chart 3개로 분리해 각각 자체 X축 스케일.
 */
function MetricBar({
  category,
  unit,
  data,
}: {
  category: string;
  unit: string;
  data: Array<{ name: string; value: number; color: string }>;
}) {
  if (data.length === 0) return null;
  const chartData = data.map((d) => ({ name: d.name, value: d.value }));
  const colorMap = new Map(data.map((d) => [d.name, d.color]));
  const height = Math.max(120, data.length * 36 + 50);

  return (
    <div className={cs.metricGroup}>
      <h3 className={cs.metricGroupTitle}>{category}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 56, left: 12, bottom: 0 }}
        >
          <XAxis type="number" hide domain={[0, "dataMax"]} />
          <YAxis
            type="category"
            dataKey="name"
            width={92}
            tick={{ fontSize: 13, fill: "var(--muted-foreground, #6b7280)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={
              <MetricTooltip
                unit={unit}
                category={category}
              />
            }
            cursor={{ fill: "var(--muted, #f4f4f5)", opacity: 0.4 }}
          />
          <Bar dataKey="value" name={category} radius={[0, 6, 6, 0]} barSize={20}>
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={colorMap.get(entry.name) ?? COLORS[0]}
                fillOpacity={0.9}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
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

  if (validData.length < 2) return null;

  // 메트릭별 데이터 추출 — null 제외
  const populationData = validData
    .filter((d) => d.population !== null)
    .map((d, i) => ({
      name: d.provinceName,
      value: d.population as number,
      color: COLORS[validData.findIndex((v) => v.provinceName === d.provinceName) % COLORS.length],
    }));

  const medicalData = validData
    .filter((d) => d.medicalCount !== null)
    .map((d) => ({
      name: d.provinceName,
      value: d.medicalCount as number,
      color: COLORS[validData.findIndex((v) => v.provinceName === d.provinceName) % COLORS.length],
    }));

  const schoolData = validData
    .filter((d) => d.schoolCount !== null)
    .map((d) => ({
      name: d.provinceName,
      value: d.schoolCount as number,
      color: COLORS[validData.findIndex((v) => v.provinceName === d.provinceName) % COLORS.length],
    }));

  return (
    <div className={cs.metricGrid}>
      <MetricBar category="인구수" unit="명" data={populationData} />
      <MetricBar category="의료기관" unit="개소" data={medicalData} />
      <MetricBar category="학교" unit="개교" data={schoolData} />
    </div>
  );
}
