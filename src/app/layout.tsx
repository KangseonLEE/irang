import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { JsonLd } from "@/components/seo/json-ld";
import type { WebSite, Organization } from "schema-dts";
import "./globals.css";
import s from "./layout.module.css";

export const metadata: Metadata = {
  title: {
    default: "이랑 — 귀농 정보 큐레이션 포탈",
    template: "%s | 이랑",
  },
  description:
    "귀농 예정자를 위한 지역 비교, 지원사업 검색, 작물 정보를 한곳에서. 어디서, 무엇을, 어떻게 시작할지 이랑이 알려드립니다.",
  keywords: ["귀농", "귀촌", "지원사업", "스마트팜", "농업", "지역비교"],
  authors: [{ name: "이랑" }],
  openGraph: {
    title: "이랑 — 귀농 정보 큐레이션 포탈",
    description:
      "귀농 예정자를 위한 지역 비교, 지원사업 검색, 작물 정보를 한곳에서.",
    type: "website",
    locale: "ko_KR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1B6B5A",
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
            alternateName: "이랑 — 귀농 정보 큐레이션 포탈",
            url: "https://irang-wheat.vercel.app",
            description:
              "귀농 예정자를 위한 지역 비교, 지원사업 검색, 작물 정보를 한곳에서.",
            potentialAction: {
              "@type": "SearchAction",
              target:
                "https://irang-wheat.vercel.app/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }}
        />
        <JsonLd<Organization>
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "이랑",
            url: "https://irang-wheat.vercel.app",
            logo: "https://irang-wheat.vercel.app/icon.svg",
            description:
              "귀농 예정자를 위한 지역 비교, 지원사업 검색, 작물 정보를 한곳에서 제공하는 큐레이션 포탈.",
            sameAs: [],
          }}
        />

        {/* Pretendard Variable — 한글 + 라틴 가변 폰트 */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* 나눔명조 ExtraBold — 로고 워드마크 전용 (이랑 2글자만 서브셋) */}
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
        <GoogleAnalytics />
        <Analytics />
        <Header />
        <main className={s.main}>{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
