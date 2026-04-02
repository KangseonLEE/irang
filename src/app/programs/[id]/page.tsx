import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";

export const metadata: Metadata = {
  title: "지원사업 상세",
};

interface ProgramDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProgramDetailPage({
  params,
}: ProgramDetailPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-screen-xl px-6 py-10">
      {/* Breadcrumb / Back */}
      <LinkButton
        href="/programs"
        variant="ghost"
        size="sm"
        className="mb-6 -ml-2 gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        지원사업 목록
      </LinkButton>

      {/* Placeholder — 추후 실제 지원사업 데이터로 채움 */}
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <p className="text-sm font-medium">
            지원사업 상세 페이지 (ID: {id})
          </p>
          <p className="text-xs text-muted-foreground/70">
            지원 조건 · 신청 방법 · 지원 금액 · 문의처
          </p>
        </div>
      </div>
    </div>
  );
}
