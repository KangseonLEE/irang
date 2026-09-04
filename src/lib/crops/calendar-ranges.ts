/**
 * 재배 캘린더 월 범위 도출 (8/30)
 *
 * 캘린더 바는 원래 `growingSeason`("3월~7월") 한 줄만 파싱해 56종 중 49종이
 * '재배' 단일 바였다. 여기서는 `CROP_DETAILS[].cultivationSteps`(55종 전부 보유)의
 * 단계명·시기를 읽어 파종·정식 / 재배·관리 / 수확 세 구간으로 나눈다.
 *
 * 원칙
 *  - 절대 표기(3~4월, 매년 9~11월, 이듬해 3~4월, 연중 …)는 그대로 읽는다.
 *  - 상대 표기(정식 후 60~70일 …)는 **수확 단계에만**, 직전 파종·정식 단계의
 *    절대 월을 앵커로 삼아 도출하고 `derived` 플래그를 남긴다.
 *  - 앵커가 없거나 년 단위(2~3년차·식재 후 5년)면 도출하지 않는다 — 허위 생성 금지.
 */

export type CalendarPhase = "sowing" | "growing" | "harvest";

/** 화면·툴팁에 그대로 쓰는 구간 이름 */
export const PHASE_LABEL: Record<CalendarPhase, string> = {
  sowing: "파종·정식",
  growing: "재배·관리",
  harvest: "수확",
};

/** 셀 안에 넣는 짧은 라벨 (데스크탑 전용) */
export const PHASE_SHORT_LABEL: Partial<Record<CalendarPhase, string>> = {
  sowing: "파종",
  harvest: "수확",
};

export interface MonthRange {
  /** 1~12 */
  start: number;
  /** 1~12, 항상 start 이상 (연도 걸침은 두 구간으로 분리) */
  end: number;
  phase: CalendarPhase;
  /** 상대 표기에서 도출한 구간 */
  derived?: boolean;
  /** 도출 근거 원문 ("정식 후 60~70일") */
  sourceText?: string;
}

export interface CalendarStep {
  step: number;
  title: string;
  period: string;
  description?: string;
}

export interface CalendarCropInput {
  growingSeason: string;
  cultivationSteps?: CalendarStep[];
}

// ── 단계 분류 ──

const HARVEST_TITLE = /수확|출하|채취|채밀|채화|굴취|채엽/;
const SOWING_TITLE = /파종|정식|이앙|모내기|식재|식부|심기|삽목|접목/;

/** "육묘·정식 준비"처럼 준비 단계는 아직 심는 때가 아니다 */
const SOWING_PREP = /(?:파종|정식|이앙|모내기|식재|식부|심기|삽목|접목)\s*준비/g;

/** 단계 제목으로 구간 종류를 판정. 수확 키워드가 우선한다 */
export function classifyStep(title: string): CalendarPhase {
  if (HARVEST_TITLE.test(title)) return "harvest";
  if (SOWING_TITLE.test(title.replace(SOWING_PREP, ""))) return "sowing";
  return "growing";
}

// ── 절대 월 파싱 ──

interface Span {
  start: number;
  end: number;
}

const VALID = (m: number) => Number.isInteger(m) && m >= 1 && m <= 12;

/** start > end면 연도 걸침 — 두 구간으로 나눈다 */
function pushSpan(out: Span[], start: number, end: number) {
  if (!VALID(start) || !VALID(end)) return;
  if (start <= end) {
    out.push({ start, end });
  } else {
    out.push({ start, end: 12 });
    out.push({ start: 1, end });
  }
}

/** "5월 말~6월 중순"처럼 사이에 끼는 순(旬) 표기 */
const TENTH = "(?:상순|중순|하순|초순|초|말)";
const CROSS_YEAR_RE = new RegExp(
  `(\\d{1,2})\\s*월?\\s*${TENTH}?\\s*~\\s*이듬해\\s*(\\d{1,2})\\s*월`,
  "g"
);
const RANGE_RE = new RegExp(
  `(\\d{1,2})\\s*월?\\s*${TENTH}?\\s*~\\s*(\\d{1,2})\\s*월`,
  "g"
);
const SINGLE_RE = /(\d{1,2})\s*월/g;

