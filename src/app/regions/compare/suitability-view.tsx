import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Sprout,
  CloudSun,
  ClipboardCheck,
  Lightbulb,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import {
  fetchMultipleClimateData,
  type ClimateData,
} from "@/lib/api/weather";
import { CROPS, CROP_DETAILS } from "@/lib/data/crops";
import { getCropImageSrc } from "@/lib/crop-image";
import { STATIONS } from "@/lib/data/stations";
import {
  parseClimateTemp,
  evaluateTemperatureFit,
  type TempFit,
} from "@/lib/parse-climate-temp";
import { CropSuitabilitySelector } from "./crop-suitability-selector";
import { DataSource } from "@/components/ui/data-source";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import type { RegionItem } from "./region-item";
import s from "./suitability-view.module.css";
import metric from "./climate-view.module.css";
import shared from "./page.module.css";

interface Props {
  regions: RegionItem[];
  selectedCropId: string | null;
}

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

const FIT_TONE: Record<TempFit, { dot: string; label: string; tone: string }> = {
  good: { dot: "🟢", label: "적합", tone: "fitGood" },
  marginal: { dot: "🟡", label: "보통", tone: "fitMarginal" },
  poor: { dot: "🔴", label: "부적합", tone: "fitPoor" },
};

/**
 * 작물 적합성 탭 — climate-view·infra-view 와 동일한 metric stat card 패턴.
 * - 작물 selector (chip)
 * - 작물 선택 후: 주산지 / 기온 적합도 / 종합 의견 3개 metric card
 * - 추천 적합 지역 칩 + 작물 총평
 */
export async function SuitabilityView({ regions, selectedCropId }: Props) {
  const stationIds = regions.map((r) => r.station.stnId);
  const climateData = await fetchMultipleClimateData(stationIds);
  const climateByStation = new Map(climateData.map((c) => [c.stnId, c]));

  const crop = selectedCropId
    ? CROPS.find((c) => c.id === selectedCropId)
    : null;
  const detail = selectedCropId
    ? CROP_DETAILS.find((d) => d.id === selectedCropId)
    : null;

  return (
    <>
      {/* 1. 작물 선택 */}
      <Suspense fallback={<div className={s.selectorSkeleton} aria-busy="true" />}>
        <CropSuitabilitySelector crops={CROPS} selectedId={selectedCropId} />
      </Suspense>

      {/* 2. 작물 미선택 안내 */}
      {!crop && (
        <div className={s.guideCard}>
          <Icon icon={Sprout} size="md" className={s.guideIcon} />
          <div>
            <p className={s.guideTitle}>작물을 골라 보세요</p>
            <p className={s.guideText}>
              선택한 작물이 비교 중인 지역에서 잘 자랄 수 있는지 한눈에 확인할 수 있어요.
            </p>
          </div>
        </div>
      )}

      {/* 3. 작물 선택 시: 요약 + metric cards + 추천 */}
      {crop && detail && (
        <>
          <CropSummary crop={crop} detail={detail} />

          <SuitabilityMetrics
            regions={regions}
            climateByStation={climateByStation}
            detail={detail}
            cropName={crop.name}
          />

          <SuggestionStrip
            regions={regions}
            detail={detail}
            cropName={crop.name}
            cropId={crop.id}
          />

          {detail.prosCons?.verdict && (
            <div className={s.verdictBanner}>
              <span className={s.verdictBannerLabel}>
                <Icon icon={Lightbulb} size="sm" />
                작물 총평
              </span>
              <p className={s.verdictBannerText}>{detail.prosCons.verdict}</p>
            </div>
          )}
        </>
      )}

      <ReferenceNotice text="적합성 판정은 작물별 권장 기온 범위와 해당 지역 실측 평균기온을 비교한 참고치예요. 실제 재배에는 토양·일조·관행이 함께 작용해요." />
      <DataSource source="기상청 ASOS · 농촌진흥청 작물별 재배 권장 환경" />
    </>
  );
}

// ============================================================================
// 작물 요약 (선택된 작물의 메타)
// ============================================================================

