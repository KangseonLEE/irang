import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
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
  themeColor: "#1B6B5A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={s.html}>
      {/*
        <head> 수동 사용 사유:
        - Pretendard 폰트 로드: metadata API에서 외부 스타일시트 link를 지원하지 않음
        - FOUC 방지 스크립트: paint-blocking이어야 하므로 <Script strategy="beforeInteractive"> 대신
          인라인 <script>가 필요. Next.js의 beforeInteractive는 body 끝에 삽입되어 FOUC 발생 가능
      */}
      <head>
        {/* Pretendard Variable — 한글 + 라틴 가변 폰트 */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --font-sans: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
              }
            `,
          }}
        />
        {/* FOUC 방지: paint 전에 다크모드 클래스 적용 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={s.body}>
        <GoogleAnalytics />
        <ThemeProvider>
          <Header />
          <main className={s.main}>{children}</main>
          <Footer />
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
