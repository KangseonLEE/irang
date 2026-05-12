import { fetchMultipleClimateData } from "@/lib/api/weather";
import { CropSuitabilitySection } from "./crop-suitability-section";
import { DataSource } from "@/components/ui/data-source";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import type { RegionItem } from "./region-item";
import s from "./page.module.css";

interface Props {
  regions: RegionItem[];
  selectedCropId: string | null;
}

/**
 * 작물 적합성 탭 — weather 결과로 적합성 판정.
 * weather 외 다른 API 호출 없음. fetch는 climate 탭과 동일하므로 빠름.
 */
export async function SuitabilityView({ regions, selectedCropId }: Props) {
  const stationIds = regions.map((r) => r.station.stnId);
  const climateData = await fetchMultipleClimateData(stationIds);

  if (climateData.length === 0) {
    return (
      <div className={s.viewEmptyState}>
        <p className={s.viewEmptyText}>
          기상 데이터를 불러오지 못해 적합성을 계산할 수 없어요. 잠시 후 다시 시도해 주세요.
        </p>
      </div>
    );
  }

  return (
    <>
      <CropSuitabilitySection
        cropId={selectedCropId}
        climateData={climateData}
        selectedStations={regions.map((r) => r.station)}
      />
      <ReferenceNotice text="적합성 판정은 작물별 권장 기온 범위와 해당 지역 실측 평균기온을 비교한 참고치예요. 실제 재배에는 토양·일조·관행이 함께 작용해요." />
      <DataSource source="기상청 ASOS · 농촌진흥청 작물별 재배 권장 환경" />
    </>
  );
}