function CropSummary({
  crop,
  detail,
}: {
  crop: (typeof CROPS)[number];
  detail: (typeof CROP_DETAILS)[number];
}) {
  return (
    <div className={s.cropSummary}>
      <Image
        src={getCropImageSrc(crop.id)}
        alt=""
        width={56}
        height={56}
        className={s.cropImage}
      />
      <div className={s.cropMeta}>
        <span className={s.cropName}>{crop.name}</span>
        <span className={s.cropTags}>
          {crop.category} · {crop.difficulty} · {crop.growingSeason}
        </span>
        <span className={s.cropClimate}>권장 기후 · {detail.cultivation.climate}</span>
      </div>
    </div>
  );
}

// ============================================================================
// Suitability Metric Cards — 3개 metric × region 행
// ============================================================================

interface VerdictResult {
  station: RegionItem["station"];
  region: RegionItem;
  climate: ClimateData | undefined;
  isMajorRegion: boolean;
  tempFit: TempFit;
  isFacility: boolean;
  verdict: string;
}

function SuitabilityMetrics({
  regions,
  climateByStation,
  detail,
  cropName,
}: {
  regions: RegionItem[];
  climateByStation: Map<string, ClimateData>;
  detail: (typeof CROP_DETAILS)[number];
  cropName: string;
}) {
  const results: VerdictResult[] = regions.map((region) => {
    const climate = climateByStation.get(region.station.stnId);
    const isMajorRegion = detail.majorRegions.includes(region.station.province);
    const parsed = parseClimateTemp(detail.cultivation.climate);
    const tempFit: TempFit =
      parsed && climate
        ? evaluateTemperatureFit(parsed, climate.avgTemp)
        : "marginal";
    const isFacility = parsed?.type === "facilityControlled";
    return {
      station: region.station,
      region,
      climate,
      isMajorRegion,
      tempFit,
      isFacility,
      verdict: generateVerdict(
        region.label,
        isMajorRegion,
        tempFit,
        cropName,
        isFacility,
      ),
    };
  });

  return (
    <div className={metric.metricGrid}>
      <BadgeMetricCard
        title="주산지 여부"
        icon={MapPin}
        rows={results.map((r) => ({
          regionId: r.region.id,
          regionLabel: r.region.label,
          badge: r.isMajorRegion ? "✅ 주산지" : "⚠ 주산지 외",
          tone: r.isMajorRegion ? "fitGood" : "fitMarginal",
          subText: null,
        }))}
        footerLabel={
          results.every((r) => r.isMajorRegion)
            ? "전부 주산지예요"
            : results.some((r) => r.isMajorRegion)
              ? "주산지가 일부 있어요"
              : "선택한 지역 모두 주산지 외예요"
        }
      />

      <BadgeMetricCard
        title="기온 적합도"
        icon={CloudSun}
        rows={results.map((r) => ({
          regionId: r.region.id,
          regionLabel: r.region.label,
          badge: `${FIT_TONE[r.tempFit].dot} ${FIT_TONE[r.tempFit].label}`,
          tone: FIT_TONE[r.tempFit].tone,
          subText: r.climate ? `실측 ${r.climate.avgTemp}℃` : null,
        }))}
        footerLabel={(() => {
          const good = results.filter((r) => r.tempFit === "good").length;
          if (good === results.length) return "모든 지역 기온 적합";
          if (good === 0) return "기온 적합 지역 없음";
          return `${good}곳이 기온 적합`;
        })()}
      />

      <TextMetricCard
        title="종합 의견"
        icon={ClipboardCheck}
        rows={results.map((r) => ({
          regionId: r.region.id,
          regionLabel: r.region.label,
          text: r.verdict,
        }))}
      />
    </div>
  );
}

// ============================================================================
// BadgeMetricCard — 막대 대신 배지 표시 (binary/enum metric용)
// ============================================================================

interface BadgeRow {
  regionId: string;
  regionLabel: string;
  badge: string;
  tone: string;
  subText: string | null;
}

function BadgeMetricCard({
  title,
  icon,
  rows,
  footerLabel,
}: {
  title: string;
  icon: LucideIcon;
  rows: BadgeRow[];
  footerLabel: string;
}) {
  return (
    <article className={metric.metricCard}>
      <header className={metric.metricCardHeader}>
        <span className={metric.metricCardIcon}>
          <Icon icon={icon} size="sm" />
        </span>
        <h3 className={metric.metricCardTitle}>{title}</h3>
      </header>
      <ul className={s.badgeRowList}>
        {rows.map((r) => (
          <li key={r.regionId} className={s.badgeRow}>
            <span className={s.badgeRowLabel}>{r.regionLabel}</span>
            <span className={`${s.badge} ${s[r.tone] ?? ""}`}>{r.badge}</span>
            {r.subText && <span className={s.badgeRowSub}>{r.subText}</span>}
          </li>
        ))}
      </ul>
      <footer className={metric.metricCardFooter}>
        <span className={metric.metricCardFooterLabel}>{footerLabel}</span>
      </footer>
    </article>
  );
}

