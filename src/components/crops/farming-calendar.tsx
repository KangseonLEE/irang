"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search, X } from "lucide-react";
import {
  CROP_CATEGORY_NAMES,
  type CropCategoryName,
} from "@/lib/data/crop-categories";
import { getCropWithDetail } from "@/lib/data/crops";
import { PROVINCES } from "@/lib/data/regions";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { analytics } from "@/lib/analytics";
import s from "./farming-calendar.module.css";

// ── 타입 ──

type CropCategory = CropCategoryName;

interface CropSeasonInput {
  id: string;
  name: string;
  emoji: string;
  category: CropCategory;
  growingSeason: string;
}

export interface FarmingCalendarProps {
  crops: CropSeasonInput[];
}

/** 카테고리 표시 순서 — SSOT 배열 순서 그대로 사용 */
const CATEGORY_ORDER: readonly CropCategory[] = CROP_CATEGORY_NAMES;

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

  // 작물 검색 (8/30 회장): 55종을 스크롤로 훑지 않고 이름으로 바로 찾기. 공백·대소문자 무시.
  const [query, setQuery] = useState("");
  const normalizedQuery = query.replace(/\s/g, "").toLowerCase();

  // 카테고리별 그룹핑 (검색 필터 적용) + growingSeason 파싱. 그룹 내 정렬은 입력 순서 유지.
  const groups = useMemo(() => {
    const parsed = crops
      .filter((crop) => !normalizedQuery || crop.name.replace(/\s/g, "").toLowerCase().includes(normalizedQuery))
      .map((crop) => ({
        ...crop,
        ranges: parseGrowingSeason(crop.growingSeason),
      }));
    return CATEGORY_ORDER.map((category) => ({
      category,
      crops: parsed.filter((c) => c.category === category),
    })).filter((g) => g.crops.length > 0);
  }, [crops, normalizedQuery]);
  const matchCount = groups.reduce((n, g) => n + g.crops.length, 0);

  // 행 확장 (8/30 회장): 한 번에 하나만. 검색으로 목록에서 사라지면 자동으로 닫힘 상태가 되도록
  // state를 되돌리지 않고 렌더 시점에 파생값으로 판정한다 (prop→state sync 불필요).
  const [openedId, setOpenedId] = useState<string | null>(null);
  const expandedId =
    openedId && groups.some((g) => g.crops.some((c) => c.id === openedId))
      ? openedId
      : null;

  const toggleRow = (cropId: string) => {
    const next = expandedId === cropId ? null : cropId;
    // 열릴 때만 집계 — 닫기는 신호로 치지 않는다
    if (next) analytics.calendarRowExpand(next);
    setOpenedId(next);
  };

  return (
    <div className={s.wrapper}>
      <div className={s.searchRow}>
        <label className={s.searchBox}>
          <Search size={16} className={s.searchIcon} aria-hidden="true" />
          <input
            type="text"
            className={s.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="작물 이름으로 찾기 (예: 사과, 고추)"
            aria-label="캘린더 작물 검색"
            autoComplete="off"
          />
          {query && (
            <button type="button" className={s.searchClear} onClick={() => setQuery("")} aria-label="검색어 지우기">
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </label>
        <span className={s.searchCount} aria-live="polite">
          {normalizedQuery ? `${matchCount}종` : `${crops.length}종`}
        </span>
      </div>
      {matchCount === 0 && <p className={s.searchEmpty}>&ldquo;{query}&rdquo; 작물이 없어요</p>}
      <div className={s.scrollContainer} role="region" aria-label="재배 캘린더" tabIndex={0}>
        <div className={s.grid} role="table">
          {/* 헤더 행 (스크롤 시 상단 고정) */}
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

          {/* 카테고리 그룹별 sub-header + 작물 행들 */}
          {groups.map((group) => (
            <div key={group.category} className={s.group} role="rowgroup">
              <div className={s.groupHeader} role="row">
                <span className={s.groupTitle}>{group.category}</span>
                <span className={s.groupCount}>{group.crops.length}종</span>
              </div>
              {group.crops.map((crop) => (
                <CropRow
                  key={crop.id}
                  crop={crop}
                  currentMonth={currentMonth}
                  expanded={expandedId === crop.id}
                  onToggle={toggleRow}
                />
              ))}
            </div>
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

type CalendarCrop = CropSeasonInput & { ranges: MonthRange[] };

function CropRow({
  crop,
  currentMonth,
  expanded,
  onToggle,
}: {
  crop: CalendarCrop;
  currentMonth: number;
  expanded: boolean;
  onToggle: (cropId: string) => void;
}) {
  const panelId = `calendar-detail-${crop.id}`;

  return (
    <>
    <div className={`${s.cropRow} ${expanded ? s.cropRowOpen : ""}`} role="row">
      <div className={s.cropName} role="rowheader">
        <button
          type="button"
          className={s.rowToggle}
          onClick={() => onToggle(crop.id)}
          aria-expanded={expanded}
          aria-controls={panelId}
        >
          <span className={s.cropEmoji} aria-hidden="true">
            {crop.emoji}
          </span>
          <span className={s.cropNameText}>{crop.name}</span>
          <ChevronDown
            size={14}
            className={`${s.rowChevron} ${expanded ? s.rowChevronOpen : ""}`}
            aria-hidden="true"
          />
        </button>
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
            // 바 영역을 눌러도 펼쳐지도록 — 키보드·AT 진입점은 작물명 셀의 버튼이 담당
            onClick={() => onToggle(crop.id)}
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
    {expanded && <CropDetailPanel crop={crop} panelId={panelId} />}
    </>
  );
}

// ── 확장 패널 ──

const DIFFICULTY_CLASS: Record<string, string> = {
  쉬움: s.difficultyEasy,
  보통: s.difficultyMedium,
  어려움: s.difficultyHard,
};

/** 파싱된 월 범위를 "4월 파종 → 5~9월 재배 → 10월 수확" 한 줄로 */
function formatSeasonSentence(ranges: MonthRange[], fallback: string): string {
  if (ranges.length === 0) return fallback;

  const parts: string[] = [];
  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];
    const next = ranges[i + 1];

    // 연도 걸침으로 쪼개진 두 구간(…~12월 + 1월~…)은 한 문장으로 되묶는다
    if (
      next &&
      range.end === 12 &&
      range.start !== 1 &&
      next.start === 1 &&
      next.label === range.label
    ) {
      parts.push(`${range.start}월~이듬해 ${next.end}월 ${range.label}`);
      i++;
      continue;
    }

    const span =
      range.start === range.end
        ? `${range.start}월`
        : `${range.start}~${range.end}월`;
    parts.push(`${span} ${range.label}`);
  }
  return parts.join(" → ");
}

function CropDetailPanel({
  crop,
  panelId,
}: {
  crop: CalendarCrop;
  panelId: string;
}) {
  // 상세는 정적 데이터에서 조회 — 캘린더 props에는 시기 정보만 들어온다
  const detailed = getCropWithDetail(crop.id);
  const income = detailed?.detail.income;
  const majorRegions = detailed?.detail.majorRegions ?? [];

  return (
    <div className={s.detailRow} role="row">
      <div className={s.detailCell} role="cell">
        <div
          className={s.detailPanel}
          id={panelId}
          role="region"
          aria-label={`${crop.name} 상세`}
        >
          <div className={s.detailCol}>
            <p className={s.detailSeason}>
              {formatSeasonSentence(crop.ranges, crop.growingSeason)}
            </p>

            {detailed && (
              <>
                <span
                  className={`${s.difficultyBadge} ${
                    DIFFICULTY_CLASS[detailed.difficulty] ?? s.difficultyMedium
                  }`}
                >
                  난이도 · {detailed.difficulty}
                </span>
                <p className={s.detailDesc}>
                  <AutoGlossary text={detailed.description} maxHighlights={2} />
                </p>
              </>
            )}

            {income && (
              <dl className={s.detailFacts}>
                <div className={s.detailFact}>
                  <dt className={s.detailLabel}>예상 소득</dt>
                  <dd className={s.detailValue}>{income.revenueRange}</dd>
                </div>
                {income.minScale && (
                  <div className={s.detailFact}>
                    <dt className={s.detailLabel}>최소 규모</dt>
                    <dd className={s.detailValue}>{income.minScale}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>

          <div className={s.detailCol}>
            {majorRegions.length > 0 && (
              <div className={s.detailRegions}>
                <span className={s.detailLabel}>주요 재배지</span>
                <div className={s.regionChips}>
                  {majorRegions.map((regionName) => {
                    const province = PROVINCES.find(
                      (p) => p.name === regionName
                    );
                    return province ? (
                      <Link
                        key={regionName}
                        href={`/regions/${province.id}`}
                        className={s.regionChip}
                      >
                        {province.shortName}
                      </Link>
                    ) : (
                      <span key={regionName} className={s.regionChipPlain}>
                        {regionName}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={s.detailLinks}>
              <Link href={`/crops/${crop.id}`} className={s.detailLink}>
                작물 상세 보기 →
              </Link>
              <Link
                href={`/regions/compare?tab=suitability&crop=${crop.id}`}
                className={s.detailLinkSub}
              >
                지역 비교에서 적합성 보기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
