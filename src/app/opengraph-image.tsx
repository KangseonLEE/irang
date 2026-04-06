import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "이랑 — 귀농 정보 큐레이션 포탈";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #1B6B5A 0%, #0F4F42 100%)",
          padding: "60px",
        }}
      >
        {/* Decorative top-left pattern */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            width: "300px",
            height: "300px",
            background:
              "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Decorative bottom-right pattern */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(circle at 100% 100%, rgba(255,255,255,0.06) 0%, transparent 70%)",
          }}
        />

        {/* Logo text */}
        <div
          style={{
            display: "flex",
            fontSize: "120px",
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "-2px",
            lineHeight: 1,
            fontFamily: "serif",
          }}
        >
          이랑
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            fontSize: "32px",
            fontWeight: 400,
            color: "rgba(255, 255, 255, 0.85)",
            marginTop: "24px",
            letterSpacing: "4px",
          }}
        >
          귀농 정보 큐레이션 포탈
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            width: "80px",
            height: "3px",
            background: "rgba(255, 255, 255, 0.4)",
            marginTop: "40px",
            borderRadius: "2px",
          }}
        />

        {/* Feature tags */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "16px",
            marginTop: "40px",
          }}
        >
          {["지역 비교", "작물 정보", "지원사업", "적합성 진단"].map(
            (tag, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                {i > 0 && (
                  <div
                    style={{
                      display: "flex",
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.5)",
                    }}
                  />
                )}
                <div
                  style={{
                    display: "flex",
                    fontSize: "22px",
                    fontWeight: 500,
                    color: "rgba(255, 255, 255, 0.7)",
                  }}
                >
                  {tag}
                </div>
              </div>
            )
          )}
        </div>

        {/* URL */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "32px",
            right: "48px",
            fontSize: "18px",
            color: "rgba(255, 255, 255, 0.4)",
          }}
        >
          irang-wheat.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
