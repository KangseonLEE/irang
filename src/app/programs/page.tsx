import type { Metadata } from "next";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "지원사업 검색",
  description:
    "나이, 지역, 희망 작물 조건에 맞는 귀농 지원사업을 검색하세요.",
};

export default function ProgramsPage() {
  return (
    <div className="mx-auto max-w-screen-xl px-6 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-primary">
          <FileText className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-widest">
            Support Programs
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          지원사업 검색
        </h1>
        <p className="mt-2 text-muted-foreground">
          나이, 지역, 희망 작물에 맞는 귀농·귀촌 지원사업을 찾아보세요.
        </p>
      </div>

      {/* Placeholder — 추후 필터 사이드바 + 카드 리스트 구현 */}
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <FileText className="h-12 w-12 text-primary/30" />
          <p className="text-sm font-medium">지원사업 검색 기능 준비 중</p>
          <p className="text-xs text-muted-foreground/70">
            조건 필터링 → 카드 리스트 → 상세 페이지
          </p>
        </div>
      </div>
    </div>
  );
}
