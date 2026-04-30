import type { Metadata } from "next";
import { DemoA } from "./demo-a";

export const metadata: Metadata = { title: "데모 A — 통합 섹션", robots: "noindex" };

export default function Page() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px 120px" }}>
      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
        데모 A: 트렌드 + 비용을 하나의 섹션으로 통합, 상단 공유 셀렉터
      </p>
      <DemoA />
    </div>
  );
}
