/**
 * GET /api/medical-list?sidoCd=310000&sgguCd=310400
 *
 * 건강보험심사평가원 API에서 의료기관 리스트를 조회합니다.
 * - sidoCd (필수): 시도 코드
 * - sgguCd (선택): 시군구 코드 — 없으면 시도 전체
 * - page (선택): 페이지 번호 (기본 1)
 * - unit=gu (선택): 시 아래 구 상세 — 구 코드 하나만 (시 대표 코드와 같아도 시 전체로 넓히지 않음).
 *   구 신설 뒤 시 단위 코드로 남은 기관(화성 312500)은 법정 읍·면·동으로 그 구 목록 끝에 붙인다 — 상세 카드 수와 같게 (10/7)
 *
 * - Rate Limiting: IP 기반 분당 30건
 * 반환: { items: MedicalItem[], totalCount: number }
 */

import { NextRequest, NextResponse } from "next/server";
import { buildDataGoKrRequest } from "@/lib/api/_datagokr";
import { GU_HIRA_CODES_MAP, fetchGuResidualItems, hiraListUnits, type HiraListItem } from "@/lib/api/hira";
import { GUS } from "@/lib/data/gus";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";

// ── Rate Limiter (인메모리, Serverless 인스턴스 단위) ──

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000; // 1분
const MAX_REQUESTS = 30; // 분당 30건

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX_REQUESTS;
}

// 오래된 항목 주기적 정리 (메모리 누수 방지)
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimit) {
    if (now > val.resetAt) rateLimit.delete(key);
  }
}, 60_000);

interface MedicalItem {
  name: string; // 의료기관명
  type: string; // 종별 (종합병원, 병원, 의원 등)
  address: string; // 주소
  tel: string; // 전화번호
}

// 8/30: data.go.kr가 AWS 대역을 400(code 10)으로 위장 차단 → 프록시 스위치(_datagokr.ts) 경유
const HIRA_PATH = "B551182/hospInfoServicev2/getHospBasisList";

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

const PAGE_SIZE = 30;

type HiraUnit = { sidoCd: string; sgguCd?: string };

/**
 * 시·도 목록을 시·군 코드로 이어 붙여야 할 때(전남 — 심평원 통합 코드에서 광주를 빼야 함)
 * 그 시·도에 속한 우리 시·군 코드.
 */
function provinceGuCodes(sidoCd: string): string[] {
  const province = PROVINCES.find((p) => p.hiraSidoCd === sidoCd);
  if (!province) return [];
  return SIGUNGUS.filter((sg) => sg.sidoId === province.id && sg.hiraSgguCd).flatMap(
    (sg) => GU_HIRA_CODES_MAP[sg.hiraSgguCd] ?? [sg.hiraSgguCd]
  );
}

