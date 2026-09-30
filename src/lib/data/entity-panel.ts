/**
 * 엔티티 지식 패널 (Entity Knowledge Panel) — 검색어가 하나의 실체로 특정되면
 * 결과 최상단에 그 실체의 요약을 메인으로 그린다. 작물 지식 패널(`buildCropPanel`)의
 * 형제 모듈이고, 프레임·톤·노출 위계가 같다.
 *
 * 회장 지시 2026-09-30: "'횡성군' 검색 결과가 작물만큼 풍성하지 않다. 특정되어서 데이터가
 * 존재하면 작물처럼 상세정보를 포함한 정보를 메인으로 보여 달라."
 *
 * 신규 데이터 0 — 상세 페이지가 이미 쓰는 정적 데이터(SIGUNGUS·PROVINCES·PROGRAMS·
 * EDUCATION_COURSES·EVENTS·CENTERS·CROPS)만 조합한다.
 *
 * ⚠️ 이 모듈은 /search(클라이언트 컴포넌트)의 모듈 그래프에 들어간다 —
 * `dimension-scores`(8.8천 줄)·`population-trend`(1.1만 줄)처럼 무거운 데이터는
 * 절대 import 하지 않는다. 정착 점수·인구는 상세 페이지에서만 보여준다.
 */

import { PROVINCES, getProvinceById, type Province } from "./regions";
import { SIGUNGUS, getSigungusBySidoId, type Sigungu } from "./sigungus";
import { GUS } from "./gus";
import { CROPS } from "./crops";
import { PROGRAMS, REGIONS as PROGRAM_FILTER_REGIONS } from "./programs";
import { EDUCATION_COURSES, EDUCATION_REGIONS } from "./education";
import { EVENTS, EVENT_REGIONS } from "./events";
import { getSidoCenter, getSigunguCenter, type Center } from "./centers";
import {
  deriveStatus,
  deriveEventStatus,
  programStatusLabel,
} from "@/lib/program-status";
import {
  formatAgeRange,
  formatApplicationPeriod,
  formatDateRange,
  splitSentences,
} from "@/lib/format";
import { sourceBlockLabel } from "@/lib/source-label";

// ---------------------------------------------------------------------------
// Types — 다섯 종류가 한 컴포넌트를 쓰도록 공통 프레임 하나로 모았다
// ---------------------------------------------------------------------------

interface PanelFact {
  label: string;
  value: string;
}

interface PanelLink {
  label: string;
  href: string;
}

/** 라벨 + 칩(또는 칩 링크) 한 줄 — 작물 패널의 "주산지"·"관련작물" 라인과 같은 구조 */
export interface PanelChipLine {
  label: string;
  chips?: string[];
  links?: PanelLink[];
  /** 잘라낸 나머지 개수 (+N 표기) */
  overflow?: number;
}

interface PanelCrop {
  id: string;
  name: string;
  emoji: string;
}

interface PanelListItem {
  id: string;
  title: string;
  href: string;
  meta?: string;
  status?: string;
}

interface PanelGroup {
  label: string;
  items: PanelListItem[];
  more?: PanelLink;
}

interface PanelCta {
  href: string;
  label: string;
  primary?: boolean;
}

interface PanelCenter {
  name: string;
  phone?: string;
  address?: string;
  url: string;
}

type EntityPanelKind =
  | "province"
  | "sigungu"
  | "program"
  | "education"
  | "event";

