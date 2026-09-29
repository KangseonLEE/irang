/**
 * 홍보 팝업 운영 규칙 — 상태 판정·폼 검증 (2026-09-29 회장: 노출 기간·내용을 admin 에서 제어).
 *
 * 화면과 분리한 순수 함수만 둔다. 날짜는 전부 KST 기준 `YYYY-MM-DD` 문자열 비교 —
 * `toISOString()` 을 그대로 쓰면 UTC 라 한국 밤 9시 이후가 다음 날로 넘어간다(5월 박제).
 */

import type { PromoRecord } from "@/lib/promos/types";

export type PromoStatus = "live" | "scheduled" | "ended" | "inactive";

export const PROMO_STATUS_LABELS: Record<PromoStatus, string> = {
  live: "노출 중",
  scheduled: "노출 예정",
  ended: "종료",
  inactive: "비활성",
};

/** 오늘(KST) — YYYY-MM-DD */
export function kstDate(now: Date = new Date()): string {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** 오늘로부터 n 일 뒤(KST) — 폼 기본값용 */
export function kstDatePlus(days: number, now: Date = new Date()): string {
  return kstDate(new Date(now.getTime() + days * 24 * 60 * 60 * 1000));
}

/**
 * 한 건의 노출 상태. 비활성이 기간보다 우선한다 — 끄면 기간과 무관하게 안 보인다.
 * 시작일이 비어 있으면 "이미 시작한" 것으로 본다.
 */
export function promoStatus(
  record: Pick<PromoRecord, "active" | "startsAt" | "until">,
  today: string = kstDate(),
): PromoStatus {
  if (!record.active) return "inactive";
  if (record.startsAt && today < record.startsAt) return "scheduled";
  if (record.until && today > record.until) return "ended";
  return "live";
}

/** 노출 기간 표기 — "2026-10-01 ~ 2026-11-15" / 시작이 비면 "~ 종료일" */
export function promoPeriodLabel(record: Pick<PromoRecord, "startsAt" | "until">): string {
  return `${record.startsAt ?? "즉시"} ~ ${record.until || "미정"}`;
}

export interface PromoFormValues {
  id: string;
  org: string;
  title: string;
  tagline: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  alt: string;
  facts: { label: string; value: string; href?: string }[];
  recruitClosed: boolean;
  note: string;
  href: string;
  startsAt: string;
  until: string;
  active: boolean;
  sortOrder: number;
}

/** 필드 → 안내 문구. 비어 있으면 저장 가능 */
export type PromoFormErrors = Partial<Record<keyof PromoFormValues, string>>;

const SLUG = /^[a-z0-9][a-z0-9-]{1,48}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 저장 전 검증. 화면에서 못 고치는 값(이미지 크기 등)까지 막지 않고,
 * 없으면 팝업이 깨지는 것만 필수로 본다.
 */
export function validatePromo(values: PromoFormValues, isNew: boolean): PromoFormErrors {
  const e: PromoFormErrors = {};

  if (isNew && !SLUG.test(values.id.trim())) {
    e.id = "영문 소문자·숫자·하이픈으로 2자 이상 적어 주세요";
  }
  if (!values.org.trim()) e.org = "기관 이름을 적어 주세요";
  if (!values.title.trim()) e.title = "프로그램 이름을 적어 주세요";
  if (!values.image.trim()) e.image = "포스터를 올리거나 경로를 적어 주세요";
  if (!values.alt.trim()) e.alt = "포스터 설명을 적어 주세요 (화면 낭독기에 쓰여요)";
  if (values.href.trim() && !/^https:\/\//.test(values.href.trim())) {
    e.href = "https:// 로 시작하는 주소만 쓸 수 있어요";
  }
  if (!DATE.test(values.until)) {
    e.until = "노출 종료 날짜를 골라 주세요";
  }
  if (values.startsAt && !DATE.test(values.startsAt)) {
    e.startsAt = "날짜 형식이 올바르지 않아요";
  }
  if (DATE.test(values.startsAt) && DATE.test(values.until) && values.startsAt > values.until) {
    e.until = "종료 날짜가 시작 날짜보다 빨라요";
  }
  if (values.recruitClosed && !values.note.trim()) {
    e.note = "마감으로 두면 안내 문구가 필요해요";
  }
  if (values.facts.some((f) => (f.label.trim() && !f.value.trim()) || (!f.label.trim() && f.value.trim()))) {
    e.facts = "정보 행은 라벨과 내용을 함께 적어 주세요";
  }

  return e;
}

/** 저장 시 서버로 보낼 형태 — 빈 정보 행 제거, 공백 정리 */
export function toPromoPayload(values: PromoFormValues): Omit<PromoRecord, "updatedAt"> {
  return {
    id: values.id.trim(),
    org: values.org.trim(),
    title: values.title.trim(),
    tagline: values.tagline.trim(),
    image: values.image.trim(),
    imageWidth: values.imageWidth || 600,
    imageHeight: values.imageHeight || 851,
    alt: values.alt.trim(),
    facts: values.facts
      .filter((f) => f.label.trim() && f.value.trim())
      .map((f) => ({
        label: f.label.trim(),
        value: f.value.trim(),
        ...(f.href?.trim() ? { href: f.href.trim() } : {}),
      })),
    recruitClosed: values.recruitClosed,
    note: values.note,
    href: values.href.trim(),
    startsAt: values.startsAt || null,
    until: values.until,
    active: values.active,
    sortOrder: values.sortOrder,
  };
}

// ── API 응답 해석 ────────────────────────────────────────────

/** 서버가 준 필드명(`facts[0].href` 등)을 폼 필드로 좁힌다 */
function toFormField(field: string): keyof PromoFormValues | null {
  if (field.startsWith("facts")) return "facts";
  const known: (keyof PromoFormValues)[] = [
    "id", "org", "title", "tagline", "image", "imageWidth", "imageHeight",
    "alt", "facts", "recruitClosed", "note", "href", "startsAt", "until", "active", "sortOrder",
  ];
  return known.includes(field as keyof PromoFormValues) ? (field as keyof PromoFormValues) : null;
}

export interface PromoApiFailure {
  /** 화면 상단에 그대로 보여 줄 한 문장 */
  message: string;
  /** 마이그레이션·설정 문제 — 운영자가 손댈 곳이 코드가 아니라 DB */
  setup: boolean;
  /** 필드별 안내 (검증 실패) */
  fieldErrors: PromoFormErrors;
}

/**
 * 오류 응답 해석 한 곳. 검증 실패(400 validation·409 duplicate)는 필드에 붙이고,
 * 마이그레이션 미적용(503)은 "설정" 문제로 구분한다 — 운영자가 무엇을 해야 하는지가 달라진다.
 */
export function parsePromoApiError(status: number, body: unknown): PromoApiFailure {
  const b = (body ?? {}) as { error?: string; message?: string; detail?: string; errors?: { field: string; message: string }[] };
  const fieldErrors: PromoFormErrors = {};
  for (const e of b.errors ?? []) {
    const key = toFormField(e.field);
    if (key && !fieldErrors[key]) fieldErrors[key] = e.message;
  }

  const setup = status === 503 || b.error === "migration-pending" || b.error === "no-supabase";
  let message = b.message ?? b.error ?? `저장소가 응답하지 않아요 (HTTP ${status})`;
  if (b.errors?.length && !b.message) message = "입력을 다시 확인해 주세요";
  if (setup) {
    message = `${b.message ?? "저장소 설정이 아직 안 끝났어요."} 마이그레이션을 적용하면 바로 쓸 수 있어요.`;
  }
  return { message, setup, fieldErrors };
}