async function fetchHiraBody(unit: HiraUnit, pageNo: number, numOfRows: number) {
  const params: Record<string, string> = {
    sidoCd: unit.sidoCd,
    pageNo: String(pageNo),
    numOfRows: String(numOfRows),
    _type: "json",
  };
  if (unit.sgguCd) params.sgguCd = unit.sgguCd;
  const req = buildDataGoKrRequest(HIRA_PATH, params);
  if (!req) throw new Error("API key not configured");
  const res = await fetch(req.url, {
    signal: AbortSignal.timeout(10_000),
    next: { revalidate: 86400 },
    headers: req.headers,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const body = json?.response?.body;
  const raw = body?.items?.item;
  return {
    totalCount: Number(body?.totalCount ?? 0),
    items: (Array.isArray(raw) ? raw : raw ? [raw] : []) as Record<string, string>[],
  };
}

/**
 * 조회 단위 여럿을 한 목록처럼 이어 붙여 page 번째 30건을 돌려준다.
 * 10/7: 광주(전남광주 통합 코드 아래 5구)·전남(통합 코드 − 광주)·구가 있는 시(수원 = 4구)는
 * 코드 하나로 조회하면 다른 지역이 섞이거나 한 구만 나왔다.
 */
async function listAcrossUnits(units: HiraUnit[], page: number) {
  if (units.length === 1) {
    const b = await fetchHiraBody(units[0], page, PAGE_SIZE);
    return { totalCount: b.totalCount, raw: b.items };
  }
  const counts = await Promise.all(units.map(async (u) => (await fetchHiraBody(u, 1, 1)).totalCount));
  const totalCount = counts.reduce((a, b) => a + b, 0);
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const raw: Record<string, string>[] = [];
  let offset = 0;
  for (let i = 0; i < units.length; i++) {
    const unitStart = offset;
    const unitEnd = offset + counts[i];
    offset = unitEnd;
    if (unitEnd <= start || unitStart >= end) continue;
    const from = Math.max(start, unitStart) - unitStart;
    const to = Math.min(end, unitEnd) - unitStart;
    const firstPage = Math.floor(from / PAGE_SIZE) + 1;
    const lastPage = Math.floor((to - 1) / PAGE_SIZE) + 1;
    const pages = await Promise.all(
      Array.from({ length: lastPage - firstPage + 1 }, (_, k) => fetchHiraBody(units[i], firstPage + k, PAGE_SIZE))
    );
    const base = (firstPage - 1) * PAGE_SIZE;
    raw.push(...pages.flatMap((p) => p.items).slice(from - base, to - base));
  }
  return { totalCount, raw };
}

/** 허용된 시도코드 (6자리 숫자) */
const VALID_SIDO_PATTERN = /^\d{6}$/;
const VALID_PAGE_PATTERN = /^\d{1,3}$/;

export async function GET(request: NextRequest) {
  // Rate Limit 체크
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const { searchParams } = request.nextUrl;
  const sidoCd = searchParams.get("sidoCd");
  const sgguCd = searchParams.get("sgguCd");
  const page = searchParams.get("page") || "1";

  if (!sidoCd || !VALID_SIDO_PATTERN.test(sidoCd)) {
    return NextResponse.json(
      { error: "sidoCd is required and must be a 6-digit code" },
      { status: 400 }
    );
  }

  if (sgguCd && !VALID_SIDO_PATTERN.test(sgguCd)) {
    return NextResponse.json(
      { error: "sgguCd must be a 6-digit code" },
      { status: 400 }
    );
  }

  if (!VALID_PAGE_PATTERN.test(page)) {
    return NextResponse.json(
      { error: "page must be a number" },
      { status: 400 }
    );
  }

  const isGu = searchParams.get("unit") === "gu";
  const units = hiraListUnits(sidoCd, sgguCd, {
    single: isGu,
    provinceGuCodes: sgguCd ? undefined : provinceGuCodes(sidoCd),
  });

  try {
    const pageNum = parseInt(page, 10);
    const { totalCount: baseTotal, raw: baseItems } = await listAcrossUnits(units, pageNum);
    // 시 아래 구: 시 단위 코드로 남은 기관 중 이 구에 놓인 것을 목록 끝에 (fetchGuMedicalFacilities 와 같은 판정)
    const province = PROVINCES.find((p) => p.hiraSidoCd === sidoCd);
    const gu = isGu && sgguCd && province ? GUS.find((g) => g.sidoId === province.id && g.hiraSgguCd === sgguCd) : undefined;
    let extra: HiraListItem[] = [];
    if (gu) {
      const residual = await fetchGuResidualItems(sidoCd, gu);
      if (!residual) throw new Error("residual list failed");
      extra = residual;
    }
    const start = (pageNum - 1) * PAGE_SIZE;
    const rawItems: Record<string, string>[] = [
      ...baseItems,
      ...(extra.slice(Math.max(0, start - baseTotal), Math.max(0, start + PAGE_SIZE - baseTotal)) as Record<string, string>[]),
    ];
    const totalCount = baseTotal + extra.length;

    const items: MedicalItem[] = rawItems
      .map((item) => ({
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