export interface EntityPanel {
  kind: EntityPanelKind;
  /**
   * 결과 목록에서 흡수할 항목 키 (`${type}-${id}`).
   * 패널이 이미 보여주는 카드를 아래 유형별 섹션에서 두 번 그리지 않기 위한 것이고,
   * 총 건수는 흡수한 수를 히어로로 되돌려 불변으로 유지한다 (`resolveSearchDisplay`).
   */
  absorbKeys: string[];
  icon: string;
  /** 제목 위 작은 라벨 — 시·도 브레드크럼 / 주관 기관 */
  overline?: string;
  title: string;
  /** 제목 아래 한 줄 — 분류·유형 */
  meta?: string;
  /** 상태 배지 라벨 (지원사업·교육·행사) — StatusBadge SSOT 값 */
  statusLabel?: string;
  summary?: string;
  facts: PanelFact[];
  lines: PanelChipLine[];
  /** 문장 단위 요약 (지원 내용·교육 내용) */
  bullets: string[];
  /** 추천 작물 — 일러스트 링크 카드 */
  crops: PanelCrop[];
  groups: PanelGroup[];
  center?: PanelCenter;
  /** 원문·신청 외부 링크 */
  source?: PanelLink;
  ctas: PanelCta[];
}

// ---------------------------------------------------------------------------
// 특정 판정 — "하나의 실체로 특정되는가"
// ---------------------------------------------------------------------------

/**
 * 지역 이름(정식·약칭) → 후보 목록. 이름이 겹치는 검색어("광주"·"중구"·"고성")는
 * 어느 실체인지 특정되지 않으므로 패널을 만들지 않고 기존 결과 흐름에 맡긴다.
 *
 * 구(GUS)는 패널 대상이 아니지만 동음 판정에는 넣는다 — "남구"·"북구"가 포항 구와
 * 겹치는데 그걸 무시하면 엉뚱한 시·군·구 패널이 확신 어조로 뜬다.
 */
type RegionCandidate =
  | { kind: "province"; province: Province }
  | { kind: "sigungu"; sigungu: Sigungu }
  | { kind: "other" };

let _regionNameIndex: Map<string, RegionCandidate[]> | null = null;

function getRegionNameIndex(): Map<string, RegionCandidate[]> {
  if (_regionNameIndex) return _regionNameIndex;
  const index = new Map<string, RegionCandidate[]>();
  const push = (name: string, candidate: RegionCandidate) => {
    const key = name.trim().toLowerCase();
    if (!key) return;
    const list = index.get(key);
    if (list) list.push(candidate);
    else index.set(key, [candidate]);
  };
  for (const province of PROVINCES) {
    const candidate: RegionCandidate = { kind: "province", province };
    push(province.name, candidate);
    if (province.shortName !== province.name) push(province.shortName, candidate);
  }
  for (const sigungu of SIGUNGUS) {
    const candidate: RegionCandidate = { kind: "sigungu", sigungu };
    push(sigungu.name, candidate);
    if (sigungu.shortName !== sigungu.name) push(sigungu.shortName, candidate);
  }
  for (const gu of GUS) {
    push(gu.name, { kind: "other" });
    if (gu.shortName !== gu.name) push(gu.shortName, { kind: "other" });
  }
  _regionNameIndex = index;
  return index;
}

let _cropNameSet: Set<string> | null = null;

function isCropName(q: string): boolean {
  if (!_cropNameSet) {
    _cropNameSet = new Set(CROPS.map((c) => c.name.toLowerCase()));
  }
  return _cropNameSet.has(q);
}

// ---------------------------------------------------------------------------
// 공용 헬퍼
// ---------------------------------------------------------------------------

function truncate(text: string, maxLen: number): string {
  const t = text.trim();
  return t.length <= maxLen ? t : `${t.slice(0, maxLen).trimEnd()}…`;
}

