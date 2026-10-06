/**
 * 체험·살아보기 카드/상세 공용 표시 규칙 (2026-09-30)
 *
 * 목록 카드와 상세 페이지가 같은 값을 다르게 보여주지 않도록 표기 판단을 한곳에 모았다.
 * 핵심 원칙은 **값이 상투적이면 숨긴다** — 수집 데이터는 "상세 공고 참조"처럼 정보량 0인
 * 채움값을 자주 담고 있고(9/30 기준 21건 전부 그랬다), 그런 값이 카드에서 가장 눈에 띄는
 * 자리를 차지하면 실제 판단 재료(신청 기간·운영 기간·인원)가 뒤로 밀린다.
 */
import { meaningfulValue } from "@/lib/programs/display";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";
import type { FarmEvent } from "@/lib/data/events";

const PROVINCE_BY_NAME = new Map(PROVINCES.map((p) => [p.name, p]));

/** 마을 유형 (귀농형 / 귀촌형 / 프로젝트형) */
const VILLAGE_TYPE_RE = /(귀농형|귀촌형|프로젝트형)/;

/** "농촌에서 살아보기" 계열 — 9/30 유형 '살아보기' 신설. 마이그레이션 전 행은 아직 '팜스테이'+제목으로 판별 */
export function isStayEvent(event: Pick<FarmEvent, "type" | "title">): boolean {
  return event.type === "살아보기" || (event.type === "팜스테이" && event.title.includes("살아보기"));
}

/**
 * 카드·상세의 유형 칩 라벨.
 * `villageType`(마이그레이션 후 채워짐)이 우선이고, 없으면 제목·대상 문구에서 마을 유형을
 * 뽑는다 — 수집 원문이 "…살아보기 (귀촌형)"처럼 제목에 담고 있어 유형 정보가 이미 있다.
 * 둘 다 없으면 EVENT_TYPES 값을 쓴다.
 */
export function eventTypeChip(
  event: Pick<FarmEvent, "type" | "villageType" | "title" | "target">,
): string {
  const explicit = event.villageType?.trim();
  if (explicit) return explicit;
  const derived = VILLAGE_TYPE_RE.exec(event.title) ?? VILLAGE_TYPE_RE.exec(event.target ?? "");
  if (derived) return derived[1];
  return event.type;
}

/**
 * "전남 강진군" — 시·도 약칭 + 시·군·구.
 * 시·군·구가 없으면 약칭("경기")만 남아 어색하므로 정식 명칭("경기도")을 쓴다.
 */
export function regionLabel(event: Pick<FarmEvent, "region" | "sigungu">): string {
  const province = PROVINCE_BY_NAME.get(event.region);
  if (!event.sigungu) return province?.name ?? event.region;
  return `${province?.shortName ?? event.region} ${event.sigungu}`;
}

/** 지역 상세(`/regions/…`) 경로. 시·군·구를 못 찾으면 시·도까지, 시·도도 없으면 null */
export function regionHref(event: Pick<FarmEvent, "region" | "sigungu">): string | null {
  const province = PROVINCE_BY_NAME.get(event.region);
  if (!province) return null;
  if (event.sigungu) {
    const sg = SIGUNGUS.find((x) => x.sidoId === province.id && x.name === event.sigungu);
    if (sg) return `/regions/${province.id}/${sg.id}`;
  }
  return `/regions/${province.id}`;
}

/** "2026-10-01" → "2026.10.01". 형식이 다르면 원문 그대로 (모듈 내부 전용) */
function formatYmdDot(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (!m) return raw;
  if (m[1] === "9999") return null;
  return `${m[1]}.${m[2]}.${m[3]}`;
}

/**
 * "2026.10.01 ~ 11.13" (끝이 없거나 같으면 시작일만).
 * 같은 해면 끝 날짜의 연도를 떼어 카드 한 줄에 들어가게 한다 — 목록의 모든 값이 같은 해라
 * 반복되는 "2026."은 비교에 쓰이지 않는다.
 */
export function formatDotRange(start: string | null | undefined, end: string | null | undefined): string | null {
  const s = formatYmdDot(start);
  const e = formatYmdDot(end);
  if (!s) return e ? `~ ${e}` : null;
  if (!e || e === s) return s;
  const sameYear = s.slice(0, 4) === e.slice(0, 4);
  return `${s} ~ ${sameYear ? e.slice(5) : e}`;
}

/**
 * 기간 길이 — "6주"처럼 한눈에 읽히는 라벨.
 * 도시 직장인은 날짜 두 개보다 "며칠 비워야 하나"를 먼저 계산한다. 그 계산을 대신한다.
 */
