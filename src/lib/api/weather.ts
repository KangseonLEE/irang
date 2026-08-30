/**
 * 기상청 ASOS 일자료 조회 API 유틸리티
 * - 항상 당해년도 기준으로 조회
 * - 서버 컴포넌트에서만 호출 (API Key 보호)
 */

import { FETCH_TIMEOUT } from "./_build-phase";

const API_BASE = "https://apis.data.go.kr/1360000/AsosDalyInfoService/getWthrDataList";

// 2026-05-12: ASOS API도 일시적 timeout/빈응답이 가끔 발생 (HIRA 패턴과 동일).
// 누락 시 카드 자리가 통째 사라져 UX 깨짐 → 1회 retry로 transient 실패 회복.
async function fetchAsosJson(url: string): Promise<unknown> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
        // 8/30: 브라우저 UA·Accept 명시(정부 사이트 봇 UA 차단 대비, 5/25 #53). 단 data.go.kr의 AWS 대역
        // 차단(400 code 10)은 UA로 풀리지 않음이 실측됨 — 헤더는 무해하므로 유지.
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
          Accept: "application/json,text/plain,*/*",
        },
      });
      if (!res.ok) {
        // 8/30 확정: Vercel(AWS icn1·hnd1)에서 동일 URL·동일 키가 HTTP 400 INVALID_REQUEST_PARAMETER(code 10).
        // 로컬(KR 가정망)은 200, 진짜 파라미터 오류는 200+resultCode 02, 잘못된 키는 403 code 30 → data.go.kr
        // 게이트웨이의 클라우드 대역 차단(위장). 미국 러너는 403/타임아웃. 우회 인프라(API허브·프록시) 결재 대기.
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      if (attempt === 1) throw err;
    }
  }
  throw new Error("unreachable");
}

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
    const json = (await fetchAsosJson(url.toString())) as {
      response?: { body?: { items?: { item?: ASOSItem[] } } };
    };
    const items = json?.response?.body?.items?.item;

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
