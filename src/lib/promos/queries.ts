/**
 * 홍보 팝업 — Supabase 접근 (service_role 경유, 서버 전용)
 *
 * 읽기 원칙: DB 가 SSOT, 정적 배열(`src/lib/data/promo-popup.ts`)은 **폴백**.
 *   테이블 미적용(마이그레이션 전)·Supabase 미설정·조회 오류 어느 쪽이든
 *   랜딩이 빈 화면이 되지 않게 정적으로 떨어지되, **조용히 넘어가지 않는다** —
 *   5/26 quick_feedback silent 202(33일 잠복) 교훈대로 폴백 사유를 서버 로그 한 줄로 남긴다.
 */

import { getSupabaseAdmin } from "@/lib/supabase";
import { getActivePromos, type PromoPopupItem } from "@/lib/data/promo-popup";
import {
  PROMO_COLUMNS,
  recordToRow,
  rowToRecord,
  toPopupItem,
  type PromoInput,
  type PromoRecord,
  type PromoRow,
} from "./types";

export type PromoFallbackReason = "no-supabase" | "migration-pending" | "db-error";

export type PromoResult<T> = { ok: true; data: T } | { ok: false; reason: PromoFallbackReason; message?: string };

const TABLE = "promo_popups";
const BUCKET = "promo";

/** 업로드 포스터 최대 폭 — 팝업은 모바일 폭이 상한이라 900 이상은 낭비 */
const MAX_IMAGE_WIDTH = 900;

function isMissingTable(message: string | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return m.includes("does not exist") || m.includes("could not find the table") || m.includes("schema cache");
}

function failure(error: { message?: string } | null): PromoResult<never> {
  const message = error?.message;
  return { ok: false, reason: isMissingTable(message) ? "migration-pending" : "db-error", message };
}

/** KST 기준 YYYY-MM-DD (Vercel 은 UTC — 자정~오전 9시 전환 지연 함정 회피) */
export function kstDate(now: Date = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

/** 레코드가 오늘(KST) 노출 대상인지 — starts_at null = 즉시, until 당일 포함 */
export function isRecordVisible(record: PromoRecord, now: Date = new Date()): boolean {
  if (!record.active) return false;
  const today = kstDate(now);
  if (record.startsAt && today < record.startsAt) return false;
  return today <= record.until;
}

/**
 * 랜딩이 쓰는 활성 팝업 목록.
 * DB 조회 실패·미적용이면 정적 폴백(+ 로그 1줄). 절대 throw 하지 않는다.
 */
export async function loadActivePromos(now: Date = new Date()): Promise<PromoPopupItem[]> {
  const result = await fetchActivePromos(now);
  if (result.ok) return result.data;
  console.warn(`[promo] fallback: ${result.reason}${result.message ? ` — ${result.message}` : ""}`);
  return getActivePromos(now);
}

/** loadActivePromos 의 원형 — 폴백 여부를 호출자가 알아야 할 때(진단·테스트) */
export async function fetchActivePromos(now: Date = new Date()): Promise<PromoResult<PromoPopupItem[]>> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, reason: "no-supabase" };

  const today = kstDate(now);
  const { data, error } = await sb
    .from(TABLE)
    .select(PROMO_COLUMNS)
    .eq("active", true)
    .gte("until", today)
    .or(`starts_at.is.null,starts_at.lte.${today}`)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) return failure(error);
  const rows = (data ?? []) as PromoRow[];
  return { ok: true, data: rows.map(rowToRecord).map(toPopupItem) };
}

/** 관리자 목록 — 기간이 지난 건·비활성 건도 전부 (수정·재사용 대상) */
export async function listPromos(): Promise<PromoResult<PromoRecord[]>> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, reason: "no-supabase" };

  const { data, error } = await sb
    .from(TABLE)
    .select(PROMO_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("until", { ascending: false });

  if (error) return failure(error);
  return { ok: true, data: ((data ?? []) as PromoRow[]).map(rowToRecord) };
}

export async function getPromo(id: string): Promise<PromoResult<PromoRecord | null>> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, reason: "no-supabase" };

  const { data, error } = await sb.from(TABLE).select(PROMO_COLUMNS).eq("id", id).maybeSingle();
  if (error) return failure(error);
  return { ok: true, data: data ? rowToRecord(data as PromoRow) : null };
}

/** 작성·수정 공용 — id 충돌 시 갱신(관리자 화면은 id 를 바꾸지 않는다) */
export async function upsertPromo(input: PromoInput): Promise<PromoResult<PromoRecord>> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, reason: "no-supabase" };

  const { data, error } = await sb
    .from(TABLE)
    .upsert(recordToRow(input), { onConflict: "id" })
    .select(PROMO_COLUMNS)
    .single();

  if (error) return failure(error);
  return { ok: true, data: rowToRecord(data as PromoRow) };
}

