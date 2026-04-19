import { Map } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { loadDistrictMap } from "@/lib/data/district-maps";
import { DistrictMap } from "@/components/map/district-map";
import s from "./page.module.css";

interface DistrictMapSectionProps {
  provinceId: string;
  sigunguId: string;
  sigunguName: string;
}

export async function DistrictMapSection({
  provinceId,
  sigunguId,
  sigunguName,
}: DistrictMapSectionProps) {
  let districtData;
  try {
    districtData = await loadDistrictMap(sigunguId);
  } catch {
    return null;
  }

  if (!districtData || districtData.gus.length === 0) return null;

  return (
    <section className={s.section} aria-label="구별 지도">
      <div className={s.sectionHeader}>
        <Icon icon={Map} size="lg" />
        <div>
          <h2 className={s.sectionTitle}>{sigunguName} 구별 지도</h2>
          <p className={s.sectionDesc}>
            클릭하면 구별 상세 정보를 확인할 수 있어요.
          </p>
        </div>
      </div>
      <DistrictMap
        provinceId={provinceId}
        sigunguId={sigunguId}
        gus={districtData.gus}
        viewBox={districtData.viewBox}
      />
    </section>
  );
}
