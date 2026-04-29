import type { Metadata } from "next";
import { Suspense } from "react";
import { Building2, Clock, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { CENTERS, getSigunguCentersBySido } from "@/lib/data/centers";
import { PROVINCES } from "@/lib/data/regions";
import { CentersSearch } from "./centers-search";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "귀농귀촌지원센터 전국 안내",
  description:
    "광역 9개 시·도와 전국 시·군 귀농귀촌지원센터 연락처, 운영시간을 한곳에서 확인하세요. 귀농 상담 예약에 참고하세요.",
  keywords: ["귀농지원센터", "귀농상담", "귀농귀촌지원센터", "귀농 문의"],
  alternates: { canonical: "/regions/centers" },
};

export default function CentersHubPage() {
  const sidoCenters = CENTERS.filter((c) => c.category === "sido");
  const sigunguCount = CENTERS.filter((c) => c.category === "sigungu").length;

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
      />

      {/* ── stat strip ── */}
      <div className={s.statStrip}>
        <div className={s.statChip}>
          <span className={s.statNumber}>{sidoCenters.length}</span>
          <span className={s.statLabel}>광역 센터</span>
        </div>
        <div className={s.statChip}>
          <span className={s.statNumber}>{sigunguCount}</span>
          <span className={s.statLabel}>시·군 센터</span>
        </div>
        <div className={s.statBadge}>
          <Clock size={12} aria-hidden="true" />
          평일 09:00 ~ 18:00
        </div>
      </div>

      <Suspense>
        <CentersSearch
          sidoCenters={sidoCenters}
          sigunguGroups={sigunguGroups}
        />
      </Suspense>

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
