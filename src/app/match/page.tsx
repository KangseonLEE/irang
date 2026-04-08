import type { Metadata } from "next";
import { Suspense } from "react";
import { ServiceGateway } from "./service-gateway";

export const metadata: Metadata = {
  title: "귀농 유형 진단 · 맞춤 추천",
  description:
    "나에게 맞는 귀농 지역·작물을 추천받거나, 귀농 준비 상태를 진단해 보세요.",
};

export default function MatchPage() {
  return (
    <Suspense>
      <ServiceGateway />
    </Suspense>
  );
}
