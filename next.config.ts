import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  /* ── 단축 URL: /r/:id → /assess/result/:id ── */
  async rewrites() {
    return [
      // OG 이미지 서브라우트도 함께 매핑
      {
        source: "/r/:id/opengraph-image",
        destination: "/assess/result/:id/opengraph-image",
      },
      {
        source: "/r/:id",
        destination: "/assess/result/:id?utm_source=share&utm_medium=shorturl",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
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
    ];
  },
};

export default withSentryConfig(nextConfig, {
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
