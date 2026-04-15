import type { Metadata } from "next";
import { Building2, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { CardGrid } from "@/components/ui/card-grid";
import { CenterCard } from "@/components/region/center-card";
import { CENTERS } from "@/lib/data/centers";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "지자체 귀농지원센터 | 이랑",
  description: "광역 9개 시·도 귀농귀촌지원센터 공식 안내를 한 곳에서.",
};

export default function CentersHubPage() {
  return (
    <div className={s.page}>
      <PageHeader
        icon={<Building2 size={18} aria-hidden="true" />}
        label="지자체 센터"
        title="귀농 상담은 지역 센터에서 시작"
        description="전국 9개 광역 귀농귀촌지원센터를 한 번에 연결해 드려요."
        count={CENTERS.length}
      />

      <CardGrid>
        {CENTERS.map((center) => (
          <CenterCard key={center.id} center={center} showSidoLabel />
        ))}
      </CardGrid>

      <aside className={s.notice}>
        <h2 className={s.noticeTitle}>시·군 단위 센터는 준비 중이에요</h2>
        <p className={s.noticeDesc}>
          기초 지자체별 센터 정보는 다음 단계에 추가될 예정이에요.
          그동안은 농림축산식품부 귀농귀촌종합센터에서 전국 안내를 받을 수 있어요.
        </p>
        <a
          href="https://www.greendaero.go.kr/"
          target="_blank"
          rel="noopener noreferrer"
          className={s.noticeLink}
        >
          귀농귀촌종합센터 바로가기
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </aside>
    </div>
  );
}