/**
 * 단계 시기 문자열에서 절대 월 구간을 모두 뽑는다.
 *
 * 지원: "3~4월" "3월~4월" "매년 9~11월" "이듬해 3~4월" "매년 12월~이듬해 5월"
 *       "봄: 3~4월 / 가을: 9~10월" "3~4월 또는 11월" "11~3월 (휴면기)"
 *       "5월 말~6월 중순" "연중"
 * 무시: "1~3년차" "식재 후 5~7년" "파종 후 40~50일" "정식 후 4~6개월" (월 표기 없음)
 */
export function parseAbsoluteMonths(period: string): Span[] {
  const spans: Span[] = [];
  let rest = period;

  rest = rest.replace(CROSS_YEAR_RE, (_m, a: string, b: string) => {
    pushSpan(spans, parseInt(a, 10), 12);
    pushSpan(spans, 1, parseInt(b, 10));
    return " ";
  });

  rest = rest.replace(RANGE_RE, (_m, a: string, b: string) => {
    pushSpan(spans, parseInt(a, 10), parseInt(b, 10));
    return " ";
  });

  rest.replace(SINGLE_RE, (_m, a: string) => {
    const month = parseInt(a, 10);
    pushSpan(spans, month, month);
    return " ";
  });

  // 숫자 표기가 하나도 없을 때만 "연중"을 12개월로 읽는다.
  // "시설: 연중, 노지: 5월"처럼 함께 적힌 경우는 확정된 5월 쪽을 남긴다.
  if (spans.length === 0 && /연중/.test(period)) {
    spans.push({ start: 1, end: 12 });
  }

  return spans;
}

// ── 상대 표기 파싱 ──

/** 앵커로 삼을 수 있는 기준 행위 — 착과·발생·배양처럼 심는 시점이 아닌 것은 제외 */
const RELATIVE_RE =
  /(파종|정식|이앙|식재|삽목)\s*후\s*(\d{1,3})\s*(?:~\s*(\d{1,3})\s*)?(일|주|개월|달)/;

interface RelativeOffset {
  /** 앵커 이후 경과 개월 (내림·올림 반영) */
  minMonths: number;
  maxMonths: number;
  /** 툴팁에 병기할 원문 */
  text: string;
}

/** "정식 후 60~70일" → { minMonths: 2, maxMonths: 3 } */
export function parseRelativeOffset(period: string): RelativeOffset | null {
  const m = period.match(RELATIVE_RE);
  if (!m) return null;

  const [, base, rawMin, rawMax, unit] = m;
  const min = parseInt(rawMin, 10);
  const hasMax = rawMax !== undefined;
  let max = hasMax ? parseInt(rawMax, 10) : min;

  // "정식 후 30일부터"처럼 끝이 열린 표기는 한 달 폭을 준다
  if (!hasMax && /부터|이후/.test(period)) {
    max = unit === "일" ? min + 30 : unit === "주" ? min + 4 : min + 1;
  }

  const toMonths = (v: number) => {
    if (unit === "개월" || unit === "달") return v;
    const days = unit === "주" ? v * 7 : v;
    return Math.ceil(days / 30);
  };

  return {
    minMonths: toMonths(min),
    maxMonths: toMonths(max),
    text: `${base} 후 ${rawMin}${hasMax ? `~${rawMax}` : ""}${unit}`,
  };
}

/** 12를 넘는 월 번호를 1~12로 되돌린다 */
function wrapMonth(month: number): number {
  return ((month - 1) % 12 + 12) % 12 + 1;
}

/** 앵커가 반년 이상 넓으면(연중 정식 등) 도출해도 의미가 없다 */
const MAX_ANCHOR_SPAN = 6;

function deriveFromAnchor(anchor: Span, offset: RelativeOffset): Span[] {
  if (anchor.end - anchor.start + 1 >= MAX_ANCHOR_SPAN) return [];

  const start = anchor.start + offset.minMonths;
  const end = anchor.end + offset.maxMonths;

  // 폭이 한 해를 넘으면 사실상 연중 — 그대로 12개월로 둔다
  if (end - start + 1 >= 12) return [{ start: 1, end: 12 }];

  const out: Span[] = [];
  pushSpan(out, wrapMonth(start), wrapMonth(end));
  return out;
}

