import { PROVINCES } from "@/lib/data/regions";
import { getEventImage } from "@/lib/events/event-image";
import { ALWAYS_OPEN, daysUntilDeadline, type ProgramStatus } from "@/lib/program-status";
import { formatAgeRange } from "@/lib/format";
import type { SupportProgram } from "@/lib/data/programs";
import type { FarmEvent } from "@/lib/data/events";
import type { EducationCourse } from "@/lib/data/education";
import { durationLabel as spanLabel, isStayEvent, recruitLabel } from "@/components/events/event-fields";
import { DiscoverTabs, type DiscoverCard, type DiscoverTab } from "./discover-tabs";
import s from "./discover-section.module.css";

/**
 * 랜딩 "지금 열린 기회"(지원사업·교육) + "직접 가 보는 농촌"(체험·행사) 두 섹션.
 *
 * 9/30 회장 지시로 네 유형을 한 섹션 + 탭으로 모았다가, 10/1 회장 판단으로 둘로 나눴다 —
 * 지원사업·교육은 이미지가 없어 사진 커버플로우에 넣으면 빈 흰 포스터가 된다.
 * 정보형(금액·기간을 비교) = 텍스트 카드 그리드, 경험형(어디서 무엇을) = 사진 캐러셀.
 *
 * Server Component: 데이터 → 표시 문장 변환까지 끝내고 클라이언트에는 문자열만 넘긴다.
 * PROVINCES(행정구역 SSOT)·상태 산출·날짜 포맷이 클라이언트 번들에 들어가지 않는다.
 */

/** 탭 하나에 올릴 카드 상한 — 8장이면 커버플로우 양 끝이 화면 밖으로 잘려 "더 있다"가 읽힌다 */
const MAX_CARDS = 8;

/**
 * 마감 임박(D-N) 배지 기준 — 유형마다 접수창 길이가 달라 한 값으로 묶을 수 없다.
 * 지원사업은 접수창이 1~3개월이라 14일이 "서둘러야 하는" 구간이고(9/14 회장 결재값 유지),
 * 살아보기·교육은 2~6주라 14일로 잡으면 거의 전건에 배지가 붙어 신호가 죽는다.
 */
const URGENT_DAYS = {
  programs: 14,
  education: 7,
  experience: 7,
  festival: 7,
} as const;

const SHORT_NAME_BY_PROVINCE = new Map(PROVINCES.map((p) => [p.name, p.shortName]));

/** "2026-09-30" → "9.30" (앞자리 0 없이 — 카드 안에서 가장 짧게 읽히는 형태) */
function mmdd(date: string): string {
  const [, m, d] = date.split("-").map(Number);
  return Number.isFinite(m) && Number.isFinite(d) ? `${m}.${d}` : date;
}

/** "전남 강진군" — 시·도 약칭 + 시·군·구. 시·군·구가 없으면 시·도 이름 그대로("전국" 포함) */
function regionText(region: string, sigungu?: string): string {
  return [SHORT_NAME_BY_PROVINCE.get(region) ?? region, sigungu].filter(Boolean).join(" ");
}

/** 마감 임박 배지 — 지금 받는 중이고 기준 일수 이내일 때만 */
function urgentLabel(open: boolean, applicationEnd: string | undefined, within: number) {
  if (!open || !applicationEnd || applicationEnd === ALWAYS_OPEN) return undefined;
  const left = daysUntilDeadline(applicationEnd);
  if (!Number.isFinite(left) || left < 0 || left > within) return undefined;
  return left === 0 ? "오늘 마감" : `D-${left}`;
}

/** "~10.6 마감" — 배지가 "오늘 마감"을 말하는 날엔 같은 말을 두 번 쓰지 않는다 */
function deadlineText(applicationEnd: string | undefined, hasUrgentBadge: boolean) {
  if (!applicationEnd || applicationEnd === ALWAYS_OPEN) return undefined;
  if (hasUrgentBadge && daysUntilDeadline(applicationEnd) === 0) return undefined;
  return `~${mmdd(applicationEnd)} 마감`;
}

