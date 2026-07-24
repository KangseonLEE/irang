import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import bundleAnalyzer from "@next/bundle-analyzer";

/* ── 번들 실측 (ANALYZE=true npm run build) ──
   대형 정적 데이터(CROPS·DIMENSION_SCORES 등)의 client chunk 유입을 수치로 확인.
   기본(ANALYZE 미설정) 빌드에는 아무 영향 없음. */
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  poweredByHeader: false,
  /* ── dev 환경 외부 도메인 허용 (Cloudflare Tunnel 등) ── */
  allowedDevOrigins: ["dev.irangfarm.com"],
  /* ── Server Actions origin 허용 (CF Access reverse proxy 뒤 dev에서 x-forwarded-host
       불일치로 host 에러 발생 — Next.js 16 CSRF 검증. prod는 직접 접속이라 영향 없음.
       allowedDevOrigins는 next dev 서버 CORS용으로 별개 — Server Actions는 이 설정이 필요) ── */
  experimental: {
    serverActions: {
      allowedOrigins: ["dev.irangfarm.com"],
    },
  },
  /* ── 영구 리다이렉트 (308) ── */
  async redirects() {
    return [
      // /stats sub 페이지 → 통합 페이지의 해당 탭으로 영구 이전
      { source: "/stats/population", destination: "/stats?tab=farming", permanent: true },
      { source: "/stats/satisfaction", destination: "/stats?tab=farming", permanent: true },
      { source: "/stats/youth", destination: "/stats?tab=youth", permanent: true },
      { source: "/stats/mountain", destination: "/stats?tab=mountain", permanent: true },
      { source: "/stats/smartfarm", destination: "/stats?tab=smartfarm", permanent: true },
    ];
  },
  /* ── 단축 URL 리라이트 ── */
  async rewrites() {
    return [
      // 매칭 결과 단축 URL: /r/:id → /assess/result/:id
      {
        source: "/r/:id/opengraph-image",
        destination: "/assess/result/:id/opengraph-image",
      },
      {
        source: "/r/:id",
        destination: "/assess/result/:id?utm_source=share&utm_medium=shorturl",
      },
      // 진단 결과 단축 URL: /a/:data → /assess/r/:data
      {
        source: "/a/:data/opengraph-image",
        destination: "/assess/r/:data/opengraph-image",
      },
      {
        source: "/a/:data",
        destination: "/assess/r/:data?utm_source=share&utm_medium=shorturl",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
    /* ── Vercel data transfer 절감 (P0) ──
       quality 기본 75 → 70: 시각 차이 거의 없이 transfer ~10% 감소.
       deviceSizes 7개 → 4개: Vercel이 각 사이즈마다 변환 이미지를
       생성·전송하므로 가짓수 줄이면 transfer + 빌드 시간 모두 감소. */
    qualities: [70],
    deviceSizes: [640, 828, 1200, 1920],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31_536_000, // 1년 — 정적 이미지 (작물 사진 등)
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://va.vercel-scripts.com https://t1.kakaocdn.net https://*.sentry-cdn.com",
              "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' https://cdn.jsdelivr.net https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://sgisapi.mods.go.kr https://apis.data.go.kr https://va.vercel-scripts.com https://kapi.kakao.com https://sharer.kakao.com https://*.ingest.sentry.io",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
      /* ── 메인 페이지 CDN cache (P1-B 결재 2026-05-11) ──
         / 는 ISR 1h지만 영구 URL 단일 → CF s-maxage=21600(6h)로 CF/Vercel 양쪽 transfer 절감.
         stale-while-revalidate=86400 → 1일 동안 stale 응답 후 백그라운드 갱신. */
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=21600, stale-while-revalidate=86400",
          },
        ],
      },
      /* ── list 페이지 CDN cache (봇 트래픽 절감) ──
         /events, /programs, /education, /crops는 searchParams 사용 → 자동 dynamic SSR.
         Vercel CDN이 query string별로 1시간 cache → 동일 query 재호출 시 function 호출 X.
         stale-while-revalidate=86400 → 1일 동안은 stale 응답 반환 후 백그라운드 갱신. */
      {
        source: "/events",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/programs",
        headers: [
          {
            // 2026-05-11 SP-015~020 stale 사고 대응: s-maxage 3600→600 단축.
            // 신규 push 후 cf 캐시 최대 4시간 stale → 10분으로 축소.
            // page.tsx의 revalidate=300과 합쳐 신규 데이터 10분 내 노출 보장.
            key: "Cache-Control",
            value: "public, s-maxage=600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/education",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/crops",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  // Sentry 빌드 설정
  // org/project는 환경변수 또는 .sentryclirc에서 읽음
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // 소스맵 업로드 (프로덕션 빌드 시)
  silent: !process.env.CI,

  // Vercel 배포 시 자동으로 릴리즈/커밋 연결
  widenClientFileUpload: true,

  // 빌드 후 소스맵 파일 삭제 (보안 — 클라이언트에 노출 방지)
  sourcemaps: {
    filesToDeleteAfterUpload: [".next/static/**/*.map"],
  },

  // 트리 셰이킹으로 번들 크기 최소화 (debug 로깅 제거)
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
  },

  // SENTRY_AUTH_TOKEN이 없으면 소스맵 업로드 건너뜀
  authToken: process.env.SENTRY_AUTH_TOKEN,
});