// ── growingSeason 폴백 ──

/**
 * `growingSeason` 한 줄을 재배 구간으로 파싱 (폴백 겸 기본 바탕).
 * 괄호 안 부연("(시설)", "(2~3년근 수확)")은 떼고 읽는다.
 */
function parseGrowingSeason(raw: string): MonthRange[] {
  const cleaned = raw.replace(/\([^)]*\)/g, "").trim();
  if (!cleaned || cleaned === "연중") {
    return [{ start: 1, end: 12, phase: "growing" }];
  }

  const spans: Span[] = [];
  for (const seg of cleaned.split(/[·,]/)) {
    if (!seg.trim()) continue;
    spans.push(...parseAbsoluteMonths(seg));
  }

  return spans.map((s) => ({ ...s, phase: "growing" as const }));
}

// ── 도출 본체 ──

interface MonthCell {
  phase: CalendarPhase;
  derived?: boolean;
  sourceText?: string;
}

const PRIORITY: Record<CalendarPhase, number> = {
  growing: 1,
  sowing: 4,
  harvest: 5,
};

/** 도출 구간은 확정 표기보다 아래 — 실데이터 파종을 덮지 않는다 */
const DERIVED_PRIORITY = 3;

function priorityOf(cell: MonthCell): number {
  return cell.derived ? DERIVED_PRIORITY : PRIORITY[cell.phase];
}

function paint(months: (MonthCell | null)[], span: Span, cell: MonthCell) {
  for (let m = span.start; m <= span.end; m++) {
    const prev = months[m];
    if (prev && priorityOf(prev) >= priorityOf(cell)) continue;
    months[m] = cell;
  }
}

/**
 * 작물 하나의 캘린더 월 구간을 도출한다.
 *
 * 1) `growingSeason`을 재배 바탕으로 깔고
 * 2) `cultivationSteps`의 절대 월을 구간별로 덧칠하고
 * 3) 수확 단계의 상대 표기는 직전 파종·정식 앵커로 도출하고
 * 4) 파종 뒤 수확까지 빈 달을 재배로 메운다.
 *
 * 겹치면 수확 > 파종·정식 > 재배 순으로 우선한다.
 */
export function deriveCalendarRanges(crop: CalendarCropInput): MonthRange[] {
  const months: (MonthCell | null)[] = Array(13).fill(null);

  for (const span of parseGrowingSeason(crop.growingSeason)) {
    paint(months, span, { phase: "growing" });
  }

  const steps = crop.cultivationSteps ?? [];
  let anchor: Span[] | null = null;

  for (const step of steps) {
    const phase = classifyStep(step.title);
    const absolute = parseAbsoluteMonths(step.period);

    if (absolute.length > 0) {
      // 12개월을 통째로 덮는 파종 구간은 구분 정보가 없으므로 재배로 둔다
      const fullYear = absolute.some((s) => s.start === 1 && s.end === 12);
      const painted: CalendarPhase =
        phase === "sowing" && fullYear ? "growing" : phase;

      for (const span of absolute) paint(months, span, { phase: painted });
      if (phase === "sowing") anchor = absolute;
      continue;
    }

    if (phase === "harvest" && anchor) {
      const offset = parseRelativeOffset(step.period);
      if (!offset) continue;
      for (const base of anchor) {
        for (const span of deriveFromAnchor(base, offset)) {
          paint(months, span, {
            phase: "harvest",
            derived: true,
            sourceText: offset.text,
          });
        }
      }
    }
  }

  fillBetweenSowingAndHarvest(months);

  return toRanges(months);
}

/** 파종 다음 달부터 가장 가까운 수확까지, 비어 있는 달을 재배로 메운다 */
function fillBetweenSowingAndHarvest(months: (MonthCell | null)[]) {
  const hasHarvest = months.some((c) => c?.phase === "harvest");
  if (!hasHarvest) return;

  for (let m = 1; m <= 12; m++) {
    if (months[m]?.phase !== "sowing") continue;

    const pending: number[] = [];
    for (let step = 1; step <= 11; step++) {
      const month = wrapMonth(m + step);
      const cell = months[month];
      if (cell?.phase === "harvest") {
        for (const p of pending) months[p] = { phase: "growing" };
        break;
      }
      if (cell) break; // 파종·재배가 이어지면 메울 필요 없음
      pending.push(month);
    }
  }
}

