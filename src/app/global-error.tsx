"use client";

/**
 * global-error.tsx
 * Root Layout 자체에서 에러 발생 시 표시되는 최상위 에러 핸들러.
 * Next.js App Router에서 RootLayout을 대체하므로 <html>, <body>를 직접 렌더링해야 합니다.
 *
 * 화면 본체는 다른 오류 경계 24종과 같은 `PageError` 를 쓴다(중복 구현 금지 · 체크리스트 A).
 * 다만 이 경계에서는 RootLayout 이 없으므로:
 *   - `globals.css` 가 로드되지 않는다 → body 폰트·배경만 인라인으로 세우고, 색·크기 토큰은
 *     `page-error.module.css` 의 `var(--token, 폴백)` 이 받는다
 *   - `DialogProvider` 가 없다 → `useDialog().alert` 은 조용히 no-op 이 되고, 전송 확인은
 *     버튼 자체가 "보냈어요" 로 바뀌는 것으로 대신한다
 *   - 홈 링크(`listHref`)는 넘기지 않는다 — RootLayout 이 깨진 상태에서 라우터에 의존하지 않기 위해
 */

import { PageError } from "@/components/error/page-error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
          background: "#fafafa",
          color: "#1f2937",
        }}
      >
        <PageError
          error={error}
          reset={reset}
          title="서비스에 문제가 생겼어요"
          tag="GlobalError"
        />
      </body>
    </html>
  );
}
