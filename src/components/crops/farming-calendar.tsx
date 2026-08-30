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
import {
  buildMonthMap,
  deriveCalendarRanges,
  summarizeSeason,
  PHASE_LABEL,
  PHASE_SHORT_LABEL,
  type CalendarStep,
  type MonthRange,
  describeCurrentPhase,
} from "@/lib/crops/calendar-ranges";
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

// ── 컴포넌트 ──

export function FarmingCalendar({ crops }: FarmingCalendarProps) {
  const currentMonth = new Date().getMonth() + 1; // 1~12

  // 작물 검색 (8/30 회장): 55종을 스크롤로 훑지 않고 이름으로 바로 찾기. 공백·대소문자 무시.
  const [query, setQuery] = useState("");
  const normalizedQuery = query.replace(/\s/g, "").toLowerCase();

  // 카테고리별 그룹핑 (검색 필터 적용) + 재배 단계 기반 구간 도출.
  // 그룹 내 정렬은 입력 순서 유지.
  const groups = useMemo(() => {
    const parsed = crops
      .filter(
        (crop) =>
          !normalizedQuery ||
          crop.name.replace(/\s/g, "").toLowerCase().includes(normalizedQuery)
      )
      .map((crop) => {
        const steps = getCropWithDetail(crop.id)?.detail.cultivationSteps;
        const ranges = deriveCalendarRanges({
          growingSeason: crop.growingSeason,
          cultivationSteps: steps,
        });
        return { ...crop, steps, ranges, months: buildMonthMap(ranges) };
      });
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
          {PHASE_LABEL.sowing}
        </span>
        <span className={s.legendItem}>
          <span className={`${s.legendDot} ${s.legendGrowing}`} />
          {PHASE_LABEL.growing}
        </span>
        <span className={s.legendItem}>
          <span className={`${s.legendDot} ${s.legendHarvest}`} />
          {PHASE_LABEL.harvest}
        </span>
        <span className={s.legendItem}>
          <span className={s.legendCurrentLine} />
          이번 달
        </span>
      </div>
    </div>
  );
}

type CalendarCrop = CropSeasonInput & {
  steps?: CalendarStep[];
  ranges: MonthRange[];
  /** index 1~12 — 같은 구간은 같은 객체를 가리킨다 */
  months: (MonthRange | null)[];
};

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
        const range = crop.months[month];
        const isCurrentMonth = month === currentMonth;

        // 연속 바를 위한 좌우 연결 판별 — 같은 구간이면 이어 붙인다
        const prevPhase = month > 1 ? crop.months[month - 1]?.phase : undefined;
        const nextPhase = month < 12 ? crop.months[month + 1]?.phase : undefined;
        const isStart = !!range && prevPhase !== range.phase;
        const isEnd = !!range && nextPhase !== range.phase;
        const shortLabel = range ? PHASE_SHORT_LABEL[range.phase] : undefined;

        return (
          <div
            key={i}
            className={`${s.monthCell} ${isCurrentMonth ? s.currentMonthCell : ""}`}
            role="cell"
            // 바 영역을 눌러도 펼쳐지도록 — 키보드·AT 진입점은 작물명 셀의 버튼이 담당
            onClick={() => onToggle(crop.id)}
          >
            {range && (
              <div
                className={`${s.bar} ${s[range.phase]} ${isStart ? s.barStart : ""} ${isEnd ? s.barEnd : ""}`}
                title={`${crop.name} ${month}월 · ${PHASE_LABEL[range.phase]}${
                  range.derived ? ` (${range.sourceText} 기준)` : ""
                }`}
              >
                {isStart && shortLabel && (
                  <span className={s.barLabel} aria-hidden="true">
                    {shortLabel}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
    {expanded && (
      <CropDetailPanel crop={crop} panelId={panelId} currentMonth={currentMonth} />
    )}
    </>
  );
}

// ── 확장 패널 ──

const DIFFICULTY_CLASS: Record<string, string> = {
  쉬움: s.difficultyEasy,
  보통: s.difficultyMedium,
  어려움: s.difficultyHard,
};

function CropDetailPanel({
  crop,
  panelId,
  currentMonth,
}: {
  crop: CalendarCrop;
  panelId: string;
  currentMonth: number;
}) {
  // 상세는 정적 데이터에서 조회 — 캘린더 props에는 시기 정보만 들어온다
  const detailed = getCropWithDetail(crop.id);
  const income = detailed?.detail.income;
  const majorRegions = detailed?.detail.majorRegions ?? [];
  const steps = crop.steps ?? [];
  const now = describeCurrentPhase(crop.ranges, currentMonth);
  const nowText = now.current
    ? `지금 ${currentMonth}월 · ${PHASE_LABEL[now.current.phase]} 중${now.current.derived ? " (추정)" : ""}`
    : now.next
      ? `${currentMonth}월은 쉬는 달 · 다음 ${PHASE_LABEL[now.next.range.phase]} ${now.next.month}월`
      : null;

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
              {summarizeSeason(crop.ranges) || crop.growingSeason}
            </p>
            {nowText && (
              <span className={`${s.nowBadge} ${now.current ? "" : s.nowBadgeIdle}`}>
                <span className={s.nowBadgeDot} aria-hidden="true" />
                {nowText}
              </span>
            )}

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
          </div>

          {steps.length > 0 && (
            <div className={s.stepsBlock}>
              <span className={s.detailLabel}>재배 단계</span>
              <ol className={s.stepList}>
                {steps.map((step) => (
                  <li key={step.step} className={s.stepItem}>
                    <span className={s.stepNum} aria-hidden="true">
                      {step.step}
                    </span>
                    <span className={s.stepTitle}>{step.title}</span>
                    <span className={s.stepPeriod}>{step.period}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className={s.detailActions}>
            <Link href={`/crops/${crop.id}`} className={s.actionPrimary}>
              작물 상세 보기
            </Link>
            <Link
              href={`/regions/compare?tab=suitability&crop=${crop.id}`}
              className={s.actionSecondary}
            >
              지역 비교에서 적합성 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
