import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { HashHighlight } from "@/components/layout/hash-highlight";
import { SearchOverlayProvider } from "@/components/search/search-overlay";
import { ScrollToTopButton } from "@/components/layout/scroll-to-top-button";
import { FeedbackWidget } from "@/components/feedback/feedback-widget";
import { InAppBanner } from "@/components/layout/inapp-banner";
import { JsonLd } from "@/components/seo/json-ld";
import { validateEnv } from "@/lib/env";
import type { WebSite, Organization } from "schema-dts";
import "./globals.css";
import s from "./layout.module.css";

// 서버 시작 시 환경변수 검증 (모듈 로드 시 1회 실행)
validateEnv();

// dev.irangfarm.com (Cloudflare Tunnel) · Vercel preview · 로컬 등 prod 외 환경
// — robots.ts disallow와 이중 안전망. 페이지마다 <meta name="robots" content="noindex">.
// 2026-05-18 GSC 발견 fix.
const IS_PUBLIC_PRODUCTION = process.env.VERCEL_ENV === "production";

export const metadata: Metadata = {
  metadataBase: new URL("https://irangfarm.com"),
  alternates: {
    canonical: "/",
  },
  ...(IS_PUBLIC_PRODUCTION ? {} : { robots: { index: false, follow: false } }),
  verification: {
    google: "KNFsOJ9PTv7qJXP15MITpq6YGN8cWV7Nk9ThKWBPGD0",
    other: {
      "naver-site-verification": "8de492524a4ad7ea7a5dd3911ab7e28d9149283a",
    },
  },
  title: {
    default: "이랑 — 농촌 정착 정보 큐레이션 포탈",
    template: "%s | 이랑",
  },
  description:
    "농촌 정착(귀농·귀촌)을 준비하는 사람을 위한 정보 큐레이션 서비스예요. 지역 비교, 작물 정보, 정착 비용, 지원사업까지 공공데이터로 한곳에서 확인하세요.",
  keywords: [
    "귀농",
    "귀촌",
    "귀산촌",
    "청년농",
    "스마트팜",
    "치유농업",
    "사회적 농업",
    "농촌체류형 쉼터",
    "정착 비용",
    "농촌 정착 지원금",
    "농촌 정착 절차",
    "정착 준비",
    "농촌 정착 지역 추천",
    "정착 작물",
    "30대 귀농",
    "40대 귀농",
    "50대 귀농",
    "정착 교육",
    "농촌 정착 체험",
    "정착 성공 사례",
    "농업",
    "지역비교",
  ],
  authors: [{ name: "이랑" }],
  openGraph: {
    title: "이랑 — 농촌 정착 정보 큐레이션 포탈",
    description:
      "농촌 정착(귀농·귀촌)을 준비하는 사람을 위한 정보 큐레이션 서비스예요. 지역 비교, 작물 정보, 정착 비용, 지원사업까지 공공데이터로 한곳에서 확인하세요.",
    type: "website",
    locale: "ko_KR",
    siteName: "이랑",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "이랑 — 농촌 정착 정보 큐레이션 포탈",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "이랑 — 농촌 정착 정보 큐레이션 포탈",
    description:
      "농촌 정착(귀농·귀촌)을 준비하는 사람을 위한 정보 큐레이션 서비스예요. 지역 비교, 작물 정보, 정착 비용, 지원사업까지 공공데이터로 한곳에서 확인하세요.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1B6B5A",
  interactiveWidget: "resizes-visual",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={s.html}>
      {/* Pretendard 폰트: metadata API에서 외부 스타일시트 link를 지원하지 않아 수동 삽입 */}
      <head>
        {/* ── 구조화 데이터 (JSON-LD) ── */}
        <JsonLd<WebSite>
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "이랑",
            alternateName: "이랑 — 농촌 정착 정보 큐레이션 포탈",
            url: "https://irangfarm.com",
            description:
              "농촌 정착 예정자를 위한 지역 비교, 지원사업 검색, 작물 정보를 한곳에서.",
            potentialAction: {
              "@type": "SearchAction",
              target:
                "https://irangfarm.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }}
        />
        <JsonLd<Organization>
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "이랑",
            url: "https://irangfarm.com",
            logo: "https://irangfarm.com/icon.svg",
            description:
              "농촌 정착 예정자를 위한 지역 비교, 지원사업 검색, 작물 정보를 한곳에서 제공하는 큐레이션 포탈.",
            sameAs: [],
          }}
        />

        {/* 폰트 CDN preconnect — 연결 시간 단축 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Pretendard Variable — 한글 + 라틴 가변 폰트 */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* 나눔명조 ExtraBold — 로고 워드마크 전용 (이랑 2글자만 서브셋) */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@800&display=swap&text=%EC%9D%B4%EB%9E%91"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --font-sans: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
                --font-logo: "Nanum Myeongjo", "Noto Serif KR", Georgia, serif;
              }
            `,
          }}
        />
      </head>
      <body className={s.body}>
        <ScrollToTop />
        <HashHighlight />
        <GoogleAnalytics />
        <Analytics />
        <SpeedInsights />
        <SearchOverlayProvider>
          <Header />
          <main className={s.main}>{children}</main>
          <Footer />
          <MobileNav />
          <ScrollToTopButton />
          <FeedbackWidget />
          <InAppBanner />
        </SearchOverlayProvider>
      </body>
    </html>
  );
}
