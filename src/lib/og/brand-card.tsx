/** OG 이미지 공통 카드 — 밝은 배경 + 밭고랑 심볼 + 워드마크
 *
 * Satori(next/og)에서 사용하는 JSX 요소를 반환하는 헬퍼 함수.
 * React 컴포넌트가 아닌 순수 JSX Element 팩토리.
 */

import type { ReactElement } from "react";

/* ── 공통 로고 마크 (좌하단 워터마크) ── */

function logoMark(size: "sm" | "md" = "sm"): ReactElement {
  const iconSize = size === "sm" ? 24 : 36;
  const fontSize = size === "sm" ? 18 : 28;
  const gap = size === "sm" ? 8 : 12;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: `${gap}px`,
      }}
    >
      <svg width={iconSize} height={iconSize} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#1B6B5A" />
        <path
          d="M5 11 C9 8.5, 13 8.5, 16 11 S23 13.5, 27 11"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M5 16 C9 13.5, 13 13.5, 16 16 S23 18.5, 27 16"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M5 21 C9 18.5, 13 18.5, 16 21 S23 23.5, 27 21"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span
        style={{
          fontFamily: "Nanum Myeongjo",
          fontSize: `${fontSize}px`,
          fontWeight: 800,
          color: "#0D2E27",
          letterSpacing: "-1px",
        }}
      >
        이랑
      </span>
    </div>
  );
}

/* ── 기본 브랜드 카드 (범용 OG) ── */

export function brandCard(): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: "#F5F1EB",
        fontFamily: "Nanum Myeongjo",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
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

      {/* 좌하단 URL */}
      <div
        style={{
          position: "absolute",
          bottom: "28px",
          left: "36px",
          display: "flex",
          fontSize: "16px",
          fontWeight: 800,
          color: "#8B8477",
          letterSpacing: "0.5px",
        }}
      >
        irang.info
      </div>
    </div>
  );
}

/* ── 결과 페이지 전용 카드 ── */

interface ResultCardProps {
  emoji: string;
  label: string;
  tagline: string;
  regions: string[];
}

export function resultCard({
  emoji,
  label,
  tagline,
  regions,
}: ResultCardProps): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: "#F5F1EB",
        fontFamily: "Noto Sans KR",
        position: "relative",
        padding: "60px 72px",
      }}
    >
      {/* 상단: 유형 결과 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
          gap: "8px",
        }}
      >
        {/* 이모지 */}
        <div style={{ display: "flex", fontSize: "72px", lineHeight: "1" }}>
          {emoji}
        </div>

        {/* 유형 라벨 */}
        <div
          style={{
            display: "flex",
            fontSize: "52px",
            fontWeight: 700,
            color: "#0D2E27",
            letterSpacing: "-2px",
            marginTop: "4px",
          }}
        >
          {label}
        </div>

        {/* 태그라인 */}
        <div
          style={{
            display: "flex",
            fontSize: "24px",
            fontWeight: 700,
            color: "#5A6B5E",
            marginTop: "4px",
          }}
        >
          {tagline}
        </div>

        {/* 추천 지역 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "18px",
              fontWeight: 700,
              color: "#1B6B5A",
            }}
          >
            추천 지역
          </div>
          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            {regions.map((r) => (
              <div
                key={r}
                style={{
                  display: "flex",
                  padding: "6px 16px",
                  borderRadius: "8px",
                  background: "rgba(27, 107, 90, 0.12)",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#1B6B5A",
                }}
              >
                {r}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단: 로고 (좌하단) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {logoMark("md")}
        <div
          style={{
            display: "flex",
            fontSize: "16px",
            fontWeight: 700,
            color: "#8B8477",
          }}
        >
          irang.info
        </div>
      </div>
    </div>
  );
}