/** 괄호 앞 핵심부만 — "최대 3억원 (5년 거치…)" → "최대 3억원" (작물 패널 leadSegment 와 같은 규칙) */
function leadSegment(text: string | undefined | null): string | undefined {
  if (!text) return undefined;
  const cut = text.split(/\s*\(/)[0]?.trim();
  return cut || text.trim();
}

/**
 * 주관 기관 overline — 제목이 이미 그 기관명으로 시작하면 생략한다.
 * "농촌진흥청 …센터" / "농촌진흥청 …센터 교육 (연간 391개 과정)" 처럼 같은 말이 두 줄 겹친다.
 */
function distinctOverline(organization: string, title: string): string | undefined {
  const org = organization.trim();
  if (!org) return undefined;
  return title.trim().startsWith(org) ? undefined : org;
}

/** 작물 이름(지역 데이터의 mainCrops 표기) → CROPS 엔트리 */
function toPanelCrops(names: readonly string[], limit: number): PanelCrop[] {
  const out: PanelCrop[] = [];
  const seen = new Set<string>();
  for (const raw of names) {
    const name = raw.trim();
    if (!name) continue;
    const crop =
      CROPS.find((c) => c.name === name) ??
      CROPS.find((c) => c.name.includes(name));
    if (!crop || seen.has(crop.id)) continue;
    seen.add(crop.id);
    out.push({ id: crop.id, name: crop.name, emoji: crop.emoji });
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * 목록 필터 deep link — 그 필터가 시·도 값을 받아주는 페이지에서만 붙인다.
 * `/programs?region=` enum 은 전국 + 10개 시·도뿐이라(광역시 없음) 아무 시·도나 붙이면
 * middleware normalize 가 308 로 떼어 버린다.
 */
function regionFilterHref(
  base: string,
  provinceName: string,
  allowed: readonly string[],
): string {
  return allowed.includes(provinceName)
    ? `${base}?region=${encodeURIComponent(provinceName)}`
    : base;
}

interface ActiveProgram {
  program: (typeof PROGRAMS)[number];
  status: ReturnType<typeof deriveStatus>;
  /** 시·군 단위로 특화된 사업 (시·도 전체·전국 사업보다 먼저) */
  local: boolean;
}

/**
 * 시·도(+ 전국) 활성 지원사업. 상태 판정은 `deriveStatus` — 검색 인덱스와 같은 기준이라
 * 목록·검색·패널이 같은 사업 집합을 본다.
 */
function activePrograms(provinceName: string, sigungu?: Sigungu): ActiveProgram[] {
  const localNames = sigungu ? [sigungu.name, sigungu.shortName] : [];
  const out: ActiveProgram[] = [];
  for (const program of PROGRAMS) {
    if (program.region !== provinceName && program.region !== "전국") continue;
    const status = deriveStatus(program.applicationStart, program.applicationEnd);
    if (status === "마감") continue;
    const sg = program.sigungu?.trim();
    const local = Boolean(sg && localNames.some((n) => n && sg.includes(n)));
    out.push({ program, status, local });
  }
  // 시·군 특화 → 모집중 → 시·도 사업 순. 사용자가 지금 신청할 수 있는 것을 먼저 본다.
  const rank = (p: ActiveProgram) =>
    (p.local ? 0 : 4) + (p.status === "모집중" ? 0 : 1) + (p.program.region === "전국" ? 1 : 0);
  return out.sort((a, b) => rank(a) - rank(b));
}

function programListItem(entry: ActiveProgram): PanelListItem {
  const { program, status } = entry;
  return {
    id: `program-${program.id}`,
    title: program.title,
    href: `/programs/${program.id}`,
    meta: leadSegment(program.supportAmount) ?? program.organization,
    status: programStatusLabel({ ...program, status }),
  };
}

interface RegionCounts {
  programs: number;
  courses: number;
  events: number;
}

/** 시·도(+ 전국) 활성 교육 과정 */
function activeCourses(provinceName: string) {
  return EDUCATION_COURSES.filter((c) => {
    if (c.region !== provinceName && c.region !== "전국") return false;
    return deriveStatus(c.applicationStart, c.applicationEnd) !== "마감";
  });
}

/** 시·도(+ 전국) 활성 체험·행사 */
function activeEvents(provinceName: string) {
  return EVENTS.filter(
    (e) => (e.region === provinceName || e.region === "전국") &&
      deriveEventStatus(e.applicationStart, e.applicationEnd, e.dateEnd) !== "마감",
  );
}

/** 패널 fact 용 건수 — 목록 블록과 같은 집합을 센다 */
function regionCounts(provinceName: string, sigungu?: Sigungu): RegionCounts {
  return {
    programs: activePrograms(provinceName, sigungu).length,
    courses: activeCourses(provinceName).length,
    events: activeEvents(provinceName).length,
  };
}

function regionGroups(province: Province, sigungu?: Sigungu): PanelGroup[] {
  const groups: PanelGroup[] = [];

  const programs = activePrograms(province.name, sigungu);
  if (programs.length > 0) {
    groups.push({
      label: "신청할 수 있는 지원사업",
      items: programs.slice(0, 3).map(programListItem),
      more: {
        label: `지원사업 ${programs.length}건 전체 보기`,
        href: regionFilterHref("/programs", province.name, PROGRAM_FILTER_REGIONS),
      },
    });
  }

  const courses = activeCourses(province.name);
  if (courses.length > 0) {
    groups.push({
      label: "정착 교육",
      items: courses.slice(0, 2).map((c) => ({
        id: `education-${c.id}`,
        title: c.title,
        href: `/education/${c.id}`,
        meta: [c.organization, c.duration].filter(Boolean).join(" · "),
        status: deriveStatus(c.applicationStart, c.applicationEnd),
      })),
      more: {
        label: `교육 ${courses.length}개 과정 보기`,
        href: regionFilterHref("/education", province.name, EDUCATION_REGIONS),
      },
    });
  }

  const events = activeEvents(province.name);
  if (events.length > 0) {
    groups.push({
      label: "체험·행사",
      items: events.slice(0, 2).map((e) => ({
        id: `event-${e.id}`,
        title: e.title,
        href: `/events/${e.id}`,
        meta: [formatDateRange(e.date, e.dateEnd), e.location].filter(Boolean).join(" · "),
        status: deriveEventStatus(e.applicationStart, e.applicationEnd, e.dateEnd),
      })),
      more: {
        label: `체험·행사 ${events.length}건 보기`,
        href: regionFilterHref("/events", province.name, EVENT_REGIONS),
      },
    });
  }

  return groups;
}

function toPanelCenter(center: Center | undefined): PanelCenter | undefined {
  if (!center) return undefined;
  return {
    name: center.name,
    phone: center.phone,
    address: center.address,
    url: center.url,
  };
}

/** 패널이 흡수하는 키 — 지역 카드 + 센터 카드 + 패널에 실린 사업·교육·행사 */
function collectAbsorbKeys(
  own: string[],
  groups: PanelGroup[],
  center?: Center,
): string[] {
  const keys = [...own];
  for (const group of groups) for (const item of group.items) keys.push(item.id);
  if (center) keys.push(`center-${center.id}`);
  return keys;
}

function countLabel(count: number, unit: string): string {
  return `${count.toLocaleString()}${unit}`;
}

// ---------------------------------------------------------------------------
// 시·군·구 패널
// ---------------------------------------------------------------------------

function buildSigunguPanel(sigungu: Sigungu): EntityPanel | null {
  const province = getProvinceById(sigungu.sidoId);
  if (!province) return null;

  const base = `/regions/${province.id}/${sigungu.id}`;
  const groups = regionGroups(province, sigungu);
  const center = getSigunguCenter(sigungu.id);
  const crops = toPanelCrops(sigungu.mainCrops, 3);

  const counts = regionCounts(province.name, sigungu);
  const facts: PanelFact[] = [];
  if (sigungu.area > 0) {
    facts.push({ label: "면적", value: `${sigungu.area.toLocaleString()} km²` });
  }
  if (sigungu.mainCrops.length > 0) {
    facts.push({ label: "대표 작물", value: sigungu.mainCrops.slice(0, 3).join(" · ") });
  }
  if (counts.programs > 0) {
    facts.push({ label: "신청 가능 지원사업", value: countLabel(counts.programs, "건") });
  }
  if (counts.courses > 0) {
    facts.push({ label: "정착 교육", value: countLabel(counts.courses, "개 과정") });
  } else if (counts.events > 0) {
    facts.push({ label: "체험·행사", value: countLabel(counts.events, "건") });
  }

  const sitelinks: PanelLink[] = [
    { label: "대표 작물", href: `${base}#sigungu-crops` },
    { label: "지원사업", href: `${base}#sigungu-programs` },
    { label: "정착 교육", href: `${base}#sigungu-education` },
    { label: "현장 이야기", href: `${base}#community-notes` },
  ];

  const lines: PanelChipLine[] = [];
  if (sigungu.highlights.length > 0) {
    lines.push({ label: "특징", chips: sigungu.highlights.slice(0, 4) });
  }
  lines.push({ label: "바로가기", links: sitelinks });

  return {
    kind: "sigungu",
    absorbKeys: collectAbsorbKeys(
      [`region-${province.id}-${sigungu.id}`],
      groups,
      center,
    ),
    icon: "\u{1F3E1}", // 🏡
    overline: province.name,
    title: sigungu.name,
    meta: `${province.shortName} 시·군·구`,
    summary: sigungu.description,
    facts: facts.filter((f) => f.value).slice(0, 4),
    lines,
    bullets: [],
    crops,
    groups,
    center: toPanelCenter(center),
    ctas: [
      { href: base, label: "지역 상세 보기", primary: true },
      {
        href: `/regions/compare?regions=${province.id}:${sigungu.id}`,
        label: "지역 비교에 넣기",
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// 시·도 패널
// ---------------------------------------------------------------------------

function buildProvincePanel(province: Province): EntityPanel | null {
  const base = `/regions/${province.id}`;
  const sigungus = getSigungusBySidoId(province.id);
  const groups = regionGroups(province);
  const center = getSidoCenter(province.id);

  // 대표 작물 — 소속 시·군·구 mainCrops 빈도 상위 (region-lookup 의 시·도 카드와 같은 규칙)
  const freq = new Map<string, number>();
  for (const sg of sigungus) {
    for (const crop of sg.mainCrops) freq.set(crop, (freq.get(crop) ?? 0) + 1);
  }
  const topCropNames = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
  const crops = toPanelCrops(topCropNames, 3);

  const counts = regionCounts(province.name);
  const facts: PanelFact[] = [];
  if (sigungus.length > 0) {
    facts.push({ label: "시·군·구", value: countLabel(sigungus.length, "곳") });
  }
  if (province.area > 0) {
    facts.push({ label: "면적", value: `${province.area.toLocaleString()} km²` });
  }
  if (topCropNames.length > 0) {
    facts.push({ label: "대표 작물", value: topCropNames.slice(0, 3).join(" · ") });
  }
  if (counts.programs > 0) {
    facts.push({ label: "신청 가능 지원사업", value: countLabel(counts.programs, "건") });
  }

  const lines: PanelChipLine[] = [];
  if (province.highlights.length > 0) {
    lines.push({ label: "특징", chips: province.highlights.slice(0, 4) });
  }
  if (sigungus.length > 0) {
    const shown = sigungus.slice(0, 10);
    lines.push({
      label: "시·군·구",
      links: shown.map((sg) => ({
        label: sg.shortName,
        href: `/regions/${province.id}/${sg.id}`,
      })),
      overflow: sigungus.length - shown.length,
    });
  }

  return {
    kind: "province",
    absorbKeys: collectAbsorbKeys([`region-province-${province.id}`], groups, center),
    icon: "\u{1F4CD}", // 📍
    overline: "시·도",
    title: province.name,
    meta: `${province.shortName} 전체 정보`,
    summary: province.description,
    facts: facts.filter((f) => f.value).slice(0, 4),
    lines,
    bullets: [],
    crops,
    groups,
    center: toPanelCenter(center),
    ctas: [
      { href: base, label: "지역 상세 보기", primary: true },
      { href: `/regions/compare?regions=${province.id}`, label: "지역 비교에 넣기" },
    ],
  };
}

// ---------------------------------------------------------------------------
// 지원사업 패널
// ---------------------------------------------------------------------------

const RELATED_CROP_LIMIT = 5;

function buildProgramPanel(program: (typeof PROGRAMS)[number]): EntityPanel {
  const status = deriveStatus(program.applicationStart, program.applicationEnd);
  const facts: PanelFact[] = [
    {
      label: "접수 시기",
      value: formatApplicationPeriod(
        program.applicationStart,
        program.applicationEnd,
        program.applicationCycle,
      ),
    },
    { label: "지원 유형", value: program.supportType },
  ];
  const amount = leadSegment(program.supportAmount);
  if (amount) facts.push({ label: "지원 규모", value: truncate(amount, 34) });
  facts.push({
    label: "대상 연령",
    value: formatAgeRange(program.eligibilityAgeMin, program.eligibilityAgeMax),
  });

  const lines: PanelChipLine[] = [
    {
      label: "지역",
      chips: [program.region, ...(program.sigungu ? [program.sigungu] : [])],
    },
  ];
  if (program.relatedCrops.length >= CROPS.length) {
    // 범용 사업(ALL_CROP_NAMES, 55종) — 작물 55개를 칩으로 늘어놓으면 "+50"만 남아 정보가 아니다
    lines.push({ label: "관련 작물", chips: ["작물 구분 없이 신청할 수 있어요"] });
  } else if (program.relatedCrops.length > 0) {
    lines.push({
      label: "관련 작물",
      links: program.relatedCrops.slice(0, RELATED_CROP_LIMIT).map((name) => ({
        label: name,
        href: `/search?q=${encodeURIComponent(name)}`,
      })),
      overflow: Math.max(0, program.relatedCrops.length - RELATED_CROP_LIMIT),
    });
  }

  const bullets = splitSentences(program.description ?? "").slice(0, 2);

  return {
    kind: "program",
    absorbKeys: [`program-${program.id}`],
    icon: "\u{1F4CB}", // 📋
    overline: distinctOverline(program.organization, program.title),
    title: program.title,
    statusLabel: programStatusLabel({ ...program, status }),
    summary: program.summary,
    facts,
    lines,
    bullets,
    crops: [],
    groups: [],
    source: { label: sourceBlockLabel(program.sourceUrl), href: program.sourceUrl },
    ctas: [{ href: `/programs/${program.id}`, label: "지원사업 상세 보기", primary: true }],
  };
}

// ---------------------------------------------------------------------------
// 교육 과정 / 체험·행사 패널
// ---------------------------------------------------------------------------

function buildEducationPanel(course: (typeof EDUCATION_COURSES)[number]): EntityPanel {
  const status = deriveStatus(course.applicationStart, course.applicationEnd);
  const facts: PanelFact[] = [
    {
      label: "접수 기간",
      value: formatApplicationPeriod(course.applicationStart, course.applicationEnd),
    },
  ];
  if (course.duration) facts.push({ label: "교육 기간", value: course.duration });
  if (course.cost) facts.push({ label: "비용", value: course.cost });
  if (course.capacity != null && course.capacity > 0) {
    facts.push({ label: "정원", value: countLabel(course.capacity, "명") });
  }

  const lines: PanelChipLine[] = [{ label: "지역", chips: [course.region] }];
  if (course.target) lines.push({ label: "대상", chips: [truncate(course.target, 40)] });

  return {
    kind: "education",
    absorbKeys: [`education-${course.id}`],
    icon: "\u{1F393}", // 🎓
    overline: distinctOverline(course.organization, course.title),
    title: course.title,
    meta: `${course.type} · ${course.level}`,
    statusLabel: status,
    facts,
    lines,
    bullets: splitSentences(course.description ?? "").slice(0, 2),
    crops: [],
    groups: [],
    source: { label: "신청 페이지 보러가기", href: course.url },
    ctas: [{ href: `/education/${course.id}`, label: "교육 상세 보기", primary: true }],
  };
}

function buildEventPanel(event: (typeof EVENTS)[number]): EntityPanel {
  const status = deriveEventStatus(
    event.applicationStart,
    event.applicationEnd,
    event.dateEnd,
  );
  const facts: PanelFact[] = [
    { label: "행사일", value: formatDateRange(event.date, event.dateEnd) },
  ];
  if (event.applicationStart || event.applicationEnd) {
    facts.push({
      label: "접수 기간",
      value: formatApplicationPeriod(event.applicationStart, event.applicationEnd),
    });
  }
  if (event.cost) facts.push({ label: "비용", value: event.cost });
  if (event.capacity != null && event.capacity > 0) {
    facts.push({ label: "정원", value: countLabel(event.capacity, "명") });
  }

  const lines: PanelChipLine[] = [
    { label: "장소", chips: [event.region, truncate(event.location, 40)].filter(Boolean) },
  ];
  if (event.target) lines.push({ label: "대상", chips: [truncate(event.target, 40)] });

  return {
    kind: "event",
    absorbKeys: [`event-${event.id}`],
    icon: "\u{1F389}", // 🎉
    overline: distinctOverline(event.organization, event.title),
    title: event.title,
    meta: event.type,
    statusLabel: status,
    facts,
    lines,
    bullets: splitSentences(event.description ?? "").slice(0, 2),
    crops: [],
    groups: [],
    source: { label: "신청 페이지 보러가기", href: event.url },
    ctas: [{ href: `/events/${event.id}`, label: "행사 상세 보기", primary: true }],
  };
}

// ---------------------------------------------------------------------------
// 엔트리 포인트
// ---------------------------------------------------------------------------

/** 제목이 검색어와 완전히 같은 항목이 딱 하나일 때만 반환 */
function soleExactByTitle<T extends { title: string }>(items: readonly T[], q: string): T | null {
  const hits = items.filter((it) => it.title.trim().toLowerCase() === q);
  return hits.length === 1 ? hits[0] : null;
}

/**
 * 검색어가 하나의 실체로 특정되면 엔티티 패널 데이터를 반환한다.
 *
 * 특정 규칙 (확신 어조로 틀리지 않도록 폐쇄형):
 *  - 지역: 시·도·시·군·구 이름(정식·약칭) **완전 일치 + 후보 1개**. 동음("광주"·"중구"·"고성")은 null.
 *  - 지원사업·교육·행사: 제목 완전 일치 + 후보 1개. 마감된 항목은 null (검색 인덱스와 같은 기준).
 *  - 작물명은 `buildCropPanel` 담당이라 null.
 *  - 그 외(부분 일치·복합 검색어 "횡성 귀농")는 null → 기존 결과 흐름 유지.
 */
export function buildEntityPanel(query: string): EntityPanel | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  // 작물은 작물 지식 패널이 담당한다
  if (isCropName(q)) return null;

  // 지역 — 공백 없는 단일어만 (복합 검색어는 기존 흐름)
  if (!/\s/.test(q)) {
    const candidates = getRegionNameIndex().get(q);
    if (candidates && candidates.length === 1) {
      const only = candidates[0];
      if (only.kind === "province") return buildProvincePanel(only.province);
      if (only.kind === "sigungu") return buildSigunguPanel(only.sigungu);
      return null; // 구(區) 단독 — 패널 대상 아님
    }
    if (candidates && candidates.length > 1) return null; // 동음 — 특정 불가
  }

  // 지원사업 — 제목 완전 일치 (제목에 공백이 있어 단일어 조건을 걸 수 없다)
  const program = soleExactByTitle(PROGRAMS, q);
  if (program) {
    if (deriveStatus(program.applicationStart, program.applicationEnd) === "마감") return null;
    return buildProgramPanel(program);
  }

  const course = soleExactByTitle(EDUCATION_COURSES, q);
  if (course) {
    if (deriveStatus(course.applicationStart, course.applicationEnd) === "마감") return null;
    return buildEducationPanel(course);
  }

  const event = soleExactByTitle(EVENTS, q);
  if (event) {
    if (
      deriveEventStatus(event.applicationStart, event.applicationEnd, event.dateEnd) === "마감"
    ) {
      return null;
    }
    return buildEventPanel(event);
  }

  return null;
}
