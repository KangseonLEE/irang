import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import { Icon } from "@/components/ui/icon";
import { CROPS, CROP_DETAILS } from "@/lib/data/crops";
import type { ClimateData } from "@/lib/api/weather";
import { STATIONS, type Station } from "@/lib/data/stations";
import {
  parseClimateTemp,
  evaluateTemperatureFit,
  type TempFit,
} from "@/lib/parse-climate-temp";
import { CropSuitabilitySelector } from "./crop-suitability-selector";
import s from "./crop-suitability-section.module.css";

/* ==========================================================================
   CropSuitabilitySection — 지역 비교 페이지의 작물 적합성 검사 섹션
   선택한 작물이 비교 중인 각 지역에서 재배 가능한지 판정합니다.
   ========================================================================== */

interface CropSuitabilitySectionProps {
  cropId: string | null;
  climateData: ClimateData[];
  selectedStations: Station[];
}

/** 도/광역시 정식명 → 약칭 매핑 */
const PROVINCE_SHORT: Record<string, string> = {
  서울특별시: "서울",
  경기도: "경기",
  강원도: "강원",
  충청북도: "충북",
  충청남도: "충남",
  전라북도: "전북",
  전라남도: "전남",
  경상북도: "경북",
  경상남도: "경남",
  제주특별자치도: "제주",
  대전광역시: "대전",
  대구광역시: "대구",
  광주광역시: "광주",
  인천광역시: "인천",
  부산광역시: "부산",
  울산광역시: "울산",
  세종특별자치시: "세종",
};

/** 기온 적합성 라벨 */
const FIT_CONFIG: Record<TempFit, { icon: string; label: string; className: string }> = {
  good: { icon: "🟢", label: "적합", className: "fitGood" },
  marginal: { icon: "🟡", label: "보통", className: "fitMarginal" },
  poor: { icon: "🔴", label: "부적합", className: "fitPoor" },
};

/** 지역별 종합 의견 생성 */
function generateVerdict(
  stationName: string,
  isMajorRegion: boolean,
  tempFit: TempFit,
  cropName: string,
  isFacility: boolean,
): string {
  if (isMajorRegion && tempFit === "good") {
    return `${stationName}은(는) ${cropName} 주산지로, 재배 여건이 우수해요.`;
  }
  if (isMajorRegion && tempFit === "marginal") {
    return `${stationName}은(는) 주산지이나 기온 조건이 다소 경계에 있어요. 품종 선택에 주의가 필요해요.`;
  }
  if (isMajorRegion && tempFit === "poor") {
    return `${stationName}은(는) 주산지이지만 기온 적합도가 낮아요. 시설재배를 고려해 보세요.`;
  }
  if (isFacility) {
    return `${stationName}은(는) 주산지 외 지역이지만, 시설재배로 충분히 재배 가능해요.`;
  }
  if (!isMajorRegion && tempFit === "good") {
    return `${stationName}은(는) 주산지는 아니지만 기후 조건은 양호해요. 소규모 시도에 적합해요.`;
  }
  if (!isMajorRegion && tempFit === "marginal") {
    return `${stationName}은(는) 주산지 외이며 기후도 경계 수준이에요. 신중한 검토가 필요해요.`;
  }
  return `${stationName}은(는) ${cropName} 재배에 적합하지 않은 조건이에요. 다른 작물을 고려해 보세요.`;
}

