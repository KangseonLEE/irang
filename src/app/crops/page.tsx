import type { Metadata } from "next";
import { Sprout } from "lucide-react";

export const metadata: Metadata = {
  title: "작물 정보",
  description:
    "귀농 시 재배 가능한 주요 작물의 환경 조건, 수익성, 난이도를 확인하세요.",
};

export default function CropsPage() {
  return (
    <div className="mx-auto max-w-screen-xl px-6 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-primary">
          <Sprout className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-widest">
            Crop Info
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">작물 정보</h1>
        <p className="mt-2 text-muted-foreground">
          주요 작물의 재배 환경, 예상 수익, 재배 난이도를 한눈에 비교하세요.
        </p>
      </div>

      {/* Placeholder — 추후 작물 카드 그리드 구현 */}
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Sprout className="h-12 w-12 text-primary/30" />
          <p className="text-sm font-medium">작물 정보 기능 준비 중</p>
          <p className="text-xs text-muted-foreground/70">
            카테고리 필터 → 작물 카드 그리드 → 상세 정보
          </p>
        </div>
      </div>
    </div>
  );
}
