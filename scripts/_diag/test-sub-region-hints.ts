/**
 * 검증 스크립트 — 18개 읍·면·동 쿼리에 대한 매칭 결과 확인.
 *
 * 실행: npx tsx scripts/_diag/test-sub-region-hints.ts
 * 용도: generate-sub-regions.ts 갱신 후 회귀 확인 + 신규 항목 매칭 검증.
 */
import { searchAll } from "../../src/lib/data/search-index";

const queries = [
  // 회장 시드 6종 회귀
  "서생", "서생면", "우도", "우도면", "백수", "백수읍",
  "청산도", "청산면", "보길도", "보길면", "화북", "화북동",
  // 동음이의어 검증
  "중앙동", "중앙",
  // 인지도 높은 면 샘플
  "안흥", "흑산도", "한경",
  // 없는 쿼리
  "이상한곳",
];

let pass = 0;
let fail = 0;
for (const q of queries) {
  const results = searchAll(q);
  const hints = results.filter((r) => r.badge === "안내");
  if (hints.length === 0) {
    console.log(`${q}: ❌ 매칭 없음`);
    if (q !== "이상한곳") fail++;
    else pass++;
    continue;
  }
  console.log(`${q}: ✅ ${hints.length}건`);
  for (const h of hints.slice(0, 3)) {
    console.log(`   - ${h.title} → ${h.href}`);
  }
  pass++;
}
console.log(`\n결과: ${pass}/${queries.length} 통과 (실패 ${fail}건)`);
