import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";

/**
 * 원 IP는 저장하지 않고 sha256(ip + salt) 만 남긴다 — 공감·신고 멱등 키 겸 rate limit 키.
 * salt 는 COMMUNITY_HASH_SALT(권장) → ADMIN_SECRET → 고정 문자열 순 폴백.
 */
export function hashIp(ip: string): string {
  const salt =
    process.env.COMMUNITY_HASH_SALT ?? process.env.ADMIN_SECRET ?? "irang-community";
  return createHash("sha256").update(`${ip}|${salt}`).digest("hex").slice(0, 32);
}

export function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/** e2e 적재 분리 — /api/assess 와 동일 식별자 (8/31 진단 DB 오염 교훈) */
export function isE2eRequest(req: NextRequest): boolean {
  const ua = req.headers.get("user-agent") ?? "";
  return ua.includes("irang-e2e") || req.headers.get("x-irang-e2e") !== null;
}
