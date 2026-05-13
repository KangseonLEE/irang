/**
 * Phase 6 A안 D5 — 페르소나별 top1/top3 baseline 산출 스크립트.
 *
 * 회귀 테스트 assertion 값을 만들기 위한 1회성 산출용.
 * data drift 시 이 값이 흔들리면 회귀 fail → 의도된 변경인지 검토.
 *
 * 실행: npx tsx scripts/_diag/persona-baseline.ts
 */

import { CROPS } from "../../src/lib/data/crops";
import { PROGRAMS } from "../../src/lib/data/programs";
import { PERSONAS } from "../../src/lib/data/personas";
import {
  rankCropsForPersona,
  rankProgramsForPersona,
} from "../../src/lib/data/persona-fit";

console.log("=== Persona Top Rankings (baseline) ===\n");

for (const p of PERSONAS) {
  const crops = rankCropsForPersona(CROPS, p.id);
  const programs = rankProgramsForPersona(PROGRAMS, p.id);

  console.log(`--- ${p.id} (${p.label}) ---`);
  console.log("Top 5 Crops:");
  crops.slice(0, 5).forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.crop.id} (${r.crop.name}) score=${r.score}`);
  });
  console.log("Top 5 Programs:");
  programs.slice(0, 5).forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.program.id} (${r.program.title}) score=${r.score}`);
  });
  console.log("");
}

console.log(`Total CROPS: ${CROPS.length}`);
console.log(`Total PROGRAMS: ${PROGRAMS.length}`);
