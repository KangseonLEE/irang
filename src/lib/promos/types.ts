/**
 * 홍보 팝업 — DB 레코드 타입 · row 매핑 · 검증 (2026-09-29 회장 지시)
 *
 * 화면(랜딩)이 쓰는 형태는 정적 시절과 동일한 `PromoPopupItem` 이고,
 * 관리자가 다루는 형태는 거기에 노출 제어 필드(startsAt·active·sortOrder)를 더한 `PromoRecord`.
 * row ↔ 타입 매핑은 이 파일 한 곳에서만 한다(스키마 컬럼명이 흩어지지 않게).
 */

import type { PromoPopupItem } from "@/lib/data/promo-popup";

export type { PromoPopupItem };

/** 관리자 화면·API 가 다루는 전체 레코드 */
export interface PromoRecord extends PromoPopupItem {
  /** 노출 시작(KST, 포함). null = 즉시 */
  startsAt: string | null;
  /** 수동 on/off — false 면 기간 안이어도 노출하지 않는다 */
  active: boolean;
  /** 같은 날 겹치는 팝업의 노출 순서(오름차순) */
  sortOrder: number;
  /** 마지막 수정 시각(ISO) — 서버가 채운다 */
  updatedAt: string;
}

/** 저장 입력(작성·수정) — updatedAt 은 서버가 채운다 */
export type PromoInput = Omit<PromoRecord, "updatedAt">;

/** Supabase row 원형 */
export interface PromoRow {
  id: string;
  org: string;
  title: string;
  tagline: string | null;
  image_url: string;
  image_width: number;
  image_height: number;
  alt: string | null;
  facts: unknown;
  recruit_closed: boolean;
  note: string | null;
  href: string;
  starts_at: string | null;
  until: string;
  active: boolean;
  sort_order: number;
  updated_at: string | null;
}

export const PROMO_COLUMNS =
  "id, org, title, tagline, image_url, image_width, image_height, alt, facts, recruit_closed, note, href, starts_at, until, active, sort_order, updated_at";

type PromoFact = PromoPopupItem["facts"][number];

function toFacts(value: unknown): PromoFact[] {
  if (!Array.isArray(value)) return [];
  const out: PromoFact[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const rec = raw as Record<string, unknown>;
    if (typeof rec.label !== "string" || typeof rec.value !== "string") continue;
    out.push(
      typeof rec.href === "string" && rec.href
        ? { label: rec.label, value: rec.value, href: rec.href }
        : { label: rec.label, value: rec.value },
    );
  }
  return out;
}

/** row → 레코드 (DB 의 null 은 화면 계약(문자열)으로 좁힌다) */
export function rowToRecord(row: PromoRow): PromoRecord {
  return {
    id: row.id,
    org: row.org,
    title: row.title,
    tagline: row.tagline ?? "",
    image: row.image_url,
    imageWidth: row.image_width,
    imageHeight: row.image_height,
    alt: row.alt ?? "",
    facts: toFacts(row.facts),
    recruitClosed: row.recruit_closed,
    note: row.note ?? "",
    href: row.href,
    until: row.until,
    startsAt: row.starts_at,
    active: row.active,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at ?? "",
  };
}

/** 레코드 → row (INSERT/UPDATE payload. updated_at 은 트리거가 채운다) */
export function recordToRow(record: PromoInput): Omit<PromoRow, "updated_at"> {
  return {
    id: record.id,
    org: record.org,
    title: record.title,
    tagline: record.tagline,
    image_url: record.image,
    image_width: record.imageWidth,
    image_height: record.imageHeight,
    alt: record.alt,
    facts: record.facts,
    recruit_closed: record.recruitClosed,
    note: record.note,
    href: record.href,
    starts_at: record.startsAt,
    until: record.until,
    active: record.active,
    sort_order: record.sortOrder,
  };
}

