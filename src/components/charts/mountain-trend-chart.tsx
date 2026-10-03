"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";
import { changePct, signedPct, type YearlyMountain } from "@/lib/data/stats";
import { REF_LINE_LABEL_GUTTER, RefLineEndLabel } from "./ref-line-end-label";
import s from "./chart-styles.module.css";

interface TooltipEntry {
  dataKey?: string;
  value?: number;
  color?: string;
  name?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: number;
}

const COLOR_PRIMARY = "#1B6B5A";
const COLOR_PRIMARY_MUTED = "rgba(27, 107, 90, 0.22)";
const COLOR_TREND_LINE = "#E8913A";

interface Props {
  data: YearlyMountain[];
}

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const households = payload.find((p) => p.dataKey === "households");

  return (
    <div className={s.tooltip}>
      <p className={s.tooltipLabel}>{label}년</p>
      {households && (
        <div className={s.tooltipRow}>
          <span
            className={s.tooltipDot}
            style={{ background: COLOR_PRIMARY }}
          />
          <span>귀산촌 가구</span>
          <span className={s.tooltipValue}>
            {households.value?.toLocaleString("ko-KR")}가구
          </span>
        </div>
      )}
      {payload.find((p) => p.dataKey === "trendline") && (
        <div className={s.tooltipRow}>
          <span
            className={s.tooltipDot}
            style={{ background: COLOR_TREND_LINE }}
          />
          <span>추세선</span>
          <span className={s.tooltipValue}>
            {payload
              .find((p) => p.dataKey === "trendline")
              ?.value?.toLocaleString("ko-KR")}
          </span>
        </div>
      )}
    </div>
  );
}

function calcTrendline(data: YearlyMountain[]) {
  const n = data.length;
  const sumX = data.reduce((acc, _, i) => acc + i, 0);
  const sumY = data.reduce((acc, d) => acc + d.households, 0);
  const sumXY = data.reduce((acc, d, i) => acc + i * d.households, 0);
  const sumX2 = data.reduce((acc, _, i) => acc + i * i, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return data.map((d, i) => ({
    ...d,
    trendline: Math.round(intercept + slope * i),
  }));
}

export default function MountainTrendChart({ data }: Props) {
  const avg = useMemo(
    () => data.reduce((sum, d) => sum + d.households, 0) / data.length,
    [data],
  );

  const enrichedData = useMemo(() => calcTrendline(data), [data]);

  /* 축·배지는 data 에서 계산 — 막대는 0 에서 시작(1만 가구 단위로 위만 올린다). 10/3 정정 전 고정 domain
     [1000, 3200] 은 근거 없는 2천 가구대 수치에 맞춰져 있었다 */
  const view = useMemo(() => {
    const first = data[0];
    const latest = data[data.length - 1];
    const best = data.reduce((a, b) => (b.households > a.households ? b : a));
    const top = Math.ceil(best.households / 10_000) * 10_000;
    const ticks: number[] = [];
    for (let v = 0; v <= top; v += 10_000) ticks.push(v);
    return {
      first,
      latest,
      best,
      change: changePct(latest.households, first.households),
      axis: { domain: [0, top] as [number, number], ticks },
    };
  }, [data]);

  return (
    <div>
      <div className={s.chartWrapper}>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart
            data={enrichedData}
            margin={{ top: 10, right: REF_LINE_LABEL_GUTTER, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0,0,0,0.06)"
              vertical={false}
            />

            <XAxis
              dataKey="year"
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
            />

            {/* 눈금이 "5만" 두 글자라 기본 폭(60)은 남는다 — 오른쪽 라벨 여백만큼 돌려받는다 */}
            <YAxis
              width={36}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v / 10_000}만`}
              domain={view.axis.domain}
              ticks={view.axis.ticks}
            />

            <ReferenceLine
              y={avg}
              stroke="#9ca3af"
              strokeDasharray="6 3"
              strokeWidth={1}
              label={<RefLineEndLabel above="평균" below={Math.round(avg).toLocaleString("ko-KR")} />}
            />

            <Tooltip content={<CustomTooltip />} />

            <Bar
              dataKey="households"
              name="귀산촌 가구"
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {enrichedData.map((entry) => (
                <Cell
                  key={entry.year}
                  fill={
                    entry.households >= avg
                      ? COLOR_PRIMARY
                      : COLOR_PRIMARY_MUTED
                  }
                />
              ))}
            </Bar>

            <Line
              dataKey="trendline"
              name="추세선"
              stroke={COLOR_TREND_LINE}
              strokeWidth={2.5}
              strokeDasharray="6 3"
              dot={false}
              activeDot={false}
              animationDuration={1800}
              animationEasing="ease-out"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className={s.legend}>
        <span className={s.legendItem}>
          <span className={s.legendDot} style={{ background: COLOR_PRIMARY }} />
          평균 이상
        </span>
        <span className={s.legendItem}>
          <span
            className={s.legendDot}
            style={{ background: COLOR_PRIMARY_MUTED }}
          />
          평균 미만
        </span>
        <span className={s.legendItem}>
          <span
            className={s.legendDot}
            style={{ background: COLOR_TREND_LINE, borderRadius: "50%" }}
          />
          추세선
        </span>
      </div>

      <div className={s.insightBadgeRow}>
        <span className={s.insightBadge}>
          {view.first.year}→{view.latest.year} {signedPct(view.change)}
        </span>
        <span className={s.insightBadge}>
          최다 {view.best.year}년 {view.best.households.toLocaleString("ko-KR")}가구
        </span>
      </div>
    </div>
  );
}
