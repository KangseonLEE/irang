"use client";

import { useMemo } from "react";
import s from "./farming-calendar.module.css";

// ── 타입 ──

interface CropSeasonInput {
  id: string;
  name: string;
  emoji: string;
  growingSeason: string;
}

export interface FarmingCalendarProps {
  crops: CropSeasonInput[];
}

// ── 월 파싱 유틸 ──

interface MonthRange {
  start: number;
  end: number;
  label: string; // "파종", "수확", "재배" 등
}

const MONTH_LABELS = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

/**
 * growingSeason 문자열을 월 범위 배열로 파싱
 *
 * 지원 패턴:
 *  - "4월~10월"           → [{start:4, end:10, label:"재배"}]
 *  - "3~5월·9~11월"       → [{start:3, end:5}, {start:9, end:11}]
 *  - "10월~이듬해 7월"    → [{start:10, end:12}, {start:1, end:7}] (연도 걸침)
 *  - "연중"               → [{start:1, end:12}]
 *  - "(시설: 연중)" 등 괄호 부분은 무시
 */
function parseGrowingSeason(raw: string): MonthRange[] {
  // 괄호 안 내용 제거
  const cleaned = raw.replace(/\([^)]*\)/g, "").trim();

  if (cleaned === "연중" || cleaned === "") {
    return [{ start: 1, end: 12, label: "재배" }];
  }

  const ranges: MonthRange[] = [];

  // "·" 또는 ","로 분리된 구간들
  const segments = cleaned.split(/[·,]/).map((seg) => seg.trim());

  for (const seg of segments) {
    if (!seg) continue;

    // "이듬해" 패턴 (연도 걸침)
    const crossYearMatch = seg.match(
      /(\d{1,2})월?\s*~\s*이듬해\s*(\d{1,2})월?/
    );
    if (crossYearMatch) {
      const startMonth = parseInt(crossYearMatch[1], 10);
      const endMonth = parseInt(crossYearMatch[2], 10);
      // 올해 부분
      ranges.push({ start: startMonth, end: 12, label: extractLabel(seg) });
      // 이듬해 부분
      ranges.push({ start: 1, end: endMonth, label: extractLabel(seg) });
      continue;
    }

    // 일반 범위: "3월~10월", "3~5월", "9월~6월" (역순이면 연도 걸침)
    const rangeMatch = seg.match(/(\d{1,2})월?\s*~\s*(\d{1,2})월?/);
    if (rangeMatch) {
      const startMonth = parseInt(rangeMatch[1], 10);
      const endMonth = parseInt(rangeMatch[2], 10);

      if (startMonth <= endMonth) {
        ranges.push({ start: startMonth, end: endMonth, label: extractLabel(seg) });
      } else {
        // 9월~6월 같은 경우 (가을 시작 → 이듬해 초여름)
        ranges.push({ start: startMonth, end: 12, label: extractLabel(seg) });
        ranges.push({ start: 1, end: endMonth, label: extractLabel(seg) });
      }
      continue;
    }

    // 단일 월: "3월"
    const singleMatch = seg.match(/(\d{1,2})월/);
    if (singleMatch) {
      const month = parseInt(singleMatch[1], 10);
      ranges.push({ start: month, end: month, label: extractLabel(seg) });
    }
  }

  return ranges;
}

/** 세그먼트에서 "파종", "수확" 등 라벨 추출 */
function extractLabel(seg: string): string {
  if (seg.includes("파종")) return "파종";
  if (seg.includes("수확")) return "수확";
  return "재배";
}

/** 월이 범위에 포함되는지 확인 */
function isMonthInRange(month: number, range: MonthRange): boolean {
  return month >= range.start && month <= range.end;
}

/** 월에 해당하는 바의 종류 결정 */
function getBarType(
  month: number,
  ranges: MonthRange[]
): "sowing" | "growing" | "harvest" | null {
  for (const range of ranges) {
    if (isMonthInRange(month, range)) {
      if (range.label === "파종") return "sowing";
      if (range.label === "수확") return "harvest";
      return "growing";
    }
  }
  return null;
}

// ── 컴포넌트 ──

export function FarmingCalendar({ crops }: FarmingCalendarProps) {
  const currentMonth = new Date().getMonth() + 1; // 1~12
  const displayCrops = crops.slice(0, 10);

  const parsedCrops = useMemo(
    () =>
      displayCrops.map((crop) => ({
        ...crop,
        ranges: parseGrowingSeason(crop.growingSeason),
      })),
    [displayCrops]
  );

  return (
    <div className={s.wrapper}>
      <div className={s.scrollContainer} role="region" aria-label="재배 캘린더" tabIndex={0}>
        <div className={s.grid} role="table">
          {/* 헤더 행 */}
          <div className={s.headerRow} role="row">
            <div className={s.cropNameHeader} role="columnheader">
              작물
            </div>
            {MONTH_LABELS.map((label, i) => (
              <div
                key={i}
                className={`${s.monthHeader} ${i + 1 === currentMonth ? s.currentMonthHeader : ""}`}
                role="columnheader"
              >
                {label}
              </div>
            ))}
          </div>

          {/* 작물 행들 */}
          {parsedCrops.map((crop) => (
            <CropRow
              key={crop.id}
              crop={crop}
              currentMonth={currentMonth}
            />
          ))}
        </div>
      </div>

      {/* 범례 */}
      <div className={s.legend} aria-hidden="true">
        <span className={s.legendItem}>
          <span className={`${s.legendDot} ${s.legendSowing}`} />
          파종
        </span>
        <span className={s.legendItem}>
          <span className={`${s.legendDot} ${s.legendGrowing}`} />
          재배
        </span>
        <span className={s.legendItem}>
          <span className={`${s.legendDot} ${s.legendHarvest}`} />
          수확
        </span>
        <span className={s.legendItem}>
          <span className={s.legendCurrentLine} />
          이번 달
        </span>
      </div>
    </div>
  );
}

function CropRow({
  crop,
  currentMonth,
}: {
  crop: CropSeasonInput & { ranges: MonthRange[] };
  currentMonth: number;
}) {
  return (
    <div className={s.cropRow} role="row">
      <div className={s.cropName} role="rowheader">
        <span className={s.cropEmoji} aria-hidden="true">
          {crop.emoji}
        </span>
        <span className={s.cropNameText}>{crop.name}</span>
      </div>
      {Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const barType = getBarType(month, crop.ranges);
        const isCurrentMonth = month === currentMonth;

        // 연속 바를 위한 좌우 연결 판별
        const prevType = month > 1 ? getBarType(month - 1, crop.ranges) : null;
        const nextType = month < 12 ? getBarType(month + 1, crop.ranges) : null;
        const isStart = barType !== null && prevType !== barType;
        const isEnd = barType !== null && nextType !== barType;

        return (
          <div
            key={i}
            className={`${s.monthCell} ${isCurrentMonth ? s.currentMonthCell : ""}`}
            role="cell"
          >
            {barType && (
              <div
                className={`${s.bar} ${s[barType]} ${isStart ? s.barStart : ""} ${isEnd ? s.barEnd : ""}`}
                title={`${crop.name} - ${month}월 (${barType === "sowing" ? "파종" : barType === "harvest" ? "수확" : "재배"})`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
