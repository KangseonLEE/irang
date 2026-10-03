import type { ReactNode } from "react";
import type { LaneIndicator } from "@/lib/data/journey-lanes-hub";
import s from "./lane-indicators.module.css";

/* 서버 컴포넌트 — 순수 SVG 라 JS 없이 SSR 에 그대로 그려진다(차트 라이브러리 불필요). */

const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** 도넛 조각 색 — 브랜드 그린 밀도 단계(캘린더 8/31 규칙: 팔레트 밖 hue 금지). 마지막(불만족)은 회색 */
const DONUT_COLORS = ["#0f4c3f", "#1b6b5a", "#8cc7b6", "#d1d5db"];

function Ring({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 88 88" className={s.ring} role="img" aria-label={label}>
      <circle cx="44" cy="44" r={RADIUS} className={s.track} />
      {children}
    </svg>
  );
}

function Gauge({ item }: { item: Extract<LaneIndicator, { kind: "gauge" }> }) {
  const pct = Math.max(0, Math.min(100, item.pct));
  return (
    <Ring label={`${item.label} ${item.value}`}>
      <circle
        cx="44"
        cy="44"
        r={RADIUS}
        className={s.arc}
        strokeDasharray={`${(pct / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
      />
    </Ring>
  );
}

function Donut({ item }: { item: Extract<LaneIndicator, { kind: "donut" }> }) {
  const total = item.segments.reduce((sum, seg) => sum + seg.pct, 0) || 1;
  const lengths = item.segments.map((seg) => (seg.pct / total) * CIRCUMFERENCE);
  /* 각 조각의 시작점 = 앞 조각 길이 합 (렌더 중 변수 재할당 없이 미리 계산) */
  const starts = lengths.map((_, i) => lengths.slice(0, i).reduce((a, b) => a + b, 0));
  return (
    <Ring label={`${item.label} ${item.value} — ${item.segments.map((seg) => `${seg.label} ${seg.pct}%`).join(", ")}`}>
      {item.segments.map((seg, i) => {
        const len = lengths[i];
        return (
          <circle
            key={seg.label}
            cx="44"
            cy="44"
            r={RADIUS}
            className={s.segment}
            stroke={DONUT_COLORS[i] ?? DONUT_COLORS[DONUT_COLORS.length - 1]}
            strokeDasharray={`${Math.max(0, len - 1.5)} ${CIRCUMFERENCE}`}
            strokeDashoffset={-starts[i]}
          />
        );
      })}
    </Ring>
  );
}

/**
 * "왜 이 길을 택할까" 보조 지표 — 비율은 게이지, 응답 분포는 도넛, 금액·나이 같은 값은 숫자 그대로.
 */
export function LaneIndicators({ items }: { items: LaneIndicator[] }) {
  return (
    <ul className={s.list}>
      {items.map((item) => (
        <li key={item.label} className={s.item}>
          {item.kind !== "stat" && (
            <span className={s.visual}>
              {item.kind === "gauge" ? <Gauge item={item} /> : <Donut item={item} />}
              <span className={s.center} aria-hidden="true">
                {item.value}
              </span>
            </span>
          )}
          <span className={s.text}>
            {item.kind === "stat" && <span className={s.value}>{item.value}</span>}
            <span className={s.label}>{item.label}</span>
            <span className={s.sub}>{item.sub}</span>
            {item.kind === "donut" && (
              <span className={s.legend}>
                {item.segments.map((seg, i) => (
                  <span key={seg.label} className={s.legendItem}>
                    <span
                      className={s.legendDot}
                      style={{ background: DONUT_COLORS[i] ?? DONUT_COLORS[DONUT_COLORS.length - 1] }}
                      aria-hidden="true"
                    />
                    {seg.label} {seg.pct}%
                  </span>
                ))}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
