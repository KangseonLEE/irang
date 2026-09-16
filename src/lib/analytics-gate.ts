/**
 * GA4 로드 게이트 (2026-09-04)
 *
 * 내부·테스트 트래픽이 GA에 집계되지 않게 gtag.js 로드 자체를 막는다.
 *   - UA에 `irang-e2e` 토큰 → e2e (fixture의 비콘 차단에 더한 2중 안전망)
 *   - `/admin` 경로 → 운영자 화면 자체 (플래그가 심기기 전 첫 로드도 제외, 9/16)
 *   - localStorage `irang-internal` = "1" → 운영자 브라우저 (/admin 방문 시 자동 설정)
 *   - 쿠키 `irang-internal=1` → `?internal=1` 토글로 표시한 기기 (9/16, DB 적재 게이트와 공유)
 *   - 프로덕션 외 환경(로컬 dev·CF 터널 dev)은 GoogleAnalytics 컴포넌트가 렌더 자체를 생략
 *
 * ⚠️ `irangGaGate`는 `Function.prototype.toString()`으로 문자열화되어 인라인 <script>에
 *    박힌 뒤 브라우저에서 실행된다. 따라서 import·모듈 상수·클로저를 참조하면 안 된다
 *    (테스트가 toString → 재평가로 자기 완결성을 검사한다).
 */

/** 운영자 브라우저 표시 플래그 키 — 함수 본문의 리터럴과 반드시 같아야 한다 */
export const INTERNAL_TRAFFIC_FLAG = "irang-internal";

export interface GateWindow {
  navigator?: { userAgent?: string };
  /** `/admin` 경로는 첫 로드부터 집계 제외 (9/16) */
  location?: { pathname?: string };
  localStorage?: { getItem(key: string): string | null };
  /** `irang-internal` 쿠키 — middleware `?internal=1` 토글로도 심긴다 (9/16) */
  document?: { cookie?: string };
  [key: string]: unknown;
}

/**
 * GA 로드 허용 여부. 차단 시 `window["ga-disable-<ID>"] = true`도 함께 세워
 * 어떤 경로로든 gtag가 로드돼도 hit이 나가지 않게 한다.
 */
export function irangGaGate(w: GateWindow, id: string): boolean {
  let reason = "";
  try {
    const ua = (w.navigator && w.navigator.userAgent) || "";
    if (ua.indexOf("irang-e2e") !== -1) {
      reason = "e2e";
    } else if (w.location && (w.location.pathname || "").indexOf("/admin") === 0) {
      // /admin 첫 방문은 AdminShell 의 플래그 설정보다 gtag config 가 먼저 나가 page_view 가
      // 집계된다. 실제로 9/16 GA4 유입 페이지 9위가 `/admin/login`(11세션·10명)이었다 —
      // 운영자 세션이 활성 사용자에 섞여 M7 지표를 부풀린다. 경로로 먼저 끊는다.
      reason = "admin";
    } else if (w.localStorage && w.localStorage.getItem("irang-internal") === "1") {
      reason = "internal";
    } else if (
      w.document &&
      typeof w.document.cookie === "string" &&
      w.document.cookie.indexOf("irang-internal=1") !== -1
    ) {
      // /admin 을 안 거치고 `?internal=1` 로만 표시한 기기 — 쿠키가 유일한 표식
      reason = "internal";
    }
  } catch {
    // 스토리지 접근 차단(프라이빗 모드 등) → 일반 방문자로 간주
  }
  if (reason) {
    w["ga-disable-" + id] = true;
    return false;
  }
  return true;
}