export function CropSuitabilitySection({
  cropId,
  climateData,
  selectedStations,
}: CropSuitabilitySectionProps) {
  const crop = cropId ? CROPS.find((c) => c.id === cropId) : null;
  const detail = cropId ? CROP_DETAILS.find((d) => d.id === cropId) : null;
  const selectedIds_snapshot = selectedStations.map((st) => st.stnId);

  // 각 station별 분석 결과
  const analysis = selectedStations.map((station) => {
    const climate = climateData.find((d) => d.stnId === station.stnId);
    const isMajorRegion = detail
      ? detail.majorRegions.includes(station.province)
      : false;

    const parsed = detail ? parseClimateTemp(detail.cultivation.climate) : null;
    const tempFit: TempFit =
      parsed && climate
        ? evaluateTemperatureFit(parsed, climate.avgTemp)
        : "marginal";

    const isFacility = parsed?.type === "facilityControlled";

    return {
      station,
      climate,
      isMajorRegion,
      tempFit,
      isFacility,
      verdict:
        crop && detail
          ? generateVerdict(
              station.name,
              isMajorRegion,
              tempFit,
              crop.name,
              isFacility,
            )
          : "",
    };
  });

  return (
    <section id="suitability-heading" className={s.section} aria-labelledby="suitability-title">
      <div className={s.sectionHeader}>
        <Icon icon={Sprout} size="lg" className={s.sectionIcon} />
        <div>
          <h2 id="suitability-title" className={s.sectionTitle}>
            작물 적합성을 확인해 보세요
          </h2>
          <p className={s.sectionDesc}>
            {crop
              ? `${crop.name}의 지역별 재배 적합성을 비교해요.`
              : "작물을 선택하면 각 지역의 재배 적합성을 확인할 수 있어요."}
          </p>
        </div>
      </div>

      {/* 작물 선택 칩 */}
      <div className={s.selectorWrap}>
        <Suspense
          fallback={
            <div className={s.selectorSkeleton} aria-busy="true" />
          }
        >
          <CropSuitabilitySelector crops={CROPS} selectedId={cropId} />
        </Suspense>
      </div>

      {/* 적합성 비교 테이블 */}
      {crop && detail && (
        <>
          {/* 선택 작물 요약 */}
          <div className={s.cropSummary}>
            <Image
              src={`/crops/${crop.id}.jpg`}
              alt={crop.name}
              width={40}
              height={40}
              className={s.cropImage}
            />
            <div className={s.cropInfo}>
              <span className={s.cropName}>{crop.name}</span>
              <span className={s.cropMeta}>
                {crop.category} · {crop.difficulty} · {crop.growingSeason}
              </span>
            </div>
          </div>

          {/* 비교 테이블 */}
          <div className={s.tableWrap}>
            <table className={s.table}>
              <caption className={s.srOnly}>
                {crop.name} 지역별 적합성 비교
              </caption>
              <thead>
                <tr>
                  <th className={s.th} scope="col">항목</th>
                  {analysis.map((a) => (
                    <th key={a.station.stnId} className={s.th} scope="col">
                      {a.station.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 주산지 여부 */}
                <tr>
                  <td className={s.tdLabel}>주산지</td>
                  {analysis.map((a) => (
                    <td key={a.station.stnId} className={s.tdValue}>
                      <span
                        className={
                          a.isMajorRegion ? s.badgeMajor : s.badgeNonMajor
                        }
                      >
                        {a.isMajorRegion ? "✅ 주산지" : "⚠ 주산지 외"}
                      </span>
                    </td>
                  ))}
                </tr>
                {/* 기후 조건 */}
                <tr>
                  <td className={s.tdLabel}>재배 기후</td>
                  {analysis.map((a) => (
                    <td key={a.station.stnId} className={s.tdValue}>
                      <span className={s.climateReq}>
                        {detail.cultivation.climate}
                      </span>
                    </td>
                  ))}
                </tr>
                {/* 실측 기온 vs 적합성 */}
                <tr>
                  <td className={s.tdLabel}>기온 적합</td>
                  {analysis.map((a) => {
                    const cfg = FIT_CONFIG[a.tempFit];
                    return (
                      <td key={a.station.stnId} className={s.tdValue}>
                        <span className={s[cfg.className]}>
                          {cfg.icon} {cfg.label}
                        </span>
                        {a.climate && (
                          <span className={s.tempActual}>
                            실측 {a.climate.avgTemp}℃
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
                {/* 재배 시기 */}
                <tr>
                  <td className={s.tdLabel}>재배 시기</td>
                  {analysis.map((a) => (
                    <td key={a.station.stnId} className={s.tdValue}>
                      {crop.growingSeason}
                    </td>
                  ))}
                </tr>
                {/* 난이도 */}
                <tr>
                  <td className={s.tdLabel}>난이도</td>
                  {analysis.map((a) => (
                    <td key={a.station.stnId} className={s.tdValue}>
                      {crop.difficulty}
                    </td>
                  ))}
                </tr>
                {/* 종합 의견 */}
                <tr className={s.verdictRow}>
                  <td className={s.tdLabel}>종합 의견</td>
                  {analysis.map((a) => (
                    <td key={a.station.stnId} className={s.tdVerdict}>
                      {a.verdict}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* 적합 지역 제안 — 주산지가 아닌 지역이 있을 때 표시 */}
          {(() => {
            const hasNonMajor = analysis.some((a) => !a.isMajorRegion);
            if (!hasNonMajor) return null;

            // 현재 선택된 지역의 province 목록
            const selectedProvinces = new Set(
              selectedStations.map((st) => st.province),
            );
            // majorRegions 중 아직 선택되지 않은 지역 + 대표 station 매핑
            const suggestions = detail.majorRegions
              .filter((region) => !selectedProvinces.has(region))
              .map((region) => {
                const station = STATIONS.find((st) => st.province === region);
                const shortName = PROVINCE_SHORT[region] ?? region;
                return station
                  ? { name: shortName, stnId: station.stnId }
                  : null;
              })
              .filter((v): v is NonNullable<typeof v> => v != null);

            if (suggestions.length === 0) return null;

            return (
              <div className={s.suggestion}>
                <div className={s.suggestionHeader}>
                  <Icon icon={MapPin} size="sm" className={s.suggestionIcon} />
                  <span className={s.suggestionLabel}>
                    {crop.name} 재배에 적합한 지역
                  </span>
                </div>
                <div className={s.suggestionChips}>
                  {suggestions.map((sg) => {
                    // 현재 stations + 추천 지역으로 비교 링크 생성
                    const newStations = [
                      ...selectedIds_snapshot,
                      sg.stnId,
                    ].slice(-3);
                    const compareUrl = `/regions/compare?stations=${newStations.join(",")}&crop=${cropId}`;
                    return (
                      <Link
                        key={sg.stnId}
                        href={compareUrl}
                        className={s.suggestionChip}
                      >
                        {sg.name}
                        <span className={s.suggestionChipArrow}>+비교</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* 작물 전체 평가 한 줄 */}
          {detail.prosCons?.verdict && (
            <div className={s.generalVerdict}>
              <span className={s.generalVerdictLabel}>💡 작물 총평</span>
              <p className={s.generalVerdictText}>{detail.prosCons.verdict}</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
