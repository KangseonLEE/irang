import { ImageResponse } from "next/og";
import { CROPS } from "@/lib/data/crops";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "이랑 — 작물 정보";

const DIFFICULTY_COLORS: Record<string, string> = {
  쉬움: "#4ADE80",
  보통: "#FACC15",
  어려움: "#F87171",
};

const CATEGORY_LABELS: Record<string, string> = {
  식량: "식량작물",
  채소: "채소류",
  과수: "과수류",
  특용: "특용작물",
};

export default async function OGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const crop = CROPS.find((c) => c.id === id);

  // Fallback for unknown crop
  if (!crop) {
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
          이랑 — 작물 정보
        </div>
      ),
      { ...size }
    );
  }

  const difficultyColor = DIFFICULTY_COLORS[crop.difficulty] ?? "#FACC15";
  const categoryLabel = CATEGORY_LABELS[crop.category] ?? crop.category;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #1B6B5A 0%, #0F4F42 100%)",
        }}
      >
        {/* Left side: Emoji showcase */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "400px",
            flexShrink: 0,
            background: "rgba(0, 0, 0, 0.15)",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "160px",
              lineHeight: 1,
            }}
          >
            {crop.emoji}
          </div>
        </div>

        {/* Right side: Info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            padding: "60px 56px",
            justifyContent: "space-between",
          }}
        >
          {/* Top: brand + category */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "22px",
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
                fontSize: "17px",
                color: "rgba(255, 255, 255, 0.5)",
                padding: "6px 18px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "20px",
              }}
            >
              작물 도감
            </div>
          </div>

          {/* Middle: Name and description */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "72px",
                fontWeight: 900,
                color: "#ffffff",
                lineHeight: 1.1,
                letterSpacing: "-1px",
              }}
            >
              {crop.name}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "22px",
                fontWeight: 400,
                color: "rgba(255, 255, 255, 0.7)",
                lineHeight: 1.5,
                maxWidth: "600px",
              }}
            >
              {crop.description.length > 80
                ? crop.description.slice(0, 80) + "..."
                : crop.description}
            </div>
          </div>

          {/* Bottom: Meta tags */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            {/* Category */}
            <div
              style={{
                display: "flex",
                padding: "10px 22px",
                background: "rgba(255, 255, 255, 0.12)",
                borderRadius: "24px",
                fontSize: "18px",
                fontWeight: 500,
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              {categoryLabel}
            </div>

            {/* Difficulty */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "8px",
                padding: "10px 22px",
                background: "rgba(255, 255, 255, 0.12)",
                borderRadius: "24px",
                fontSize: "18px",
                fontWeight: 500,
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: difficultyColor,
                }}
              />
              난이도 {crop.difficulty}
            </div>

            {/* Season */}
            <div
              style={{
                display: "flex",
                padding: "10px 22px",
                background: "rgba(255, 255, 255, 0.12)",
                borderRadius: "24px",
                fontSize: "18px",
                fontWeight: 500,
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              {crop.growingSeason}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
