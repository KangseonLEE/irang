"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { changePct, signedPct, type SmartfarmArea } from "@/lib/data/stats";
import { niceAxis } from "./nice-axis";
import s from "./chart-styles.module.css";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ color?: string; name?: string; value?: number; payload?: SmartfarmArea }>;
  label?: number;
}

interface ChartDotProps {
  cx?: number;
  cy?: number;
  payload?: SmartfarmArea;
  latestYear?: number;
}

const COLOR_PRIMARY = "#1B6B5A";
const COLOR_SECONDARY = "#A8D9CC";
/** 「스마트팜 확산 방안」 발표 연도 (관계부처 합동, 2018.4) */
const POLICY_YEAR = 2018;

interface Props {
  /** 시설원예 스마트팜 보급 면적 — 공식 수치가 없는 해는 빠져 있다(빈 해를 지어내지 않는다) */
  data: SmartfarmArea[];
}

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className={s.tooltip}>
      <p className={s.tooltipLabel}>{label}년</p>
      {payload.map((entry, i: number) => (
        <div className={s.tooltipRow} key={i}>
          <span
            className={s.tooltipDot}
            style={{ background: entry.color }}
          />
          <span>{entry.name}</span>
          <span className={s.tooltipValue}>
            {entry.value?.toLocaleString("ko-KR")}ha{entry.payload?.provisional ? " (잠정)" : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

function AreaDot(props: ChartDotProps) {
  const { cx, cy, payload, latestYear } = props;
  if (!cx || !cy || !payload) return null;
  const isSig = payload.year === latestYear;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={isSig ? 6 : 3}
      fill={payload.provisional ? "#fff" : isSig ? COLOR_PRIMARY : COLOR_SECONDARY}
      stroke={payload.provisional ? COLOR_PRIMARY : "#fff"}
      strokeWidth={isSig ? 2.5 : 1.5}
      style={
        isSig
          ? { filter: "drop-shadow(0 0 6px rgba(27, 107, 90, 0.5))" }
          : undefined
      }
    />
  );
}

export default function SmartfarmTrendChart({ data }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const handleMouseMove = useCallback(
    (state: { activeLabel?: string | number }) => {
      if (typeof state?.activeLabel === "number") {
        setHoveredYear(state.activeLabel);
      }
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredYear(null);
  }, []);

  const view = useMemo(() => {
    const first = data[0];
    const latest = data[data.length - 1];
    return {
      first,
      latest,
      axis: niceAxis(data.map((d) => d.area)),
      growth: changePct(latest.area, first.area),
      years: data.map((d) => d.year),
    };
  }, [data]);

  return (
    <div>
      <div className={s.chartWrapper}>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart
            data={data}
            margin={{ top: 28, right: 12, left: 4, bottom: 0 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient
                id="areaGradientSf"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={COLOR_SECONDARY}
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor={COLOR_SECONDARY}
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0,0,0,0.06)"
              vertical={false}
            />

            {/* 숫자 축 — 공식 수치가 없는 해는 칸이 비어 보이게 둔다 */}
            <XAxis
              dataKey="year"
              type="number"
              domain={["dataMin", "dataMax"]}
              ticks={view.years}
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
            />

            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}천ha`}
              domain={view.axis.domain}
              ticks={view.axis.ticks}
            />

            {view.years.includes(POLICY_YEAR) && (
              <ReferenceLine
                x={POLICY_YEAR}
                stroke={COLOR_PRIMARY}
                strokeDasharray="4 4"
                strokeOpacity={0.3}
                label={{
                  value: "확산 방안 발표",
                  position: "top",
                  fontSize: 10,
                  fill: "#9ca3af",
                }}
              />
            )}

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="area"
              name="보급 면적"
              fill="url(#areaGradientSf)"
              stroke={COLOR_SECONDARY}
              strokeWidth={2.5}
              dot={<AreaDot latestYear={view.latest.year} />}
              activeDot={{
                r: 7,
                stroke: COLOR_PRIMARY,
                strokeWidth: 2.5,
                fill: "#fff",
              }}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className={s.legend}>
        <span className={s.legendItem}>
          <span className={s.legendDot} style={{ background: COLOR_SECONDARY }} />
          시설원예 스마트팜 보급 면적 (누적)
        </span>
        {data.some((d) => d.provisional) && (
          <span className={s.legendItem}>
            <span className={`${s.legendDot} ${s.legendDotHollow}`} />
            잠정치
          </span>
        )}
      </div>

      <div className={s.insightBadgeRow}>
        <span className={s.insightBadge}>
          {view.first.year}→{view.latest.year} 면적 {signedPct(view.growth, 0)}
        </span>
        <span className={s.insightBadge}>
          {view.latest.year} {view.latest.area.toLocaleString("ko-KR")}ha
        </span>
      </div>
    </div>
  );
}