/** "10.19 ~ 10.21 · 3일" / "10.13 하루" — 언제 열리고 며칠인지 한 줄로 */
function scheduleText(start: string | null | undefined, end: string | null | undefined) {
  if (!start) return undefined;
  const span = spanLabel(start, end);
  const range = end && end.slice(0, 10) !== start.slice(0, 10) ? `${mmdd(start)} ~ ${mmdd(end)}` : mmdd(start);
  if (span === "하루") return `${range} 하루`;
  return span ? `${range} · ${span}` : range;
}

/**
 * 크롤 제목에서 모사업 이름만 남긴다.
 *
 * 수집 원문은 "모사업명 · 회차 공고명" 꼴이고, 앞에 "(접수기간 9. 28. ~ 9. 30.)" 같은
 * 안내 괄호가 붙는 행도 있다. 카드 제목 자리에는 무엇에 관한 것인지만 있으면 된다.
 */
function groupTitle(title: string): string {
  const head = title.includes(" · ") ? title.split(" · ")[0] : title;
  return head.replace(/^\(\s*접수기간[^)]*\)\s*/, "").trim() || title;
}

/**
 * 같은 모사업의 중복 카드를 하나로 — 그룹명 기준 첫 건만 남긴다.
 *
 * `filterEducationAsync` 의 지역 그룹핑(crawl-grouping)은 "지역만 다른 공고"를 묶지만,
 * 같은 과정을 **시간대별**로 쪼갠 행(유형특화과정 10/1 10시·13시·15시 …)은 제목이 달라 살아남는다.
 * 랜딩은 8장이 전부라 그런 행이 들어오면 탭 하나가 같은 과정으로 채워진다.
 */
/** 같은 모사업을 한 건으로 센 개수 — 히어로 데이터 줄(10/1)이 원본 행 수(시간대별 분할 포함)를 과장하지 않게 */
export function countDistinctByGroup(items: { title: string }[]): number {
  return new Set(items.map((item) => groupTitle(item.title))).size;
}

