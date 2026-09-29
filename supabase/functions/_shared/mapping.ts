/**
 * RDA API → DB 행 매핑 유틸리티
 * - src/lib/api/rda.ts의 유틸 함수를 Deno 호환으로 포팅
 *
 * 지역명 정규화는 `./region.ts`(src/lib/region-normalize.ts 미러)가 담당한다.
 * 2026-09-29 이전에는 이 파일이 "도/시가 들어 있으면 그대로 통과"시켜
 * "경기 양평"·"강원특별자치도" 같은 값이 SSOT 밖으로 새어 나갔다.
 */

import type {
  RdaPolicyItem,
  RdaEduItem,
  ProgramInsertRow,
  EducationInsertRow,
} from "./types.ts";
import { normalizeRegion } from "./region.ts";

export { mapAreaName, normalizeRegion, regionLabel, isSsotRegion } from "./region.ts";

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
    region: normalizeRegion(item.area1Nm).region,
    sigungu: normalizeRegion(`${item.area1Nm ?? ""} ${item.area2Nm ?? ""}`).sigungu,
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
    region: normalizeRegion(item.area1Nm).region,
    sigungu: normalizeRegion(`${item.area1Nm ?? ""} ${item.area2Nm ?? ""}`).sigungu,
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
