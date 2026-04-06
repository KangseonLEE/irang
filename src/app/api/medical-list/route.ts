/**
 * GET /api/medical-list?sidoCd=310000&sgguCd=310400
 *
 * 건강보험심사평가원 API에서 의료기관 리스트를 조회합니다.
 * - sidoCd (필수): 시도 코드
 * - sgguCd (선택): 시군구 코드 — 없으면 시도 전체
 * - page (선택): 페이지 번호 (기본 1)
 *
 * 반환: { items: MedicalItem[], totalCount: number }
 */

import { NextRequest, NextResponse } from "next/server";

interface MedicalItem {
  name: string; // 의료기관명
  type: string; // 종별 (종합병원, 병원, 의원 등)
  address: string; // 주소
  tel: string; // 전화번호
}

const API_BASE =
  "http://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList";

/** 의료기관 종별 우선순위 (큰 병원 → 작은 의원) */
const TYPE_PRIORITY: Record<string, number> = {
  상급종합: 0,
  종합병원: 1,
  병원: 2,
  요양병원: 3,
  치과병원: 4,
  한방병원: 5,
  의원: 6,
  치과의원: 7,
  한의원: 8,
  보건소: 9,
  보건지소: 10,
  보건진료소: 11,
};

function getTypePriority(type: string): number {
  for (const [key, priority] of Object.entries(TYPE_PRIORITY)) {
    if (type.includes(key)) return priority;
  }
  return 99;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const sidoCd = searchParams.get("sidoCd");
  const sgguCd = searchParams.get("sgguCd");
  const page = searchParams.get("page") || "1";

  if (!sidoCd) {
    return NextResponse.json(
      { error: "sidoCd is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.DATA_GO_KR_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  const url = new URL(API_BASE);
  url.searchParams.set("serviceKey", apiKey);
  url.searchParams.set("sidoCd", sidoCd);
  if (sgguCd) url.searchParams.set("sgguCd", sgguCd);
  url.searchParams.set("pageNo", page);
  url.searchParams.set("numOfRows", "30");
  url.searchParams.set("_type", "json");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const body = json?.response?.body;
    const totalCount = body?.totalCount ?? 0;
    const rawItems = body?.items?.item;

    const items: MedicalItem[] = (
      Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : []
    )
      .map((item: Record<string, string>) => ({
        name: item.yadmNm || "",
        type: item.clCdNm || "",
        address: item.addr || "",
        tel: item.telno || "",
      }))
      .sort((a, b) => getTypePriority(a.type) - getTypePriority(b.type));

    return NextResponse.json(
      { items, totalCount },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    console.error("Medical list API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch medical facilities" },
      { status: 502 }
    );
  }
}