function dedupeByGroup<T extends { title: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = groupTitle(item.title);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* ══════════════ 지원사업 ══════════════
   기존 랜딩 지원사업 카드의 표기 언어를 그대로 옮겼다 — 금액이 첫 줄, 신청 기간·연령이 둘째 줄.
   도시 직장인이 지원사업을 볼 때 판단 순서가 "얼마 → 언제까지 → 내가 대상인가"라서다.
   이미지가 없는 유형이라 정보 카드 그리드로 그려진다. */

type ActiveProgram = SupportProgram & {
  programStatus: ProgramStatus;
  daysLeft?: number;
};

/** 신청 기간 — 상시 건은 날짜 대신 상시 문구 (9999-12-31이 "12.31"로 새는 것 방지) */
function programPeriod(start: string, end: string): string {
  if (end === ALWAYS_OPEN) return `${mmdd(start)}부터 상시 모집`;
  return `${mmdd(start)} ~ ${mmdd(end)}`;
}

function toProgramCard(p: ActiveProgram, ongoing: boolean): DiscoverCard {
  const upcoming = p.programStatus === "모집예정";
  const deadlineLabel = upcoming ? undefined : urgentLabel(true, p.applicationEnd, URGENT_DAYS.programs);

  return {
    id: p.id,
    href: `/programs/${p.id}`,
    status: upcoming ? "모집예정" : ongoing ? "상시 모집" : "모집중",
    statusTone: upcoming ? "soon" : "open",
    deadlineLabel,
    chip: p.supportType,
    region: regionText(p.region, p.sigungu),
    title: p.title,
    line1: p.supportAmount,
    line2: [`신청 ${programPeriod(p.applicationStart, p.applicationEnd)}`, formatAgeRange(p.eligibilityAgeMin, p.eligibilityAgeMax)]
      .filter(Boolean)
      .join(" · "),
    foot: p.organization,
  };
}

/* ══════════════ 교육 ══════════════
   ① 온라인인가(휴가를 내야 하나) ② 언제 열리나 ③ 언제까지 신청하나 ④ 정원.
   도시 직장인은 교육을 볼 때 "다닐 수 있나"를 먼저 계산한다 — 그 순서로 배치했다. */

/** 예비 귀농·귀촌인을 향한 과정인가 — 현직 농업인 기술교육(병해충 방제·근골격계 예방)과 가른다 */
const SETTLER_HINT = /(귀농|귀촌|귀산|귀어|전원|정착|예비|도시민|창업|입문|탐색|살아보기|한달|로컬|워홀)/;

function isSettlerCourse(c: EducationCourse): boolean {
  return SETTLER_HINT.test(c.title) || SETTLER_HINT.test(c.target ?? "");
}

/** "2026-10-19 ~ 2026-10-21" 같은 일정 문자열에서 실제 날짜 구간을 읽는다. 채움값이면 없음 */
function parseSchedule(schedule: string | undefined): { start: string; end: string | null } | null {
  if (!schedule) return null;
  const range = /(\d{4}-\d{2}-\d{2})\s*~\s*(\d{4}-\d{2}-\d{2})/.exec(schedule);
  if (range) return { start: range[1], end: range[2] };
  const single = /(\d{4}-\d{2}-\d{2})/.exec(schedule);
  return single ? { start: single[1], end: null } : null;
}

/**
 * 수집 원문이 비어 있을 때 넣는 채움값 — 카드에 올리면 정보량 0 인 칩이 된다(9/30 사진 카드 규칙과 같은 결).
 * 10/2 실측: 공개 교육 60건 중 비용·기간은 58건이 "상세 공고 참조", 과정 구분은 9건이 채움값.
 */
const FILLER_RE = /(상세\s*공고|공고문\s*참조|확인\s*필요|추후\s*공지|미정)/;

function realValue(value: string | undefined | null): string | undefined {
  const v = value?.trim();
  return v && !FILLER_RE.test(v) ? v : undefined;
}

/**
 * 교육 카드 부가 칩 (10/2 회장: 지원사업 카드처럼 부가 데이터를).
 * 실제 값이 있는 필드만 — 과정 구분(그린대로 eduSeNm, 예: "귀농귀촌아카데미")·비용·기간.
 * 난이도(level)는 공개 60건 중 59건이 "초급"이라 구분 정보가 없어 싣지 않는다.
 */
function educationTags(c: EducationCourse): string[] {
  const category = realValue(c.target);
  return [category !== c.type ? category : undefined, realValue(c.cost), realValue(c.duration)].filter(
    (v): v is string => Boolean(v),
  );
}

function toEducationCard(c: EducationCourse): DiscoverCard {
  const open = c.status === "모집중";
  const deadlineLabel = urgentLabel(open, c.applicationEnd, URGENT_DAYS.education);
  const period = parseSchedule(c.schedule);
  // 아직 접수 전이면 "언제까지"보다 "언제부터"가 먼저다 — 체험 카드와 같은 규칙
  const apply =
    c.status === "모집예정" && c.applicationStart && c.applicationStart !== ALWAYS_OPEN
      ? `${mmdd(c.applicationStart)}부터 신청`
      : deadlineText(c.applicationEnd, Boolean(deadlineLabel));

  return {
    id: c.id,
    href: `/education/${c.id}`,
    status: c.status,
    statusTone: open ? "open" : "soon",
    deadlineLabel,
    chip: c.type,
    region: regionText(c.region, c.sigungu),
    title: groupTitle(c.title),
    line1: period ? scheduleText(period.start, period.end) : undefined,
    line2: [apply, c.capacity ? `${c.capacity}명 모집` : null].filter(Boolean).join(" · "),
    tags: educationTags(c),
    foot: c.organization,
  };
}

/* ══════════════ 체험 (살아보기 · 팜스테이 · 일일체험) ══════════════
   9/30 살아보기 카드 규칙을 그대로 유지한다 — ① 상태·마감 임박 ② 지역·마을 ③ 얼마나 사는지
   ④ 언제까지·몇 명. 신청 기간은 전체 날짜 대신 "~9.30 마감" 한 조각만(전체 기간은 상세 몫).
   살아보기가 아닌 건(한 달 체험·팸투어)은 "마을에 산다"가 아니라 "며칠 다녀온다"라서
   첫 줄을 일정 + 기간 길이로 바꾼다. */

/**
 * "청미래마을 농촌에서 살아보기 (귀촌형)" → { name: "청미래마을", type: "귀촌형" }.
 * 수집 원문 제목이 전건 이 꼴이고 `village_type` 컬럼은 아직 비어 있는 행이 많다 —
 * 컬럼이 있으면 그것을 쓰고, 없으면 제목 괄호에서 읽는다.
 */
function parseStayTitle(title: string): { name: string; type?: string } {
  let name = title.trim();
  let type: string | undefined;

  const paren = name.match(/\(\s*([^()]*형)\s*\)\s*$/);
  if (paren) {
    type = paren[1].trim();
    name = name.slice(0, paren.index).trim();
  }
  name = name
    .replace(/농촌에서\s*살아보기/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  return { name: name || title.trim(), type };
}

/** 운영 기간 길이 — "10.1부터 6주 살아보기". 방문자가 먼저 궁금해하는 건 "얼마나 사는지" */
function stayDuration(start: string, end: string | null): string | undefined {
  if (!end) return undefined;
  const days = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1;
  if (!Number.isFinite(days) || days <= 0) return undefined;

  let span: string;
  if (days < 10) span = `${days}일`;
  else if (days <= 56) span = `${Math.round(days / 7)}주`;
  else span = `${Math.round(days / 30)}개월`;

  return `${mmdd(start)}부터 ${span} 살아보기`;
}

function toEventCard(event: FarmEvent, within: number): DiscoverCard {
  const stay = isStayEvent(event);
  const { name, type } = parseStayTitle(event.title);
  const open = event.status === "접수중";
  const deadlineLabel = urgentLabel(open, event.applicationEnd, within);
  const openEnded = !event.applicationEnd || event.applicationEnd === ALWAYS_OPEN;

  let apply: string | undefined;
  if (openEnded) apply = "상시 모집";
  else if (event.status === "접수예정" && event.applicationStart) apply = `${mmdd(event.applicationStart)}부터 신청`;
  else apply = deadlineText(event.applicationEnd, Boolean(deadlineLabel));

  const recruit = recruitLabel(event);

  return {
    id: event.id,
    href: `/events/${event.id}`,
    image: getEventImage(event),
    status: event.status,
    statusTone: open ? "open" : "soon",
    deadlineLabel,
    chip: stay ? event.villageType || type : event.type,
    region: regionText(event.region, event.sigungu),
    title: stay ? name : groupTitle(event.title),
    line1: stay ? stayDuration(event.date, event.dateEnd) : scheduleText(event.date, event.dateEnd),
    line2: [apply, recruit ? `${recruit} 모집` : null].filter(Boolean).join(" · "),
  };
}

/* ══════════════ 고르기 ══════════════ */

/** 접수중 → 접수예정 순, 같은 상태에선 마감이 가까운 순. 접수창이 짧아 임박 건이 "지금 결정할 카드"다 */
function byOpenThenDeadline<T extends { status: string; applicationEnd?: string | null; date?: string }>(
  openLabel: string,
  soonLabel: string,
) {
  const rank = (status: string) => (status === openLabel ? 0 : status === soonLabel ? 1 : 2);
  return (a: T, b: T) =>
    rank(a.status) - rank(b.status) || (a.applicationEnd ?? a.date ?? "").localeCompare(b.applicationEnd ?? b.date ?? "");
}

/**
 * 체험 = 가서 겪어 보는 것(살아보기·팜스테이·일일체험) / 행사 = 가서 듣고 보는 것(박람회·설명회·멘토링·축제).
 * `isStayEvent` 를 함께 보는 이유: 마이그레이션 전 행은 유형이 '팜스테이'인 채 제목으로만 살아보기다.
 */
const isExperience = (e: FarmEvent) => isStayEvent(e) || e.type === "살아보기" || e.type === "일일체험" || e.type === "팜스테이";
const isFestival = (e: FarmEvent) => e.type === "박람회" || e.type === "설명회" || e.type === "멘토링" || e.type === "축제";

interface OpportunityProps {
  /** 기간 한정 공고 (page.tsx getProgramsData) */
  activePrograms: ActiveProgram[];
  /** 상시·연중 모집 (마감 없음 또는 접수 150일 이상) */
  ongoingPrograms: ActiveProgram[];
  courses: EducationCourse[];
}

/** 지원사업 · 교육 — 이미지 없는 정보 카드 그리드 */
export function OpportunitySection({ activePrograms, ongoingPrograms, courses }: OpportunityProps) {
  const programCards = [
    ...activePrograms.map((p) => toProgramCard(p, false)),
    // 상시·연중 건은 같은 트랙 뒤에 — 마감이 없어 "지금 서둘러야 하는" 카드보다 급하지 않다
    ...ongoingPrograms.map((p) => toProgramCard(p, true)),
  ].slice(0, MAX_CARDS);

  const educationCards = dedupeByGroup(
    courses
      .filter((c) => c.status !== "마감")
      .slice()
      .sort(byOpenThenDeadline<EducationCourse>("모집중", "모집예정")),
  )
    // 예비 귀농·귀촌인 과정을 앞으로 — 현직 농업인 기술교육은 이 랜딩의 독자와 다르다
    .sort((a, b) => Number(isSettlerCourse(b)) - Number(isSettlerCourse(a)))
    .slice(0, MAX_CARDS)
    .map(toEducationCard);

  // 카드가 없는 탭은 만들지 않는다 — 빈 패널을 보여주는 건 탭을 누른 사람에게 헛걸음이다
  const tabs: DiscoverTab[] = [
    {
      id: "programs",
      label: "지원사업",
      viewAllHref: "/programs",
      cards: programCards,
    },
    {
      id: "education",
      label: "교육",
      viewAllHref: "/education",
      cards: educationCards,
    },
  ].filter((t) => t.cards.length > 0);

  if (tabs.length === 0) return null;

  return (
    <section className={s.section} aria-label="지금 열린 기회">
      {/* 제목 블록까지 DiscoverTabs 안에 있다 — 이유는 그 파일 주석(9/30 SSR 실측) */}
      <DiscoverTabs
        tabs={tabs}
        variant="text"
        heading={{
          eyebrow: "#모집 중",
          titleLead: "지금 열린",
          titleEm: "기회",
          sub: "지원금과 교육, 탭으로 골라 보세요",
        }}
      />
    </section>
  );
}

/** 체험 · 행사 — 사진 카드 커버플로우 */
export function ExperienceSection({ events }: { events: FarmEvent[] }) {
  const pickEvents = (match: (e: FarmEvent) => boolean) =>
    dedupeByGroup(
      events
        .filter((e) => e.status !== "마감" && match(e))
        .slice()
        .sort(byOpenThenDeadline<FarmEvent>("접수중", "접수예정")),
    ).slice(0, MAX_CARDS);

  const experienceCards = pickEvents(isExperience).map((e) => toEventCard(e, URGENT_DAYS.experience));
  const festivalCards = pickEvents(isFestival).map((e) => toEventCard(e, URGENT_DAYS.festival));

  const tabs: DiscoverTab[] = [
    {
      id: "experience",
      label: "체험",
      viewAllHref: "/events",
      cards: experienceCards,
    },
    {
      id: "festival",
      label: "행사",
      viewAllHref: "/events?type=박람회",
      cards: festivalCards,
    },
  ].filter((t) => t.cards.length > 0);

  if (tabs.length === 0) return null;

  return (
    <section className={s.section} aria-label="직접 가 보는 농촌">
      <DiscoverTabs
        tabs={tabs}
        variant="photo"
        heading={{
          eyebrow: "#가서 겪어 보기",
          titleLead: "직접 가 보는",
          titleEm: "농촌",
          sub: "살아보기·체험부터 박람회까지",
        }}
      />
    </section>
  );
}
