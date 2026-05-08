#!/usr/bin/env tsx
/**
 * 페르소나 추천 매핑 spot check.
 * 각 페르소나별 상위 작물·사업 5개를 출력하여 산식 합리성 검증.
 *
 * 사용: pnpm tsx scripts/check-persona-fit.ts
 *      또는 npx tsx scripts/check-persona-fit.ts
 */

import { CROPS } from "../src/lib/data/crops";
import { PROGRAMS } from "../src/lib/data/programs";
import { PERSONAS } from "../src/lib/data/personas";
import {
  rankCropsForPersona,
  rankProgramsForPersona,
} from "../src/lib/data/persona-fit";

const N = 8;

console.log("\n=== 페르소나별 추천 작물 TOP", N, "===\n");

for (const persona of PERSONAS) {
  console.log(`\n[${persona.label}] (${persona.id})`);
  console.log(`  ${persona.audience} — ${persona.desc}`);
  const ranked = rankCropsForPersona(CROPS, persona.id).slice(0, N);
  ranked.forEach(({ crop, score }, i) => {
    console.log(
      `  ${i + 1}. ${score} | ${crop.emoji} ${crop.name} (${crop.category}/${crop.difficulty})`,
    );
  });
}

console.log("\n=== 페르소나별 추천 지원사업 TOP", N, "===\n");

for (const persona of PERSONAS) {
  console.log(`\n[${persona.label}] (${persona.id})`);
  const ranked = rankProgramsForPersona(PROGRAMS, persona.id).slice(0, N);
  ranked.forEach(({ program, score }, i) => {
    const ageRange =
      program.eligibilityAgeMax > 0
        ? `${program.eligibilityAgeMin}~${program.eligibilityAgeMax}`
        : `${program.eligibilityAgeMin}+`;
    console.log(
      `  ${i + 1}. ${score} | [${program.id}] ${program.title} (${program.supportType}, ${ageRange}세)`,
    );
  });
}

console.log("\n=== 산식 검증 끝 ===\n");
