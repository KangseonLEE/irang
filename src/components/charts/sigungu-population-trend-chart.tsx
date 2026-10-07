"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { REF_LINE_LABEL_GUTTER, RefLineEndLabel } from "./ref-line-end-label";
import { axisTickLabel, niceAxis } from "./nice-axis";
import s from "./chart-styles.module.css";

/**
 * 시군구 인구 5년 추이 차트.
 * - AreaChart(시군구) + 시도 평균 비교선
 * - 평균 이상 진한 색, 미만 흐림 처리는 line strokeWidth + dot 크기로 구현
 * - 호버 툴팁 + 마운트 애니메이션 기본 포함
 */

const COLOR_PRIMARY = "#1B6B5A";
const COLOR_SIDO = "#9ca3af"; // 시도 평균 — 회색 점선

interface DataPoint {
  year: number;
  /** 시군구 인구 */
  population: number;
  /** 같은 연도 시도 평균 인구 (시군구 평균 = 시도총합/시군구수) — 비교선용 */
  sidoAvg?: number;
}

/** Recharts Tooltip props */
interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ dataKey?: string; value?: number; color?: string; name?: string }>;
  label?: number;
}

interface ChartDotProps {
  cx?: number;
  cy?: number;
  payload?: DataPoint;
  index?: number;
  // 평균 이상 여부는 컴포넌트 외부에서 enriched data로 전달
}

interface Props {
  data: DataPoint[];
  /** 시군구 이름 (툴팁/범례 표시용) */
  sigunguName: string;
  /** 시도 평균 비교선 표시 여부 */
  showSidoCompare?: boolean;
}

function formatPop(v: number): string {
  // 인구를 "12.3만" 형식으로
  if (v >= 10000) return `${(v / 10000).toFixed(1)}만`;
  return v.toLocaleString("ko-KR");
}

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const sg = payload.find((p) => p.dataKey === "population");
  const sido = payload.find((p) => p.dataKey === "sidoAvg");

  return (
    <div className={s.tooltip}>
      <p className={s.tooltipLabel}>{label}년</p>
      {sg && sg.value !== undefined && (
        <div className={s.tooltipRow}>
          <span className={s.tooltipDot} style={{ background: COLOR_PRIMARY }} />
          <span>{sg.name}</span>
          <span className={s.tooltipValue}>{sg.value.toLocaleString("ko-KR")}명</span>
        </div>
      )}
      {sido && sido.value !== undefined && (
        <div className={s.tooltipRow}>
          <span className={s.tooltipDot} style={{ background: COLOR_SIDO }} />
          <span>시도 평균</span>
          <span className={s.tooltipValue}>{sido.value.toLocaleString("ko-KR")}명</span>
        </div>
      )}
    </div>
  );
}

function PopulationDot(props: ChartDotProps & { avgPopulation: number }) {
  const { cx, cy, payload, avgPopulation } = props;
  if (!cx || !cy || !payload) return null;
  const isSig = payload.population >= avgPopulation;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={isSig ? 5 : 3}
      fill={COLOR_PRIMARY}
      fillOpacity={isSig ? 1 : 0.5}
      stroke="#fff"
      strokeWidth={isSig ? 2 : 1.5}
      style={
        isSig
          ? { filter: "drop-shadow(0 0 5px rgba(27, 107, 90, 0.45))" }
          : undefined
      }
    />
  );
}

export default function SigunguPopulationTrendChart({
  data,
  sigunguName,
  showSidoCompare = true,
}: Props) {
  const avgPopulation = useMemo(
    () =>
      data.length > 0
        ? data.reduce((sum, d) => sum + d.population, 0) / data.length
        : 0,
    [data],
  );

  // Y축 — 1·2·5 단위 눈금(niceAxis). 예전엔 범위를 1,000 단위로 내림·올림해 "32.3만·25.7만" 같은 눈금이 나왔다(10/3 QA).
  // 0 에서 시작하지 않는 축이라 변화 폭이 작아도 그래프가 살아 보인다.
  const axis = useMemo(() => {
    const allValues: number[] = [];
    for (const d of data) {
      allValues.push(d.population);
      if (d.sidoAvg !== undefined) allValues.push(d.sidoAvg);
    }
    if (allValues.length === 0) return { domain: [0, 100] as [number, number], ticks: [0, 25, 50, 75, 100], step: 25 };
    const { domain, ticks } = niceAxis(allValues);
    return { domain, ticks, step: ticks.length > 1 ? ticks[1] - ticks[0] : 1 };
  }, [data]);

  return (
    <div>
      <div className={s.chartWrapper}>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart
            data={data}
            margin={{ top: 16, right: REF_LINE_LABEL_GUTTER, left: -8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="sigunguPopGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR_PRIMARY} stopOpacity={0.3} />
                <stop offset="100%" stopColor={COLOR_PRIMARY} stopOpacity={0.02} />
              </linearGradient>
            </defs>

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

            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => axisTickLabel(v, axis.step)}
              domain={axis.domain}
              ticks={axis.ticks}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* 시군구 5년 평균 참조선 */}
            <ReferenceLine
              y={avgPopulation}
              stroke={COLOR_PRIMARY}
              strokeDasharray="4 4"
              strokeOpacity={0.3}
              // "평균"만 쓰면 범례의 "시도 평균"(회색 점선)과 헷갈린다 — 이 선은 이 시·군·구의 5년 평균
              label={<RefLineEndLabel above="5년 평균" below={formatPop(Math.round(avgPopulation))} />}
            />

            {/* 시군구 인구 — Area */}
            <Area
              type="monotone"
              dataKey="population"
              name={sigunguName}
              fill="url(#sigunguPopGradient)"
              stroke={COLOR_PRIMARY}
              strokeWidth={2.5}
              dot={<PopulationDot avgPopulation={avgPopulation} />}
              activeDot={{ r: 6, stroke: COLOR_PRIMARY, strokeWidth: 2.5, fill: "#fff" }}
              animationDuration={1200}
              animationEasing="ease-out"
            />

            {/* 시도 평균 비교선 (선택) — 회색 점선 */}
            {showSidoCompare && (
              <Line
                type="monotone"
                dataKey="sidoAvg"
                name="시도 평균"
                stroke={COLOR_SIDO}
                strokeWidth={1.5}
                strokeDasharray="5 4"
                dot={false}
                activeDot={{ r: 4, stroke: COLOR_SIDO, strokeWidth: 1.5, fill: "#fff" }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 범례 */}
      <div className={s.legend}>
        <span className={s.legendItem}>
          <span className={s.legendDot} style={{ background: COLOR_PRIMARY }} />
          {sigunguName}
        </span>
        {showSidoCompare && (
          <span className={s.legendItem}>
            <span
              className={`${s.legendDot} ${s.legendDotRound}`}
              style={{ background: COLOR_SIDO }}
            />
            시도 평균
          </span>
        )}
      </div>
    </div>
  );
}
