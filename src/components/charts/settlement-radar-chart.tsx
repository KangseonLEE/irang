"use client";

import {
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
} from "recharts";
import s from "./chart-styles.module.css";

/**
 * 시군구 정착 점수 레이더 차트.
 * - 4개 차원: 농가 활성도, 인구 안정성, 청년성, 거주 적정성
 * - 시군구 점수(녹색 면) + 시도 평균 점수(회색 점선) 비교
 * - 0~100 스케일, 호버 툴팁 + 마운트 애니메이션
 */

const COLOR_PRIMARY = "#1B6B5A";
const COLOR_AVG = "#9ca3af";

interface RadarPoint {
  axis: string;
  value: number;
  sidoAvg?: number;
  /** 가중치 (%, 툴팁용) */
  weight: number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload?: RadarPoint;
    value?: number;
    name?: string;
    color?: string;
    dataKey?: string;
  }>;
  label?: string;
}

interface Props {
  /** 시군구 차원 점수 */
  dimensions: {
    farm: number;
    populationTrend: number;
    youth: number;
    density: number;
  };
  /** 같은 시도 평균 차원 점수 (선택) */
  sidoAvgDimensions?: {
    farm: number;
    populationTrend: number;
    youth: number;
    density: number;
  };
  /** 시군구 이름 (범례·툴팁용) */
  sigunguName: string;
  /** 시도 짧은 이름 (범례·툴팁용) */
  sidoShortName?: string;
}

const AXIS_META = [
  { key: "farm", label: "농가 활성도", weight: 35 },
  { key: "populationTrend", label: "인구 안정성", weight: 25 },
  { key: "youth", label: "청년성", weight: 25 },
  { key: "density", label: "거주 적정성", weight: 15 },
] as const;

function CustomTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  const sg = payload.find((p) => p.dataKey === "value");
  const avg = payload.find((p) => p.dataKey === "sidoAvg");

  return (
    <div className={s.tooltip}>
      <p className={s.tooltipLabel}>
        {point.axis} <span style={{ color: "#9ca3af", fontWeight: 400 }}>· {point.weight}%</span>
      </p>
      {sg && sg.value !== undefined && (
        <div className={s.tooltipRow}>
          <span className={s.tooltipDot} style={{ background: COLOR_PRIMARY }} />
          <span>{sg.name}</span>
          <span className={s.tooltipValue}>{Math.round(sg.value)}점</span>
        </div>
      )}
      {avg && avg.value !== undefined && (
        <div className={s.tooltipRow}>
          <span className={s.tooltipDot} style={{ background: COLOR_AVG }} />
          <span>{avg.name}</span>
          <span className={s.tooltipValue}>{Math.round(avg.value)}점</span>
        </div>
      )}
    </div>
  );
}

export default function SettlementRadarChart({
  dimensions,
  sidoAvgDimensions,
  sigunguName,
  sidoShortName,
}: Props) {
  const data: RadarPoint[] = AXIS_META.map((m) => ({
    axis: m.label,
    value: dimensions[m.key],
    sidoAvg: sidoAvgDimensions ? sidoAvgDimensions[m.key] : undefined,
    weight: m.weight,
  }));

  return (
    <div>
      <div className={s.chartWrapper}>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke="rgba(0,0,0,0.08)" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fontSize: 12, fill: "#4b5563" }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickCount={5}
            />

            {sidoAvgDimensions && (
              <Radar
                name={`${sidoShortName ?? "시도"} 평균`}
                dataKey="sidoAvg"
                stroke={COLOR_AVG}
                strokeWidth={1.5}
                strokeDasharray="5 4"
                fill={COLOR_AVG}
                fillOpacity={0.06}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            )}

            <Radar
              name={sigunguName}
              dataKey="value"
              stroke={COLOR_PRIMARY}
              strokeWidth={2.5}
              fill={COLOR_PRIMARY}
              fillOpacity={0.22}
              animationDuration={1200}
              animationEasing="ease-out"
            />

            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className={s.legend}>
        <span className={s.legendItem}>
          <span className={s.legendDot} style={{ background: COLOR_PRIMARY }} />
          {sigunguName}
        </span>
        {sidoAvgDimensions && (
          <span className={s.legendItem}>
            <span
              className={s.legendDot}
              style={{ background: COLOR_AVG, borderRadius: "50%" }}
            />
            {sidoShortName ?? "시도"} 평균
          </span>
        )}
      </div>
    </div>
  );
}
