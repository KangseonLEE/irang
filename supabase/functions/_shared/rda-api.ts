/**
 * RDA 똑똑!청년농부 API 클라이언트 (Deno 호환)
 * - src/lib/api/rda.ts를 Edge Function용으로 포팅
 * - process.env → Deno.env.get()
 * - Next.js fetch 옵션 제거
 */

import type { RdaPolicyItem, RdaEduItem } from "./types.ts";

const API_BASE = "https://www.rda.go.kr/young/api";

function getApiKey(): string | null {
  const key = Deno.env.get("RDA_API_KEY");
  if (!key) {
    console.log("[RDA] RDA_API_KEY not set — skipping API fetch");
    return null;
  }
  return key;
}

async function fetchRdaList<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T[] | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const url = new URL(`${API_BASE}/${endpoint}`);
  url.searchParams.set("serviceKey", apiKey);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error(`[RDA] ${endpoint} HTTP ${res.status}`);
      return null;
    }

    const json = await res.json();

    if (Array.isArray(json)) return json as T[];
    if (json.list && Array.isArray(json.list)) return json.list as T[];
    if (json.data && Array.isArray(json.data)) return json.data as T[];
    if (json.items && Array.isArray(json.items)) return json.items as T[];

    console.warn("[RDA] Unexpected response structure:", Object.keys(json));
    return null;
  } catch (err) {
    console.error(`[RDA] ${endpoint} fetch failed:`, err);
    return null;
  }
}

/**
 * 지원사업 전체 페이지 조회 (당해년도)
 */
export async function fetchAllPolicies(): Promise<RdaPolicyItem[]> {
  const year = new Date().getFullYear();
  const allItems: RdaPolicyItem[] = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const items = await fetchRdaList<RdaPolicyItem>("policyList", {
      sd: `${year}-01-01`,
      ed: `${year}-12-31`,
      cp: String(page),
      rowCnt: String(pageSize),
    });

    if (!items || items.length === 0) break;
    allItems.push(...items);
    if (items.length < pageSize) break;
    page++;
  }

  return allItems;
}

/**
 * 교육과정 전체 페이지 조회 (당해년도)
 */
export async function fetchAllEducation(): Promise<RdaEduItem[]> {
  const year = new Date().getFullYear();
  const allItems: RdaEduItem[] = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const items = await fetchRdaList<RdaEduItem>("eduList", {
      sd: `${year}-01-01`,
      ed: `${year}-12-31`,
      cp: String(page),
      rowCnt: String(pageSize),
    });

    if (!items || items.length === 0) break;
    allItems.push(...items);
    if (items.length < pageSize) break;
    page++;
  }

  return allItems;
}
