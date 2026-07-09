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
import { CropImage } from "@/components/ui/crop-image";
import cs from "@/components/charts/chart-styles.module.css";

const COLORS = ["#1b6b5a", "#e67e22", "#3498db"] as const;

export interface IncomeBarsProps {
  crops: Array<{
    id: string;
    name: string;
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
            ? `${d.base}~${d.total}만 원/10a`
            : `${d.total}만 원/10a`}
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
      {value.toLocaleString()}만 원
    </text>
  );
}

/** 평균선 라벨 — ReferenceLine이 viewBox를 주입한다.
 *  우측 경계 안쪽(textAnchor=end)에 배치해 좁은 모바일 폭에서도 잘리지 않음. */
interface AvgLabelProps {
  avg: number;
  viewBox?: { x?: number; y?: number; width?: number; height?: number };
}

function AvgLabel({ avg, viewBox }: AvgLabelProps) {
  const x = Number(viewBox?.x ?? 0);
  const y = Number(viewBox?.y ?? 0);
  const width = Number(viewBox?.width ?? 0);
  return (
    <text
      x={x + width - 4}
      y={y - 5}
      fill="var(--muted-foreground, #9ca3af)"
      textAnchor="end"
      fontSize={11}
      fontWeight={600}
    >
      평균 {avg.toLocaleString()}만 원
    </text>
  );
}

export function IncomeBars({ crops }: IncomeBarsProps) {
  const chartData = useMemo<ChartDatum[]>(() => {
    return crops.map((crop, i) => {
      const isRange = crop.incomeMin !== crop.incomeMax;
      return {
        label: crop.name,
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
    <div>
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

          {/* 평균선 — 라벨을 선 위쪽·우측 안쪽에 배치(textAnchor=end)해
              모바일(360~430px)에서 우측 경계 밖으로 잘리지 않게 한다. */}
          {avg > 0 && (
            <ReferenceLine
              y={avg}
              stroke="var(--muted-foreground, #9ca3af)"
              strokeDasharray="4 4"
              label={<AvgLabel avg={avg} />}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
      </div>

      {/* 범례 — thumbnail 식별 */}
      <div className={cs.legend}>
        {crops.map((crop, i) => (
          <span key={crop.id} className={cs.legendItem}>
            <span
              className={cs.legendDot}
              style={{ background: COLORS[i], borderRadius: "50%" }}
            />
            <CropImage cropId={crop.id} cropName={crop.name} size="inline" />
            {crop.name}
          </span>
        ))}
      </div>
    </div>
  );
}