/** 월 배열을 같은 구간끼리 묶어 MonthRange[]로 (연도 걸침은 나누어 둔다) */
function toRanges(months: (MonthCell | null)[]): MonthRange[] {
  const ranges: MonthRange[] = [];
  let current: MonthRange | null = null;

  for (let m = 1; m <= 12; m++) {
    const cell = months[m];
    if (!cell) {
      current = null;
      continue;
    }
    if (
      current &&
      current.phase === cell.phase &&
      current.derived === cell.derived &&
      current.end === m - 1
    ) {
      current.end = m;
      continue;
    }
    current = {
      start: m,
      end: m,
      phase: cell.phase,
      ...(cell.derived ? { derived: true, sourceText: cell.sourceText } : {}),
    };
    ranges.push(current);
  }

  return ranges;
}

// ── 표시 헬퍼 ──

/** 구간 배열 → 월별 조회용 배열 (index 1~12) */
export function buildMonthMap(ranges: MonthRange[]): (MonthRange | null)[] {
  const map: (MonthRange | null)[] = Array(13).fill(null);
  for (const range of ranges) {
    for (let m = range.start; m <= range.end; m++) map[m] = range;
  }
  return map;
}

/** 같은 구간이 연말·연초로 갈라진 것을 다시 이어 "9월~이듬해 5월"로 읽는다 */
function circularRuns(monthSet: Set<number>): Span[] {
  if (monthSet.size === 0) return [];
  if (monthSet.size === 12) return [{ start: 1, end: 12 }];

  const runs: Span[] = [];
  for (let m = 1; m <= 12; m++) {
    if (!monthSet.has(m) || monthSet.has(wrapMonth(m - 1))) continue;
    let end = m;
    while (monthSet.has(wrapMonth(end + 1))) end = wrapMonth(end + 1);
    runs.push({ start: m, end });
  }
  return runs;
}

function formatSpan(span: Span): string {
  if (span.start === span.end) return `${span.start}월`;
  if (span.start > span.end) return `${span.start}월~이듬해 ${span.end}월`;
  return `${span.start}~${span.end}월`;
}

function phaseText(ranges: MonthRange[], phase: CalendarPhase): string {
  const set = new Set<number>();
  for (const r of ranges) {
    if (r.phase !== phase) continue;
    for (let m = r.start; m <= r.end; m++) set.add(m);
  }
  const runs = circularRuns(set);
  if (runs.length === 0) return "";
  return `${runs.map(formatSpan).join("·")} ${PHASE_LABEL[phase]}`;
}

/**
 * "5~6월 파종·정식 → 9~10월 수확" 한 줄 요약.
 * 파종·수확이 모두 없으면 재배 구간을, 그마저 없으면 빈 문자열을 준다.
 */
export function summarizeSeason(ranges: MonthRange[]): string {
  const parts = [phaseText(ranges, "sowing"), phaseText(ranges, "harvest")].filter(
    Boolean
  );
  if (parts.length > 0) return parts.join(" → ");
  return phaseText(ranges, "growing");
}

/** 특정 월의 현재 시기 + 없으면 다음 시기 (패널 "지금 N월 · 수확 중" 배지용) */
export interface CurrentPhaseInfo {
  /** 이번 달에 해당하는 구간 (없으면 null = 쉬는 달) */
  current: MonthRange | null;
  /** 이번 달에 구간이 없을 때, 다음으로 시작하는 구간과 그 월 */
  next: { month: number; range: MonthRange } | null;
}

export function describeCurrentPhase(
  ranges: MonthRange[],
  month: number
): CurrentPhaseInfo {
  const map = buildMonthMap(ranges);
  const current = map[month] ?? null;
  if (current) return { current, next: null };
  for (let step = 1; step <= 12; step++) {
    const m = ((month - 1 + step) % 12) + 1;
    const range = map[m];
    if (range) return { current: null, next: { month: m, range } };
  }
  return { current: null, next: null };
}
