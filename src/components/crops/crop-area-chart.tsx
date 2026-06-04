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
import { formatHectaresWithPyeong, formatPyeongFromHa } from "@/lib/format";
import s from "@/components/charts/chart-styles.module.css";

/** RegionSection이 넘기는 시·도 재배면적 항목 (CropStatItem에서 필요한 필드만) */
export interface CropAreaDatum {
  regionName: string;
  cultivationArea: number; // ha
}

interface Props {
  /** 재배면적 내림차순 정렬 + 0 초과 항목만 (호출부에서 필터·정렬 완료) */
  data: CropAreaDatum[];
}

const COLOR_TOP = "#1B6B5A";
const COLOR_BASE = "#3EA088";

/** Recharts가 Tooltip content에 주입하는 props */
interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: CropAreaDatum & { rank: number };
    color?: string;
  }>;
}

function CustomTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const { regionName, cultivationArea, rank } = payload[0].payload;
  const pyeong = formatPyeongFromHa(cultivationArea);
  return (
    <div className={s.tooltip}>
      <p className={s.tooltipLabel}>{rank}위 · {regionName}</p>
      <div className={s.tooltipRow}>
        <span
          className={s.tooltipDot}
          style={{ background: payload[0].color }}
        />
        <span>재배면적</span>
        <span className={s.tooltipValue}>
          {cultivationArea.toLocaleString()}ha
        </span>
      </div>
      {pyeong && (
        <div className={s.tooltipRow}>
          <span className={s.tooltipDot} style={{ background: "transparent" }} />
          <span>{pyeong}</span>
        </div>
      )}
    </div>
  );
}

/**
 * 작물 재배면적 시·도 수평 Bar 차트.
 * 최대 면적 = 진한 primary, 나머지 = 면적 비례 opacity 스케일.
 * 데이터는 호출부에서 정렬·필터 완료된 상태로 받는다.
 */
export default function CropAreaChart({ data }: Props) {
  const enriched = useMemo(() => {
    const max = data.length > 0 ? data[0].cultivationArea : 1;
    return data.map((d, i) => ({
      ...d,
      rank: i + 1,
      // 1위는 진한색, 나머지는 면적 비례(0.35~0.85) opacity 스케일
      ratio: max > 0 ? d.cultivationArea / max : 0,
    }));
  }, [data]);

  if (enriched.length === 0) return null;

  return (
    <div className={s.chartWrapper} style={{ minHeight: 180 }}>
      <ResponsiveContainer width="100%" height={enriched.length * 46 + 20}>
        <BarChart
          data={enriched}
          layout="vertical"
          margin={{ top: 0, right: 56, left: 0, bottom: 0 }}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${Number(v).toLocaleString()}ha`}
            domain={[0, "auto"]}
          />
          <YAxis
            type="category"
            dataKey="regionName"
            tick={{ fontSize: 13, fill: "#374151", fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            width={84}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(0,0,0,0.03)" }}
          />
          <Bar
            dataKey="cultivationArea"
            radius={[0, 6, 6, 0]}
            animationDuration={800}
            animationEasing="ease-out"
            barSize={26}
            label={{
              position: "right",
              fontSize: 12,
              fontWeight: 700,
              fill: "#4b5563",
              formatter: (v: unknown) =>
                formatHectaresWithPyeong(Number(v)),
            }}
          >
            {enriched.map((entry) => (
              <Cell
                key={entry.regionName}
                fill={entry.rank === 1 ? COLOR_TOP : COLOR_BASE}
                fillOpacity={entry.rank === 1 ? 1 : 0.35 + entry.ratio * 0.5}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
