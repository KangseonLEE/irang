import type { Metadata } from "next";
import { Building2, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { CENTERS, getSigunguCentersBySido } from "@/lib/data/centers";
import { PROVINCES } from "@/lib/data/regions";
import { CentersSearch } from "./centers-search";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "지자체 귀농지원센터 | 이랑",
  description:
    "광역 9개 시·도 + 전국 시·군 귀농귀촌지원센터 공식 안내를 한 곳에서.",
};

export default function CentersHubPage() {
  const sidoCenters = CENTERS.filter((c) => c.category === "sido");

  // 광역별로 시·군 센터 그룹핑 (커버된 광역만 노출)
  const sigunguGroups = PROVINCES.map((province) => ({
    id: province.id,
    shortName: province.shortName,
    centers: getSigunguCentersBySido(province.id),
  })).filter((g) => g.centers.length > 0);

  return (
    <div className={s.page}>
      <PageHeader
        icon={<Building2 size={18} aria-hidden="true" />}
        label="지자체 센터"
        title="귀농 상담은 지역 센터에서"
        description="전국 광역·시·군 귀농귀촌지원센터를 한 번에 연결해 드려요."
        count={CENTERS.length}
      />

      <CentersSearch
        sidoCenters={sidoCenters}
        sigunguGroups={sigunguGroups}
      />

      <aside className={s.notice}>
        <h2 className={s.noticeTitle}>아직 준비 중인 지역도 있어요</h2>
        <p className={s.noticeDesc}>
          수도권 일부·강원·충북·충남·제주는 순차적으로 추가할 예정이에요.
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