// ============================================================================
// TextMetricCard — verdict 같은 서술형 metric
// ============================================================================

function TextMetricCard({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: LucideIcon;
  rows: { regionId: string; regionLabel: string; text: string }[];
}) {
  return (
    <article className={`${metric.metricCard} ${s.textMetricCard}`}>
      <header className={metric.metricCardHeader}>
        <span className={metric.metricCardIcon}>
          <Icon icon={icon} size="sm" />
        </span>
        <h3 className={metric.metricCardTitle}>{title}</h3>
      </header>
      <ul className={s.textRowList}>
        {rows.map((r) => (
          <li key={r.regionId} className={s.textRow}>
            <span className={s.textRowLabel}>{r.regionLabel}</span>
            <p className={s.textRowBody}>{r.text}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}

// ============================================================================
// 추천 적합 지역 칩 (주산지 외 region이 있을 때만)
// ============================================================================

function SuggestionStrip({
  regions,
  detail,
  cropName,
  cropId,
}: {
  regions: RegionItem[];
  detail: (typeof CROP_DETAILS)[number];
  cropName: string;
  cropId: string;
}) {
  const selectedProvinces = new Set(regions.map((r) => r.station.province));
  const hasNonMajor = regions.some(
    (r) => !detail.majorRegions.includes(r.station.province),
  );
  if (!hasNonMajor) return null;

  const suggestions = detail.majorRegions
    .filter((region) => !selectedProvinces.has(region))
    .map((region) => {
      const station = STATIONS.find((st) => st.province === region);
      const shortName = PROVINCE_SHORT[region] ?? region;
      return station ? { name: shortName, stnId: station.stnId } : null;
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);

  if (suggestions.length === 0) return null;

  const currentStnIds = regions.map((r) => r.station.stnId);

  return (
    <section className={s.suggestion} aria-label="추천 적합 지역">
      <div className={s.suggestionHeader}>
        <Icon icon={MapPin} size="sm" className={s.suggestionIcon} />
        <span className={s.suggestionLabel}>
          {cropName} 재배에 적합한 다른 지역
        </span>
      </div>
      <div className={s.suggestionChips}>
        {suggestions.map((sg) => {
          const newStations = [...currentStnIds, sg.stnId].slice(-3);
          const compareUrl = `/regions/compare?stations=${newStations.join(",")}&crop=${cropId}&tab=suitability`;
          return (
            <Link key={sg.stnId} href={compareUrl} className={s.suggestionChip}>
              {sg.name}
              <span className={s.suggestionChipArrow}>+비교</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ============================================================================
// Verdict 생성 (기존 로직 보존)
// ============================================================================

function generateVerdict(
  stationName: string,
  isMajorRegion: boolean,
  tempFit: TempFit,
  cropName: string,
  isFacility: boolean,
): string {
  if (isMajorRegion && tempFit === "good") {
    return `${stationName}은(는) ${cropName} 주산지로 재배 여건이 우수해요.`;
  }
  if (isMajorRegion && tempFit === "marginal") {
    return `${stationName}은(는) 주산지지만 기온이 다소 경계예요. 품종 선택에 주의가 필요해요.`;
  }
  if (isMajorRegion && tempFit === "poor") {
    return `${stationName}은(는) 주산지지만 기온 적합도가 낮아요. 시설재배를 고려해 보세요.`;
  }
  if (isFacility) {
    return `${stationName}은(는) 주산지 외 지역이지만 시설재배로 충분히 가능해요.`;
  }
  if (!isMajorRegion && tempFit === "good") {
    return `${stationName}은(는) 주산지는 아니지만 기후 조건은 양호해요. 소규모 시도에 적합해요.`;
  }
  if (!isMajorRegion && tempFit === "marginal") {
    return `${stationName}은(는) 주산지 외이며 기후도 경계 수준이에요. 신중한 검토가 필요해요.`;
  }
  return `${stationName}은(는) ${cropName} 재배에 적합하지 않은 조건이에요. 다른 작물을 고려해 보세요.`;
}
