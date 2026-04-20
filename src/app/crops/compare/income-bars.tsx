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
  LabelList,
  ReferenceLine,
  type LabelProps,
} from "recharts";
import cs from "@/components/charts/chart-styles.module.css";

const COLORS = ["#1b6b5a", "#e67e22", "#3498db"] as const;

export interface IncomeBarsProps {
  crops: Array<{
    name: string;
    emoji: string;
    incomeMin: number; // 만원 단위
    incomeMax: number;
  }>;
}

interface ChartDatum {
  label: string;
  base: number;
  extra: number;
  total: number;
  color: string;
  isRange: boolean;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDatum }>;
}

function CustomTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className={cs.tooltip}>
      <p className={cs.tooltipLabel}>{d.label}</p>
      <div className={cs.tooltipRow}>
        <span className={cs.tooltipDot} style={{ background: d.color }} />
        <span>예상 소득</span>
        <span className={cs.tooltipValue}>
          {d.isRange
            ? `${d.base}~${d.total}만원/10a`
            : `${d.total}만원/10a`}
        </span>
      </div>
    </div>
  );
}

/** 막대 위 라벨 렌더러 — Recharts LabelList content에 전달 */
function RenderLabel(props: LabelProps) {
  const x = Number(props.x ?? 0);
  const y = Number(props.y ?? 0);
  const width = Number(props.width ?? 0);
  const value = Number(props.value ?? 0);
  if (!value) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="var(--foreground, #333)"
      textAnchor="middle"
      fontSize={12}
      fontWeight={700}
    >
      {value.toLocaleString()}만원
    </text>
  );
}

export function IncomeBars({ crops }: IncomeBarsProps) {
  const chartData = useMemo<ChartDatum[]>(() => {
    return crops.map((crop, i) => {
      const isRange = crop.incomeMin !== crop.incomeMax;
      return {
        label: `${crop.emoji} ${crop.name}`,
        base: isRange ? crop.incomeMin : crop.incomeMin,
        extra: isRange ? crop.incomeMax - crop.incomeMin : 0,
        total: crop.incomeMax,
        color: COLORS[i],
        isRange,
      };
    });
  }, [crops]);

  const avg = useMemo(() => {
    if (crops.length < 2) return 0;
    const sum = crops.reduce((acc, c) => acc + (c.incomeMin + c.incomeMax) / 2, 0);
    return Math.round(sum / crops.length);
  }, [crops]);

  const maxVal = useMemo(() => {
    return Math.max(...crops.map((c) => c.incomeMax), 0);
  }, [crops]);

  return (
    <div className={cs.chartWrapper}>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
          margin={{ top: 32, right: 16, bottom: 8, left: 8 }}
          barCategoryGap="30%"
        >
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "var(--foreground, #333)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground, #6b7280)" }}
            axisLine={false}
            tickLine={false}
            domain={[0, Math.ceil(maxVal * 1.2)]}
            tickFormatter={(v: number) => `${v}`}
            width={48}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
          />

          {/* 범위가 있는 경우: base(하단) + extra(상단) 스택 */}
          <Bar
            dataKey="base"
            stackId="income"
            radius={[0, 0, 0, 0]}
            animationDuration={600}
          >
            {chartData.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Bar>
          <Bar
            dataKey="extra"
            stackId="income"
            radius={[6, 6, 0, 0]}
            animationDuration={600}
          >
            {chartData.map((d, i) => (
              <Cell
                key={i}
                fill={d.isRange ? `${d.color}88` : d.color}
              />
            ))}
            <LabelList dataKey="total" content={RenderLabel} />
          </Bar>

          {/* 평균선 */}
          {avg > 0 && (
            <ReferenceLine
              y={avg}
              stroke="var(--muted-foreground, #9ca3af)"
              strokeDasharray="4 4"
              label={{
                value: `평균 ${avg}만원`,
                position: "right",
                fontSize: 11,
                fill: "var(--muted-foreground, #9ca3af)",
              }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
