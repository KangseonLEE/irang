/** OG 이미지 공통 브랜드 카드 — 밝은 배경 + 밭고랑 심볼 + 워드마크
 *
 * Satori(next/og)에서 사용하는 JSX 요소를 반환하는 헬퍼 함수.
 * React 컴포넌트가 아닌 순수 JSX Element 팩토리.
 */

import type { ReactElement } from "react";

export function brandCard(): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: "#F5F1EB",
        fontFamily: "Nanum Myeongjo",
        gap: "32px",
      }}
    >
      {/* 밭고랑 심볼 */}
      <svg width="88" height="88" viewBox="0 0 28 28" fill="none">
        <path
          d="M3 9 C7 6, 11 6, 14 9 S21 12, 25 9"
          stroke="#1B6B5A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M3 14 C7 11, 11 11, 14 14 S21 17, 25 14"
          stroke="#4A9E85"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M3 19 C7 16, 11 16, 14 19 S21 22, 25 19"
          stroke="#1B6B5A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      {/* 워드마크 */}
      <div
        style={{
          display: "flex",
          fontSize: "80px",
          fontWeight: 800,
          color: "#0D2E27",
          letterSpacing: "-2px",
        }}
      >
        이랑
      </div>
    </div>
  );
}