/** 저장 입력 형태로 — 서버가 채우는 updatedAt 을 떼어낸다 */
export function toPromoInput(record: PromoRecord): PromoInput {
  const { id, org, title, tagline, image, imageWidth, imageHeight, alt, facts, recruitClosed, note, href, until } =
    record;
  return {
    id,
    org,
    title,
    tagline,
    image,
    imageWidth,
    imageHeight,
    alt,
    facts,
    recruitClosed,
    note,
    href,
    until,
    startsAt: record.startsAt,
    active: record.active,
    sortOrder: record.sortOrder,
  };
}

/** 화면이 쓰는 최소 형태만 뽑는다(관리 전용 필드 유출 방지) */
export function toPopupItem(record: PromoRecord): PromoPopupItem {
  const { id, org, title, tagline, image, imageWidth, imageHeight, alt, facts, recruitClosed, note, href, until } =
    record;
  return { id, org, title, tagline, image, imageWidth, imageHeight, alt, facts, recruitClosed, note, href, until };
}

// ── 검증 ──────────────────────────────────────────────────────

/** 마이그레이션 CHECK 와 동일 범위 — API 에서 먼저 걸러 400 으로 돌려준다 */
export const PROMO_ID_RE = /^[a-z0-9][a-z0-9-]{1,63}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 카피 톤 가드 — "~합니다/입니다" 금지(.claude/rules/copywriting.md).
 * 화면에 그대로 나가는 문장 필드에만 적용한다.
 * "잇습니다"처럼 어간이 다른 격식체도 같은 톤이라 `습니다` 까지 함께 막는다.
 */
const FORBIDDEN_TONE_RE = /합니다|입니다|습니다/;

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * 저장 입력 검증. 통과하면 정규화된 입력, 실패하면 에러 목록.
 * `partial` 이면 들어온 필드만 검사한다(PUT 부분 수정).
 */
