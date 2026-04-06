import { ImageResponse } from "next/og";
import { PROVINCES } from "@/lib/data/regions";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "이랑 — 지역 귀농 정보";

export default async function OGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const province = PROVINCES.find((p) => p.id === id);

  // Fallback for unknown region
  if (!province) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #1B6B5A 0%, #0F4F42 100%)",
            color: "#ffffff",
            fontSize: "48px",
            fontWeight: 700,
          }}
        >
          이랑 — 지역 정보
        </div>
      ),
      { ...size }
    );
  }

  const highlights = province.highlights.slice(0, 4);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #1B6B5A 0%, #0F4F42 100%)",
          padding: "60px",
        }}
      >
        {/* Decorative accent */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            right: 0,
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle at 100% 0%, rgba(255,255,255,0.07) 0%, transparent 60%)",
          }}
        />

        {/* Top bar: brand + category */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "24px",
              fontWeight: 700,
              color: "rgba(255, 255, 255, 0.6)",
              fontFamily: "serif",
              letterSpacing: "2px",
            }}
          >
            이랑
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "18px",
              color: "rgba(255, 255, 255, 0.5)",
              padding: "8px 20px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "20px",
            }}
          >
            지역 정보
          </div>
        </div>

        {/* Region name (large) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "80px",
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: "-1px",
            }}
          >
            {province.name}
          </div>

          {/* Description */}
          <div
            style={{
              display: "flex",
              fontSize: "26px",
              fontWeight: 400,
              color: "rgba(255, 255, 255, 0.75)",
              lineHeight: 1.5,
              maxWidth: "800px",
            }}
          >
            {province.description}
          </div>
        </div>

        {/* Highlight tags */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {highlights.map((tag, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                padding: "10px 24px",
                background: "rgba(255, 255, 255, 0.12)",
                borderRadius: "24px",
                fontSize: "20px",
                fontWeight: 500,
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* URL */}
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
