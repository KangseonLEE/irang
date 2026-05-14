// Phase 1 baseline 측정 — 회장 7종 시나리오
import { searchAll } from "@/lib/data/search-index";

const queries = ["서생", "방울토마토", "맞춤 지역 찾기", "상주", "울산", "지역", "중앙동"];

for (const q of queries) {
  const results = searchAll(q);
  const byType: Record<string, number> = {};
  for (const r of results) {
    byType[r.type] = (byType[r.type] ?? 0) + 1;
  }
  console.log(`\n=== "${q}" → 총 ${results.length}건 ===`);
  for (const [t, c] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${t}: ${c}건`);
  }
  console.log("  [TOP 10]");
  for (const r of results.slice(0, 10)) {
    console.log(`    ${r.type}/${r.title} — ${(r.subtitle ?? "").slice(0, 50)}`);
  }
}
