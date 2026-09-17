import { createHash } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * 관리자 로그인 시도 제한 — 인스턴스와 무관한 영속 카운터 (2026-09-17).
 *
 * 인메모리 방식은 서버리스에서 실효가 없다. 라이브 실측에서 연속 8회 시도가 전부
 * 401 을 받았고 429 는 한 번도 나오지 않았다 — 요청마다 다른 인스턴스에 닿아
 * 카운터가 각각 1 에서 시작했기 때문이다. 공유 비밀번호 하나짜리 인증이라
 * 이 구멍은 사실상 무제한 대입을 허용한다.
 *
 * 원 IP 는 저장하지 않고 sha256(ip+salt) 앞 32자만 남긴다(커뮤니티 ip-hash 와 동일 원칙).
 *
 * **테이블이 아직 없거나 Supabase 가 없으면 통과시킨다(fail-open).** 마이그레이션 적용
 * 전에 로그인 자체가 막히면 운영자가 관리자 화면에 들어갈 수 없다 — 그 사이는
 * 라우트의 인메모리 리미터가 부분적으로 받친다.
 */

const WINDOW_MS = 10 * 60_000;
const MAX_ATTEMPTS = 5;
/** 기록 보존 기간 — 조회할 때 이보다 오래된 행을 함께 지운다(별도 cron 불필요) */
const RETENTION_MS = 24 * 60 * 60_000;

function hashIp(ip: string): string {
  const salt =
    process.env.COMMUNITY_HASH_SALT ?? process.env.ADMIN_SECRET ?? "irang-admin-login";
  return createHash("sha256").update(`${ip}|${salt}`).digest("hex").slice(0, 32);
}

export interface ThrottleResult {
  limited: boolean;
  /** 판정 근거 — 로그·테스트용 */
  reason: "ok" | "too-many" | "no-store";
}

/**
 * 시도를 기록하고 창 안의 누적 횟수로 판정한다.
 * 기록을 **먼저** 남기므로 성공/실패와 무관하게 동일하게 집계된다 —
 * 성공 시 리셋하는 경로를 두지 않아 우회 표면이 늘지 않는다.
 */
export async function recordAndCheckLoginAttempt(ip: string): Promise<ThrottleResult> {
  const sb = getSupabaseAdmin();
  if (!sb) return { limited: false, reason: "no-store" };

  const ipHash = hashIp(ip);
  const now = Date.now();

  const { error: insertError } = await sb
    .from("admin_login_attempts")
    .insert({ ip_hash: ipHash });
  // 테이블 미적용(마이그레이션 전) 등은 통과 — 인메모리 리미터가 받친다
  if (insertError) return { limited: false, reason: "no-store" };

  const { count, error } = await sb
    .from("admin_login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("attempted_at", new Date(now - WINDOW_MS).toISOString());
  if (error) return { limited: false, reason: "no-store" };

  // 보존 기간 지난 기록 정리 (best-effort)
  void sb
    .from("admin_login_attempts")
    .delete()
    .lt("attempted_at", new Date(now - RETENTION_MS).toISOString());

  return (count ?? 0) > MAX_ATTEMPTS
    ? { limited: true, reason: "too-many" }
    : { limited: false, reason: "ok" };
}

export const LOGIN_THROTTLE = { WINDOW_MS, MAX_ATTEMPTS } as const;
