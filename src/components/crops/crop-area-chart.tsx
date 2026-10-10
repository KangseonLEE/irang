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
import { formatPyeongFromHa } from "@/lib/format";
import s from "@/components/charts/chart-styles.module.css";

/** RegionSection이 넘기는 시·도 재배면적 항목 (lib/data/crop-areas 에서 시·도 이름으로 변환) */
interface CropAreaDatum {
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
          {cultivationArea.toLocaleString("ko-KR")}ha
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
      <ResponsiveContainer width="100%" height={enriched.length * 46}>
        <BarChart
          data={enriched}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
        >
          {/* 값은 막대 끝 라벨이 보여 준다 — 축 눈금 대신 오른쪽에 라벨 자리를 둔다(1위 라벨이 꺾이던 것, 10/9) */}
          <XAxis
            type="number"
            hide
            domain={[0, (dataMax: number) => dataMax * 1.5]}
          />
          <YAxis
            type="category"
            dataKey="regionName"
            tick={{ fontSize: 13, fill: "#374151", fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            width={104}
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
              // 평 환산은 툴팁·aria-label 에 있다 — 막대 끝엔 ha 만(모바일에서 두 줄로 꺾이지 않게)
              formatter: (v: unknown) => `${Math.round(Number(v)).toLocaleString("ko-KR")}ha`,
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
