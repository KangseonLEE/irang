/**
 * Sentry Internal Integration 웹훅 서명 검증 (2026-09-30)
 *
 * 배경: Sentry 알림 규칙의 "GitHub 이슈 생성" 액션이 요금제 변경으로
 * "The GitHub action is no longer available" 상태가 되어
 * Sentry → GitHub Issue → auto-assign → iPhone 푸시 체인이 끊겼다.
 * 무료 플랜에서도 쓸 수 있는 Internal Integration 웹훅으로 그 체인을 대체한다.
 *
 * Sentry 는 요청 본문 원문을 Internal Integration 의 Client Secret 으로
 * HMAC-SHA256 한 hex 다이제스트를 `sentry-hook-signature` 헤더에 담아 보낸다.
 * 따라서 **JSON 파싱 전의 원문 문자열**로만 검증할 수 있다 — route 에서
 * `await request.text()` 로 받은 값을 그대로 넘긴다.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

/** HMAC-SHA256 hex 다이제스트가 담긴 헤더 */
export const SENTRY_SIGNATURE_HEADER = "sentry-hook-signature";
/** `event_alert` · `issue` · `installation` 등 리소스 종류 */
export const SENTRY_RESOURCE_HEADER = "sentry-hook-resource";

/**
 * 서명이 일치하는지 판정한다. 길이 비교·비교 연산 모두 timing-safe.
 *
 * 비밀값이 없거나 서명 형식이 어긋나면 false — 호출처가 상태코드를 가른다
 * (미설정은 503, 불일치는 401. silent 성공 응답은 금지 — 5/26 quick_feedback
 * silent 202 가 33일 잠복한 교훈).
 */
export function verifySentrySignature(
  rawBody: string,
  signature: string | null,
  secret: string | undefined | null
): boolean {
  if (!secret || !signature) return false;
  if (!/^[0-9a-f]+$/i.test(signature)) return false;

  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature.toLowerCase(), "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