export async function deletePromo(id: string): Promise<PromoResult<true>> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, reason: "no-supabase" };

  const { error } = await sb.from(TABLE).delete().eq("id", id);
  if (error) return failure(error);
  return { ok: true, data: true };
}

// ── 포스터 업로드 ──────────────────────────────────────────────

export interface UploadedImage {
  url: string;
  width: number;
  height: number;
}

/**
 * 포스터를 webp(폭 900 상한)로 변환해 Storage 버킷 `promo` 에 올린다.
 *
 * sharp 는 Next 가 딸려 오는 모듈이라 런타임에 동적으로 가져온다.
 * 없으면 원본 바이트를 그대로 올리고 헤더에서 크기만 읽는다(변환만 건너뛰고 기능은 산다).
 */
export async function uploadPromoImage(file: File, idHint = "promo"): Promise<PromoResult<UploadedImage>> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, reason: "no-supabase" };

  const original = Buffer.from(await file.arrayBuffer());
  const converted = await toWebp(original);

  const slug = idHint.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "promo";
  const path = `${slug}-${Date.now()}.${converted.ext}`;

  const { error } = await sb.storage.from(BUCKET).upload(path, converted.buffer, {
    contentType: converted.contentType,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    const message = error.message;
    // 버킷 미생성(마이그레이션 미적용)도 migration-pending 으로 본다 — 조치가 같다
    return {
      ok: false,
      reason: /bucket not found/i.test(message ?? "") ? "migration-pending" : "db-error",
      message,
    };
  }

  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, data: { url: data.publicUrl, width: converted.width, height: converted.height } };
}

interface ConvertedImage {
  buffer: Buffer;
  ext: string;
  contentType: string;
  width: number;
  height: number;
}

async function toWebp(input: Buffer): Promise<ConvertedImage> {
  try {
    const sharpModule = (await import("sharp")) as unknown as { default: SharpFactory } | SharpFactory;
    const sharp: SharpFactory = "default" in sharpModule ? sharpModule.default : sharpModule;

    const meta = await sharp(input).metadata();
    const pipeline =
      meta.width && meta.width > MAX_IMAGE_WIDTH
        ? sharp(input).resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
        : sharp(input);
    const { data, info } = await pipeline.webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
    return {
      buffer: Buffer.from(data),
      ext: "webp",
      contentType: "image/webp",
      width: info.width,
      height: info.height,
    };
  } catch (err) {
    // 변환 실패해도 업로드 자체는 살린다 — 원본 + 헤더에서 읽은 크기
    console.warn(`[promo] sharp 변환 생략 — ${(err as Error).message}`);
    const size = readImageSize(input);
    const sniffed = sniffType(input);
    return {
      buffer: input,
      ext: sniffed.ext,
      contentType: sniffed.contentType,
      width: size?.width ?? 0,
      height: size?.height ?? 0,
    };
  }
}

interface SharpFactory {
  (input: Buffer): {
    metadata(): Promise<{ width?: number; height?: number }>;
    resize(opts: { width: number; withoutEnlargement: boolean }): {
      webp(opts: { quality: number }): {
        toBuffer(opts: { resolveWithObject: true }): Promise<{
          data: Uint8Array;
          info: { width: number; height: number };
        }>;
      };
    };
    webp(opts: { quality: number }): {
      toBuffer(opts: { resolveWithObject: true }): Promise<{
        data: Uint8Array;
        info: { width: number; height: number };
      }>;
    };
  };
}

function sniffType(buf: Buffer): { ext: string; contentType: string } {
  if (buf.length >= 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    return { ext: "webp", contentType: "image/webp" };
  }
  if (buf.length >= 8 && buf[0] === 0x89 && buf.toString("ascii", 1, 4) === "PNG") {
    return { ext: "png", contentType: "image/png" };
  }
  return { ext: "jpg", contentType: "image/jpeg" };
}

/** webp(VP8/VP8L/VP8X)·png·jpeg 헤더에서 폭·높이만 읽는다 (sharp 없을 때의 최소 경로) */
export function readImageSize(buf: Buffer): { width: number; height: number } | null {
  // PNG: IHDR
  if (buf.length >= 24 && buf[0] === 0x89 && buf.toString("ascii", 1, 4) === "PNG") {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // WEBP
  if (buf.length >= 30 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const fourcc = buf.toString("ascii", 12, 16);
    if (fourcc === "VP8X") return { width: readUInt24LE(buf, 24) + 1, height: readUInt24LE(buf, 27) + 1 };
    if (fourcc === "VP8 ") return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    if (fourcc === "VP8L") {
      const bits = buf.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
  }
  // JPEG: SOFn 마커 탐색
  if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buf.length) {
      if (buf[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buf[offset + 1];
      const length = buf.readUInt16BE(offset + 2);
      const isSof = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
      if (isSof) return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
      offset += 2 + length;
    }
  }
  return null;
}

function readUInt24LE(buf: Buffer, at: number): number {
  return buf[at] | (buf[at + 1] << 8) | (buf[at + 2] << 16);
}
