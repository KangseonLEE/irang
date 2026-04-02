import type { Metadata } from "next";
import { MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "지역 비교",
  description:
    "귀농 후보 지역의 기후, 인구, 의료 인프라, 교육 환경을 비교하세요.",
};

export default function RegionsPage() {
  return (
    <div className="mx-auto max-w-screen-xl px-6 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-primary">
          <MapPin className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-widest">
            Region Compare
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">지역 비교</h1>
        <p className="mt-2 text-muted-foreground">
          최대 3개 지역의 기후, 인프라, 인구 데이터를 나란히 비교할 수 있습니다.
        </p>
      </div>

      {/* Placeholder — 추후 지역 선택 Combobox + 비교 카드 구현 */}
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <MapPin className="h-12 w-12 text-primary/30" />
          <p className="text-sm font-medium">지역 비교 기능 준비 중</p>
          <p className="text-xs text-muted-foreground/70">
            시/군/구 선택 → 기후·인구·의료·교육 데이터 비교
          </p>
        </div>
      </div>
    </div>
  );
}
