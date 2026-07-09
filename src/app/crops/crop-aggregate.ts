/**
 * 작물 목록(table) 행 + 대시보드 차트 집계 — 서버 전용 헬퍼.
 * "use client" 없음. Server Component(page.tsx)에서 호출해 직렬화 값만 props 전달.
 */
import { CROPS, CROP_DETAILS, type CropInfo } from "@/lib/data/crops";
import { PROVINCES } from "@/lib/data/regions";
import { parseIncome10a } from "@/lib/format";
import type { CropRow } from "./crop-list";
import type { CropFact, CropIncomeFact } from "./crop-dashboard";

export { parseIncome10a };

/** 행정구역 정식명 → 짧은 표기(전남·충남 등) 매핑. PROVINCES SSOT 기준. */
const PROVINCE_SHORT = new Map(PROVINCES.map((p) => [p.name, p.shortName]));

function toShort(name: string): string {
  return PROVINCE_SHORT.get(name) ?? name;
}

const MONTH_RE = /(\d{1,2})\s*월/g;

/**
 * growingSeason 문자열에서 재배 월(1~12) 집합을 안전하게 파싱.
 * - "4월~10월" → 4,5,...,10
 * - "9월~6월"(연 넘김) → 9,10,11,12,1,2,...,6
 * - "3~5월·9~11월 (시설: 연중)" → 3,4,5,9,10,11 (괄호·연중 무시)
 * - "연중 (...)" → 1~12
 * - 파싱 불가 → 빈 배열 (호출부에서 제외)
 */
export function parseGrowingMonths(season: string): number[] {
  if (!season) return [];

  // 괄호 안 보조 설명(시설: 연중 등)은 제거 — 핵심 노지 시기만 집계
  const main = season.replace(/\([^)]*\)/g, "").trim();

  // "연중"이 핵심 시기로 명시되면 전월
  if (/연중/.test(main)) {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  }

  const result = new Set<number>();

  // "·" 또는 "," 로 구분된 각 구간을 개별 파싱
  const segments = main.split(/[·,]/);
  for (const seg of segments) {
    // 월 표기가 없는 구간은 시기 정보가 아님 (예: 품종명) → 건너뜀
    if (!/월/.test(seg)) continue;

    const hasRange = /~|∼|〜|-/.test(seg);

    // 범위 구간("3~5월")은 첫 숫자에 월이 안 붙는 경우가 있어 모든 숫자 run을 수집.
    // 단일 구간("9월")은 월 직전 숫자만 수집 (오인식 방지).
    const nums: number[] = [];
    if (hasRange) {
      const matches = seg.match(/\d{1,2}/g) ?? [];
      for (const raw of matches) {
        const n = Number(raw);
        if (n >= 1 && n <= 12) nums.push(n);
      }
    } else {
      let m: RegExpExecArray | null;
      MONTH_RE.lastIndex = 0;
      while ((m = MONTH_RE.exec(seg)) !== null) {
        const n = Number(m[1]);
        if (n >= 1 && n <= 12) nums.push(n);
      }
    }
    if (nums.length === 0) continue;

    if (nums.length === 1) {
      result.add(nums[0]);
      continue;
    }

    // 범위 표기(~)가 있으면 start~end 채움. "이듬해" 등 연 넘김 자동 처리.
    if (hasRange) {
      const start = nums[0];
      const end = nums[nums.length - 1];
      if (start <= end) {
        for (let i = start; i <= end; i++) result.add(i);
      } else {
        // 연 넘김: start→12, 1→end
        for (let i = start; i <= 12; i++) result.add(i);
        for (let i = 1; i <= end; i++) result.add(i);
      }
    } else {
      nums.forEach((n) => result.add(n));
    }
  }

  return Array.from(result).sort((a, b) => a - b);
}

const detailById = new Map(CROP_DETAILS.map((d) => [d.id, d]));

/** 목록(table) 뷰 행 — CROPS + CROP_DETAILS 조인 */
export function buildCropRows(crops: CropInfo[]): CropRow[] {
  return crops.map((crop) => {
    const detail = detailById.get(crop.id);
    return {
      id: crop.id,
      name: crop.name,
      emoji: crop.emoji,
      category: crop.category,
      difficulty: crop.difficulty,
      growingSeason: crop.growingSeason,
      laborIntensity: detail?.income.laborIntensity ?? null,
      income10a: detail ? parseIncome10a(detail.income.revenueRange) : null,
      majorRegions:
        detail && detail.majorRegions.length > 0
          ? detail.majorRegions.slice(0, 3).map(toShort).join(", ")
          : "",
    };
  });
}

/** 대시보드 차트 집계용 facts — 전체 CROPS 기준 (필터 무관, 전체 통계) */
export function buildCropFacts(): {
  facts: CropFact[];
  totalProvinceCount: number;
} {
  const provinceSet = new Set<string>();
  const facts: CropFact[] = CROPS.map((crop) => {
    const detail = detailById.get(crop.id);
    const provinces = detail
      ? Array.from(new Set(detail.majorRegions.map(toShort)))
      : [];
    provinces.forEach((p) => provinceSet.add(p));
    return {
      id: crop.id,
      name: crop.name,
      emoji: crop.emoji,
      category: crop.category,
      difficulty: crop.difficulty,
      laborIntensity: detail?.income.laborIntensity ?? null,
      provinces,
      months: parseGrowingMonths(crop.growingSeason),
    };
  });
  return { facts, totalProvinceCount: provinceSet.size };
}

/**
 * 10a당 연소득 비교 차트용 facts.
 * - revenueRange 선두 패턴이 파싱되는 작물만 포함 (10a·1ha 기준)
 * - 임산물 등 기준이 다른 작물은 제외하고 id/name을 별도 반환 (각주용)
 * - 모든 수치는 동적 파싱 — 하드코딩 없음
 */
export function buildIncomeFacts(): {
  incomeFacts: CropIncomeFact[];
  excludedNames: string[];
} {
  const incomeFacts: CropIncomeFact[] = [];
  const excludedNames: string[] = [];
  for (const crop of CROPS) {
    const detail = detailById.get(crop.id);
    const income10a = detail
      ? parseIncome10a(detail.income.revenueRange)
      : null;
    if (income10a === null) {
      excludedNames.push(crop.name);
      continue;
    }
    incomeFacts.push({
      id: crop.id,
      name: crop.name,
      emoji: crop.emoji,
      category: crop.category,
      difficulty: crop.difficulty,
      income10a,
    });
  }
  return { incomeFacts, excludedNames };
}
