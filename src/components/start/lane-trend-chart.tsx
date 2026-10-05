"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import cs from "@/components/charts/chart-styles.module.css";
import { axisTickLabel, niceAxis } from "@/components/charts/nice-axis";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import s from "./lane-trend-chart.module.css";

/* ── 브랜드 색상 (charts/ 래퍼와 같은 상수) ── */
const COLOR_PRIMARY = "#1B6B5A";
const COLOR_MUTED = "#9ca3af";

interface Point {
  year: number;
  value: number;
}

interface Props {
  points: Point[];
  seriesLabel: string;
  unit: string;
  decimals: number;
  target: { value: number; label: string } | null;
}

interface FormatProps {
  seriesLabel: string;
  unit: string;
  decimals: number;
}

interface TooltipProps extends FormatProps {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: number;
}

interface DotProps extends FormatProps {
  cx?: number;
  cy?: number;
  index?: number;
  payload?: { value?: number };
  lastIndex: number;
}

function format(value: number, unit: string, decimals: number): string {
  const n = value.toLocaleString("ko-KR", {
    minimumFractionDigits: decimals > 0 ? 1 : 0,
    maximumFractionDigits: decimals,
  });
  return unit === "%" ? `${n}%` : `${n}${unit}`;
}


/** 점 — 최근 연도만 크게 + 값 라벨. Recharts 가 cx·cy·index·payload 를 덧붙여 복제한다 */
function TrendDot({ cx, cy, index, payload, lastIndex, unit, decimals }: DotProps) {
  if (cx == null || cy == null) return null;
  if (index !== lastIndex) {
    return <circle cx={cx} cy={cy} r={3} fill="#fff" stroke={COLOR_PRIMARY} strokeWidth={1.5} />;
  }
  return (
    <g>
      <circle cx={cx} cy={cy} r={11} fill={COLOR_PRIMARY} fillOpacity={0.14} />
      <circle cx={cx} cy={cy} r={6} fill={COLOR_PRIMARY} stroke="#fff" strokeWidth={2.5} />
      <text x={cx - 10} y={cy - 16} textAnchor="end" className={s.lastLabel}>
        {format(payload?.value ?? 0, unit, decimals)}
      </text>
    </g>
  );
}

function TrendTooltip({ active, payload, label, seriesLabel, unit, decimals }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className={cs.tooltip}>
      <p className={cs.tooltipLabel}>{label}년</p>
      <div className={cs.tooltipRow}>
        <span className={`${cs.tooltipDot} ${s.tooltipDot}`} />
        <span>{seriesLabel}</span>
        <span className={cs.tooltipValue}>{format(payload[0]?.value ?? 0, unit, decimals)}</span>
      </div>
    </div>
  );
}

/**
 * 정착 유형 상세 "왜 이 길을 택할까" 시계열 (2026-10-02 회장 — 숫자 타일 → 차트).
 * - 서버는 점 배열·단위만 넘긴다(함수 props 없음). 높이는 CSS 로 고정해 CLS 0.
 * - 최근 연도 점을 크게 + 값 라벨로 강조(CLAUDE.md "유의미 포인트 강조"), 정책 목표가 있으면 점선.
 */
export function LaneTrendChart({ points, seriesLabel, unit, decimals, target }: Props) {
  const gradientId = `laneTrend-${useId().replace(/:/g, "")}`;
  /* 동작 줄이기 설정이면 그리기 애니메이션(900ms)을 끈다(10/3 QA). 서버 스냅샷 false — SSR 은 어차피 정적이라
     하이드레이션 불일치가 없고, 크기를 재고 처음 그리는 시점(마운트 후)에는 실제 설정값이 들어와 있다 */
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const lastIndex = points.length - 1;
  const values = points.map((p) => p.value).concat(target ? [target.value] : []);
  /* 0 기준선 — 1.15~1.29만 명처럼 좁은 폭을 확대하면 '유지'가 '급등락'으로 보인다(정직한 축).
     맨 위는 최댓값을 덮는 1·2·5 단위 눈금 — 예전 `최댓값 × 1.18` 은 "17.1천" 같은 눈금을 만들었다(10/3 QA) */
  const axis = niceAxis(values, { zero: true });
  const step = axis.ticks.length > 1 ? axis.ticks[1] - axis.ticks[0] : 1;
  const tick = (v: number) => axisTickLabel(v, step);

  const first = points[0];
  const latest = points[lastIndex];

  return (
    <figure className={s.figure}>
      <div className={s.plot}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 30, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR_PRIMARY} stopOpacity={0.28} />
                <stop offset="100%" stopColor={COLOR_PRIMARY} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: COLOR_MUTED }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              interval="preserveStartEnd"
              minTickGap={14}
            />
            <YAxis
              domain={axis.domain}
              ticks={axis.ticks}
              tick={{ fontSize: 11, fill: COLOR_MUTED }}
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={tick}
            />
            {target && (
              <ReferenceLine
                y={target.value}
                stroke={COLOR_PRIMARY}
                strokeDasharray="5 5"
                strokeOpacity={0.55}
                label={{ value: target.label, position: "insideTopLeft", fill: COLOR_PRIMARY, fontSize: 11, fontWeight: 600 }}
              />
            )}
            <Tooltip content={<TrendTooltip seriesLabel={seriesLabel} unit={unit} decimals={decimals} />} cursor={{ stroke: COLOR_PRIMARY, strokeOpacity: 0.2 }} />
            <Area
              type="monotone"
              dataKey="value"
              name={seriesLabel}
              stroke={COLOR_PRIMARY}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={<TrendDot lastIndex={lastIndex} seriesLabel={seriesLabel} unit={unit} decimals={decimals} />}
              activeDot={{ r: 6, fill: COLOR_PRIMARY, stroke: "#fff", strokeWidth: 2 }}
              isAnimationActive={!reduceMotion}
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {first && latest && (
        <figcaption className={s.caption}>
          {seriesLabel} {first.year}년 {format(first.value, unit, decimals)} → {latest.year}년{" "}
          <strong>{format(latest.value, unit, decimals)}</strong>
        </figcaption>
      )}
    </figure>
  );
}
