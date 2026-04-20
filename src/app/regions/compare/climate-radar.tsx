"use client";

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import cs from "@/components/charts/chart-styles.module.css";

/* ── 색상 ── */
const COLORS = ["#1b6b5a", "#e67e22", "#3498db"] as const;

/* ── 축 정의 ── */
const AXES = [
  { key: "avgTemp", label: "평균기온", unit: "℃" },
  { key: "maxTemp", label: "최고기온", unit: "℃" },
  { key: "minTemp", label: "최저기온", unit: "℃" },
  { key: "totalPrecipitation", label: "강수량", unit: "mm" },
  { key: "totalSunshine", label: "일조시간", unit: "hr" },
  { key: "avgHumidity", label: "습도", unit: "%" },
] as const;

type AxisKey = (typeof AXES)[number]["key"];

interface ClimateRadarEntry {
  stationName: string;
  provinceName: string;
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
  totalPrecipitation: number;
  totalSunshine: number;
  avgHumidity: number;
}

interface ClimateRadarProps {
  data: ClimateRadarEntry[];
}

/** 원본 값을 0~100 스케일로 정규화 */
function normalize(
  values: number[],
  value: number,
): number {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return 50;
  return Math.round(((value - min) / (max - min)) * 100);
}

/** Recharts Tooltip content prop 타입 */
interface RadarTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
    payload: Record<string, number | string>;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: RadarTooltipProps) {
  if (!active || !payload?.length) return null;

  const axis = AXES.find((a) => a.label === label);
  const unit = axis?.unit ?? "";

  return (
    <div className={cs.tooltip}>
      <p className={cs.tooltipLabel}>{label}</p>
      {payload.map((entry) => {
        const rawKey = `raw_${entry.dataKey}`;
        const rawVal = entry.payload[rawKey];
        return (
          <div key={entry.dataKey} className={cs.tooltipRow}>
            <span
              className={cs.tooltipDot}
              style={{ background: entry.color }}
            />
            <span>{entry.name}</span>
            <span className={cs.tooltipValue}>
              {typeof rawVal === "number" ? rawVal.toLocaleString() : rawVal}
              {unit}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function ClimateRadar({ data }: ClimateRadarProps) {
  if (data.length < 2) return null;

  /* 축별 min-max 정규화를 위한 원본 값 맵 */
  const rawByAxis: Record<AxisKey, number[]> = {
    avgTemp: data.map((d) => d.avgTemp),
    maxTemp: data.map((d) => d.maxTemp),
    minTemp: data.map((d) => d.minTemp),
    totalPrecipitation: data.map((d) => d.totalPrecipitation),
    totalSunshine: data.map((d) => d.totalSunshine),
    avgHumidity: data.map((d) => d.avgHumidity),
  };

  /* 레이더 차트 데이터: 축 6개 × 지역별 정규화 값 */
  const chartData = AXES.map((axis) => {
    const row: Record<string, number | string> = { axis: axis.label };
    data.forEach((entry, i) => {
      const raw = entry[axis.key];
      row[`region_${i}`] = normalize(rawByAxis[axis.key], raw);
      row[`raw_region_${i}`] = raw;
    });
    return row;
  });

  return (
    <div className={cs.chartWrapper}>
      <ResponsiveContainer width="100%" height={340}>
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="var(--border, #e5e7eb)" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fontSize: 12, fill: "var(--muted-foreground, #6b7280)" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          {data.map((entry, i) => (
            <Radar
              key={entry.stationName}
              name={`${entry.provinceName} ${entry.stationName}`}
              dataKey={`region_${i}`}
              stroke={COLORS[i]}
              fill={COLORS[i]}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          ))}
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>

      {/* 범례 */}
      <div className={cs.legend}>
        {data.map((entry, i) => (
          <div key={entry.stationName} className={cs.legendItem}>
            <span
              className={cs.legendDot}
              style={{ background: COLORS[i], borderRadius: "50%" }}
            />
            <span>
              {entry.provinceName} {entry.stationName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
