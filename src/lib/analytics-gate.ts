/**
 * GA4 로드 게이트 (2026-09-04)
 *
 * 내부·테스트 트래픽이 GA에 집계되지 않게 gtag.js 로드 자체를 막는다.
 *   - UA에 `irang-e2e` 토큰 → e2e (fixture의 비콘 차단에 더한 2중 안전망)
 *   - localStorage `irang-internal` = "1" → 운영자 브라우저 (/admin 방문 시 자동 설정)
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
  localStorage?: { getItem(key: string): string | null };
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
    } else if (w.localStorage && w.localStorage.getItem("irang-internal") === "1") {
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
