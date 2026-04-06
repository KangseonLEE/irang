import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "이랑 — 귀농 적합성 진단";

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
        {/* Decorative elements */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: "-80px",
            left: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "-120px",
            right: "-120px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        />

        {/* Brand */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: "40px",
            left: "56px",
            fontSize: "22px",
            fontWeight: 700,
            color: "rgba(255, 255, 255, 0.5)",
            fontFamily: "serif",
            letterSpacing: "2px",
          }}
        >
          이랑
        </div>

        {/* Icon area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "80px",
            height: "80px",
            borderRadius: "20px",
            background: "rgba(255, 255, 255, 0.12)",
            fontSize: "40px",
            marginBottom: "32px",
          }}
        >
          📋
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: "64px",
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1.2,
            letterSpacing: "-1px",
          }}
        >
          귀농 적합성 진단
        </div>

        {/* Meta badges */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "16px",
            marginTop: "28px",
          }}
        >
          {["10문항", "3분 소요", "무료"].map((label, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                padding: "10px 28px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "24px",
                fontSize: "20px",
                fontWeight: 500,
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* CTA question */}
        <div
          style={{
            display: "flex",
            marginTop: "48px",
            fontSize: "26px",
            fontWeight: 400,
            color: "rgba(255, 255, 255, 0.6)",
            letterSpacing: "1px",
          }}
        >
          나는 귀농에 얼마나 준비되어 있을까?
        </div>

        {/* Bottom URL */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "32px",
            right: "48px",
            fontSize: "16px",
            color: "rgba(255, 255, 255, 0.35)",
          }}
        >
          irang-wheat.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
