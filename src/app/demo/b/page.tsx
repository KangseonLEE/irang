import type { Metadata } from "next";
import { DemoB } from "./demo-b";

export const metadata: Metadata = { title: "데모 B — 분리 + 공용 셀렉터", robots: "noindex" };

export default function Page() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px 120px" }}>
      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
        데모 B: 트렌드 / 비용 섹션 분리 유지, 셀렉터 UI만 공용 컴포넌트로 통일
      </p>
      <DemoB />
    </div>
  );
}
