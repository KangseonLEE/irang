import Script from "next/script";
import { irangGaGate } from "@/lib/analytics-gate";

const GA_ID_RAW = process.env.NEXT_PUBLIC_GA_ID ?? "";
/** GA Measurement ID 형식 검증 (G-XXXXXXXXXX) — XSS 방지 */
const GA_ID = /^G-[A-Z0-9]+$/.test(GA_ID_RAW) ? GA_ID_RAW : "";

/**
 * GA4 로더 (2026-09-04 게이트 추가)
 * - 프로덕션 빌드에서만 렌더 — 로컬 dev·CF 터널 dev 접속은 집계 안 됨
 * - 브라우저에서 `irangGaGate`가 e2e UA·운영자 플래그를 보고 gtag.js 로드 여부를 결정
 *   (게이트 함수는 toString으로 인라인 — src/lib/analytics-gate.ts 주의사항 참조)
 */
export function GoogleAnalytics() {
  if (!GA_ID) return null;
  if (process.env.NODE_ENV !== "production") return null;

  const gate = irangGaGate.toString();

  return (
    <Script id="ga-init" strategy="afterInteractive">
      {`(function(){
  var allowed = (${gate})(window, '${GA_ID}');
  if (!allowed) return;
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', '${GA_ID}');
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_ID}';
  document.head.appendChild(s);
})();`}
    </Script>
  );
}
