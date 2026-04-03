/**
 * KOSIS Open API 유틸리티
 * - 농업 관련 통계 데이터 조회
 * - 서버 컴포넌트에서만 호출 (API Key 보호)
 */

const API_BASE =
  "https://kosis.kr/openapi/Param/statisticsParameterData.do";

/** KOSIS 통계표 ID */
export const KOSIS_TABLE = {
  /** 시군별 논벼 생산량 (재배면적 ha, 생산량 톤) */
  RICE_PRODUCTION: "DT_1ET0034",
  /** 과수 재배 농가 및 면적 */
  FRUIT_AREA: "DT_1AG20411",
  /** 시설작물 재배면적 */
  FACILITY_CROP_AREA: "DT_1ET0017",
} as const;

/** KOSIS API 응답 원본 아이템 */
interface KOSISRawItem {
  C1_NM: string; // 지역명
  ITM_NM: string; // 항목명
  DT: string; // 데이터 값
  UNIT_NM: string; // 단위
  PRD_DE: string; // 기간
  TBL_NM: string; // 테이블명
}

export interface CropStatItem {
  regionName: string;
  cropName: string;
  cultivationArea: number; // 재배면적 (ha)
  production: number; // 생산량 (톤)
  year: number;
}

/**
 * KOSIS 통계표에서 작물 통계 데이터를 조회한다.
 *
 * 농업 통계는 보통 전년도가 최신이므로,
 * 당해년도를 먼저 시도한 뒤 데이터가 없으면 전년도로 fallback한다.
 */
export async function fetchCropStats(
  tblId: string
): Promise<CropStatItem[]> {
  const apiKey = process.env.KOSIS_API_KEY;
  if (!apiKey) {
    console.error("KOSIS_API_KEY is not set");
    return [];
  }

  const currentYear = new Date().getFullYear();

  // 당해년도 시도
  const items = await fetchFromKOSIS(tblId, apiKey, currentYear);
  if (items.length > 0) return items;

  // fallback: 전년도
  return fetchFromKOSIS(tblId, apiKey, currentYear - 1);
}

// --- 내부 함수 ---

async function fetchFromKOSIS(
  tblId: string,
  apiKey: string,
  year: number
): Promise<CropStatItem[]> {
  const url = new URL(API_BASE);
  url.searchParams.set("method", "getList");
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("itmId", "ALL");
  url.searchParams.set("objL1", "ALL");
  url.searchParams.set("objL2", "");
  url.searchParams.set("format", "json");
  url.searchParams.set("jsonVD", "Y");
  url.searchParams.set("prdSe", "Y");
  url.searchParams.set("startPrdDe", String(year));
  url.searchParams.set("endPrdDe", String(year));
  url.searchParams.set("orgId", "101");
  url.searchParams.set("tblId", tblId);

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 86400 }, // 24시간 캐시
    });

    if (!res.ok) {
      throw new Error(`KOSIS HTTP ${res.status}`);
    }

    const json = await res.json();

    // KOSIS 는 에러 시에도 200을 반환하며 err 필드를 포함할 수 있다
    if (!Array.isArray(json)) {
      console.warn("KOSIS response is not an array:", JSON.stringify(json).slice(0, 200));
      return [];
    }

    const raw: KOSISRawItem[] = json;
    return parseRawItems(raw);
  } catch (error) {
    console.error(`Failed to fetch KOSIS data (tblId=${tblId}, year=${year}):`, error);
    return [];
  }
}

/**
 * KOSIS 원본 응답을 CropStatItem 으로 변환한다.
 *
 * 동일 지역의 여러 항목(재배면적, 생산량 등)을 하나의 레코드로 합친다.
 */
function parseRawItems(raw: KOSISRawItem[]): CropStatItem[] {
  // 지역별로 그룹핑
  const regionMap = new Map<
    string,
    { cultivationArea: number; production: number; cropName: string; year: number }
  >();

  for (const item of raw) {
    const value = parseFloat(item.DT);
    if (isNaN(value)) continue;

    const key = item.C1_NM;
    if (!regionMap.has(key)) {
      regionMap.set(key, {
        cultivationArea: 0,
        production: 0,
        cropName: extractCropName(item.ITM_NM, item.TBL_NM),
        year: parseInt(item.PRD_DE, 10),
      });
    }

    const entry = regionMap.get(key)!;
    const itmLower = item.ITM_NM.toLowerCase();

    if (itmLower.includes("재배면적") || itmLower.includes("면적")) {
      entry.cultivationArea = value;
    } else if (itmLower.includes("생산량") || itmLower.includes("수확량")) {
      entry.production = value;
    }
  }

  return Array.from(regionMap.entries()).map(([regionName, data]) => ({
    regionName,
    cropName: data.cropName,
    cultivationArea: data.cultivationArea,
    production: data.production,
    year: data.year,
  }));
}

/** 항목명 또는 테이블명에서 작물 이름을 추출한다. */
function extractCropName(itmName: string, tblName: string): string {
  // "논벼:재배면적" → "논벼"
  const colonIdx = itmName.indexOf(":");
  if (colonIdx > 0) return itmName.slice(0, colonIdx);

  // 테이블명에서 추출 ("시군별 논벼 생산량" → "논벼")
  const match = tblName.match(/(?:시군별|시도별)\s+(.+?)(?:\s+(?:생산량|재배|면적))/);
  if (match) return match[1];

  return itmName;
}
