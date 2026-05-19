import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "농촌 정착 적합도 진단",
  description:
    "10가지 질문으로 나의 농촌 정착 적합도를 객관적으로 점검하세요. 동기, 재정, 가족, 경험, 적응력 5가지 차원을 분석해 맞춤 행동 가이드를 제공해요.",
  keywords: ["농촌 정착 적합도", "농촌 정착 테스트", "정착 준비", "농촌 정착 진단", "정착 진단"],
  alternates: { canonical: "/assess" },
};

/**
 * /assess → /match?mode=assess 리다이렉트
 * 기존 URL을 통해 접근하는 사용자를 통합 서비스 페이지로 안내
 */
export default function AssessPage() {
  redirect("/match?mode=assess");
}
