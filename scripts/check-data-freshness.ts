#!/usr/bin/env npx tsx
/* ==========================================================================
   데이터 신선도 점검 스크립트
   - 지원사업 / 교육 / 체험행사 데이터의 만료 현황 파악
   - 7일 이내 만료 예정 항목 조기 경고
   - 상시모집(ALWAYS_OPEN) 프로그램 감지

   사용법:
     npx tsx scripts/check-data-freshness.ts
   ========================================================================== */

import { PROGRAMS } from "../src/lib/data/programs";
import { EDUCATION_COURSES } from "../src/lib/data/education";
import { EVENTS } from "../src/lib/data/events";
import {
  deriveStatus,
  deriveEventStatus,
  daysUntilDeadline,
  ALWAYS_OPEN,
} from "../src/lib/program-status";

/* ── 상수 ── */
const TODAY = new Date().toISOString().slice(0, 10);

/* ── 등급 판정 ── */
function grade(activeRatio: number): string {
  if (activeRatio >= 0.5) return "A";
  if (activeRatio >= 0.35) return "B";
  if (activeRatio >= 0.2) return "C";
  if (activeRatio >= 0.1) return "D";
  return "F";
}

/* ── 분석 결과 타입 ── */
interface ExpiringSoon {
  id: string;
  title: string;
  endDate: string;
}

interface CategoryResult {
  label: string;
  emoji: string;
  total: number;
  active: number;
  alwaysOpen: number;
  expiringSoon: ExpiringSoon[];
  expired: number;
}

/* ── 지원사업 분석 ── */
function analyzePrograms(): CategoryResult {
  const expiringSoon: ExpiringSoon[] = [];
  let active = 0;
  let expired = 0;
  let alwaysOpen = 0;

  for (const p of PROGRAMS) {
    const status = deriveStatus(p.applicationStart, p.applicationEnd);
    const isAlways = p.applicationEnd === ALWAYS_OPEN;

    if (isAlways) {
      alwaysOpen++;
      active++;
    } else if (status === "마감") {
      expired++;
    } else {
      active++;
      const daysLeft = daysUntilDeadline(p.applicationEnd);
      if (daysLeft >= 0 && daysLeft <= 7) {
        expiringSoon.push({
          id: p.id,
          title: p.title.length > 30 ? p.title.slice(0, 30) + "..." : p.title,
          endDate: p.applicationEnd,
        });
      }
    }
  }

  return {
    label: "지원사업",
    emoji: "\uD83D\uDCCB",
    total: PROGRAMS.length,
    active,
    alwaysOpen,
    expiringSoon,
    expired,
  };
}

/* ── 교육 분석 ── */
function analyzeEducation(): CategoryResult {
  const expiringSoon: ExpiringSoon[] = [];
  let active = 0;
  let expired = 0;

  for (const e of EDUCATION_COURSES) {
    const status = deriveStatus(e.applicationStart, e.applicationEnd);

    if (status === "마감") {
      expired++;
    } else {
      active++;
      const daysLeft = daysUntilDeadline(e.applicationEnd);
      if (daysLeft >= 0 && daysLeft <= 7) {
        expiringSoon.push({
          id: e.id,
          title: e.title.length > 30 ? e.title.slice(0, 30) + "..." : e.title,
          endDate: e.applicationEnd ?? "",
        });
      }
    }
  }

  return {
    label: "교육",
    emoji: "\uD83D\uDCDA",
    total: EDUCATION_COURSES.length,
    active,
    alwaysOpen: 0,
    expiringSoon,
    expired,
  };
}

/* ── 체험행사 분석 ── */
function analyzeEvents(): CategoryResult {
  const expiringSoon: ExpiringSoon[] = [];
  let active = 0;
  let expired = 0;

  for (const ev of EVENTS) {
    const status = deriveEventStatus(
      ev.applicationStart,
      ev.applicationEnd,
      ev.dateEnd,
    );

    const endDate = ev.applicationEnd ?? ev.dateEnd ?? null;

    if (status === "마감") {
      expired++;
    } else {
      active++;
      if (endDate) {
        const daysLeft = daysUntilDeadline(endDate);
        if (daysLeft >= 0 && daysLeft <= 7) {
          expiringSoon.push({
            id: ev.id,
            title: ev.title.length > 30 ? ev.title.slice(0, 30) + "..." : ev.title,
            endDate,
          });
        }
      }
    }
  }

  return {
    label: "체험·행사",
    emoji: "\uD83C\uDFAA",
    total: EVENTS.length,
    active,
    alwaysOpen: 0,
    expiringSoon,
    expired,
  };
}

/* ── 출력 ── */
function printCategory(r: CategoryResult): void {
  const ratio = r.total > 0 ? r.active / r.total : 0;
  const pct = Math.round(ratio * 100);
  const g = grade(ratio);

  console.log(`\n${r.emoji} ${r.label} (${r.total}건)`);
  console.log(
    `  \u2705 활성: ${r.active}건 | \u23F0 7일내 만료: ${r.expiringSoon.length}건 | \u274C 만료: ${r.expired}건`,
  );

  if (r.alwaysOpen > 0) {
    console.log(`  \u267E\uFE0F  상시모집: ${r.alwaysOpen}건`);
  }

  if (r.expiringSoon.length > 0) {
    for (const item of r.expiringSoon) {
      console.log(`     - [${item.id}] ${item.title} (${item.endDate})`);
    }
  }

  console.log(`  등급: ${g} (활성 비율 ${pct}%)`);
}

function main(): void {
  const results = [analyzePrograms(), analyzeEducation(), analyzeEvents()];

  console.log(`\n\uD83D\uDCCA 데이터 신선도 점검 (${TODAY})`);
  console.log("\u2501".repeat(35));

  for (const r of results) {
    printCategory(r);
  }

  // 7일 내 만료 예정 통합
  const allExpiring = results.flatMap((r) => r.expiringSoon);
  if (allExpiring.length > 0) {
    console.log("\n" + "\u2501".repeat(35));
    console.log("\u23F0 7일 내 만료 예정:");
    for (const item of allExpiring) {
      console.log(`  - [${item.id}] ${item.title} (${item.endDate})`);
    }
  }

  // 전체 등급
  const totalActive = results.reduce((s, r) => s + r.active, 0);
  const totalItems = results.reduce((s, r) => s + r.total, 0);
  const overallRatio = totalItems > 0 ? totalActive / totalItems : 0;
  const overallGrade = grade(overallRatio);
  const overallPct = Math.round(overallRatio * 100);

  console.log("\n" + "\u2501".repeat(35));
  console.log(
    `\uD83C\uDFC6 전체 등급: ${overallGrade} (${totalActive}/${totalItems}, 활성 ${overallPct}%)`,
  );
  console.log();
}

main();
