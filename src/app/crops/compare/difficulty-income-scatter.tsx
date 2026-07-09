"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
} from "recharts";
import { CropImage } from "@/components/ui/crop-image";
import cs from "@/components/charts/chart-styles.module.css";
import s from "./difficulty-income-scatter.module.css";

/**
 * 난이도 × 소득 산점도 — 이 페이지 킬러 시각화.
 *
 * ⚠️ 임의 점수 절대 금지 (레이더 폐기 이유). 실데이터만 사용:
 *  - x축 = 난이도 (쉬움=1 / 보통=2 / 어려움=3, 이산값)
 *  - y축 = 예상 소득 (parseIncome10a 실값, 만원/10a)
 *
 * 난이도가 이산값이라 같은 난이도 작물끼리 x가 겹침 → x-jitter 로 분산.
 * 각 점은 작물별 색 + 작물명 라벨.
 */

const COLORS = ["#1b6b5a", "#e67e22", "#3498db", "#9b59b6"] as const;

const DIFFICULTY_X: Record<string, number> = { 쉬움: 1, 보통: 2, 어려움: 3 };
const X_LABEL: Record<number, string> = { 1: "쉬움", 2: "보통", 3: "어려움" };

export interface ScatterCrop {
  id: string;
  name: string;
  difficulty: string;
  /** parseIncome10a 실값 (만원/10a). 파싱 불가 작물은 호출부에서 제외. */
  income10a: number;
}

export interface DifficultyIncomeScatterProps {
  crops: ScatterCrop[];
}

interface ScatterPoint {
  x: number;
  y: number;
  name: string;
  difficulty: string;
  color: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ScatterPoint }>;
}

function CustomTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className={cs.tooltip}>
      <p className={cs.tooltipLabel}>{d.name}</p>
      <div className={cs.tooltipRow}>
        <span className={cs.tooltipDot} style={{ background: d.color }} />
        <span>난이도</span>
        <span className={cs.tooltipValue}>{d.difficulty}</span>
      </div>
      <div className={cs.tooltipRow}>
        <span className={cs.tooltipDot} style={{ background: d.color }} />
        <span>예상 소득</span>
        <span className={cs.tooltipValue}>{d.y.toLocaleString()}만 원/10a</span>
      </div>
    </div>
  );
}

/**
 * 결정론적 jitter — 작물 id 문자열을 해시해서 -0.26~0.26 범위 오프셋.
 * (Math.random 미사용 — SSR/CSR 일관 + 리렌더마다 점 위치 안 흔들림)
 */
function deterministicJitter(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  const unit = ((h % 1000) + 1000) % 1000; // 0~999
  return (unit / 999) * 0.52 - 0.26; // -0.26 ~ 0.26
}

/** 점 + 작물명 라벨 SVG 렌더러 */
interface DotProps {
  cx?: number;
  cy?: number;
  payload?: ScatterPoint;
}

function CropDot({ cx, cy, payload }: DotProps) {
  if (cx == null || cy == null || !payload) return null;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={7}
        fill={payload.color}
        stroke="#fff"
        strokeWidth={2}
      />
      <text
        x={cx}
        y={cy - 13}
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        fill="var(--foreground, #0d2e27)"
      >
        {payload.name}
      </text>
    </g>
  );
}

export function DifficultyIncomeScatter({ crops }: DifficultyIncomeScatterProps) {
  const points = useMemo<ScatterPoint[]>(() => {
    return crops.map((c, i) => ({
      x: (DIFFICULTY_X[c.difficulty] ?? 2) + deterministicJitter(c.id),
      y: c.income10a,
      name: c.name,
      difficulty: c.difficulty,
      color: COLORS[i % COLORS.length],
    }));
  }, [crops]);

  const maxIncome = useMemo(
    () => Math.max(...crops.map((c) => c.income10a), 0),
    [crops],
  );

  return (
    <div>
      <div className={cs.chartWrapper}>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 24, right: 24, bottom: 12, left: 4 }}>
            <XAxis
              type="number"
              dataKey="x"
              domain={[0.5, 3.5]}
              ticks={[1, 2, 3]}
              tickFormatter={(v: number) => X_LABEL[v] ?? ""}
              tick={{ fontSize: 12, fill: "var(--foreground, #333)" }}
              axisLine={{ stroke: "var(--border, #e5e7eb)" }}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[0, Math.ceil(maxIncome * 1.2)]}
              tick={{ fontSize: 11, fill: "var(--muted-foreground, #6b7280)" }}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={(v: number) => `${v.toLocaleString()}`}
            />
            <ZAxis range={[120, 120]} />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ strokeDasharray: "3 3", stroke: "var(--border, #d1d5db)" }}
            />
            <Scatter data={points} shape={<CropDot />} isAnimationActive>
              {points.map((p, i) => (
                <Cell key={i} fill={p.color} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* 축 안내 */}
      <p className={s.axisHint}>
        가로축은 난이도, 세로축은 10a당 예상 소득(만 원)이에요. 오른쪽 위일수록
        어렵고 고수익, 왼쪽 위일수록 쉽고 고수익이에요.
      </p>

      {/* 범례 — thumbnail 식별 */}
      <div className={cs.legend}>
        {crops.map((crop, i) => (
          <span key={crop.id} className={cs.legendItem}>
            <span
              className={cs.legendDot}
              style={{
                background: COLORS[i % COLORS.length],
                borderRadius: "50%",
              }}
            />
            <CropImage cropId={crop.id} cropName={crop.name} size="inline" />
            {crop.name}
          </span>
        ))}
      </div>
    </div>
  );
}