export function validatePromoInput(
  input: Partial<PromoInput>,
  opts: { partial?: boolean } = {},
): { ok: true; value: Partial<PromoInput> } | { ok: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const partial = opts.partial === true;
  const value: Partial<PromoInput> = {};
  const has = (k: keyof PromoInput) => input[k] !== undefined;
  const required = (k: keyof PromoInput) => !partial || has(k);

  const str = (k: keyof PromoInput, max: number, { allowEmpty = false } = {}): string | null => {
    const raw = input[k];
    if (typeof raw !== "string") {
      errors.push({ field: k, message: `${k} 는 문자열이어야 해요` });
      return null;
    }
    const trimmed = raw.trim();
    if (!allowEmpty && !trimmed) {
      errors.push({ field: k, message: `${k} 를 채워 주세요` });
      return null;
    }
    if (trimmed.length > max) {
      errors.push({ field: k, message: `${k} 는 ${max}자 이하로 써 주세요` });
      return null;
    }
    return trimmed;
  };

  if (required("id")) {
    const id = str("id", 64);
    if (id !== null) {
      if (!PROMO_ID_RE.test(id)) {
        errors.push({ field: "id", message: "id 는 소문자·숫자·하이픈 슬러그여야 해요 (예: gafi-masil-2026)" });
      } else value.id = id;
    }
  }
  if (required("org")) {
    const v = str("org", 80);
    if (v !== null) value.org = v;
  }
  if (required("title")) {
    const v = str("title", 120);
    if (v !== null) value.title = v;
  }
  if (!partial || has("tagline")) {
    const v = str("tagline", 200, { allowEmpty: true });
    if (v !== null) value.tagline = v;
  }
  if (!partial || has("alt")) {
    const v = str("alt", 300, { allowEmpty: true });
    if (v !== null) value.alt = v;
  }
  if (!partial || has("note")) {
    const v = str("note", 500, { allowEmpty: true });
    if (v !== null) value.note = v;
  }

  if (required("image")) {
    const v = str("image", 500);
    if (v !== null) {
      if (!/^(\/|https:\/\/)/.test(v)) {
        errors.push({ field: "image", message: "포스터 주소는 / 로 시작하거나 https:// 여야 해요" });
      } else value.image = v;
    }
  }
  if (required("href")) {
    const v = str("href", 500);
    if (v !== null) {
      if (!v.startsWith("https://")) {
        errors.push({ field: "href", message: "자세히 보기 링크는 https:// 여야 해요" });
      } else value.href = v;
    }
  }

  for (const k of ["imageWidth", "imageHeight"] as const) {
    if (!required(k)) continue;
    const raw = input[k];
    if (typeof raw !== "number" || !Number.isInteger(raw) || raw <= 0) {
      errors.push({ field: k, message: `${k} 는 1 이상의 정수여야 해요` });
    } else value[k] = raw;
  }

  if (!partial || has("sortOrder")) {
    const raw = input.sortOrder;
    if (raw === undefined) value.sortOrder = 0;
    else if (typeof raw !== "number" || !Number.isInteger(raw)) {
      errors.push({ field: "sortOrder", message: "sortOrder 는 정수여야 해요" });
    } else value.sortOrder = raw;
  }

  for (const k of ["recruitClosed", "active"] as const) {
    if (!required(k)) continue;
    const raw = input[k];
    if (raw === undefined) value[k] = k === "active";
    else if (typeof raw !== "boolean") {
      errors.push({ field: k, message: `${k} 는 true/false 여야 해요` });
    } else value[k] = raw;
  }

  if (required("until")) {
    const raw = input.until;
    if (typeof raw !== "string" || !DATE_RE.test(raw)) {
      errors.push({ field: "until", message: "노출 종료일은 YYYY-MM-DD 형식이어야 해요" });
    } else value.until = raw;
  }
  if (!partial || has("startsAt")) {
    const raw = input.startsAt;
    if (raw === null || raw === undefined || raw === "") value.startsAt = null;
    else if (typeof raw !== "string" || !DATE_RE.test(raw)) {
      errors.push({ field: "startsAt", message: "노출 시작일은 YYYY-MM-DD 형식이거나 비워 두세요" });
    } else value.startsAt = raw;
  }
  if (value.startsAt && value.until && value.startsAt > value.until) {
    errors.push({ field: "until", message: "노출 종료일은 시작일과 같거나 뒤여야 해요" });
  }

  if (required("facts")) {
    const raw = input.facts;
    if (!Array.isArray(raw)) {
      errors.push({ field: "facts", message: "정보 행은 배열이어야 해요" });
    } else if (raw.length > 12) {
      errors.push({ field: "facts", message: "정보 행은 12개까지 넣을 수 있어요" });
    } else {
      const facts: PromoFact[] = [];
      raw.forEach((item, i) => {
        const rec = (item ?? {}) as Record<string, unknown>;
        const label = typeof rec.label === "string" ? rec.label.trim() : "";
        const val = typeof rec.value === "string" ? rec.value.trim() : "";
        if (!label || !val) {
          errors.push({ field: `facts[${i}]`, message: "정보 행은 label·value 가 모두 있어야 해요" });
          return;
        }
        if (label.length > 20 || val.length > 200) {
          errors.push({ field: `facts[${i}]`, message: "라벨 20자·값 200자를 넘었어요" });
          return;
        }
        const href = typeof rec.href === "string" ? rec.href.trim() : "";
        if (href && !/^(https:\/\/|tel:)/.test(href)) {
          errors.push({ field: `facts[${i}].href`, message: "정보 행 링크는 https:// 또는 tel: 이어야 해요" });
          return;
        }
        facts.push(href ? { label, value: val, href } : { label, value: val });
      });
      if (!errors.some((e) => e.field.startsWith("facts"))) value.facts = facts;
    }
  }

  // 카피 톤 — 화면에 그대로 나가는 문장만
  const toneTargets: [string, string | undefined][] = [
    ["tagline", value.tagline],
    ["note", value.note],
    ["title", value.title],
    ...(value.facts ?? []).map((f, i) => [`facts[${i}].value`, f.value] as [string, string]),
  ];
  for (const [field, text] of toneTargets) {
    if (text && FORBIDDEN_TONE_RE.test(text)) {
      errors.push({ field, message: "'~합니다/입니다' 대신 '~해요/예요' 로 써 주세요" });
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value };
}
