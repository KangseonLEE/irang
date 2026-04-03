/**
 * 기상청 ASOS 일자료 조회 API 유틸리티
 * - 항상 당해년도 기준으로 조회
 * - 서버 컴포넌트에서만 호출 (API Key 보호)
 */

const API_BASE = "https://apis.data.go.kr/1360000/AsosDalyInfoService/getWthrDataList";

interface ASOSItem {
  stnId: string;
  stnNm: string;
  tm: string;        // 날짜 (YYYY-MM-DD)
  avgTa: string;     // 평균기온 (℃)
  maxTa: string;     // 최고기온 (℃)
  minTa: string;     // 최저기온 (℃)
  sumRn: string;     // 일강수량 (mm)
  sumSsHr: string;   // 합계일조시간 (hr)
  avgRhm: string;    // 평균상대습도 (%)
  avgWs: string;     // 평균풍속 (m/s)
}

export interface ClimateData {
  stnId: string;
  stnName: string;
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
  totalPrecipitation: number;
  totalSunshine: number;
  avgHumidity: number;
  dataCount: number;
  period: string;
}

/**
 * 특정 관측소의 당해년도 기상 데이터를 조회하여 평균/합계로 집계
 */
export async function fetchClimateData(stnId: string): Promise<ClimateData | null> {
  const apiKey = process.env.DATA_GO_KR_API_KEY;
  if (!apiKey) {
    console.error("DATA_GO_KR_API_KEY is not set");
    return null;
  }

  const year = new Date().getFullYear();
  const today = new Date();
  // 어제까지의 데이터만 조회 (당일 데이터는 미제공)
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const startDt = `${year}0101`;
  const endDt = `${year}${String(yesterday.getMonth() + 1).padStart(2, "0")}${String(yesterday.getDate()).padStart(2, "0")}`;

  const url = new URL(API_BASE);
  url.searchParams.set("serviceKey", apiKey);
  url.searchParams.set("dataCd", "ASOS");
  url.searchParams.set("dateCd", "DAY");
  url.searchParams.set("startDt", startDt);
  url.searchParams.set("endDt", endDt);
  url.searchParams.set("stnIds", stnId);
  url.searchParams.set("dataType", "JSON");
  url.searchParams.set("numOfRows", "366");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 86400 } }); // 24시간 캐시
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const items: ASOSItem[] = json?.response?.body?.items?.item;

    if (!items || items.length === 0) return null;

    // 유효한 데이터만 필터링 (빈 문자열 제외)
    const validItems = items.filter((item) => item.avgTa !== "");

    if (validItems.length === 0) return null;

    const avgTemp = avg(validItems.map((i) => parseFloat(i.avgTa)));
    const maxTaValues = validItems.filter((i) => i.maxTa !== "").map((i) => parseFloat(i.maxTa));
    const minTaValues = validItems.filter((i) => i.minTa !== "").map((i) => parseFloat(i.minTa));
    const maxTemp = maxTaValues.length > 0 ? Math.max(...maxTaValues) : 0;
    const minTemp = minTaValues.length > 0 ? Math.min(...minTaValues) : 0;
    const totalPrecipitation = sum(validItems.map((i) => parseFloat(i.sumRn) || 0));
    const totalSunshine = sum(validItems.filter((i) => i.sumSsHr !== "").map((i) => parseFloat(i.sumSsHr)));
    const avgHumidity = avg(validItems.filter((i) => i.avgRhm !== "").map((i) => parseFloat(i.avgRhm)));

    return {
      stnId,
      stnName: validItems[0].stnNm,
      avgTemp: round(avgTemp),
      maxTemp: round(maxTemp),
      minTemp: round(minTemp),
      totalPrecipitation: round(totalPrecipitation),
      totalSunshine: round(totalSunshine),
      avgHumidity: round(avgHumidity),
      dataCount: validItems.length,
      period: `${year}.01.01 ~ ${endDt.slice(4, 6)}.${endDt.slice(6, 8)}`,
    };
  } catch (error) {
    console.error(`Failed to fetch climate data for station ${stnId}:`, error);
    return null;
  }
}

/**
 * 여러 관측소의 기상 데이터를 병렬 조회
 */
export async function fetchMultipleClimateData(stnIds: string[]): Promise<ClimateData[]> {
  const results = await Promise.allSettled(stnIds.map((id) => fetchClimateData(id)));

  return results
    .filter((r): r is PromiseFulfilledResult<ClimateData | null> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((v): v is ClimateData => v !== null);
}

// --- 유틸 ---

function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return sum(nums) / nums.length;
}

function round(num: number, decimals = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}
