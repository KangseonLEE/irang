import Script from "next/script";

const GA_ID_RAW = process.env.NEXT_PUBLIC_GA_ID ?? "";
/** GA Measurement ID 형식 검증 (G-XXXXXXXXXX) — XSS 방지 */
const GA_ID = /^G-[A-Z0-9]+$/.test(GA_ID_RAW) ? GA_ID_RAW : "";

export function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
