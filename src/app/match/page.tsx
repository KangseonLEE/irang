import type { Metadata } from "next";
import { Suspense } from "react";
import { MatchWizard } from "./match-wizard";

export const metadata: Metadata = {
  title: "맞춤 추천",
  description:
    "간단한 질문에 답하면, 나의 상황에 맞는 귀농 지역과 작물을 추천받을 수 있습니다.",
};

export default function MatchPage() {
  return (
    <Suspense>
      <MatchWizard />
    </Suspense>
  );
}
