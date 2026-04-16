import type { Metadata } from "next";
import { Suspense } from "react";
import { ServiceGateway } from "./service-gateway";

export const metadata: Metadata = {
  title: "귀농 어디가 좋을까 — 맞춤 지역·작물 매칭",
  description:
    "내 나이, 예산, 관심 작물에 맞는 귀농 지역을 찾아보세요. 데이터 기반 맞춤 추천으로 귀농 후보지를 비교할 수 있어요.",
};

export default function MatchPage() {
  return (
    <Suspense>
      <ServiceGateway />
    </Suspense>
  );
}
