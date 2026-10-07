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
import type { YouthRatio } from "@/lib/data/stats";
import { REF_LINE_LABEL_GUTTER, RefLineEndLabel } from "./ref-line-end-label";
import s from "./chart-styles.module.css";

/** Recharts Tooltip payload entry */
interface TooltipEntry {
  dataKey?: string;
  value?: number;
  color?: string;
  name?: string;
}

/** Recharts가 content element에 주입하는 Tooltip props */
interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: number;
}

/* ── 브랜드 색상 ── */
const COLOR_PRIMARY = "#1B6B5A";
const COLOR_PRIMARY_MUTED = "rgba(27, 107, 90, 0.22)";
const COLOR_TREND_LINE = "#E8913A";

interface Props {
  data: YouthRatio[];
}

/* ── 커스텀 툴팁 ── */
function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const ratio = payload.find((p) => p.dataKey === "ratio");

  return (
    <div className={s.tooltip}>
      <p className={s.tooltipLabel}>{label}년</p>
      {ratio && (
        <div className={s.tooltipRow}>
          <span
            className={s.tooltipDot}
            style={{ background: COLOR_PRIMARY }}
          />
          <span>청년 비중</span>
          <span className={s.tooltipValue}>{ratio.value}%</span>
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
            {payload.find((p) => p.dataKey === "trendline")?.value?.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}

/** 선형 회귀로 추세선 값 계산 */
function calcTrendline(data: YouthRatio[]) {
  const n = data.length;
  const sumX = data.reduce((acc, _, i) => acc + i, 0);
  const sumY = data.reduce((acc, d) => acc + d.ratio, 0);
  const sumXY = data.reduce((acc, d, i) => acc + i * d.ratio, 0);
  const sumX2 = data.reduce((acc, _, i) => acc + i * i, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return data.map((d, i) => ({
    ...d,
    trendline: Number((intercept + slope * i).toFixed(2)),
  }));
}

export default function YouthTrendChart({ data }: Props) {
  const avgRatio = useMemo(
    () => data.reduce((sum, d) => sum + d.ratio, 0) / data.length,
    [data],
  );

  const enrichedData = useMemo(() => calcTrendline(data), [data]);

  /* 축·배지는 data 에서 계산 — "10년간 꾸준한 상승"·"2024 역대 최고 13.1%" 같은 고정 문구를 두지 않는다(10/3) */
  const view = useMemo(() => {
    const first = data[0];
    const latest = data[data.length - 1];
    const best = data.reduce((a, b) => (b.ratio > a.ratio ? b : a));
    const pp = Number((latest.ratio - first.ratio).toFixed(1));
    /* 막대는 0 에서 시작해야 크기 비교가 정직하다 — 위쪽만 5%p 단위로 올린다 */
    const top = Math.ceil(best.ratio / 5) * 5;
    const ticks: number[] = [];
    for (let v = 0; v <= top; v += 5) ticks.push(v);
    return { first, latest, best, pp, axis: { domain: [0, top] as [number, number], ticks } };
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

            {/* 눈금이 "15%" 세 글자라 기본 폭(60)은 남는다 — 오른쪽 라벨 여백만큼 돌려받는다 */}
            <YAxis
              width={36}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}%`}
              domain={view.axis.domain}
              ticks={view.axis.ticks}
            />

            {/* 평균 참조선 */}
            <ReferenceLine
              y={avgRatio}
              stroke="#9ca3af"
              strokeDasharray="6 3"
              strokeWidth={1}
              label={<RefLineEndLabel above="평균" below={`${avgRatio.toFixed(1)}%`} />}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* 막대 — 유의미(평균 이상) vs 비유의미(평균 미만) 색상 차별 */}
            <Bar
              dataKey="ratio"
              name="청년 비중"
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {enrichedData.map((entry) => (
                <Cell
                  key={entry.year}
                  fill={entry.ratio >= avgRatio ? COLOR_PRIMARY : COLOR_PRIMARY_MUTED}
                  stroke={entry.ratio >= avgRatio ? COLOR_PRIMARY : "transparent"}
                  strokeWidth={entry.ratio >= avgRatio ? 0 : 0}
                />
              ))}
            </Bar>

            {/* 추세선 — 오렌지 대시 */}
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

      {/* 범례 */}
      <div className={s.legend}>
        <span className={s.legendItem}>
          <span className={s.legendDot} style={{ background: COLOR_PRIMARY }} />
          평균 이상
        </span>
        <span className={s.legendItem}>
          <span className={s.legendDot} style={{ background: COLOR_PRIMARY_MUTED }} />
          평균 미만
        </span>
        <span className={s.legendItem}>
          <span className={`${s.legendDot} ${s.legendDotRound}`} style={{ background: COLOR_TREND_LINE }} />
          추세선
        </span>
      </div>

      {/* 인사이트 배지 */}
      <div className={s.insightBadgeRow}>
        <span className={s.insightBadge}>
          {view.first.year}→{view.latest.year} {view.pp > 0 ? "+" : ""}
          {view.pp.toFixed(1)}%p
        </span>
        <span className={s.insightBadge}>
          최고 {view.best.year}년 {view.best.ratio}%
        </span>
      </div>
    </div>
  );
}