export function durationLabel(start: string | null | undefined, end: string | null | undefined): string | null {
  if (!start || !end) return null;
  const s = Date.parse(`${start.slice(0, 10)}T00:00:00Z`);
  const e = Date.parse(`${end.slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(s) || !Number.isFinite(e) || e < s) return null;
  const days = Math.round((e - s) / 86_400_000) + 1;
  if (days <= 1) return "하루";
  if (days <= 13) return `${days}일`;
  if (days <= 75) return `약 ${Math.round(days / 7)}주`;
  return `약 ${Math.round(days / 30)}개월`;
}

/** 비용 값이 정보를 담고 있는가 — "상세 공고 참조"·"추후 공지" 같은 채움값은 숨긴다(규칙 SSOT: lib/programs/display) */
export function meaningfulCost(cost: string | null | undefined): string | null {
  return meaningfulValue(cost);
}

/** "4가구 6명" / "6명" / null — 모집 인원 */
export function recruitLabel(event: Pick<FarmEvent, "households" | "capacity">): string | null {
  const households = typeof event.households === "number" && event.households > 0 ? `${event.households}가구` : null;
  const people = typeof event.capacity === "number" && event.capacity > 0 ? `${event.capacity}명` : null;
  if (households && people) return `${households} ${people}`;
  return households ?? people;
}

/**
 * 장소 값이 지역 라벨과 겹치지 않는가.
 * 수집 데이터의 `location`은 "전라남도 강진군"처럼 지역과 같은 문자열일 때가 많다 —
 * 그러면 같은 정보가 카드에 두 번 나온다.
 */
export function distinctLocation(event: Pick<FarmEvent, "location" | "region" | "sigungu">): string | null {
  const value = event.location?.trim();
  if (!value) return null;
  const compact = (t: string) => t.replace(/\s+/g, "");
  const region = compact(value);
  if (region === compact(event.region) || region === compact(`${event.region}${event.sigungu ?? ""}`)) return null;
  if (region === compact(regionLabel(event))) return null;
  return value;
}

/** 대상 값이 유형 칩과 겹치지 않는가 ("농촌에서 살아보기 귀촌형" ↔ 칩 "귀촌형") */
export function distinctTarget(
  event: Pick<FarmEvent, "target" | "type" | "villageType" | "title">,
): string | null {
  const value = event.target?.trim();
  if (!value) return null;
  const chip = eventTypeChip(event);
  if (value.includes(chip) && value.replace(chip, "").replace(/[\s·]|농촌에서\s*살아보기/g, "") === "") return null;
  return value;
}

/** 수집 안내 상투 문구인가 — 21건이 같은 문장을 쓰고 있어 카드 설명으로는 정보량이 0 */
export function isBoilerplateDescription(description: string | null | undefined): boolean {
  const text = description?.trim();
  if (!text) return true;
  return /그린대로.*(수집했어요|집계 기준)/.test(text);
}

/** 카드·상세가 공유하는 사실 행 한 줄 */
export interface EventFact {
  label: string;
  value: string;
  /** 값을 링크로 만들 때 (지역 상세 등) */
  href?: string;
}

/**
 * 사실 행 조립 — 값이 없거나 상투적이면 그 행 자체를 만들지 않는다.
 *
 * `card` 는 비교에 필요한 4줄만(기간·인원), `detail` 은 지역·주최·대상·비용까지.
 * 순서는 사용자가 먼저 묻는 것부터: 언제 들어가나 → 언제까지 신청하나 → 얼마나 머무나 → 몇 명.
 */
export function buildEventFacts(event: FarmEvent, variant: "card" | "detail"): EventFact[] {
  const facts: EventFact[] = [];
  const push = (label: string, value: string | null | undefined, href?: string) => {
    if (value) facts.push(href ? { label, value, href } : { label, value });
  };

  const stay = isStayEvent(event);
  const period = formatDotRange(event.date, event.dateEnd);
  const span = durationLabel(event.date, event.dateEnd);

  if (stay) {
    push("입주 가능일", formatYmdDot(event.moveInDate));
    push("신청 기간", formatDotRange(event.applicationStart, event.applicationEnd));
    push("운영 기간", period && span ? `${period} (${span})` : period);
    push("모집 인원", recruitLabel(event));
  } else {
    push("행사 일정", period && span && span !== "하루" ? `${period} (${span})` : period);
    push("접수 기간", formatDotRange(event.applicationStart, event.applicationEnd));
    push("장소", distinctLocation(event));
    push("정원", recruitLabel(event));
  }

  if (variant === "detail") {
    if (stay) push("장소", distinctLocation(event));
    push("지역", regionLabel(event), regionHref(event) ?? undefined);
    push("주최", event.organization);
    push("대상", distinctTarget(event));
    push("비용", meaningfulCost(event.cost));
  }

  return facts;
}

/** "2026-10-13" → "10월 13일" (형식이 다르거나 미정 9999 면 null) */
function monthDayLabel(raw: string | null | undefined): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw ?? "");
  if (!m || m[1] === "9999") return null;
  return `${Number(m[2])}월 ${Number(m[3])}일`;
}

/**
 * 상세 페이지 제목 — 같은 제목의 행사가 여럿이면 시작일을 붙여 가른다 (10/6 QA Q2-X4).
 * 그린대로는 회차를 같은 제목·설명으로 올린다(춘천 팸투어 10/13·10/14, 살아보기 마을 1·2차) — 상세 `<title>`·
 * 설명·공유 카드가 글자 하나 다르지 않아 검색엔진에는 중복 문서로, 사람에게는 같은 글로 보였다.
 * 쌍둥이가 없거나 날짜까지 같으면(날짜로도 못 가른다) 원문 제목 그대로.
 */
export function distinctEventTitle(
  event: Pick<FarmEvent, "id" | "title" | "date">,
  all: readonly Pick<FarmEvent, "id" | "title" | "date">[],
): string {
  const twins = all.filter((e) => e.id !== event.id && e.title === event.title);
  if (twins.length === 0) return event.title;
  const label = monthDayLabel(event.date);
  if (!label || twins.every((e) => e.date === event.date)) return event.title;
  return `${event.title} · ${label}`;
}

/**
 * 카드에 쓸 제목 — 꼬리에 붙은 마을 유형 표기를 뗀다.
 * 수집 원문이 "…살아보기 (귀촌형)" 형태라 유형 칩과 같은 말이 카드에 두 번 나온다.
 * 상세 페이지는 원문 제목을 그대로 쓴다(그 문서의 정체성이므로).
 */
export function cardTitle(event: Pick<FarmEvent, "title" | "type" | "villageType" | "target">): string {
  const chip = eventTypeChip(event);
  const trimmed = event.title.replace(new RegExp(`\\s*[（(]${chip}[）)]\\s*$`), "").trim();
  return trimmed || event.title;
}
