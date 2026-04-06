/**
 * RDA API → DB 행 매핑 유틸리티
 * - src/lib/api/rda.ts의 유틸 함수를 Deno 호환으로 포팅
 */

import type {
  RdaPolicyItem,
  RdaEduItem,
  ProgramInsertRow,
  EducationInsertRow,
} from "./types.ts";

// ─── 지역명 매핑 ───

const AREA_NAME_MAP: Record<string, string> = {
  "서울": "서울특별시",
  "경기": "경기도",
  "강원": "강원도",
  "충북": "충청북도",
  "충남": "충청남도",
  "대전": "대전광역시",
  "전북": "전라북도",
  "전남": "전라남도",
  "광주": "광주광역시",
  "경북": "경상북도",
  "경남": "경상남도",
  "대구": "대구광역시",
  "부산": "부산광역시",
  "울산": "울산광역시",
  "인천": "인천광역시",
  "세종": "세종특별자치시",
  "제주": "제주특별자치도",
  "전국": "전국",
};

export function mapAreaName(area1Nm: string): string {
  if (area1Nm.includes("도") || area1Nm.includes("시") || area1Nm === "전국") {
    return area1Nm;
  }
  return AREA_NAME_MAP[area1Nm] ?? area1Nm;
}

// ─── HTML 태그 제거 ───

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── 상태 판별 ───

export function deriveStatus(
  applStDt: string,
  appEdDt: string
): "모집중" | "모집예정" | "마감" {
  const today = new Date().toISOString().slice(0, 10);
  if (today < applStDt) return "모집예정";
  if (today > appEdDt) return "마감";
  return "모집중";
}

// ─── RDA 지원사업 → DB 행 ───

export function mapPolicyToRow(item: RdaPolicyItem): ProgramInsertRow {
  const org = [item.chargeAgency, item.chargeDept]
    .filter(Boolean)
    .join(" ");

  return {
    slug: `rda-${item.seq}`,
    title: item.title,
    summary: stripHtml(item.contents).slice(0, 300),
    region: mapAreaName(item.area1Nm),
    organization: org || "공고문 참조",
    support_type: "보조금",
    support_amount: item.price || "상세 공고 참조",
    eligibility_age_min: 18,
    eligibility_age_max: 65,
    eligibility_detail: item.eduTarget || "공고문 참조",
    application_start: item.applStDt,
    application_end: item.appEdDt,
    status: deriveStatus(item.applStDt, item.appEdDt),
    related_crops: [],
    source_url: item.infoUrl || "",
    year: new Date().getFullYear(),
    is_verified: true,
  };
}

// ─── RDA 교육 → DB 행 ───

export function mapEduToRow(item: RdaEduItem): EducationInsertRow {
  const org = [item.chargeAgency, item.chargeDept]
    .filter(Boolean)
    .join(" ");

  const schedule =
    item.eduStDt && item.eduEdDt
      ? `${item.eduStDt} ~ ${item.eduEdDt}`
      : "일정 미정";

  return {
    slug: `rda-edu-${item.seq}`,
    title: item.title,
    region: mapAreaName(item.area1Nm),
    organization: org || "공고문 참조",
    type: "오프라인",
    duration: item.eduTime || "상세 공고 참조",
    schedule,
    target: item.eduTarget || "공고문 참조",
    cost: "상세 공고 참조",
    description: stripHtml(item.contents).slice(0, 300),
    capacity: item.eduCnt ? parseInt(item.eduCnt, 10) || null : null,
    application_start: item.applStDt,
    application_end: item.appEdDt,
    status: deriveStatus(item.applStDt, item.appEdDt),
    level: "초급",
    url: item.infoUrl || "",
    is_verified: true,
  };
}
