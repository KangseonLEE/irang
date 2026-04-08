"use client";

/**
 * global-error.tsx
 * Root Layout 자체에서 에러 발생 시 표시되는 최상위 에러 핸들러.
 * Next.js App Router에서 RootLayout을 대체하므로 <html>, <body>를 직접 렌더링해야 합니다.
 */

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          fontFamily:
            '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#fafafa",
          color: "#1f2937",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.6 }}
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
          <h2
            style={{
              marginTop: "1rem",
              fontSize: "1.25rem",
              fontWeight: 700,
              letterSpacing: "-0.025em",
            }}
          >
            서비스에 문제가 발생했습니다
          </h2>
          <p
            style={{
              marginTop: "0.5rem",
              fontSize: "0.875rem",
              color: "#71717a",
            }}
          >
            일시적인 오류일 수 있습니다. 아래 버튼을 눌러 다시 시도해 주세요.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "10px",
              background: "#1B6B5A",
              color: "#fff",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
