/**
 * GET /api/school-list?eduCode=J10&sigunguName=수원시
 *
 * 교육부 NEIS API에서 학교 리스트를 조회합니다.
 * - eduCode (필수): 시도교육청 코드
 * - sigunguName (선택): 시군구명 — 없으면 시도 전체
 * - page (선택): 페이지 번호 (기본 1)
 *
 * 반환: { items: SchoolItem[], totalCount: number }
 */

import { NextRequest, NextResponse } from "next/server";

interface SchoolItem {
  name: string; // 학교명
  type: string; // 학교 종류 (초등학교, 중학교, 고등학교 등)
  address: string; // 주소
  foundType: string; // 설립 구분 (국립, 공립, 사립)
}

const API_BASE = "https://open.neis.go.kr/hub/schoolInfo";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const eduCode = searchParams.get("eduCode");
  const sigunguName = searchParams.get("sigunguName");
  const page = searchParams.get("page") || "1";

  if (!eduCode) {
    return NextResponse.json(
      { error: "eduCode is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.NEIS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  const url = new URL(API_BASE);
  url.searchParams.set("KEY", apiKey);
  url.searchParams.set("Type", "json");
  url.searchParams.set("pIndex", page);
  url.searchParams.set("pSize", "30");
  url.searchParams.set("ATPT_OFCDC_SC_CODE", eduCode);
  if (sigunguName) url.searchParams.set("LCTN_SC_NM", sigunguName);

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();

    // NEIS 에러 응답
    if (json.RESULT) {
      if (json.RESULT.CODE === "INFO-200") {
        return NextResponse.json({ items: [], totalCount: 0 });
      }
      throw new Error(`NEIS error: ${json.RESULT.CODE}`);
    }

    const schoolInfo = json?.schoolInfo;
    if (!schoolInfo || !Array.isArray(schoolInfo)) {
      throw new Error("Invalid response structure");
    }

    const totalCount = schoolInfo[0]?.head?.[0]?.list_total_count ?? 0;
    const rawItems = schoolInfo[1]?.row ?? [];

    const items: SchoolItem[] = rawItems.map(
      (item: Record<string, string>) => ({
        name: item.SCHUL_NM || "",
        type: item.SCHUL_KND_SC_NM || "",
        address: item.ORG_RDNMA || item.ORG_RDNDA || "",
        foundType: item.FOND_SC_NM || "",
      })
    );

    return NextResponse.json(
      { items, totalCount },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=86400, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    console.error("School list API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch school list" },
      { status: 502 }
    );
  }
}
